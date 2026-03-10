import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

type Role = 'SUPER_ADMIN' | 'ADMIN_TENANT' | 'SUPERVISOR' | 'CASHIER' | 'KITCHEN';
type RouteExpectation = 'allow' | 'deny' | 'shift_redirect';
type AuthSession = {
  token: string;
  user: any;
  tenantId: string | null;
  storeId: string | null;
  headers: Record<string, string>;
};

const ROLE_PASSWORD = process.env.PLAYWRIGHT_ROLE_PASSWORD || 'Password123!';
const API_BASE_URL = process.env.PLAYWRIGHT_API_BASE_URL || 'http://127.0.0.1:3000/api';
const APP_BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';

const ROLE_EMAILS: Record<Role, string> = {
  SUPER_ADMIN: process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL || 'superadmin.audit@example.com',
  ADMIN_TENANT: process.env.PLAYWRIGHT_ADMIN_TENANT_EMAIL || 'admin.audit@example.com',
  SUPERVISOR: process.env.PLAYWRIGHT_SUPERVISOR_EMAIL || 'supervisor.audit@example.com',
  CASHIER: process.env.PLAYWRIGHT_CASHIER_EMAIL || 'cashier.audit@example.com',
  KITCHEN: process.env.PLAYWRIGHT_KITCHEN_EMAIL || 'kitchen.audit@example.com',
};

const SINGLE_PAYLOAD_KEYS = new Set(['data', 'success', 'message', 'code', 'status']);
const LOGIN_MAX_ATTEMPTS = 6;

const CRITICAL_ROUTES = [
  '/app/orders',
  '/app/products',
  '/app/customers',
  '/pos',
  '/open-shift',
  '/kitchen',
  '/app/settings/store',
  '/app/superadmin/backups',
] as const;

const ROUTE_POLICY: Record<Role, Record<(typeof CRITICAL_ROUTES)[number], RouteExpectation>> = {
  SUPER_ADMIN: {
    '/app/orders': 'allow',
    '/app/products': 'allow',
    '/app/customers': 'allow',
    '/pos': 'deny',
    '/open-shift': 'deny',
    '/kitchen': 'allow',
    '/app/settings/store': 'deny',
    '/app/superadmin/backups': 'allow',
  },
  ADMIN_TENANT: {
    '/app/orders': 'allow',
    '/app/products': 'allow',
    '/app/customers': 'allow',
    '/pos': 'allow',
    '/open-shift': 'deny',
    '/kitchen': 'deny',
    '/app/settings/store': 'allow',
    '/app/superadmin/backups': 'deny',
  },
  SUPERVISOR: {
    '/app/orders': 'allow',
    '/app/products': 'allow',
    '/app/customers': 'allow',
    '/pos': 'allow',
    '/open-shift': 'allow',
    '/kitchen': 'allow',
    '/app/settings/store': 'deny',
    '/app/superadmin/backups': 'deny',
  },
  CASHIER: {
    '/app/orders': 'shift_redirect',
    '/app/products': 'shift_redirect',
    '/app/customers': 'shift_redirect',
    '/pos': 'shift_redirect',
    '/open-shift': 'allow',
    '/kitchen': 'shift_redirect',
    '/app/settings/store': 'shift_redirect',
    '/app/superadmin/backups': 'shift_redirect',
  },
  KITCHEN: {
    '/app/orders': 'allow',
    '/app/products': 'deny',
    '/app/customers': 'deny',
    '/pos': 'deny',
    '/open-shift': 'deny',
    '/kitchen': 'allow',
    '/app/settings/store': 'deny',
    '/app/superadmin/backups': 'deny',
  },
};

function shouldUnwrapPayload(current: Record<string, unknown>): boolean {
  if (!('data' in current)) {
    return false;
  }

  if ('success' in current) {
    return true;
  }

  const keys = Object.keys(current);
  return keys.length > 0 && keys.every((key) => SINGLE_PAYLOAD_KEYS.has(key));
}

function unwrapApiPayload<T>(input: unknown): T | null {
  let current = input;
  const visited = new Set<unknown>();

  while (
    current &&
    typeof current === 'object' &&
    !Array.isArray(current) &&
    !visited.has(current)
  ) {
    visited.add(current);
    if (!shouldUnwrapPayload(current as Record<string, unknown>)) {
      break;
    }
    current = (current as { data?: unknown }).data ?? null;
  }

  return (current ?? null) as T | null;
}

