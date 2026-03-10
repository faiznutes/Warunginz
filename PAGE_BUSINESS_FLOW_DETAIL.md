# PAGE BUSINESS FLOW DETAIL

Generated: 2026-03-09T21:58:45.904Z

## Cara Baca

- `Current code truth` = apa yang benar-benar terlihat dari route, guard, page file, API call langsung, dan wiring yang terdeteksi sekarang.
- `Expected SaaS contract / gap` = target flow bisnis SaaS POS multi-tenant yang seharusnya dijaga. Jika belum terlihat di code, saya tandai sebagai gap implementasi, bukan asumsi palsu.

## Coverage

- Routed page entries covered: 82
- Domain groups: 11
- Source of truth utama: `client/src/router/index.ts`, `client/src/router/addon.routes.ts`, file halaman Vue, auth store, tenant/store guard, dan endpoint yang dipanggil langsung dari page.
- Latest all-routes smoke: 82/82 PASS (`AUDIT_PLAYWRIGHT_ROUTES.md`), major failed: 0, minor failed: 0.

## Snapshot Lintas Halaman

- **P2** Contract metrik SUPER_ADMIN sudah stabil, tetapi summary/detail lintas halaman harus tetap satu sumber data: `/app/super-dashboard` dan `/app/reports/global` sekarang sama-sama bertumpu pada `GET /reports/global` untuk kartu summary, breakdown subscription/addon, dan filter tanggal. Risiko yang tersisa adalah drift bila salah satu halaman diubah tanpa menjaga contract agregasi yang sama.
- **P3** Quota create users/stores/products sudah ditegakkan server-side dan sudah masuk regression guard: Create path untuk user/store/product sekarang memanggil `AddonService.assertLimitAvailable(...)` di backend dan business-rules audit lokal sudah mengunci perilaku deny ketika quota habis. Yang tersisa adalah menjaga suite ini tetap ikut dijalankan saat contract tenant/addon berubah.
- **P3** Lifecycle subscription/addon sekarang sudah punya regression browser, tetapi harus tetap dijaga lintas halaman billing: Suite billing lifecycle sekarang memverifikasi `upgrade/extend/expired/addon removal` di browser terhadap `/app/subscription`, `/app/addons`, `/app/discounts`, dan `/app/analytics`. Risiko yang tersisa bukan lagi ketiadaan coverage, tetapi menjaga copy UI, entitlement, dan CTA billing tetap sinkron saat contract backend berubah.
- **P3** Frontend entitlement check sudah sinkron dengan backend premium lock, tetapi naming entitlement tetap harus dijaga: Router guard sekarang memeriksa entitlements dari `/subscriptions/current` dan tidak lagi memberi bypass ADMIN_TENANT untuk `BUSINESS_ANALYTICS`. Risiko sisa adalah regresi bila naming entitlement/addon di backend berubah tanpa update guard frontend.

## Phase Major

- P0/P1 POS checkout dan payment pipeline harus stabil: tidak boleh ada `500` saat kasir membayar, checkout atomik, atau update stok/receipt.
- Authz tenant/store harus konsisten di semua halaman inti: dashboard, products, orders, reports, users, stores, POS, kitchen, subscription, addons.
- Quota subscription/addon harus tetap dites di backend dan tidak boleh mundur menjadi sekadar indikator UI.
- Dashboard dan laporan super admin harus tetap memakai contract platform metrics lintas tenant yang sama dan mengikuti filter periode.
- Route/guard/permission role harus diverifikasi aman untuk SUPER_ADMIN, ADMIN_TENANT, SUPERVISOR, CASHIER, dan KITCHEN tanpa fallback tenant/store yang salah.

## Phase Minor

- PWA/static asset hygiene: `apple-touch-icon`, icon manifest, shortcut URL, dan install prompt behavior harus rapi agar tidak menimbulkan warning/noise.
- WebSocket harus dibuat graceful: jika belum ada gateway backend atau tunnel tidak stabil, UI tidak boleh spam error console atau mempengaruhi flow bisnis.
- Dokumen error/empty state harus konsisten: hindari copy `gagal memuat ...` yang tidak informatif dan pastikan ada retry/CTA yang jelas.
- Halaman non-core seperti help, marketing, settings guide, dan utility perlu tetap dicek route serta fallback error-nya, tetapi prioritasnya di bawah core POS/operasional.

## Guardrail Runtime Yang Harus Dijaga

### P3 - Contract laporan dan export kasir sudah stabil, tetapi regression coverage harus tetap dijaga
- Scope: /app/reports, /pos
- Evidence: Flow kasir sekarang memakai `GET /reports/dashboard/summary` + `GET /reports/daily-sales` untuk laporan sales store-scoped, sementara export modal membatasi opsi sesuai role dan payload yang benar-benar tersedia. Critical/domain smoke lokal sudah memverifikasi jalur ini tanpa crash.
- Kenapa penting: Mismatch kecil di contract summary/daily-sales/export tetap bisa mengembalikan laporan kosong palsu atau crash export setelah transaksi nyata bila regression test tidak lagi dijalankan.
- Arah perbaikan: Pertahankan regression test kasir untuk transaksi -> laporan -> export, dan jangan kembalikan halaman reports ke contract lama `/reports/tenant` untuk semua tipe data.

### P3 - Realtime socket backend belum menjadi contract aktif, tetapi frontend sekarang sudah optional
- Scope: /pos, /kitchen, order notifications
- Evidence: Frontend hanya menghidupkan realtime bila `VITE_ENABLE_REALTIME=true`, dan fallback REST tetap menjadi source of truth operasional. Repo backend masih belum menunjukkan gateway Socket.IO yang menjadi contract aktif.
- Kenapa penting: Ini bukan blocker operasional saat ini, tetapi harus diputuskan jelas sebelum realtime dihidupkan di production agar ekspektasi event realtime tidak palsu.
- Arah perbaikan: Pertahankan feature flag realtime dalam keadaan off sampai gateway backend siap, atau implementasikan contract gateway yang nyata dari backend.

### P2 - Shell PWA/login sudah lebih rapi, tetapi masih butuh verifikasi pasca-deploy terhadap cache browser
- Scope: /login dan public shell
- Evidence: Icon dasar dan manifest shortcut sudah disediakan, dan handler `beforeinstallprompt` tidak lagi menahan banner custom. Risiko sisa lebih banyak berasal dari cache browser atau deploy lama yang belum memuat asset terbaru.
- Kenapa penting: Ini bukan blocker bisnis utama, tetapi warning shell lama bisa membuat tester mengira flow bisnis masih rusak padahal problemnya hanya asset/cache.
- Arah perbaikan: Pertahankan asset icon/manifest ini di deploy berikutnya dan bersihkan cache browser saat memverifikasi shell bila warning lama masih terlihat.

## Public / Marketing

Halaman publik yang tidak butuh login. Tujuannya akuisisi tenant, edukasi produk, pricing, bantuan, dan entry point prospek.

### /
- Nama route: `home`
- View: `client/src/views/marketing/Home.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Landing marketing Warungin untuk calon tenant dan titik masuk demo/pricing/contact.

**Masuk Dari Mana**
- landing/public navigation
- CTA dari halaman marketing lain

**Keluar / Tersambung Ke Mana**
- /pricing
- /demo
- /help
- `/help/${article.slug}`
- /contact

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, search/kata kunci, ekspor data.
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **MarketingLayout** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /pricing, /demo, /help, `/help/${article.slug}`, /contact.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, search/kata kunci, ekspor data.

**Expected SaaS Contract / Gap**
- Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek CTA marketing mengarah ke route yang benar dan tidak bocor ke halaman privat tanpa auth.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /contact
- Nama route: `contact`
- View: `client/src/views/marketing/Contact.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Form kontak prospek/support awal sebelum menjadi tenant.

**Masuk Dari Mana**
- landing/public navigation
- CTA dari halaman marketing lain

**Keluar / Tersambung Ke Mana**
- contact-success

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- POST /contact

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, selector store.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error submitting contact form:; Gagal mengirim pesan. Silakan coba lagi.

**Current Code Truth**
- Halaman memakai layout **MarketingLayout** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: POST /contact
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: contact-success.
- Kemampuan UI yang terdeteksi: search/kata kunci, selector store, aksi create.

**Expected SaaS Contract / Gap**
- Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /contact/success
- Nama route: `contact-success`
- View: `client/src/views/marketing/ContactSuccess.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Konfirmasi sukses setelah prospek mengirim form kontak.

**Masuk Dari Mana**
- landing/public navigation
- CTA dari halaman marketing lain

**Keluar / Tersambung Ke Mana**
- /login
- /contact

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Tidak ada sinyal kuat filter/export/PDF/CRUD dari static scan halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **Standalone** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /login, /contact.
- Kemampuan UI yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman..

**Expected SaaS Contract / Gap**
- Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /demo
- Nama route: `demo`
- View: `client/src/views/marketing/Demo.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Demo produk untuk menjelaskan alur SaaS POS ke calon tenant.

**Masuk Dari Mana**
- landing/public navigation
- CTA dari halaman marketing lain

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- POST /contact/demo

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error submitting demo request:; Gagal mengirim permintaan demo.

**Current Code Truth**
- Halaman memakai layout **MarketingLayout** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: POST /contact/demo
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Kemampuan UI yang terdeteksi: aksi create.

**Expected SaaS Contract / Gap**
- Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /help
- Nama route: `help`
- View: `client/src/views/marketing/Help.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Pusat bantuan publik.

**Masuk Dari Mana**
- landing/public navigation
- CTA dari halaman marketing lain

**Keluar / Tersambung Ke Mana**
- `/help/${result.slug}`
- `/help/category/${category.id}`
- `/help/${article.slug}`
- /contact
- /help/${searchResults.value[0].slug}

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci.
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **MarketingLayout** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: `/help/${result.slug}`, `/help/category/${category.id}`, `/help/${article.slug}`, /contact, /help/${searchResults.value[0].slug}.
- Kemampuan UI yang terdeteksi: search/kata kunci.

**Expected SaaS Contract / Gap**
- Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /help/:slug
- Nama route: `help-article`
- View: `client/src/views/marketing/HelpArticle.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Artikel bantuan publik.

**Masuk Dari Mana**
- landing/public navigation
- CTA dari halaman marketing lain

**Keluar / Tersambung Ke Mana**
- /help
- `/help/${related.slug}`
- /contact

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: navigasi tab/section.

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **MarketingLayout** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /help, `/help/${related.slug}`, /contact.
- Kemampuan UI yang terdeteksi: navigasi tab/section.

**Expected SaaS Contract / Gap**
- Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /help/category/:categoryId
- Nama route: `help-category`
- View: `client/src/views/marketing/HelpCategory.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Kategori artikel bantuan publik.

**Masuk Dari Mana**
- landing/public navigation
- CTA dari halaman marketing lain

**Keluar / Tersambung Ke Mana**
- /help
- `/help/${article.slug}`
- /contact

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **MarketingLayout** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /help, `/help/${article.slug}`, /contact.
- Kemampuan UI yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman..

**Expected SaaS Contract / Gap**
- Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /pricing
- Nama route: `pricing`
- View: `client/src/views/marketing/Pricing.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Halaman paket harga/langganan.

**Masuk Dari Mana**
- landing/public navigation
- CTA dari halaman marketing lain

**Keluar / Tersambung Ke Mana**
- /contact

**API Read**
- GET /addons/available

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, search/kata kunci, bulk action, ekspor data.
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **MarketingLayout** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: GET /addons/available
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /contact.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, search/kata kunci, bulk action, ekspor data.

**Expected SaaS Contract / Gap**
- Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /terms
- Nama route: `terms`
- View: `client/src/views/marketing/Terms.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Halaman syarat dan ketentuan layanan.

**Masuk Dari Mana**
- landing/public navigation
- CTA dari halaman marketing lain

**Keluar / Tersambung Ke Mana**
- /

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal.

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **MarketingLayout** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /.
- Kemampuan UI yang terdeteksi: filter periode/tanggal.

**Expected SaaS Contract / Gap**
- Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

## System / Error

Halaman fallback untuk akses ditolak atau route tidak ditemukan.

### /:pathMatch(.*)*
- Nama route: `not-found`
- View: `client/src/views/NotFound.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Halaman Not Found untuk domain system / error.

