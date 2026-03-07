#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

for (const envFile of [".env", ".env.local", "nest/.env"]) {
  require("dotenv").config({ path: path.resolve(__dirname, "..", envFile) });
}

const ROOT = path.resolve(__dirname, "..");
const DIST_MAIN = path.join(ROOT, "nest", "dist", "main.js");
const REPORT_PATH = path.join(ROOT, "AUDIT_RUNTIME_CRITICAL_ENDPOINTS.md");
const REPORT_JSON_PATH = path.join(ROOT, "AUDIT_RUNTIME_CRITICAL_ENDPOINTS.json");
const PORT = process.env.AUDIT_RUNTIME_PORT || "3107";
const BASE_URL = `http://127.0.0.1:${PORT}`;

const ROLE_CREDENTIALS = {
  SUPER_ADMIN: { email: "superadmin.audit@example.com", password: "Password123!" },
  ADMIN_TENANT: { email: "admin.audit@example.com", password: "Password123!" },
  SUPERVISOR: { email: "supervisor.audit@example.com", password: "Password123!" },
  CASHIER: { email: "cashier.audit@example.com", password: "Password123!" },
  KITCHEN: { email: "kitchen.audit@example.com", password: "Password123!" },
};

const ROLE_ORDER = [
  "GUEST",
  "SUPER_ADMIN",
  "ADMIN_TENANT",
  "SUPERVISOR",
  "CASHIER",
  "KITCHEN",
];

const EXPECT = {
  ALLOW: "ALLOW",
  DENY: "DENY",
  UNAUTH: "UNAUTH",
  SKIP: "SKIP",
  TENANT_MATCH: "TENANT_MATCH",
  TENANT_LOCKED: "TENANT_LOCKED",
};

function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function unwrapResponse(payload) {
  if (
    payload &&
    typeof payload === "object" &&
    payload.success === true &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    return payload.data;
  }
  return payload;
}

function extractCollection(payload) {
  const unwrapped = unwrapResponse(payload);
  if (Array.isArray(unwrapped)) return unwrapped;
  if (unwrapped && Array.isArray(unwrapped.data)) return unwrapped.data;
  return [];
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(maxWaitMs = 45000) {
  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return true;
    } catch {
      // keep waiting
    }
    await sleep(750);
  }
  return false;
}