function extractStoreId(user: any): string | null {
  const permissions =
    user?.permissions && typeof user.permissions === 'object' ? user.permissions : {};
  const assignedStoreId =
    typeof permissions.assignedStoreId === 'string' && permissions.assignedStoreId.trim().length > 0
      ? permissions.assignedStoreId
      : null;
  if (assignedStoreId) {
    return assignedStoreId;
  }
  if (Array.isArray(permissions.allowedStoreIds)) {
    const first = permissions.allowedStoreIds.find(
      (value: unknown) => typeof value === 'string' && value.trim().length > 0,
    );
    return (first as string | undefined) || null;
  }
  return null;
}

async function loginForApi(request: APIRequestContext, role: Role): Promise<AuthSession> {
  const payload = await loginPayloadWithRetry(request, role);
  const data = payload?.data || payload;
  const token = data?.token;
  const user = data?.user;
  expect(token, `Token missing for role ${role}`).toBeTruthy();
  expect(user?.role, `Unexpected role for ${role}`).toBe(role);

  const tenantId =
    typeof user?.tenantId === 'string' && user.tenantId.trim().length > 0 ? user.tenantId : null;
  const storeId = extractStoreId(user);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (tenantId) {
    headers['X-Tenant-Id'] = tenantId;
  }

  return {
    token,
    user,
    tenantId,
    storeId,
    headers,
  };
}

async function loginPayloadWithRetry(
  request: APIRequestContext,
  role: Role,
): Promise<Record<string, any>> {
  let lastStatus = 0;
  let lastBody: unknown = null;

  for (let attempt = 1; attempt <= LOGIN_MAX_ATTEMPTS; attempt += 1) {
    const response = await request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        email: ROLE_EMAILS[role],
        password: ROLE_PASSWORD,
      },
    });
    lastStatus = response.status();
    const body = await response.json().catch(() => null);
    lastBody = body;

    if (response.ok()) {
      return (body || {}) as Record<string, any>;
    }

    // Backoff on login throttling to keep remote smoke deterministic.
    if (lastStatus === 429 && attempt < LOGIN_MAX_ATTEMPTS) {
      const backoffMs = 1500 * attempt;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      continue;
    }

    break;
  }

  throw new Error(
    `Login failed for role ${role}. status=${lastStatus} body=${JSON.stringify(lastBody).slice(0, 500)}`,
  );
}

async function getCurrentStoreShift(request: APIRequestContext, session: AuthSession) {
  if (!session.storeId) return null;
  const response = await request.get(
    `${API_BASE_URL}/store-shift/current?outletId=${encodeURIComponent(session.storeId)}`,
    {
      headers: session.headers,
    },
  );
  expect(response.status(), 'Store shift current endpoint must not fail with 5xx').toBeLessThan(500);
  const payload = await response.json().catch(() => null);
  return unwrapApiPayload<any>(payload);
}

async function openStoreShiftIfNeeded(
  request: APIRequestContext,
  session: AuthSession,
): Promise<{ shift: any; openedByTest: boolean }> {
  const currentShift = await getCurrentStoreShift(request, session);
  if (currentShift?.id) {
    return { shift: currentShift, openedByTest: false };
  }

  expect(session.storeId, 'CASHIER test account must have assigned store').toBeTruthy();
  const openResponse = await request.post(`${API_BASE_URL}/store-shift/open`, {
    headers: session.headers,
    data: {
      outletId: session.storeId,
      shiftType: 'audit',
      modalAwal: 100000,
      catatan: 'Playwright audit open store shift',
    },
  });
  expect(openResponse.ok(), 'Failed to open store shift for cashier regression test').toBeTruthy();
  const payload = await openResponse.json().catch(() => null);
  const shift = unwrapApiPayload<any>(payload);
  expect(shift?.id, 'Opened store shift must return id').toBeTruthy();
  return { shift, openedByTest: true };
}

async function getCurrentCashShift(request: APIRequestContext, session: AuthSession) {
  const response = await request.get(`${API_BASE_URL}/cash-shift/current`, {
    headers: session.headers,
  });
  expect(response.status(), 'Cash shift current endpoint must not fail with 5xx').toBeLessThan(500);
  const payload = await response.json().catch(() => null);
  return unwrapApiPayload<any>(payload);
}

