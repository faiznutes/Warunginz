# PAGE BUSINESS FLOW DETAIL

Generated: 2026-03-07T13:19:37.766Z

## Cara Baca

- `Current code truth` = apa yang benar-benar terlihat dari route, guard, page file, API call langsung, dan wiring yang terdeteksi sekarang.
- `Expected SaaS contract / gap` = target flow bisnis SaaS POS multi-tenant yang seharusnya dijaga. Jika belum terlihat di code, saya tandai sebagai gap implementasi, bukan asumsi palsu.

## Coverage

- Routed page entries covered: 82
- Domain groups: 11
- Source of truth utama: `client/src/router/index.ts`, `client/src/router/addon.routes.ts`, file halaman Vue, auth store, tenant/store guard, dan endpoint yang dipanggil langsung dari page.

## Snapshot Gap Utama

- **P2** Super admin dashboard belum benar-benar memakai contract platform metrics: `/app/super-dashboard` memanggil `GET /dashboard/stats`, sedangkan UI menampilkan metrik platform seperti pendapatan langganan, addon, tenant aktif, total user, dan filter hari/minggu/bulan/tahun. Static scan menunjukkan filter belum dikirim ke API dan beberapa field tidak dijamin tersedia dari endpoint itu.
- **P1** Limit addon/subscription terlihat di UI, tetapi enforcement create belum keras di backend: Halaman users/stores/products sudah menampilkan limit, namun create service untuk user/store/product belum terlihat memanggil guard limit server-side. Artinya tenant bisa berpotensi melewati limit bila request langsung dikirim ke API yang lolos validasi lain.
- **P2** Expiry/downgrade subscription belum memblokir ADMIN_TENANT sesuai kontrak bisnis SaaS yang diinginkan: Guard subscription saat ini masih memberi bypass pada ADMIN_TENANT. Kontrak bisnis yang kamu jelaskan mengarah ke mode restricted-access setelah expired/downgrade, tetapi enforcement granular itu belum sepenuhnya terlihat di static audit.
- **P2** Addon analytics masih punya bypass frontend untuk ADMIN_TENANT: Route yang memakai `requiresAddon: BUSINESS_ANALYTICS` masih diperlakukan sebagai addon dasar untuk ADMIN_TENANT di router guard. Jika kontrak bisnis final ingin fitur tertentu benar-benar terkunci setelah downgrade/addon tidak aktif, ini masih perlu penguatan.

## System / Error

Halaman fallback untuk akses ditolak atau route tidak ditemukan.

### /:pathMatch(.*)*
- Nama route: `not-found`
- View: `client/src/views/NotFound.vue`
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

### /unauthorized
- Nama route: `unauthorized`
- View: `client/src/views/Unauthorized.vue`
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

## Tenant Admin / Settings

Halaman manajemen tenant sendiri: user, store, subscription, addon, settings, dan konfigurasi aplikasi tenant.

### /app/addons
- Nama route: `addons`
- View: `client/src/views/addons/Addons.vue`
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

### /app/settings/2fa
- Nama route: `two-factor-auth`
- View: `client/src/views/settings/TwoFactorAuth.vue`
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

### /app/settings/gdpr
- Nama route: `gdpr-settings`
- View: `client/src/views/settings/GDPRSettings.vue`
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

### /app/settings/loading-states-guide
- Nama route: `loading-states-guide`
- View: `client/src/views/settings/LoadingStatesGuide.vue`
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

### /app/settings/password
- Nama route: `password-settings`
- View: `client/src/views/settings/PasswordSettings.vue`
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

### /app/settings/preferences
- Nama route: `preferences`
- View: `client/src/views/settings/Preferences.vue`
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

### /app/settings/sessions
- Nama route: `sessions`
- View: `client/src/views/settings/Sessions.vue`
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

### /app/settings/store
- Nama route: `store-settings`
- View: `client/src/views/settings/StoreSettings.vue`
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

### /app/settings/subscription
- Nama route: `subscription-plans`
- View: `client/src/views/settings/SubscriptionPlans.vue`
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

### /app/settings/webhooks
- Nama route: `webhooks`
- View: `client/src/views/settings/Webhooks.vue`
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

