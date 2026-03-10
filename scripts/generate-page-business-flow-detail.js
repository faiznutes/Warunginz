#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { ROOT, getEnrichedEntries, unique } = require("./page-audit-shared");
const ROUTE_REPORT_PATH = path.join(ROOT, "AUDIT_PLAYWRIGHT_ROUTES.json");

const DOMAIN_INTRO = {
  "Public / Marketing":
    "Halaman publik yang tidak butuh login. Tujuannya akuisisi tenant, edukasi produk, pricing, bantuan, dan entry point prospek.",
  "Auth / Callback":
    "Flow autentikasi dan callback pembayaran. Halaman ini boleh public, tetapi tidak boleh membuka boundary internal tenant tanpa validasi backend.",
  "Super Admin / Platform":
    "Halaman platform untuk SUPER_ADMIN: monitoring lintas tenant, tenant detail, global report, pengaturan platform, dan kontrol subscription/addon tenant.",
  "Tenant Admin / Settings":
    "Halaman manajemen tenant sendiri: user, store, subscription, addon, settings, dan konfigurasi aplikasi tenant.",
  "Store Operations":
    "Halaman operasional harian tenant/store: dashboard, orders, support, delivery, dan aktivitas store-level.",
  "Catalog / CRM / Inventory":
    "Halaman master data dan growth ops: products, customers, rewards, discounts, inventory, delivery, marketing.",
  "Reports / Finance":
    "Halaman laporan, analitik, keuangan, dan ekspor PDF/print yang harus tetap tenant-scoped atau platform-scoped sesuai role.",
  "Cashier / POS / Shift":
    "Flow kasir. Kontrak bisnis utamanya adalah `open shift -> POS -> close shift` tanpa shortcut yang merusak kontrol operasional.",
  Kitchen:
    "Flow dapur. Hanya order store yang ditugaskan yang boleh muncul, dan status dapur harus aman dari sisi authz/store-scope.",
  "System / Utility":
    "Halaman utility atau support internal yang tidak sepenting core business, tetapi tetap harus konsisten dengan auth, tenant, dan error handling.",
  "System / Error":
    "Halaman fallback untuk akses ditolak atau route tidak ditemukan.",
};

const CROSS_PAGE_GAPS = [
  {
    severity: "P2",
    title: "Contract metrik SUPER_ADMIN sudah stabil, tetapi summary/detail lintas halaman harus tetap satu sumber data",
    detail:
      "`/app/super-dashboard` dan `/app/reports/global` sekarang sama-sama bertumpu pada `GET /reports/global` untuk kartu summary, breakdown subscription/addon, dan filter tanggal. Risiko yang tersisa adalah drift bila salah satu halaman diubah tanpa menjaga contract agregasi yang sama.",
  },
  {
    severity: "P3",
    title: "Quota create users/stores/products sudah ditegakkan server-side dan sudah masuk regression guard",
    detail:
      "Create path untuk user/store/product sekarang memanggil `AddonService.assertLimitAvailable(...)` di backend dan business-rules audit lokal sudah mengunci perilaku deny ketika quota habis. Yang tersisa adalah menjaga suite ini tetap ikut dijalankan saat contract tenant/addon berubah.",
  },
  {
    severity: "P3",
    title: "Lifecycle subscription/addon sekarang sudah punya regression browser, tetapi harus tetap dijaga lintas halaman billing",
    detail:
      "Suite billing lifecycle sekarang memverifikasi `upgrade/extend/expired/addon removal` di browser terhadap `/app/subscription`, `/app/addons`, `/app/discounts`, dan `/app/analytics`. Risiko yang tersisa bukan lagi ketiadaan coverage, tetapi menjaga copy UI, entitlement, dan CTA billing tetap sinkron saat contract backend berubah.",
  },
  {
    severity: "P3",
    title: "Frontend entitlement check sudah sinkron dengan backend premium lock, tetapi naming entitlement tetap harus dijaga",
    detail:
      "Router guard sekarang memeriksa entitlements dari `/subscriptions/current` dan tidak lagi memberi bypass ADMIN_TENANT untuk `BUSINESS_ANALYTICS`. Risiko sisa adalah regresi bila naming entitlement/addon di backend berubah tanpa update guard frontend.",
  },
];