async function fetchAvailableProducts(request: APIRequestContext, session: AuthSession) {
  const query = new URLSearchParams();
  if (session.storeId) query.set('outletId', session.storeId);
  if (session.tenantId) query.set('tenantId', session.tenantId);

  const response = await request.get(`${API_BASE_URL}/products?${query.toString()}`, {
    headers: session.headers,
  });
  expect(response.status(), 'Products API must not fail for cashier receipt regression').toBeLessThan(500);
  const payload = await response.json().catch(() => null);
  const items = unwrapApiPayload<any>(payload);
  const collection = Array.isArray(items)
    ? items
    : Array.isArray(items?.data)
      ? items.data
      : [];

  return collection.filter(
    (item: any) =>
      item &&
      typeof item.name === 'string' &&
      item.name.trim().length > 0 &&
      Number(item.stock || 0) > 0,
  );
}

async function openCashShiftIfNeeded(
  request: APIRequestContext,
  session: AuthSession,
): Promise<{ shift: any; openedByTest: boolean }> {
  const currentShift = await getCurrentCashShift(request, session);
  if (currentShift?.id) {
    return { shift: currentShift, openedByTest: false };
  }

  const openResponse = await request.post(`${API_BASE_URL}/cash-shift/open`, {
    headers: session.headers,
    data: {
      modalAwal: 150000,
      catatan: 'Playwright audit open cash shift',
    },
  });
  expect(openResponse.ok(), 'Failed to open cash shift for cashier regression test').toBeTruthy();
  const payload = await openResponse.json().catch(() => null);
  const shift = unwrapApiPayload<any>(payload);
  expect(shift?.id, 'Opened cash shift must return id').toBeTruthy();
  return { shift, openedByTest: true };
}

async function closeCashShiftIfOpen(request: APIRequestContext, session: AuthSession) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const currentShift = await getCurrentCashShift(request, session);
    if (!currentShift?.id) return;

    const modalAwal = Number(currentShift.modalAwal || 0);
    const totalPenjualan = Number(currentShift.totalPenjualan || currentShift.totalSales || 0);
    const uangFisikTutup = modalAwal + totalPenjualan;
    const closeResponse = await request.post(`${API_BASE_URL}/cash-shift/close`, {
      headers: session.headers,
      data: {
        uangFisikTutup,
        catatan: 'Playwright cleanup close cash shift',
      },
    });
    expect(closeResponse.ok(), 'Cash shift cleanup close failed').toBeTruthy();
  }

  throw new Error('Cash shift cleanup exceeded retry budget');
}

async function closeStoreShiftById(request: APIRequestContext, session: AuthSession, shiftId: string) {
  if (!session.storeId) return;
  const closeResponse = await request.post(`${API_BASE_URL}/store-shift/close`, {
    headers: session.headers,
    data: {
      shiftId,
      outletId: session.storeId,
    },
  });
  expect(closeResponse.ok(), 'Store shift cleanup close failed').toBeTruthy();
}

async function loginAsRole(page: Page, request: APIRequestContext, role: Role) {
  const payload = await loginPayloadWithRetry(request, role);
  expect(payload, `Login response is not JSON for role ${role}`).toBeTruthy();
  const data = payload?.data || payload;
  const token = data?.token;
  const user = data?.user;

  expect(token, `Token missing for role ${role}`).toBeTruthy();
  expect(user?.role, `Unexpected role for ${role}`).toBe(role);

  const permissions = (user?.permissions || {}) as {
    assignedStoreId?: string;
    allowedStoreIds?: string[];
  };
  const selectedStoreId =
    permissions.assignedStoreId ||
    (Array.isArray(permissions.allowedStoreIds) ? permissions.allowedStoreIds[0] : undefined) ||
    null;

  await page.addInitScript(
    ({ injectedToken, injectedUser, injectedTenantId, injectedStoreId }) => {
      localStorage.setItem('token', injectedToken);
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('user', JSON.stringify(injectedUser));
      if (injectedTenantId) localStorage.setItem('selectedTenantId', injectedTenantId);
      if (injectedStoreId) localStorage.setItem('selectedStoreId', injectedStoreId);
    },
    {
      injectedToken: token,
      injectedUser: user,
      injectedTenantId: user?.tenantId || null,
      injectedStoreId: selectedStoreId,
    },
  );

  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
}