### /app/settings/webhooks/tester
- Nama route: `webhook-tester`
- View: `client/src/views/settings/WebhookTester.vue`
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

### /app/stores
- Nama route: `stores`
- View: `client/src/views/stores/Stores.vue`
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
- [P1] Jika addon `ADD_OUTLETS` menjadi sumber limit, create store harus diblokir keras saat limit habis, bukan sekadar ditampilkan.

### /app/stores/:id
- Nama route: `store-detail`
- View: `client/src/views/stores/StoreDetail.vue`
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

### /app/stores/:id/edit
- Nama route: `edit-store`
- View: `client/src/views/stores/EditStore.vue`
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

### /app/subscription
- Nama route: `subscription`
- View: `client/src/views/subscription/Subscription.vue`
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
- [P2] Kontrak bisnis upgrade/downgrade/expired yang kamu jelaskan lebih ketat daripada enforcement yang terlihat sekarang. Restricted-access pasca expired masih perlu penguatan backend/frontend.
- Jika upgrade dari basic ke pro menambah durasi atau masa aktif secara spesifik, aturan akumulasi itu harus seragam antara UI, service subscription, dan laporan billing.

### /app/users
- Nama route: `users`
- View: `client/src/views/users/Users.vue`
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
- [P1] Limit user tidak cukup hanya tampil di UI; create user harus ditolak server-side ketika quota tenant sudah habis.

## Reports / Finance

Halaman laporan, analitik, keuangan, dan ekspor PDF/print yang harus tetap tenant-scoped atau platform-scoped sesuai role.

### /app/analytics
- Nama route: `analytics`
- View: `client/src/views/analytics/AdvancedAnalytics.vue`
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

### /app/finance
- Nama route: `finance`
- View: `client/src/views/finance/AccountingFinance.vue`
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
- [P2] Router guard masih menganggap `BUSINESS_ANALYTICS` sebagai addon dasar untuk ADMIN_TENANT. Jika finance premium seharusnya benar-benar terkunci, current code truth belum cukup keras.

### /app/finance/management
- Nama route: `financial-management`
- View: `client/src/views/finance/FinancialManagement.vue`
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

### /app/finance/transactions
- Nama route: `transactions`
- View: `client/src/views/finance/Transactions.vue`
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

### /app/profit-loss
- Nama route: `profit-loss`
- View: `client/src/views/finance/ProfitLossReport.vue`
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
- [P2] Sama seperti finance/analytics, enforcement addon premium untuk ADMIN_TENANT masih perlu dipastikan sesuai kontrak bisnis final.

### /app/reports
- Nama route: `reports`
- View: `client/src/views/reports/Reports.vue`
- Role yang boleh akses: ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN
- Tujuan bisnis halaman: Laporan tenant/store sesuai role dan permission.

**Masuk Dari Mana**
- dashboard tenant
- menu reports
- operasional tenant

**Keluar / Tersambung Ke Mana**
- Tetap di halaman ini atau kembali ke dashboard/menu domain terkait.

**API Read**
- GET /reports/tenant
- GET /analytics/predictions
- GET /analytics/top-products

**API Write**
- Tidak ada write API langsung di file halaman.

**Tenant / Store Scope**
- SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: filter periode/tanggal, selector tenant, navigasi tab/section, modal aksi/konfirmasi, ekspor data.

**Empty / Error / Denied State Yang Harus Dicek**
- Tenant ID tidak tersedia. Silakan login kembali.; Error loading report:; Gagal memuat laporan; Error loading analytics:

**Current Code Truth**
- Halaman memakai layout **DynamicLayout** dan saat ini dibuka oleh role: ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Untuk role CASHIER, permission `canViewReports` dicek di frontend; jika gagal, user dialihkan ke dashboard role. Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /reports/tenant; GET /analytics/predictions; GET /analytics/top-products
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, selector tenant, navigasi tab/section, modal aksi/konfirmasi, ekspor data.
- Halaman laporan tenant/store dipakai oleh ADMIN_TENANT, SUPERVISOR, CASHIER, dan SUPER_ADMIN.
- CASHIER hanya boleh masuk jika `canViewReports` aktif.
- Static scan menunjukkan export/report modal tersedia, sehingga contract ekspor laporan memang sudah ada di layer UI.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, hasil report harus mengikuti tenant/store scope, filter waktu, dan rule export yang konsisten.
- Role CASHIER seharusnya hanya melihat/menjalankan flow ini bila permission `canViewReports` benar.
- Jika plan downgrade/expired mengurangi fitur, restriction itu seharusnya ditegakkan konsisten di router, backend, dan UI action.
- Setelah expiry/downgrade, kontrak akses 'tenant masih boleh lihat laporan tetapi tidak boleh pakai fitur tertentu' harus diterjemahkan jadi matrix guard yang eksplisit. Saat ini masih ada gap enforcement untuk ADMIN_TENANT.

