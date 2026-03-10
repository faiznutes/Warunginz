#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../nest/src/generated/client");
const { runCommand } = require("./utils/run-command");

for (const envFile of [".env", ".env.local", "nest/.env"]) {
  require("dotenv").config({ path: path.resolve(__dirname, "..", envFile) });
}

const ROOT = path.resolve(__dirname, "..");
const DIST_MAIN = path.join(ROOT, "nest", "dist", "main.js");
const REPORT_MD = path.join(ROOT, "AUDIT_BUSINESS_RULES.md");
const REPORT_JSON = path.join(ROOT, "AUDIT_BUSINESS_RULES.json");
const PORT = process.env.AUDIT_BUSINESS_RULES_PORT || "3108";
const BASE_URL = `http://127.0.0.1:${PORT}`;

const prisma = new PrismaClient();

const TEMP_TENANT = {
  slug: "audit-business-rules",
  name: "Audit Business Rules Tenant",
  email: "audit-business-rules@example.com",
  adminEmail: "businessrule.admin@example.com",
  adminPassword: "Password123!",
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

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(maxWaitMs = 45000) {
  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.ok) {
        return true;
      }
    } catch {
      // keep waiting
    }
    await sleep(750);
  }
  return false;
}

async function request({ method, requestPath, token, body }) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${requestPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const bodyText = await response.text();
  return {
    status: response.status,
    bodyText,
    bodyJson: safeJsonParse(bodyText),
  };
}

async function login(email, password) {
  const response = await request({
    method: "POST",
    requestPath: "/api/auth/login",
    body: { email, password },
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(`Login failed for ${email} with status ${response.status}`);
  }

  const payload = unwrapResponse(response.bodyJson);
  const token = payload?.token;
  if (!token) {
    throw new Error(`Login response for ${email} did not contain token`);
  }

  return {
    token,
    user: payload?.user || null,
  };
}

async function ensureBackendDist() {
  if (fs.existsSync(DIST_MAIN)) {
    return;
  }

  const build = runCommand("npm run build", {
    cwd: ROOT,
    env: process.env,
  });

  if (build.status !== 0 || !fs.existsSync(DIST_MAIN)) {
    throw new Error(`Build required for business rules audit but failed.\n${(build.stdout || "") + (build.stderr || "")}`);
  }
}

async function cleanupTempTenant() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: TEMP_TENANT.slug },
    select: { id: true },
  });

  if (!tenant) {
    return;
  }

  await prisma.subscriptionHistory.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.subscription.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.tenantAddon.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.discount.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.report.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.customer.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.member.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.cashShift.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.storeShift.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.user.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.product.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.outlet.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.tenant.delete({ where: { id: tenant.id } });
}

async function setupTempTenantFixture() {
  await cleanupTempTenant();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 45);
  const expiredEndDate = new Date();
  expiredEndDate.setDate(expiredEndDate.getDate() - 1);

  const tenant = await prisma.tenant.create({
    data: {
      name: TEMP_TENANT.name,
      slug: TEMP_TENANT.slug,
      email: TEMP_TENANT.email,
      isActive: true,
      subscriptionPlan: "PRO",
      previousPlan: "BASIC",
      subscriptionStart: startDate,
      subscriptionEnd: expiredEndDate,
      temporaryUpgrade: false,
    },
  });

  const outlet = await prisma.outlet.create({
    data: {
      tenantId: tenant.id,
      name: "Business Rule Primary Outlet",
      address: "Jl. Business Rule No. 1",
      phone: "081230001111",
      isActive: true,
    },
  });

  const hashedPassword = await bcrypt.hash(TEMP_TENANT.adminPassword, 10);
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: TEMP_TENANT.adminEmail,
      password: hashedPassword,
      name: "Business Rule Admin",
      role: "ADMIN_TENANT",
      isActive: true,
      permissions: {},
    },
  });

  const products = Array.from({ length: 100 }, (_, index) => ({
    tenantId: tenant.id,
    name: `Quota Product ${index + 1}`,
    sku: `BRP-${String(index + 1).padStart(3, "0")}`,
    barcode: `BRPBAR${String(index + 1).padStart(4, "0")}`,
    price: 10000 + index,
    cost: 4000 + index,
    stock: 20,
    minStock: 2,
    category: "Quota",
    isActive: true,
    isConsignment: false,
  }));

  await prisma.product.createMany({ data: products });

  return { tenant, outlet };
}