async function request({ method, path: requestPath, token, headers, body }) {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(headers || {}),
  };
  if (token) {
    mergedHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${requestPath}`, {
    method,
    headers: mergedHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  return {
    status: response.status,
    bodyText: text,
    bodyJson: safeJsonParse(text),
  };
}

function isPass(expectation, status) {
  if (Array.isArray(expectation)) {
    return expectation.includes(status);
  }
  if (typeof expectation === "number") {
    return status === expectation;
  }
  if (expectation === EXPECT.ALLOW) {
    return status >= 200 && status < 500 && status !== 401 && status !== 403;
  }
  if (expectation === EXPECT.DENY) {
    return status === 403;
  }
  if (expectation === EXPECT.UNAUTH) {
    return status === 401;
  }
  if (expectation === EXPECT.TENANT_MATCH || expectation === EXPECT.TENANT_LOCKED) {
    return status === 200;
  }
  return true;
}

function expectationForRole(expectMap, role) {
  if (!expectMap || typeof expectMap !== "object") return EXPECT.SKIP;
  return expectMap[role] || EXPECT.SKIP;
}

function formatResultRow(result) {
  const expectedText = Array.isArray(result.expected)
    ? result.expected.join("/")
    : result.expected;
  return `| ${result.scenario} | ${result.role} | ${result.apiKey || "-"} | ${expectedText} | ${result.status} | ${result.pass ? "PASS" : "FAIL"} |`;
}

function resolveTenantId(payload) {
  const data = unwrapResponse(payload);
  if (!data || typeof data !== "object") return null;
  return data.id || data.tenantId || null;
}

function asNonEmptyString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeStoreIdArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asNonEmptyString(item))
    .filter((item) => Boolean(item));
}

function allowedOutletIdsForRole(role, authByRole) {
  const roleAuth = authByRole[role];
  const permissions =
    roleAuth?.user?.permissions && typeof roleAuth.user.permissions === "object"
      ? roleAuth.user.permissions
      : {};

  if (role === "CASHIER" || role === "KITCHEN") {
    const assigned =
      asNonEmptyString(roleAuth?.user?.assignedStoreId) ||
      asNonEmptyString(permissions.assignedStoreId);
    return assigned ? [assigned] : [];
  }

  if (role === "SUPERVISOR") {
    return normalizeStoreIdArray(permissions.allowedStoreIds);
  }

  return [];
}

async function main() {
  const seedResult = spawnSync('node "scripts/seed-role-readiness.js"', {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    env: process.env,
  });
  if (seedResult.status !== 0) {
    const output = `${seedResult.stdout || ""}${seedResult.stderr || ""}`.trim();
    throw new Error(`Role readiness seed failed before runtime audit.\n${output}`);
  }

  if (!fs.existsSync(DIST_MAIN)) {
    throw new Error(
      "Backend dist entry not found at nest/dist/main.js. Run `npm run build` first.",
    );
  }

  const backend = spawn("node", [DIST_MAIN], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT,
      NODE_ENV: process.env.NODE_ENV || "production",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const backendLogs = [];
  backend.stdout.on("data", (chunk) => {
    backendLogs.push(chunk.toString());
    if (backendLogs.length > 200) backendLogs.shift();
  });
  backend.stderr.on("data", (chunk) => {
    backendLogs.push(chunk.toString());
    if (backendLogs.length > 200) backendLogs.shift();
  });

  try {
    const healthy = await waitForHealth();
    if (!healthy) {
      throw new Error("Backend server did not become healthy within timeout.");
    }

    const auth = {};
    for (const [role, creds] of Object.entries(ROLE_CREDENTIALS)) {
      const loginRes = await request({
        method: "POST",
        path: "/api/auth/login",
        body: { email: creds.email, password: creds.password },
      });
      if (loginRes.status !== 201 && loginRes.status !== 200) {
        throw new Error(
          `Login failed for ${role} (${creds.email}) with status ${loginRes.status}.`,
        );
      }
      const loginData = unwrapResponse(loginRes.bodyJson);
      auth[role] = {
        token: loginData?.token,
        user: loginData?.user || null,
      };
      if (!auth[role].token) {
        throw new Error(`Login succeeded but token missing for role ${role}.`);
      }
    }

    const superToken = auth.SUPER_ADMIN.token;
    const tenantsRes = await request({
      method: "GET",
      path: "/api/tenants",
      token: superToken,
    });
    const tenantList = extractCollection(tenantsRes.bodyJson);
    const primaryTenantId =
      auth.SUPER_ADMIN.user?.tenantId || tenantList[0]?.id || null;
    const secondaryTenantId = tenantList.find((t) => t.id !== primaryTenantId)?.id;

    const outletsRes = await request({
      method: "GET",
      path: "/api/outlets",
      token: superToken,
    });
    const outlets = extractCollection(outletsRes.bodyJson);
    const namedPrimaryOutlet =
      outlets.find((item) => item?.name === "Audit Store Primary") || null;
    const namedSecondaryOutlet =
      outlets.find((item) => item?.name === "Audit Store Secondary") || null;
    const primaryOutletId = namedPrimaryOutlet?.id || outlets[0]?.id || null;
    const forbiddenOutletId =
      namedSecondaryOutlet?.id ||
      outlets.find((item) => item.id !== primaryOutletId)?.id ||
      null;
    const forbiddenOutletByRole = {};
    for (const role of ["SUPERVISOR", "CASHIER", "KITCHEN"]) {
      const allowedOutletIds = allowedOutletIdsForRole(role, auth);
      forbiddenOutletByRole[role] =
        outlets.find((item) => !allowedOutletIds.includes(item.id))?.id || null;
    }

    const context = {
      primaryTenantId,
      secondaryTenantId: secondaryTenantId || null,
      primaryOutletId,
      forbiddenOutletId,
      forbiddenOutletByRole,
      missingUuid: "00000000-0000-0000-0000-000000000000",
      tenantByRole: {
        SUPER_ADMIN: auth.SUPER_ADMIN.user?.tenantId || null,
        ADMIN_TENANT: auth.ADMIN_TENANT.user?.tenantId || null,
        SUPERVISOR: auth.SUPERVISOR.user?.tenantId || null,
        CASHIER: auth.CASHIER.user?.tenantId || null,
        KITCHEN: auth.KITCHEN.user?.tenantId || null,
      },
    };

    const scenarios = [
      {
        id: "auth-me",
        method: "GET",
        apiKey: "GET /auth/me",
        critical: true,
        path: () => "/api/auth/me",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.ALLOW,
          KITCHEN: EXPECT.ALLOW,
        },
      },
      {
        id: "dashboard-stats",
        method: "GET",
        apiKey: "GET /dashboard/stats",
        critical: true,
        path: () => "/api/dashboard/stats",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.ALLOW,
          KITCHEN: EXPECT.ALLOW,
        },
      },
      {
        id: "orders-list",
        method: "GET",
        apiKey: "GET /orders",
        critical: true,
        path: () => "/api/orders?limit=5",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.ALLOW,
          KITCHEN: EXPECT.ALLOW,
        },
      },
      {
        id: "orders-export",
        method: "GET",
        apiKey: "GET /orders/export",
        critical: true,
        path: () => "/api/orders/export?limit=5",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "orders-status-update",
        method: "PUT",
        apiKey: "PUT /orders/:id/status",
        critical: true,
        path: (ctx) => `/api/orders/${ctx.missingUuid}/status`,
        body: () => ({ status: "COMPLETED" }),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.ALLOW,
          KITCHEN: EXPECT.ALLOW,
        },
      },
      {
        id: "orders-bulk-delete",
        method: "POST",
        apiKey: "POST /orders/bulk-delete",
        critical: true,
        path: () => "/api/orders/bulk-delete",
        body: () => ({ orderIds: [] }),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "orders-bulk-refund",
        method: "POST",
        apiKey: "POST /orders/bulk-refund",
        critical: true,
        path: () => "/api/orders/bulk-refund",
        body: () => ({ orderIds: [] }),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "orders-delete",
        method: "DELETE",
        apiKey: "DELETE /orders/:id",
        critical: true,
        path: (ctx) => `/api/orders/${ctx.missingUuid}`,
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "products-list",
        method: "GET",
        apiKey: "GET /products",
        critical: true,
        path: () => "/api/products?limit=5",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.ALLOW,
          KITCHEN: EXPECT.ALLOW,
        },
      },
      {
        id: "products-create-contract",
        method: "POST",
        apiKey: "POST /products",
        critical: true,
        path: () => "/api/products",
        body: () => ({}),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "products-update-contract",
        method: "PUT",
        apiKey: "PUT /products/:id",
        critical: true,
        path: (ctx) => `/api/products/${ctx.missingUuid}`,
        body: () => ({}),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "products-delete-contract",
        method: "DELETE",
        apiKey: "DELETE /products/:id",
        critical: true,
        path: (ctx) => `/api/products/${ctx.missingUuid}`,
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "customers-list",
        method: "GET",
        apiKey: "GET /customers",
        critical: true,
        path: () => "/api/customers?limit=5",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.ALLOW,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "customers-create-contract",
        method: "POST",
        apiKey: "POST /customers",
        critical: true,
        path: () => "/api/customers",
        body: () => ({}),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.ALLOW,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "customers-update-contract",
        method: "PUT",
        apiKey: "PUT /customers/:id",
        critical: true,
        path: (ctx) => `/api/customers/${ctx.missingUuid}`,
        body: () => ({}),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.ALLOW,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "customers-delete",
        method: "DELETE",
        apiKey: "DELETE /customers/:id",
        critical: true,
        path: (ctx) => `/api/customers/${ctx.missingUuid}`,
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "users-list",
        method: "GET",
        apiKey: "GET /users",
        critical: true,
        path: () => "/api/users?limit=5",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "users-create-contract",
        method: "POST",
        apiKey: "POST /users",
        critical: true,
        path: () => "/api/users",
        body: () => ({}),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.DENY,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "users-update-contract",
        method: "PUT",
        apiKey: "PUT /users/:id",
        critical: true,
        path: (ctx) => `/api/users/${ctx.missingUuid}`,
        body: () => ({}),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.DENY,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "users-delete-contract",
        method: "DELETE",
        apiKey: "DELETE /users/:id",
        critical: true,
        path: (ctx) => `/api/users/${ctx.missingUuid}`,
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.DENY,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "outlets-list",
        method: "GET",
        apiKey: "GET /outlets",
        critical: true,
        path: () => "/api/outlets",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "outlets-create-contract",
        method: "POST",
        apiKey: "POST /outlets",
        critical: true,
        path: () => "/api/outlets",
        body: () => ({}),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.DENY,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "outlets-update-contract",
        method: "PUT",
        apiKey: "PUT /outlets/:id",
        critical: true,
        path: (ctx) => `/api/outlets/${ctx.missingUuid}`,
        body: () => ({}),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "outlets-delete-contract",
        method: "DELETE",
        apiKey: "DELETE /outlets/:id",
        critical: true,
        path: (ctx) => `/api/outlets/${ctx.missingUuid}`,
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.DENY,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "outlets-active",
        method: "GET",
        apiKey: "GET /outlets/active",
        critical: true,
        path: () => "/api/outlets/active",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.ALLOW,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "delivery-couriers-create",
        method: "POST",
        apiKey: "POST /delivery/couriers",
        critical: true,
        path: () => "/api/delivery/couriers",
        body: () => ({}),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.DENY,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "delivery-couriers-update",
        method: "PUT",
        apiKey: "PUT /delivery/couriers/:id",
        critical: true,
        path: (ctx) => `/api/delivery/couriers/${ctx.missingUuid}`,
        body: () => ({}),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.DENY,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "delivery-couriers-delete",
        method: "DELETE",
        apiKey: "DELETE /delivery/couriers/:id",
        critical: true,
        path: (ctx) => `/api/delivery/couriers/${ctx.missingUuid}`,
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.DENY,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "store-shift-current",
        method: "GET",
        apiKey: "GET /store-shift/current",
        critical: true,
        path: () => "/api/store-shift/current",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.ALLOW,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "cash-shift-current",
        method: "GET",
        apiKey: "GET /cash-shift/current",
        critical: true,
        path: () => "/api/cash-shift/current",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.ALLOW,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "settings-get",
        method: "GET",
        apiKey: "GET /settings",
        critical: true,
        path: () => "/api/settings",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "password-update",
        method: "POST",
        apiKey: "POST /password/update",
        critical: true,
        path: () => "/api/password/update",
        body: () => ({}),
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: [400],
          ADMIN_TENANT: [400],
          SUPERVISOR: [400],
          CASHIER: [400],
          KITCHEN: [400],
        },
      },
      {
        id: "2fa-status",
        method: "GET",
        apiKey: "GET /2fa/status",
        critical: true,
        path: () => "/api/2fa/status",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "tenants-list",
        method: "GET",
        apiKey: "GET /tenants",
        critical: true,
        path: () => "/api/tenants",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.DENY,
          SUPERVISOR: EXPECT.DENY,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "tenants-detail",
        method: "GET",
        apiKey: "GET /tenants/:id",
        critical: true,
        path: (ctx) =>
          ctx.primaryTenantId ? `/api/tenants/${ctx.primaryTenantId}` : "/api/tenants",
        skip: (ctx) => !ctx.primaryTenantId,
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.DENY,
          SUPERVISOR: EXPECT.DENY,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "superadmin-backups",
        method: "GET",
        apiKey: "GET /superadmin/backups",
        critical: true,
        path: () => "/api/superadmin/backups",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.DENY,
          SUPERVISOR: EXPECT.DENY,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "payment-status",
        method: "GET",
        apiKey: "GET /payment/status/:orderId",
        critical: true,
        path: () => "/api/payment/status/ORDER-AUDIT-0001",
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.ALLOW,
          CASHIER: EXPECT.ALLOW,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "orders-store-scope-forged",
        method: "GET",
        apiKey: "GET /orders?outletId=:foreign",
        critical: true,
        path: (ctx, role) =>
          `/api/orders?limit=5&outletId=${ctx.forbiddenOutletByRole?.[role] || ctx.forbiddenOutletId}`,
        skip: (ctx, role) =>
          role !== "SUPER_ADMIN" &&
          role !== "ADMIN_TENANT" &&
          !ctx.forbiddenOutletByRole?.[role] &&
          !ctx.forbiddenOutletId,
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.ALLOW,
          ADMIN_TENANT: EXPECT.ALLOW,
          SUPERVISOR: EXPECT.DENY,
          CASHIER: EXPECT.DENY,
          KITCHEN: EXPECT.DENY,
        },
      },
      {
        id: "tenant-forged-header-lock",
        method: "GET",
        apiKey: "GET /tenant/profile[forged-header]",
        critical: true,
        path: () => "/api/tenant/profile",
        headers: (ctx) => ({ "X-Tenant-Id": ctx.secondaryTenantId }),
        skip: (ctx) => !ctx.secondaryTenantId,
        expect: {
          GUEST: EXPECT.UNAUTH,
          SUPER_ADMIN: EXPECT.SKIP,
          ADMIN_TENANT: EXPECT.TENANT_LOCKED,
          SUPERVISOR: EXPECT.TENANT_LOCKED,
          CASHIER: EXPECT.TENANT_LOCKED,
          KITCHEN: EXPECT.TENANT_LOCKED,
        },
        assert: ({ context: ctx, role, response }) => {
          const resolvedTenantId = resolveTenantId(response.bodyJson);
          return resolvedTenantId && resolvedTenantId === ctx.tenantByRole[role];
        },
      },
    ];

    const results = [];

    for (const scenario of scenarios) {
      for (const role of ROLE_ORDER) {
        const shouldSkip =
          typeof scenario.skip === "function" && scenario.skip(context, role);
        if (shouldSkip) {
          results.push({
            scenario: scenario.id,
            role,
            apiKey: scenario.apiKey || null,
            critical: !!scenario.critical,
            expected: EXPECT.SKIP,
            status: "-",
            pass: true,
          });
          continue;
        }

        const expected = expectationForRole(scenario.expect, role);
        if (expected === EXPECT.SKIP) {
          results.push({
            scenario: scenario.id,
            role,
            apiKey: scenario.apiKey || null,
            critical: !!scenario.critical,
            expected,
            status: "-",
            pass: true,
          });
          continue;
        }

        const token = role === "GUEST" ? null : auth[role]?.token;
        const response = await request({
          method: scenario.method,
          path: scenario.path(context, role),
          token,
          headers:
            typeof scenario.headers === "function"
              ? scenario.headers(context, role)
              : scenario.headers,
          body: typeof scenario.body === "function" ? scenario.body(context, role) : undefined,
        });

        let pass = isPass(expected, response.status);
        if (pass && typeof scenario.assert === "function") {
          const shouldRunAssert =
            expected === EXPECT.TENANT_LOCKED ||
            expected === EXPECT.TENANT_MATCH ||
            scenario.assertForAll === true;
          if (shouldRunAssert) {
            pass = !!scenario.assert({
              scenario,
              role,
              expected,
              response,
              context,
              auth,
            });
          }
        }

        results.push({
          scenario: scenario.id,
          role,
          apiKey: scenario.apiKey || null,
          critical: !!scenario.critical,
          expected,
          status: response.status,
          pass,
          body: response.bodyJson || response.bodyText,
        });
      }
    }

    if (context.secondaryTenantId) {
      const switched = await request({
        method: "GET",
        path: "/api/tenant/profile",
        token: superToken,
        headers: { "X-Tenant-Id": context.secondaryTenantId },
      });
      const resolvedTenantId = resolveTenantId(switched.bodyJson);
      results.push({
        scenario: "tenant-switch-header",
        role: "SUPER_ADMIN",
        apiKey: "GET /tenant/profile[switch-header]",
        critical: true,
        expected: EXPECT.TENANT_MATCH,
        status: switched.status,
        pass: switched.status === 200 && resolvedTenantId === context.secondaryTenantId,
        body: switched.bodyJson || switched.bodyText,
      });
    }

    const checked = results.filter((r) => r.expected !== EXPECT.SKIP);
    const failed = checked.filter((r) => !r.pass);

    const lines = [];
    lines.push("# AUDIT RUNTIME CRITICAL ENDPOINTS");
    lines.push("");
    lines.push(`Generated: ${nowIso()}`);
    lines.push("");
    lines.push("## Scope");
    lines.push("");
    lines.push("- API-centric runtime permission checks for critical endpoints.");
    lines.push("- Status semantics validated: expected `200/400/404` for allowed, `401/403` for denied.");
    lines.push("- Includes tenant/store forged-context checks and SUPER_ADMIN tenant-switch assertion.");
    lines.push("");
    lines.push("## Summary");
    lines.push("");
    lines.push(`- Base URL: \`${BASE_URL}/api\``);
    lines.push(`- Total checks: ${checked.length}`);
    lines.push(`- Passed: ${checked.length - failed.length}`);
    lines.push(`- Failed: ${failed.length}`);
    lines.push("");
    lines.push("## Result Matrix");
    lines.push("");
    lines.push("| Scenario | Role | API Key | Expected | Actual Status | Result |");
    lines.push("|---|---|---|---|---:|---|");
    for (const row of checked) {
      lines.push(formatResultRow(row));
    }
    lines.push("");
    lines.push("## Failures");
    lines.push("");
    if (failed.length === 0) {
      lines.push("- None");
    } else {
      for (const row of failed) {
        lines.push(
          `- ${row.scenario} | role=${row.role} | api=${row.apiKey || "-"} | expected=${row.expected} | actual=${row.status}`,
        );
        if (row.body) {
          const bodyText =
            typeof row.body === "string"
              ? row.body
              : JSON.stringify(row.body);
          lines.push("```text");
          lines.push(bodyText.slice(0, 1200));
          lines.push("```");
        }
      }
    }

    fs.writeFileSync(REPORT_PATH, lines.join("\n"));
    console.log(`Report written: ${REPORT_PATH}`);

    const jsonReport = {
      generatedAt: nowIso(),
      baseUrl: `${BASE_URL}/api`,
      summary: {
        total: checked.length,
        passed: checked.length - failed.length,
        failed: failed.length,
      },
      context: {
        primaryTenantId: context.primaryTenantId,
        secondaryTenantId: context.secondaryTenantId,
        primaryOutletId: context.primaryOutletId,
        forbiddenOutletId: context.forbiddenOutletId,
        forbiddenOutletByRole: context.forbiddenOutletByRole,
      },
      results: checked.map((row) => ({
        scenario: row.scenario,
        role: row.role,
        apiKey: row.apiKey,
        critical: row.critical,
        expected: row.expected,
        status: row.status,
        pass: row.pass,
      })),
    };
    fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(jsonReport, null, 2)}\n`);
    console.log(`Report written: ${REPORT_JSON_PATH}`);

    if (failed.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    backend.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error("Runtime critical endpoint audit failed:", error.message);
  process.exitCode = 1;
});