### /app/reports/advanced
- Nama route: `advanced-reporting`
- View: `client/src/views/reports/AdvancedReporting.vue`
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

### /app/reports/stores
- Nama route: `store-reports`
- View: `client/src/views/reports/StoreReports.vue`
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

## Cashier / POS / Shift

Flow kasir. Kontrak bisnis utamanya adalah `open shift -> POS -> close shift` tanpa shortcut yang merusak kontrol operasional.

### /app/cashier/cash-shift
- Nama route: `cash-shift`
- View: `client/src/views/cashier/CashShift.vue`
- Role yang boleh akses: CASHIER
- Tujuan bisnis halaman: Pusat kontrol shift kasir: status aktif, riwayat, tutup shift, dan recovery mismatch.

**Masuk Dari Mana**
- menu shift kasir
- recovery redirect
- operasional cashier

**Keluar / Tersambung Ke Mana**
- /open-shift

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
- Navigasi keluar yang terdeteksi di file halaman: /open-shift.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, search/kata kunci, selector store, navigasi tab/section, modal aksi/konfirmasi, pagination, aksi create.
- Halaman ini adalah pusat kontrol shift kasir: histori, status aktif, open/close cash shift, dan recovery mismatch.
- Bug misleading state 'sudah buka shift tapi UI masih terlihat seperti buka shift lagi' sudah ditutup di baseline sebelumnya lewat perbaikan tab fokus state aktif.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini menjadi bagian state machine shift kasir dan tidak boleh melewati urutan operasional yang salah.
- Halaman ini harus tetap menjadi satu sumber kebenaran untuk status shift. Jika state backend dan UI berbeda lagi, itu masuk defect P1 operasional.

### /app/pos/failed-syncs
- Nama route: `failed-sync-review`
- View: `client/src/views/pos/FailedSyncReview.vue`
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
- POST /orders
- POST /transactions

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

### /open-shift
- Nama route: `open-shift`
- View: `client/src/views/cashier/OpenShift.vue`
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

### /pos
- Nama route: `pos-fullscreen`
- View: `client/src/views/pos/POS.vue`
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
- GET /discounts

**API Write**
- POST /orders
- POST /transactions

**Tenant / Store Scope**
- Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.

**Filter / Export / PDF / Nota / CRUD**
- Deteksi static UI: search/kata kunci, selector tenant, selector store, navigasi tab/section, modal aksi/konfirmasi.
- indikasi PDF/print/nota tersedia di halaman atau child component
- Ada flow create/submit langsung dari halaman.

**Empty / Error / Denied State Yang Harus Dicek**
- Keranjang kosong; Kosongkan keranjang?; Error loading members:; Error loading discounts:

**Current Code Truth**
- Halaman memakai layout **Fullscreen** dan saat ini dibuka oleh role: CASHIER, SUPERVISOR, ADMIN_TENANT.
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [CASHIER, SUPERVISOR, ADMIN_TENANT] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- API langsung dari file halaman: GET /tenant/profile; GET /members; GET /discounts; POST /orders; POST /transactions
- Dependensi tenant/store saat ini: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Navigasi keluar yang terdeteksi di file halaman: body, /app/dashboard, /pos, /app/orders, /app/products, /app/customers, /app/reports, /app/cashier/cash-shift.
- Kemampuan UI yang terdeteksi: search/kata kunci, selector tenant, selector store, navigasi tab/section, modal aksi/konfirmasi, aksi create.
- POS adalah halaman transaksi utama untuk CASHIER, SUPERVISOR, dan ADMIN_TENANT.
- Untuk CASHIER, route ini tidak boleh dilewati sebelum shift sehat; router akan mengirim ke `/open-shift` atau `/app/cashier/cash-shift` bila konteks shift belum valid.
- Halaman ini juga menjadi sumber order yang kemudian diteruskan ke kitchen flow dan receipt/nota flow.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini menjadi bagian state machine shift kasir dan tidak boleh melewati urutan operasional yang salah.
- POS harus selalu store-scoped dan tenant-scoped. Forged tenant/store context tidak boleh membuat kasir melihat data store lain.

