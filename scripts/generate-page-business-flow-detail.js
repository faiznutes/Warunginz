#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { ROOT, getEnrichedEntries, unique } = require("./page-audit-shared");

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
    title: "Super admin dashboard belum benar-benar memakai contract platform metrics",
    detail:
      "`/app/super-dashboard` memanggil `GET /dashboard/stats`, sedangkan UI menampilkan metrik platform seperti pendapatan langganan, addon, tenant aktif, total user, dan filter hari/minggu/bulan/tahun. Static scan menunjukkan filter belum dikirim ke API dan beberapa field tidak dijamin tersedia dari endpoint itu.",
  },
  {
    severity: "P1",
    title: "Limit addon/subscription terlihat di UI, tetapi enforcement create belum keras di backend",
    detail:
      "Halaman users/stores/products sudah menampilkan limit, namun create service untuk user/store/product belum terlihat memanggil guard limit server-side. Artinya tenant bisa berpotensi melewati limit bila request langsung dikirim ke API yang lolos validasi lain.",
  },
  {
    severity: "P2",
    title: "Expiry/downgrade subscription belum memblokir ADMIN_TENANT sesuai kontrak bisnis SaaS yang diinginkan",
    detail:
      "Guard subscription saat ini masih memberi bypass pada ADMIN_TENANT. Kontrak bisnis yang kamu jelaskan mengarah ke mode restricted-access setelah expired/downgrade, tetapi enforcement granular itu belum sepenuhnya terlihat di static audit.",
  },
  {
    severity: "P2",
    title: "Addon analytics masih punya bypass frontend untuk ADMIN_TENANT",
    detail:
      "Route yang memakai `requiresAddon: BUSINESS_ANALYTICS` masih diperlakukan sebagai addon dasar untuk ADMIN_TENANT di router guard. Jika kontrak bisnis final ingin fitur tertentu benar-benar terkunci setelah downgrade/addon tidak aktif, ini masih perlu penguatan.",
  },
];