**Masuk Dari Mana**
- navigasi aplikasi
- redirect atau shortcut internal

**Keluar / Tersambung Ke Mana**
- /
- /pricing
- /demo
- /contact
- /help
- /terms

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci.

**Empty / Error / Denied State Yang Harus Dicek**
- 404, page not found, error page

**Current Code Truth**
- Halaman memakai layout **Standalone** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /, /pricing, /demo, /contact, /help, /terms.
- Kemampuan UI yang terdeteksi: search/kata kunci.

**Expected SaaS Contract / Gap**
- Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /unauthorized
- Nama route: `unauthorized`
- View: `client/src/views/Unauthorized.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Halaman Unauthorized untuk domain system / error.

**Masuk Dari Mana**
- navigasi aplikasi
- redirect atau shortcut internal

**Keluar / Tersambung Ke Mana**
- /app/super-dashboard/addons
- /app

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: bulk action, ekspor data.
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **Standalone** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /app/super-dashboard/addons, /app.
- Kemampuan UI yang terdeteksi: bulk action, ekspor data.

**Expected SaaS Contract / Gap**
- Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

## Tenant Admin / Settings

Halaman manajemen tenant sendiri: user, store, subscription, addon, settings, dan konfigurasi aplikasi tenant.

### /app/addons
- Nama route: `addons`
- View: `client/src/views/addons/Addons.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Kelola pembelian atau aktivasi addon tenant.

**Masuk Dari Mana**
- menu addon
- tenant detail
- operasional tenant

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /addons/available
- GET /addons
- GET /subscriptions/current

**API Write**
- POST /payment/addon
- POST /addons/unsubscribe/${addonId}

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, selector tenant, modal aksi/konfirmasi.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- [Addons] availableRes.data is not array, setting to empty array; [Addons] Error loading addons:; Tidak ada deskripsi; Gagal membuat pembayaran

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /addons/available; GET /addons; GET /subscriptions/current; POST /payment/addon; POST /addons/unsubscribe/${addonId}
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, selector tenant, modal aksi/konfirmasi, aksi create.
- Halaman ini menampilkan addon aktif, limit usage, katalog addon, serta aksi beli/unsubscribe addon.
- SUPER_ADMIN dapat oversight lintas tenant melalui tenant selector atau tenant detail.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.
- [P1] Efek addon terhadap limit store/user/product harus terasa di enforcement API, bukan hanya progress visual di halaman addon/users/stores/products.
- Pengurangan addon seharusnya langsung mempengaruhi quota dan akses fitur tenant secara deterministik.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek pembelian addon, unsubscribe, limit usage, dan efek addon ke store/user/product serta fitur premium.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Pastikan pengurangan addon langsung mengurangi quota efektif dan memblokir flow create yang melampaui limit.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/2fa
- Nama route: `two-factor-auth`
- View: `client/src/views/settings/TwoFactorAuth.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Pengaturan two-factor authentication.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /2fa/status

**API Write**
- POST /2fa/generate
- POST /2fa/enable
- POST /2fa/disable

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: modal aksi/konfirmasi.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading 2FA status:; Error generating 2FA secret:; Gagal membuat kode QR; Error enabling 2FA:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /2fa/status; POST /2fa/generate; POST /2fa/enable; POST /2fa/disable
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: modal aksi/konfirmasi, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/gdpr
- Nama route: `gdpr-settings`
- View: `client/src/views/settings/GDPRSettings.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN
- Tujuan bisnis halaman: Pengaturan privasi/retensi data user.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /gdpr/export
- GET /gdpr/export-tenant

**API Write**
- POST /gdpr/delete

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: navigasi tab/section, ekspor data.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error exporting data:; Gagal mengekspor data; Error exporting tenant data:; Gagal mengekspor data tenant

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /gdpr/export; GET /gdpr/export-tenant; POST /gdpr/delete
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Kemampuan UI yang terdeteksi: navigasi tab/section, ekspor data, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/loading-states-guide
- Nama route: `loading-states-guide`
- View: `client/src/views/settings/LoadingStatesGuide.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Loading States Guide untuk domain tenant admin / settings.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, navigasi tab/section.

**Empty / Error / Denied State Yang Harus Dicek**
- Default Empty State; Tidak Ada Produk; Belum ada produk yang ditambahkan. Mulai dengan menambahkan produk pertama Anda.; Search Results Empty

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Kemampuan UI yang terdeteksi: search/kata kunci, navigasi tab/section.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/password
- Nama route: `password-settings`
- View: `client/src/views/settings/PasswordSettings.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN
- Tujuan bisnis halaman: Ubah password user yang login.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- POST /password/update

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error updating password:; Gagal memperbarui kata sandi

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: POST /password/update
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Kemampuan UI yang terdeteksi: aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/preferences
- Nama route: `preferences`
- View: `client/src/views/settings/Preferences.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN
- Tujuan bisnis halaman: Preferensi aplikasi untuk user yang login.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Tidak ada sinyal kuat filter/export/PDF/CRUD dari static scan halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Kemampuan UI yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman..

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/sessions
- Nama route: `sessions`
- View: `client/src/views/settings/Sessions.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Kelola session aktif user.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /sessions

**API Write**
- DELETE /sessions/${sessionId}
- POST /sessions/revoke-all

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading sessions:; Error revoking session:; Gagal mengakhiri sesi; Error revoking all sessions:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /sessions; DELETE /sessions/${sessionId}; POST /sessions/revoke-all
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Kemampuan UI yang terdeteksi: aksi create, aksi delete.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/store
- Nama route: `store-settings`
- View: `client/src/views/settings/StoreSettings.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT
- Tujuan bisnis halaman: Pengaturan store level tenant.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /tenant/profile

**API Write**
- PUT /tenant/profile

**Tenant / Store Scope**
- Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading settings:; Gagal memuat pengaturan toko; Error updating features:; Gagal memperbarui fitur

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /tenant/profile; PUT /tenant/profile
- Dependensi tenant/store saat ini: Role non-superadmin tetap scoped ke `user.tenantId`.
- Kemampuan UI yang terdeteksi: aksi update.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/subscription
- Nama route: `subscription-plans`
- View: `client/src/views/settings/SubscriptionPlans.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Subscription Plans untuk domain tenant admin / settings.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /subscriptions/current
- GET /addons/check-limit/ADD_OUTLETS
- GET /addons/check-limit/ADD_USERS

**API Write**
- POST /subscriptions/upgrade

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading current plan:; Error checking limits:; Gagal mengupgrade paket

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /subscriptions/current; GET /addons/check-limit/ADD_OUTLETS; GET /addons/check-limit/ADD_USERS; POST /subscriptions/upgrade
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/webhooks
- Nama route: `webhooks`
- View: `client/src/views/settings/Webhooks.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Kelola webhook tenant/platform.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- `/app/settings/webhooks/tester?webhookId=${webhook.id}`
- body

**API Read**
- GET /webhooks?includeInactive=true

**API Write**
- PUT /webhooks/${editingWebhook.value.id}
- POST /webhooks
- DELETE /webhooks/${id}
- POST /webhooks/${id}/test

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: modal aksi/konfirmasi.
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading webhooks:; Error saving webhook:; Gagal menyimpan webhook; Error deleting webhook:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /webhooks?includeInactive=true; PUT /webhooks/${editingWebhook.value.id}; POST /webhooks; DELETE /webhooks/${id}; POST /webhooks/${id}/test
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: `/app/settings/webhooks/tester?webhookId=${webhook.id}`, body.
- Kemampuan UI yang terdeteksi: modal aksi/konfirmasi, aksi create, aksi update, aksi delete.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/webhooks/tester
- Nama route: `webhook-tester`
- View: `client/src/views/settings/WebhookTester.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Tester webhook untuk validasi integrasi.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- /app/settings/webhooks

**API Read**
- GET /webhooks?includeInactive=true
- GET /webhooks/${selectedWebhookId.value}/deliveries

**API Write**
- POST /webhooks/${selectedWebhookId.value}/test
- POST /webhooks/${selectedWebhookId.value}/replay/${deliveryId}

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: pagination.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading webhooks:; Gagal memuat daftar webhook; Error loading deliveries:; Gagal memuat riwayat pengiriman

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /webhooks?includeInactive=true; GET /webhooks/${selectedWebhookId.value}/deliveries; POST /webhooks/${selectedWebhookId.value}/test; POST /webhooks/${selectedWebhookId.value}/replay/${deliveryId}
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: /app/settings/webhooks.
- Kemampuan UI yang terdeteksi: pagination, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/stores
- Nama route: `stores`
- View: `client/src/views/stores/Stores.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Kelola daftar toko/outlet tenant.

**Masuk Dari Mana**
- tenant detail
- menu stores
- operasional tenant

**Keluar / Tersambung Ke Mana**
- `/app/stores/${store.id}`
- body

**API Read**
- GET /outlets
- GET /addons/check-limit/ADD_OUTLETS

**API Write**
- PUT /outlets/${editingStore.value.id}
- POST /outlets
- DELETE /outlets/${store.id}

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: selector tenant, modal aksi/konfirmasi.
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Gagal memuat daftar toko; Gagal menyimpan toko; Gagal menghapus toko

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /outlets; GET /addons/check-limit/ADD_OUTLETS; PUT /outlets/${editingStore.value.id}; POST /outlets; DELETE /outlets/${store.id}
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: `/app/stores/${store.id}`, body.
- Kemampuan UI yang terdeteksi: selector tenant, modal aksi/konfirmasi, aksi create, aksi update, aksi delete.
- Halaman store/outlet adalah pusat CRUD toko tenant dan menampilkan progress limit outlet/store.
- SUPERVISOR boleh melihat daftar store, tetapi edit store detail tertentu dibatasi lebih sempit di router.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.
- Jika tenant sudah mencapai limit plan/addon, create baru seharusnya ditolak keras oleh API.
- Create outlet tenant sekarang diblokir server-side saat limit habis; jaga regression coverage untuk create/reactivate store agar quota tidak bocor.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek list/detail/edit store, outlet scope, dan limit store/outlet sesuai addon.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Pertahankan guard limit server-side untuk create/update dan tambahkan regression test agar quota plan/addon tidak bisa mundur ditembus lewat request manual.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/stores/:id
- Nama route: `store-detail`
- View: `client/src/views/stores/StoreDetail.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Detail toko/outlet tertentu.

**Masuk Dari Mana**
- halaman `/app/stores`
- navigasi detail/edit store

**Keluar / Tersambung Ke Mana**
- /app/dashboard
- /app/stores
- `/app/stores/${store.id}/edit`
- /app/pos
- /app/support

**API Read**
- GET /outlets/${route.params.id}

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal.
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /outlets/${route.params.id}
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: /app/dashboard, /app/stores, `/app/stores/${store.id}/edit`, /app/pos, /app/support.
- Kemampuan UI yang terdeteksi: filter periode/tanggal.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek list/detail/edit store, outlet scope, dan limit store/outlet sesuai addon.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/stores/:id/edit
- Nama route: `edit-store`
- View: `client/src/views/stores/EditStore.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Form edit outlet/store.

**Masuk Dari Mana**
- halaman `/app/stores`
- navigasi detail/edit store

**Keluar / Tersambung Ke Mana**
- `/app/stores/${route.params.id}`
- /app/stores/${route.params.id}

**API Read**
- GET /outlets/${route.params.id}

**API Write**
- PUT /outlets/${route.params.id}

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal.

**Empty / Error / Denied State Yang Harus Dicek**
- Gagal memuat data toko; Gagal menyimpan perubahan

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /outlets/${route.params.id}; PUT /outlets/${route.params.id}
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: `/app/stores/${route.params.id}`, /app/stores/${route.params.id}.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, aksi update.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek list/detail/edit store, outlet scope, dan limit store/outlet sesuai addon.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/subscription
- Nama route: `subscription`
- View: `client/src/views/subscription/Subscription.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Kelola paket langganan tenant.

