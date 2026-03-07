import { expect, test } from '@playwright/test';

const EMAIL =
  process.env.PLAYWRIGHT_EMAIL ||
  process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL ||
  'superadmin.audit@example.com';
const PASSWORD =
  process.env.PLAYWRIGHT_PASSWORD ||
  process.env.PLAYWRIGHT_ROLE_PASSWORD ||
  'Password123!';

const errorPhrases = [
  'internal server error',
  'validation error',
  'page not found',
  'cannot get /',
  'something went wrong',
];

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

async function loginAsSuperAdmin(page: any, request: any) {
  const response = await request.post('/api/auth/login', {
    data: { email: EMAIL, password: PASSWORD },
  });
  if (!response.ok()) {
    await gotoWithWarmup(page, '/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15000 });
    await page.fill('#email', EMAIL);
    await page.fill('#password', PASSWORD);
    await page.getByRole('button', { name: /masuk dashboard/i }).click();
    await page.waitForURL(/\/app\//, { timeout: 20000 });
    return;
  }

  const payload = await response.json();
  const data = payload?.data || payload;
  const token = data?.token;
  const user = data?.user;

  expect(token).toBeTruthy();
  expect(user?.role).toBe('SUPER_ADMIN');

  await page.addInitScript(
    ({ injectedToken, injectedUser }) => {
      localStorage.setItem('token', injectedToken);
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('user', JSON.stringify(injectedUser));
      if (injectedUser?.tenantId) {
        localStorage.setItem('selectedTenantId', injectedUser.tenantId);
      }
    },
    { injectedToken: token, injectedUser: user },
  );

  await gotoWithWarmup(page, '/app/super-dashboard');
  await expect(page).toHaveURL(/\/app\//, { timeout: 20000 });
}

async function assertNoCriticalError(page: any, path: string) {
  const text = (await page.locator('body').innerText()).toLowerCase();
  const hit = errorPhrases.find((phrase) => text.includes(phrase));
  expect(hit, `Critical error text found on ${path}: ${hit}`).toBeFalsy();
}

async function openTenantTab(page: any, index: number, markerText: string) {
  const tabs = page.locator('div.flex.overflow-x-auto.gap-8.no-scrollbar a');
  await expect(tabs.nth(index)).toBeVisible({ timeout: 10000 });
  await tabs.nth(index).click();
  await page.waitForTimeout(700);
  await expect(page.locator('body')).toContainText(markerText);
}

test('tenant detail tabs and core forms are functional', async ({ page, request }) => {
  const runtimeErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on('pageerror', (err) => runtimeErrors.push(err.message));
  page.on('response', (res) => {
    if (res.status() >= 500) {
      failedRequests.push(`${res.status()} ${res.url()}`);
    }
  });

  await loginAsSuperAdmin(page, request);
  await gotoWithWarmup(page, '/app/tenants');
  await expect(page).toHaveURL(/\/app\/tenants/);

  const tenantRowButton = page.locator('tbody tr button').first();
  await expect(tenantRowButton).toBeVisible({ timeout: 15000 });
  await tenantRowButton.click();
  await expect(page).toHaveURL(/\/app\/tenants\/.+/);
  await assertNoCriticalError(page, 'tenant-detail');

  await openTenantTab(page, 0, 'Profil Tenant');
  await assertNoCriticalError(page, 'tenant-tab-profile');
  await openTenantTab(page, 1, 'Langganan');
  await assertNoCriticalError(page, 'tenant-tab-subscription');
  await openTenantTab(page, 2, 'Addon');
  await assertNoCriticalError(page, 'tenant-tab-addons');
  await openTenantTab(page, 3, 'Manajemen Pengguna');
  await assertNoCriticalError(page, 'tenant-tab-users');
  await openTenantTab(page, 4, 'Daftar Toko');
  await assertNoCriticalError(page, 'tenant-tab-stores');

  await openTenantTab(page, 3, 'Manajemen Pengguna');
  const addUserBtn = page.locator('button').filter({ hasText: /Tambah User/ }).first();
  await expect(addUserBtn).toBeVisible({ timeout: 10000 });
  await addUserBtn.click();
  const userNameInput = page.locator('input[placeholder="Nama user"]');
  await expect(userNameInput).toBeVisible({ timeout: 10000 });
  await userNameInput.fill(`PW User ${Date.now()}`);
  await page.fill('input[placeholder="email@example.com"]', `pw.user.${Date.now()}@example.com`);
  const roleSelect = page.locator('select').filter({ has: page.locator('option[value="CASHIER"]') }).first();
  await roleSelect.selectOption('CASHIER');
  await page.locator('button[type="submit"]').filter({ hasText: /Tambah User|Menambah/ }).first().click();
  await page.waitForTimeout(1200);
  await assertNoCriticalError(page, 'tenant-add-user');

  await openTenantTab(page, 4, 'Daftar Toko');
  const addStoreBtn = page.locator('button').filter({ hasText: /Tambah Toko|Tambah Toko Pertama/ }).first();
  await expect(addStoreBtn).toBeVisible({ timeout: 10000 });
  await addStoreBtn.click();
  await page.fill('input[placeholder="Contoh: Warungin Pusat"]', `PW Store ${Date.now()}`);
  await page.fill('textarea[placeholder*="Jl. Raya"]', 'Jl. Playwright No. 1');
  await page.fill('input[placeholder="08xxxxxxxxxx"]', '081234567890');
  await page.locator('button[type="submit"]').filter({ hasText: /Tambah Toko|Menambah/ }).first().click();
  await page.waitForTimeout(1800);
  await assertNoCriticalError(page, 'tenant-add-store');

  await openTenantTab(page, 2, 'Addon');
  const addAddonBtn = page.locator('button').filter({ hasText: /Tambah Addon/ }).first();
  await expect(addAddonBtn).toBeVisible({ timeout: 10000 });
  await addAddonBtn.click();
  const addonSelect = page.locator('select').filter({ hasText: /Pilih addon/i }).first();
  await expect(addonSelect).toBeVisible({ timeout: 10000 });
  const optionCount = await addonSelect.locator('option').count();
  expect(optionCount).toBeGreaterThan(1);
  await page.keyboard.press('Escape');

  expect(runtimeErrors, `Runtime JS errors found: ${runtimeErrors.join('\n')}`).toEqual([]);
  expect(failedRequests, `HTTP 5xx requests found: ${failedRequests.join('\n')}`).toEqual([]);
});