## Catalog / CRM / Inventory

Halaman master data dan growth ops: products, customers, rewards, discounts, inventory, delivery, marketing.

### /app/customers
- Nama route: `customers`
- View: `client/src/views/customers/Customers.vue`
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

### /app/discounts
- Nama route: `discounts`
- View: `client/src/views/discounts/Discounts.vue`
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
- Guard aktif yang terdeteksi: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- API langsung dari file halaman: GET /products; GET /discounts; PUT /discounts/${editingDiscount.value.id}; POST /discounts; DELETE /discounts/${id}
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Kemampuan UI yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, aksi create, aksi update, aksi delete.
- Halaman diskon adalah fitur admin-level untuk ADMIN_TENANT dan SUPER_ADMIN.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.
- Jika plan downgrade/expired mengurangi fitur, restriction itu seharusnya ditegakkan konsisten di router, backend, dan UI action.
- [P2] Jika plan basic setelah downgrade/expired memang tidak boleh mengakses diskon, enforcement feature lock harus jelas. Static audit belum menunjukkan guard granular itu sudah keras.

### /app/inventory/purchase-orders
- Nama route: `purchase-orders`
- View: `client/src/views/inventory/PurchaseOrders.vue`
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

### /app/inventory/restock-suggestions
- Nama route: `restock-suggestions`
- View: `client/src/views/inventory/RestockSuggestions.vue`
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

### /app/inventory/stock-alerts
- Nama route: `stock-alerts`
- View: `client/src/views/inventory/StockAlerts.vue`
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

### /app/inventory/stock-transfers
- Nama route: `stock-transfers`
- View: `client/src/views/inventory/StockTransfers.vue`
- Role yang boleh akses: ADMIN_TENANT, SUPER_ADMIN
- Tujuan bisnis halaman: Halaman Stock Transfers untuk domain catalog / crm / inventory.

**Masuk Dari Mana**
- menu/sidebar sesuai role
- shortcut dari dashboard atau tabel terkait

**Keluar / Tersambung Ke Mana**
- body

**API Read**
- GET /outlets
- GET /products?limit=1000
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
- API langsung dari file halaman: GET /outlets; GET /products?limit=1000; GET /stock-transfers; POST /stock-transfers; PUT /stock-transfers/${id}/cancel
- Dependensi tenant/store saat ini: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Navigasi keluar yang terdeteksi di file halaman: body.
- Kemampuan UI yang terdeteksi: selector store, navigasi tab/section, modal aksi/konfirmasi, pagination, aksi create, aksi update.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, data harus mengikuti tenant aktif dan store scope yang sah.

### /app/inventory/suppliers
- Nama route: `suppliers`
- View: `client/src/views/inventory/Suppliers.vue`
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

### /app/marketing
- Nama route: `marketing`
- View: `client/src/views/marketing/MarketingCampaigns.vue`
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

### /app/marketing/customer-engagement
- Nama route: `customer-engagement`
- View: `client/src/views/marketing/CustomerEngagement.vue`
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

### /app/marketing/email-analytics
- Nama route: `email-analytics`
- View: `client/src/views/marketing/EmailAnalytics.vue`
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

### /app/marketing/email-scheduler
- Nama route: `email-scheduler`
- View: `client/src/views/marketing/EmailScheduler.vue`
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

### /app/marketing/email-templates
- Nama route: `email-templates`
- View: `client/src/views/marketing/EmailTemplates.vue`
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

### /app/products
- Nama route: `products`
- View: `client/src/views/products/Products.vue`
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
- [P1] Jika addon/subscription memberi limit produk, backend create/update produk seharusnya memblokir hard limit, bukan hanya menampilkan progress limit di UI.
- Setelah downgrade/expired plan, fitur seperti diskon/produk premium harus benar-benar dipersempit sesuai kontrak final; saat ini itu masih perlu verifikasi enforcement lebih dalam.

