import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import {
  API_BASE_URL,
  loginAsRole,
  loginForApi,
  unwrapApiPayload,
} from './support/role-auth';

type SubscriptionSnapshot = {
  currentPlan?: string;
  effectivePlan?: string;
  subscriptionExpired?: boolean;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
  entitlements?: string[];
  activeAddons?: Array<{ addonId?: string; addonType?: string; status?: string }>;
};

async function getAdminTenantSession(request: APIRequestContext) {
  return loginForApi(request, 'ADMIN_TENANT');
}

async function getSuperAdminHeadersForTenant(request: APIRequestContext, tenantId: string) {
  const superAdmin = await loginForApi(request, 'SUPER_ADMIN');
  return {
    ...superAdmin.headers,
    'X-Tenant-Id': tenantId,
  };
}

async function getSubscriptionSnapshot(
  request: APIRequestContext,
  headers: Record<string, string>,
): Promise<SubscriptionSnapshot> {
  const response = await request.get(`${API_BASE_URL}/subscriptions/current`, { headers });
  expect(response.status(), 'subscriptions/current must stay below 500').toBeLessThan(500);
  const payload = await response.json().catch(() => null);
  return (unwrapApiPayload<SubscriptionSnapshot>(payload) || {}) as SubscriptionSnapshot;
}

async function setTenantSubscriptionState(
  request: APIRequestContext,
  superHeaders: Record<string, string>,
  tenantId: string,
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE',
  endDate: Date,
) {
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const response = await request.put(`${API_BASE_URL}/tenants/${tenantId}/subscription`, {
    headers: superHeaders,
    data: {
      plan,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  });

  const bodyText = await response.text().catch(() => '');
  expect(
    response.status(),
    `Updating tenant subscription to ${plan} must stay below 500. body=${bodyText.slice(0, 500)}`,
  ).toBeLessThan(500);
  if (![200, 201].includes(response.status())) {
    throw new Error(
      `Updating tenant subscription to ${plan} failed. status=${response.status()} body=${bodyText.slice(0, 500)}`,
    );
  }
}

async function addAnalyticsAddon(
  request: APIRequestContext,
  adminHeaders: Record<string, string>,
) {
  const response = await request.post(`${API_BASE_URL}/subscriptions/addons`, {
    headers: adminHeaders,
    data: {
      addonId: 'addon-analytics',
      addonName: 'Business Analytics',
      addonType: 'ANALYTICS',
      purchasedBy: 'PLAYWRIGHT_BILLING_LIFECYCLE',
    },
  });

  if ([200, 201].includes(response.status())) {
    return;
  }

  const bodyText = await response.text().catch(() => '');
  if (response.status() === 400 && /already active/i.test(bodyText)) {
    return;
  }

  throw new Error(`Failed to add analytics addon. status=${response.status()} body=${bodyText}`);
}

async function removeAnalyticsAddon(
  request: APIRequestContext,
  adminHeaders: Record<string, string>,
) {
  const response = await request.delete(`${API_BASE_URL}/subscriptions/addons/addon-analytics`, {
    headers: adminHeaders,
  });

  const bodyText = await response.text().catch(() => '');
  if ([200, 204].includes(response.status())) {
    return;
  }

  if (response.status() === 404 && /not found/i.test(bodyText)) {
    return;
  }

  throw new Error(`Failed to remove analytics addon. status=${response.status()} body=${bodyText}`);
}

async function extendTenantSubscription(
  request: APIRequestContext,
  adminHeaders: Record<string, string>,
  durationDays: number,
) {
  const response = await request.post(`${API_BASE_URL}/subscriptions/extend`, {
    headers: adminHeaders,
    data: {
      duration: durationDays,
    },
  });

  const bodyText = await response.text().catch(() => '');
  expect(
    response.status(),
    `Subscription extend must stay below 500. body=${bodyText.slice(0, 500)}`,
  ).toBeLessThan(500);
  if (![200, 201].includes(response.status())) {
    throw new Error(
      `Subscription extend failed. status=${response.status()} body=${bodyText.slice(0, 500)}`,
    );
  }
}

async function assertAllowedPage(page: Page, path: string, headingPattern: RegExp) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  expect(page.url(), `Expected ${path} to stay accessible`).not.toContain('/unauthorized');
  expect(page.url(), `Expected ${path} to stay authenticated`).not.toContain('/login');
  await expect(page.getByRole('heading', { name: headingPattern }).first()).toBeVisible();
}

