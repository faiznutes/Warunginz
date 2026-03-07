# PAGE LOGIC MAP

Generated: 2026-03-07T13:19:37.390Z

## Coverage

- Routed page entries covered: 82
- Page files with direct API calls: 65
- Page files without direct API calls: 17
- Scope: seluruh routed views yang dipakai user, termasuk halaman sistem/internal yang masih aktif di router.

## Domain Summary

| Domain | Pages |
|---|---:|
| System / Error | 2 |
| Tenant Admin / Settings | 16 |
| Reports / Finance | 8 |
| Cashier / POS / Shift | 4 |
| Catalog / CRM / Inventory | 16 |
| Store Operations | 4 |
| Kitchen | 2 |
| System / Utility | 1 |
| Super Admin / Platform | 15 |
| Public / Marketing | 9 |
| Auth / Callback | 5 |

## Page By Page

## System / Error

### /:pathMatch(.*)*
- View: `client/src/views/NotFound.vue`
- Route name: `not-found`
- Layout: Standalone
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Halaman Not Found untuk domain system / error.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: /, /pricing, /demo, /contact, /help, /terms
- Filter/export/CRUD yang terdeteksi: search/kata kunci
- Empty/error state yang perlu dicek: 404, page not found, error page
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /unauthorized
- View: `client/src/views/Unauthorized.vue`
- Route name: `unauthorized`
- Layout: Standalone
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Halaman Unauthorized untuk domain system / error.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: /app/super-dashboard/addons, /app
- Filter/export/CRUD yang terdeteksi: bulk action, ekspor data
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

## Tenant Admin / Settings

### /app/addons
- View: `client/src/views/addons/Addons.vue`
- Route name: `addons`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Kelola pembelian atau aktivasi addon tenant.
- API utama: GET /addons/available; GET /addons; GET /subscriptions/current; POST /payment/addon; POST /addons/unsubscribe/${addonId}
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, selector tenant, modal aksi/konfirmasi, aksi create
- Empty/error state yang perlu dicek: [Addons] availableRes.data is not array, setting to empty array; [Addons] Error loading addons:; Tidak ada deskripsi; Gagal membuat pembayaran
- Aksi write yang tersedia: POST /payment/addon; POST /addons/unsubscribe/${addonId}

### /app/settings/2fa
- View: `client/src/views/settings/TwoFactorAuth.vue`
- Route name: `two-factor-auth`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Pengaturan two-factor authentication.
- API utama: GET /2fa/status; POST /2fa/generate; POST /2fa/enable; POST /2fa/disable
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: modal aksi/konfirmasi, aksi create
- Empty/error state yang perlu dicek: Error loading 2FA status:; Error generating 2FA secret:; Gagal membuat kode QR; Error enabling 2FA:
- Aksi write yang tersedia: POST /2fa/generate; POST /2fa/enable; POST /2fa/disable

### /app/settings/gdpr
- View: `client/src/views/settings/GDPRSettings.vue`
- Route name: `gdpr-settings`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Pengaturan privasi/retensi data user.
- API utama: GET /gdpr/export; GET /gdpr/export-tenant; POST /gdpr/delete
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: navigasi tab/section, ekspor data, aksi create
- Empty/error state yang perlu dicek: Error exporting data:; Gagal mengekspor data; Error exporting tenant data:; Gagal mengekspor data tenant
- Aksi write yang tersedia: POST /gdpr/delete

### /app/settings/loading-states-guide
- View: `client/src/views/settings/LoadingStatesGuide.vue`
- Route name: `loading-states-guide`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Loading States Guide untuk domain tenant admin / settings.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: search/kata kunci, navigasi tab/section
- Empty/error state yang perlu dicek: Default Empty State; Tidak Ada Produk; Belum ada produk yang ditambahkan. Mulai dengan menambahkan produk pertama Anda.; Search Results Empty
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/settings/password
- View: `client/src/views/settings/PasswordSettings.vue`
- Route name: `password-settings`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Ubah password user yang login.
- API utama: POST /password/update
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: aksi create
- Empty/error state yang perlu dicek: Error updating password:; Gagal memperbarui kata sandi
- Aksi write yang tersedia: POST /password/update

### /app/settings/preferences
- View: `client/src/views/settings/Preferences.vue`
- Route name: `preferences`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Preferensi aplikasi untuk user yang login.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman.
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/settings/sessions
- View: `client/src/views/settings/Sessions.vue`
- Route name: `sessions`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Kelola session aktif user.
- API utama: GET /sessions; DELETE /sessions/${sessionId}; POST /sessions/revoke-all
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: aksi create, aksi delete
- Empty/error state yang perlu dicek: Error loading sessions:; Error revoking session:; Gagal mengakhiri sesi; Error revoking all sessions:
- Aksi write yang tersedia: DELETE /sessions/${sessionId}; POST /sessions/revoke-all

### /app/settings/store
- View: `client/src/views/settings/StoreSettings.vue`
- Route name: `store-settings`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT
- Gate tambahan: -
- Tujuan halaman: Pengaturan store level tenant.
- API utama: GET /tenant/profile; PUT /tenant/profile
- Dependensi tenant/store: Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: aksi update
- Empty/error state yang perlu dicek: Error loading settings:; Gagal memuat pengaturan toko; Error updating features:; Gagal memperbarui fitur
- Aksi write yang tersedia: PUT /tenant/profile

### /app/settings/subscription
- View: `client/src/views/settings/SubscriptionPlans.vue`
- Route name: `subscription-plans`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Subscription Plans untuk domain tenant admin / settings.
- API utama: GET /subscriptions/current; GET /addons/check-limit/ADD_OUTLETS; GET /addons/check-limit/ADD_USERS; POST /subscriptions/upgrade
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, aksi create
- Empty/error state yang perlu dicek: Error loading current plan:; Error checking limits:; Gagal mengupgrade paket
- Aksi write yang tersedia: POST /subscriptions/upgrade

### /app/settings/webhooks
- View: `client/src/views/settings/Webhooks.vue`
- Route name: `webhooks`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Kelola webhook tenant/platform.
- API utama: GET /webhooks?includeInactive=true; PUT /webhooks/${editingWebhook.value.id}; POST /webhooks; DELETE /webhooks/${id}; POST /webhooks/${id}/test
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: `/app/settings/webhooks/tester?webhookId=${webhook.id}`, body
- Filter/export/CRUD yang terdeteksi: modal aksi/konfirmasi, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Error loading webhooks:; Error saving webhook:; Gagal menyimpan webhook; Error deleting webhook:
- Aksi write yang tersedia: PUT /webhooks/${editingWebhook.value.id}; POST /webhooks; DELETE /webhooks/${id}; POST /webhooks/${id}/test

