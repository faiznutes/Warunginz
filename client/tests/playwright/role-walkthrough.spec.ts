import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import {
  API_BASE_URL,
  closeCashShiftIfOpen,
  closeStoreShiftById,
  loginAsRole,
  loginForApi,
  openCashShiftIfNeeded,
  openStoreShiftIfNeeded,
  type Role,
  unwrapApiPayload,
} from './support/role-auth';

type Session = Awaited<ReturnType<typeof loginForApi>>;
type Scenario = {
  label: string;
  path: string;
  mode?: 'allow' | 'deny';
  acceptedUrlFragments?: string[];
  requiredSelectors?: string[];
  resolvePath?: (session: Session, request: APIRequestContext) => Promise<string>;
  afterHealthy?: (page: Page, session: Session, request: APIRequestContext) => Promise<void>;
};

const BAD_PHRASES = [
  'gagal memuat produk',
  'gagal memuat laporan',
  'gagal memuat data',
  'gagal memuat order',
  'gagal memuat pelanggan',
  'gagal memuat toko',
  'gagal memuat pengguna',
  'gagal memuat diskon',
  'gagal memuat analytics',
  'gagal memuat analitik',
  'gagal memuat keuangan',
  'gagal memuat addon',
  'gagal memuat langganan',
  'internal server error',
  'validation error',
  'cannot get /',
  'something went wrong',
  'page not found',
];

function toCollection(input: unknown): any[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    for (const key of ['data', 'items', 'results', 'tenants', 'outlets', 'orders']) {
      if (Array.isArray(record[key])) {
        return record[key] as any[];
      }
    }
  }
  return [];
}

async function gotoWithWarmup(page: Page, path: string) {
  let lastResponse = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    lastResponse = await page.goto(path, { waitUntil: 'domcontentloaded' });
    if (!lastResponse || lastResponse.status() < 500) {
      return lastResponse;
    }
    await page.waitForTimeout(1200 * attempt);
  }
  return lastResponse;
}

async function resolveFirstTenantDetailPath(session: Session, request: APIRequestContext) {
  const response = await request.get(`${API_BASE_URL}/tenants`, {
    headers: session.headers,
  });
  expect(response.status()).toBeLessThan(500);
  const payload = await response.json().catch(() => null);
  const tenants = toCollection(unwrapApiPayload<unknown>(payload));
  expect(tenants.length, 'Expected at least one tenant for SUPER_ADMIN walkthrough').toBeGreaterThan(0);
  return `/app/tenants/${tenants[0].id}`;
}

async function fetchProducts(session: Session, request: APIRequestContext) {
  const query = new URLSearchParams();
  if (session.storeId) query.set('outletId', session.storeId);
  if (session.tenantId) query.set('tenantId', session.tenantId);
  const response = await request.get(`${API_BASE_URL}/products?${query.toString()}`, {
    headers: session.headers,
  });
  expect(response.status()).toBeLessThan(500);
  const payload = await response.json().catch(() => null);
  return toCollection(unwrapApiPayload<unknown>(payload)).filter(
    (item) => item && typeof item.name === 'string' && item.name.trim().length > 0,
  );
}

async function assertCashierPosHealthy(page: Page, session: Session, request: APIRequestContext) {
  const products = await fetchProducts(session, request);
  expect(products.length, 'Cashier audit account must still have products').toBeGreaterThan(0);
  const firstProductName = String(products[0].name);
  await expect(
    page.locator('h3').filter({ hasText: firstProductName }).first(),
    `Expected product "${firstProductName}" to render in cashier POS`,
  ).toBeVisible({ timeout: 15000 });
}

async function assertHealthyAllowedPage(page: Page, scenario: Scenario) {
  await page.waitForTimeout(1200);
  const currentUrl = page.url();
  expect(currentUrl, `Unexpected login redirect on ${scenario.path}`).not.toContain('/login');
  expect(currentUrl, `Unexpected unauthorized redirect on ${scenario.path}`).not.toContain('/unauthorized');

  const acceptedUrlFragments = scenario.acceptedUrlFragments || [scenario.path];
  const matchedUrl = acceptedUrlFragments.some((fragment) => currentUrl.includes(fragment));
  expect(
    matchedUrl,
    `Route ${scenario.path} resolved to unexpected URL ${currentUrl}. Allowed: ${acceptedUrlFragments.join(', ')}`,
  ).toBeTruthy();

  const bodyText = (await page.locator('body').innerText()).toLowerCase();
  const badPhrase = BAD_PHRASES.find((phrase) => bodyText.includes(phrase));
  expect(badPhrase, `Bad error copy detected on ${scenario.path}: ${badPhrase}`).toBeFalsy();

  if (scenario.requiredSelectors?.length) {
    for (const selector of scenario.requiredSelectors) {
      await expect(page.locator(selector).first()).toBeVisible();
    }
  }
}

async function assertDeniedPage(page: Page, scenario: Scenario) {
  await page.waitForTimeout(1200);
  const currentUrl = page.url();
  expect(currentUrl, `Expected ${scenario.path} to be denied`).toContain('/unauthorized');
  await expect(page.getByText(/unauthorized|tidak memiliki akses|akses ditolak/i).first()).toBeVisible();
}