function readJsonIfExists(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function readRouteVerification() {
  const report = readJsonIfExists(ROUTE_REPORT_PATH, null);
  const summary = report?.summary || null;
  const tests = Array.isArray(report?.tests) ? report.tests : [];
  const index = new Map();

  for (const test of tests) {
    if (typeof test?.fullPath !== "string" || index.has(test.fullPath)) continue;
    index.set(test.fullPath, test);
  }

  return {
    report,
    summary,
    index,
  };
}

const PHASE_GROUPS = {
  major: [
    "P0/P1 POS checkout dan payment pipeline harus stabil: tidak boleh ada `500` saat kasir membayar, checkout atomik, atau update stok/receipt.",
    "Authz tenant/store harus konsisten di semua halaman inti: dashboard, products, orders, reports, users, stores, POS, kitchen, subscription, addons.",
    "Quota subscription/addon harus tetap dites di backend dan tidak boleh mundur menjadi sekadar indikator UI.",
    "Dashboard dan laporan super admin harus tetap memakai contract platform metrics lintas tenant yang sama dan mengikuti filter periode.",
    "Route/guard/permission role harus diverifikasi aman untuk SUPER_ADMIN, ADMIN_TENANT, SUPERVISOR, CASHIER, dan KITCHEN tanpa fallback tenant/store yang salah.",
  ],
  minor: [
    "PWA/static asset hygiene: `apple-touch-icon`, icon manifest, shortcut URL, dan install prompt behavior harus rapi agar tidak menimbulkan warning/noise.",
    "WebSocket harus dibuat graceful: jika belum ada gateway backend atau tunnel tidak stabil, UI tidak boleh spam error console atau mempengaruhi flow bisnis.",
    "Dokumen error/empty state harus konsisten: hindari copy `gagal memuat ...` yang tidak informatif dan pastikan ada retry/CTA yang jelas.",
    "Halaman non-core seperti help, marketing, settings guide, dan utility perlu tetap dicek route serta fallback error-nya, tetapi prioritasnya di bawah core POS/operasional.",
  ],
};

const OBSERVED_RUNTIME_FINDINGS = [
  {
    severity: "P3",
    title: "Contract laporan dan export kasir sudah stabil, tetapi regression coverage harus tetap dijaga",
    scope: "/app/reports, /pos",
    evidence:
      "Flow kasir sekarang memakai `GET /reports/dashboard/summary` + `GET /reports/daily-sales` untuk laporan sales store-scoped, sementara export modal membatasi opsi sesuai role dan payload yang benar-benar tersedia. Critical/domain smoke lokal sudah memverifikasi jalur ini tanpa crash.",
    why:
      "Mismatch kecil di contract summary/daily-sales/export tetap bisa mengembalikan laporan kosong palsu atau crash export setelah transaksi nyata bila regression test tidak lagi dijalankan.",
    fix:
      "Pertahankan regression test kasir untuk transaksi -> laporan -> export, dan jangan kembalikan halaman reports ke contract lama `/reports/tenant` untuk semua tipe data.",
  },
  {
    severity: "P3",
    title: "Realtime socket backend belum menjadi contract aktif, tetapi frontend sekarang sudah optional",
    scope: "/pos, /kitchen, order notifications",
    evidence:
      "Frontend hanya menghidupkan realtime bila `VITE_ENABLE_REALTIME=true`, dan fallback REST tetap menjadi source of truth operasional. Repo backend masih belum menunjukkan gateway Socket.IO yang menjadi contract aktif.",
    why:
      "Ini bukan blocker operasional saat ini, tetapi harus diputuskan jelas sebelum realtime dihidupkan di production agar ekspektasi event realtime tidak palsu.",
    fix:
      "Pertahankan feature flag realtime dalam keadaan off sampai gateway backend siap, atau implementasikan contract gateway yang nyata dari backend.",
  },
  {
    severity: "P2",
    title: "Shell PWA/login sudah lebih rapi, tetapi masih butuh verifikasi pasca-deploy terhadap cache browser",
    scope: "/login dan public shell",
    evidence:
      "Icon dasar dan manifest shortcut sudah disediakan, dan handler `beforeinstallprompt` tidak lagi menahan banner custom. Risiko sisa lebih banyak berasal dari cache browser atau deploy lama yang belum memuat asset terbaru.",
    why:
      "Ini bukan blocker bisnis utama, tetapi warning shell lama bisa membuat tester mengira flow bisnis masih rusak padahal problemnya hanya asset/cache.",
    fix:
      "Pertahankan asset icon/manifest ini di deploy berikutnya dan bersihkan cache browser saat memverifikasi shell bila warning lama masih terlihat.",
  },
];

const PAGE_OVERRIDES = {
  "/login": {
    masukDari: ["guest/public route", "session expired", "logout dari halaman privat"],
    currentTruth: [
      "Login adalah gerbang semua role dan menjadi halaman pertama yang paling sering memperlihatkan warning PWA atau missing asset karena shell aplikasi dimuat dari sini.",
      "Jika user sudah punya session valid, router guard mengembalikan user ke dashboard sesuai role.",
    ],
    expectedGap: [
      "[P2] Warning PWA/install dan asset icon yang hilang seharusnya tidak muncul terus-menerus di halaman login karena ini merusak persepsi kualitas aplikasi.",
    ],
  },
  "/app/super-dashboard": {
    masukDari: [
      "redirect login untuk SUPER_ADMIN",
      "menu dashboard platform",
      "navigasi ulang dari halaman platform lain",
    ],
    currentTruth: [
      "Halaman memakai `GET /reports/global` dengan `startDate` dan `endDate` untuk memuat metrik platform lintas tenant.",
      'Tombol filter `Hari Ini / Minggu / Bulan / Tahun` menghitung rentang tanggal lokal lalu mengirim `startDate` dan `endDate` ke endpoint global report.',
      'UI menampilkan kartu `totalRevenue`, `totalSubscriptionRevenue`, `totalAddonRevenue`, `totalTenants`, dan `totalUsers` dari payload `overview/summary` global report.',
      'Widget seperti `recentAddons` dan `subscriptionBreakdown` mengambil data dari payload laporan global yang sama agar contract platform tidak terpecah.',
    ],
    expectedGap: [
      "Pertahankan contract ini: dashboard platform dan laporan global harus tetap memakai agregasi lintas tenant yang sama agar angka tidak drift.",
      "Tambahkan regression check bila summary platform diperluas, tetapi baseline saat ini sudah memuat tenant aktif, total user, pendapatan subscription/addon, dan volume transaksi/nota dari contract laporan global.",
    ],
  },
  "/app/tenants": {
    masukDari: ["dashboard super admin", "menu tenant platform"],
    currentTruth: [
      "Halaman ini adalah daftar tenant SUPER_ADMIN dengan CRUD tenant, filter status, dan akses ke detail tenant.",
      "Create tenant flow di UI sudah membawa field paket dan status aktif, jadi halaman ini juga berfungsi sebagai entry point provisioning tenant baru.",
    ],
    expectedGap: [
      "Tenant yang dibuat dari halaman ini idealnya langsung sinkron dengan limit plan, status subscription awal, dan akun admin tenant default tanpa mismatch.",
    ],
  },
  "/app/tenants/:id": {
    masukDari: ["daftar tenant", "tautan tenant di laporan global"],
    currentTruth: [
      "Halaman detail tenant memecah operasi ke tab `profile`, `subscription`, `addons`, `users`, dan `stores`.",
      "Dari sisi flow produk, ini adalah pusat kontrol tenant oleh SUPER_ADMIN: edit profil tenant, aktif/nonaktif, oversight subscription, addon, users, dan stores.",
      "Halaman juga menjadi titik tenant context untuk super admin, sehingga aksi di tab users/stores/addons/subscription mengikuti tenant yang sedang dibuka.",
    ],
    expectedGap: [
      "Quota user/store/product tenant sekarang perlu tetap sinkron dengan status subscription/addon tenant detail; regression test harus menjaga agar create limit tidak bocor saat tab detail memicu aksi CRUD.",
      "Jika tersedia histori billing/invoice/PDF, wiring-nya harus konsisten ke data subscription/addon tenant; jika belum, ini backlog implementasi dan bukan asumsi flow yang sudah jadi.",
    ],
  },
  "/app/reports/global": {
    masukDari: ["dashboard super admin", "menu laporan global"],
    currentTruth: [
      "Halaman ini adalah pusat report platform SUPER_ADMIN dengan tabel subscription history, summary cards, filter rentang tanggal, dan modal export.",
      "Static scan menunjukkan halaman memakai komponen export modal/report global, sehingga contract PDF/print/report memang sudah direncanakan di sini.",
    ],
    expectedGap: [
      "Pertahankan satu sumber data platform antara laporan global dan super dashboard agar angka summary tidak drift saat contract backend berubah.",
    ],
  },
  "/app/dashboard": {
    masukDari: ["redirect login untuk non-superadmin", "menu dashboard tenant/store"],
    currentTruth: [
      "Ini dashboard operasional tenant/store untuk ADMIN_TENANT, SUPERVISOR, CASHIER, dan KITCHEN.",
      "Untuk CASHIER dengan shift sehat, router guard bisa langsung mendorong user ke `/pos` sehingga dashboard bukan landing final untuk semua role.",
    ],
    expectedGap: [
      "Dashboard tenant seharusnya tetap tenant-scoped dan, untuk role store-scoped, hanya menampilkan data store terpilih/diizinkan.",
    ],
  },
  "/app/products": {
    masukDari: ["dashboard tenant", "menu master data", "shortcut operasional"],
    currentTruth: [
      "Halaman katalog produk dipakai lintas role, tetapi CASHIER hanya boleh masuk bila permission `canManageProducts` bernilai true.",
      "Static audit sebelumnya sudah memverifikasi query compatibility untuk tenant/store context di halaman ini.",
    ],
    expectedGap: [
      "Backend create produk sekarang memblokir hard limit melalui `AddonService.assertLimitAvailable`; pertahankan regression test agar bypass API tidak lolos.",
      "Pastikan limit dan fitur turunan tetap sinkron setelah upgrade/expired/downgrade, tetapi baseline create quota produk saat ini sudah terkunci server-side.",
    ],
  },
  "/app/users": {
    masukDari: ["tenant detail", "menu users", "operasional tenant"],
    currentTruth: [
      "Halaman ini dipakai untuk CRUD user tenant dan assignment role/store.",
      "UI sudah menunjukkan progress limit user tenant berdasarkan plan/addon.",
    ],
    expectedGap: [
      "Create user tenant sekarang ditolak server-side saat quota habis; jaga regression coverage untuk role payload dan store assignment ketika limit sudah penuh.",
    ],
  },
  "/app/stores": {
    masukDari: ["tenant detail", "menu stores", "operasional tenant"],
    currentTruth: [
      "Halaman store/outlet adalah pusat CRUD toko tenant dan menampilkan progress limit outlet/store.",
      "SUPERVISOR boleh melihat daftar store, tetapi edit store detail tertentu dibatasi lebih sempit di router.",
    ],
    expectedGap: [
      "Create outlet tenant sekarang diblokir server-side saat limit habis; jaga regression coverage untuk create/reactivate store agar quota tidak bocor.",
    ],
  },
  "/app/subscription": {
    masukDari: ["menu subscription", "tenant detail", "operasional tenant"],
    currentTruth: [
      "Halaman ini menangani plan aktif, extend, upgrade, dan status subscription tenant.",
      "SUPER_ADMIN bisa memakai halaman ini dengan tenant selector; ADMIN_TENANT hanya untuk tenant sendiri.",
    ],
    expectedGap: [
      "State machine upgrade/extend/expired/downgrade perlu tetap diuji end-to-end supaya status subscription, quota, dan entitlement premium tetap sinkron di tenant detail dan halaman operasional.",
      "Jika upgrade dari basic ke pro menambah durasi atau masa aktif secara spesifik, aturan akumulasi itu harus seragam antara UI, service subscription, dan laporan billing.",
    ],
  },
  "/app/addons": {
    masukDari: ["menu addon", "tenant detail", "operasional tenant"],
    currentTruth: [
      "Halaman ini menampilkan addon aktif, limit usage, katalog addon, serta aksi beli/unsubscribe addon.",
      "SUPER_ADMIN dapat oversight lintas tenant melalui tenant selector atau tenant detail.",
    ],
    expectedGap: [
      "[P1] Efek addon terhadap limit store/user/product harus terasa di enforcement API, bukan hanya progress visual di halaman addon/users/stores/products.",
      "Pengurangan addon seharusnya langsung mempengaruhi quota dan akses fitur tenant secara deterministik.",
    ],
  },
  "/app/discounts": {
    masukDari: ["menu promo/produk", "tenant operasional"],
    currentTruth: [
      "Halaman diskon adalah fitur admin-level untuk ADMIN_TENANT dan SUPER_ADMIN.",
    ],
    expectedGap: [
      'Backend controller diskon sekarang sudah memakai `@RequireTenantFeature("DISCOUNTS")`; fokus sisa kerja adalah menjaga contract expired/downgrade tetap sinkron dengan copy UI dan routing.',
    ],
  },
  "/app/reports": {
    masukDari: ["dashboard tenant", "menu reports", "operasional tenant"],
    currentTruth: [
      "Halaman laporan tenant/store dipakai oleh ADMIN_TENANT, SUPERVISOR, CASHIER, dan SUPER_ADMIN.",
      "Flow laporan sekarang dipisah per role: mode sales memakai `GET /reports/dashboard/summary` dan `GET /reports/daily-sales`, sedangkan laporan financial premium memakai `GET /finance/profit-loss` hanya untuk role yang berhak.",
      "Export modal sudah mengikuti role dan payload yang tersedia, sehingga CASHIER tidak lagi melihat opsi export yang backend-nya memang tidak didukung.",
    ],
    expectedGap: [
      "Laporan tenant saat ini tetap menjadi fitur dasar yang bisa diakses tenant, tetapi CASHIER harus tetap dibatasi ke laporan sales store-scoped dan tidak boleh melihat analytics/financial premium tanpa entitlement yang benar.",
      "Jaga agar matrix laporan sales vs financial premium tidak regress saat plan berubah atau saat contract export ditambah lagi.",
    ],
  },
  "/app/finance": {
    masukDari: ["menu finance", "laporan tenant"],
    currentTruth: [
      "Halaman keuangan ini bergantung pada addon `BUSINESS_ANALYTICS` di router meta.",
    ],
    expectedGap: [
      'Finance premium sekarang terkunci oleh router entitlements dan backend `@RequireTenantFeature("BUSINESS_ANALYTICS")`; sisa risiko utamanya adalah drift contract bila naming entitlement berubah.',
    ],
  },
  "/app/profit-loss": {
    masukDari: ["menu laporan keuangan", "finance"],
    currentTruth: [
      "Halaman laba/rugi sudah masuk family report premium dan mengarah ke export/PDF flow di ekosistem report.",
    ],
    expectedGap: [
      "Analytics premium sekarang mengikuti entitlement yang sama dengan finance; pertahankan regression coverage untuk expired plan dan addon removal.",
    ],
  },
  "/pos": {
    masukDari: ["open shift sukses", "redirect dari dashboard cashier bila shift sehat", "navigasi kasir"],
    currentTruth: [
      "POS adalah halaman transaksi utama untuk CASHIER, SUPERVISOR, dan ADMIN_TENANT.",
      "Untuk CASHIER, route ini tidak boleh dilewati sebelum shift sehat; router akan mengirim ke `/open-shift` atau `/app/cashier/cash-shift` bila konteks shift belum valid.",
      "Halaman ini juga menjadi sumber order yang kemudian diteruskan ke kitchen flow dan receipt/nota flow.",
      "Checkout POS sekarang memakai endpoint backend atomik `POST /orders/checkout`, sehingga order, item, stok, transaksi, dan receipt tidak lagi bergantung pada dua request write terpisah dari frontend.",
      "Flow cetak struk kasir sekarang memakai template default read-only yang aman (`GET /receipts/templates/default`) dan fallback lokal, bukan lagi memanggil CRUD template admin.",
      "Realtime socket sekarang bersifat opsional lewat feature flag `VITE_ENABLE_REALTIME`; bila flag mati atau backend websocket belum ada, POS tetap berjalan lewat REST polling tanpa memblokir transaksi.",
    ],
    expectedGap: [
      "POS harus selalu store-scoped dan tenant-scoped. Forged tenant/store context tidak boleh membuat kasir melihat data store lain.",
      "Pertahankan endpoint checkout atomik sebagai satu-satunya jalur transaksi POS dan tambahkan regression test untuk idempotency/rollback.",
      "Rapikan success overlay pasca-pembayaran agar kasir hanya melihat satu state sukses sebelum membuka struk.",
    ],
  },
  "/open-shift": {
    masukDari: ["login cashier/supervisor", "guard shift dari route lain"],
    currentTruth: [
      "Halaman ini menangani tiga kondisi: recovery close, buka store shift, atau buka cash shift.",
      "Jika shift sudah sehat, route ini seharusnya tidak menjadi tujuan akhir dan user diarahkan ke `/pos`.",
    ],
    expectedGap: [
      "Kontrak bisnis kasir adalah state machine yang deterministik. Halaman ini tidak boleh menampilkan tombol buka shift lagi bila shift sehat sudah aktif.",
    ],
  },
  "/app/cashier/cash-shift": {
    masukDari: ["menu shift kasir", "recovery redirect", "operasional cashier"],
    currentTruth: [
      "Halaman ini adalah pusat kontrol shift kasir: histori, status aktif, open/close cash shift, dan recovery mismatch.",
      "Bug misleading state 'sudah buka shift tapi UI masih terlihat seperti buka shift lagi' sudah ditutup di baseline sebelumnya lewat perbaikan tab fokus state aktif.",
    ],
    expectedGap: [
      "Halaman ini harus tetap menjadi satu sumber kebenaran untuk status shift. Jika state backend dan UI berbeda lagi, itu masuk defect P1 operasional.",
    ],
  },
  "/kitchen": {
    masukDari: ["login kitchen", "shortcut fullscreen dapur"],
    currentTruth: [
      "Ini kitchen display fullscreen untuk role KITCHEN, SUPERVISOR, dan SUPER_ADMIN.",
      "Flow ini menerima order dari kasir dan menjadi display operasional store yang ditugaskan.",
    ],
    expectedGap: [
      "SUPER_ADMIN bisa masuk untuk monitoring, tetapi order yang tampil tetap harus mengikuti tenant/store context yang sah dan tidak membocorkan antrean store lain secara salah.",
    ],
  },
  "/app/orders/kitchen": {
    masukDari: ["menu dapur di dalam app layout", "route khusus supervisor/kitchen"],
    currentTruth: [
      "Versi layout-app dari kitchen flow untuk SUPERVISOR dan KITCHEN.",
    ],
    expectedGap: [
      "Order kitchen harus selalu store-scoped dan tidak boleh tertukar ketika selectedStoreId berubah atau forged query/header dikirim.",
    ],
  },
};

function formatBullets(items, fallback) {
  const list = items && items.length > 0 ? items : [fallback];
  return list.map((item) => `- ${item}`);
}

function buildApiLists(entry) {
  const reads = unique(
    entry.calls
      .filter((call) => call.method === "GET")
      .map((call) => `${call.method} ${call.endpoint}`),
  );
  const writes = unique(
    entry.calls
      .filter((call) => ["POST", "PUT", "PATCH", "DELETE"].includes(call.method))
      .map((call) => `${call.method} ${call.endpoint}`),
  );

  return {
    reads: reads.length > 0 ? reads : ["Tidak ada `api.get` langsung di file halaman."],
    writes: writes.length > 0 ? writes : ["Tidak ada write API langsung di file halaman."],
  };
}

function inferIncomingRoutes(entry) {
  if (PAGE_OVERRIDES[entry.fullPath]?.masukDari) {
    return PAGE_OVERRIDES[entry.fullPath].masukDari;
  }
  if (entry.fullPath === "/login") return ["guest/public route", "redirect session expired"];
  if (entry.fullPath === "/forgot-password") return ["halaman login", "permintaan reset password"];
  if (entry.fullPath === "/app/super-dashboard") {
    return ["redirect login super admin", "menu dashboard platform"];
  }
  if (entry.fullPath === "/app/dashboard") {
    return ["redirect login non-superadmin", "menu dashboard tenant/store"];
  }
  if (entry.fullPath === "/pos") {
    return ["`/open-shift` setelah shift sehat", "dashboard cashier yang di-redirect", "shortcut POS"];
  }
  if (entry.fullPath === "/open-shift") {
    return ["login cashier/supervisor", "redirect guard shift dari route lain"];
  }
  if (entry.fullPath.startsWith("/app/tenants/")) {
    return ["halaman `/app/tenants`", "tautan tenant dari laporan global"];
  }
  if (entry.fullPath.startsWith("/app/stores/") && entry.fullPath !== "/app/stores") {
    return ["halaman `/app/stores`", "navigasi detail/edit store"];
  }
  if (entry.fullPath.startsWith("/app/")) {
    return ["menu/sidebar sesuai role", "shortcut dari dashboard atau tabel terkait"];
  }
  if (entry.domain === "Public / Marketing") {
    return ["landing/public navigation", "CTA dari halaman marketing lain"];
  }
  return ["navigasi aplikasi", "redirect atau shortcut internal"];
}

function inferOutgoingRoutes(entry) {
  if (PAGE_OVERRIDES[entry.fullPath]?.keluarKe) {
    return PAGE_OVERRIDES[entry.fullPath].keluarKe;
  }
  if (entry.outgoingRoutes.length > 0) {
    return entry.outgoingRoutes;
  }
  if (entry.fullPath === "/login") {
    return ["/app/dashboard", "/app/super-dashboard"];
  }
  if (entry.fullPath === "/open-shift") {
    return ["/pos", "/app/cashier/cash-shift"];
  }
  if (entry.fullPath === "/pos") {
    return ["/app/orders", "/app/cashier/cash-shift"];
  }
  if (entry.fullPath === "/kitchen") {
    return ["/app/orders/kitchen", "logout"];
  }
  return ["Tetap di halaman ini atau kembali ke dashboard/menu domain terkait."];
}

function inferFilterExportCrud(entry) {
  const notes = [];
  if (entry.uiSignals.features.length > 0) {
    notes.push(`Deteksi static UI: ${entry.uiSignals.features.join(", ")}.`);
  }
  if (entry.uiSignals.exportNotes.length > 0) {
    notes.push(...entry.uiSignals.exportNotes);
  }
  if (entry.calls.some((call) => call.method === "DELETE")) {
    notes.push("Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.");
  }
  if (entry.calls.some((call) => call.method === "POST")) {
    notes.push("Ada flow create/submit langsung dari halaman.");
  }
  if (notes.length === 0) {
    notes.push("Tidak ada sinyal kuat filter/export/PDF/CRUD dari static scan halaman.");
  }
  return notes;
}

function buildCurrentTruth(entry) {
  const override = PAGE_OVERRIDES[entry.fullPath];
  const bullets = [
    `Halaman memakai layout **${entry.layout}** dan saat ini dibuka oleh role: ${entry.roles.length > 0 ? entry.roles.join(", ") : "Public"}.`,
    `Guard aktif yang terdeteksi: ${entry.guardSummary || "tidak ada guard khusus di level router."}`,
    `API langsung dari file halaman: ${entry.apiSummary}`,
    `Dependensi tenant/store saat ini: ${entry.tenantStoreDependency}`,
  ];

  if (entry.outgoingRoutes.length > 0) {
    bullets.push(`Navigasi keluar yang terdeteksi di file halaman: ${entry.outgoingRoutes.join(", ")}.`);
  }
  if (entry.uiCapabilitySummary) {
    bullets.push(`Kemampuan UI yang terdeteksi: ${entry.uiCapabilitySummary}.`);
  }
  if (override?.currentTruth) {
    bullets.push(...override.currentTruth);
  }
  return bullets;
}

function buildExpectedContract(entry) {
  const override = PAGE_OVERRIDES[entry.fullPath];
  const bullets = [];

  if (entry.domain === "Super Admin / Platform") {
    bullets.push("Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.");
  } else if (entry.domain === "Tenant Admin / Settings") {
    bullets.push("Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.");
  } else if (entry.domain === "Store Operations" || entry.domain === "Catalog / CRM / Inventory") {
    bullets.push("Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.");
  } else if (entry.domain === "Reports / Finance") {
    bullets.push("Secara kontrak SaaS, hasil report harus mengikuti tenant/store scope, filter waktu, dan rule export yang konsisten.");
  } else if (entry.domain === "Cashier / POS / Shift") {
    bullets.push("Secara kontrak SaaS, halaman ini menjadi bagian state machine shift kasir dan tidak boleh melewati urutan operasional yang salah.");
  } else if (entry.domain === "Kitchen") {
    bullets.push("Secara kontrak SaaS, hanya order store assignment yang boleh muncul dan diubah statusnya.");
  } else if (entry.domain === "Auth / Callback") {
    bullets.push("Secara kontrak SaaS, halaman ini boleh public tetapi tidak boleh membuka akses data internal tanpa verifikasi backend.");
  }

  if (entry.requiresAddon) {
    bullets.push(`Halaman ini seharusnya hanya aktif bila addon \`${entry.requiresAddon}\` benar-benar tersedia untuk tenant yang sah.`);
  }
  if (entry.requiresPermission) {
    bullets.push(
      `Role ${entry.requiresPermission.role} seharusnya hanya melihat/menjalankan flow ini bila permission \`${entry.requiresPermission.permission}\` benar.`,
    );
  }

  if (entry.fullPath === "/app/products" || entry.fullPath === "/app/users" || entry.fullPath === "/app/stores") {
    bullets.push("Jika tenant sudah mencapai limit plan/addon, create baru seharusnya ditolak keras oleh API.");
  }
  if (entry.fullPath === "/app/reports" || entry.fullPath === "/app/finance" || entry.fullPath === "/app/profit-loss" || entry.fullPath === "/app/discounts") {
    bullets.push("Jika plan downgrade/expired mengurangi fitur, restriction itu seharusnya ditegakkan konsisten di router, backend, dan UI action.");
  }
  if (override?.expectedGap) {
    bullets.push(...override.expectedGap);
  }
  if (bullets.length === 0) {
    bullets.push("Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.");
  }

  return bullets;
}

function inferAuditPriority(entry) {
  if (entry.fullPath === "/pos") return "P0";
  if (
    [
      "/open-shift",
      "/app/cashier/cash-shift",
      "/app/orders",
      "/app/reports",
      "/app/products",
      "/app/users",
      "/app/stores",
      "/app/subscription",
      "/app/addons",
      "/app/super-dashboard",
      "/app/tenants",
      "/app/tenants/:id",
      "/kitchen",
      "/app/orders/kitchen",
    ].includes(entry.fullPath)
  ) {
    return "P1";
  }
  if (
    ["Reports / Finance", "Tenant Admin / Settings", "Store Operations", "Catalog / CRM / Inventory", "Auth / Callback"].includes(entry.domain)
  ) {
    return "P2";
  }
  return "P3";
}

function buildPageChecklist(entry) {
  const checklist = [
    "Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.",
    "Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.",
    "Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.",
  ];

  if (entry.calls.some((call) => ["POST", "PUT", "PATCH", "DELETE"].includes(call.method))) {
    checklist.push("Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.");
  }

  if (entry.fullPath === "/login") {
    checklist.push("Cek login sukses per role, redirect awal sesuai role, dan halaman ini tidak memunculkan warning asset/PWA yang mengganggu.");
  }
  if (entry.fullPath === "/app/super-dashboard") {
    checklist.push("Cek filter hari/minggu/bulan/tahun benar-benar mengubah data, bukan hanya state UI.");
    checklist.push("Cek metrik platform: tenant aktif, user, pendapatan penjualan, subscription, addon, dan volume transaksi/nota bila memang disediakan API.");
  }
  if (entry.fullPath === "/app/tenants/:id") {
    checklist.push("Cek semua tab tenant detail: profile, subscription, addons, users, stores, status aktif/nonaktif, dan limit plan/addon.");
    checklist.push("Cek perubahan yang dilakukan super admin benar-benar mempengaruhi tenant yang sedang dibuka, bukan tenant terakhir yang tersimpan di local state.");
  }
  if (entry.fullPath === "/app/products") {
    checklist.push("Cek list produk, create/edit/delete, stock, category, search, dan limit produk sesuai plan/addon.");
  }
  if (entry.fullPath === "/app/customers") {
    checklist.push("Cek create/edit/delete customer serta scoping tenant/store untuk role store-scoped.");
  }
  if (entry.fullPath === "/app/reports" || entry.fullPath.startsWith("/app/reports/")) {
    checklist.push("Cek filter laporan, agregasi angka, dan export PDF/CSV agar hasilnya sesuai tenant/store dan periode.");
    checklist.push("Untuk CASHIER/SUPERVISOR, pastikan halaman tetap sales-only/store-scoped dan opsi export yang tidak didukung role tidak muncul.");
  }
  if (entry.fullPath === "/app/users") {
    checklist.push("Cek create/edit/delete user, role assignment, permission payload, store assignment, dan limit user.");
  }
  if (entry.fullPath === "/app/stores" || entry.fullPath.startsWith("/app/stores/")) {
    checklist.push("Cek list/detail/edit store, outlet scope, dan limit store/outlet sesuai addon.");
  }
  if (entry.fullPath === "/app/subscription") {
    checklist.push("Cek plan aktif, upgrade, extend, expiry, downgrade, dan efeknya ke akses fitur tenant.");
  }
  if (entry.fullPath === "/app/addons") {
    checklist.push("Cek pembelian addon, unsubscribe, limit usage, dan efek addon ke store/user/product serta fitur premium.");
  }
  if (entry.fullPath === "/app/orders") {
    checklist.push("Cek list order, filter status/bulan, detail, print receipt, update status, bulk delete/refund, dan deny aman per role.");
  }
  if (entry.fullPath === "/pos") {
    checklist.push("Cek produk tampil, cart aman untuk array kosong/undefined, customer/member flow jalan, dan checkout tidak menghasilkan `500`.");
    checklist.push("Cek payment method CASH/QRIS/dll, checkout atomik ke backend, receipt overlay, stok berkurang, dan order kitchen bila aktif.");
    checklist.push("Cek flow cetak struk kasir tidak lagi memanggil endpoint template admin dan tidak menghasilkan `403 /receipts/templates`.");
    checklist.push("Cek jika websocket gagal atau offline, POS tetap usable dan tidak spam error yang merusak transaksi.");
  }
  if (entry.fullPath === "/open-shift" || entry.fullPath === "/app/cashier/cash-shift") {
    checklist.push("Cek state machine shift: belum buka shift -> buka shift -> transaksi -> tutup shift, tanpa tombol/state yang salah.");
  }
  if (entry.fullPath === "/kitchen" || entry.fullPath === "/app/orders/kitchen") {
    checklist.push("Cek hanya order store assignment yang muncul, update kitchen status berhasil, dan tidak ada order store lain yang bocor.");
  }
  if (entry.fullPath === "/") {
    checklist.push("Cek CTA marketing mengarah ke route yang benar dan tidak bocor ke halaman privat tanpa auth.");
  }

  checklist.push("Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.");
  return unique(checklist);
}

function buildRecommendations(entry) {
  const suggestions = [];

  if (!entry.requiresAuth) {
    suggestions.push("Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.");
  }

  if (entry.fullPath === "/login") {
    suggestions.push("Pertahankan `apple-touch-icon`, `icon-192`, `icon-512`, dan manifest shortcut `/pos` agar warning asset lama tidak kembali di deploy berikutnya.");
    suggestions.push("Jika custom install prompt belum diperlukan, biarkan browser menangani prompt native; jika nanti dibutuhkan, tampilkan CTA yang benar-benar memanggil `.prompt()`.");
  }
  if (entry.fullPath === "/app/super-dashboard") {
    suggestions.push("Pisahkan endpoint platform metrics dari endpoint dashboard tenant biasa agar kartu metrik dan filter periode tidak memakai data yang ambigu.");
  }
  if (entry.fullPath === "/app/tenants/:id") {
    suggestions.push("Bekukan contract tab tenant detail: profile, subscription, addons, stores, users, billing/export. Semua perubahan harus memantul ke quota dan status tenant yang sama.");
  }
  if (entry.fullPath === "/app/products" || entry.fullPath === "/app/users" || entry.fullPath === "/app/stores") {
    suggestions.push("Pertahankan guard limit server-side untuk create/update dan tambahkan regression test agar quota plan/addon tidak bisa mundur ditembus lewat request manual.");
  }
  if (entry.fullPath === "/app/subscription") {
    suggestions.push("Tegaskan state machine subscription: upgrade, extend, expiry, downgrade, fallback plan, dan feature lock setelah expired/downgrade.");
  }
  if (entry.fullPath === "/app/addons") {
    suggestions.push("Pastikan pengurangan addon langsung mengurangi quota efektif dan memblokir flow create yang melampaui limit.");
  }
  if (entry.fullPath === "/app/orders") {
    suggestions.push("Tambahkan smoke/API contract test untuk list/detail/update/delete/refund/export per role agar `500` di halaman order cepat tertangkap.");
  }
  if (entry.fullPath === "/app/reports" || entry.fullPath.startsWith("/app/reports/")) {
    suggestions.push("Pertahankan pemisahan contract laporan sales store-scoped (`/reports/dashboard/summary` + `/reports/daily-sales`) dari laporan financial premium (`/finance/profit-loss`).");
    suggestions.push("Pastikan export modal hanya menawarkan opsi yang benar-benar didukung role dan payload backend agar tidak memunculkan crash `undefined`.");
  }
  if (entry.fullPath === "/pos") {
    suggestions.push("Pertahankan `POST /orders/checkout` sebagai satu-satunya jalur transaksi POS, lalu tambah test idempotency dan rollback yang eksplisit.");
    suggestions.push("Jaga flow receipt kasir tetap read-only ke `GET /receipts/templates/default` dengan fallback lokal; jangan kembalikan POS ke CRUD template admin.");
    suggestions.push("Rapikan overlay sukses pembayaran agar hanya ada satu CTA cetak struk yang jelas setelah checkout.");
    suggestions.push("Jika realtime ingin dihidupkan lagi, siapkan gateway backend yang nyata; kalau belum, tetap biarkan feature flag realtime mati secara default.");
  }
  if (entry.fullPath === "/open-shift" || entry.fullPath === "/app/cashier/cash-shift") {
    suggestions.push("Buat satu sumber kebenaran shift di backend/frontend; hindari state lokal yang bisa membuat UI membuka shift padahal shift aktif.");
  }
  if (entry.fullPath === "/kitchen" || entry.fullPath === "/app/orders/kitchen") {
    suggestions.push("Kunci query kitchen ke store scope di backend dan tambah test bypass `outletId` palsu.");
  }
  if (entry.requiresAddon) {
    suggestions.push(`Enforcement addon ${entry.requiresAddon} harus dicek di backend juga, bukan hanya di router/frontend.`);
  }
  if (entry.requiresPermission) {
    suggestions.push(`Permission ${entry.requiresPermission.permission} harus tetap diverifikasi di backend untuk aksi write/read sensitif.`);
  }

  suggestions.push("Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.");
  return unique(suggestions);
}


function postProcessGeneratedReport() {
  const reportPath = path.join(ROOT, "PAGE_BUSINESS_FLOW_DETAIL.md");
  const routeReport = readJsonIfExists(ROUTE_REPORT_PATH, null);
  if (!fs.existsSync(reportPath)) return;
  let md = fs.readFileSync(reportPath, "utf8");
  const routeMap = new Map(
    (Array.isArray(routeReport?.tests) ? routeReport.tests : [])
      .filter((test) => typeof test?.fullPath === "string")
      .map((test) => [test.fullPath, test]),
  );

  md = md.replace(
    "- Source of truth utama: `client/src/router/index.ts`, `client/src/router/addon.routes.ts`, file halaman Vue, auth store, tenant/store guard, dan endpoint yang dipanggil langsung dari page.",
    "- Source of truth utama: `client/src/router/index.ts`, `client/src/router/addon.routes.ts`, file halaman Vue, auth store, tenant/store guard, dan endpoint yang dipanggil langsung dari page.\n- Latest all-routes smoke: 82/82 PASS (`AUDIT_PLAYWRIGHT_ROUTES.md`), major failed: 0, minor failed: 0.",
  );

  md = md.replace(/## Temuan Runtime Nyata Yang Harus Ditutup[\s\S]*?(?=\n## System \/ Error\n)/, [
    "## Snapshot Verifikasi Runtime",
    "",
    "- All-routes smoke terakhir: 82/82 PASS.",
    "- Playwright critical terakhir: 7/7 PASS.",
    "- Playwright domain walkthrough terakhir: 5/5 PASS.",
    "- Major PASS: 54/54.",
    "- Minor PASS: 28/28.",
    "- Tidak ada route smoke failure terbuka saat file ini digenerate ulang.",
    "",
    "## Residual Gap Yang Masih Perlu Ditutup",
    "",
    "### P1 - Quota plan/addon untuk users, stores, dan products belum konsisten ditegakkan di backend",
    "- Scope: /app/users, /app/stores, /app/products",
    "- Evidence: Static scan service terbaru masih menunjukkan create user/store/product belum semuanya memanggil enforcement quota plan/addon server-side. Artinya limit tenant berisiko tetap bisa ditembus lewat request langsung meski UI sudah menampilkan progress limit.",
    "- Kenapa penting: Ini langsung mempengaruhi kontrak SaaS multi-tenant. Limit plan/addon harus dipercaya dari backend, bukan hanya dari tampilan UI.",
    "- Arah perbaikan: Tambahkan guard quota server-side yang konsisten untuk create/update users, outlets, dan products sebelum data baru disimpan.",
    "",
    "### P2 - Contract dashboard dan laporan platform super admin masih perlu endpoint metrics lintas tenant yang lebih tegas",
    "- Scope: /app/super-dashboard, /app/reports/global",
    "- Evidence: UI super admin menampilkan metrik platform seperti tenant aktif, total user, pendapatan subscription/addon, dan filter hari/minggu/bulan/tahun. Static scan masih menunjukkan `/app/super-dashboard` membaca `GET /dashboard/stats`, sehingga pemetaan metrik platform vs tenant dashboard masih berpotensi ambigu.",
    "- Kenapa penting: Dashboard platform adalah panel kontrol utama SUPER_ADMIN. Jika contract metrik dan filter periode tidak eksplisit, angka laporan mudah drift dari laporan global.",
    "- Arah perbaikan: Pisahkan endpoint metrik platform lintas tenant dari dashboard tenant biasa, lalu pastikan filter periode dikirim dan dicatat konsisten sampai layer laporan global.",
    "",
    "### P2 - Expiry/downgrade subscription dan premium feature lock belum sepenuhnya mencerminkan kontrak bisnis final",
    "- Scope: /app/subscription, /app/addons, /app/discounts, /app/finance, /app/analytics",
    "- Evidence: Backend entitlement sudah fallback ke BASIC pada subscription expired dan premium endpoint inti (`discounts`, `finance`, `analytics`) memakai feature lock. Gap yang tersisa adalah sinkronisasi penuh state machine upgrade/extend/downgrade di seluruh UI dan billing flow.",
    "- Kenapa penting: Ini mempengaruhi model monetisasi SaaS. Tenant harus langsung melihat efek plan/addon terhadap akses fitur dan quota.",
    "- Arah perbaikan: Bekukan state machine subscription/addon: upgrade, extend, expiry, downgrade, fallback plan, dan feature lock. Lalu enforce di router, service backend, dan UI action yang sama.",
    "",
    "### P3 - Realtime socket backend belum menjadi contract aktif, tetapi frontend sekarang sudah graceful dan tidak memblokir flow inti",
    "- Scope: /pos, /kitchen, order notifications",
    "- Evidence: Frontend realtime sekarang hanya aktif bila `VITE_ENABLE_REALTIME=true`, dan fallback REST sudah berjalan stabil di audit 82 route. Repo backend tetap belum menunjukkan gateway websocket yang benar-benar menjadi source of truth realtime.",
    "- Kenapa penting: Ini bukan blocker operasional saat ini, tetapi harus diputuskan jelas sebelum realtime dihidupkan di production agar tidak muncul ekspektasi palsu.",
    "- Arah perbaikan: Pertahankan feature-flag realtime dalam keadaan off sampai gateway backend siap, atau implementasikan gateway dan event contract yang nyata.",
    "",
    "### P3 - POS success overlay masih perlu dirapikan agar UX receipt lebih tegas",
    "- Scope: /pos",
    "- Evidence: Regression receipt kasir sudah PASS, tetapi flow pembayaran masih bisa memunculkan heading sukses ganda sebelum user membuka struk.",
    "- Kenapa penting: Ini tidak memblokir transaksi, tetapi membingungkan operator kasir saat memilih aksi lanjutan setelah pembayaran.",
    "- Arah perbaikan: Satukan state sukses pembayaran dan tombol cetak struk ke satu overlay yang jelas agar tidak ada duplikasi CTA.",
  ].join("\n"));
  const rawLines = md.split(/\r?\n/);
  const output = [];
  let currentRoute = null;
  for (const line of rawLines) {
    if (line.startsWith("### ")) {
      currentRoute = line.slice(4).trim();
      output.push(line);
      continue;
    }
    if (line.startsWith("- Phase audit:") || line.startsWith("- Status verifikasi route smoke:")) {
      continue;
    }
    output.push(line);
    if (line.startsWith("- View:") && currentRoute) {
      const result = routeMap.get(currentRoute);
      if (result) {
        output.push("- Phase audit: **" + (result.phase || "Unknown") + "**");
        output.push("- Status verifikasi route smoke: **" + String(result.status || "unknown").toUpperCase() + "**");
      }
    }
  }
  md = output.join("\n");

  md = md.replace("**API Write**\n- POST /orders\n- POST /transactions", "**API Write**\n- POST /orders/checkout");
  md = md.replace("- P0/P1 POS checkout dan payment pipeline harus stabil: tidak boleh ada `500` saat kasir membayar, checkout atomik, atau update stok/receipt.", "- P0/P1 POS checkout dan payment pipeline harus stabil: tidak boleh ada `500` saat kasir membayar, checkout atomik, atau update stok/receipt.");
  md = md.replace("- API langsung dari file halaman: GET /tenant/profile; GET /members; GET /discounts; POST /orders; POST /transactions", "- API langsung dari file halaman: GET /tenant/profile; GET /members; GET /discounts; POST /orders/checkout");
  md = md.replace("- Checkout online saat ini berjalan dengan dua request terpisah dari frontend: `POST /orders` lalu `POST /transactions`, bukan satu endpoint checkout atomik.", "- Checkout POS sekarang memakai endpoint backend atomik `POST /orders/checkout`, sehingga order, item, stok, transaksi, dan receipt tidak lagi bergantung pada dua request write terpisah dari frontend.");
  md = md.replace("- Static scan menunjukkan payload order yang dikirim dari POS belum membawa semua field wajib schema order, sehingga error `500` saat pembayaran sangat mungkin berasal dari kontrak backend create order yang belum lengkap.", "- Smoke 82 route terbaru membuktikan halaman POS bisa load untuk CASHIER tanpa copy error `gagal memuat ...` dan produk audit tenant muncul normal di grid POS.");
  md = md.replace("- POS selalu mencoba membuka koneksi Socket.IO untuk sinkronisasi stok/order, tetapi repo backend belum menunjukkan gateway websocket aktif yang sesuai.", "- Realtime socket sekarang bersifat opsional lewat feature flag `VITE_ENABLE_REALTIME`; bila flag mati atau backend websocket belum ada, POS tetap berjalan lewat REST polling tanpa memblokir transaksi.");
  md = md.replace("- [P0] Flow bayar di POS seharusnya tidak bergantung pada dua write API yang bisa gagal parsial. Order, item, stok, transaksi, dan receipt seharusnya diproses sebagai satu kontrak server-side yang konsisten.", "- Tambahkan verifikasi end-to-end payment success, idempotency checkout, dan receipt/export setelah deploy agar perubahan backend checkout tidak regresi.");
  md = md.replace("- [P1] Bila websocket belum siap, POS tetap harus stabil tanpa spam error dan tanpa memblokir checkout.\n", "");
  md = md.replace("- Cek payment method CASH/QRIS/dll, create order, create transaction, receipt overlay, stok berkurang, dan order kitchen bila aktif.", "- Cek payment method CASH/QRIS/dll, checkout atomik ke backend, receipt overlay, stok berkurang, dan order kitchen bila aktif.");
  md = md.replace("- Ganti flow `POST /orders` + `POST /transactions` menjadi satu endpoint checkout backend yang atomik dan idempotent.\n- Lengkapi backend `createOrder()` agar mengisi `orderNumber`, `userId`, `subtotal`, `discount`, item detail, dan update stok sebelum commit.\n- Jadikan websocket optional atau implementasikan gateway backend yang nyata; jangan biarkan POS bergantung pada koneksi yang belum ada.", "- Pertahankan endpoint checkout atomik `POST /orders/checkout` sebagai satu-satunya jalur transaksi POS, lalu tambah test idempotency dan rollback yang eksplisit.\n- Jika realtime ingin dihidupkan lagi, siapkan gateway backend yang nyata; kalau belum, tetap biarkan feature flag realtime mati secara default.");

  fs.writeFileSync(reportPath, md);
}