async function assertRouteExpectation(
  page: Page,
  role: Role,
  route: (typeof CRITICAL_ROUTES)[number],
  expectation: RouteExpectation,
) {
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response?.status() || 200).toBeLessThan(500);

  if (expectation === 'allow') {
    await page.waitForFunction(
      (expectedRoute) => window.location.pathname.includes(expectedRoute),
      route,
      { timeout: 8000 },
    );
    const currentUrl = page.url();
    expect(currentUrl, `${role} should access ${route}`).toContain(route);
    expect(currentUrl).not.toContain('/login');
    expect(currentUrl).not.toContain('/unauthorized');
    return;
  }

  if (expectation === 'shift_redirect') {
    await page.waitForFunction(() => window.location.pathname.includes('/open-shift'), undefined, {
      timeout: 8000,
    });
    const currentUrl = page.url();
    expect(
      currentUrl,
      `${role} should be redirected to /open-shift when shift guard is active for ${route}`,
    ).toContain('/open-shift');
    return;
  }

  await page.waitForFunction(
    (forbiddenRoute) => !window.location.pathname.includes(forbiddenRoute),
    route,
    { timeout: 8000 },
  );
  const currentUrl = page.url();
  expect(currentUrl, `${role} should not stay on forbidden route ${route}`).not.toContain(route);
  expect(currentUrl).not.toContain('/login');
}

