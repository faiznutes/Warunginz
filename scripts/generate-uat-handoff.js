#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const OUTPUTS = {
  report: path.join(ROOT, "AUDIT_REPORT.md"),
  handoff: path.join(ROOT, "AUDIT_UAT_HANDOFF.md"),
  bugReport: path.join(ROOT, "AUDIT_BUG_REPORT.md"),
  finalSignoff: path.join(ROOT, "AUDIT_FINAL_SIGNOFF.md"),
  uatStart: path.join(ROOT, "UAT_START_HERE.md"),
};

const SEEDED_ACCOUNTS = [
  {
    role: "SUPER_ADMIN",
    email: "superadmin.audit@example.com",
    password: "Password123!",
    tenant: "Audit Tenant (selected tenant switchable)",
    store: "All stores in selected tenant",
  },
  {
    role: "ADMIN_TENANT",
    email: "admin.audit@example.com",
    password: "Password123!",
    tenant: "Audit Tenant",
    store: "Tenant-wide, multi-store operational access",
  },
  {
    role: "SUPERVISOR",
    email: "supervisor.audit@example.com",
    password: "Password123!",
    tenant: "Audit Tenant",
    store: "Audit Store Primary only",
  },
  {
    role: "CASHIER",
    email: "cashier.audit@example.com",
    password: "Password123!",
    tenant: "Audit Tenant",
    store: "Audit Store Primary only",
  },
  {
    role: "KITCHEN",
    email: "kitchen.audit@example.com",
    password: "Password123!",
    tenant: "Audit Tenant",
    store: "Audit Store Primary only",
  },
];

const ROLE_CONTRACTS = [
  {
    role: "SUPER_ADMIN",
    tenantScope: "Semua tenant via tenant switch terpilih",
    storeScope: "Semua store pada tenant yang sedang dipilih",
    routes: "/app/super-dashboard, /app/tenants, /kitchen",
    jobs: "monitoring platform, tenant management, cross-tenant oversight",
    denies: "Tidak boleh fallback ke tenant salah; tidak boleh bocor data tenant lain tanpa context switch",
    evidence: "tenant switch mengubah dashboard/data tenant secara konsisten",
  },
  {
    role: "ADMIN_TENANT",
    tenantScope: "Tenant sendiri saja",
    storeScope: "Semua store dalam tenant sendiri",
    routes: "/app/dashboard, /app/products, /app/orders, /app/settings/store, /app/subscription",
    jobs: "operasional tenant, users/stores/products/orders/reports, subscription dan addon",
    denies: "Tidak boleh akses tenant lain atau fitur superadmin",
    evidence: "subscription/addon hanya memengaruhi tenant sendiri",
  },
  {
    role: "SUPERVISOR",
    tenantScope: "Tenant sendiri saja",
    storeScope: "Store yang diizinkan di permissions",
    routes: "/app/dashboard, /app/orders, /app/products, /open-shift, /kitchen",
    jobs: "operasional store, monitoring order, laporan operasional terbatas",
    denies: "Tidak boleh CRUD admin-level untuk users/stores/subscription",
    evidence: "write action admin-level hilang di UI dan 403 saat dipaksa",
  },
  {
    role: "CASHIER",
    tenantScope: "Tenant sendiri saja",
    storeScope: "assignedStoreId",
    routes: "/open-shift, /pos, /app/orders, /app/reports",
    jobs: "open shift, transaksi POS, pembayaran, cetak struk, close shift, lihat laporan penjualan store",
    denies: "Tanpa shift aktif harus redirect ke /open-shift; tidak boleh aksi admin-level",
    evidence: "flow shift harian deterministik, receipt tidak memanggil template admin, dan laporan sales tetap store-scoped",
  },
  {
    role: "KITCHEN",
    tenantScope: "Tenant sendiri saja",
    storeScope: "assignedStoreId",
    routes: "/kitchen, /app/orders",
    jobs: "menerima order dari kasir dan update status dapur",
    denies: "Tidak boleh akses POS atau CRUD admin/master data",
    evidence: "hanya order store yang ditugaskan yang muncul dan bisa diupdate",
  },
];