### /app/settings/webhooks/tester
- View: `client/src/views/settings/WebhookTester.vue`
- Route name: `webhook-tester`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Tester webhook untuk validasi integrasi.
- API utama: GET /webhooks?includeInactive=true; GET /webhooks/${selectedWebhookId.value}/deliveries; POST /webhooks/${selectedWebhookId.value}/test; POST /webhooks/${selectedWebhookId.value}/replay/${deliveryId}
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: /app/settings/webhooks
- Filter/export/CRUD yang terdeteksi: pagination, aksi create
- Empty/error state yang perlu dicek: Error loading webhooks:; Gagal memuat daftar webhook; Error loading deliveries:; Gagal memuat riwayat pengiriman
- Aksi write yang tersedia: POST /webhooks/${selectedWebhookId.value}/test; POST /webhooks/${selectedWebhookId.value}/replay/${deliveryId}

### /app/stores
- View: `client/src/views/stores/Stores.vue`
- Route name: `stores`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Kelola daftar toko/outlet tenant.
- API utama: GET /outlets; GET /addons/check-limit/ADD_OUTLETS; PUT /outlets/${editingStore.value.id}; POST /outlets; DELETE /outlets/${store.id}
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: `/app/stores/${store.id}`, body
- Filter/export/CRUD yang terdeteksi: selector tenant, modal aksi/konfirmasi, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Gagal memuat daftar toko; Gagal menyimpan toko; Gagal menghapus toko
- Aksi write yang tersedia: PUT /outlets/${editingStore.value.id}; POST /outlets; DELETE /outlets/${store.id}

### /app/stores/:id
- View: `client/src/views/stores/StoreDetail.vue`
- Route name: `store-detail`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Detail toko/outlet tertentu.
- API utama: GET /outlets/${route.params.id}
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: /app/dashboard, /app/stores, `/app/stores/${store.id}/edit`, /app/pos, /app/support
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/stores/:id/edit
- View: `client/src/views/stores/EditStore.vue`
- Route name: `edit-store`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Form edit outlet/store.
- API utama: GET /outlets/${route.params.id}; PUT /outlets/${route.params.id}
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: `/app/stores/${route.params.id}`, /app/stores/${route.params.id}
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, aksi update
- Empty/error state yang perlu dicek: Gagal memuat data toko; Gagal menyimpan perubahan
- Aksi write yang tersedia: PUT /outlets/${route.params.id}

### /app/subscription
- View: `client/src/views/subscription/Subscription.vue`
- Route name: `subscription`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Kelola paket langganan tenant.
- API utama: GET /subscriptions/current; POST /payment/addon
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: /pricing
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, selector tenant, aksi create
- Empty/error state yang perlu dicek: Error loading subscription:; Gagal membuat pembayaran; Error creating payment:
- Aksi write yang tersedia: POST /payment/addon

### /app/users
- View: `client/src/views/users/Users.vue`
- Route name: `users`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Kelola user tenant dan assignment role/store.
- API utama: GET /users; GET /addons/check-limit/ADD_USERS; PUT /users/${editingUser.value.id}; POST /users; DELETE /users/${id}
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: selector tenant, navigasi tab/section, modal aksi/konfirmasi, pagination, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Error loading users:; Error saving user:
- Aksi write yang tersedia: PUT /users/${editingUser.value.id}; POST /users; DELETE /users/${id}

## Reports / Finance

### /app/analytics
- View: `client/src/views/analytics/AdvancedAnalytics.vue`
- Route name: `analytics`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: requiresAddon BUSINESS_ANALYTICS
- Tujuan halaman: Advanced analytics tenant bila addon aktif.
- API utama: GET /analytics/predictions; GET /analytics/top-products; GET /analytics/custom-reports; GET /outlets; GET /analytics/custom-reports/${report.id}/export; POST /analytics/custom-reports
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `BUSINESS_ANALYTICS`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- Navigasi keluar yang terdeteksi: /app/addons, body
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, navigasi tab/section, modal aksi/konfirmasi, pagination, ekspor data, aksi create
- Empty/error state yang perlu dicek: Tidak ada deskripsi; Error loading analytics:; Error exporting report:; Gagal mengekspor report
- Aksi write yang tersedia: POST /analytics/custom-reports

### /app/finance
- View: `client/src/views/finance/AccountingFinance.vue`
- Route name: `finance`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: requiresAddon BUSINESS_ANALYTICS
- Tujuan halaman: Ringkasan keuangan tenant.
- API utama: GET /finance/summary; GET /finance/balance-sheet; GET /finance/cash-flow
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `BUSINESS_ANALYTICS`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: selector tenant, navigasi tab/section, modal aksi/konfirmasi, ekspor data
- Empty/error state yang perlu dicek: Error loading financial data:; Error exporting report:; Gagal mengekspor laporan
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/finance/management
- View: `client/src/views/finance/FinancialManagement.vue`
- Route name: `financial-management`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: requiresAddon BUSINESS_ANALYTICS
- Tujuan halaman: Manajemen keuangan lebih detail bila addon aktif.
- API utama: GET /financial-management/cash-flow/summary; GET /financial-management/expenses/by-category; POST /financial-management/tax/calculate; GET /financial-management/forecast; POST /financial-management/cash-flow; POST /financial-management/expenses; POST /financial-management/bank-reconciliation
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `BUSINESS_ANALYTICS`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: body, /app/reports?type=cashflow
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, navigasi tab/section, modal aksi/konfirmasi, aksi create
- Empty/error state yang perlu dicek: Error loading cash flow summary:; Gagal memuat cash flow summary; Error loading expenses:; Error calculating tax:
- Aksi write yang tersedia: POST /financial-management/tax/calculate; POST /financial-management/cash-flow; POST /financial-management/expenses; POST /financial-management/bank-reconciliation