**Masuk Dari Mana**
- menu subscription
- tenant detail
- operasional tenant

**Keluar / Tersambung Ke Mana**
- /pricing

**API Read**
- GET /subscriptions/current

**API Write**
- POST /payment/addon

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, selector tenant.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading subscription:; Gagal membuat pembayaran; Error creating payment:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /subscriptions/current; POST /payment/addon
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: /pricing.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, selector tenant, aksi create.
- Halaman ini menangani plan aktif, extend, upgrade, dan status subscription tenant.
- SUPER_ADMIN bisa memakai halaman ini dengan tenant selector; ADMIN_TENANT hanya untuk tenant sendiri.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.
- State machine upgrade/extend/expired/downgrade perlu tetap diuji end-to-end supaya status subscription, quota, dan entitlement premium tetap sinkron di tenant detail dan halaman operasional.
- Jika upgrade dari basic ke pro menambah durasi atau masa aktif secara spesifik, aturan akumulasi itu harus seragam antara UI, service subscription, dan laporan billing.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek plan aktif, upgrade, extend, expiry, downgrade, dan efeknya ke akses fitur tenant.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tegaskan state machine subscription: upgrade, extend, expiry, downgrade, fallback plan, dan feature lock setelah expired/downgrade.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/users
- Nama route: `users`
- View: `client/src/views/users/Users.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Kelola user tenant dan assignment role/store.

**Masuk Dari Mana**
- tenant detail
- menu users
- operasional tenant

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /users
- GET /addons/check-limit/ADD_USERS

**API Write**
- PUT /users/${editingUser.value.id}
- POST /users
- DELETE /users/${id}

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: selector tenant, navigasi tab/section, modal aksi/konfirmasi, pagination.
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading users:; Error saving user:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /users; GET /addons/check-limit/ADD_USERS; PUT /users/${editingUser.value.id}; POST /users; DELETE /users/${id}
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Kemampuan UI yang terdeteksi: selector tenant, navigasi tab/section, modal aksi/konfirmasi, pagination, aksi create, aksi update, aksi delete.
- Halaman ini dipakai untuk CRUD user tenant dan assignment role/store.
- UI sudah menunjukkan progress limit user tenant berdasarkan plan/addon.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus tenant-scoped; ADMIN_TENANT tidak boleh menembus tenant lain.
- Jika tenant sudah mencapai limit plan/addon, create baru seharusnya ditolak keras oleh API.
- Create user tenant sekarang ditolak server-side saat quota habis; jaga regression coverage untuk role payload dan store assignment ketika limit sudah penuh.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek create/edit/delete user, role assignment, permission payload, store assignment, dan limit user.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Pertahankan guard limit server-side untuk create/update dan tambahkan regression test agar quota plan/addon tidak bisa mundur ditembus lewat request manual.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

## Reports / Finance

Halaman laporan, analitik, keuangan, dan ekspor PDF/print yang harus tetap tenant-scoped atau platform-scoped sesuai role.

### /app/analytics
- Nama route: `analytics`
- View: `client/src/views/analytics/AdvancedAnalytics.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Advanced analytics tenant bila addon aktif.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- /app/addons
- body

**API Read**
- GET /analytics/predictions
- GET /analytics/top-products
- GET /analytics/custom-reports
- GET /outlets
- GET /analytics/custom-reports/${report.id}/export

**API Write**
- POST /analytics/custom-reports

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, navigasi tab/section, modal aksi/konfirmasi, pagination, ekspor data.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Tidak ada deskripsi; Error loading analytics:; Error exporting report:; Gagal mengekspor report

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `BUSINESS_ANALYTICS`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- API langsung dari file halaman: GET /analytics/predictions; GET /analytics/top-products; GET /analytics/custom-reports; GET /outlets; GET /analytics/custom-reports/${report.id}/export; POST /analytics/custom-reports
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: /app/addons, body.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, navigasi tab/section, modal aksi/konfirmasi, pagination, ekspor data, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, hasil report harus mengikuti tenant/store scope, filter waktu, dan rule export yang konsisten.
- Halaman ini seharusnya hanya aktif bila addon `BUSINESS_ANALYTICS` benar-benar tersedia untuk tenant yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Enforcement addon BUSINESS_ANALYTICS harus dicek di backend juga, bukan hanya di router/frontend.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/finance
- Nama route: `finance`
- View: `client/src/views/finance/AccountingFinance.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Ringkasan keuangan tenant.

**Masuk Dari Mana**
- menu finance
- laporan tenant

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /finance/summary
- GET /finance/balance-sheet
- GET /finance/cash-flow

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: selector tenant, navigasi tab/section, modal aksi/konfirmasi, ekspor data.
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading financial data:; Error exporting report:; Gagal mengekspor laporan

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `BUSINESS_ANALYTICS`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- API langsung dari file halaman: GET /finance/summary; GET /finance/balance-sheet; GET /finance/cash-flow
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: selector tenant, navigasi tab/section, modal aksi/konfirmasi, ekspor data.
- Halaman keuangan ini bergantung pada addon `BUSINESS_ANALYTICS` di router meta.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, hasil report harus mengikuti tenant/store scope, filter waktu, dan rule export yang konsisten.
- Halaman ini seharusnya hanya aktif bila addon `BUSINESS_ANALYTICS` benar-benar tersedia untuk tenant yang sah.
- Jika plan downgrade/expired mengurangi fitur, restriction itu seharusnya ditegakkan konsisten di router, backend, dan UI action.
- Finance premium sekarang terkunci oleh router entitlements dan backend `@RequireTenantFeature("BUSINESS_ANALYTICS")`; sisa risiko utamanya adalah drift contract bila naming entitlement berubah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Enforcement addon BUSINESS_ANALYTICS harus dicek di backend juga, bukan hanya di router/frontend.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/finance/management
- Nama route: `financial-management`
- View: `client/src/views/finance/FinancialManagement.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Manajemen keuangan lebih detail bila addon aktif.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body
- /app/reports?type=cashflow

**API Read**
- GET /financial-management/cash-flow/summary
- GET /financial-management/expenses/by-category
- GET /financial-management/forecast

**API Write**
- POST /financial-management/tax/calculate
- POST /financial-management/cash-flow
- POST /financial-management/expenses
- POST /financial-management/bank-reconciliation

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, navigasi tab/section, modal aksi/konfirmasi.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading cash flow summary:; Gagal memuat cash flow summary; Error loading expenses:; Error calculating tax:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `BUSINESS_ANALYTICS`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /financial-management/cash-flow/summary; GET /financial-management/expenses/by-category; POST /financial-management/tax/calculate; GET /financial-management/forecast; POST /financial-management/cash-flow; POST /financial-management/expenses; POST /financial-management/bank-reconciliation
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: body, /app/reports?type=cashflow.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, navigasi tab/section, modal aksi/konfirmasi, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, hasil report harus mengikuti tenant/store scope, filter waktu, dan rule export yang konsisten.
- Halaman ini seharusnya hanya aktif bila addon `BUSINESS_ANALYTICS` benar-benar tersedia untuk tenant yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Enforcement addon BUSINESS_ANALYTICS harus dicek di backend juga, bukan hanya di router/frontend.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/finance/transactions
- Nama route: `transactions`
- View: `client/src/views/finance/Transactions.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Daftar transaksi keuangan tenant.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /orders
- GET /orders/export

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, filter status, navigasi tab/section, modal aksi/konfirmasi, pagination, ekspor data.
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading transactions:; Gagal memuat data transaksi; Export error:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /orders; GET /orders/export
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: search/kata kunci, filter status, navigasi tab/section, modal aksi/konfirmasi, pagination, ekspor data.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, hasil report harus mengikuti tenant/store scope, filter waktu, dan rule export yang konsisten.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/profit-loss
- Nama route: `profit-loss`
- View: `client/src/views/finance/ProfitLossReport.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Laporan laba/rugi tenant.

**Masuk Dari Mana**
- menu laporan keuangan
- finance

**Keluar / Tersambung Ke Mana**
- /app/addons

**API Read**
- GET /finance/profit-loss

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: ekspor data.
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Gagal memuat laporan laba rugi; Gagal memuat laporan; Gagal mengekspor laporan

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `BUSINESS_ANALYTICS`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- API langsung dari file halaman: GET /finance/profit-loss
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: /app/addons.
- Kemampuan UI yang terdeteksi: ekspor data.
- Halaman laba/rugi sudah masuk family report premium dan mengarah ke export/PDF flow di ekosistem report.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, hasil report harus mengikuti tenant/store scope, filter waktu, dan rule export yang konsisten.
- Halaman ini seharusnya hanya aktif bila addon `BUSINESS_ANALYTICS` benar-benar tersedia untuk tenant yang sah.
- Jika plan downgrade/expired mengurangi fitur, restriction itu seharusnya ditegakkan konsisten di router, backend, dan UI action.
- Analytics premium sekarang mengikuti entitlement yang sama dengan finance; pertahankan regression coverage untuk expired plan dan addon removal.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Enforcement addon BUSINESS_ANALYTICS harus dicek di backend juga, bukan hanya di router/frontend.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/reports
- Nama route: `reports`
- View: `client/src/views/reports/Reports.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN
- Tujuan bisnis halaman: Laporan tenant/store sesuai role dan permission.

**Masuk Dari Mana**
- dashboard tenant
- menu reports
- operasional tenant

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /reports/dashboard/summary
- GET /reports/daily-sales
- GET /finance/profit-loss
- GET /subscriptions/current
- GET /analytics/predictions
- GET /analytics/top-products

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, selector tenant, navigasi tab/section, modal aksi/konfirmasi, ekspor data.

**Empty / Error / Denied State Yang Harus Dicek**
- Tenant ID tidak tersedia. Silakan login kembali.; Error loading report:; Gagal memuat laporan; Error loading subscription entitlements:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /reports/dashboard/summary; GET /reports/daily-sales; GET /finance/profit-loss; GET /subscriptions/current; GET /analytics/predictions; GET /analytics/top-products
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, selector tenant, navigasi tab/section, modal aksi/konfirmasi, ekspor data.
- Halaman laporan tenant/store dipakai oleh ADMIN_TENANT, SUPERVISOR, CASHIER, dan SUPER_ADMIN.
- Flow laporan sekarang dipisah per role: mode sales memakai `GET /reports/dashboard/summary` dan `GET /reports/daily-sales`, sedangkan laporan financial premium memakai `GET /finance/profit-loss` hanya untuk role yang berhak.
- Export modal sudah mengikuti role dan payload yang tersedia, sehingga CASHIER tidak lagi melihat opsi export yang backend-nya memang tidak didukung.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, hasil report harus mengikuti tenant/store scope, filter waktu, dan rule export yang konsisten.
- Jika plan downgrade/expired mengurangi fitur, restriction itu seharusnya ditegakkan konsisten di router, backend, dan UI action.
- Laporan tenant saat ini tetap menjadi fitur dasar yang bisa diakses tenant, tetapi CASHIER harus tetap dibatasi ke laporan sales store-scoped dan tidak boleh melihat analytics/financial premium tanpa entitlement yang benar.
- Jaga agar matrix laporan sales vs financial premium tidak regress saat plan berubah atau saat contract export ditambah lagi.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek filter laporan, agregasi angka, dan export PDF/CSV agar hasilnya sesuai tenant/store dan periode.
- Untuk CASHIER/SUPERVISOR, pastikan halaman tetap sales-only/store-scoped dan opsi export yang tidak didukung role tidak muncul.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Pertahankan pemisahan contract laporan sales store-scoped (`/reports/dashboard/summary` + `/reports/daily-sales`) dari laporan financial premium (`/finance/profit-loss`).
- Pastikan export modal hanya menawarkan opsi yang benar-benar didukung role dan payload backend agar tidak memunculkan crash `undefined`.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/reports/advanced
- Nama route: `advanced-reporting`
- View: `client/src/views/reports/AdvancedReporting.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Advanced Reporting untuk domain reports / finance.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /advanced-reporting/templates
- GET /advanced-reporting/scheduled
- GET /advanced-reporting/dashboard-settings