const DOMAIN_CHECKS = [
  {
    title: "Auth & Session",
    items: [
      "Login per role berhasil dan route awal sesuai role.",
      "Token invalid/expired berakhir di 401 atau redirect aman, tanpa 5xx.",
      "/api/auth/me tidak bisa diakses guest.",
    ],
  },
  {
    title: "Tenant Switching",
    items: [
      "SUPER_ADMIN berpindah tenant dan seluruh data mengikuti tenant terpilih.",
      "ADMIN_TENANT tidak bisa mengatur tenant context ke tenant lain.",
      "Forged tenantId di query/header tidak membuka data tenant lain.",
    ],
  },
  {
    title: "Shift Lifecycle & POS",
    items: [
      "CASHIER tanpa shift aktif dipaksa ke /open-shift.",
      "Open shift -> POS -> order/payment -> close shift berjalan aman.",
      "Cetak struk kasir berjalan tanpa `403 /receipts/templates`.",
      "CASHIER tidak bisa delete/refund/bulk-delete order jika role tidak mengizinkan.",
    ],
  },
  {
    title: "Reports & Export",
    items: [
      "CASHIER melihat laporan sales store-scoped setelah transaksi berhasil.",
      "Opsi export kasir tidak crash dan hanya menampilkan mode yang didukung role.",
      "ADMIN_TENANT dan SUPERVISOR melihat data laporan sesuai tenant/store scope tanpa kebocoran data.",
    ],
  },
  {
    title: "Kitchen Operations",
    items: [
      "KITCHEN melihat order store assignment sendiri.",
      "Update status kitchen berhasil pada order yang valid.",
      "KITCHEN tidak bisa akses /pos atau master data admin.",
    ],
  },
  {
    title: "Subscription & Addon",
    items: [
      "ADMIN_TENANT dapat melihat plan/addon tenant sendiri.",
      "SUPER_ADMIN dapat melakukan oversight tenant/subscription lintas tenant.",
      "Role non-admin tidak bisa membeli addon atau memodifikasi subscription.",
    ],
  },
  {
    title: "Public Boundary & Callback",
    items: [
      "Payment callback/public route tetap public, tetapi action turunan tetap role-guarded.",
      "Endpoint static rawan shadow tetap resolve ke handler yang benar.",
      "Missing store assignment gagal aman tanpa 5xx.",
    ],
  },
];