### /app/finance/transactions
- View: `client/src/views/finance/Transactions.vue`
- Route name: `transactions`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Daftar transaksi keuangan tenant.
- API utama: GET /orders; GET /orders/export
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: search/kata kunci, filter status, navigasi tab/section, modal aksi/konfirmasi, pagination, ekspor data
- Empty/error state yang perlu dicek: Error loading transactions:; Gagal memuat data transaksi; Export error:
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/profit-loss
- View: `client/src/views/finance/ProfitLossReport.vue`
- Route name: `profit-loss`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: requiresAddon BUSINESS_ANALYTICS
- Tujuan halaman: Laporan laba/rugi tenant.
- API utama: GET /finance/profit-loss
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `BUSINESS_ANALYTICS`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- Navigasi keluar yang terdeteksi: /app/addons
- Filter/export/CRUD yang terdeteksi: ekspor data
- Empty/error state yang perlu dicek: Gagal memuat laporan laba rugi; Gagal memuat laporan; Gagal mengekspor laporan
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/reports
- View: `client/src/views/reports/Reports.vue`
- Route name: `reports`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN
- Gate tambahan: requiresPermission CASHIER:canViewReports
- Tujuan halaman: Laporan tenant/store sesuai role dan permission.
- API utama: GET /reports/tenant; GET /analytics/predictions; GET /analytics/top-products
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Untuk role CASHIER, permission `canViewReports` dicek di frontend; jika gagal, user dialihkan ke dashboard role. Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, selector tenant, navigasi tab/section, modal aksi/konfirmasi, ekspor data
- Empty/error state yang perlu dicek: Tenant ID tidak tersedia. Silakan login kembali.; Error loading report:; Gagal memuat laporan; Error loading analytics:
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/reports/advanced
- View: `client/src/views/reports/AdvancedReporting.vue`
- Route name: `advanced-reporting`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: requiresAddon BUSINESS_ANALYTICS
- Tujuan halaman: Halaman Advanced Reporting untuk domain reports / finance.
- API utama: GET /advanced-reporting/templates; GET /advanced-reporting/scheduled; GET /advanced-reporting/dashboard-settings; PUT /advanced-reporting/templates/${editingTemplate.value.id}; POST /advanced-reporting/templates; PUT /advanced-reporting/scheduled/${editingScheduleId.value}; POST /advanced-reporting/scheduled; PUT /advanced-reporting/dashboard-settings
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `BUSINESS_ANALYTICS`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, navigasi tab/section, modal aksi/konfirmasi, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Tidak ada deskripsi; Error loading templates:; Gagal memuat template laporan; Error loading scheduled reports:
- Aksi write yang tersedia: PUT /advanced-reporting/templates/${editingTemplate.value.id}; POST /advanced-reporting/templates; PUT /advanced-reporting/scheduled/${editingScheduleId.value}; POST /advanced-reporting/scheduled; PUT /advanced-reporting/dashboard-settings; POST /advanced-reporting/generate; DELETE /advanced-reporting/scheduled/${report.id}

### /app/reports/stores
- View: `client/src/views/reports/StoreReports.vue`
- Route name: `store-reports`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Store Reports untuk domain reports / finance.
- API utama: GET /reports/multi
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: navigasi tab/section
- Empty/error state yang perlu dicek: Gagal memuat laporan
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

## Cashier / POS / Shift

### /app/cashier/cash-shift
- View: `client/src/views/cashier/CashShift.vue`
- Route name: `cash-shift`
- Layout: DynamicLayout
- Roles: CASHIER
- Gate tambahan: -
- Tujuan halaman: Pusat kontrol shift kasir: status aktif, riwayat, tutup shift, dan recovery mismatch.
- API utama: GET /store-shift/current; GET /cash-shift/current; GET /cash-shift/history; POST /store-shift/open; POST /cash-shift/open; POST /cash-shift/close; GET /store-shift/today; GET /store-shift/history
- Dependensi tenant/store: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [CASHIER] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: /open-shift
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, search/kata kunci, selector store, navigasi tab/section, modal aksi/konfirmasi, pagination, aksi create
- Empty/error state yang perlu dicek: Error loading current store shift:; Error loading current shift:; Error loading shift history:; Gagal membuka shift toko
- Aksi write yang tersedia: POST /store-shift/open; POST /cash-shift/open; POST /cash-shift/close