**API Write**
- PUT /advanced-reporting/templates/${editingTemplate.value.id}
- POST /advanced-reporting/templates
- PUT /advanced-reporting/scheduled/${editingScheduleId.value}
- POST /advanced-reporting/scheduled
- PUT /advanced-reporting/dashboard-settings
- POST /advanced-reporting/generate
- DELETE /advanced-reporting/scheduled/${report.id}

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, navigasi tab/section, modal aksi/konfirmasi.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Tidak ada deskripsi; Error loading templates:; Gagal memuat template laporan; Error loading scheduled reports:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `BUSINESS_ANALYTICS`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /advanced-reporting/templates; GET /advanced-reporting/scheduled; GET /advanced-reporting/dashboard-settings; PUT /advanced-reporting/templates/${editingTemplate.value.id}; POST /advanced-reporting/templates; PUT /advanced-reporting/scheduled/${editingScheduleId.value}; POST /advanced-reporting/scheduled; PUT /advanced-reporting/dashboard-settings
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, navigasi tab/section, modal aksi/konfirmasi, aksi create, aksi update, aksi delete.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, hasil report harus mengikuti tenant/store scope, filter waktu, dan rule export yang konsisten.
- Halaman ini seharusnya hanya aktif bila addon `BUSINESS_ANALYTICS` benar-benar tersedia untuk tenant yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek filter laporan, agregasi angka, dan export PDF/CSV agar hasilnya sesuai tenant/store dan periode.
- Untuk CASHIER/SUPERVISOR, pastikan halaman tetap sales-only/store-scoped dan opsi export yang tidak didukung role tidak muncul.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Pertahankan pemisahan contract laporan sales store-scoped (`/reports/dashboard/summary` + `/reports/daily-sales`) dari laporan financial premium (`/finance/profit-loss`).
- Pastikan export modal hanya menawarkan opsi yang benar-benar didukung role dan payload backend agar tidak memunculkan crash `undefined`.
- Enforcement addon BUSINESS_ANALYTICS harus dicek di backend juga, bukan hanya di router/frontend.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/reports/stores
- Nama route: `store-reports`
- View: `client/src/views/reports/StoreReports.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Store Reports untuk domain reports / finance.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /reports/multi

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: navigasi tab/section.

**Empty / Error / Denied State Yang Harus Dicek**
- Gagal memuat laporan

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /reports/multi
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Kemampuan UI yang terdeteksi: navigasi tab/section.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, hasil report harus mengikuti tenant/store scope, filter waktu, dan rule export yang konsisten.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek filter laporan, agregasi angka, dan export PDF/CSV agar hasilnya sesuai tenant/store dan periode.
- Untuk CASHIER/SUPERVISOR, pastikan halaman tetap sales-only/store-scoped dan opsi export yang tidak didukung role tidak muncul.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Pertahankan pemisahan contract laporan sales store-scoped (`/reports/dashboard/summary` + `/reports/daily-sales`) dari laporan financial premium (`/finance/profit-loss`).
- Pastikan export modal hanya menawarkan opsi yang benar-benar didukung role dan payload backend agar tidak memunculkan crash `undefined`.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

## Cashier / POS / Shift

Flow kasir. Kontrak bisnis utamanya adalah `open shift -> POS -> close shift` tanpa shortcut yang merusak kontrol operasional.

### /app/cashier/cash-shift
- Nama route: `cash-shift`
- View: `client/src/views/cashier/CashShift.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: CASHIER
- Tujuan bisnis halaman: Pusat kontrol shift kasir: status aktif, riwayat, tutup shift, dan recovery mismatch.

**Masuk Dari Mana**
- menu shift kasir
- recovery redirect
- operasional cashier

**Keluar / Tersambung Ke Mana**
- /open-shift
- /pos

**API Read**
- GET /store-shift/current
- GET /cash-shift/current
- GET /cash-shift/history
- GET /store-shift/today
- GET /store-shift/history
- GET /store-shift/${shiftId}/details

**API Write**
- POST /store-shift/open
- POST /cash-shift/open
- POST /cash-shift/close

**Tenant / Store Scope**
- Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, search/kata kunci, selector store, navigasi tab/section, modal aksi/konfirmasi, pagination.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading current store shift:; Error loading current shift:; Error loading shift history:; Gagal membuka shift toko

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: CASHIER.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [CASHIER] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /store-shift/current; GET /cash-shift/current; GET /cash-shift/history; POST /store-shift/open; POST /cash-shift/open; POST /cash-shift/close; GET /store-shift/today; GET /store-shift/history
- Dependensi tenant/store saat ini: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: /open-shift, /pos.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, search/kata kunci, selector store, navigasi tab/section, modal aksi/konfirmasi, pagination, aksi create.
- Halaman ini adalah pusat kontrol shift kasir: histori, status aktif, open/close cash shift, dan recovery mismatch.
- Bug misleading state 'sudah buka shift tapi UI masih terlihat seperti buka shift lagi' sudah ditutup di baseline sebelumnya lewat perbaikan tab fokus state aktif.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini menjadi bagian state machine shift kasir dan tidak boleh melewati urutan operasional yang salah.
- Halaman ini harus tetap menjadi satu sumber kebenaran untuk status shift. Jika state backend dan UI berbeda lagi, itu masuk defect P1 operasional.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek state machine shift: belum buka shift -> buka shift -> transaksi -> tutup shift, tanpa tombol/state yang salah.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Buat satu sumber kebenaran shift di backend/frontend; hindari state lokal yang bisa membuat UI membuka shift padahal shift aktif.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/pos/failed-syncs
- Nama route: `failed-sync-review`
- View: `client/src/views/pos/FailedSyncReview.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: CASHIER, ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Failed Sync Review untuk domain cashier / pos / shift.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- /pos

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- POST /orders/checkout

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: navigasi tab/section.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Unknown connection error; Unknown error

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: CASHIER, ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [CASHIER, ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: POST /orders; POST /transactions
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: /pos.
- Kemampuan UI yang terdeteksi: navigasi tab/section, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini menjadi bagian state machine shift kasir dan tidak boleh melewati urutan operasional yang salah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /open-shift
- Nama route: `open-shift`
- View: `client/src/views/cashier/OpenShift.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: CASHIER, SUPERVISOR
- Tujuan bisnis halaman: Flow buka shift toko/kasir atau recovery sebelum kasir boleh bertransaksi.

**Masuk Dari Mana**
- login cashier/supervisor
- guard shift dari route lain

**Keluar / Tersambung Ke Mana**
- /app/cashier/cash-shift
- /app/dashboard
- /pos

**API Read**
- GET /store-shift/current
- GET /cash-shift/current
- GET /outlets/${resolvedStoreId.value}

**API Write**
- POST /store-shift/open
- POST /cash-shift/open
- POST /cash-shift/close

**Tenant / Store Scope**
- Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: selector store, modal aksi/konfirmasi.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Gagal memuat data shift; Gagal membuka shift toko; Gagal membuka shift; Gagal menutup shift

**Current Code Truth**
- Halaman memakai layout **Fullscreen** dan saat ini dibuka oleh role: CASHIER, SUPERVISOR.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [CASHIER, SUPERVISOR] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Jika shift sudah sehat, route ini akan mendorong user ke `/pos`; jika state mismatch, diarahkan ke `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /store-shift/current; GET /cash-shift/current; GET /outlets/${resolvedStoreId.value}; POST /store-shift/open; POST /cash-shift/open; POST /cash-shift/close
- Dependensi tenant/store saat ini: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: /app/cashier/cash-shift, /app/dashboard, /pos.
- Kemampuan UI yang terdeteksi: selector store, modal aksi/konfirmasi, aksi create.
- Halaman ini menangani tiga kondisi: recovery close, buka store shift, atau buka cash shift.
- Jika shift sudah sehat, route ini seharusnya tidak menjadi tujuan akhir dan user diarahkan ke `/pos`.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini menjadi bagian state machine shift kasir dan tidak boleh melewati urutan operasional yang salah.
- Kontrak bisnis kasir adalah state machine yang deterministik. Halaman ini tidak boleh menampilkan tombol buka shift lagi bila shift sehat sudah aktif.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek state machine shift: belum buka shift -> buka shift -> transaksi -> tutup shift, tanpa tombol/state yang salah.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Buat satu sumber kebenaran shift di backend/frontend; hindari state lokal yang bisa membuat UI membuka shift padahal shift aktif.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /pos
- Nama route: `pos-fullscreen`
- View: `client/src/views/pos/POS.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P0**
- Role yang boleh akses: CASHIER, SUPERVISOR, ADMIN_TENANT
- Tujuan bisnis halaman: Pusat transaksi POS: pilih item, checkout, payment, dan sinkronisasi order.

**Masuk Dari Mana**
- open shift sukses
- redirect dari dashboard cashier bila shift sehat
- navigasi kasir

**Keluar / Tersambung Ke Mana**
- body
- /app/dashboard
- /pos
- /app/orders
- /app/products
- /app/customers
- /app/reports
- /app/cashier/cash-shift

**API Read**
- GET /tenant/profile
- GET /members
- GET /subscriptions/current
- GET /discounts

**API Write**
- POST /orders/checkout

**Tenant / Store Scope**
- Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, selector tenant, selector store, navigasi tab/section, modal aksi/konfirmasi.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Keranjang kosong; Kosongkan keranjang?; Error loading members:; Error loading subscription entitlements:

**Current Code Truth**
- Halaman memakai layout **Fullscreen** dan saat ini dibuka oleh role: CASHIER, SUPERVISOR, ADMIN_TENANT.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [CASHIER, SUPERVISOR, ADMIN_TENANT] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /tenant/profile; GET /members; GET /subscriptions/current; GET /discounts; POST /orders/checkout
- Dependensi tenant/store saat ini: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: body, /app/dashboard, /pos, /app/orders, /app/products, /app/customers, /app/reports, /app/cashier/cash-shift.
- Kemampuan UI yang terdeteksi: search/kata kunci, selector tenant, selector store, navigasi tab/section, modal aksi/konfirmasi, aksi create.
- POS adalah halaman transaksi utama untuk CASHIER, SUPERVISOR, dan ADMIN_TENANT.
- Untuk CASHIER, route ini tidak boleh dilewati sebelum shift sehat; router akan mengirim ke `/open-shift` atau `/app/cashier/cash-shift` bila konteks shift belum valid.
- Halaman ini juga menjadi sumber order yang kemudian diteruskan ke kitchen flow dan receipt/nota flow.
- Checkout POS sekarang memakai endpoint backend atomik `POST /orders/checkout`, sehingga order, item, stok, transaksi, dan receipt tidak lagi bergantung pada dua request write terpisah dari frontend.
- Flow cetak struk kasir sekarang memakai template default read-only yang aman (`GET /receipts/templates/default`) dan fallback lokal, bukan lagi memanggil CRUD template admin.
- Realtime socket sekarang bersifat opsional lewat feature flag `VITE_ENABLE_REALTIME`; bila flag mati atau backend websocket belum ada, POS tetap berjalan lewat REST polling tanpa memblokir transaksi.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini menjadi bagian state machine shift kasir dan tidak boleh melewati urutan operasional yang salah.
- POS harus selalu store-scoped dan tenant-scoped. Forged tenant/store context tidak boleh membuat kasir melihat data store lain.
- Pertahankan endpoint checkout atomik sebagai satu-satunya jalur transaksi POS dan tambahkan regression test untuk idempotency/rollback.
- Rapikan success overlay pasca-pembayaran agar kasir hanya melihat satu state sukses sebelum membuka struk.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek produk tampil, cart aman untuk array kosong/undefined, customer/member flow jalan, dan checkout tidak menghasilkan `500`.
- Cek payment method CASH/QRIS/dll, checkout atomik ke backend, receipt overlay, stok berkurang, dan order kitchen bila aktif.
- Cek flow cetak struk kasir tidak lagi memanggil endpoint template admin dan tidak menghasilkan `403 /receipts/templates`.
- Cek jika websocket gagal atau offline, POS tetap usable dan tidak spam error yang merusak transaksi.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Pertahankan `POST /orders/checkout` sebagai satu-satunya jalur transaksi POS, lalu tambah test idempotency dan rollback yang eksplisit.
- Jaga flow receipt kasir tetap read-only ke `GET /receipts/templates/default` dengan fallback lokal; jangan kembalikan POS ke CRUD template admin.
- Rapikan overlay sukses pembayaran agar hanya ada satu CTA cetak struk yang jelas setelah checkout.
- Jika realtime ingin dihidupkan lagi, siapkan gateway backend yang nyata; kalau belum, tetap biarkan feature flag realtime mati secara default.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