### /app/products/adjustments
- Nama route: `product-adjustments`
- View: `client/src/views/products/ProductAdjustments.vue`
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

### /app/reward-view
- Nama route: `reward-view`
- View: `client/src/views/rewards/RewardView.vue`
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

### /app/rewards
- Nama route: `rewards`
- View: `client/src/views/rewards/Rewards.vue`
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

## Store Operations

Halaman operasional harian tenant/store: dashboard, orders, support, delivery, dan aktivitas store-level.

### /app/dashboard
- Nama route: `dashboard`
- View: `client/src/views/dashboard/Dashboard.vue`
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

### /app/delivery
- Nama route: `delivery`
- View: `client/src/views/delivery/DeliveryOrders.vue`
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

### /app/orders
- Nama route: `orders`
- View: `client/src/views/orders/Orders.vue`
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

### /app/support
- Nama route: `client-support`
- View: `client/src/views/support/ClientSupport.vue`
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

## Kitchen

Flow dapur. Hanya order store yang ditugaskan yang boleh muncul, dan status dapur harus aman dari sisi authz/store-scope.

### /app/orders/kitchen
- Nama route: `kitchen-orders`
- View: `client/src/views/kitchen/KitchenOrders.vue`
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

### /kitchen
- Nama route: `kitchen-display`
- View: `client/src/views/kitchen/KitchenOrders.vue`
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

## System / Utility

Halaman utility atau support internal yang tidak sepenting core business, tetapi tetap harus konsisten dengan auth, tenant, dan error handling.

### /app/receipts/templates
- Nama route: `receipt-templates`
- View: `client/src/views/receipts/ReceiptTemplates.vue`
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

## Super Admin / Platform

Halaman platform untuk SUPER_ADMIN: monitoring lintas tenant, tenant detail, global report, pengaturan platform, dan kontrol subscription/addon tenant.

### /app/reports/global
- Nama route: `global-reports`
- View: `client/src/views/reports/GlobalReports.vue`
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
- Laporan global idealnya menjadi sumber data yang dipakai juga oleh super dashboard, sehingga angka platform tidak berasal dari dua contract yang berbeda.

### /app/settings/additional-components-guide
- Nama route: `additional-components-guide`
- View: `client/src/views/settings/AdditionalComponentsGuide.vue`
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

### /app/settings/advanced-components-guide
- Nama route: `advanced-components-guide`
- View: `client/src/views/settings/AdvancedComponentsGuide.vue`
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

### /app/settings/archive
- Nama route: `archive-management`
- View: `client/src/views/settings/ArchiveManagement.vue`
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

### /app/settings/retention
- Nama route: `retention-management`
- View: `client/src/views/settings/RetentionManagement.vue`
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

### /app/settings/style-guide
- Nama route: `style-guide`
- View: `client/src/views/settings/FormStyleGuide.vue`
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

### /app/settings/system
- Nama route: `system-settings`
- View: `client/src/views/settings/SystemSettings.vue`
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

### /app/settings/table-style-guide
- Nama route: `table-style-guide`
- View: `client/src/views/settings/TableStyleGuide.vue`
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

### /app/super-dashboard
- Nama route: `super-dashboard`
- View: `client/src/views/superadmin/SuperDashboard.vue`
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
- GET /dashboard/stats

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
- API langsung dari file halaman: GET /dashboard/stats
- Dependensi tenant/store saat ini: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Navigasi keluar yang terdeteksi di file halaman: /app/reports/global, /app/tenants, /app/superadmin/contact-messages, /app/users, /app/addons.
- Kemampuan UI yang terdeteksi: filter periode/tanggal, navigasi tab/section, ekspor data.
- Halaman memakai `GET /dashboard/stats` sebagai satu-satunya API langsung yang terdeteksi di file halaman.
- Tombol filter `Hari Ini / Minggu / Bulan / Tahun` mengubah state lokal lalu memanggil loader yang sama, tetapi static scan di file halaman tidak menemukan query period dikirim ke API.
- UI menampilkan kartu `totalRevenue`, `totalSubscriptionRevenue`, `totalAddonRevenue`, `totalTenants`, dan `totalUsers`, namun tidak semua field itu dijamin berasal dari endpoint `/dashboard/stats` yang tenant-oriented.
- Widget seperti `recentAddons` dan `subscriptionBreakdown` bergantung pada data statistik/global report, tetapi file halaman tidak memanggil endpoint global report secara langsung.

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini harus aman untuk lintas tenant hanya ketika SUPER_ADMIN memilih tenant context yang benar.
- [P2] Dashboard platform seharusnya memakai endpoint agregasi lintas tenant yang benar-benar menghormati filter hari/minggu/bulan/tahun.
- [P2] Kalau target bisnisnya adalah laporan platform penuh, halaman ini harus menampilkan pendapatan penjualan, subscription, addon, tenant aktif, total user, dan volume transaksi/nota dari contract backend yang konsisten.