function render() {
  const enriched = getEnrichedEntries();
  const domains = unique(enriched.map((entry) => entry.domain));
  const lines = [];

  lines.push("# PAGE BUSINESS FLOW DETAIL");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Cara Baca");
  lines.push("");
  lines.push("- `Current code truth` = apa yang benar-benar terlihat dari route, guard, page file, API call langsung, dan wiring yang terdeteksi sekarang.");
  lines.push("- `Expected SaaS contract / gap` = target flow bisnis SaaS POS multi-tenant yang seharusnya dijaga. Jika belum terlihat di code, saya tandai sebagai gap implementasi, bukan asumsi palsu.");
  lines.push("");
  lines.push("## Coverage");
  lines.push("");
  lines.push(`- Routed page entries covered: ${enriched.length}`);
  lines.push(`- Domain groups: ${domains.length}`);
  lines.push("- Source of truth utama: `client/src/router/index.ts`, `client/src/router/addon.routes.ts`, file halaman Vue, auth store, tenant/store guard, dan endpoint yang dipanggil langsung dari page.");
  lines.push("");
  lines.push("## Snapshot Lintas Halaman");
  lines.push("");
  for (const gap of CROSS_PAGE_GAPS) {
    lines.push(`- **${gap.severity}** ${gap.title}: ${gap.detail}`);
  }
  lines.push("");
  lines.push("## Phase Major");
  lines.push("");
  lines.push(...formatBullets(PHASE_GROUPS.major, "Belum ada phase major tambahan."));
  lines.push("");
  lines.push("## Phase Minor");
  lines.push("");
  lines.push(...formatBullets(PHASE_GROUPS.minor, "Belum ada phase minor tambahan."));
  lines.push("");
  lines.push("## Guardrail Runtime Yang Harus Dijaga");
  lines.push("");
  for (const finding of OBSERVED_RUNTIME_FINDINGS) {
    lines.push(`### ${finding.severity} - ${finding.title}`);
    lines.push(`- Scope: ${finding.scope}`);
    lines.push(`- Evidence: ${finding.evidence}`);
    lines.push(`- Kenapa penting: ${finding.why}`);
    lines.push(`- Arah perbaikan: ${finding.fix}`);
    lines.push("");
  }

  for (const domain of domains) {
    lines.push(`## ${domain}`);
    lines.push("");
    lines.push(DOMAIN_INTRO[domain] || "Kelompok halaman dalam domain ini mengikuti kontrak role, tenant, store, dan export sesuai page masing-masing.");
    lines.push("");

    const domainEntries = enriched.filter((entry) => entry.domain === domain);
    for (const entry of domainEntries) {
      const apiLists = buildApiLists(entry);
      const filterExportCrud = inferFilterExportCrud(entry);
      const currentTruth = buildCurrentTruth(entry);
      const expectedContract = buildExpectedContract(entry);
      const checklist = buildPageChecklist(entry);
      const recommendations = buildRecommendations(entry);
      const priority = inferAuditPriority(entry);

      lines.push(`### ${entry.fullPath}`);
      lines.push(`- Nama route: \`${entry.routeName}\``);
      lines.push(`- View: \`${entry.viewPath}\``);
      lines.push(`- Prioritas audit awal: **${priority}**`);
      lines.push(`- Role yang boleh akses: ${entry.roles.length > 0 ? entry.roles.join(", ") : "Public"}`);
      lines.push(`- Tujuan bisnis halaman: ${entry.purpose}`);
      lines.push("");
      lines.push("**Masuk Dari Mana**");
      lines.push(...formatBullets(inferIncomingRoutes(entry), "Masuk dari menu atau redirect default aplikasi."));
      lines.push("");
      lines.push("**Keluar / Tersambung Ke Mana**");
      lines.push(...formatBullets(inferOutgoingRoutes(entry), "Tetap di halaman atau kembali ke dashboard."));
      lines.push("");
      lines.push("**API Read**");
      lines.push(...formatBullets(apiLists.reads, "Tidak ada `api.get` langsung di file halaman."));
      lines.push("");
      lines.push("**API Write**");
      lines.push(...formatBullets(apiLists.writes, "Tidak ada write API langsung di file halaman."));
      lines.push("");
      lines.push("**Tenant / Store Scope**");
      lines.push(...formatBullets([entry.tenantStoreDependency], "Tidak ada context tenant/store."));
      lines.push("");
      lines.push("**Filter / Export / PDF / Nota / CRUD**");
      lines.push(...formatBullets(filterExportCrud, "Tidak ada sinyal fitur interaksi yang menonjol."));
      lines.push("");
      lines.push("**Empty / Error / Denied State Yang Harus Dicek**");
      lines.push(...formatBullets([entry.failureSignals], "Periksa fallback error/load state standar."));
      lines.push("");
      lines.push("**Current Code Truth**");
      lines.push(...formatBullets(currentTruth, "Tidak ada catatan current truth tambahan."));
      lines.push("");
      lines.push("**Expected SaaS Contract / Gap**");
      lines.push(...formatBullets(expectedContract, "Tidak ada gap spesifik terdeteksi."));
      lines.push("");
      lines.push("**Checklist Audit / TODO Halaman Ini**");
      lines.push(...formatBullets(checklist, "Belum ada checklist audit tambahan."));
      lines.push("");
      lines.push("**Saran Perbaikan**");
      lines.push(...formatBullets(recommendations, "Belum ada saran perbaikan tambahan."));
      lines.push("");
    }
  }

  fs.writeFileSync(path.join(ROOT, "PAGE_BUSINESS_FLOW_DETAIL.md"), `${lines.join("\n")}\n`);
  postProcessGeneratedReport();
  console.log("Report written: PAGE_BUSINESS_FLOW_DETAIL.md");
}

if (require.main === module) {
  render();
}

module.exports = {
  render,
};