## Catalog / CRM / Inventory

Halaman master data dan growth ops: products, customers, rewards, discounts, inventory, delivery, marketing.

### /app/customers
- Nama route: `customers`
- View: `client/src/views/customers/Customers.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN
- Tujuan bisnis halaman: Kelola data pelanggan dan relasi CRM dasar.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /customers
- GET /addons

**API Write**
- PUT /customers/${editingCustomer.value.id}
- POST /customers
- DELETE /customers/${id}
- PUT /customers/${pointsCustomer.value.id}
- POST /marketing/campaigns/send-sms
- POST /marketing/campaigns/send-email

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, ekspor data.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading customers:; Error saving customer:; Gagal menambahkan poin; Bulk delete error:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Untuk role CASHIER, permission `canManageCustomers` dicek di frontend; jika gagal, user dialihkan ke dashboard role. Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /customers; PUT /customers/${editingCustomer.value.id}; POST /customers; DELETE /customers/${id}; PUT /customers/${pointsCustomer.value.id}; GET /addons; POST /marketing/campaigns/send-sms; POST /marketing/campaigns/send-email
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Kemampuan UI yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, ekspor data, aksi create, aksi update, aksi delete.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.
- Role CASHIER seharusnya hanya melihat/menjalankan flow ini bila permission `canManageCustomers` benar.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek create/edit/delete customer serta scoping tenant/store untuk role store-scoped.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Permission canManageCustomers harus tetap diverifikasi di backend untuk aksi write/read sensitif.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/discounts
- Nama route: `discounts`
- View: `client/src/views/discounts/Discounts.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Kelola diskon tenant.

**Masuk Dari Mana**
- menu promo/produk
- tenant operasional

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /products
- GET /discounts

**API Write**
- PUT /discounts/${editingDiscount.value.id}
- POST /discounts
- DELETE /discounts/${id}

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi.
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading categories:; Error loading discounts:; Gagal memuat diskon; Error loading selected products:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DISCOUNTS`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- API langsung dari file halaman: GET /products; GET /discounts; PUT /discounts/${editingDiscount.value.id}; POST /discounts; DELETE /discounts/${id}
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Kemampuan UI yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, aksi create, aksi update, aksi delete.
- Halaman diskon adalah fitur admin-level untuk ADMIN_TENANT dan SUPER_ADMIN.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.
- Halaman ini seharusnya hanya aktif bila addon `DISCOUNTS` benar-benar tersedia untuk tenant yang sah.
- Jika plan downgrade/expired mengurangi fitur, restriction itu seharusnya ditegakkan konsisten di router, backend, dan UI action.
- Backend controller diskon sekarang sudah memakai `@RequireTenantFeature("DISCOUNTS")`; fokus sisa kerja adalah menjaga contract expired/downgrade tetap sinkron dengan copy UI dan routing.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Enforcement addon DISCOUNTS harus dicek di backend juga, bukan hanya di router/frontend.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/inventory/purchase-orders
- Nama route: `purchase-orders`
- View: `client/src/views/inventory/PurchaseOrders.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Purchase Orders untuk domain catalog / crm / inventory.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /purchase-orders
- GET /suppliers
- GET /products

**API Write**
- POST /purchase-orders
- PUT /purchase-orders/${po.id}
- POST /purchase-orders/${po.id}/receive
- POST /purchase-orders/${po.id}/cancel

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter status, navigasi tab/section, modal aksi/konfirmasi.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading purchase orders:; Error loading suppliers:; Error loading products:; Error saving purchase order:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /purchase-orders; GET /suppliers; GET /products; POST /purchase-orders; PUT /purchase-orders/${po.id}; POST /purchase-orders/${po.id}/receive; POST /purchase-orders/${po.id}/cancel
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: filter status, navigasi tab/section, modal aksi/konfirmasi, aksi create, aksi update.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/inventory/restock-suggestions
- Nama route: `restock-suggestions`
- View: `client/src/views/inventory/RestockSuggestions.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Restock Suggestions untuk domain catalog / crm / inventory.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- /app/products?highlight=${productId}

**API Read**
- GET /inventory/restock-suggestions

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Tidak ada sinyal kuat filter/export/PDF/CRUD dari static scan halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading restock suggestions:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /inventory/restock-suggestions
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: /app/products?highlight=${productId}.
- Kemampuan UI yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman..

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/inventory/stock-alerts
- Nama route: `stock-alerts`
- View: `client/src/views/inventory/StockAlerts.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Stock Alerts untuk domain catalog / crm / inventory.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- `/app/inventory/purchase-orders`

**API Read**
- GET /stock-alerts/low-stock
- GET /stock-alerts/stats

**API Write**
- POST /stock-alerts/send

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: navigasi tab/section.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading low stock products:; Error sending alerts:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /stock-alerts/low-stock; GET /stock-alerts/stats; POST /stock-alerts/send
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: `/app/inventory/purchase-orders`.
- Kemampuan UI yang terdeteksi: navigasi tab/section, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/inventory/stock-transfers
- Nama route: `stock-transfers`
- View: `client/src/views/inventory/StockTransfers.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Stock Transfers untuk domain catalog / crm / inventory.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /outlets
- GET /products
- GET /stock-transfers

**API Write**
- POST /stock-transfers
- PUT /stock-transfers/${id}/cancel

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: selector store, navigasi tab/section, modal aksi/konfirmasi, pagination.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /outlets; GET /products; GET /stock-transfers; POST /stock-transfers; PUT /stock-transfers/${id}/cancel
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: selector store, navigasi tab/section, modal aksi/konfirmasi, pagination, aksi create, aksi update.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/inventory/suppliers
- Nama route: `suppliers`
- View: `client/src/views/inventory/Suppliers.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Suppliers untuk domain catalog / crm / inventory.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /suppliers

**API Write**
- PUT /suppliers/${editingSupplier.value.id}
- POST /suppliers
- DELETE /suppliers/${supplier.id}

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, navigasi tab/section, modal aksi/konfirmasi, pagination.
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading suppliers:; Error saving supplier:; Error deleting supplier:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /suppliers; PUT /suppliers/${editingSupplier.value.id}; POST /suppliers; DELETE /suppliers/${supplier.id}
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: search/kata kunci, navigasi tab/section, modal aksi/konfirmasi, pagination, aksi create, aksi update, aksi delete.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/marketing
- Nama route: `marketing`
- View: `client/src/views/marketing/MarketingCampaigns.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Operasional campaign marketing bila addon aktif.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /marketing/campaigns

**API Write**
- POST /marketing/campaigns/${campaignId}/send
- POST /marketing/campaigns

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: modal aksi/konfirmasi.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading campaigns:; Error sending campaign:; Error saving campaign:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DELIVERY_MARKETING`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- API langsung dari file halaman: GET /marketing/campaigns; POST /marketing/campaigns/${campaignId}/send; POST /marketing/campaigns
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: modal aksi/konfirmasi, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.
- Halaman ini seharusnya hanya aktif bila addon `DELIVERY_MARKETING` benar-benar tersedia untuk tenant yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Enforcement addon DELIVERY_MARKETING harus dicek di backend juga, bukan hanya di router/frontend.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/marketing/customer-engagement
- Nama route: `customer-engagement`
- View: `client/src/views/marketing/CustomerEngagement.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Customer Engagement untuk domain catalog / crm / inventory.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /customer-engagement/stats/overall
- GET /customer-engagement

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading overall stats:; Error loading customers:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DELIVERY_MARKETING`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- API langsung dari file halaman: GET /customer-engagement/stats/overall; GET /customer-engagement
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Kemampuan UI yang terdeteksi: search/kata kunci.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.
- Halaman ini seharusnya hanya aktif bila addon `DELIVERY_MARKETING` benar-benar tersedia untuk tenant yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Enforcement addon DELIVERY_MARKETING harus dicek di backend juga, bukan hanya di router/frontend.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/marketing/email-analytics
- Nama route: `email-analytics`
- View: `client/src/views/marketing/EmailAnalytics.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Email Analytics untuk domain catalog / crm / inventory.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /email-analytics/overall
- GET /marketing/campaigns
- GET /email-analytics/campaign/${selectedCampaignId.value}

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading analytics:; Gagal memuat analytics; Error loading campaign analytics:; Gagal memuat campaign analytics

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DELIVERY_MARKETING`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- API langsung dari file halaman: GET /email-analytics/overall; GET /marketing/campaigns; GET /email-analytics/campaign/${selectedCampaignId.value}
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Kemampuan UI yang terdeteksi: filter periode/tanggal.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.
- Halaman ini seharusnya hanya aktif bila addon `DELIVERY_MARKETING` benar-benar tersedia untuk tenant yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Enforcement addon DELIVERY_MARKETING harus dicek di backend juga, bukan hanya di router/frontend.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/marketing/email-scheduler
- Nama route: `email-scheduler`
- View: `client/src/views/marketing/EmailScheduler.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Email Scheduler untuk domain catalog / crm / inventory.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /email-scheduler

**API Write**
- PUT /email-scheduler/${editingSchedule.value.id}
- POST /email-scheduler
- POST /email-scheduler/${schedule.id}/cancel

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter status, modal aksi/konfirmasi.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading schedules:; Gagal memuat schedules; Error saving schedule:; Gagal menyimpan schedule

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DELIVERY_MARKETING`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- API langsung dari file halaman: GET /email-scheduler; PUT /email-scheduler/${editingSchedule.value.id}; POST /email-scheduler; POST /email-scheduler/${schedule.id}/cancel
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Kemampuan UI yang terdeteksi: filter status, modal aksi/konfirmasi, aksi create, aksi update.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.
- Halaman ini seharusnya hanya aktif bila addon `DELIVERY_MARKETING` benar-benar tersedia untuk tenant yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Enforcement addon DELIVERY_MARKETING harus dicek di backend juga, bukan hanya di router/frontend.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/marketing/email-templates
- Nama route: `email-templates`
- View: `client/src/views/marketing/EmailTemplates.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Email Templates untuk domain catalog / crm / inventory.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /email-templates

**API Write**
- PUT /email-templates/${editingTemplate.value.id}
- POST /email-templates
- DELETE /email-templates/${template.id}

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: modal aksi/konfirmasi.
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading templates:; Gagal memuat templates; Error saving template:; Gagal menyimpan template

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DELIVERY_MARKETING`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- API langsung dari file halaman: GET /email-templates; PUT /email-templates/${editingTemplate.value.id}; POST /email-templates; DELETE /email-templates/${template.id}
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Kemampuan UI yang terdeteksi: modal aksi/konfirmasi, aksi create, aksi update, aksi delete.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.
- Halaman ini seharusnya hanya aktif bila addon `DELIVERY_MARKETING` benar-benar tersedia untuk tenant yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Enforcement addon DELIVERY_MARKETING harus dicek di backend juga, bukan hanya di router/frontend.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/products
- Nama route: `products`
- View: `client/src/views/products/Products.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN
- Tujuan bisnis halaman: Kelola katalog produk tenant/store.

**Masuk Dari Mana**
- dashboard tenant
- menu master data
- shortcut operasional

**Keluar / Tersambung Ke Mana**
- /login
- /app/pos

**API Read**
- GET /products
- GET /addons/check-limit/ADD_PRODUCTS

**API Write**
- PUT /products/${product.id}
- DELETE /products/${id}
- PUT /products/${editingProduct.value.id}
- POST /products

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, ekspor data.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Gagal memuat halaman. Silakan coba lagi.; Belum ada data produk yang tersedia. Mulai dengan menambahkan produk pertama Anda.; Tidak ada produk yang cocok dengan pencarian atau filter Anda.; Error in bulk edit:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Untuk role CASHIER, permission `canManageProducts` dicek di frontend; jika gagal, user dialihkan ke dashboard role. Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: PUT /products/${product.id}; DELETE /products/${id}; GET /products; GET /addons/check-limit/ADD_PRODUCTS; PUT /products/${editingProduct.value.id}; POST /products
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: /login, /app/pos.
- Kemampuan UI yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, ekspor data, aksi create, aksi update, aksi delete.
- Halaman katalog produk dipakai lintas role, tetapi CASHIER hanya boleh masuk bila permission `canManageProducts` bernilai true.
- Static audit sebelumnya sudah memverifikasi query compatibility untuk tenant/store context di halaman ini.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.
- Role CASHIER seharusnya hanya melihat/menjalankan flow ini bila permission `canManageProducts` benar.
- Jika tenant sudah mencapai limit plan/addon, create baru seharusnya ditolak keras oleh API.
- Backend create produk sekarang memblokir hard limit melalui `AddonService.assertLimitAvailable`; pertahankan regression test agar bypass API tidak lolos.
- Pastikan limit dan fitur turunan tetap sinkron setelah upgrade/expired/downgrade, tetapi baseline create quota produk saat ini sudah terkunci server-side.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek list produk, create/edit/delete, stock, category, search, dan limit produk sesuai plan/addon.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Pertahankan guard limit server-side untuk create/update dan tambahkan regression test agar quota plan/addon tidak bisa mundur ditembus lewat request manual.
- Permission canManageProducts harus tetap diverifikasi di backend untuk aksi write/read sensitif.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/products/adjustments
- Nama route: `product-adjustments`
- View: `client/src/views/products/ProductAdjustments.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Product Adjustments untuk domain catalog / crm / inventory.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /products/${productId}
- GET /products/adjustments
- GET /products
- GET /outlets
- GET /suppliers

