#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CLIENT_ROOT = path.join(ROOT, "client", "src");
const ROUTER_FILES = [
  path.join(CLIENT_ROOT, "router", "index.ts"),
  path.join(CLIENT_ROOT, "router", "addon.routes.ts"),
];

const PUBLIC_ROUTE_NAMES = new Set([
  "home",
  "demo",
  "contact",
  "terms",
  "pricing",
  "help",
  "help-article",
  "help-category",
  "forgot-password",
  "contact-success",
  "login",
  "payment-success",
  "payment-error",
  "payment-pending",
]);

const FULLSCREEN_ROUTE_NAMES = new Set([
  "pos-fullscreen",
  "open-shift",
  "kitchen-display",
]);

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function normalizeImportPath(importPath) {
  return path.join(CLIENT_ROOT, importPath.replace(/^\.\.\//, ""));
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function countLinesToIndex(content, targetIndex) {
  let lines = 0;
  for (let index = 0; index < targetIndex; index += 1) {
    if (content[index] === "\n") lines += 1;
  }
  return lines;
}

function extractEnclosingObject(content, importIndex) {
  let start = -1;
  let depth = 0;

  for (let index = importIndex; index >= 0; index -= 1) {
    const char = content[index];
    if (char === "}") {
      depth += 1;
    } else if (char === "{") {
      if (depth === 0) {
        start = index;
        break;
      }
      depth -= 1;
    }
  }

  if (start === -1) return null;

  let end = -1;
  depth = 0;
  for (let index = start; index < content.length; index += 1) {
    const char = content[index];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        end = index;
        break;
      }
    }
  }

  if (end === -1) return null;
  return content.slice(start, end + 1);
}

function parseStringArray(windowText, key) {
  const match = windowText.match(new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`, "s"));
  if (!match) return [];
  return unique(
    match[1]
      .split(",")
      .map((item) => item.trim().replace(/['"]/g, ""))
      .filter(Boolean),
  );
}

function parseRequiresPermission(windowText) {
  const block = windowText.match(/requiresPermission:\s*\{([\s\S]*?)\}/);
  if (!block) return null;

  const role = block[1].match(/role:\s*['"]([^'"]+)['"]/);
  const permission = block[1].match(/permission:\s*['"]([^'"]+)['"]/);
  if (!role || !permission) return null;

  return {
    role: role[1],
    permission: permission[1],
  };
}

function buildFullPath(routePath, routeName, sourceFile) {
  if (!routePath) return routeName || "(unknown)";
  if (routePath.startsWith("/")) return routePath;
  if (sourceFile.endsWith("addon.routes.ts")) return `/app/${routePath}`;
  if (PUBLIC_ROUTE_NAMES.has(routeName)) {
    return routePath ? `/${routePath}` : "/";
  }
  return `/app/${routePath}`;
}

function inferLayout(routeName, fullPath, fullscreen) {
  if (fullscreen || FULLSCREEN_ROUTE_NAMES.has(routeName)) return "Fullscreen";
  if (
    fullPath === "/login" ||
    fullPath === "/forgot-password" ||
    fullPath === "/contact/success" ||
    fullPath.startsWith("/payment/")
  ) {
    return "Standalone";
  }
  if (PUBLIC_ROUTE_NAMES.has(routeName)) return "MarketingLayout";
  if (fullPath.startsWith("/app/")) return "DynamicLayout";
  return "Standalone";
}

function inferDomain(fullPath, routeName) {
  if (
    fullPath === "/login" ||
    fullPath === "/forgot-password" ||
    fullPath.startsWith("/payment/")
  ) {
    return "Auth / Callback";
  }
  if (PUBLIC_ROUTE_NAMES.has(routeName)) return "Public / Marketing";
  if (fullPath === "/unauthorized" || fullPath === "/:pathMatch(.*)*") {
    return "System / Error";
  }
  if (
    fullPath === "/app/super-dashboard" ||
    fullPath.startsWith("/app/tenants") ||
    fullPath.startsWith("/app/superadmin/") ||
    fullPath === "/app/reports/global" ||
    fullPath === "/app/settings/system" ||
    fullPath === "/app/settings/archive" ||
    fullPath === "/app/settings/retention" ||
    fullPath.includes("style-guide") ||
    fullPath.includes("components-guide")
  ) {
    return "Super Admin / Platform";
  }
  if (
    fullPath === "/pos" ||
    fullPath === "/open-shift" ||
    fullPath.startsWith("/app/cashier/") ||
    fullPath.startsWith("/app/pos/")
  ) {
    return "Cashier / POS / Shift";
  }
  if (fullPath === "/kitchen" || fullPath.startsWith("/app/orders/kitchen")) {
    return "Kitchen";
  }
  if (
    fullPath === "/app/dashboard" ||
    fullPath === "/app/orders" ||
    fullPath === "/app/support" ||
    fullPath === "/app/delivery"
  ) {
    return "Store Operations";
  }
  if (
    fullPath.startsWith("/app/products") ||
    fullPath === "/app/customers" ||
    fullPath === "/app/rewards" ||
    fullPath === "/app/reward-view" ||
    fullPath === "/app/discounts" ||
    fullPath.startsWith("/app/inventory/") ||
    fullPath === "/app/marketing" ||
    fullPath.startsWith("/app/marketing/")
  ) {
    return "Catalog / CRM / Inventory";
  }
  if (
    fullPath === "/app/reports" ||
    fullPath.startsWith("/app/reports/") ||
    fullPath.startsWith("/app/analytics") ||
    fullPath.startsWith("/app/finance") ||
    fullPath === "/app/profit-loss"
  ) {
    return "Reports / Finance";
  }
  if (
    fullPath === "/app/users" ||
    fullPath.startsWith("/app/stores") ||
    fullPath === "/app/subscription" ||
    fullPath === "/app/addons" ||
    fullPath.startsWith("/app/settings/")
  ) {
    return "Tenant Admin / Settings";
  }
  return "System / Utility";
}

function inferPurpose(entry) {
  const purposeOverrides = {
    "/": "Landing marketing Warungin untuk calon tenant dan titik masuk demo/pricing/contact.",
    "/demo": "Demo produk untuk menjelaskan alur SaaS POS ke calon tenant.",
    "/contact": "Form kontak prospek/support awal sebelum menjadi tenant.",
    "/contact/success": "Konfirmasi sukses setelah prospek mengirim form kontak.",
    "/terms": "Halaman syarat dan ketentuan layanan.",
    "/pricing": "Halaman paket harga/langganan.",
    "/help": "Pusat bantuan publik.",
    "/help/:slug": "Artikel bantuan publik.",
    "/help/category/:categoryId": "Kategori artikel bantuan publik.",
    "/forgot-password": "Flow pemulihan password untuk user yang belum login.",
    "/login": "Pintu masuk autentikasi semua role.",
    "/payment/success": "Menampilkan hasil callback pembayaran sukses ke tenant.",
    "/payment/error": "Menampilkan hasil callback pembayaran gagal.",
    "/payment/pending": "Menampilkan status pembayaran pending.",
    "/pos": "Pusat transaksi POS: pilih item, checkout, payment, dan sinkronisasi order.",
    "/open-shift": "Flow buka shift toko/kasir atau recovery sebelum kasir boleh bertransaksi.",
    "/kitchen": "Kitchen display fullscreen untuk antrean order store yang ditugaskan.",
    "/app/dashboard": "Dashboard operasional tenant/store setelah login.",
    "/app/cashier/cash-shift": "Pusat kontrol shift kasir: status aktif, riwayat, tutup shift, dan recovery mismatch.",
    "/app/super-dashboard": "Dashboard platform untuk SUPER_ADMIN lintas tenant.",
    "/app/tenants": "Daftar tenant dan akses ke detail tenant bagi SUPER_ADMIN.",
    "/app/tenants/:id": "Detail tenant: profil, subscription, addon, user, dan store tenant.",
    "/app/support": "Inbox support/client support untuk tenant.",
    "/app/orders": "Daftar order operasional untuk monitoring, filtering, dan aksi sesuai role.",
    "/app/orders/kitchen": "Antrian order kitchen di dalam layout aplikasi.",
    "/app/products": "Kelola katalog produk tenant/store.",
    "/app/customers": "Kelola data pelanggan dan relasi CRM dasar.",
    "/app/reports": "Laporan tenant/store sesuai role dan permission.",
    "/app/users": "Kelola user tenant dan assignment role/store.",
    "/app/stores": "Kelola daftar toko/outlet tenant.",
    "/app/stores/:id": "Detail toko/outlet tertentu.",
    "/app/stores/:id/edit": "Form edit outlet/store.",
    "/app/subscription": "Kelola paket langganan tenant.",
    "/app/addons": "Kelola pembelian atau aktivasi addon tenant.",
    "/app/rewards": "Kelola reward program tenant.",
    "/app/reward-view": "Preview atau tampilan reward tertentu.",
    "/app/discounts": "Kelola diskon tenant.",
    "/app/delivery": "Operasional order delivery bila addon aktif.",
    "/app/marketing": "Operasional campaign marketing bila addon aktif.",
    "/app/analytics": "Advanced analytics tenant bila addon aktif.",
    "/app/finance": "Ringkasan keuangan tenant.",
    "/app/finance/transactions": "Daftar transaksi keuangan tenant.",
    "/app/finance/management": "Manajemen keuangan lebih detail bila addon aktif.",
    "/app/profit-loss": "Laporan laba/rugi tenant.",
    "/app/settings/system": "Pengaturan sistem platform untuk SUPER_ADMIN.",
    "/app/settings/store": "Pengaturan store level tenant.",
    "/app/settings/preferences": "Preferensi aplikasi untuk user yang login.",
    "/app/settings/2fa": "Pengaturan two-factor authentication.",
    "/app/settings/webhooks": "Kelola webhook tenant/platform.",
    "/app/settings/webhooks/tester": "Tester webhook untuk validasi integrasi.",
    "/app/settings/sessions": "Kelola session aktif user.",
    "/app/settings/password": "Ubah password user yang login.",
    "/app/settings/gdpr": "Pengaturan privasi/retensi data user.",
    "/app/settings/archive": "Pengelolaan arsip sistem untuk SUPER_ADMIN.",
    "/app/settings/retention": "Pengaturan retensi data platform.",
    "/app/superadmin/contact-messages": "Inbox pesan kontak masuk ke platform.",
    "/app/superadmin/server-monitor": "Monitoring kesehatan server/platform.",
    "/app/superadmin/system-info": "Informasi environment dan sistem platform.",
    "/app/superadmin/backups": "Kelola backup platform.",
  };

  if (purposeOverrides[entry.fullPath]) {
    return purposeOverrides[entry.fullPath];
  }

  const baseName = path
    .basename(entry.viewPath, ".vue")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
  return `Halaman ${baseName} untuk domain ${entry.domain.toLowerCase()}.`;
}

function summarizeTenantStoreDependency(entry) {
  if (!entry.requiresAuth) {
    return "Tidak membutuhkan context tenant/store.";
  }

  if (entry.roles.length === 1 && entry.roles[0] === "SUPER_ADMIN") {
    return "SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.";
  }

  const parts = [];

  if (entry.roles.includes("SUPER_ADMIN")) {
    parts.push("SUPER_ADMIN bisa override tenant context via `selectedTenantId`.");
  }
  if (
    entry.roles.includes("ADMIN_TENANT") ||
    entry.roles.includes("SUPERVISOR") ||
    entry.roles.includes("CASHIER") ||
    entry.roles.includes("KITCHEN")
  ) {
    parts.push("Role non-superadmin tetap scoped ke `user.tenantId`.");
  }
  if (entry.roles.includes("CASHIER") || entry.roles.includes("KITCHEN")) {
    parts.push("Store diambil dari `permissions.assignedStoreId`.");
  }
  if (entry.roles.includes("SUPERVISOR")) {
    parts.push("SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.");
  }

  if (parts.length === 0) {
    return "Context tenant mengikuti user login; store hanya relevan bila halaman membuka data outlet.";
  }

  return parts.join(" ");
}

function extractApiCalls(filePath) {
  const absPath = path.join(ROOT, filePath);
  if (!fs.existsSync(absPath)) return [];
  const content = readText(absPath);
  const regex = /api\.(get|post|put|patch|delete)\(\s*(["'`])([^"'`]+)\2/g;
  const calls = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    calls.push({
      method: match[1].toUpperCase(),
      endpoint: match[3],
    });
  }
  return calls;
}

function summarizeApi(calls) {
  if (calls.length === 0) {
    return "Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.";
  }
  return unique(calls.map((call) => `${call.method} ${call.endpoint}`))
    .slice(0, 8)
    .join("; ");
}

function summarizeWriteActions(calls) {
  const writes = unique(
    calls
      .filter((call) => ["POST", "PUT", "PATCH", "DELETE"].includes(call.method))
      .map((call) => `${call.method} ${call.endpoint}`),
  );
  if (writes.length === 0) {
    return "Tidak ada write API langsung di file halaman.";
  }
  return writes.slice(0, 8).join("; ");
}

function extractFailureSignals(filePath, fullPath) {
  const absPath = path.join(ROOT, filePath);
  if (!fs.existsSync(absPath)) return "Belum terpetakan dari file halaman.";
  const content = readText(absPath);
  const matches = [];
  const regex = /(["'`])([^"'`\n]{4,180})\1/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const phrase = match[2].trim();
    if (!phrase.includes(" ")) continue;
    if (!/(gagal|error|tidak ada|belum ada|kosong|unauthorized|agal|empty|tidak tersedia)/i.test(phrase)) {
      continue;
    }
    if (/[{}<>]/.test(phrase)) continue;
    matches.push(phrase);
  }

  const selected = unique(matches).slice(0, 4);
  if (selected.length > 0) {
    return selected.join("; ");
  }

  if (fullPath.startsWith("/app/products")) {
    return "Perhatikan copy seperti `gagal memuat produk`, list kosong salah tenant/store, dan aksi simpan gagal.";
  }
  if (fullPath.startsWith("/app/reports")) {
    return "Perhatikan `gagal memuat laporan`, chart kosong, atau filter laporan salah tenant/store.";
  }
  if (fullPath === "/app/orders" || fullPath.startsWith("/app/orders/")) {
    return "Perhatikan order tidak tampil, status order gagal berubah, atau list bocor antar store.";
  }
  if (fullPath === "/pos") {
    return "Perhatikan produk tidak tampil, checkout gagal, atau POS memaksa logout/redirect salah.";
  }
  if (fullPath === "/open-shift" || fullPath === "/app/cashier/cash-shift") {
    return "Perhatikan state shift salah, tombol buka/tutup shift tidak sinkron, atau redirect loop.";
  }
  if (fullPath === "/kitchen" || fullPath === "/app/orders/kitchen") {
    return "Perhatikan order kitchen store lain muncul atau update status gagal.";
  }
  return "Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.";
}

function extractOutgoingRoutes(filePath) {
  const absPath = path.join(ROOT, filePath);
  if (!fs.existsSync(absPath)) return [];
  const content = readText(absPath);
  const targets = [];

  for (const regex of [
    /to=["']([^"'#][^"']*)["']/g,
    /router\.(?:push|replace)\(\s*(["'`])([^"'`]+)\1/g,
    /router\.(?:push|replace)\(\s*\{[\s\S]{0,220}?name:\s*['"]([^'"]+)['"]/g,
  ]) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const value = match[2] || match[1];
      if (!value) continue;
      if (
        value.startsWith("http") ||
        value.startsWith("#") ||
        value.startsWith("mailto:") ||
        value.startsWith("tel:")
      ) {
        continue;
      }
      targets.push(value);
    }
  }

  return unique(targets).slice(0, 8);
}

function extractUiSignals(filePath) {
  const absPath = path.join(ROOT, filePath);
  if (!fs.existsSync(absPath)) {
    return {
      features: [],
      exportNotes: [],
    };
  }

  const content = readText(absPath);
  const features = [];
  const exportNotes = [];

  const signalChecks = [
    [/dateRange|selectedPeriod|periodOptions|periodFilter|Hari Ini|Minggu|Bulan|Tahun/i, "filter periode/tanggal"],
    [/searchQuery|searchTerm|keyword|placeholder=.*cari|search/i, "search/kata kunci"],
    [/statusFilter|selectedStatus|statusOptions|filter status/i, "filter status"],
    [/selectedTenant|tenantOptions|tenantId/i, "selector tenant"],
    [/selectedStore|outletId|storeOptions|allowedStoreIds/i, "selector store"],
    [/tab\b|activeTab|tabs?/i, "navigasi tab/section"],
    [/modal/i, "modal aksi/konfirmasi"],
    [/bulk/i, "bulk action"],
    [/pagination|pageSize|currentPage/i, "pagination"],
  ];

  for (const [regex, label] of signalChecks) {
    if (regex.test(content)) {
      features.push(label);
    }
  }

  if (/ExportButton|ExportModal|download|export/i.test(content)) {
    features.push("ekspor data");
  }
  if (/pdf|PDF|Receipt|invoice|print/i.test(content)) {
    exportNotes.push("indikasi PDF/print/nota tersedia di halaman atau child component");
  }

  return {
    features: unique(features),
    exportNotes: unique(exportNotes),
  };
}

function summarizeUiCapabilities(entry, uiSignals) {
  const parts = [...uiSignals.features];
  if (entry.calls.some((call) => call.method === "POST")) {
    parts.push("aksi create");
  }
  if (entry.calls.some((call) => call.method === "PUT" || call.method === "PATCH")) {
    parts.push("aksi update");
  }
  if (entry.calls.some((call) => call.method === "DELETE")) {
    parts.push("aksi delete");
  }

  if (parts.length === 0) {
    return "Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman.";
  }
  return unique(parts).join(", ");
}

function summarizeGuard(entry) {
  const guards = [];

  if (entry.fullPath === "/login" || entry.fullPath === "/forgot-password") {
    guards.push("User yang sudah login diarahkan ke dashboard sesuai role.");
    return guards.join(" ");
  }

  if (entry.requiresAuth) {
    guards.push("Guest diarahkan ke `/login`.");
  }
  if (entry.roles.length > 0) {
    guards.push(
      `Role di luar [${entry.roles.join(", ")}] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (\`/app/dashboard\` atau \`/app/super-dashboard\`).`,
    );
  }
  if (entry.requiresPermission) {
    guards.push(
      `Untuk role ${entry.requiresPermission.role}, permission \`${entry.requiresPermission.permission}\` dicek di frontend; jika gagal, user dialihkan ke dashboard role.`,
    );
  }
  if (entry.requiresAddon) {
    guards.push(`Akses juga butuh addon \`${entry.requiresAddon}\`` +
      "; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.");
  }
  if (entry.fullPath === "/app/dashboard") {
    guards.push("SUPER_ADMIN tidak boleh memakai dashboard tenant biasa; router memindahkan ke `/app/super-dashboard`.");
  }
  if (entry.fullPath === "/app/super-dashboard") {
    guards.push("Role non-superadmin dipindah kembali ke `/app/dashboard`.");
  }
  if (entry.roles.includes("CASHIER") || entry.fullPath === "/pos") {
    guards.push(
      "Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`.",
    );
  }
  if (entry.fullPath === "/open-shift") {
    guards.push(
      "Jika shift sudah sehat, route ini akan mendorong user ke `/pos`; jika state mismatch, diarahkan ke `/app/cashier/cash-shift`.",
    );
  }
  if (
    entry.roles.includes("SUPERVISOR") ||
    entry.roles.includes("CASHIER") ||
    entry.roles.includes("KITCHEN")
  ) {
    guards.push(
      "Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.",
    );
  }

  return guards.join(" ");
}

function extractRouteEntries() {
  const entries = [];

  for (const filePath of ROUTER_FILES) {
    const content = readText(filePath);
    const importRegex = /import\((['"])(\.{2}\/views\/[^'"]+\.vue)\1\)/g;
    let importMatch;

    while ((importMatch = importRegex.exec(content)) !== null) {
      const blockText = extractEnclosingObject(content, importMatch.index);
      if (!blockText) continue;

      const routePathMatch = blockText.match(/path:\s*['"]([^'"]+)['"]/);
      const routeNameMatch = blockText.match(/name:\s*['"]([^'"]+)['"]/);
      const routePath = routePathMatch ? routePathMatch[1] : "";
      const routeName = routeNameMatch ? routeNameMatch[1] : "";
      const roles = parseStringArray(blockText, "roles");
      const requiresPermission = parseRequiresPermission(blockText);
      const requiresAddonMatch = blockText.match(/requiresAddon:\s*['"]([^'"]+)['"]/);
      const fullscreen = /fullscreen:\s*true/.test(blockText);
      const fullPath = buildFullPath(routePath, routeName, filePath);
      const absView = normalizeImportPath(importMatch[2]);
      const relView = path.relative(ROOT, absView).replace(/\\/g, "/");
      const importLine = countLinesToIndex(content, importMatch.index) + 1;

      entries.push({
        routeName: routeName || path.basename(absView, ".vue"),
        routePath,
        fullPath,
        viewPath: relView,
        source: `${path.relative(ROOT, filePath).replace(/\\/g, "/")}:${importLine}`,
        roles,
        requiresPermission,
        requiresAddon: requiresAddonMatch ? requiresAddonMatch[1] : null,
        fullscreen,
        requiresAuth:
          roles.length > 0 ||
          fullscreen ||
          fullPath.startsWith("/app/") ||
          fullPath === "/pos" ||
          fullPath === "/open-shift" ||
          fullPath === "/kitchen",
        layout: inferLayout(routeName, fullPath, fullscreen),
        domain: inferDomain(fullPath, routeName),
      });
    }
  }

  return entries.sort((a, b) => a.fullPath.localeCompare(b.fullPath));
}

function enrichEntry(entry) {
  const calls = extractApiCalls(entry.viewPath);
  const uiSignals = extractUiSignals(entry.viewPath);

  return {
    ...entry,
    calls,
    purpose: inferPurpose(entry),
    tenantStoreDependency: summarizeTenantStoreDependency(entry),
    guardSummary: summarizeGuard(entry),
    failureSignals: extractFailureSignals(entry.viewPath, entry.fullPath),
    apiSummary: summarizeApi(calls),
    writeSummary: summarizeWriteActions(calls),
    outgoingRoutes: extractOutgoingRoutes(entry.viewPath),
    uiSignals,
    uiCapabilitySummary: summarizeUiCapabilities({ ...entry, calls }, uiSignals),
  };
}

function getEnrichedEntries() {
  return extractRouteEntries().map(enrichEntry);
}

module.exports = {
  ROOT,
  CLIENT_ROOT,
  ROUTER_FILES,
  PUBLIC_ROUTE_NAMES,
  FULLSCREEN_ROUTE_NAMES,
  readText,
  unique,
  extractRouteEntries,
  extractApiCalls,
  extractFailureSignals,
  inferPurpose,
  summarizeTenantStoreDependency,
  summarizeGuard,
  extractOutgoingRoutes,
  extractUiSignals,
  enrichEntry,
  getEnrichedEntries,
};