const PAGE_OVERRIDES = {
  "/app/super-dashboard": {
    masukDari: [
      "redirect login untuk SUPER_ADMIN",
      "menu dashboard platform",
      "navigasi ulang dari halaman platform lain",
    ],
    currentTruth: [
      "Halaman memakai `GET /dashboard/stats` sebagai satu-satunya API langsung yang terdeteksi di file halaman.",
      "Tombol filter `Hari Ini / Minggu / Bulan / Tahun` mengubah state lokal lalu memanggil loader yang sama, tetapi static scan di file halaman tidak menemukan query period dikirim ke API.",
      "UI menampilkan kartu `totalRevenue`, `totalSubscriptionRevenue`, `totalAddonRevenue`, `totalTenants`, dan `totalUsers`, namun tidak semua field itu dijamin berasal dari endpoint `/dashboard/stats` yang tenant-oriented.",
      "Widget seperti `recentAddons` dan `subscriptionBreakdown` bergantung pada data statistik/global report, tetapi file halaman tidak memanggil endpoint global report secara langsung.",
    ],
    expectedGap: [
      "[P2] Dashboard platform seharusnya memakai endpoint agregasi lintas tenant yang benar-benar menghormati filter hari/minggu/bulan/tahun.",
      "[P2] Kalau target bisnisnya adalah laporan platform penuh, halaman ini harus menampilkan pendapatan penjualan, subscription, addon, tenant aktif, total user, dan volume transaksi/nota dari contract backend yang konsisten.",
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
      "[P1] Limit addon/store/user/product seharusnya bukan hanya terlihat di detail tenant, tetapi juga benar-benar ditegakkan saat create/update data terkait.",
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
      "Laporan global idealnya menjadi sumber data yang dipakai juga oleh super dashboard, sehingga angka platform tidak berasal dari dua contract yang berbeda.",
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
      "[P1] Jika addon/subscription memberi limit produk, backend create/update produk seharusnya memblokir hard limit, bukan hanya menampilkan progress limit di UI.",
      "Setelah downgrade/expired plan, fitur seperti diskon/produk premium harus benar-benar dipersempit sesuai kontrak final; saat ini itu masih perlu verifikasi enforcement lebih dalam.",
    ],
  },
  "/app/users": {
    masukDari: ["tenant detail", "menu users", "operasional tenant"],
    currentTruth: [
      "Halaman ini dipakai untuk CRUD user tenant dan assignment role/store.",
      "UI sudah menunjukkan progress limit user tenant berdasarkan plan/addon.",
    ],
    expectedGap: [
      "[P1] Limit user tidak cukup hanya tampil di UI; create user harus ditolak server-side ketika quota tenant sudah habis.",
    ],
  },
  "/app/stores": {
    masukDari: ["tenant detail", "menu stores", "operasional tenant"],
    currentTruth: [
      "Halaman store/outlet adalah pusat CRUD toko tenant dan menampilkan progress limit outlet/store.",
      "SUPERVISOR boleh melihat daftar store, tetapi edit store detail tertentu dibatasi lebih sempit di router.",
    ],
    expectedGap: [
      "[P1] Jika addon `ADD_OUTLETS` menjadi sumber limit, create store harus diblokir keras saat limit habis, bukan sekadar ditampilkan.",
    ],
  },
  "/app/subscription": {
    masukDari: ["menu subscription", "tenant detail", "operasional tenant"],
    currentTruth: [
      "Halaman ini menangani plan aktif, extend, upgrade, dan status subscription tenant.",
      "SUPER_ADMIN bisa memakai halaman ini dengan tenant selector; ADMIN_TENANT hanya untuk tenant sendiri.",
    ],
    expectedGap: [
      "[P2] Kontrak bisnis upgrade/downgrade/expired yang kamu jelaskan lebih ketat daripada enforcement yang terlihat sekarang. Restricted-access pasca expired masih perlu penguatan backend/frontend.",
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
      "[P2] Jika plan basic setelah downgrade/expired memang tidak boleh mengakses diskon, enforcement feature lock harus jelas. Static audit belum menunjukkan guard granular itu sudah keras.",
    ],
  },
  "/app/reports": {
    masukDari: ["dashboard tenant", "menu reports", "operasional tenant"],
    currentTruth: [
      "Halaman laporan tenant/store dipakai oleh ADMIN_TENANT, SUPERVISOR, CASHIER, dan SUPER_ADMIN.",
      "CASHIER hanya boleh masuk jika `canViewReports` aktif.",
      "Static scan menunjukkan export/report modal tersedia, sehingga contract ekspor laporan memang sudah ada di layer UI.",
    ],
    expectedGap: [
      "Setelah expiry/downgrade, kontrak akses 'tenant masih boleh lihat laporan tetapi tidak boleh pakai fitur tertentu' harus diterjemahkan jadi matrix guard yang eksplisit. Saat ini masih ada gap enforcement untuk ADMIN_TENANT.",
    ],
  },
  "/app/finance": {
    masukDari: ["menu finance", "laporan tenant"],
    currentTruth: [
      "Halaman keuangan ini bergantung pada addon `BUSINESS_ANALYTICS` di router meta.",
    ],
    expectedGap: [
      "[P2] Router guard masih menganggap `BUSINESS_ANALYTICS` sebagai addon dasar untuk ADMIN_TENANT. Jika finance premium seharusnya benar-benar terkunci, current code truth belum cukup keras.",
    ],
  },
  "/app/profit-loss": {
    masukDari: ["menu laporan keuangan", "finance"],
    currentTruth: [
      "Halaman laba/rugi sudah masuk family report premium dan mengarah ke export/PDF flow di ekosistem report.",
    ],
    expectedGap: [
      "[P2] Sama seperti finance/analytics, enforcement addon premium untuk ADMIN_TENANT masih perlu dipastikan sesuai kontrak bisnis final.",
    ],
  },
  "/pos": {
    masukDari: ["open shift sukses", "redirect dari dashboard cashier bila shift sehat", "navigasi kasir"],
    currentTruth: [
      "POS adalah halaman transaksi utama untuk CASHIER, SUPERVISOR, dan ADMIN_TENANT.",
      "Untuk CASHIER, route ini tidak boleh dilewati sebelum shift sehat; router akan mengirim ke `/open-shift` atau `/app/cashier/cash-shift` bila konteks shift belum valid.",
      "Halaman ini juga menjadi sumber order yang kemudian diteruskan ke kitchen flow dan receipt/nota flow.",
    ],
    expectedGap: [
      "POS harus selalu store-scoped dan tenant-scoped. Forged tenant/store context tidak boleh membuat kasir melihat data store lain.",
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
  lines.push("## Snapshot Gap Utama");
  lines.push("");
  for (const gap of CROSS_PAGE_GAPS) {
    lines.push(`- **${gap.severity}** ${gap.title}: ${gap.detail}`);
  }
  lines.push("");

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

      lines.push(`### ${entry.fullPath}`);
      lines.push(`- Nama route: \`${entry.routeName}\``);
      lines.push(`- View: \`${entry.viewPath}\``);
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
    }
  }

  fs.writeFileSync(path.join(ROOT, "PAGE_BUSINESS_FLOW_DETAIL.md"), `${lines.join("\n")}\n`);
  console.log("Report written: PAGE_BUSINESS_FLOW_DETAIL.md");
}

if (require.main === module) {
  render();
}

module.exports = {
  render,
};