**API Write**
- POST /products/adjustments

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, selector tenant, selector store, navigasi tab/section, modal aksi/konfirmasi, pagination.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error fetching selected product:; Error loading adjustments:; Product not found error, showing empty list; Error loading products:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /products/${productId}; GET /products/adjustments; GET /products; GET /outlets; GET /suppliers; POST /products/adjustments
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Kemampuan UI yang terdeteksi: search/kata kunci, selector tenant, selector store, navigasi tab/section, modal aksi/konfirmasi, pagination, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/reward-view
- Nama route: `reward-view`
- View: `client/src/views/rewards/RewardView.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Preview atau tampilan reward tertentu.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- /app/rewards

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- POST /rewards/watch-ad

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error checking ad availability:; Error showing ad:; Error awarding points:; Error processing points

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: POST /rewards/watch-ad
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: /app/rewards.
- Kemampuan UI yang terdeteksi: aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/rewards
- Nama route: `rewards`
- View: `client/src/views/rewards/Rewards.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Kelola reward program tenant.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- reward-view

**API Read**
- GET /rewards/balance
- GET /rewards/daily-limit
- GET /rewards/transactions
- GET /rewards/config

**API Write**
- POST /rewards/redeem/subscription
- POST /rewards/redeem/addon

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, search/kata kunci, navigasi tab/section.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading balance:; Error loading daily limit:; Error loading transactions:; Error loading config:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /rewards/balance; GET /rewards/daily-limit; GET /rewards/transactions; GET /rewards/config; POST /rewards/redeem/subscription; POST /rewards/redeem/addon
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: reward-view.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, search/kata kunci, navigasi tab/section, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

## Store Operations

Halaman operasional harian tenant/store: dashboard, orders, support, delivery, dan aktivitas store-level.

### /app/dashboard
- Nama route: `dashboard`
- View: `client/src/views/dashboard/Dashboard.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN
- Tujuan bisnis halaman: Dashboard operasional tenant/store setelah login.

**Masuk Dari Mana**
- redirect login untuk non-superadmin
- menu dashboard tenant/store

**Keluar / Tersambung Ke Mana**
- /app/products
- /app/subscription
- /app/products?filter=low_stock
- /app/settings/preferences
- /app/orders
- /app/finance/transactions

**API Read**
- GET /dashboard/stats
- GET /subscriptions/current
- GET /orders

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, navigasi tab/section, ekspor data.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading stats:; Error loading subscription:; Error loading orders:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). SUPER_ADMIN tidak boleh memakai dashboard tenant biasa; router memindahkan ke `/app/super-dashboard`. Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /dashboard/stats; GET /subscriptions/current; GET /orders
- Dependensi tenant/store saat ini: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: /app/products, /app/subscription, /app/products?filter=low_stock, /app/settings/preferences, /app/orders, /app/finance/transactions.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, navigasi tab/section, ekspor data.
- Ini dashboard operasional tenant/store untuk ADMIN_TENANT, SUPERVISOR, CASHIER, dan KITCHEN.
- Untuk CASHIER dengan shift sehat, router guard bisa langsung mendorong user ke `/pos` sehingga dashboard bukan landing final untuk semua role.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.
- Dashboard tenant seharusnya tetap tenant-scoped dan, untuk role store-scoped, hanya menampilkan data store terpilih/diizinkan.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/delivery
- Nama route: `delivery`
- View: `client/src/views/delivery/DeliveryOrders.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Operasional order delivery bila addon aktif.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /delivery/orders

**API Write**
- POST /delivery/orders/${orderId}/process
- POST /delivery/couriers
- POST /marketing/promos

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, navigasi tab/section, modal aksi/konfirmasi.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading delivery orders:; Error processing delivery:; Error saving courier:; Error saving promo:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DELIVERY_MARKETING`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /delivery/orders; POST /delivery/orders/${orderId}/process; POST /delivery/couriers; POST /marketing/promos
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: search/kata kunci, navigasi tab/section, modal aksi/konfirmasi, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.
- Halaman ini seharusnya hanya aktif bila addon `DELIVERY_MARKETING` benar-benar tersedia untuk tenant yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Enforcement addon DELIVERY_MARKETING harus dicek di backend juga, bukan hanya di router/frontend.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/orders
- Nama route: `orders`
- View: `client/src/views/orders/Orders.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN
- Tujuan bisnis halaman: Daftar order operasional untuk monitoring, filtering, dan aksi sesuai role.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- /pos

**API Read**
- GET /orders
- GET /orders/${order.id}

**API Write**
- PUT /orders/${id}/status
- DELETE /orders/${id}
- POST /orders/bulk-delete
- POST /orders/bulk-refund

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, ekspor data.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Tenant ID tidak tersedia. Silakan login ulang.; Error loading orders:; Gagal memuat pesanan; Error loading order details:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /orders; GET /orders/${order.id}; PUT /orders/${id}/status; DELETE /orders/${id}; POST /orders/bulk-delete; POST /orders/bulk-refund
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: /pos.
- Kemampuan UI yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, ekspor data, aksi create, aksi update, aksi delete.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek list order, filter status/bulan, detail, print receipt, update status, bulk delete/refund, dan deny aman per role.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke/API contract test untuk list/detail/update/delete/refund/export per role agar `500` di halaman order cepat tertangkap.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/support
- Nama route: `client-support`
- View: `client/src/views/support/ClientSupport.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, CASHIER
- Tujuan bisnis halaman: Inbox support/client support untuk tenant.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- `/help/${article.slug}`
- /help
- /help/cara-setup-awal
- /help/konfigurasi-printer
- /help/download-laporan
- body

**API Read**
- GET /support/tickets

**API Write**
- POST /support/tickets
- POST /support/tickets/${selectedTicket.value.id}/reply

**Tenant / Store Scope**
- Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, search/kata kunci, modal aksi/konfirmasi, ekspor data.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading tickets:; Error creating ticket:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, CASHIER.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /support/tickets; POST /support/tickets; POST /support/tickets/${selectedTicket.value.id}/reply
- Dependensi tenant/store saat ini: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: `/help/${article.slug}`, /help, /help/cara-setup-awal, /help/konfigurasi-printer, /help/download-laporan, body.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, search/kata kunci, modal aksi/konfirmasi, ekspor data, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

## Kitchen

Flow dapur. Hanya order store yang ditugaskan yang boleh muncul, dan status dapur harus aman dari sisi authz/store-scope.

### /app/orders/kitchen
- Nama route: `kitchen-orders`
- View: `client/src/views/kitchen/KitchenOrders.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: KITCHEN, SUPERVISOR
- Tujuan bisnis halaman: Antrian order kitchen di dalam layout aplikasi.

**Masuk Dari Mana**
- menu dapur di dalam app layout
- route khusus supervisor/kitchen

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /orders

**API Write**
- PUT /orders/${order.id}/kitchen-status

**Tenant / Store Scope**
- Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: selector tenant, navigasi tab/section, modal aksi/konfirmasi.

**Empty / Error / Denied State Yang Harus Dicek**
- Gagal update status

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: KITCHEN, SUPERVISOR.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [KITCHEN, SUPERVISOR] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /orders; PUT /orders/${order.id}/kitchen-status
- Dependensi tenant/store saat ini: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Kemampuan UI yang terdeteksi: selector tenant, navigasi tab/section, modal aksi/konfirmasi, aksi update.
- Versi layout-app dari kitchen flow untuk SUPERVISOR dan KITCHEN.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, hanya order store assignment yang boleh muncul dan diubah statusnya.
- Order kitchen harus selalu store-scoped dan tidak boleh tertukar ketika selectedStoreId berubah atau forged query/header dikirim.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek hanya order store assignment yang muncul, update kitchen status berhasil, dan tidak ada order store lain yang bocor.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Kunci query kitchen ke store scope di backend dan tambah test bypass `outletId` palsu.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /kitchen
- Nama route: `kitchen-display`
- View: `client/src/views/kitchen/KitchenOrders.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: KITCHEN, SUPERVISOR, SUPER_ADMIN
- Tujuan bisnis halaman: Kitchen display fullscreen untuk antrean order store yang ditugaskan.

**Masuk Dari Mana**
- login kitchen
- shortcut fullscreen dapur

**Keluar / Tersambung Ke Mana**
- /app/orders/kitchen
- logout

**API Read**
- GET /orders

**API Write**
- PUT /orders/${order.id}/kitchen-status

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: selector tenant, navigasi tab/section, modal aksi/konfirmasi.

**Empty / Error / Denied State Yang Harus Dicek**
- Gagal update status

**Current Code Truth**
- Halaman memakai layout **Fullscreen** dan saat ini dibuka oleh role: KITCHEN, SUPERVISOR, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [KITCHEN, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /orders; PUT /orders/${order.id}/kitchen-status
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Kemampuan UI yang terdeteksi: selector tenant, navigasi tab/section, modal aksi/konfirmasi, aksi update.
- Ini kitchen display fullscreen untuk role KITCHEN, SUPERVISOR, dan SUPER_ADMIN.
- Flow ini menerima order dari kasir dan menjadi display operasional store yang ditugaskan.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, hanya order store assignment yang boleh muncul dan diubah statusnya.
- SUPER_ADMIN bisa masuk untuk monitoring, tetapi order yang tampil tetap harus mengikuti tenant/store context yang sah dan tidak membocorkan antrean store lain secara salah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek hanya order store assignment yang muncul, update kitchen status berhasil, dan tidak ada order store lain yang bocor.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Kunci query kitchen ke store scope di backend dan tambah test bypass `outletId` palsu.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

## System / Utility

Halaman utility atau support internal yang tidak sepenting core business, tetapi tetap harus konsisten dengan auth, tenant, dan error handling.

### /app/receipts/templates
- Nama route: `receipt-templates`
- View: `client/src/views/receipts/ReceiptTemplates.vue`
- Phase audit: **Minor**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Receipt Templates untuk domain system / utility.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /receipts/templates

**API Write**
- PUT /receipts/templates/${editingTemplate.value.id}
- POST /receipts/templates
- POST /receipts/templates/${id}/set-default
- DELETE /receipts/templates/${id}

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: modal aksi/konfirmasi.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading templates:; Error saving template:; Error setting default:; Error deleting template:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /receipts/templates; PUT /receipts/templates/${editingTemplate.value.id}; POST /receipts/templates; POST /receipts/templates/${id}/set-default; DELETE /receipts/templates/${id}
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Kemampuan UI yang terdeteksi: modal aksi/konfirmasi, aksi create, aksi update, aksi delete.

**Expected SaaS Contract / Gap**
- Tidak ada gap spesifik yang menonjol dari static scan selain kewajiban scope tenant/store dan deny aman sesuai role.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

## Super Admin / Platform

Halaman platform untuk SUPER_ADMIN: monitoring lintas tenant, tenant detail, global report, pengaturan platform, dan kontrol subscription/addon tenant.

### /app/reports/global
- Nama route: `global-reports`
- View: `client/src/views/reports/GlobalReports.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Global Reports untuk domain super admin / platform.