async function assertUnauthorizedPage(page: Page, path: string, expectedAddon: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  expect(page.url(), `Expected ${path} to be denied`).toContain('/unauthorized');
  expect(page.url(), `Unauthorized redirect must explain addon lock for ${path}`).toContain(
    `addon=${expectedAddon}`,
  );
}

test.describe.serial('billing lifecycle entitlement walkthrough', () => {
  test('premium pages react correctly to addon removal, expiry, restore, and extend', async ({
    page,
    request,
  }) => {
    const adminSession = await getAdminTenantSession(request);
    expect(adminSession.tenantId, 'ADMIN_TENANT audit account must have tenant id').toBeTruthy();
    const tenantId = adminSession.tenantId as string;
    const superHeaders = await getSuperAdminHeadersForTenant(request, tenantId);

    try {
      await setTenantSubscriptionState(request, superHeaders, tenantId, 'PRO', new Date(Date.now() + 45 * 24 * 60 * 60 * 1000));
      await addAnalyticsAddon(request, adminSession.headers);

      await loginAsRole(page, request, 'ADMIN_TENANT');
      await assertAllowedPage(page, '/app/subscription', /Langganan/i);
      await assertAllowedPage(page, '/app/addons', /Manajemen Add-on|Katalog Addon|Katalog Add-on/i);
      await assertAllowedPage(page, '/app/discounts', /Diskon/i);
      await assertAllowedPage(page, '/app/analytics', /Advanced Analytics|Analytics/i);

      await removeAnalyticsAddon(request, adminSession.headers);
      await assertAllowedPage(page, '/app/discounts', /Diskon/i);
      await assertUnauthorizedPage(page, '/app/analytics', 'BUSINESS_ANALYTICS');

      await setTenantSubscriptionState(request, superHeaders, tenantId, 'PRO', new Date(Date.now() - 24 * 60 * 60 * 1000));
      const expiredSnapshot = await getSubscriptionSnapshot(request, adminSession.headers);
      expect(expiredSnapshot.effectivePlan, 'Expired PRO must fall back to BASIC').toBe('BASIC');
      await assertAllowedPage(page, '/app/subscription', /Langganan/i);
      await expect(page.getByText(/Kedaluwarsa/i)).toBeVisible();
      await assertUnauthorizedPage(page, '/app/discounts', 'DISCOUNTS');
      await assertUnauthorizedPage(page, '/app/analytics', 'BUSINESS_ANALYTICS');

      await setTenantSubscriptionState(request, superHeaders, tenantId, 'PRO', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      const restoredBeforeExtend = await getSubscriptionSnapshot(request, adminSession.headers);
      expect(restoredBeforeExtend.effectivePlan, 'Restored PRO must be active again').toBe('PRO');
      await assertAllowedPage(page, '/app/discounts', /Diskon/i);
      await assertUnauthorizedPage(page, '/app/analytics', 'BUSINESS_ANALYTICS');

      await addAnalyticsAddon(request, adminSession.headers);
      await assertAllowedPage(page, '/app/analytics', /Advanced Analytics|Analytics/i);

      const beforeExtendTime = new Date(
        restoredBeforeExtend.subscriptionEnd || new Date().toISOString(),
      ).getTime();
      await extendTenantSubscription(request, adminSession.headers, 15);
      const afterExtend = await getSubscriptionSnapshot(request, adminSession.headers);
      const afterExtendTime = new Date(afterExtend.subscriptionEnd || new Date().toISOString()).getTime();
      expect(afterExtend.effectivePlan, 'Extended subscription must stay PRO').toBe('PRO');
      expect(afterExtendTime, 'Extend must move subscription end forward').toBeGreaterThan(beforeExtendTime);
      await assertAllowedPage(page, '/app/subscription', /Langganan/i);
      await assertAllowedPage(page, '/app/addons', /Manajemen Add-on|Katalog Addon|Katalog Add-on/i);
      await assertAllowedPage(page, '/app/discounts', /Diskon/i);
      await assertAllowedPage(page, '/app/analytics', /Advanced Analytics|Analytics/i);
    } finally {
      await setTenantSubscriptionState(request, superHeaders, tenantId, 'PRO', new Date(Date.now() + 45 * 24 * 60 * 60 * 1000));
      await addAnalyticsAddon(request, adminSession.headers);
    }
  });
});