### /app/superadmin/backups
- Nama route: `superadmin-backups`
- View: `client/src/views/superadmin/BackupManagement.vue`
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

### /app/superadmin/contact-messages
- Nama route: `contact-messages`
- View: `client/src/views/superadmin/ContactMessages.vue`
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

### /app/superadmin/server-monitor
- Nama route: `server-monitor`
- View: `client/src/views/superadmin/ServerMonitor.vue`
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

### /app/superadmin/system-info
- Nama route: `system-info`
- View: `client/src/views/superadmin/SystemInfo.vue`
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

### /app/tenants
- Nama route: `tenants`
- View: `client/src/views/tenants/Tenants.vue`
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

### /app/tenants/:id
- Nama route: `tenant-detail`
- View: `client/src/views/tenants/TenantDetail.vue`
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
- [P1] Limit addon/store/user/product seharusnya bukan hanya terlihat di detail tenant, tetapi juga benar-benar ditegakkan saat create/update data terkait.
- Jika tersedia histori billing/invoice/PDF, wiring-nya harus konsisten ke data subscription/addon tenant; jika belum, ini backlog implementasi dan bukan asumsi flow yang sudah jadi.

## Public / Marketing

Halaman publik yang tidak butuh login. Tujuannya akuisisi tenant, edukasi produk, pricing, bantuan, dan entry point prospek.

### /contact
- Nama route: `contact`
- View: `client/src/views/marketing/Contact.vue`
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

### /contact/success
- Nama route: `contact-success`
- View: `client/src/views/marketing/ContactSuccess.vue`
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

### /demo
- Nama route: `demo`
- View: `client/src/views/marketing/Demo.vue`
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

### /help
- Nama route: `help`
- View: `client/src/views/marketing/Help.vue`
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

### /help/:slug
- Nama route: `help-article`
- View: `client/src/views/marketing/HelpArticle.vue`
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

### /help/category/:categoryId
- Nama route: `help-category`
- View: `client/src/views/marketing/HelpCategory.vue`
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

### /pricing
- Nama route: `pricing`
- View: `client/src/views/marketing/Pricing.vue`
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

### /terms
- Nama route: `terms`
- View: `client/src/views/marketing/Terms.vue`
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

### home
- Nama route: `home`
- View: `client/src/views/marketing/Home.vue`
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Halaman Home untuk domain public / marketing.

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

## Auth / Callback

Flow autentikasi dan callback pembayaran. Halaman ini boleh public, tetapi tidak boleh membuka boundary internal tenant tanpa validasi backend.

### /forgot-password
- Nama route: `forgot-password`
- View: `client/src/views/auth/ForgotPassword.vue`
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

### /login
- Nama route: `login`
- View: `client/src/views/auth/Login.vue`
- Role yang boleh akses: Public
- Tujuan bisnis halaman: Pintu masuk autentikasi semua role.

**Masuk Dari Mana**
- guest/public route
- redirect session expired

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

**Expected SaaS Contract / Gap**
- Secara kontrak SaaS, halaman ini boleh public tetapi tidak boleh membuka akses data internal tanpa verifikasi backend.

### /payment/error
- Nama route: `payment-error`
- View: `client/src/views/payment/PaymentCallback.vue`
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

### /payment/pending
- Nama route: `payment-pending`
- View: `client/src/views/payment/PaymentCallback.vue`
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

### /payment/success
- Nama route: `payment-success`
- View: `client/src/views/payment/PaymentCallback.vue`
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