**Masuk Dari Mana**
- dashboard super admin
- menu laporan global

**Keluar / Tersambung Ke Mana**
- `/app/tenants/${sub.tenantId}`
- `/app/tenants/${addon.tenantId}`

**API Read**
- GET /reports/global

**API Write**
- PUT /admin/subscriptions/${editingSubscription.value.id}
- DELETE /admin/subscriptions/${id}
- PUT /admin/addons-purchase/${editingAddon.value.id}
- DELETE /admin/addons-purchase/${id}

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, ekspor data.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading global report:; Gagal memuat laporan global; Error updating subscription:; Gagal memperbarui subscription

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /reports/global; PUT /admin/subscriptions/${editingSubscription.value.id}; DELETE /admin/subscriptions/${id}; PUT /admin/addons-purchase/${editingAddon.value.id}; DELETE /admin/addons-purchase/${id}
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Navigasi keluar yang terdeteksi di file halaman: `/app/tenants/${sub.tenantId}`, `/app/tenants/${addon.tenantId}`.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, ekspor data, aksi update, aksi delete.
- Halaman ini adalah pusat report platform SUPER_ADMIN dengan tabel subscription history, summary cards, filter rentang tanggal, dan modal export.
- Static scan menunjukkan halaman memakai komponen export modal/report global, sehingga contract PDF/print/report memang sudah direncanakan di sini.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.
- Pertahankan satu sumber data platform antara laporan global dan super dashboard agar angka summary tidak drift saat contract backend berubah.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek filter laporan, agregasi angka, dan export PDF/CSV agar hasilnya sesuai tenant/store dan periode.
- Untuk CASHIER/SUPERVISOR, pastikan halaman tetap sales-only/store-scoped dan opsi export yang tidak didukung role tidak muncul.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Pertahankan pemisahan contract laporan sales store-scoped (`/reports/dashboard/summary` + `/reports/daily-sales`) dari laporan financial premium (`/finance/profit-loss`).
- Pastikan export modal hanya menawarkan opsi yang benar-benar didukung role dan payload backend agar tidak memunculkan crash `undefined`.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/additional-components-guide
- Nama route: `additional-components-guide`
- View: `client/src/views/settings/AdditionalComponentsGuide.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Additional Components Guide untuk domain super admin / platform.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, navigasi tab/section.
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, navigasi tab/section.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/advanced-components-guide
- Nama route: `advanced-components-guide`
- View: `client/src/views/settings/AdvancedComponentsGuide.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Advanced Components Guide untuk domain super admin / platform.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: modal aksi/konfirmasi, ekspor data.

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Kemampuan UI yang terdeteksi: modal aksi/konfirmasi, ekspor data.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/archive
- Nama route: `archive-management`
- View: `client/src/views/settings/ArchiveManagement.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Pengelolaan arsip sistem untuk SUPER_ADMIN.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /archives/stats
- GET /archives/files

**API Write**
- POST /archives/orders
- POST /archives/transactions
- POST /archives/reports
- POST /archives/all
- POST /archives/restore

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, navigasi tab/section, modal aksi/konfirmasi.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading archive stats:; Gagal memuat statistik archive; Error loading archive files:; Gagal memuat daftar file archive

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /archives/stats; GET /archives/files; POST /archives/orders; POST /archives/transactions; POST /archives/reports; POST /archives/all; POST /archives/restore
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, navigasi tab/section, modal aksi/konfirmasi, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/retention
- Nama route: `retention-management`
- View: `client/src/views/settings/RetentionManagement.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Pengaturan retensi data platform.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /retention/stats

**API Write**
- POST /retention/orders
- POST /retention/transactions
- POST /retention/reports
- POST /retention/audit-logs
- POST /retention/contact-submissions
- POST /retention/demo-requests
- POST /retention/apply-all

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: modal aksi/konfirmasi.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading retention stats:; Gagal memuat statistik retensi; Gagal menghapus pesanan; Gagal menghapus transaksi

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /retention/stats; POST /retention/orders; POST /retention/transactions; POST /retention/reports; POST /retention/audit-logs; POST /retention/contact-submissions; POST /retention/demo-requests; POST /retention/apply-all
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: modal aksi/konfirmasi, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/style-guide
- Nama route: `style-guide`
- View: `client/src/views/settings/FormStyleGuide.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Form Style Guide untuk domain super admin / platform.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Tidak ada sinyal kuat filter/export/PDF/CRUD dari static scan halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error State; Error state...

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Kemampuan UI yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman..

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/system
- Nama route: `system-settings`
- View: `client/src/views/settings/SystemSettings.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Pengaturan sistem platform untuk SUPER_ADMIN.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- /app/settings/2fa
- /app/settings/webhooks
- /app/settings/sessions
- /app/settings/password
- /app/settings/gdpr

**API Read**
- GET /settings/system

**API Write**
- PUT /settings/system

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading settings:; Gagal menyimpan pengaturan

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /settings/system; PUT /settings/system
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Navigasi keluar yang terdeteksi di file halaman: /app/settings/2fa, /app/settings/webhooks, /app/settings/sessions, /app/settings/password, /app/settings/gdpr.
- Kemampuan UI yang terdeteksi: aksi update.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/settings/table-style-guide
- Nama route: `table-style-guide`
- View: `client/src/views/settings/TableStyleGuide.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Table Style Guide untuk domain super admin / platform.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, navigasi tab/section, pagination.

**Empty / Error / Denied State Yang Harus Dicek**
- Empty State

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Kemampuan UI yang terdeteksi: search/kata kunci, navigasi tab/section, pagination.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/super-dashboard
- Nama route: `super-dashboard`
- View: `client/src/views/superadmin/SuperDashboard.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Dashboard platform untuk SUPER_ADMIN lintas tenant.

**Masuk Dari Mana**
- redirect login untuk SUPER_ADMIN
- menu dashboard platform
- navigasi ulang dari halaman platform lain

**Keluar / Tersambung Ke Mana**
- /app/reports/global
- /app/tenants
- /app/superadmin/contact-messages
- /app/users
- /app/addons

**API Read**
- GET /reports/global

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, navigasi tab/section, ekspor data.

**Empty / Error / Denied State Yang Harus Dicek**
- Database connection error:; Error loading super admin stats:; Gagal memuat statistik super admin

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Role non-superadmin dipindah kembali ke `/app/dashboard`.
- API langsung dari file halaman: GET /reports/global
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Navigasi keluar yang terdeteksi di file halaman: /app/reports/global, /app/tenants, /app/superadmin/contact-messages, /app/users, /app/addons.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, navigasi tab/section, ekspor data.
- Halaman memakai `GET /reports/global` dengan `startDate` dan `endDate` untuk memuat metrik platform lintas tenant.
- Tombol filter `Hari Ini / Minggu / Bulan / Tahun` menghitung rentang tanggal lokal lalu mengirim `startDate` dan `endDate` ke endpoint global report.
- UI menampilkan kartu `totalRevenue`, `totalSubscriptionRevenue`, `totalAddonRevenue`, `totalTenants`, dan `totalUsers` dari payload `overview/summary` global report.
- Widget seperti `recentAddons` dan `subscriptionBreakdown` mengambil data dari payload laporan global yang sama agar contract platform tidak terpecah.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.
- Pertahankan contract ini: dashboard platform dan laporan global harus tetap memakai agregasi lintas tenant yang sama agar angka tidak drift.
- Tambahkan regression check bila summary platform diperluas, tetapi baseline saat ini sudah memuat tenant aktif, total user, pendapatan subscription/addon, dan volume transaksi/nota dari contract laporan global.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek filter hari/minggu/bulan/tahun benar-benar mengubah data, bukan hanya state UI.
- Cek metrik platform: tenant aktif, user, pendapatan penjualan, subscription, addon, dan volume transaksi/nota bila memang disediakan API.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Pisahkan endpoint platform metrics dari endpoint dashboard tenant biasa agar kartu metrik dan filter periode tidak memakai data yang ambigu.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/superadmin/backups
- Nama route: `superadmin-backups`
- View: `client/src/views/superadmin/BackupManagement.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Kelola backup platform.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /tenants
- GET /superadmin/backups/critical
- GET /superadmin/backups
- GET /superadmin/backups/${backupId}/view
- GET /superadmin/backups/${backupId}/download

**API Write**
- POST /superadmin/backups/${backupId}/resend-email
- POST /superadmin/backups/${tenantId}/regenerate

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, pagination, ekspor data.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Backup gagal 3+ hari berturut-turut; Gagal Email; Error loading tenants:; Error loading critical tenants:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /tenants; GET /superadmin/backups/critical; GET /superadmin/backups; GET /superadmin/backups/${backupId}/view; GET /superadmin/backups/${backupId}/download; POST /superadmin/backups/${backupId}/resend-email; POST /superadmin/backups/${tenantId}/regenerate
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, pagination, ekspor data, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/superadmin/contact-messages
- Nama route: `contact-messages`
- View: `client/src/views/superadmin/ContactMessages.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Inbox pesan kontak masuk ke platform.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /contact
- GET /support/tickets
- GET /users

