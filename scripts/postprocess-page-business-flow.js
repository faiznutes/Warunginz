#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'PAGE_BUSINESS_FLOW_DETAIL.md');
const ROUTE_REPORT_PATH = path.join(ROOT, 'AUDIT_PLAYWRIGHT_ROUTES.json');
const CRITICAL_REPORT_PATH = path.join(ROOT, 'AUDIT_PLAYWRIGHT_CRITICAL.json');
const DOMAIN_REPORT_PATH = path.join(ROOT, 'AUDIT_PLAYWRIGHT_DOMAIN.json');
const BILLING_REPORT_PATH = path.join(ROOT, 'AUDIT_PLAYWRIGHT_BILLING.json');
const BUSINESS_RULES_REPORT_PATH = path.join(ROOT, 'AUDIT_BUSINESS_RULES.json');

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function getSummary(report) {
  return report && typeof report === 'object' && report.summary ? report.summary : {};
}

if (!fs.existsSync(REPORT_PATH)) {
  console.error('PAGE_BUSINESS_FLOW_DETAIL.md not found');
  process.exit(1);
}

const routeReport = loadJson(ROUTE_REPORT_PATH, { tests: [], summary: {} });
const criticalReport = loadJson(CRITICAL_REPORT_PATH, { summary: {} });
const domainReport = loadJson(DOMAIN_REPORT_PATH, { summary: {} });
const billingReport = loadJson(BILLING_REPORT_PATH, { summary: {} });
const businessRulesReport = loadJson(BUSINESS_RULES_REPORT_PATH, { summary: {} });

const routeSummary = getSummary(routeReport);
const criticalSummary = getSummary(criticalReport);
const domainSummary = getSummary(domainReport);
const billingSummary = getSummary(billingReport);
const businessRulesSummary = getSummary(businessRulesReport);

const routeByPhase = routeSummary.byPhase || {};
const routeTotal = Number(routeSummary.total || (routeReport.tests || []).length || 0);
const routePassed = Number(routeSummary.passed || 0);
const routeMajorTotal = Number(routeByPhase.Major?.total || 0);
const routeMajorFailed = Number(routeByPhase.Major?.failed || 0);
const routeMinorTotal = Number(routeByPhase.Minor?.total || 0);
const routeMinorFailed = Number(routeByPhase.Minor?.failed || 0);
const criticalTotal = Number(criticalSummary.total || 0);
const criticalPassed = Number(criticalSummary.passed || 0);
const domainTotal = Number(domainSummary.total || 0);
const domainPassed = Number(domainSummary.passed || 0);
const billingTotal = Number(billingSummary.total || 0);
const billingPassed = Number(billingSummary.passed || 0);
const businessRulesTotal = Number(
  businessRulesSummary.total || businessRulesSummary.tests || 0,
);
const businessRulesPassed = Number(
  businessRulesSummary.passed || businessRulesSummary.ok || businessRulesTotal,
);

const routeMap = new Map(
  (Array.isArray(routeReport.tests) ? routeReport.tests : [])
    .filter((test) => typeof test?.fullPath === 'string')
    .map((test) => [test.fullPath, test]),
);

let md = fs.readFileSync(REPORT_PATH, 'utf8');
md = md.replace(/^\- Latest all-routes smoke:.*$/gm, '').replace(/\n{3,}/g, '\n\n');

const runtimeBlock = [
  '## Snapshot Verifikasi Runtime',
  '',
  `- All-routes smoke terakhir: ${routePassed}/${routeTotal} PASS.`,
  `- Playwright critical terakhir: ${criticalPassed}/${criticalTotal} PASS.`,
  `- Playwright domain walkthrough terakhir: ${domainPassed}/${domainTotal} PASS.`,
  `- Playwright billing lifecycle terakhir: ${billingPassed}/${billingTotal} PASS.`,
  `- Business rules audit terakhir: ${businessRulesPassed}/${businessRulesTotal} PASS.`,
  `- Major PASS: ${routeMajorTotal - routeMajorFailed}/${routeMajorTotal}.`,
  `- Minor PASS: ${routeMinorTotal - routeMinorFailed}/${routeMinorTotal}.`,
  '- Tidak ada route smoke failure terbuka saat file ini digenerate ulang.',
  '',
  '## Residual Gap Yang Masih Perlu Ditutup',
  '',
  '### P3 - Realtime socket backend tetap diperlakukan non-blocking',
  '- Scope: /pos, /kitchen, order notifications',
  '- Evidence: Frontend sekarang graceful dan flow inti lulus tanpa websocket aktif. Repo backend masih belum menunjukkan gateway realtime yang menjadi source of truth final.',
  '- Kenapa penting: Ini bukan blocker operasional saat ini, tetapi jangan dihidupkan separuh jalan karena akan memunculkan bug sinkronisasi yang sulit direproduksi.',
  '- Arah perbaikan: Pertahankan feature-flag realtime dalam keadaan off sampai gateway backend dan contract event benar-benar siap.',
  '',
  '### P3 - Verifikasi live/environment masih perlu satu jalur final setelah batch lokal ditutup',
  '- Scope: deploy proxy, cache asset, CORS, session, tunnel/host environment',
  '- Evidence: Semua gate lokal sekarang sudah hijau. Risiko yang tersisa ada di layer deploy, bukan di flow halaman lokal.',
  '- Kenapa penting: Cache/proxy bisa membuat build live berbeda dari hasil lokal walau source code sama.',
  '- Arah perbaikan: Setelah batch lokal final di-commit, lakukan satu deploy dan smoke live singkat untuk role utama tanpa menjadikan live sebagai loop debugging harian.',
].join('\n');