### /app/pos/failed-syncs
- View: `client/src/views/pos/FailedSyncReview.vue`
- Route name: `failed-sync-review`
- Layout: DynamicLayout
- Roles: CASHIER, ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Failed Sync Review untuk domain cashier / pos / shift.
- API utama: POST /orders; POST /transactions
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [CASHIER, ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: /pos
- Filter/export/CRUD yang terdeteksi: navigasi tab/section, aksi create
- Empty/error state yang perlu dicek: Unknown connection error; Unknown error
- Aksi write yang tersedia: POST /orders; POST /transactions

### /open-shift
- View: `client/src/views/cashier/OpenShift.vue`
- Route name: `open-shift`
- Layout: Fullscreen
- Roles: CASHIER, SUPERVISOR
- Gate tambahan: -
- Tujuan halaman: Flow buka shift toko/kasir atau recovery sebelum kasir boleh bertransaksi.
- API utama: GET /store-shift/current; GET /cash-shift/current; GET /outlets/${resolvedStoreId.value}; POST /store-shift/open; POST /cash-shift/open; POST /cash-shift/close
- Dependensi tenant/store: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [CASHIER, SUPERVISOR] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Jika shift sudah sehat, route ini akan mendorong user ke `/pos`; jika state mismatch, diarahkan ke `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: /app/cashier/cash-shift, /app/dashboard, /pos
- Filter/export/CRUD yang terdeteksi: selector store, modal aksi/konfirmasi, aksi create
- Empty/error state yang perlu dicek: Gagal memuat data shift; Gagal membuka shift toko; Gagal membuka shift; Gagal menutup shift
- Aksi write yang tersedia: POST /store-shift/open; POST /cash-shift/open; POST /cash-shift/close

### /pos
- View: `client/src/views/pos/POS.vue`
- Route name: `pos-fullscreen`
- Layout: Fullscreen
- Roles: CASHIER, SUPERVISOR, ADMIN_TENANT
- Gate tambahan: -
- Tujuan halaman: Pusat transaksi POS: pilih item, checkout, payment, dan sinkronisasi order.
- API utama: GET /tenant/profile; GET /members; GET /discounts; POST /orders; POST /transactions
- Dependensi tenant/store: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [CASHIER, SUPERVISOR, ADMIN_TENANT] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: body, /app/dashboard, /pos, /app/orders, /app/products, /app/customers, /app/reports, /app/cashier/cash-shift
- Filter/export/CRUD yang terdeteksi: search/kata kunci, selector tenant, selector store, navigasi tab/section, modal aksi/konfirmasi, aksi create
- Empty/error state yang perlu dicek: Keranjang kosong; Kosongkan keranjang?; Error loading members:; Error loading discounts:
- Aksi write yang tersedia: POST /orders; POST /transactions

## Catalog / CRM / Inventory

### /app/customers
- View: `client/src/views/customers/Customers.vue`
- Route name: `customers`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN
- Gate tambahan: requiresPermission CASHIER:canManageCustomers
- Tujuan halaman: Kelola data pelanggan dan relasi CRM dasar.
- API utama: GET /customers; PUT /customers/${editingCustomer.value.id}; POST /customers; DELETE /customers/${id}; PUT /customers/${pointsCustomer.value.id}; GET /addons; POST /marketing/campaigns/send-sms; POST /marketing/campaigns/send-email
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Untuk role CASHIER, permission `canManageCustomers` dicek di frontend; jika gagal, user dialihkan ke dashboard role. Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, ekspor data, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Error loading customers:; Error saving customer:; Gagal menambahkan poin; Bulk delete error:
- Aksi write yang tersedia: PUT /customers/${editingCustomer.value.id}; POST /customers; DELETE /customers/${id}; PUT /customers/${pointsCustomer.value.id}; POST /marketing/campaigns/send-sms; POST /marketing/campaigns/send-email

### /app/discounts
- View: `client/src/views/discounts/Discounts.vue`
- Route name: `discounts`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Kelola diskon tenant.
- API utama: GET /products; GET /discounts; PUT /discounts/${editingDiscount.value.id}; POST /discounts; DELETE /discounts/${id}
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Error loading categories:; Error loading discounts:; Gagal memuat diskon; Error loading selected products:
- Aksi write yang tersedia: PUT /discounts/${editingDiscount.value.id}; POST /discounts; DELETE /discounts/${id}

### /app/inventory/purchase-orders
- View: `client/src/views/inventory/PurchaseOrders.vue`
- Route name: `purchase-orders`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Purchase Orders untuk domain catalog / crm / inventory.
- API utama: GET /purchase-orders; GET /suppliers; GET /products; POST /purchase-orders; PUT /purchase-orders/${po.id}; POST /purchase-orders/${po.id}/receive; POST /purchase-orders/${po.id}/cancel
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: filter status, navigasi tab/section, modal aksi/konfirmasi, aksi create, aksi update
- Empty/error state yang perlu dicek: Error loading purchase orders:; Error loading suppliers:; Error loading products:; Error saving purchase order:
- Aksi write yang tersedia: POST /purchase-orders; PUT /purchase-orders/${po.id}; POST /purchase-orders/${po.id}/receive; POST /purchase-orders/${po.id}/cancel

### /app/inventory/restock-suggestions
- View: `client/src/views/inventory/RestockSuggestions.vue`
- Route name: `restock-suggestions`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Restock Suggestions untuk domain catalog / crm / inventory.
- API utama: GET /inventory/restock-suggestions
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: /app/products?highlight=${productId}
- Filter/export/CRUD yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman.
- Empty/error state yang perlu dicek: Error loading restock suggestions:
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/inventory/stock-alerts
- View: `client/src/views/inventory/StockAlerts.vue`
- Route name: `stock-alerts`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Stock Alerts untuk domain catalog / crm / inventory.
- API utama: GET /stock-alerts/low-stock; GET /stock-alerts/stats; POST /stock-alerts/send
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: `/app/inventory/purchase-orders`
- Filter/export/CRUD yang terdeteksi: navigasi tab/section, aksi create
- Empty/error state yang perlu dicek: Error loading low stock products:; Error sending alerts:
- Aksi write yang tersedia: POST /stock-alerts/send

### /app/inventory/stock-transfers
- View: `client/src/views/inventory/StockTransfers.vue`
- Route name: `stock-transfers`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Stock Transfers untuk domain catalog / crm / inventory.
- API utama: GET /outlets; GET /products?limit=1000; GET /stock-transfers; POST /stock-transfers; PUT /stock-transfers/${id}/cancel
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: selector store, navigasi tab/section, modal aksi/konfirmasi, pagination, aksi create, aksi update
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: POST /stock-transfers; PUT /stock-transfers/${id}/cancel

### /app/inventory/suppliers
- View: `client/src/views/inventory/Suppliers.vue`
- Route name: `suppliers`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Suppliers untuk domain catalog / crm / inventory.
- API utama: GET /suppliers; PUT /suppliers/${editingSupplier.value.id}; POST /suppliers; DELETE /suppliers/${supplier.id}
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: search/kata kunci, navigasi tab/section, modal aksi/konfirmasi, pagination, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Error loading suppliers:; Error saving supplier:; Error deleting supplier:
- Aksi write yang tersedia: PUT /suppliers/${editingSupplier.value.id}; POST /suppliers; DELETE /suppliers/${supplier.id}

### /app/marketing
- View: `client/src/views/marketing/MarketingCampaigns.vue`
- Route name: `marketing`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: requiresAddon DELIVERY_MARKETING
- Tujuan halaman: Operasional campaign marketing bila addon aktif.
- API utama: GET /marketing/campaigns; POST /marketing/campaigns/${campaignId}/send; POST /marketing/campaigns
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DELIVERY_MARKETING`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: modal aksi/konfirmasi, aksi create
- Empty/error state yang perlu dicek: Error loading campaigns:; Error sending campaign:; Error saving campaign:
- Aksi write yang tersedia: POST /marketing/campaigns/${campaignId}/send; POST /marketing/campaigns

### /app/marketing/customer-engagement
- View: `client/src/views/marketing/CustomerEngagement.vue`
- Route name: `customer-engagement`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: requiresAddon DELIVERY_MARKETING
- Tujuan halaman: Halaman Customer Engagement untuk domain catalog / crm / inventory.
- API utama: GET /customer-engagement/stats/overall; GET /customer-engagement
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DELIVERY_MARKETING`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: search/kata kunci
- Empty/error state yang perlu dicek: Error loading overall stats:; Error loading customers:
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/marketing/email-analytics
- View: `client/src/views/marketing/EmailAnalytics.vue`
- Route name: `email-analytics`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: requiresAddon DELIVERY_MARKETING
- Tujuan halaman: Halaman Email Analytics untuk domain catalog / crm / inventory.
- API utama: GET /email-analytics/overall; GET /marketing/campaigns; GET /email-analytics/campaign/${selectedCampaignId.value}
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DELIVERY_MARKETING`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal
- Empty/error state yang perlu dicek: Error loading analytics:; Gagal memuat analytics; Error loading campaign analytics:; Gagal memuat campaign analytics
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/marketing/email-scheduler
- View: `client/src/views/marketing/EmailScheduler.vue`
- Route name: `email-scheduler`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: requiresAddon DELIVERY_MARKETING
- Tujuan halaman: Halaman Email Scheduler untuk domain catalog / crm / inventory.
- API utama: GET /email-scheduler; PUT /email-scheduler/${editingSchedule.value.id}; POST /email-scheduler; POST /email-scheduler/${schedule.id}/cancel
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DELIVERY_MARKETING`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: filter status, modal aksi/konfirmasi, aksi create, aksi update
- Empty/error state yang perlu dicek: Error loading schedules:; Gagal memuat schedules; Error saving schedule:; Gagal menyimpan schedule
- Aksi write yang tersedia: PUT /email-scheduler/${editingSchedule.value.id}; POST /email-scheduler; POST /email-scheduler/${schedule.id}/cancel

### /app/marketing/email-templates
- View: `client/src/views/marketing/EmailTemplates.vue`
- Route name: `email-templates`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: requiresAddon DELIVERY_MARKETING
- Tujuan halaman: Halaman Email Templates untuk domain catalog / crm / inventory.
- API utama: GET /email-templates; PUT /email-templates/${editingTemplate.value.id}; POST /email-templates; DELETE /email-templates/${template.id}
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DELIVERY_MARKETING`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: modal aksi/konfirmasi, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Error loading templates:; Gagal memuat templates; Error saving template:; Gagal menyimpan template
- Aksi write yang tersedia: PUT /email-templates/${editingTemplate.value.id}; POST /email-templates; DELETE /email-templates/${template.id}

### /app/products
- View: `client/src/views/products/Products.vue`
- Route name: `products`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN
- Gate tambahan: requiresPermission CASHIER:canManageProducts
- Tujuan halaman: Kelola katalog produk tenant/store.
- API utama: PUT /products/${product.id}; DELETE /products/${id}; GET /products; GET /addons/check-limit/ADD_PRODUCTS; PUT /products/${editingProduct.value.id}; POST /products
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Untuk role CASHIER, permission `canManageProducts` dicek di frontend; jika gagal, user dialihkan ke dashboard role. Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: /login, /app/pos
- Filter/export/CRUD yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, ekspor data, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Gagal memuat halaman. Silakan coba lagi.; Belum ada data produk yang tersedia. Mulai dengan menambahkan produk pertama Anda.; Tidak ada produk yang cocok dengan pencarian atau filter Anda.; Error in bulk edit:
- Aksi write yang tersedia: PUT /products/${product.id}; DELETE /products/${id}; PUT /products/${editingProduct.value.id}; POST /products

### /app/products/adjustments
- View: `client/src/views/products/ProductAdjustments.vue`
- Route name: `product-adjustments`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Product Adjustments untuk domain catalog / crm / inventory.
- API utama: GET /products/${productId}; GET /products/adjustments; GET /products; GET /outlets; GET /suppliers; POST /products/adjustments
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: search/kata kunci, selector tenant, selector store, navigasi tab/section, modal aksi/konfirmasi, pagination, aksi create
- Empty/error state yang perlu dicek: Error fetching selected product:; Error loading adjustments:; Product not found error, showing empty list; Error loading products:
- Aksi write yang tersedia: POST /products/adjustments

### /app/reward-view
- View: `client/src/views/rewards/RewardView.vue`
- Route name: `reward-view`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Preview atau tampilan reward tertentu.
- API utama: POST /rewards/watch-ad
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: /app/rewards
- Filter/export/CRUD yang terdeteksi: aksi create
- Empty/error state yang perlu dicek: Error checking ad availability:; Error showing ad:; Error awarding points:; Error processing points
- Aksi write yang tersedia: POST /rewards/watch-ad

### /app/rewards
- View: `client/src/views/rewards/Rewards.vue`
- Route name: `rewards`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Kelola reward program tenant.
- API utama: GET /rewards/balance; GET /rewards/daily-limit; GET /rewards/transactions; GET /rewards/config; POST /rewards/redeem/subscription; POST /rewards/redeem/addon
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: reward-view
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, search/kata kunci, navigasi tab/section, aksi create
- Empty/error state yang perlu dicek: Error loading balance:; Error loading daily limit:; Error loading transactions:; Error loading config:
- Aksi write yang tersedia: POST /rewards/redeem/subscription; POST /rewards/redeem/addon

## Store Operations

### /app/dashboard
- View: `client/src/views/dashboard/Dashboard.vue`
- Route name: `dashboard`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN
- Gate tambahan: -
- Tujuan halaman: Dashboard operasional tenant/store setelah login.
- API utama: GET /dashboard/stats; GET /subscriptions/current; GET /orders
- Dependensi tenant/store: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). SUPER_ADMIN tidak boleh memakai dashboard tenant biasa; router memindahkan ke `/app/super-dashboard`. Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: /app/products, /app/subscription, /app/products?filter=low_stock, /app/settings/preferences, /app/orders, /app/finance/transactions
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, navigasi tab/section, ekspor data
- Empty/error state yang perlu dicek: Error loading stats:; Error loading subscription:; Error loading orders:
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/delivery
- View: `client/src/views/delivery/DeliveryOrders.vue`
- Route name: `delivery`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: requiresAddon DELIVERY_MARKETING
- Tujuan halaman: Operasional order delivery bila addon aktif.
- API utama: GET /delivery/orders; POST /delivery/orders/${orderId}/process; POST /delivery/couriers; POST /marketing/promos
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Akses juga butuh addon `DELIVERY_MARKETING`; bila addon tidak aktif, router mengarah ke `/unauthorized?reason=addon`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: search/kata kunci, navigasi tab/section, modal aksi/konfirmasi, aksi create
- Empty/error state yang perlu dicek: Error loading delivery orders:; Error processing delivery:; Error saving courier:; Error saving promo:
- Aksi write yang tersedia: POST /delivery/orders/${orderId}/process; POST /delivery/couriers; POST /marketing/promos

