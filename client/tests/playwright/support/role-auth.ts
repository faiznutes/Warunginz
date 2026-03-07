import { expect, type APIRequestContext, type Page } from '@playwright/test';

export type Role = 'SUPER_ADMIN' | 'ADMIN_TENANT' | 'SUPERVISOR' | 'CASHIER' | 'KITCHEN';

export type AuthSession = {
  token: string;
  user: any;
  tenantId: string | null;
  storeId: string | null;
  headers: Record<string, string>;
};

const SINGLE_PAYLOAD_KEYS = new Set(['data', 'success', 'message', 'code', 'status']);
const LOGIN_MAX_ATTEMPTS = 6;

export const ROLE_PASSWORD = process.env.PLAYWRIGHT_ROLE_PASSWORD || 'Password123!';
export const API_BASE_URL = process.env.PLAYWRIGHT_API_BASE_URL || 'http://127.0.0.1:3000/api';

export const ROLE_EMAILS: Record<Role, string> = {
  SUPER_ADMIN: process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL || 'superadmin.audit@example.com',
  ADMIN_TENANT: process.env.PLAYWRIGHT_ADMIN_TENANT_EMAIL || 'admin.audit@example.com',
  SUPERVISOR: process.env.PLAYWRIGHT_SUPERVISOR_EMAIL || 'supervisor.audit@example.com',
  CASHIER: process.env.PLAYWRIGHT_CASHIER_EMAIL || 'cashier.audit@example.com',
  KITCHEN: process.env.PLAYWRIGHT_KITCHEN_EMAIL || 'kitchen.audit@example.com',
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

export function unwrapApiPayload<T>(input: unknown): T | null {
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

export async function loginPayloadWithRetry(
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

export async function loginForApi(
  request: APIRequestContext,
  role: Role,
): Promise<AuthSession> {
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

export async function getCurrentStoreShift(
  request: APIRequestContext,
  session: AuthSession,
) {
  if (!session.storeId) return null;
  const response = await request.get(
    `${API_BASE_URL}/store-shift/current?outletId=${encodeURIComponent(session.storeId)}`,
    {
      headers: session.headers,
    },
  );
  expect(response.status(), 'Store shift current endpoint must not fail with 5xx').toBeLessThan(
    500,
  );
  const payload = await response.json().catch(() => null);
  return unwrapApiPayload<any>(payload);
}

export async function openStoreShiftIfNeeded(
  request: APIRequestContext,
  session: AuthSession,
): Promise<{ shift: any; openedByTest: boolean }> {
  const currentShift = await getCurrentStoreShift(request, session);
  if (currentShift?.id) {
    return { shift: currentShift, openedByTest: false };
  }

  expect(session.storeId, 'Store-scoped test account must have assigned store').toBeTruthy();
  const openResponse = await request.post(`${API_BASE_URL}/store-shift/open`, {
    headers: session.headers,
    data: {
      outletId: session.storeId,
      shiftType: 'audit',
      modalAwal: 100000,
      catatan: 'Playwright audit open store shift',
    },
  });
  expect(openResponse.ok(), 'Failed to open store shift for audit smoke').toBeTruthy();
  const payload = await openResponse.json().catch(() => null);
  const shift = unwrapApiPayload<any>(payload);
  expect(shift?.id, 'Opened store shift must return id').toBeTruthy();
  return { shift, openedByTest: true };
}

export async function getCurrentCashShift(
  request: APIRequestContext,
  session: AuthSession,
) {
  const response = await request.get(`${API_BASE_URL}/cash-shift/current`, {
    headers: session.headers,
  });
  expect(response.status(), 'Cash shift current endpoint must not fail with 5xx').toBeLessThan(
    500,
  );
  const payload = await response.json().catch(() => null);
  return unwrapApiPayload<any>(payload);
}

export async function openCashShiftIfNeeded(
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
  expect(openResponse.ok(), 'Failed to open cash shift for audit smoke').toBeTruthy();
  const payload = await openResponse.json().catch(() => null);
  const shift = unwrapApiPayload<any>(payload);
  expect(shift?.id, 'Opened cash shift must return id').toBeTruthy();
  return { shift, openedByTest: true };
}

export async function closeCashShiftIfOpen(
  request: APIRequestContext,
  session: AuthSession,
) {
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

export async function closeStoreShiftById(
  request: APIRequestContext,
  session: AuthSession,
  shiftId: string,
) {
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

export async function loginAsRole(
  page: Page,
  request: APIRequestContext,
  role: Role,
) {
  const payload = await loginPayloadWithRetry(request, role);
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
