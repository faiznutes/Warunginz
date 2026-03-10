import { expect, test } from '@playwright/test';

const EMAIL =
  process.env.PLAYWRIGHT_EMAIL ||
  process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL ||
  'superadmin.audit@example.com';
const PASSWORD =
  process.env.PLAYWRIGHT_PASSWORD ||
  process.env.PLAYWRIGHT_ROLE_PASSWORD ||
  'Password123!';

const publicPages = ['/', '/pricing', '/help', '/contact', '/terms', '/login'];

const appPages = [
  '/app/super-dashboard',
  '/app/tenants',
  '/app/cashier/cash-shift',
  '/app/products',
  '/app/orders',
  '/app/customers',
  '/app/reports',
  '/app/users',
  '/app/stores',
  '/app/subscription',
  '/app/addons',
  '/app/rewards',
  '/app/discounts',
  '/app/reports/global',
  '/app/superadmin/contact-messages',
  '/app/superadmin/server-monitor',
  '/app/superadmin/system-info',
  '/app/settings/system',
  '/app/settings/preferences',
  '/app/settings/store',
  '/app/settings/2fa',
  '/app/settings/webhooks',
  '/app/settings/webhooks/tester',
  '/app/settings/sessions',
  '/app/settings/password',
  '/app/settings/gdpr',
  '/app/settings/archive',
  '/app/settings/retention',
  '/app/superadmin/backups',
  '/app/reports/stores',
  '/app/settings/subscription',
  '/app/pos/failed-syncs',
  '/app/orders/kitchen',
  '/app/inventory/suppliers',
  '/app/inventory/purchase-orders',
  '/app/inventory/stock-alerts',
  '/app/inventory/restock-suggestions',
  '/app/inventory/stock-transfers',
  '/app/reports/advanced',
  '/app/finance/management',
  '/app/analytics',
  '/app/finance',
  '/app/finance/transactions',
  '/app/profit-loss',
  '/app/products/adjustments',
  '/app/receipts/templates',
];

const errorPhrases = [
  'internal server error',
  'validation error',
  'page not found',
  'cannot get /',
  'something went wrong',
];

async function assertNoCriticalError(pageText: string, path: string) {
  const lowered = pageText.toLowerCase();
  const hit = errorPhrases.find((phrase) => lowered.includes(phrase));
  expect(hit, `Critical error text found on ${path}: ${hit}`).toBeFalsy();
}

async function gotoWithWarmup(page: any, path: string) {
  let lastResponse: any;
  for (let i = 0; i < 3; i += 1) {
    lastResponse = await page.goto(path, { waitUntil: 'domcontentloaded' });
    if (!lastResponse || lastResponse.status() < 500) {
      return lastResponse;
    }
    await page.waitForTimeout(1200);
  }
  return lastResponse;
}

test('public pages load without critical errors', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  for (const path of publicPages) {
    await test.step(`Open ${path}`, async () => {
      const response = await gotoWithWarmup(page, path);
      expect(response?.status(), `Unexpected HTTP status for ${path}`).toBeLessThan(500);
      await page.waitForTimeout(1000);
      const text = await page.locator('body').innerText();
      await assertNoCriticalError(text, path);
    });
  }

  expect(pageErrors, `Console runtime errors on public pages: ${pageErrors.join('\n')}`).toEqual([]);
});

test('super admin app pages smoke test', async ({ page }) => {
  const runtimeErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on('pageerror', (err) => runtimeErrors.push(err.message));
  page.on('response', (res) => {
    if (res.status() >= 500 && !res.url().includes('/sockjs-node')) {
      failedRequests.push(`${res.status()} ${res.url()}`);
    }
  });

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.fill('#email', EMAIL);
  await page.fill('#password', PASSWORD);
  await page.getByRole('button', { name: /masuk dashboard/i }).click();
  await page.waitForURL(/\/app\//, { timeout: 20000 });

  for (const path of appPages) {
    await test.step(`Open ${path}`, async () => {
      const response = await gotoWithWarmup(page, path);
      expect(response?.status(), `Unexpected HTTP status for ${path}`).toBeLessThan(500);
      await page.waitForTimeout(1500);
      const text = await page.locator('body').innerText();
      await assertNoCriticalError(text, path);
      expect(page.url(), `Route fallback happened for ${path}`).not.toContain('/unauthorized');
      expect(page.url(), `Route fallback happened for ${path}`).not.toContain('/login');
    });
  }

  const tenantLinks = page.locator('a[href^="/app/tenants/"]');
  const tenantCount = await tenantLinks.count();
  if (tenantCount > 0) {
    const href = await tenantLinks.first().getAttribute('href');
    if (href) {
      await test.step('Open first tenant detail page', async () => {
        const response = await gotoWithWarmup(page, href);
        expect(response?.status(), 'Tenant detail returns server error').toBeLessThan(500);
        await page.waitForTimeout(1500);
        const text = await page.locator('body').innerText();
        await assertNoCriticalError(text, href);
      });
    }
  }

  const storeLinks = page.locator('a[href^="/app/stores/"]');
  const storeCount = await storeLinks.count();
  if (storeCount > 0) {
    const href = await storeLinks.first().getAttribute('href');
    if (href) {
      await test.step('Open first store detail page', async () => {
        const response = await gotoWithWarmup(page, href);
        expect(response?.status(), 'Store detail returns server error').toBeLessThan(500);
        await page.waitForTimeout(1200);
        const text = await page.locator('body').innerText();
        await assertNoCriticalError(text, href);
      });
    }
  }

  expect(runtimeErrors, `Runtime JS errors found: ${runtimeErrors.join('\n')}`).toEqual([]);
  expect(failedRequests, `HTTP 5xx requests found: ${failedRequests.join('\n')}`).toEqual([]);
});