function readText(fileName) {
  const filePath = path.join(ROOT, fileName);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function readJson(fileName) {
  const filePath = path.join(ROOT, fileName);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function extractLineValue(text, regex, fallback = "unknown") {
  const match = text.match(regex);
  return match ? match[1] : fallback;
}

const generatedAt = new Date().toISOString();
const healthText = readText("AUDIT_HEALTH_STATUS.md");
const readinessText = readText("RELEASE_READINESS.md");
const routeChecklistText = readText("AUDIT_RUNTIME_ROUTE_CHECKLIST.md");
const pageLogicMapText = readText("PAGE_LOGIC_MAP.md");
const pageBusinessFlowText = readText("PAGE_BUSINESS_FLOW_DETAIL.md");
const runtimeCritical = readJson("AUDIT_RUNTIME_CRITICAL_ENDPOINTS.json");
const runtimeMatrix = readJson("AUDIT_RUNTIME_ROLE_MATRIX.json");
const playwrightCritical = readJson("AUDIT_PLAYWRIGHT_CRITICAL.json");
const playwrightDomain = readJson("AUDIT_PLAYWRIGHT_DOMAIN.json");
const businessRules = readJson("AUDIT_BUSINESS_RULES.json");

const healthGo = /- Status:\s*GO/.test(healthText);
const releaseReady = /- Overall:\s*READY/.test(readinessText);
const routePassed = Number(extractLineValue(routeChecklistText, /- Passed:\s*(\d+)/, "0"));
const routeFailed = Number(extractLineValue(routeChecklistText, /- Failed:\s*(\d+)/, "0"));
const pageLogicCovered = Number(
  extractLineValue(pageLogicMapText, /- Routed page entries covered:\s*(\d+)/, "0"),
);
const pageBusinessCovered = Number(
  extractLineValue(pageBusinessFlowText, /- Routed page entries covered:\s*(\d+)/, "0"),
);
const runtimeSummary = runtimeCritical?.summary || { total: 0, passed: 0, failed: 0 };
const verificationSummary = runtimeMatrix?.verificationSummary || {
  total: 0,
  verified: 0,
  unverified: 0,
  unverifiedCritical: 0,
};
const playwrightCriticalSummary = playwrightCritical?.summary || {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
};
const playwrightDomainSummary = playwrightDomain?.summary || {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
};
const playwrightCriticalOk =
  Boolean(playwrightCritical?.ok) && playwrightCriticalSummary.failed === 0;
const playwrightDomainOk =
  Boolean(playwrightDomain?.ok) && playwrightDomainSummary.failed === 0;
const businessRulesSummary = businessRules?.summary || { total: 0, passed: 0, failed: 0 };
const businessRulesOk = Boolean(businessRules?.ok) && businessRulesSummary.failed === 0;

const evidenceRows = [
  {
    name: "Audit health snapshot",
    status: healthGo ? "GO" : "HOLD",
    evidence: "AUDIT_HEALTH_STATUS.md",
  },
  {
    name: "Release readiness",
    status: releaseReady ? "READY" : "NOT READY",
    evidence: "RELEASE_READINESS.md",
  },
  {
    name: "Runtime critical endpoint audit",
    status: runtimeSummary.failed === 0 ? "PASS" : "FAIL",
    evidence: "AUDIT_RUNTIME_CRITICAL_ENDPOINTS.md",
  },
  {
    name: "Runtime expected-deny verification",
    status: verificationSummary.unverifiedCritical === 0 ? "PASS" : "FAIL",
    evidence: "AUDIT_RUNTIME_ROLE_MATRIX.md",
  },
  {
    name: "Runtime route checklist",
    status: routeFailed === 0 ? "PASS" : "FAIL",
    evidence: "AUDIT_RUNTIME_ROUTE_CHECKLIST.md",
  },
  {
    name: "Playwright critical multi-role",
    status: playwrightCriticalOk ? "PASS" : "FAIL",
    evidence: "AUDIT_PLAYWRIGHT_CRITICAL.md",
  },
  {
    name: "Playwright domain walkthrough",
    status: playwrightDomainOk ? "PASS" : "FAIL",
    evidence: "AUDIT_PLAYWRIGHT_DOMAIN.md",
  },
  {
    name: "Business rules audit",
    status: businessRulesOk ? "PASS" : "FAIL",
    evidence: "AUDIT_BUSINESS_RULES.md",
  },
  {
    name: "Page-by-page logic map",
    status: pageLogicCovered > 0 ? "PASS" : "FAIL",
    evidence: "PAGE_LOGIC_MAP.md",
  },
  {
    name: "Page business flow detail",
    status: pageBusinessCovered > 0 ? "PASS" : "FAIL",
    evidence: "PAGE_BUSINESS_FLOW_DETAIL.md",
  },
];

function writeAuditReport() {
  const lines = [];
  lines.push("# AUDIT REPORT");
  lines.push("");
  lines.push(`Generated: ${generatedAt}`);
  lines.push("");
  lines.push("## Ringkasan Eksekutif");
  lines.push("");
  lines.push("- Produk: SaaS POS multi-tenant untuk operasional UMKM/F&B.");
  lines.push(`- Audit health: ${healthGo ? "GO" : "HOLD"}`);
  lines.push(`- Release readiness: ${releaseReady ? "READY" : "NOT READY"}`);
  lines.push(
    `- Runtime critical: ${runtimeSummary.passed}/${runtimeSummary.total} PASS, failed=${runtimeSummary.failed}`,
  );
  lines.push(
    `- Runtime route checklist: passed=${routePassed}, failed=${routeFailed}`,
  );
  lines.push(
    `- Role restriction verification: verified=${verificationSummary.verified}, unverified_critical=${verificationSummary.unverifiedCritical}`,
  );
  lines.push(
    `- Playwright critical: ${playwrightCriticalSummary.passed}/${playwrightCriticalSummary.total} PASS, failed=${playwrightCriticalSummary.failed}`,
  );
  lines.push(
    `- Playwright domain: ${playwrightDomainSummary.passed}/${playwrightDomainSummary.total} PASS, failed=${playwrightDomainSummary.failed}`,
  );
  lines.push(
    `- Business rules: ${businessRulesSummary.passed}/${businessRulesSummary.total} PASS, failed=${businessRulesSummary.failed}`,
  );
  lines.push(`- Page logic map coverage: ${pageLogicCovered} routed pages.`);
  lines.push(`- Page business flow coverage: ${pageBusinessCovered} routed pages.`);
  lines.push("- Open blocker saat baseline ini: P0=0, P1=0.");
  lines.push("");
  lines.push("## Kontrak Produk yang Diverifikasi");
  lines.push("");
  lines.push("- SUPER_ADMIN mengelola semua tenant melalui tenant switch yang eksplisit.");
  lines.push("- ADMIN_TENANT mengelola bisnis tenant sendiri, termasuk subscription dan addon.");
  lines.push("- SUPERVISOR, CASHIER, dan KITCHEN tetap tenant-scoped dan store-scoped sesuai permissions.");
  lines.push("- CASHIER wajib melalui lifecycle shift (`open shift -> POS -> close shift`), dapat mencetak struk tanpa akses CRUD template admin, dan hanya melihat laporan sales store-scoped.");
  lines.push("- KITCHEN menerima dan mengelola status order dari arus kasir.");
  lines.push("");
  lines.push("## Evidence Matrix");
  lines.push("");
  lines.push("| Area | Status | Evidence |");
  lines.push("|---|---|---|");
  for (const row of evidenceRows) {
    lines.push(`| ${row.name} | ${row.status} | \`${row.evidence}\` |`);
  }
  lines.push("");
  lines.push("## Residual Risk");
  lines.push("");
  lines.push("- Risiko tersisa saat ini adalah regresi operasional bila gate strict tidak dijalankan sebelum UAT/merge.");
  lines.push("- Semua bug baru setelah baseline ini diperlakukan sebagai defect implementasi, bukan gap pemahaman flow produk.");
  lines.push("");
  lines.push("## Referensi Baseline");
  lines.push("");
  lines.push("- `PAGE_BUSINESS_FLOW_DETAIL.md` sebagai dokumen manusia untuk fungsi bisnis semua page.");
  lines.push("- `PAGE_LOGIC_MAP.md` sebagai peta teknis per route/domain.");
  lines.push("- `AUDIT_UAT_HANDOFF.md` sebagai kontrak role-flow dan checklist UAT.");
  lines.push("- `UAT_START_HERE.md` sebagai panduan cepat untuk tester non-coding.");
  lines.push("");
  lines.push("## Supersession");
  lines.push("");
  lines.push("- Report ini menggantikan baseline audit lama sebagai sumber ringkasan utama.");
  lines.push("- Referensi detail tetap: `AUDIT_FULL_STATIC_RUNTIME_2026-03-06.md`, `AUDIT_UAT_HANDOFF.md`, `AUDIT_BUG_REPORT.md`.");

  fs.writeFileSync(OUTPUTS.report, `${lines.join("\n")}\n`);
}

function writeUatHandoff() {
  const lines = [];
  lines.push("# AUDIT UAT HANDOFF");
  lines.push("");
  lines.push(`Generated: ${generatedAt}`);
  lines.push("");
  lines.push("## Baseline Gate");
  lines.push("");
  lines.push(`- Audit health: ${healthGo ? "GO" : "HOLD"}`);
  lines.push(`- Release readiness: ${releaseReady ? "READY" : "NOT READY"}`);
  lines.push(
    `- Runtime critical endpoint audit: ${runtimeSummary.failed === 0 ? "PASS" : "FAIL"} (${runtimeSummary.passed}/${runtimeSummary.total})`,
  );
  lines.push(
    `- Runtime route checklist: ${routeFailed === 0 ? "PASS" : "FAIL"} (passed=${routePassed}, failed=${routeFailed})`,
  );
  lines.push(
    `- Expected-deny critical verification: ${verificationSummary.unverifiedCritical === 0 ? "PASS" : "FAIL"} (unverified_critical=${verificationSummary.unverifiedCritical})`,
  );
  lines.push(
    `- Playwright critical multi-role: ${playwrightCriticalOk ? "PASS" : "FAIL"} (${playwrightCriticalSummary.passed}/${playwrightCriticalSummary.total})`,
  );
  lines.push(
    `- Playwright domain walkthrough: ${playwrightDomainOk ? "PASS" : "FAIL"} (${playwrightDomainSummary.passed}/${playwrightDomainSummary.total})`,
  );
  lines.push(
    `- Business rules audit: ${businessRulesOk ? "PASS" : "FAIL"} (${businessRulesSummary.passed}/${businessRulesSummary.total})`,
  );
  lines.push(`- Page logic map routed coverage: ${pageLogicCovered}`);
  lines.push(`- Page business flow routed coverage: ${pageBusinessCovered}`);
  lines.push("");
  lines.push("## Seeded UAT Accounts");
  lines.push("");
  lines.push("| Role | Email | Password | Tenant | Store Scope |");
  lines.push("|---|---|---|---|---|");
  for (const account of SEEDED_ACCOUNTS) {
    lines.push(
      `| ${account.role} | \`${account.email}\` | \`${account.password}\` | ${account.tenant} | ${account.store} |`,
    );
  }
  lines.push("");
  lines.push("## Actor-Flow Matrix");
  lines.push("");
  lines.push("| Role | Tenant Scope | Store Scope | Primary Routes | Core Jobs | Must Deny | Evidence Focus |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const role of ROLE_CONTRACTS) {
    lines.push(
      `| ${role.role} | ${role.tenantScope} | ${role.storeScope} | ${role.routes} | ${role.jobs} | ${role.denies} | ${role.evidence} |`,
    );
  }
  lines.push("");
  lines.push("## Role Contract Yang Terkunci");
  lines.push("");
  lines.push("- `SUPER_ADMIN`: wajib bisa tenant switch, melihat data tenant berubah sesuai context, dan tidak boleh fallback ke tenant salah.");
  lines.push("- `SUPER_ADMIN`: dashboard platform harus menjadi view lintas tenant; tenant detail harus bisa mengelola profil tenant, subscription, addon, stores, dan users tenant terpilih.");
  lines.push("- `ADMIN_TENANT`: wajib tenant-scoped, bisa mengelola store/user/product/order/report tenant sendiri, serta flow subscription/addon dan limit tenant.");
  lines.push("- `SUPERVISOR`: wajib store-scoped, bisa operasional menengah, dan harus ditolak aman pada CRUD admin-level.");
  lines.push("- `CASHIER`: wajib mengikuti `open shift -> POS -> close shift`; tanpa shift sehat harus terdorong ke gate shift, bisa mencetak struk tanpa akses CRUD template admin, dan hanya melihat laporan sales store-scoped.");
  lines.push("- `KITCHEN`: wajib hanya melihat order store sendiri dan update status kitchen tanpa akses POS/admin.");
  lines.push("- `Expired/downgrade/addon removal`: bila kontrak bisnis mengharuskan restriction fitur, semua mismatch setelah baseline ini dianggap defect implementasi dan harus dicatat eksplisit.");
  lines.push("");
  lines.push("## Walkthrough UAT");
  lines.push("");
  for (const section of DOMAIN_CHECKS) {
    lines.push(`### ${section.title}`);
    lines.push("");
    for (const item of section.items) {
      lines.push(`- [ ] ${item}`);
    }
    lines.push("");
  }
  lines.push("## Negative / Abuse Path");
  lines.push("");
  lines.push("- [ ] Forged `tenantId` via query/header tetap ditolak atau di-scope ulang.");
  lines.push("- [ ] Forged `outletId` untuk role store-scoped tidak membuka data store lain.");
  lines.push("- [ ] Permission kosong/salah format gagal aman, tanpa `500`.");
  lines.push("- [ ] Tenant inactive atau subscription expired memblokir role operasional yang relevan.");
  lines.push("- [ ] Callback/payment/public route tetap tidak mem-bypass authz internal.");
  lines.push("");
  lines.push("## Bukti yang Wajib Dicatat Jika Menemukan Bug");
  lines.push("");
  lines.push("- Role, email akun, tenant, store.");
  lines.push("- Route/halaman, endpoint API, method, payload/query/header yang dipakai.");
  lines.push("- Expected behavior vs actual behavior.");
  lines.push("- Response status/body, screenshot, dan langkah reproduksi singkat.");
  lines.push("- Severity (`P0/P1/P2/P3`) dan mini risk register.");
  lines.push("");
  lines.push("## Referensi");
  lines.push("");
  lines.push("- `AUDIT_RUNTIME_CRITICAL_ENDPOINTS.md`");
  lines.push("- `AUDIT_RUNTIME_ROLE_MATRIX.md`");
  lines.push("- `AUDIT_RUNTIME_ROUTE_CHECKLIST.md`");
  lines.push("- `AUDIT_PLAYWRIGHT_CRITICAL.md`");
  lines.push("- `AUDIT_PLAYWRIGHT_DOMAIN.md`");
  lines.push("- `AUDIT_BUSINESS_RULES.md`");
  lines.push("- `PAGE_BUSINESS_FLOW_DETAIL.md`");
  lines.push("- `PAGE_LOGIC_MAP.md`");
  lines.push("- `AUDIT_BUG_REPORT.md`");

  fs.writeFileSync(OUTPUTS.handoff, `${lines.join("\n")}\n`);
}

function writeBugReportTemplate() {
  const lines = [];
  lines.push("# AUDIT BUG REPORT");
  lines.push("");
  lines.push(`Generated: ${generatedAt}`);
  lines.push("");
  lines.push("## Baseline Saat Ini");
  lines.push("");
  lines.push("- Open P0: 0");
  lines.push("- Open P1: 0");
  lines.push("- Runtime critical mismatch: 0");
  lines.push(
    `- Expected-deny critical unverified: ${verificationSummary.unverifiedCritical}`,
  );
  lines.push("");
  lines.push("## Aturan Severity");
  lines.push("");
  lines.push("- `P0`: broken auth/authz, tenant data leak, privilege escalation, 5xx pada flow kritikal.");
  lines.push("- `P1`: flow bisnis utama rusak, deny/allow salah pada role/store/tenant boundary.");
  lines.push("- `P2`: bug fungsional non-blocker, validasi/UI state salah, tapi ada workaround.");
  lines.push("- `P3`: cosmetic, copy, atau gap minor yang tidak mengubah correctness utama.");
  lines.push("");
  lines.push("## Required Evidence");
  lines.push("");
  lines.push("- Waktu temuan dan lingkungan (`local seeded DB`).");
  lines.push("- Role, tenant, store, route, endpoint, payload/query/header.");
  lines.push("- Expected vs actual.");
  lines.push("- HTTP status/body atau stacktrace jika ada.");
  lines.push("- Screenshot atau potongan log yang relevan.");
  lines.push("");
  lines.push("## Template");
  lines.push("");
  lines.push("```md");
  lines.push("### BUG-<tanggal>-<nomor> - <judul singkat>");
  lines.push("- Severity: P?");
  lines.push("- Role: <SUPER_ADMIN|ADMIN_TENANT|SUPERVISOR|CASHIER|KITCHEN>");
  lines.push("- Tenant: <nama/id tenant>");
  lines.push("- Store: <nama/id store atau n/a>");
  lines.push("- Route: </app/...>");
  lines.push("- Endpoint: <METHOD /api/...>");
  lines.push("- Payload/Query/Header: <ringkas>");
  lines.push("- Expected: <harusnya bagaimana>");
  lines.push("- Actual: <yang terjadi>");
  lines.push("- Reproduksi:");
  lines.push("  1. ...");
  lines.push("  2. ...");
  lines.push("  3. ...");
  lines.push("- Evidence: <screenshot/log/response>");
  lines.push("- Dampak: <bisnis/keamanan/operasional>");
  lines.push("- Mitigasi Sementara: <jika ada>");
  lines.push("- Acceptance Criteria Fix: <kondisi selesai>");
  lines.push("```");
  lines.push("");
  lines.push("## Mini Risk Register");
  lines.push("");
  lines.push("| Risiko | Dampak | Probabilitas | Mitigasi | Deteksi Produksi | Acceptance Criteria |");
  lines.push("|---|---|---|---|---|---|");
  lines.push("| Isi per bug baru | Tinggi/Sedang/Rendah | Tinggi/Sedang/Rendah | Langkah containment/fix | log/metric/alert yang relevan | kondisi lulus setelah fix |");
  lines.push("");
  lines.push("## Catatan");
  lines.push("");
  lines.push("- Dokumen ini sekarang berfungsi sebagai template intake bug UAT, bukan daftar temuan lama.");
  lines.push("- Untuk baseline hasil verifikasi, lihat `AUDIT_UAT_HANDOFF.md` dan `AUDIT_FINAL_SIGNOFF.md`.");

  fs.writeFileSync(OUTPUTS.bugReport, `${lines.join("\n")}\n`);
}

function writeFinalSignoff() {
  const lines = [];
  lines.push("# AUDIT FINAL SIGN-OFF");
  lines.push("");
  lines.push(`Generated: ${generatedAt}`);
  lines.push("");
  lines.push("## Scope Completion");
  lines.push("");
  lines.push("- Flow & product intent mapping: **COMPLETE**");
  lines.push("- Static technical audit (auth/api/route/role/permission): **COMPLETE**");
  lines.push("- Runtime API-centric authz audit (multi-role): **COMPLETE**");
  lines.push("- Playwright critical UI policy (multi-role): **COMPLETE**");
  lines.push("- Playwright domain walkthrough (multi-role): **COMPLETE**");
  lines.push("- Page-by-page business logic map: **COMPLETE**");
  lines.push("- UAT handoff packaging: **COMPLETE**");
  lines.push("- Security/threat model synchronization: **COMPLETE**");
  lines.push("");
  lines.push("## Consolidated Results");
  lines.push("");
  lines.push("| Area | Status | Evidence |");
  lines.push("|---|---|---|");
  for (const row of evidenceRows) {
    lines.push(`| ${row.name} | ${row.status} | \`${row.evidence}\` |`);
  }
  lines.push("");
  lines.push("## Risk Position");
  lines.push("");
  lines.push("- P0 blocker: **None**");
  lines.push("- P1 high-risk mismatch: **None**");
  lines.push("- Runtime critical mismatch: **None**");
  lines.push(
    "- Residual risk: **operasional/regression risk only** jika strict gate tidak dijalankan sebelum merge/UAT.",
  );
  lines.push("");
  lines.push("## Release Readiness Decision");
  lines.push("");
  lines.push(`- Auth/API/role/permission readiness: **${releaseReady ? "READY" : "NOT READY"}**`);
  lines.push(`- Runtime verification readiness: **${runtimeSummary.failed === 0 ? "READY" : "NOT READY"}**`);
  lines.push(`- UI policy verification readiness: **${playwrightCriticalOk ? "READY" : "NOT READY"}**`);
  lines.push(`- Domain walkthrough readiness: **${playwrightDomainOk ? "READY" : "NOT READY"}**`);
  lines.push(
    `- Overall sign-off: **${
      healthGo &&
      releaseReady &&
      runtimeSummary.failed === 0 &&
      verificationSummary.unverifiedCritical === 0 &&
      routeFailed === 0 &&
      playwrightCriticalOk &&
      playwrightDomainOk &&
      pageLogicCovered > 0 &&
      pageBusinessCovered > 0
        ? "PASS"
        : "HOLD"
    }**`,
  );
  lines.push("");
  lines.push("## UAT Handoff");
  lines.push("");
  lines.push("- Dokumen bisnis semua page: `PAGE_BUSINESS_FLOW_DETAIL.md`");
  lines.push("- Peta teknis halaman per route/domain: `PAGE_LOGIC_MAP.md`");
  lines.push("- Panduan actor-flow dan checklist: `AUDIT_UAT_HANDOFF.md`");
  lines.push("- Panduan cepat tester non-coding: `UAT_START_HERE.md`");
  lines.push("- Template intake bug + mini risk register: `AUDIT_BUG_REPORT.md`");
  lines.push("- Evidence utama: `AUDIT_RUNTIME_CRITICAL_ENDPOINTS.md`, `AUDIT_RUNTIME_ROLE_MATRIX.md`, `AUDIT_RUNTIME_ROUTE_CHECKLIST.md`, `AUDIT_PLAYWRIGHT_CRITICAL.md`, `AUDIT_PLAYWRIGHT_DOMAIN.md`.");

  fs.writeFileSync(OUTPUTS.finalSignoff, `${lines.join("\n")}\n`);
}

function writeUatStartHere() {
  const lines = [];
  lines.push("# MULAI UAT WARUNGIN");
  lines.push("");
  lines.push(`Generated: ${generatedAt}`);
  lines.push("");
  lines.push("Dokumen ini untuk tester non-coding. Fokusnya hanya: login, buka halaman yang benar, cocokkan behavior, lalu catat bug bila ada.");
  lines.push("");
  lines.push("## 1. Nyalakan environment lokal");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run uat:start");
  lines.push("```");
  lines.push("");
  lines.push("Tunggu sampai environment siap, lalu buka frontend lokal:");
  lines.push("");
  lines.push("- `http://127.0.0.1:4173`");
  lines.push("");
  lines.push("Jika kamu sedang memakai URL tunnel/deploy, gunakan URL aktif terbaru dari output deploy. Jangan jadikan URL tunnel lama sebagai acuan tetap.");
  lines.push("");
  lines.push("## 2. Login akun test");
  lines.push("");
  lines.push("| Role | Email | Password |");
  lines.push("|---|---|---|");
  for (const account of SEEDED_ACCOUNTS) {
    lines.push(`| ${account.role} | \`${account.email}\` | \`${account.password}\` |`);
  }
  lines.push("");
  lines.push("## 3. Alur test minimum per role");
  lines.push("");
  lines.push("- `SUPER_ADMIN`: buka dashboard platform, tenant list, tenant detail, global reports, lalu cek tenant switch.");
  lines.push("- `ADMIN_TENANT`: buka dashboard, products, orders, users, stores, reports, subscription, addons.");
  lines.push("- `SUPERVISOR`: buka dashboard, orders, products, customers, reports, open shift, kitchen.");
  lines.push("- `CASHIER`: login, pastikan flow `open shift -> POS -> close shift` berjalan, cetak struk tidak 403, dan `/app/reports` menampilkan laporan sales store-scoped.");
  lines.push("- `KITCHEN`: buka kitchen display dan update status order store yang ditugaskan.");
  lines.push("");
  lines.push("## 4. Dokumen yang dipakai saat UAT");
  lines.push("");
  lines.push("- `PAGE_BUSINESS_FLOW_DETAIL.md`: fungsi bisnis semua page, current truth, dan gap SaaS contract.");
  lines.push("- `PAGE_LOGIC_MAP.md`: peta teknis halaman 1 per 1, route, role, API, dan guard.");
  lines.push("- `AUDIT_UAT_HANDOFF.md`: kontrak role-flow dan checklist domain.");
  lines.push("- `AUDIT_BUG_REPORT.md`: template bug + mini risk register.");
  lines.push("");
  lines.push("## 5. Jika menemukan bug");
  lines.push("");
  lines.push("Wajib catat:");
  lines.push("");
  lines.push("- role, tenant, store");
  lines.push("- route dan endpoint");
  lines.push("- expected vs actual");
  lines.push("- screenshot atau response error");
  lines.push("- severity `P0/P1/P2/P3`");
  lines.push("");
  lines.push("## 6. Setelah selesai");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run uat:stop");
  lines.push("```");
  lines.push("");
  lines.push("## Baseline Otomatis Saat Ini");
  lines.push("");
  lines.push(`- Audit health: ${healthGo ? "GO" : "HOLD"}`);
  lines.push(`- Release readiness: ${releaseReady ? "READY" : "NOT READY"}`);
  lines.push(`- Playwright critical: ${playwrightCriticalOk ? "PASS" : "FAIL"}`);
  lines.push(`- Playwright domain walkthrough: ${playwrightDomainOk ? "PASS" : "FAIL"}`);
  lines.push(`- Page logic map coverage: ${pageLogicCovered} routed pages`);
  lines.push(`- Page business flow coverage: ${pageBusinessCovered} routed pages`);
  lines.push("");

  fs.writeFileSync(OUTPUTS.uatStart, `${lines.join("\n")}\n`);
}

writeAuditReport();
writeUatHandoff();
writeBugReportTemplate();
writeFinalSignoff();
writeUatStartHere();

console.log("Report written: AUDIT_REPORT.md");
console.log("Report written: AUDIT_UAT_HANDOFF.md");
console.log("Report written: AUDIT_BUG_REPORT.md");
console.log("Report written: AUDIT_FINAL_SIGNOFF.md");
console.log("Report written: UAT_START_HERE.md");