const ROLE_MATRIX: Record<Role, Scenario[]> = {
  SUPER_ADMIN: [
    { label: 'platform dashboard', path: '/app/super-dashboard' },
    { label: 'tenant list', path: '/app/tenants' },
    { label: 'tenant detail', path: '/app/tenants', resolvePath: resolveFirstTenantDetailPath },
    { label: 'global reports', path: '/app/reports/global' },
    { label: 'tenant-only subscription deny', path: '/open-shift', mode: 'deny' },
  ],
  ADMIN_TENANT: [
    { label: 'tenant dashboard', path: '/app/dashboard' },
    { label: 'products', path: '/app/products' },
    { label: 'orders', path: '/app/orders' },
    { label: 'reports', path: '/app/reports' },
    { label: 'subscription', path: '/app/subscription' },
    { label: 'addons', path: '/app/addons' },
    { label: 'superadmin deny', path: '/app/superadmin/backups', mode: 'deny' },
  ],
  SUPERVISOR: [
    { label: 'orders', path: '/app/orders' },
    { label: 'products', path: '/app/products' },
    { label: 'reports', path: '/app/reports' },
    { label: 'kitchen', path: '/kitchen' },
    { label: 'open shift', path: '/open-shift', acceptedUrlFragments: ['/open-shift', '/app/dashboard'] },
    { label: 'subscription deny', path: '/app/subscription', mode: 'deny' },
  ],
  CASHIER: [
    { label: 'cash shift center', path: '/app/cashier/cash-shift' },
    {
      label: 'pos',
      path: '/pos',
      requiredSelectors: ['input[aria-label="Search products"]', '[data-testid="pos-cart-sidebar"]'],
      afterHealthy: assertCashierPosHealthy,
    },
    { label: 'orders', path: '/app/orders' },
    { label: 'reports', path: '/app/reports' },
    { label: 'subscription deny', path: '/app/subscription', mode: 'deny' },
  ],
  KITCHEN: [
    { label: 'kitchen fullscreen', path: '/kitchen' },
    { label: 'kitchen orders app', path: '/app/orders/kitchen' },
    { label: 'pos deny', path: '/pos', mode: 'deny' },
  ],
};

for (const role of Object.keys(ROLE_MATRIX) as Role[]) {
  test(`live role walkthrough for ${role}`, async ({ page, request }) => {
    const runtimeErrors: string[] = [];
    const failed5xxRequests: string[] = [];
    let openedStoreShiftId: string | null = null;
    let openedCashShift = false;
    let session: Session | null = null;

    page.on('pageerror', (err) => {
      runtimeErrors.push(`[${page.url()}] ${err.message}`);
    });
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('WebSocket connection')) {
        runtimeErrors.push(`[console:${msg.type()}] ${text}`);
      }
    });
    page.on('response', (res) => {
      if (res.status() >= 500 && !res.url().includes('/sockjs-node')) {
        failed5xxRequests.push(`${res.status()} ${res.url()}`);
      }
    });

    try {
      session = await loginForApi(request, role);

      if (role === 'CASHIER') {
        await closeCashShiftIfOpen(request, session);
        const storeShift = await openStoreShiftIfNeeded(request, session);
        if (storeShift.openedByTest) {
          openedStoreShiftId = storeShift.shift?.id || null;
        }

        const cashShift = await openCashShiftIfNeeded(request, session);
        openedCashShift = cashShift.openedByTest;
      }

      await loginAsRole(page, request, role);

      for (const scenario of ROLE_MATRIX[role]) {
        await test.step(`${role} walkthrough -> ${scenario.label}`, async () => {
          const targetPath =
            scenario.resolvePath && session ? await scenario.resolvePath(session, request) : scenario.path;
          const response = await gotoWithWarmup(page, targetPath);
          expect(response?.status() || 200, `Unexpected HTTP status for ${targetPath}`).toBeLessThan(500);

          if (scenario.mode === 'deny') {
            await assertDeniedPage(page, { ...scenario, path: targetPath });
            return;
          }

          await assertHealthyAllowedPage(page, {
            ...scenario,
            path: targetPath,
            acceptedUrlFragments: scenario.acceptedUrlFragments || [targetPath],
          });

          if (scenario.afterHealthy && session) {
            await scenario.afterHealthy(page, session, request);
          }
        });
      }
    } finally {
      if (role === 'CASHIER' && session) {
        if (openedCashShift) {
          await closeCashShiftIfOpen(request, session);
        }
        if (openedStoreShiftId) {
          await closeStoreShiftById(request, session, openedStoreShiftId);
        }
      }
    }

    expect(runtimeErrors, `Runtime JS errors for ${role}: ${runtimeErrors.join('\n')}`).toEqual([]);
    expect(failed5xxRequests, `HTTP 5xx requests for ${role}: ${failed5xxRequests.join('\n')}`).toEqual([]);
  });
}
