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

type Scenario = {
  label: string;
  path: string;
  acceptedUrlFragments?: string[];
  requiredSelectors?: string[];
  afterPageHealthy?: (
    page: Page,
    session: Awaited<ReturnType<typeof loginForApi>>,
    request: APIRequestContext,
  ) => Promise<void>;
  resolvePath?: (
    session: Awaited<ReturnType<typeof loginForApi>>,
    request: APIRequestContext,
  ) => Promise<string>;
};

const BAD_PHRASES = [
  'gagal memuat produk',
  'gagal memuat laporan',
  'gagal memuat data',
  'gagal memuat order',
  'gagal memuat pelanggan',
  'gagal memuat toko',
  'gagal memuat pengguna',
  'internal server error',
  'validation error',
  'cannot get /',
  'something went wrong',
  'page not found',
];

const DOMAIN_MATRIX: Record<Role, Scenario[]> = {
  SUPER_ADMIN: [
    { label: 'platform dashboard', path: '/app/super-dashboard' },
    { label: 'tenant list', path: '/app/tenants' },
    {
      label: 'tenant detail',
      path: '/app/tenants',
      resolvePath: resolveFirstTenantDetailPath,
    },
    { label: 'products', path: '/app/products' },
    { label: 'orders', path: '/app/orders' },
    { label: 'customers', path: '/app/customers' },
    { label: 'global reports', path: '/app/reports/global' },
    { label: 'subscription', path: '/app/subscription' },
    { label: 'addons', path: '/app/addons' },
    { label: 'system settings', path: '/app/settings/system' },
  ],
  ADMIN_TENANT: [
    { label: 'tenant dashboard', path: '/app/dashboard' },
    { label: 'products', path: '/app/products' },
    { label: 'orders', path: '/app/orders' },
    { label: 'customers', path: '/app/customers' },
    { label: 'stores', path: '/app/stores' },
    { label: 'users', path: '/app/users' },
    { label: 'reports', path: '/app/reports' },
    { label: 'subscription', path: '/app/subscription' },
    { label: 'addons', path: '/app/addons' },
    {
      label: 'store detail',
      path: '/app/stores',
      resolvePath: resolveFirstStoreDetailPath,
    },
    { label: 'store settings', path: '/app/settings/store' },
  ],
  SUPERVISOR: [
    { label: 'store dashboard', path: '/app/dashboard' },
    { label: 'orders', path: '/app/orders' },
    { label: 'products', path: '/app/products' },
    { label: 'customers', path: '/app/customers' },
    { label: 'reports', path: '/app/reports' },
    { label: 'users', path: '/app/users' },
    { label: 'stores', path: '/app/stores' },
    { label: 'open shift', path: '/open-shift' },
    { label: 'kitchen', path: '/kitchen' },
  ],
  CASHIER: [
    { label: 'cash shift center', path: '/app/cashier/cash-shift' },
    {
      label: 'pos',
      path: '/pos',
      requiredSelectors: [
        'input[aria-label=\"Search products\"]',
        '[data-testid=\"pos-cart-sidebar\"]',
      ],
      afterPageHealthy: assertCashierProductsVisible,
    },
    { label: 'orders', path: '/app/orders' },
    {
      label: 'open shift gate',
      path: '/open-shift',
      acceptedUrlFragments: ['/open-shift', '/pos', '/app/cashier/cash-shift'],
    },
  ],
  KITCHEN: [
    { label: 'kitchen fullscreen', path: '/kitchen' },
    { label: 'orders', path: '/app/orders' },
    { label: 'kitchen app page', path: '/app/orders/kitchen' },
  ],
};

function toCollection(input: unknown): any[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    for (const key of ['data', 'items', 'results', 'tenants', 'outlets']) {
      if (Array.isArray(record[key])) {
        return record[key] as any[];
      }
    }
  }
  return [];
}

