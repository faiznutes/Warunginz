import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import {
  API_BASE_URL,
  closeCashShiftIfOpen,
  closeStoreShiftById,
  loginAsRole,
  loginForApi,
  openCashShiftIfNeeded,
  openStoreShiftIfNeeded,
  type AuthSession,
  type Role,
  unwrapApiPayload,
} from './support/role-auth';

type ExpectedMode = 'public' | 'allowed' | 'allowed_or_safe_deny';
type Resolver =
  | { type: 'static'; path: string }
  | { type: 'tenant-detail' }
  | { type: 'store-detail' }
  | { type: 'store-edit' }
  | null;

type ManifestEntry = {
  routeName: string;
  fullPath: string;
  routePath: string;
  source: string;
  viewPath: string;
  domain: string;
  layout: string;
  roles: Role[];
  requiresAuth: boolean;
  requiresPermission: { role: string; permission: string } | null;
  requiresAddon: string | null;
  primaryRole: Role | null;
  resolver: Resolver;
  expectedMode: ExpectedMode;
  phase: 'Major' | 'Minor';
  failureSignals: string;
  guardSummary: string;
  apiSummary: string;
  writeSummary: string;
};

type GroupKey = Role | 'PUBLIC';

type RouteState = {
  runtimeErrors: string[];
  failed5xxRequests: string[];
  failedApiRequests: string[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const manifestPath = path.join(__dirname, '.generated', 'all-routes-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as ManifestEntry[];

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
  'typeerror:',
];

const routeGroups = new Map<GroupKey, ManifestEntry[]>();
for (const entry of manifest) {
  const key: GroupKey = entry.requiresAuth ? (entry.primaryRole || 'ADMIN_TENANT') : 'PUBLIC';
  const current = routeGroups.get(key) || [];
  current.push(entry);
  routeGroups.set(key, current);
}
for (const entries of routeGroups.values()) {
  entries.sort((left, right) => left.fullPath.localeCompare(right.fullPath));
}

const dynamicPathCache = new Map<string, string>();

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

function routeLabel(group: GroupKey, entry: ManifestEntry) {
  return `${group} | ${entry.fullPath}`;
}

function buildAllowedFragments(entry: ManifestEntry, resolvedPath: string) {
  const fragments = new Set<string>([resolvedPath]);

  if (entry.fullPath === '/open-shift') {
    fragments.add('/open-shift');
    fragments.add('/pos');
    fragments.add('/app/cashier/cash-shift');
  }

  if (entry.expectedMode === 'allowed_or_safe_deny') {
    fragments.add('/unauthorized');
    fragments.add('/app/dashboard');
    fragments.add('/app/super-dashboard');
  }

  return Array.from(fragments);
}

function getAllowedBadPhrases(entry: ManifestEntry) {
  const allowed = new Set<string>();
  if (entry.fullPath === '/:pathMatch(.*)*') {
    allowed.add('page not found');
  }
  return allowed;
}

async function gotoWithWarmup(page: Page, pathToOpen: string) {
  let lastResponse = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    lastResponse = await page.goto(pathToOpen, { waitUntil: 'domcontentloaded' });
    if (!lastResponse || lastResponse.status() < 500) {
      return lastResponse;
    }
    await page.waitForTimeout(1200 * attempt);
  }
  return lastResponse;
}

function attachPageObservers(page: Page, state: RouteState) {
  page.on('pageerror', (error) => {
    state.runtimeErrors.push(`[pageerror] ${error.message}`);
  });
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error') {
      if (text.includes('Failed to load resource')) {
        return;
      }
      state.runtimeErrors.push(`[console:error] ${text}`);
      return;
    }
    if (
      message.type() === 'warning' &&
      (text.includes('Failed to resolve component') ||
        text.includes('Cannot read properties of undefined'))
    ) {
      state.runtimeErrors.push(`[console:${message.type()}] ${text}`);
    }
  });
  page.on('response', (response) => {
    const url = response.url();
    if (response.status() >= 500 && !url.includes('/sockjs-node')) {
      state.failed5xxRequests.push(`${response.status()} ${response.request().method()} ${url}`);
    }
    if (
      response.status() >= 400 &&
      response.status() < 500 &&
      url.includes('/api/') &&
      response.request().method() === 'GET'
    ) {
      state.failedApiRequests.push(`${response.status()} ${response.request().method()} ${url}`);
    }
  });
}

async function resolveDynamicPath(
  entry: ManifestEntry,
  group: GroupKey,
  request: APIRequestContext,
  session: AuthSession | null,
) {
  if (!entry.resolver) {
    return entry.fullPath;
  }

  if (entry.resolver.type === 'static') {
    return entry.resolver.path;
  }

  const cacheKey = `${group}:${entry.resolver.type}`;
  const cached = dynamicPathCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  if (!session) {
    throw new Error(`Resolver ${entry.resolver.type} membutuhkan session untuk ${entry.fullPath}`);
  }

  if (entry.resolver.type === 'tenant-detail') {
    const response = await request.get(`${API_BASE_URL}/tenants`, { headers: session.headers });
    expect(response.status(), 'Tenant list API must be reachable for dynamic tenant route').toBeLessThan(500);
    const payload = await response.json().catch(() => null);
    const tenants = toCollection(unwrapApiPayload<unknown>(payload));
    const firstTenant = tenants[0] || null;
    expect(firstTenant?.id, 'Expected at least one tenant for tenant-detail route smoke').toBeTruthy();
    const resolved = `/app/tenants/${firstTenant.id}`;
    dynamicPathCache.set(cacheKey, resolved);
    return resolved;
  }

  const response = await request.get(`${API_BASE_URL}/outlets`, { headers: session.headers });
  expect(response.status(), 'Outlet list API must be reachable for dynamic store route').toBeLessThan(500);
  const payload = await response.json().catch(() => null);
  const outlets = toCollection(unwrapApiPayload<unknown>(payload));
  const firstOutlet = outlets[0] || null;
  expect(firstOutlet?.id, 'Expected at least one outlet for store route smoke').toBeTruthy();
  const basePath = `/app/stores/${firstOutlet.id}`;
  const resolved = entry.resolver.type === 'store-edit' ? `${basePath}/edit` : basePath;
  dynamicPathCache.set(cacheKey, resolved);
  return resolved;
}

