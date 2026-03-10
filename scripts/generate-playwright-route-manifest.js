#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { getEnrichedEntries } = require("./page-audit-shared");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "client", "tests", "playwright", ".generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "all-routes-manifest.json");

const MAJOR_DOMAINS = new Set([
  "Auth / Callback",
  "Super Admin / Platform",
  "Tenant Admin / Settings",
  "Store Operations",
  "Cashier / POS / Shift",
  "Kitchen",
  "Reports / Finance",
]);

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function pickPrimaryRole(entry) {
  if (!entry.requiresAuth) return null;

  const fullPath = entry.fullPath;
  const roles = Array.isArray(entry.roles) ? entry.roles : [];

  if (
    fullPath === "/pos" ||
    fullPath === "/open-shift" ||
    fullPath.startsWith("/app/cashier/") ||
    fullPath.startsWith("/app/pos/")
  ) {
    return roles.includes("CASHIER") ? "CASHIER" : roles[0] || null;
  }

  if (fullPath === "/kitchen" || fullPath.startsWith("/app/orders/kitchen")) {
    return roles.includes("KITCHEN") ? "KITCHEN" : roles[0] || null;
  }

  if (
    fullPath === "/app/super-dashboard" ||
    fullPath.startsWith("/app/tenants") ||
    fullPath.startsWith("/app/superadmin/") ||
    fullPath === "/app/reports/global" ||
    fullPath === "/app/settings/system" ||
    fullPath === "/app/settings/archive" ||
    fullPath === "/app/settings/retention"
  ) {
    return roles.includes("SUPER_ADMIN") ? "SUPER_ADMIN" : roles[0] || null;
  }

  if (roles.includes("ADMIN_TENANT")) return "ADMIN_TENANT";
  if (roles.includes("SUPERVISOR")) return "SUPERVISOR";
  if (roles.includes("CASHIER")) return "CASHIER";
  if (roles.includes("KITCHEN")) return "KITCHEN";
  if (roles.includes("SUPER_ADMIN")) return "SUPER_ADMIN";
  return roles[0] || "ADMIN_TENANT";
}

function inferResolver(entry) {
  switch (entry.fullPath) {
    case "/help/:slug":
      return { type: "static", path: "/help/cara-setup-awal" };
    case "/help/category/:categoryId":
      return { type: "static", path: "/help/category/getting-started" };
    case "/app/tenants/:id":
      return { type: "tenant-detail" };
    case "/app/stores/:id":
      return { type: "store-detail" };
    case "/app/stores/:id/edit":
      return { type: "store-edit" };
    case "/:pathMatch(.*)*":
      return { type: "static", path: "/totally-missing-page" };
    default:
      return null;
  }
}

function inferExpectedMode(entry) {
  if (!entry.requiresAuth) return "public";
  if (entry.requiresAddon || entry.requiresPermission) return "allowed_or_safe_deny";
  return "allowed";
}

function inferPhase(entry) {
  if (MAJOR_DOMAINS.has(entry.domain)) {
    return "Major";
  }
  return "Minor";
}

function buildManifest() {
  return getEnrichedEntries().map((entry) => ({
    routeName: entry.routeName,
    fullPath: entry.fullPath,
    routePath: entry.routePath,
    source: entry.source,
    viewPath: entry.viewPath,
    domain: entry.domain,
    layout: entry.layout,
    roles: entry.roles,
    requiresAuth: entry.requiresAuth,
    requiresPermission: entry.requiresPermission,
    requiresAddon: entry.requiresAddon,
    primaryRole: pickPrimaryRole(entry),
    resolver: inferResolver(entry),
    expectedMode: inferExpectedMode(entry),
    phase: inferPhase(entry),
    failureSignals: entry.failureSignals,
    guardSummary: entry.guardSummary,
    apiSummary: entry.apiSummary,
    writeSummary: entry.writeSummary,
  }));
}

ensureDir(OUTPUT_DIR);
const manifest = buildManifest();
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2) + "\n");

const summary = manifest.reduce(
  (acc, entry) => {
    acc.total += 1;
    acc[entry.phase.toLowerCase()] += 1;
    if (!entry.requiresAuth) acc.public += 1;
    return acc;
  },
  { total: 0, major: 0, minor: 0, public: 0 },
);

console.log(
  JSON.stringify(
    {
      output: path.relative(ROOT, OUTPUT_FILE).replace(/\\/g, "/"),
      ...summary,
    },
    null,
    2,
  ),
);