### /app/orders
- View: `client/src/views/orders/Orders.vue`
- Route name: `orders`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Daftar order operasional untuk monitoring, filtering, dan aksi sesuai role.
- API utama: GET /orders; GET /orders/${order.id}; PUT /orders/${id}/status; DELETE /orders/${id}; POST /orders/bulk-delete; POST /orders/bulk-refund
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: /pos
- Filter/export/CRUD yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, ekspor data, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Tenant ID tidak tersedia. Silakan login ulang.; Error loading orders:; Gagal memuat pesanan; Error loading order details:
- Aksi write yang tersedia: PUT /orders/${id}/status; DELETE /orders/${id}; POST /orders/bulk-delete; POST /orders/bulk-refund

### /app/support
- View: `client/src/views/support/ClientSupport.vue`
- Route name: `client-support`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPERVISOR, CASHIER
- Gate tambahan: -
- Tujuan halaman: Inbox support/client support untuk tenant.
- API utama: GET /support/tickets; POST /support/tickets; POST /support/tickets/${selectedTicket.value.id}/reply
- Dependensi tenant/store: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPERVISOR, CASHIER] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Cashier mengikuti guard shift: tanpa shift sehat akan diarahkan ke `/open-shift` atau recovery di `/app/cashier/cash-shift`. Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: `/help/${article.slug}`, /help, /help/cara-setup-awal, /help/konfigurasi-printer, /help/download-laporan, body
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, search/kata kunci, modal aksi/konfirmasi, ekspor data, aksi create
- Empty/error state yang perlu dicek: Error loading tickets:; Error creating ticket:
- Aksi write yang tersedia: POST /support/tickets; POST /support/tickets/${selectedTicket.value.id}/reply