async function assertForbiddenActionVisibility(page: Page, role: Role) {
  if (role === 'SUPERVISOR') {
    await page.goto('/app/users', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(900);
    await expect(page.getByRole('button', { name: /Tambah User|Add User/i })).toHaveCount(0);

    await page.goto('/app/stores', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(900);
    await expect(page.getByRole('button', { name: /Tambah Toko|Tambah Toko Pertama/i })).toHaveCount(0);
  }

  if (role === 'KITCHEN') {
    await page.goto('/app/orders', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await expect(page.getByRole('button', { name: /Clear Cancelled/i })).toHaveCount(0);
    await expect(page.locator('button[title=\"Delete\"]')).toHaveCount(0);
  }
}


test('public shell serves required manifest and icon assets', async ({ request }) => {
  const assetPaths = [
    '/',
    '/favicon.svg',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/apple-touch-icon.png',
    '/site.webmanifest',
  ];

  for (const assetPath of assetPaths) {
    const response = await request.get(`${APP_BASE_URL}${assetPath}`);
    expect(response.status(), `Static asset must resolve: ${assetPath}`).toBeLessThan(400);
  }
});
for (const role of Object.keys(ROLE_EMAILS) as Role[]) {
  test(`critical route policy and forbidden UI action for ${role}`, async ({ page, request }) => {
    const runtimeErrors: string[] = [];
    const failed5xxRequests: string[] = [];

    page.on('pageerror', (err) => {
      const stackHead = (err.stack || '').split('\n').slice(0, 12).join(' | ');
      runtimeErrors.push(
        `[${page.url()}] ${err.message}${stackHead ? ` | ${stackHead}` : ''}`,
      );
    });
    page.on('response', (res) => {
      if (res.status() >= 500 && !res.url().includes('/sockjs-node')) {
        failed5xxRequests.push(`${res.status()} ${res.url()}`);
      }
    });

    if (role === 'CASHIER') {
      const cashierSession = await loginForApi(request, role);
      await closeCashShiftIfOpen(request, cashierSession);
    }

    await loginAsRole(page, request, role);

    for (const route of CRITICAL_ROUTES) {
      await test.step(`${role} -> ${route}`, async () => {
        await assertRouteExpectation(page, role, route, ROUTE_POLICY[role][route]);
      });
    }

    await test.step(`${role} forbidden action UI`, async () => {
      await assertForbiddenActionVisibility(page, role);
    });

    expect(runtimeErrors, `Runtime JS errors for ${role}: ${runtimeErrors.join('\n')}`).toEqual([]);
    expect(failed5xxRequests, `HTTP 5xx for ${role}: ${failed5xxRequests.join('\n')}`).toEqual([]);
  });
}

test('cashier shift page shows close state after shift is opened (no false open form)', async ({
  page,
  request,
}) => {
  const runtimeErrors: string[] = [];
  const failed5xxRequests: string[] = [];

  page.on('pageerror', (err) => {
    runtimeErrors.push(`[${page.url()}] ${err.message}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 500 && !res.url().includes('/sockjs-node')) {
      failed5xxRequests.push(`${res.status()} ${res.url()}`);
    }
  });

  const session = await loginForApi(request, 'CASHIER');
  let openedStoreShiftId: string | null = null;

  try {
    const storeShift = await openStoreShiftIfNeeded(request, session);
    if (storeShift.openedByTest) {
      openedStoreShiftId = storeShift.shift?.id || null;
    }

    await openCashShiftIfNeeded(request, session);

    await loginAsRole(page, request, 'CASHIER');
    const response = await page.goto('/app/cashier/cash-shift', { waitUntil: 'domcontentloaded' });
    expect(response?.status() || 200).toBeLessThan(500);
    await page.waitForTimeout(1200);

    await expect(page.getByRole('button', { name: /Buka Shift Kasir/i })).toHaveCount(0);
    const closeShiftButton = page.getByRole('button', { name: /Tutup Shift/i }).first();
    await closeShiftButton.scrollIntoViewIfNeeded();
    await expect(closeShiftButton).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('button', { name: /^Buka Shift Kasir$/i })).toHaveCount(0);
    await expect(
      page.getByText(/Shift Kasir Aktif|Shift Kasir Perlu Dipulihkan/i).first(),
    ).toBeVisible({ timeout: 15000 });
    expect(page.url()).toContain('/app/cashier/cash-shift');
  } finally {
    await closeCashShiftIfOpen(request, session);
    if (openedStoreShiftId) {
      await closeStoreShiftById(request, session, openedStoreShiftId);
    }
  }

  expect(runtimeErrors, `Runtime JS errors for CASHIER shift page: ${runtimeErrors.join('\n')}`).toEqual([]);
  expect(failed5xxRequests, `HTTP 5xx for CASHIER shift page: ${failed5xxRequests.join('\n')}`).toEqual([]);
});


test('cashier can open receipt after checkout without admin template 403', async ({
  page,
  request,
}) => {
  const runtimeErrors: string[] = [];
  const failed5xxRequests: string[] = [];
  const forbiddenReceiptTemplateRequests: string[] = [];

  page.on('pageerror', (err) => {
    runtimeErrors.push(`[${page.url()}] ${err.message}`);
  });
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    runtimeErrors.push(`[console] ${msg.text()}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 500 && !res.url().includes('/sockjs-node')) {
      failed5xxRequests.push(`${res.status()} ${res.url()}`);
    }
    if (res.status() === 403 && res.url().includes('/receipts/templates')) {
      forbiddenReceiptTemplateRequests.push(`${res.status()} ${res.url()}`);
    }
  });

  const session = await loginForApi(request, 'CASHIER');
  const products = await fetchAvailableProducts(request, session);
  expect(products.length, 'Cashier receipt regression needs at least one in-stock product').toBeGreaterThan(0);

  let openedStoreShiftId: string | null = null;
  let openedCashShift = false;

  try {
    const storeShift = await openStoreShiftIfNeeded(request, session);
    if (storeShift.openedByTest) {
      openedStoreShiftId = storeShift.shift?.id || null;
    }

    const cashShift = await openCashShiftIfNeeded(request, session);
    openedCashShift = cashShift.openedByTest;

    await loginAsRole(page, request, 'CASHIER');
    const response = await page.goto('/pos', { waitUntil: 'domcontentloaded' });
    expect(response?.status() || 200).toBeLessThan(500);

    const firstProductName = String(products[0].name);
    const productCard = page.locator('div[role="button"]').filter({
      has: page.locator('h3').filter({ hasText: firstProductName }),
    }).first();

    await expect(productCard).toBeVisible({ timeout: 15000 });
    await productCard.click();

    await expect(page.locator('[data-testid="pos-cart-sidebar"]')).toContainText(firstProductName, {
      timeout: 15000,
    });

    await page.getByRole('button', { name: /^BAYAR/i }).click();
    await expect(page.getByText(/Payment Method|Pembayaran/i).first()).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /QRIS/i }).click();
    const payButton = page.getByRole('button', { name: /Pay|Konfirmasi Bayar/i }).last();
    await expect(payButton).toBeEnabled({ timeout: 15000 });
    await payButton.click();

    const successHeading = page.getByText(/Transaksi Berhasil|Pembayaran Berhasil/i).last();
    await expect(successHeading).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Transaksi Berhasil|Pembayaran Berhasil/i)).toHaveCount(1);

    const receiptButton = page.getByRole('button', { name: /Cetak Struk/i }).last();
    await expect(receiptButton).toBeVisible({ timeout: 15000 });
    await receiptButton.click({ force: true });

    await expect(successHeading).toHaveCount(0, { timeout: 15000 });
    await expect(page.getByText(/Detail Transaksi|Memuat data receipt/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(firstProductName).first()).toBeVisible({ timeout: 15000 });
  } finally {
    if (openedCashShift) {
      await closeCashShiftIfOpen(request, session);
    }
    if (openedStoreShiftId) {
      await closeStoreShiftById(request, session, openedStoreShiftId);
    }
  }

  expect(
    forbiddenReceiptTemplateRequests,
    `Cashier receipt opened admin-only template endpoint: ${forbiddenReceiptTemplateRequests.join('\n')}`,
  ).toEqual([]);
  expect(runtimeErrors, `Runtime JS errors for CASHIER receipt flow: ${runtimeErrors.join('\n')}`).toEqual([]);
  expect(failed5xxRequests, `HTTP 5xx for CASHIER receipt flow: ${failed5xxRequests.join('\n')}`).toEqual([]);
});