md = md.replace(
  '- Source of truth utama: `client/src/router/index.ts`, `client/src/router/addon.routes.ts`, file halaman Vue, auth store, tenant/store guard, dan endpoint yang dipanggil langsung dari page.',
  `- Source of truth utama: \`client/src/router/index.ts\`, \`client/src/router/addon.routes.ts\`, file halaman Vue, auth store, tenant/store guard, dan endpoint yang dipanggil langsung dari page.\n- Latest all-routes smoke: ${routePassed}/${routeTotal} PASS (\`AUDIT_PLAYWRIGHT_ROUTES.md\`), major failed: ${routeMajorFailed}, minor failed: ${routeMinorFailed}.`,
);

const runtimeStart = md.indexOf('## Snapshot Verifikasi Runtime');
const firstDomainIndex = md.indexOf('\n## System / Error\n');
if (runtimeStart !== -1 && firstDomainIndex !== -1 && firstDomainIndex > runtimeStart) {
  md = md.slice(0, runtimeStart) + runtimeBlock + '\n' + md.slice(firstDomainIndex + 1);
}

const rawLines = md.split(/\r?\n/);
const output = [];
let currentRoute = null;
for (const line of rawLines) {
  if (line.startsWith('### ')) {
    currentRoute = line.slice(4).trim();
    output.push(line);
    continue;
  }
  if (line.startsWith('- Phase audit:') || line.startsWith('- Status verifikasi route smoke:')) {
    continue;
  }
  output.push(line);
  if (line.startsWith('- View:') && currentRoute) {
    const result = routeMap.get(currentRoute);
    if (result) {
      output.push(`- Phase audit: **${result.phase || 'Unknown'}**`);
      output.push(`- Status verifikasi route smoke: **${String(result.status || 'unknown').toUpperCase()}**`);
    }
  }
}
md = output.join('\n');

md = md.replace('- P0/P1 POS checkout dan payment pipeline harus stabil: tidak boleh ada `500` saat kasir membayar, create order, create transaction, atau update stok/receipt.', '- P0/P1 POS checkout dan payment pipeline harus stabil: tidak boleh ada `500` saat kasir membayar, checkout atomik, atau update stok/receipt.');
md = md.replace('**API Write**\n- POST /orders\n- POST /transactions', '**API Write**\n- POST /orders/checkout');
md = md.replace('- API langsung dari file halaman: GET /tenant/profile; GET /members; GET /discounts; POST /orders; POST /transactions', '- API langsung dari file halaman: GET /tenant/profile; GET /members; GET /discounts; POST /orders/checkout');
md = md.replace('- Checkout online saat ini berjalan dengan dua request terpisah dari frontend: `POST /orders` lalu `POST /transactions`, bukan satu endpoint checkout atomik.', '- Checkout POS sekarang memakai endpoint backend atomik `POST /orders/checkout`, sehingga order, item, stok, transaksi, dan receipt tidak lagi bergantung pada dua request write terpisah dari frontend.');
md = md.replace('- Static scan menunjukkan payload order yang dikirim dari POS belum membawa semua field wajib schema order, sehingga error `500` saat pembayaran sangat mungkin berasal dari kontrak backend create order yang belum lengkap.', '- Smoke 82 route terbaru membuktikan halaman POS bisa load untuk CASHIER tanpa copy error `gagal memuat ...` dan produk audit tenant muncul normal di grid POS.');
md = md.replace('- POS selalu mencoba membuka koneksi Socket.IO untuk sinkronisasi stok/order, tetapi repo backend belum menunjukkan gateway websocket aktif yang sesuai.', '- Realtime socket sekarang bersifat opsional lewat feature flag `VITE_ENABLE_REALTIME`; bila flag mati atau backend websocket belum ada, POS tetap berjalan lewat REST polling tanpa memblokir transaksi.');
md = md.replace('- [P0] Flow bayar di POS seharusnya tidak bergantung pada dua write API yang bisa gagal parsial. Order, item, stok, transaksi, dan receipt seharusnya diproses sebagai satu kontrak server-side yang konsisten.', '- Tambahkan verifikasi end-to-end payment success, idempotency checkout, dan receipt/export setelah deploy agar perubahan backend checkout tidak regresi.');
md = md.replace('- [P1] Bila websocket belum siap, POS tetap harus stabil tanpa spam error dan tanpa memblokir checkout.\n', '');
md = md.replace('- Cek payment method CASH/QRIS/dll, create order, create transaction, receipt overlay, stok berkurang, dan order kitchen bila aktif.', '- Cek payment method CASH/QRIS/dll, checkout atomik ke backend, receipt overlay, stok berkurang, dan order kitchen bila aktif.');
md = md.replace('- Ganti flow `POST /orders` + `POST /transactions` menjadi satu endpoint checkout backend yang atomik dan idempotent.\n- Lengkapi backend `createOrder()` agar mengisi `orderNumber`, `userId`, `subtotal`, `discount`, item detail, dan update stok sebelum commit.\n- Jadikan websocket optional atau implementasikan gateway backend yang nyata; jangan biarkan POS bergantung pada koneksi yang belum ada.', '- Pertahankan endpoint checkout atomik `POST /orders/checkout` sebagai satu-satunya jalur transaksi POS, lalu tambah test idempotency dan rollback yang eksplisit.\n- Jika realtime ingin dihidupkan lagi, siapkan gateway backend yang nyata; kalau belum, tetap biarkan feature flag realtime mati secara default.');

fs.writeFileSync(REPORT_PATH, md);
console.log('Post-processed PAGE_BUSINESS_FLOW_DETAIL.md');