function scenarioResult({ id, category, title, expected, status, pass, detail }) {
  return { id, category, title, expected, status, pass, detail };
}

function isSuccessStatus(status) {
  return status === 200 || status === 201;
}

function toTime(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

function formatSnapshot(data) {
  return JSON.stringify({
    currentPlan: data?.currentPlan,
    effectivePlan: data?.effectivePlan,
    subscriptionExpired: data?.subscriptionExpired,
    subscriptionEnd: data?.subscriptionEnd,
    entitlements: data?.entitlements || [],
    limits: data?.limits || {},
    activeAddons: Array.isArray(data?.activeAddons)
      ? data.activeAddons.map((addon) => addon?.addonId || addon?.addonType || addon?.id)
      : [],
  });
}

async function getSubscriptionSnapshot(token) {
  const response = await request({
    method: "GET",
    requestPath: "/api/subscriptions/current",
    token,
  });

  const data = unwrapResponse(response.bodyJson);
  const entitlements = Array.isArray(data?.entitlements)
    ? data.entitlements.map((item) => String(item).toUpperCase())
    : [];
  const activeAddonIds = Array.isArray(data?.activeAddons)
    ? data.activeAddons
        .map((addon) => String(addon?.addonId || addon?.addonType || "").trim())
        .filter(Boolean)
    : [];

  return {
    response,
    data,
    entitlements,
    activeAddonIds,
  };
}
async function main() {
  const results = [];
  let backend = null;
  let tempContext = null;

  try {
    await ensureBackendDist();

    const seed = runCommand("node scripts/seed-role-readiness.js", {
      cwd: ROOT,
      env: process.env,
    });
    if (seed.status !== 0) {
      throw new Error(`Role readiness seed failed before business rule audit.\n${(seed.stdout || "") + (seed.stderr || "")}`);
    }

    tempContext = await setupTempTenantFixture();

    backend = spawn("node", [DIST_MAIN], {
      cwd: ROOT,
      env: {
        ...process.env,
        PORT,
        NODE_ENV: process.env.NODE_ENV || "production",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const backendLogs = [];
    const collect = (chunk) => {
      backendLogs.push(chunk.toString());
      if (backendLogs.length > 200) {
        backendLogs.shift();
      }
    };
    backend.stdout.on("data", collect);
    backend.stderr.on("data", collect);

    const healthy = await waitForHealth();
    if (!healthy) {
      throw new Error(`Backend server did not become healthy within timeout.\n${backendLogs.join("")}`);
    }

    const superAdminAuth = await login("superadmin.audit@example.com", "Password123!");
    const tenantAdminAuth = await login(TEMP_TENANT.adminEmail, TEMP_TENANT.adminPassword);

    const subscriptionSnapshot = await getSubscriptionSnapshot(tenantAdminAuth.token);
    const subscriptionRes = subscriptionSnapshot.response;
    const subscriptionData = subscriptionSnapshot.data;
    const entitlements = subscriptionSnapshot.entitlements;
    const subscriptionPass =
      subscriptionRes.status === 200 &&
      subscriptionData?.currentPlan === "PRO" &&
      subscriptionData?.effectivePlan === "BASIC" &&
      subscriptionData?.subscriptionExpired === true &&
      !entitlements.includes("BUSINESS_ANALYTICS") &&
      !entitlements.includes("DISCOUNTS");
    results.push(
      scenarioResult({
        id: "subscription-expired-fallback",
        category: "Feature Lock",
        title: "Expired plan falls back to BASIC entitlements",
        expected: "currentPlan=PRO, effectivePlan=BASIC, subscriptionExpired=true, no premium entitlements",
        status: subscriptionRes.status,
        pass: subscriptionPass,
        detail: subscriptionPass
          ? "Subscription current endpoint exposes fallback plan correctly for expired tenant."
          : `Unexpected payload: ${JSON.stringify(subscriptionData)}`,
      }),
    );

    const createUserRes = await request({
      method: "POST",
      requestPath: "/api/users",
      token: tenantAdminAuth.token,
      body: {
        name: "Quota Cashier",
        email: `quota-cashier-${Date.now()}@example.com`,
        role: "CASHIER",
        permissions: { assignedStoreId: tempContext.outlet.id },
      },
    });
    results.push(
      scenarioResult({
        id: "quota-users-api",
        category: "Quota",
        title: "User create is denied when plan user limit is exhausted",
        expected: "400 Bad Request with limit error",
        status: createUserRes.status,
        pass: createUserRes.status === 400,
        detail: createUserRes.bodyText,
      }),
    );

    const createOutletRes = await request({
      method: "POST",
      requestPath: "/api/outlets",
      token: tenantAdminAuth.token,
      body: {
        name: `Quota Outlet ${Date.now()}`,
        address: "Jl. Over Limit",
        phone: "081230009999",
      },
    });
    results.push(
      scenarioResult({
        id: "quota-outlets-api",
        category: "Quota",
        title: "Outlet create is denied when plan outlet limit is exhausted",
        expected: "400 Bad Request with limit error",
        status: createOutletRes.status,
        pass: createOutletRes.status === 400,
        detail: createOutletRes.bodyText,
      }),
    );

    const createProductRes = await request({
      method: "POST",
      requestPath: "/api/products",
      token: tenantAdminAuth.token,
      body: {
        name: `Quota Product Overflow ${Date.now()}`,
        price: 12000,
        cost: 5000,
        stock: 10,
        minStock: 1,
        category: "Quota",
        sku: `OVER-${Date.now()}`,
        barcode: `OVERBAR${Date.now()}`,
      },
    });
    results.push(
      scenarioResult({
        id: "quota-products-api",
        category: "Quota",
        title: "Product create is denied when plan product limit is exhausted",
        expected: "400 Bad Request with limit error",
        status: createProductRes.status,
        pass: createProductRes.status === 400,
        detail: createProductRes.bodyText,
      }),
    );

    const addUserAddonRes = await request({
      method: "POST",
      requestPath: "/api/subscriptions/addons",
      token: tenantAdminAuth.token,
      body: {
        addonId: "addon-users",
        purchasedBy: "AUDIT_BUSINESS_RULES",
      },
    });
    const userAddonSnapshot = await getSubscriptionSnapshot(tenantAdminAuth.token);
    const createUserWithAddonRes = await request({
      method: "POST",
      requestPath: "/api/users",
      token: tenantAdminAuth.token,
      body: {
        name: "Quota Cashier With Addon",
        email: `quota-cashier-addon-${Date.now()}@example.com`,
        role: "CASHIER",
        permissions: { assignedStoreId: tempContext.outlet.id },
      },
    });
    const userAddonPass =
      isSuccessStatus(addUserAddonRes.status) &&
      userAddonSnapshot.data?.limits?.users === 6 &&
      isSuccessStatus(createUserWithAddonRes.status);
    results.push(
      scenarioResult({
        id: "quota-users-addon-restores-capacity",
        category: "Addon Lifecycle",
        title: "User addon expands tenant user capacity",
        expected: "Addon add succeeds, users limit becomes 6, and one extra user can be created",
        status: createUserWithAddonRes.status,
        pass: userAddonPass,
        detail: userAddonPass
          ? formatSnapshot(userAddonSnapshot.data)
          : JSON.stringify({
              addAddonStatus: addUserAddonRes.status,
              createStatus: createUserWithAddonRes.status,
              snapshot: userAddonSnapshot.data,
            }),
      }),
    );

    const removeUserAddonRes = await request({
      method: "DELETE",
      requestPath: "/api/subscriptions/addons/addon-users",
      token: tenantAdminAuth.token,
    });
    const createUserAfterAddonRemovalRes = await request({
      method: "POST",
      requestPath: "/api/users",
      token: tenantAdminAuth.token,
      body: {
        name: "Quota Cashier After User Addon Removal",
        email: `quota-cashier-removed-${Date.now()}@example.com`,
        role: "CASHIER",
        permissions: { assignedStoreId: tempContext.outlet.id },
      },
    });
    results.push(
      scenarioResult({
        id: "quota-users-addon-removal-restores-lock",
        category: "Addon Lifecycle",
        title: "Removing user addon restores backend quota denial",
        expected: "Addon removal succeeds and a further user create returns 400",
        status: createUserAfterAddonRemovalRes.status,
        pass:
          removeUserAddonRes.status === 200 &&
          createUserAfterAddonRemovalRes.status === 400,
        detail: JSON.stringify({
          removeAddonStatus: removeUserAddonRes.status,
          createStatus: createUserAfterAddonRemovalRes.status,
          body: createUserAfterAddonRemovalRes.bodyText,
        }),
      }),
    );

    const addOutletAddonRes = await request({
      method: "POST",
      requestPath: "/api/subscriptions/addons",
      token: tenantAdminAuth.token,
      body: {
        addonId: "addon-outlets",
        purchasedBy: "AUDIT_BUSINESS_RULES",
      },
    });
    const outletAddonSnapshot = await getSubscriptionSnapshot(tenantAdminAuth.token);
    const createOutletWithAddonRes = await request({
      method: "POST",
      requestPath: "/api/outlets",
      token: tenantAdminAuth.token,
      body: {
        name: `Quota Outlet Addon ${Date.now()}`,
        address: "Jl. Addon Outlet",
        phone: "081230001212",
      },
    });
    const outletAddonPass =
      isSuccessStatus(addOutletAddonRes.status) &&
      outletAddonSnapshot.data?.limits?.outlets === 2 &&
      isSuccessStatus(createOutletWithAddonRes.status);
    results.push(
      scenarioResult({
        id: "quota-outlets-addon-restores-capacity",
        category: "Addon Lifecycle",
        title: "Outlet addon expands tenant outlet capacity",
        expected: "Addon add succeeds, outlet limit becomes 2, and one extra outlet can be created",
        status: createOutletWithAddonRes.status,
        pass: outletAddonPass,
        detail: outletAddonPass
          ? formatSnapshot(outletAddonSnapshot.data)
          : JSON.stringify({
              addAddonStatus: addOutletAddonRes.status,
              createStatus: createOutletWithAddonRes.status,
              snapshot: outletAddonSnapshot.data,
            }),
      }),
    );

    const removeOutletAddonRes = await request({
      method: "DELETE",
      requestPath: "/api/subscriptions/addons/addon-outlets",
      token: tenantAdminAuth.token,
    });
    const createOutletAfterAddonRemovalRes = await request({
      method: "POST",
      requestPath: "/api/outlets",
      token: tenantAdminAuth.token,
      body: {
        name: `Quota Outlet After Removal ${Date.now()}`,
        address: "Jl. Addon Removed",
        phone: "081230003434",
      },
    });
    results.push(
      scenarioResult({
        id: "quota-outlets-addon-removal-restores-lock",
        category: "Addon Lifecycle",
        title: "Removing outlet addon restores backend quota denial",
        expected: "Addon removal succeeds and a further outlet create returns 400",
        status: createOutletAfterAddonRemovalRes.status,
        pass:
          removeOutletAddonRes.status === 200 &&
          createOutletAfterAddonRemovalRes.status === 400,
        detail: JSON.stringify({
          removeAddonStatus: removeOutletAddonRes.status,
          createStatus: createOutletAfterAddonRemovalRes.status,
          body: createOutletAfterAddonRemovalRes.bodyText,
        }),
      }),
    );

    const addProductAddonRes = await request({
      method: "POST",
      requestPath: "/api/subscriptions/addons",
      token: tenantAdminAuth.token,
      body: {
        addonId: "addon-products",
        purchasedBy: "AUDIT_BUSINESS_RULES",
      },
    });
    const productAddonSnapshot = await getSubscriptionSnapshot(tenantAdminAuth.token);
    const createProductWithAddonRes = await request({
      method: "POST",
      requestPath: "/api/products",
      token: tenantAdminAuth.token,
      body: {
        name: `Quota Product With Addon ${Date.now()}`,
        price: 14000,
        cost: 6000,
        stock: 10,
        minStock: 1,
        category: "Quota",
        sku: `ADDON-PROD-${Date.now()}`,
        barcode: `ADDONBAR${Date.now()}`,
      },
    });
    const productAddonPass =
      isSuccessStatus(addProductAddonRes.status) &&
      productAddonSnapshot.data?.limits?.products === 600 &&
      isSuccessStatus(createProductWithAddonRes.status);
    results.push(
      scenarioResult({
        id: "quota-products-addon-restores-capacity",
        category: "Addon Lifecycle",
        title: "Product addon expands tenant product capacity",
        expected: "Addon add succeeds, product limit becomes 600, and one extra product can be created",
        status: createProductWithAddonRes.status,
        pass: productAddonPass,
        detail: productAddonPass
          ? formatSnapshot(productAddonSnapshot.data)
          : JSON.stringify({
              addAddonStatus: addProductAddonRes.status,
              createStatus: createProductWithAddonRes.status,
              snapshot: productAddonSnapshot.data,
            }),
      }),
    );

    const removeProductAddonRes = await request({
      method: "DELETE",
      requestPath: "/api/subscriptions/addons/addon-products",
      token: tenantAdminAuth.token,
    });
    const createProductAfterAddonRemovalRes = await request({
      method: "POST",
      requestPath: "/api/products",
      token: tenantAdminAuth.token,
      body: {
        name: `Quota Product After Removal ${Date.now()}`,
        price: 15000,
        cost: 6500,
        stock: 8,
        minStock: 1,
        category: "Quota",
        sku: `LOCK-PROD-${Date.now()}`,
        barcode: `LOCKBAR${Date.now()}`,
      },
    });
    results.push(
      scenarioResult({
        id: "quota-products-addon-removal-restores-lock",
        category: "Addon Lifecycle",
        title: "Removing product addon restores backend quota denial",
        expected: "Addon removal succeeds and a further product create returns 400",
        status: createProductAfterAddonRemovalRes.status,
        pass:
          removeProductAddonRes.status === 200 &&
          createProductAfterAddonRemovalRes.status === 400,
        detail: JSON.stringify({
          removeAddonStatus: removeProductAddonRes.status,
          createStatus: createProductAfterAddonRemovalRes.status,
          body: createProductAfterAddonRemovalRes.bodyText,
        }),
      }),
    );

    const discountRes = await request({
      method: "GET",
      requestPath: "/api/discounts",
      token: tenantAdminAuth.token,
    });
    results.push(
      scenarioResult({
        id: "feature-lock-discounts",
        category: "Feature Lock",
        title: "Discount endpoints are locked for expired BASIC-effective tenant",
        expected: "403 Forbidden",
        status: discountRes.status,
        pass: discountRes.status === 403,
        detail: discountRes.bodyText,
      }),
    );

    const today = new Date().toISOString();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const financeRes = await request({
      method: "GET",
      requestPath: `/api/finance/summary?startDate=${encodeURIComponent(startOfMonth)}&endDate=${encodeURIComponent(today)}`,
      token: tenantAdminAuth.token,
    });
    results.push(
      scenarioResult({
        id: "feature-lock-finance",
        category: "Feature Lock",
        title: "Finance endpoints are locked for tenant without analytics entitlement",
        expected: "403 Forbidden",
        status: financeRes.status,
        pass: financeRes.status === 403,
        detail: financeRes.bodyText,
      }),
    );

    const analyticsRes = await request({
      method: "GET",
      requestPath: "/api/analytics/dashboard",
      token: tenantAdminAuth.token,
    });
    results.push(
      scenarioResult({
        id: "feature-lock-analytics",
        category: "Feature Lock",
        title: "Analytics endpoints are locked for tenant without analytics entitlement",
        expected: "403 Forbidden",
        status: analyticsRes.status,
        pass: analyticsRes.status === 403,
        detail: analyticsRes.bodyText,
      }),
    );

    const upgradeRes = await request({
      method: "POST",
      requestPath: "/api/subscriptions/upgrade",
      token: tenantAdminAuth.token,
      body: {
        plan: "PRO",
        duration: 30,
        purchasedBy: "AUDIT_BUSINESS_RULES",
      },
    });
    const upgradedSnapshot = await getSubscriptionSnapshot(tenantAdminAuth.token);
    const upgradePass =
      isSuccessStatus(upgradeRes.status) &&
      upgradedSnapshot.response.status === 200 &&
      upgradedSnapshot.data?.currentPlan === "PRO" &&
      upgradedSnapshot.data?.effectivePlan === "PRO" &&
      upgradedSnapshot.data?.subscriptionExpired === false &&
      upgradedSnapshot.entitlements.includes("DISCOUNTS");
    results.push(
      scenarioResult({
        id: "subscription-upgrade-restores-entitlements",
        category: "Subscription Lifecycle",
        title: "Upgrade restores active plan entitlements for expired tenant",
        expected: "Upgrade succeeds and subscription current returns effectivePlan=PRO with discounts entitlement",
        status: upgradedSnapshot.response.status,
        pass: upgradePass,
        detail: upgradePass
          ? formatSnapshot(upgradedSnapshot.data)
          : JSON.stringify({
              upgradeStatus: upgradeRes.status,
              snapshot: upgradedSnapshot.data,
            }),
      }),
    );

    const discountAfterUpgradeRes = await request({
      method: "GET",
      requestPath: "/api/discounts",
      token: tenantAdminAuth.token,
    });
    results.push(
      scenarioResult({
        id: "feature-lock-discounts-unlocked-after-upgrade",
        category: "Subscription Lifecycle",
        title: "Discount endpoints unlock after returning to active PRO plan",
        expected: "200 OK",
        status: discountAfterUpgradeRes.status,
        pass: discountAfterUpgradeRes.status === 200,
        detail: discountAfterUpgradeRes.bodyText,
      }),
    );

    const financeAfterUpgradeRes = await request({
      method: "GET",
      requestPath: `/api/finance/summary?startDate=${encodeURIComponent(startOfMonth)}&endDate=${encodeURIComponent(today)}`,
      token: tenantAdminAuth.token,
    });
    const analyticsAfterUpgradeRes = await request({
      method: "GET",
      requestPath: "/api/analytics/dashboard",
      token: tenantAdminAuth.token,
    });
    results.push(
      scenarioResult({
        id: "feature-lock-analytics-still-locked-without-addon",
        category: "Subscription Lifecycle",
        title: "Finance and analytics stay locked on PRO until analytics addon is added",
        expected: "Finance 403 and analytics 403 while plan is PRO without addon-analytics",
        status:
          financeAfterUpgradeRes.status === 403 && analyticsAfterUpgradeRes.status === 403
            ? 403
            : Math.max(financeAfterUpgradeRes.status, analyticsAfterUpgradeRes.status),
        pass:
          financeAfterUpgradeRes.status === 403 &&
          analyticsAfterUpgradeRes.status === 403,
        detail: JSON.stringify({
          financeStatus: financeAfterUpgradeRes.status,
          analyticsStatus: analyticsAfterUpgradeRes.status,
        }),
      }),
    );

    const beforeExtendEnd = toTime(upgradedSnapshot.data?.subscriptionEnd);
    const extendRes = await request({
      method: "POST",
      requestPath: "/api/subscriptions/extend",
      token: tenantAdminAuth.token,
      body: {
        duration: 15,
      },
    });
    const extendedSnapshot = await getSubscriptionSnapshot(tenantAdminAuth.token);
    const afterExtendEnd = toTime(extendedSnapshot.data?.subscriptionEnd);
    const extendPass =
      isSuccessStatus(extendRes.status) &&
      beforeExtendEnd !== null &&
      afterExtendEnd !== null &&
      afterExtendEnd > beforeExtendEnd;
    results.push(
      scenarioResult({
        id: "subscription-extend-pushes-end-date-forward",
        category: "Subscription Lifecycle",
        title: "Extending an active subscription moves the end date forward",
        expected: "Extend succeeds and subscriptionEnd is later than before the request",
        status: extendRes.status,
        pass: extendPass,
        detail: JSON.stringify({
          beforeExtendEnd: upgradedSnapshot.data?.subscriptionEnd,
          afterExtendEnd: extendedSnapshot.data?.subscriptionEnd,
        }),
      }),
    );

    const addAnalyticsAddonRes = await request({
      method: "POST",
      requestPath: "/api/subscriptions/addons",
      token: tenantAdminAuth.token,
      body: {
        addonId: "addon-analytics",
        purchasedBy: "AUDIT_BUSINESS_RULES",
      },
    });
    const analyticsAddonSnapshot = await getSubscriptionSnapshot(tenantAdminAuth.token);
    const financeWithAddonRes = await request({
      method: "GET",
      requestPath: `/api/finance/summary?startDate=${encodeURIComponent(startOfMonth)}&endDate=${encodeURIComponent(today)}`,
      token: tenantAdminAuth.token,
    });
    const analyticsWithAddonRes = await request({
      method: "GET",
      requestPath: "/api/analytics/dashboard",
      token: tenantAdminAuth.token,
    });
    const analyticsAddonPass =
      isSuccessStatus(addAnalyticsAddonRes.status) &&
      analyticsAddonSnapshot.activeAddonIds.includes("addon-analytics") &&
      financeWithAddonRes.status === 200 &&
      analyticsWithAddonRes.status === 200;
    results.push(
      scenarioResult({
        id: "analytics-addon-unlocks-premium-reports",
        category: "Addon Lifecycle",
        title: "Analytics addon unlocks finance and analytics endpoints on PRO",
        expected: "Addon add succeeds and finance/analytics endpoints return 200",
        status:
          analyticsAddonPass
            ? 200
            : Math.max(
                addAnalyticsAddonRes.status,
                financeWithAddonRes.status,
                analyticsWithAddonRes.status,
              ),
        pass: analyticsAddonPass,
        detail: analyticsAddonPass
          ? formatSnapshot(analyticsAddonSnapshot.data)
          : JSON.stringify({
              addAddonStatus: addAnalyticsAddonRes.status,
              financeStatus: financeWithAddonRes.status,
              analyticsStatus: analyticsWithAddonRes.status,
              snapshot: analyticsAddonSnapshot.data,
            }),
      }),
    );

    const removeAnalyticsAddonRes = await request({
      method: "DELETE",
      requestPath: "/api/subscriptions/addons/addon-analytics",
      token: tenantAdminAuth.token,
    });
    const analyticsAfterRemovalRes = await request({
      method: "GET",
      requestPath: "/api/analytics/dashboard",
      token: tenantAdminAuth.token,
    });
    const financeAfterRemovalRes = await request({
      method: "GET",
      requestPath: `/api/finance/summary?startDate=${encodeURIComponent(startOfMonth)}&endDate=${encodeURIComponent(today)}`,
      token: tenantAdminAuth.token,
    });
    results.push(
      scenarioResult({
        id: "analytics-addon-removal-restores-lock",
        category: "Addon Lifecycle",
        title: "Removing analytics addon restores backend premium lock",
        expected: "Addon removal succeeds and finance/analytics endpoints return 403 again",
        status:
          removeAnalyticsAddonRes.status === 200 &&
          analyticsAfterRemovalRes.status === 403 &&
          financeAfterRemovalRes.status === 403
            ? 403
            : Math.max(
                removeAnalyticsAddonRes.status,
                analyticsAfterRemovalRes.status,
                financeAfterRemovalRes.status,
              ),
        pass:
          removeAnalyticsAddonRes.status === 200 &&
          analyticsAfterRemovalRes.status === 403 &&
          financeAfterRemovalRes.status === 403,
        detail: JSON.stringify({
          removeAddonStatus: removeAnalyticsAddonRes.status,
          financeStatus: financeAfterRemovalRes.status,
          analyticsStatus: analyticsAfterRemovalRes.status,
        }),
      }),
    );
    const totalTenantsDb = await prisma.tenant.count();
    const totalUsersDb = await prisma.user.count({ where: { isActive: true } });
    const globalRes = await request({
      method: "GET",
      requestPath: `/api/reports/global?startDate=${encodeURIComponent(startOfMonth)}&endDate=${encodeURIComponent(today)}`,
      token: superAdminAuth.token,
    });
    const globalPayload = unwrapResponse(globalRes.bodyJson);
    const globalData = globalPayload?.data || globalPayload || {};
    const overview = globalData?.overview || {};
    const summaryData = globalData?.summary || {};
    const metricsPass =
      globalRes.status === 200 &&
      typeof overview.totalTenants === "number" &&
      typeof overview.totalUsers === "number" &&
      typeof overview.totalSubscriptionRevenue === "number" &&
      typeof overview.totalAddonRevenue === "number" &&
      typeof overview.totalReceipts === "number" &&
      typeof overview.totalSalesRevenue === "number" &&
      overview.totalTenants === totalTenantsDb &&
      overview.totalUsers === totalUsersDb &&
      summaryData.totalUsers === totalUsersDb &&
      Number(overview.totalRevenue || 0) ===
        Number(overview.totalSubscriptionRevenue || 0) + Number(overview.totalAddonRevenue || 0);
    results.push(
      scenarioResult({
        id: "super-admin-global-metrics",
        category: "Super Admin Metrics",
        title: "Global report exposes platform metrics contract consistently",
        expected: "200 OK with totals matching tenant/user counts and revenue composition",
        status: globalRes.status,
        pass: metricsPass,
        detail: metricsPass
          ? JSON.stringify({
              totalTenants: overview.totalTenants,
              totalUsers: overview.totalUsers,
              totalRevenue: overview.totalRevenue,
              totalSubscriptionRevenue: overview.totalSubscriptionRevenue,
              totalAddonRevenue: overview.totalAddonRevenue,
            })
          : `Unexpected payload: ${JSON.stringify(globalData)}`,
      }),
    );

    const failed = results.filter((result) => !result.pass);
    const summary = {
      generatedAt: nowIso(),
      ok: failed.length === 0,
      total: results.length,
      passed: results.length - failed.length,
      failed: failed.length,
    };

    const jsonPayload = {
      ok: summary.ok,
      generatedAt: summary.generatedAt,
      summary,
      scenarios: results,
    };

    const lines = [];
    lines.push("# AUDIT BUSINESS RULES");
    lines.push("");
    lines.push(`Generated: ${summary.generatedAt}`);
    lines.push("");
    lines.push("## Summary");
    lines.push("");
    lines.push(`- Overall: ${summary.ok ? "PASS" : "FAIL"}`);
    lines.push(`- Total scenarios: ${summary.total}`);
    lines.push(`- Passed: ${summary.passed}`);
    lines.push(`- Failed: ${summary.failed}`);
    lines.push("");
    lines.push("## Scenario Results");
    lines.push("");
    lines.push("| Scenario | Category | Expected | Status | Result |");
    lines.push("|---|---|---|---:|---|");
    for (const result of results) {
      lines.push(`| ${result.title} | ${result.category} | ${result.expected} | ${result.status} | ${result.pass ? "PASS" : "FAIL"} |`);
    }
    lines.push("");
    lines.push("## Notes");
    lines.push("");
    for (const result of results) {
      lines.push(`### ${result.title}`);
      lines.push(`- Category: ${result.category}`);
      lines.push(`- Expected: ${result.expected}`);
      lines.push(`- Actual status: ${result.status}`);
      lines.push(`- Detail: ${result.detail || "-"}`);
      lines.push("");
    }

    fs.writeFileSync(REPORT_MD, `${lines.join("\n")}\n`);
    fs.writeFileSync(REPORT_JSON, JSON.stringify(jsonPayload, null, 2));
    console.log("Business rules audit written: AUDIT_BUSINESS_RULES.md");

    if (!summary.ok) {
      process.exitCode = 1;
    }
  } finally {
    if (backend && !backend.killed) {
      backend.kill();
      await sleep(1000);
    }
    await cleanupTempTenant().catch(() => {});
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});