test('cashier closed shift appears in cashier shift history', async ({
  page,
  request,
}) => {
  const runtimeErrors: string[] = [];
  const failed5xxRequests: string[] = [];

  page.on('pageerror', (err) => {
    runtimeErrors.push(`[${page.url()}] ${err.message}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 500 && !res.url().includes('/sockjs-node')) {
      failed5xxRequests.push(`${res.status()} ${res.url()}`);
    }
  });

  const session = await loginForApi(request, 'CASHIER');
  let openedStoreShiftId: string | null = null;

  try {
    await closeCashShiftIfOpen(request, session);

    const storeShift = await openStoreShiftIfNeeded(request, session);
    if (storeShift.openedByTest) {
      openedStoreShiftId = storeShift.shift?.id || null;
    }

    const cashShift = await openCashShiftIfNeeded(request, session);
    const closedShiftId = cashShift.shift?.id;
    expect(closedShiftId, 'Cash shift regression test must create a shift id').toBeTruthy();

    await closeCashShiftIfOpen(request, session);

    const historyResponse = await request.get(`${API_BASE_URL}/cash-shift/history?page=1&limit=20`, {
      headers: session.headers,
    });
    expect(historyResponse.status(), 'Cash shift history endpoint must not fail with 5xx').toBeLessThan(500);
    const historyPayload = await historyResponse.json().catch(() => null);
    const historyData = unwrapApiPayload<any>(historyPayload);
    const historyRows = Array.isArray(historyData) ? historyData : [];
    expect(
      historyRows.some((shift: any) => shift.id === closedShiftId && shift.status === 'closed'),
      'Closed cashier shift must be present in cash-shift/history response',
    ).toBeTruthy();

    await loginAsRole(page, request, 'CASHIER');
    const response = await page.goto('/app/cashier/cash-shift', { waitUntil: 'domcontentloaded' });
    expect(response?.status() || 200).toBeLessThan(500);
    await page.waitForTimeout(1200);

    await page.getByRole('button', { name: /Riwayat Shift/i }).first().click();
    const cashierHistoryCard = page.locator('div').filter({
      has: page.getByRole('heading', { name: 'Riwayat Shift Kasir' }),
    }).first();

    await expect(cashierHistoryCard.getByText(/Belum ada riwayat shift kasir untuk periode ini/i)).toHaveCount(0);
    await expect(cashierHistoryCard.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
    await expect(cashierHistoryCard.getByText(/Closed/i).first()).toBeVisible({ timeout: 15000 });

    await cashierHistoryCard.getByRole('button', { name: /Detail/i }).first().click();
    await expect(page.getByText(/Detail Shift/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Total Pendapatan/i).first()).toBeVisible({ timeout: 15000 });
  } finally {
    await closeCashShiftIfOpen(request, session);
    if (openedStoreShiftId) {
      await closeStoreShiftById(request, session, openedStoreShiftId);
    }
  }

  expect(runtimeErrors, `Runtime JS errors for CASHIER shift history flow: ${runtimeErrors.join('\n')}`).toEqual([]);
  expect(failed5xxRequests, `HTTP 5xx for CASHIER shift history flow: ${failed5xxRequests.join('\n')}`).toEqual([]);
});