## Kitchen

### /app/orders/kitchen
- View: `client/src/views/kitchen/KitchenOrders.vue`
- Route name: `kitchen-orders`
- Layout: DynamicLayout
- Roles: KITCHEN, SUPERVISOR
- Gate tambahan: -
- Tujuan halaman: Antrian order kitchen di dalam layout aplikasi.
- API utama: GET /orders; PUT /orders/${order.id}/kitchen-status
- Dependensi tenant/store: Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [KITCHEN, SUPERVISOR] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: selector tenant, navigasi tab/section, modal aksi/konfirmasi, aksi update
- Empty/error state yang perlu dicek: Gagal update status
- Aksi write yang tersedia: PUT /orders/${order.id}/kitchen-status

### /kitchen
- View: `client/src/views/kitchen/KitchenOrders.vue`
- Route name: `kitchen-display`
- Layout: Fullscreen
- Roles: KITCHEN, SUPERVISOR, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Kitchen display fullscreen untuk antrean order store yang ditugaskan.
- API utama: GET /orders; PUT /orders/${order.id}/kitchen-status
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`. Store diambil dari `permissions.assignedStoreId`. SUPERVISOR memakai `permissions.allowedStoreIds` dan `selectedStoreId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [KITCHEN, SUPERVISOR, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Tanpa assignment store yang valid, guard store mengarahkan user ke `/unauthorized` dengan pesan store belum aktif.
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: selector tenant, navigasi tab/section, modal aksi/konfirmasi, aksi update
- Empty/error state yang perlu dicek: Gagal update status
- Aksi write yang tersedia: PUT /orders/${order.id}/kitchen-status

## System / Utility

### /app/receipts/templates
- View: `client/src/views/receipts/ReceiptTemplates.vue`
- Route name: `receipt-templates`
- Layout: DynamicLayout
- Roles: ADMIN_TENANT, SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Receipt Templates untuk domain system / utility.
- API utama: GET /receipts/templates; PUT /receipts/templates/${editingTemplate.value.id}; POST /receipts/templates; POST /receipts/templates/${id}/set-default; DELETE /receipts/templates/${id}
- Dependensi tenant/store: SUPER_ADMIN bisa override tenant context via `selectedTenantId`. Role non-superadmin tetap scoped ke `user.tenantId`.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [ADMIN_TENANT, SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: modal aksi/konfirmasi, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Error loading templates:; Error saving template:; Error setting default:; Error deleting template:
- Aksi write yang tersedia: PUT /receipts/templates/${editingTemplate.value.id}; POST /receipts/templates; POST /receipts/templates/${id}/set-default; DELETE /receipts/templates/${id}

## Super Admin / Platform

### /app/reports/global
- View: `client/src/views/reports/GlobalReports.vue`
- Route name: `global-reports`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Global Reports untuk domain super admin / platform.
- API utama: GET /reports/global; PUT /admin/subscriptions/${editingSubscription.value.id}; DELETE /admin/subscriptions/${id}; PUT /admin/addons-purchase/${editingAddon.value.id}; DELETE /admin/addons-purchase/${id}
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: `/app/tenants/${sub.tenantId}`, `/app/tenants/${addon.tenantId}`
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, ekspor data, aksi update, aksi delete
- Empty/error state yang perlu dicek: Error loading global report:; Gagal memuat laporan global; Error updating subscription:; Gagal memperbarui subscription
- Aksi write yang tersedia: PUT /admin/subscriptions/${editingSubscription.value.id}; DELETE /admin/subscriptions/${id}; PUT /admin/addons-purchase/${editingAddon.value.id}; DELETE /admin/addons-purchase/${id}

### /app/settings/additional-components-guide
- View: `client/src/views/settings/AdditionalComponentsGuide.vue`
- Route name: `additional-components-guide`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Additional Components Guide untuk domain super admin / platform.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, navigasi tab/section
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/settings/advanced-components-guide
- View: `client/src/views/settings/AdvancedComponentsGuide.vue`
- Route name: `advanced-components-guide`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Advanced Components Guide untuk domain super admin / platform.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: modal aksi/konfirmasi, ekspor data
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/settings/archive
- View: `client/src/views/settings/ArchiveManagement.vue`
- Route name: `archive-management`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Pengelolaan arsip sistem untuk SUPER_ADMIN.
- API utama: GET /archives/stats; GET /archives/files; POST /archives/orders; POST /archives/transactions; POST /archives/reports; POST /archives/all; POST /archives/restore
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, navigasi tab/section, modal aksi/konfirmasi, aksi create
- Empty/error state yang perlu dicek: Error loading archive stats:; Gagal memuat statistik archive; Error loading archive files:; Gagal memuat daftar file archive
- Aksi write yang tersedia: POST /archives/orders; POST /archives/transactions; POST /archives/reports; POST /archives/all; POST /archives/restore

### /app/settings/retention
- View: `client/src/views/settings/RetentionManagement.vue`
- Route name: `retention-management`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Pengaturan retensi data platform.
- API utama: GET /retention/stats; POST /retention/orders; POST /retention/transactions; POST /retention/reports; POST /retention/audit-logs; POST /retention/contact-submissions; POST /retention/demo-requests; POST /retention/apply-all
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: modal aksi/konfirmasi, aksi create
- Empty/error state yang perlu dicek: Error loading retention stats:; Gagal memuat statistik retensi; Gagal menghapus pesanan; Gagal menghapus transaksi
- Aksi write yang tersedia: POST /retention/orders; POST /retention/transactions; POST /retention/reports; POST /retention/audit-logs; POST /retention/contact-submissions; POST /retention/demo-requests; POST /retention/apply-all

### /app/settings/style-guide
- View: `client/src/views/settings/FormStyleGuide.vue`
- Route name: `style-guide`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Form Style Guide untuk domain super admin / platform.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman.
- Empty/error state yang perlu dicek: Error State; Error state...
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/settings/system
- View: `client/src/views/settings/SystemSettings.vue`
- Route name: `system-settings`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Pengaturan sistem platform untuk SUPER_ADMIN.
- API utama: GET /settings/system; PUT /settings/system
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: /app/settings/2fa, /app/settings/webhooks, /app/settings/sessions, /app/settings/password, /app/settings/gdpr
- Filter/export/CRUD yang terdeteksi: aksi update
- Empty/error state yang perlu dicek: Error loading settings:; Gagal menyimpan pengaturan
- Aksi write yang tersedia: PUT /settings/system

### /app/settings/table-style-guide
- View: `client/src/views/settings/TableStyleGuide.vue`
- Route name: `table-style-guide`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Halaman Table Style Guide untuk domain super admin / platform.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: search/kata kunci, navigasi tab/section, pagination
- Empty/error state yang perlu dicek: Empty State
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/super-dashboard
- View: `client/src/views/superadmin/SuperDashboard.vue`
- Route name: `super-dashboard`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Dashboard platform untuk SUPER_ADMIN lintas tenant.
- API utama: GET /dashboard/stats
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`). Role non-superadmin dipindah kembali ke `/app/dashboard`.
- Navigasi keluar yang terdeteksi: /app/reports/global, /app/tenants, /app/superadmin/contact-messages, /app/users, /app/addons
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, navigasi tab/section, ekspor data
- Empty/error state yang perlu dicek: Database connection error:; Error loading super admin stats:; Gagal memuat statistik super admin
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/superadmin/backups
- View: `client/src/views/superadmin/BackupManagement.vue`
- Route name: `superadmin-backups`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Kelola backup platform.
- API utama: GET /tenants; GET /superadmin/backups/critical; GET /superadmin/backups; GET /superadmin/backups/${backupId}/view; GET /superadmin/backups/${backupId}/download; POST /superadmin/backups/${backupId}/resend-email; POST /superadmin/backups/${tenantId}/regenerate
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, pagination, ekspor data, aksi create
- Empty/error state yang perlu dicek: Backup gagal 3+ hari berturut-turut; Gagal Email; Error loading tenants:; Error loading critical tenants:
- Aksi write yang tersedia: POST /superadmin/backups/${backupId}/resend-email; POST /superadmin/backups/${tenantId}/regenerate

### /app/superadmin/contact-messages
- View: `client/src/views/superadmin/ContactMessages.vue`
- Route name: `contact-messages`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Inbox pesan kontak masuk ke platform.
- API utama: GET /contact; PUT /contact/${message.id}/read; DELETE /contact/${message.id}; POST /contact/bulk; GET /support/tickets; GET /users; POST /support/tickets; PUT /support/tickets/${selectedTicket.value.id}/assign
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: search/kata kunci, filter status, navigasi tab/section, modal aksi/konfirmasi, bulk action, pagination, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Error loading messages:; Gagal memuat pesan kontak; Error updating read status:; Gagal memperbarui status pesan
- Aksi write yang tersedia: PUT /contact/${message.id}/read; DELETE /contact/${message.id}; POST /contact/bulk; POST /support/tickets; PUT /support/tickets/${selectedTicket.value.id}/assign; POST /support/tickets/${selectedTicket.value.id}/notes

### /app/superadmin/server-monitor
- View: `client/src/views/superadmin/ServerMonitor.vue`
- Route name: `server-monitor`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Monitoring kesehatan server/platform.
- API utama: GET /admin/docker/containers; GET /admin/server/resources; GET /admin/health; GET /admin/logs/${selectedLogType.value}?tail=200; GET /admin/docker/logs/${containerName}?tail=500; POST /admin/docker/restart/${containerName}; POST /admin/docker/stop/${containerName}
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: body
- Filter/export/CRUD yang terdeteksi: search/kata kunci, navigasi tab/section, modal aksi/konfirmasi, aksi create
- Empty/error state yang perlu dicek: Cari log atau error...; Error loading containers:; Error loading resources; Error loading health
- Aksi write yang tersedia: POST /admin/docker/restart/${containerName}; POST /admin/docker/stop/${containerName}

### /app/superadmin/system-info
- View: `client/src/views/superadmin/SystemInfo.vue`
- Route name: `system-info`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Informasi environment dan sistem platform.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: /pricing?plan=${plan.id}, /app/addons?add=${addon.name}
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, navigasi tab/section
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /app/tenants
- View: `client/src/views/tenants/Tenants.vue`
- Route name: `tenants`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Daftar tenant dan akses ke detail tenant bagi SUPER_ADMIN.
- API utama: GET /tenants; DELETE /tenants/${id}; PUT /tenants/${editingTenant.value.id}; POST /tenants
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: /app/tenants/${tenantId}
- Filter/export/CRUD yang terdeteksi: search/kata kunci, selector tenant, navigasi tab/section, modal aksi/konfirmasi, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Alamat tidak tersedia; Error loading tenants:; Gagal memuat tenant; Gagal menghapus tenant
- Aksi write yang tersedia: DELETE /tenants/${id}; PUT /tenants/${editingTenant.value.id}; POST /tenants

### /app/tenants/:id
- View: `client/src/views/tenants/TenantDetail.vue`
- Route name: `tenant-detail`
- Layout: DynamicLayout
- Roles: SUPER_ADMIN
- Gate tambahan: -
- Tujuan halaman: Detail tenant: profil, subscription, addon, user, dan store tenant.
- API utama: PUT /tenants/${tenantId}/upgrade-plan; GET /addons/available; POST /addons/subscribe; PUT /addons/${editAddonForm.value.id}; POST /addons/${editAddonForm.value.id}/extend; PUT /users/${user.id}; DELETE /users/${user.id}; PUT /outlets/${store.id}
- Dependensi tenant/store: SUPER_ADMIN dapat lintas tenant via `selectedTenantId`; store mengikuti halaman yang dibuka.
- Guard/redirect: Guest diarahkan ke `/login`. Role di luar [SUPER_ADMIN] tidak masuk ke halaman ini; router mengalihkan ke dashboard role (`/app/dashboard` atau `/app/super-dashboard`).
- Navigasi keluar yang terdeteksi: body, /app/tenants
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, selector tenant, navigasi tab/section, modal aksi/konfirmasi, bulk action, ekspor data, aksi create, aksi update, aksi delete
- Empty/error state yang perlu dicek: Alamat tidak tersedia; Tidak ada paket; Gagal memperbarui langganan.; Gagal menambahkan addon.
- Aksi write yang tersedia: PUT /tenants/${tenantId}/upgrade-plan; POST /addons/subscribe; PUT /addons/${editAddonForm.value.id}; POST /addons/${editAddonForm.value.id}/extend; PUT /users/${user.id}; DELETE /users/${user.id}; PUT /outlets/${store.id}; PUT /tenants/${tenantId}

## Public / Marketing

### /contact
- View: `client/src/views/marketing/Contact.vue`
- Route name: `contact`
- Layout: MarketingLayout
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Form kontak prospek/support awal sebelum menjadi tenant.
- API utama: POST /contact
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: contact-success
- Filter/export/CRUD yang terdeteksi: search/kata kunci, selector store, aksi create
- Empty/error state yang perlu dicek: Error submitting contact form:; Gagal mengirim pesan. Silakan coba lagi.
- Aksi write yang tersedia: POST /contact

### /contact/success
- View: `client/src/views/marketing/ContactSuccess.vue`
- Route name: `contact-success`
- Layout: Standalone
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Konfirmasi sukses setelah prospek mengirim form kontak.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: /login, /contact
- Filter/export/CRUD yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman.
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /demo
- View: `client/src/views/marketing/Demo.vue`
- Route name: `demo`
- Layout: MarketingLayout
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Demo produk untuk menjelaskan alur SaaS POS ke calon tenant.
- API utama: POST /contact/demo
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: -
- Filter/export/CRUD yang terdeteksi: aksi create
- Empty/error state yang perlu dicek: Error submitting demo request:; Gagal mengirim permintaan demo.
- Aksi write yang tersedia: POST /contact/demo

### /help
- View: `client/src/views/marketing/Help.vue`
- Route name: `help`
- Layout: MarketingLayout
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Pusat bantuan publik.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: `/help/${result.slug}`, `/help/category/${category.id}`, `/help/${article.slug}`, /contact, /help/${searchResults.value[0].slug}
- Filter/export/CRUD yang terdeteksi: search/kata kunci
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /help/:slug
- View: `client/src/views/marketing/HelpArticle.vue`
- Route name: `help-article`
- Layout: MarketingLayout
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Artikel bantuan publik.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: /help, `/help/${related.slug}`, /contact
- Filter/export/CRUD yang terdeteksi: navigasi tab/section
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /help/category/:categoryId
- View: `client/src/views/marketing/HelpCategory.vue`
- Route name: `help-category`
- Layout: MarketingLayout
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Kategori artikel bantuan publik.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: /help, `/help/${article.slug}`, /contact
- Filter/export/CRUD yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman.
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /pricing
- View: `client/src/views/marketing/Pricing.vue`
- Route name: `pricing`
- Layout: MarketingLayout
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Halaman paket harga/langganan.
- API utama: GET /addons/available
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: /contact
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, search/kata kunci, bulk action, ekspor data
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /terms
- View: `client/src/views/marketing/Terms.vue`
- Route name: `terms`
- Layout: MarketingLayout
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Halaman syarat dan ketentuan layanan.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: /
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### home
- View: `client/src/views/marketing/Home.vue`
- Route name: `home`
- Layout: MarketingLayout
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Halaman Home untuk domain public / marketing.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: /pricing, /demo, /help, `/help/${article.slug}`, /contact
- Filter/export/CRUD yang terdeteksi: filter periode/tanggal, search/kata kunci, ekspor data
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

## Auth / Callback

### /forgot-password
- View: `client/src/views/auth/ForgotPassword.vue`
- Route name: `forgot-password`
- Layout: Standalone
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Flow pemulihan password untuk user yang belum login.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: User yang sudah login diarahkan ke dashboard sesuai role.
- Navigasi keluar yang terdeteksi: /, /login, /contact
- Filter/export/CRUD yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman.
- Empty/error state yang perlu dicek: Perhatikan copy `gagal memuat ...`, empty state yang salah, atau fallback ke unauthorized/login.
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /login
- View: `client/src/views/auth/Login.vue`
- Route name: `login`
- Layout: Standalone
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Pintu masuk autentikasi semua role.
- API utama: Tidak ada `api.*` langsung di file halaman; data kemungkinan datang dari child component, composable, atau store.
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: User yang sudah login diarahkan ke dashboard sesuai role.
- Navigasi keluar yang terdeteksi: /, /forgot-password, /app, /app/cashier/cash-shift, /pos, /open-shift, /kitchen, super-dashboard
- Filter/export/CRUD yang terdeteksi: selector store, modal aksi/konfirmasi
- Empty/error state yang perlu dicek: Login error:
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /payment/error
- View: `client/src/views/payment/PaymentCallback.vue`
- Route name: `payment-error`
- Layout: Standalone
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Menampilkan hasil callback pembayaran gagal.
- API utama: GET /payment/status/${orderId.value}
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: /app/subscription, /app/addons, /login, /app
- Filter/export/CRUD yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman.
- Empty/error state yang perlu dicek: Error checking payment status:
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /payment/pending
- View: `client/src/views/payment/PaymentCallback.vue`
- Route name: `payment-pending`
- Layout: Standalone
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Menampilkan status pembayaran pending.
- API utama: GET /payment/status/${orderId.value}
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: /app/subscription, /app/addons, /login, /app
- Filter/export/CRUD yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman.
- Empty/error state yang perlu dicek: Error checking payment status:
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

### /payment/success
- View: `client/src/views/payment/PaymentCallback.vue`
- Route name: `payment-success`
- Layout: Standalone
- Roles: Public
- Gate tambahan: -
- Tujuan halaman: Menampilkan hasil callback pembayaran sukses ke tenant.
- API utama: GET /payment/status/${orderId.value}
- Dependensi tenant/store: Tidak membutuhkan context tenant/store.
- Guard/redirect: -
- Navigasi keluar yang terdeteksi: /app/subscription, /app/addons, /login, /app
- Filter/export/CRUD yang terdeteksi: Tidak ada indikator filter/export/CRUD yang menonjol dari static scan halaman.
- Empty/error state yang perlu dicek: Error checking payment status:
- Aksi write yang tersedia: Tidak ada write API langsung di file halaman.