async function assertProductsVisibleIfPresent(page: Page, request: APIRequestContext, session: AuthSession) {
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
  expect(response.status(), 'Products API must be reachable for POS verification').toBeLessThan(500);
  const payload = await response.json().catch(() => null);
  const products = toCollection(unwrapApiPayload<unknown>(payload)).filter(
    (item) => item && typeof item.name === 'string' && item.name.trim().length > 0,
  );

  if (products.length === 0) {
    return;
  }

  const firstProductName = String(products[0].name);
  await expect(
    page.locator('h3').filter({ hasText: firstProductName }).first(),
    `Expected POS to render product "${firstProductName}" from API`,
  ).toBeVisible({ timeout: 15000 });
}

async function assertHealthyRoute(
  page: Page,
  entry: ManifestEntry,
  resolvedPath: string,
  state: RouteState,
) {
  await page.waitForTimeout(1100);
  const currentUrl = page.url();
  const bodyText = (await page.locator('body').innerText()).toLowerCase();
  const allowedBadPhrases = getAllowedBadPhrases(entry);

  const badPhrase = BAD_PHRASES.find(
    (phrase) => bodyText.includes(phrase) && !allowedBadPhrases.has(phrase),
  );
  expect(
    badPhrase,
    `Critical error copy detected on ${resolvedPath}: ${badPhrase ?? 'n/a'} | Signals: ${entry.failureSignals}`,
  ).toBeFalsy();

  if (entry.expectedMode === 'public') {
    if (entry.fullPath !== '/unauthorized') {
      expect(currentUrl, `Public route ${resolvedPath} unexpectedly redirected to unauthorized`).not.toContain(
        '/unauthorized',
      );
    }
  } else {
    expect(currentUrl, `Protected route ${resolvedPath} unexpectedly redirected to login`).not.toContain(
      '/login',
    );
  }

  const acceptedFragments = buildAllowedFragments(entry, resolvedPath);
  const matched = acceptedFragments.some((fragment) => currentUrl.includes(fragment));
  expect(
    matched,
    `Route ${resolvedPath} resolved to unexpected URL ${currentUrl}. Allowed: ${acceptedFragments.join(', ')}`,
  ).toBeTruthy();

  const unresolvedTags = await page.evaluate(() =>
    Array.from(document.querySelectorAll('*'))
      .map((element) => element.tagName)
      .filter((tagName) =>
        [
          'POSCATEGORYSIDEBAR',
          'POSPRODUCTGRID',
          'POSCARTSIDEBAR',
          'RECEIPTPRINTER',
          'TENANTSWITCHER',
        ].includes(tagName),
      ),
  );
  expect(
    unresolvedTags,
    `Unresolved Vue component tags detected on ${resolvedPath}: ${unresolvedTags.join(', ')}`,
  ).toEqual([]);

  expect(
    state.runtimeErrors,
    `Runtime JS errors on ${resolvedPath}: ${state.runtimeErrors.join('\n')}`,
  ).toEqual([]);
  expect(
    state.failed5xxRequests,
    `HTTP 5xx requests on ${resolvedPath}: ${state.failed5xxRequests.join('\n')}`,
  ).toEqual([]);
  expect(
    state.failedApiRequests,
    `HTTP 4xx GET API requests on ${resolvedPath}: ${state.failedApiRequests.join('\n')}`,
  ).toEqual([]);
}

for (const [group, entries] of routeGroups.entries()) {
  test.describe(`${group} route smoke`, () => {
    for (const entry of entries) {
      test(routeLabel(group, entry), async ({ page, request }) => {
        const state: RouteState = {
          runtimeErrors: [],
          failed5xxRequests: [],
          failedApiRequests: [],
        };
        attachPageObservers(page, state);

        let session: AuthSession | null = null;
        let openedStoreShiftId: string | null = null;
        let openedCashShift = false;

        try {
          if (group !== 'PUBLIC') {
            session = await loginForApi(request, group);
            if (group === 'CASHIER') {
              const storeShift = await openStoreShiftIfNeeded(request, session);
              if (storeShift.openedByTest) {
                openedStoreShiftId = storeShift.shift?.id || null;
              }
              const cashShift = await openCashShiftIfNeeded(request, session);
              openedCashShift = cashShift.openedByTest;
            }
            await loginAsRole(page, request, group);
          }

          const resolvedPath = await resolveDynamicPath(entry, group, request, session);
          const response = await gotoWithWarmup(page, resolvedPath);
          expect(response?.status() || 200, `HTTP status failed for ${resolvedPath}`).toBeLessThan(500);
          await assertHealthyRoute(page, entry, resolvedPath, state);

          if (group === 'CASHIER' && entry.fullPath === '/pos' && session) {
            await assertProductsVisibleIfPresent(page, request, session);
          }
        } finally {
          if (group === 'CASHIER' && session) {
            if (openedCashShift) {
              await closeCashShiftIfOpen(request, session);
            }
            if (openedStoreShiftId) {
              await closeStoreShiftById(request, session, openedStoreShiftId);
            }
          }
        }
      });
    }
  });
}