**API Write**
- PUT /contact/${message.id}/read
- DELETE /contact/${message.id}
- POST /contact/bulk
- POST /support/tickets
- PUT /support/tickets/${selectedTicket.value.id}/assign
- POST /support/tickets/${selectedTicket.value.id}/notes

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, filter status, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination.
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error loading messages:; Gagal memuat pesan kontak; Error updating read status:; Gagal memperbarui status pesan

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /contact; PUT /contact/${message.id}/read; DELETE /contact/${message.id}; POST /contact/bulk; GET /support/tickets; GET /users; POST /support/tickets; PUT /support/tickets/${selectedTicket.value.id}/assign
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: search/kata kunci, filter status, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, aksi create, aksi update, aksi delete.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/superadmin/server-monitor
- Nama route: `server-monitor`
- View: `client/src/views/superadmin/ServerMonitor.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Monitoring kesehatan server/platform.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /admin/docker/containers
- GET /admin/server/resources
- GET /admin/health
- GET /admin/logs/${selectedLogType.value}?tail=200
- GET /admin/docker/logs/${containerName}?tail=500

**API Write**
- POST /admin/docker/restart/${containerName}
- POST /admin/docker/stop/${containerName}

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, navigasi tab/section, modal aksi/konfirmasi.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Cari log atau error...; Error loading containers:; Error loading resources; Error loading health

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /admin/docker/containers; GET /admin/server/resources; GET /admin/health; GET /admin/logs/${selectedLogType.value}?tail=200; GET /admin/docker/logs/${containerName}?tail=500; POST /admin/docker/restart/${containerName}; POST /admin/docker/stop/${containerName}
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: search/kata kunci, navigasi tab/section, modal aksi/konfirmasi, aksi create.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/superadmin/system-info
- Nama route: `system-info`
- View: `client/src/views/superadmin/SystemInfo.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P3**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Informasi environment dan sistem platform.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- /pricing?plan=${plan.id}
- /app/addons?add=${addon.name}

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, navigasi tab/section.
- indikasi PDF/print/nota tersedia di halaman atau child component

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Navigasi keluar yang terdeteksi di file halaman: /pricing?plan=${plan.id}, /app/addons?add=${addon.name}.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, navigasi tab/section.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/tenants
- Nama route: `tenants`
- View: `client/src/views/tenants/Tenants.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Daftar tenant dan akses ke detail tenant bagi SUPER_ADMIN.

**Masuk Dari Mana**
- dashboard super admin
- menu tenant platform

**Keluar / Tersambung Ke Mana**
- /app/tenants/${tenantId}

**API Read**
- GET /tenants

**API Write**
- DELETE /tenants/${id}
- PUT /tenants/${editingTenant.value.id}
- POST /tenants

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi.
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Alamat tidak tersedia; Error loading tenants:; Gagal memuat tenant; Gagal menghapus tenant

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /tenants; DELETE /tenants/${id}; PUT /tenants/${editingTenant.value.id}; POST /tenants
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Navigasi keluar yang terdeteksi di file halaman: /app/tenants/${tenantId}.
- Kemampuan UI yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, aksi create, aksi update, aksi delete.
- Halaman ini adalah daftar tenant SUPER_ADMIN dengan CRUD tenant, filter status, dan akses ke detail tenant.
- Create tenant flow di UI sudah membawa field paket dan status aktif, jadi halaman ini juga berfungsi sebagai entry point provisioning tenant baru.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.
- Tenant yang dibuat dari halaman ini idealnya langsung sinkron dengan limit plan, status subscription awal, dan akun admin tenant default tanpa mismatch.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /app/tenants/:id
- Nama route: `tenant-detail`
- View: `client/src/views/tenants/TenantDetail.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P1**
- Role yang boleh akses: SUPER_ADMIN
- Tujuan bisnis halaman: Detail tenant: profil, subscription, addon, user, dan store tenant.

**Masuk Dari Mana**
- daftar tenant
- tautan tenant di laporan global

**Keluar / Tersambung Ke Mana**
- body
- /app/tenants

**API Read**
- GET /addons/available
- GET /tenants/${tenantId}/users
- GET /outlets
- GET /addons
- GET /subscriptions/current
- GET /tenants/${tenantId}

**API Write**
- PUT /tenants/${tenantId}/upgrade-plan
- POST /addons/subscribe
- PUT /addons/${editAddonForm.value.id}
- POST /addons/${editAddonForm.value.id}/extend
- PUT /users/${user.id}
- DELETE /users/${user.id}
- PUT /outlets/${store.id}
- PUT /tenants/${tenantId}
- POST /tenants/${tenantId}/users
- PUT /users/${editingUser.value.id}
- POST /tenants/${tenantId}/outlets
- PUT /outlets/${editStoreForm.value.id}

**Tenant / Store Scope**
- SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, ekspor data.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada aksi delete langsung dari halaman atau handler yang dipanggil halaman.
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Alamat tidak tersedia; Tidak ada paket; Gagal memperbarui langganan.; Gagal menambahkan addon.

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: PUT /tenants/${tenantId}/upgrade-plan; GET /addons/available; POST /addons/subscribe; PUT /addons/${editAddonForm.value.id}; POST /addons/${editAddonForm.value.id}/extend; PUT /users/${user.id}; DELETE /users/${user.id}; PUT /outlets/${store.id}
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Navigasi keluar yang terdeteksi di file halaman: body, /app/tenants.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, ekspor data, aksi create, aksi update, aksi delete.
- Halaman detail tenant memecah operasi ke tab `profile`, `subscription`, `addons`, `users`, dan `stores`.
- Dari sisi flow produk, ini adalah pusat kontrol tenant oleh SUPER_ADMIN: edit profil tenant, aktif/nonaktif, oversight subscription, addon, users, dan stores.
- Halaman juga menjadi titik tenant context untuk super admin, sehingga aksi di tab users/stores/addons/subscription mengikuti tenant yang sedang dibuka.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.
- Quota user/store/product tenant sekarang perlu tetap sinkron dengan status subscription/addon tenant detail; regression test harus menjaga agar create limit tidak bocor saat tab detail memicu aksi CRUD.
- Jika tersedia histori billing/invoice/PDF, wiring-nya harus konsisten ke data subscription/addon tenant; jika belum, ini backlog implementasi dan bukan asumsi flow yang sudah jadi.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Pastikan aksi write dari halaman ini benar-benar berhasil end-to-end dan tidak meninggalkan state parsial jika request kedua gagal.
- Cek semua tab tenant detail: profile, subscription, addons, users, stores, status aktif/nonaktif, dan limit plan/addon.
- Cek perubahan yang dilakukan super admin benar-benar mempengaruhi tenant yang sedang dibuka, bukan tenant terakhir yang tersimpan di local state.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Bekukan contract tab tenant detail: profile, subscription, addons, stores, users, billing/export. Semua perubahan harus memantul ke quota dan status tenant yang sama.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

## Auth / Callback

Flow autentikasi dan callback pembayaran. Halaman ini boleh public, tetapi tidak boleh membuka boundary internal tenant tanpa validasi backend.

### /forgot-password
- Nama route: `forgot-password`
- View: `client/src/views/auth/ForgotPassword.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Flow pemulihan password untuk user yang belum login.

**Masuk Dari Mana**
- halaman login
- permintaan reset password

**Keluar / Tersambung Ke Mana**
- /
- /login
- /contact

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Tidak ada sinyal kuat filter/export/PDF/CRUD dari static scan halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.

**Current Code Truth**
- Halaman memakai layout **Standalone** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: User yang sudah login diarahkan ke dashboard sesuai role.
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /, /login, /contact.
- Kemampuan UI yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman..

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini boleh public tetapi tidak boleh membuka akses data internal tanpa verifikasi backend.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /login
- Nama route: `login`
- View: `client/src/views/auth/Login.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Pintu masuk autentikasi semua role.

**Masuk Dari Mana**
- guest/public route
- session expired
- logout dari halaman privat

**Keluar / Tersambung Ke Mana**
- /
- /forgot-password
- /app
- /app/cashier/cash-shift
- /pos
- /open-shift
- /kitchen
- super-dashboard

**API Read**
- Tidak ada `api.get` langsung di file halaman.

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: selector store, modal aksi/konfirmasi.

**Empty / Error / Denied State Yang Harus Dicek**
- Login error:

**Current Code Truth**
- Halaman memakai layout **Standalone** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: User yang sudah login diarahkan ke dashboard sesuai role.
- API langsung dari file halaman: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /, /forgot-password, /app, /app/cashier/cash-shift, /pos, /open-shift, /kitchen, super-dashboard.
- Kemampuan UI yang terdeteksi: selector store, modal aksi/konfirmasi.
- Login adalah gerbang semua role dan menjadi halaman pertama yang paling sering memperlihatkan warning PWA atau missing asset karena shell aplikasi dimuat dari sini.
- Jika user sudah punya session valid, router guard mengembalikan user ke dashboard sesuai role.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini boleh public tetapi tidak boleh membuka akses data internal tanpa verifikasi backend.
- [P2] Warning PWA/install dan asset icon yang hilang seharusnya tidak muncul terus-menerus di halaman login karena ini merusak persepsi kualitas aplikasi.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek login sukses per role, redirect awal sesuai role, dan halaman ini tidak memunculkan warning asset/PWA yang mengganggu.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Pertahankan `apple-touch-icon`, `icon-192`, `icon-512`, dan manifest shortcut `/pos` agar warning asset lama tidak kembali di deploy berikutnya.
- Jika custom install prompt belum diperlukan, biarkan browser menangani prompt native; jika nanti dibutuhkan, tampilkan CTA yang benar-benar memanggil `.prompt()`.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /payment/error
- Nama route: `payment-error`
- View: `client/src/views/payment/PaymentCallback.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Menampilkan hasil callback pembayaran gagal.

**Masuk Dari Mana**
- navigasi aplikasi
- redirect atau shortcut internal

**Keluar / Tersambung Ke Mana**
- /app/subscription
- /app/addons
- /login
- /app

**API Read**
- GET /payment/status/${orderId.value}

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Tidak ada sinyal kuat filter/export/PDF/CRUD dari static scan halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error checking payment status:

**Current Code Truth**
- Halaman memakai layout **Standalone** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: GET /payment/status/${orderId.value}
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /app/subscription, /app/addons, /login, /app.
- Kemampuan UI yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman..

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini boleh public tetapi tidak boleh membuka akses data internal tanpa verifikasi backend.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /payment/pending
- Nama route: `payment-pending`
- View: `client/src/views/payment/PaymentCallback.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Menampilkan status pembayaran pending.

**Masuk Dari Mana**
- navigasi aplikasi
- redirect atau shortcut internal

**Keluar / Tersambung Ke Mana**
- /app/subscription
- /app/addons
- /login
- /app

**API Read**
- GET /payment/status/${orderId.value}

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Tidak ada sinyal kuat filter/export/PDF/CRUD dari static scan halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error checking payment status:

**Current Code Truth**
- Halaman memakai layout **Standalone** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: GET /payment/status/${orderId.value}
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /app/subscription, /app/addons, /login, /app.
- Kemampuan UI yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman..

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini boleh public tetapi tidak boleh membuka akses data internal tanpa verifikasi backend.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

### /payment/success
- Nama route: `payment-success`
- View: `client/src/views/payment/PaymentCallback.vue`
- Phase audit: **Major**
- Status verifikasi route smoke: **PASSED**
- Prioritas audit awal: **P2**
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Menampilkan hasil callback pembayaran sukses ke tenant.

**Masuk Dari Mana**
- navigasi aplikasi
- redirect atau shortcut internal

**Keluar / Tersambung Ke Mana**
- /app/subscription
- /app/addons
- /login
- /app

**API Read**
- GET /payment/status/${orderId.value}

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- Tidak membutuhkan context tenant/store.

**Filter / Export / PDF / Nota / CRUD**
- Tidak ada sinyal kuat filter/export/PDF/CRUD dari static scan halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Error checking payment status:

**Current Code Truth**
- Halaman memakai layout **Standalone** dan saat ini dibuka oleh role: Public.
- Guard aktif yang terdeteksi: tidak ada guard khusus di level router.
- API langsung dari file halaman: GET /payment/status/${orderId.value}
- Dependensi tenant/store saat ini: Tidak membutuhkan context tenant/store.
- Navigasi keluar yang terdeteksi di file halaman: /app/subscription, /app/addons, /login, /app.
- Kemampuan UI yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman..

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini boleh public tetapi tidak boleh membuka akses data internal tanpa verifikasi backend.

**Checklist Audit / TODO Halaman Ini**
- Pastikan role yang benar bisa membuka halaman ini, dan role yang salah diarahkan aman ke dashboard/login/unauthorized.
- Pastikan context tenant/store yang dipakai halaman ini benar, tidak fallback ke tenant/store lain, dan tidak bisa dibypass lewat query/header palsu.
- Pastikan semua API read di halaman ini memuat data tanpa 4xx/5xx tak terduga dan tanpa copy error `gagal memuat ...`.
- Cek empty state, denied state, retry state, dan fallback navigation agar user tidak terjebak di layar kosong.

**Saran Perbaikan**
- Jaga halaman public tetap ringan dan bebas dari call internal yang membutuhkan auth.
- Tambahkan smoke browser/API untuk halaman ini agar error `gagal memuat ...`, `500`, dan redirect salah tertangkap sebelum deploy.