async function resolveFirstTenantDetailPath(
  session: Awaited<ReturnType<typeof loginForApi>>,
  request: APIRequestContext,
) {
  const response = await request.get(`${API_BASE_URL}/tenants`, {
    headers: session.headers,
  });
  expect(response.status(), 'Tenant list API must be reachable for SUPER_ADMIN').toBeLessThan(500);
  const payload = await response.json().catch(() => null);
  const tenants = toCollection(unwrapApiPayload<unknown>(payload));
  const firstTenant = tenants[0] || null;
  expect(firstTenant?.id, 'Expected at least one tenant for tenant detail walkthrough').toBeTruthy();
  return `/app/tenants/${firstTenant.id}`;
}

async function resolveFirstStoreDetailPath(
  session: Awaited<ReturnType<typeof loginForApi>>,
  request: APIRequestContext,
) {
  const response = await request.get(`${API_BASE_URL}/outlets`, {
    headers: session.headers,
  });
  expect(response.status(), 'Outlets list API must be reachable for store detail walkthrough').toBeLessThan(500);
  const payload = await response.json().catch(() => null);
  const outlets = toCollection(unwrapApiPayload<unknown>(payload));
  const firstOutlet = outlets[0] || null;
  expect(firstOutlet?.id, 'Expected at least one outlet for store detail walkthrough').toBeTruthy();
  return `/app/stores/${firstOutlet.id}`;
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

async function fetchProductsForSession(
  session: Awaited<ReturnType<typeof loginForApi>>,
  request: APIRequestContext,
) {
  const query = new URLSearchParams();
  if (session.storeId) {
    query.set('outletId', session.storeId);
  }
  if (session.tenantId) {
    query.set('tenantId', session.tenantId);
  }

  const response = await request.get(`${API_BASE_URL}/products?${query.toString()}`, {
    headers: session.headers,
  });
  expect(response.status(), 'Products API must be reachable for POS walkthrough').toBeLessThan(500);
  const payload = await response.json().catch(() => null);
  return toCollection(unwrapApiPayload<unknown>(payload)).filter(
    (item) => item && typeof item.name === 'string' && item.name.trim().length > 0,
  );
}

async function assertCashierProductsVisible(
  page: Page,
  session: Awaited<ReturnType<typeof loginForApi>>,
  request: APIRequestContext,
) {
  const products = await fetchProductsForSession(session, request);
  expect(products.length, 'Cashier POS audit account must have at least one product').toBeGreaterThan(
    0,
  );

  const firstProductName = String(products[0].name);
  await expect(
    page.locator('h3').filter({ hasText: firstProductName }).first(),
    `Expected cashier POS to render product "${firstProductName}" from API`,
  ).toBeVisible({ timeout: 15000 });

  await expect(
    page.getByText('No products found'),
    'POS grid unexpectedly shows empty state while products exist in API',
  ).toHaveCount(0);
}

async function assertHealthyPage(page: Page, scenario: Scenario) {
  await page.waitForTimeout(1200);
  const currentUrl = page.url();

  expect(currentUrl, `Unexpected auth fallback on ${scenario.path}`).not.toContain('/login');
  expect(currentUrl, `Unexpected unauthorized fallback on ${scenario.path}`).not.toContain(
    '/unauthorized',
  );

  const acceptedUrlFragments = scenario.acceptedUrlFragments || [scenario.path];
  const matchedUrl = acceptedUrlFragments.some((fragment) => currentUrl.includes(fragment));
  expect(
    matchedUrl,
    `Route ${scenario.path} resolved to unexpected URL ${currentUrl}. Allowed: ${acceptedUrlFragments.join(', ')}`,
  ).toBeTruthy();

  const text = (await page.locator('body').innerText()).toLowerCase();
  const badPhrase = BAD_PHRASES.find((phrase) => text.includes(phrase));
  expect(badPhrase, `Critical error copy detected on ${scenario.path}: ${badPhrase}`).toBeFalsy();

  if (scenario.requiredSelectors?.length) {
    for (const selector of scenario.requiredSelectors) {
      await expect(
        page.locator(selector).first(),
        `Missing required selector ${selector} on ${scenario.path}`,
      ).toBeVisible();
    }
  }

  const unresolvedTags = await page.evaluate(() =>
    Array.from(document.querySelectorAll('*'))
      .map((element) => element.tagName)
      .filter((tagName) =>
        ['POSCATEGORYSIDEBAR', 'POSPRODUCTGRID', 'POSCARTSIDEBAR', 'RECEIPTPRINTER'].includes(
          tagName,
        ),
      ),
  );
  expect(
    unresolvedTags,
    `Unresolved Vue component tags detected on ${scenario.path}: ${unresolvedTags.join(', ')}`,
  ).toEqual([]);
}

for (const role of Object.keys(DOMAIN_MATRIX) as Role[]) {
  test(`domain walkthrough for ${role}`, async ({ page, request }) => {
    const runtimeErrors: string[] = [];
    const failed5xxRequests: string[] = [];
    const failedApiRequests: string[] = [];
    let openedStoreShiftId: string | null = null;
    let openedCashShift = false;
    let cashierSession: Awaited<ReturnType<typeof loginForApi>> | null = null;
    let roleSession: Awaited<ReturnType<typeof loginForApi>> | null = null;

    page.on('pageerror', (err) => {
      runtimeErrors.push(`[${page.url()}] ${err.message}`);
    });
    page.on('console', (msg) => {
      if (msg.type() !== 'error' && msg.type() !== 'warning') {
        return;
      }
      const text = msg.text();
      if (
        text.includes('Failed to resolve component') ||
        text.includes('Cannot read properties of undefined')
      ) {
        runtimeErrors.push(`[console:${msg.type()}] ${text}`);
      }
    });
    page.on('response', (res) => {
      if (res.status() >= 500 && !res.url().includes('/sockjs-node')) {
        failed5xxRequests.push(`${res.status()} ${res.url()}`);
      }
      if (
        res.status() >= 400 &&
        res.status() < 500 &&
        res.url().includes('/api/') &&
        res.request().method() === 'GET'
      ) {
        failedApiRequests.push(`${res.status()} ${res.request().method()} ${res.url()}`);
      }
    });

    try {
      roleSession = await loginForApi(request, role);

      if (role === 'CASHIER') {
        cashierSession = roleSession;
        await closeCashShiftIfOpen(request, cashierSession);

        const storeShift = await openStoreShiftIfNeeded(request, cashierSession);
        if (storeShift.openedByTest) {
          openedStoreShiftId = storeShift.shift?.id || null;
        }

        const cashShift = await openCashShiftIfNeeded(request, cashierSession);
        openedCashShift = cashShift.openedByTest;
      }

      await loginAsRole(page, request, role);

      for (const scenario of DOMAIN_MATRIX[role]) {
        await test.step(`${role} opens ${scenario.label}`, async () => {
          const path =
            scenario.resolvePath && roleSession
              ? await scenario.resolvePath(roleSession, request)
              : scenario.path;
          const response = await gotoWithWarmup(page, path);
          expect(response?.status() || 200, `HTTP status failed for ${scenario.path}`).toBeLessThan(
            500,
          );
          await assertHealthyPage(page, {
            ...scenario,
            path,
            acceptedUrlFragments: scenario.acceptedUrlFragments || [path],
          });
          if (scenario.afterPageHealthy) {
            await scenario.afterPageHealthy(page, roleSession as Awaited<ReturnType<typeof loginForApi>>, request);
          }
        });
      }
    } finally {
      if (role === 'CASHIER' && cashierSession) {
        if (openedCashShift) {
          await closeCashShiftIfOpen(request, cashierSession);
        }
        if (openedStoreShiftId) {
          await closeStoreShiftById(request, cashierSession, openedStoreShiftId);
        }
      }
    }

    expect(runtimeErrors, `Runtime JS errors for ${role}: ${runtimeErrors.join('\n')}`).toEqual(
      [],
    );
    expect(
      failed5xxRequests,
      `HTTP 5xx requests for ${role}: ${failed5xxRequests.join('\n')}`,
    ).toEqual([]);
    expect(
      failedApiRequests,
      `HTTP 4xx API requests for ${role}: ${failedApiRequests.join('\n')}`,
    ).toEqual([]);
  });
}
