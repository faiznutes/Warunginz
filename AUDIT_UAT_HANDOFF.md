# AUDIT UAT HANDOFF

Generated: 2026-03-09T22:09:40.978Z

## Baseline Gate

- Audit health: GO
- Release readiness: READY
- Runtime critical endpoint audit: PASS (234/234)
- Runtime route checklist: PASS (passed=17, failed=0)
- Expected-deny critical verification: PASS (unverified_critical=0)
- Playwright critical multi-role: PASS (9/9)
- Playwright domain walkthrough: PASS (5/5)
- Business rules audit: PASS (20/20)
- Page logic map routed coverage: 82
- Page business flow routed coverage: 82

## Seeded UAT Accounts

| Role | Email | Password | Tenant | Store Scope |
|---|---|---|---|---|
| SUPER_ADMIN | `superadmin.audit@example.com` | `Password123!` | Audit Tenant (selected tenant switchable) | All stores in selected tenant |
| ADMIN_TENANT | `admin.audit@example.com` | `Password123!` | Audit Tenant | Tenant-wide, multi-store operational access |
| SUPERVISOR | `supervisor.audit@example.com` | `Password123!` | Audit Tenant | Audit Store Primary only |
| CASHIER | `cashier.audit@example.com` | `Password123!` | Audit Tenant | Audit Store Primary only |
| KITCHEN | `kitchen.audit@example.com` | `Password123!` | Audit Tenant | Audit Store Primary only |

## Actor-Flow Matrix

| Role | Tenant Scope | Store Scope | Primary Routes | Core Jobs | Must Deny | Evidence Focus |
|---|---|---|---|---|---|---|
| SUPER_ADMIN | Semua tenant via tenant switch terpilih | Semua store pada tenant yang sedang dipilih | /app/super-dashboard, /app/tenants, /kitchen | monitoring platform, tenant management, cross-tenant oversight | Tidak boleh fallback ke tenant salah; tidak boleh bocor data tenant lain tanpa context switch | tenant switch mengubah dashboard/data tenant secara konsisten |
| ADMIN_TENANT | Tenant sendiri saja | Semua store dalam tenant sendiri | /app/dashboard, /app/products, /app/orders, /app/settings/store, /app/subscription | operasional tenant, users/stores/products/orders/reports, subscription dan addon | Tidak boleh akses tenant lain atau fitur superadmin | subscription/addon hanya memengaruhi tenant sendiri |
| SUPERVISOR | Tenant sendiri saja | Store yang diizinkan di permissions | /app/dashboard, /app/orders, /app/products, /open-shift, /kitchen | operasional store, monitoring order, laporan operasional terbatas | Tidak boleh CRUD admin-level untuk users/stores/subscription | write action admin-level hilang di UI dan 403 saat dipaksa |
| CASHIER | Tenant sendiri saja | assignedStoreId | /open-shift, /pos, /app/orders, /app/reports | open shift, transaksi POS, pembayaran, cetak struk, close shift, lihat laporan penjualan store | Tanpa shift aktif harus redirect ke /open-shift; tidak boleh aksi admin-level | flow shift harian deterministik, receipt tidak memanggil template admin, dan laporan sales tetap store-scoped |
| KITCHEN | Tenant sendiri saja | assignedStoreId | /kitchen, /app/orders | menerima order dari kasir dan update status dapur | Tidak boleh akses POS atau CRUD admin/master data | hanya order store yang ditugaskan yang muncul dan bisa diupdate |

## Role Contract Yang Terkunci

- `SUPER_ADMIN`: wajib bisa tenant switch, melihat data tenant berubah sesuai context, dan tidak boleh fallback ke tenant salah.
- `SUPER_ADMIN`: dashboard platform harus menjadi view lintas tenant; tenant detail harus bisa mengelola profil tenant, subscription, addon, stores, dan users tenant terpilih.
- `ADMIN_TENANT`: wajib tenant-scoped, bisa mengelola store/user/product/order/report tenant sendiri, serta flow subscription/addon dan limit tenant.
- `SUPERVISOR`: wajib store-scoped, bisa operasional menengah, dan harus ditolak aman pada CRUD admin-level.
- `CASHIER`: wajib mengikuti `open shift -> POS -> close shift`; tanpa shift sehat harus terdorong ke gate shift, bisa mencetak struk tanpa akses CRUD template admin, dan hanya melihat laporan sales store-scoped.
- `KITCHEN`: wajib hanya melihat order store sendiri dan update status kitchen tanpa akses POS/admin.
- `Expired/downgrade/addon removal`: bila kontrak bisnis mengharuskan restriction fitur, semua mismatch setelah baseline ini dianggap defect implementasi dan harus dicatat eksplisit.

## Walkthrough UAT

### Auth & Session

- [ ] Login per role berhasil dan route awal sesuai role.
- [ ] Token invalid/expired berakhir di 401 atau redirect aman, tanpa 5xx.
- [ ] /api/auth/me tidak bisa diakses guest.

### Tenant Switching

- [ ] SUPER_ADMIN berpindah tenant dan seluruh data mengikuti tenant terpilih.
- [ ] ADMIN_TENANT tidak bisa mengatur tenant context ke tenant lain.
- [ ] Forged tenantId di query/header tidak membuka data tenant lain.

### Shift Lifecycle & POS

- [ ] CASHIER tanpa shift aktif dipaksa ke /open-shift.
- [ ] Open shift -> POS -> order/payment -> close shift berjalan aman.
- [ ] Cetak struk kasir berjalan tanpa `403 /receipts/templates`.
- [ ] CASHIER tidak bisa delete/refund/bulk-delete order jika role tidak mengizinkan.

### Reports & Export

- [ ] CASHIER melihat laporan sales store-scoped setelah transaksi berhasil.
- [ ] Opsi export kasir tidak crash dan hanya menampilkan mode yang didukung role.
- [ ] ADMIN_TENANT dan SUPERVISOR melihat data laporan sesuai tenant/store scope tanpa kebocoran data.

### Kitchen Operations

- [ ] KITCHEN melihat order store assignment sendiri.
- [ ] Update status kitchen berhasil pada order yang valid.
- [ ] KITCHEN tidak bisa akses /pos atau master data admin.

### Subscription & Addon

- [ ] ADMIN_TENANT dapat melihat plan/addon tenant sendiri.
- [ ] SUPER_ADMIN dapat melakukan oversight tenant/subscription lintas tenant.
- [ ] Role non-admin tidak bisa membeli addon atau memodifikasi subscription.

### Public Boundary & Callback

- [ ] Payment callback/public route tetap public, tetapi action turunan tetap role-guarded.
- [ ] Endpoint static rawan shadow tetap resolve ke handler yang benar.
- [ ] Missing store assignment gagal aman tanpa 5xx.

## Negative / Abuse Path

- [ ] Forged `tenantId` via query/header tetap ditolak atau di-scope ulang.
- [ ] Forged `outletId` untuk role store-scoped tidak membuka data store lain.
- [ ] Permission kosong/salah format gagal aman, tanpa `500`.
- [ ] Tenant inactive atau subscription expired memblokir role operasional yang relevan.
- [ ] Callback/payment/public route tetap tidak mem-bypass authz internal.

## Bukti yang Wajib Dicatat Jika Menemukan Bug

- Role, email akun, tenant, store.
- Route/halaman, endpoint API, method, payload/query/header yang dipakai.
- Expected behavior vs actual behavior.
- Response status/body, screenshot, dan langkah reproduksi singkat.
- Severity (`P0/P1/P2/P3`) dan mini risk register.

## Referensi

- `AUDIT_RUNTIME_CRITICAL_ENDPOINTS.md`
- `AUDIT_RUNTIME_ROLE_MATRIX.md`
- `AUDIT_RUNTIME_ROUTE_CHECKLIST.md`
- `AUDIT_PLAYWRIGHT_CRITICAL.md`
- `AUDIT_PLAYWRIGHT_DOMAIN.md`
- `AUDIT_PLAYWRIGHT_ROLE_WALKTHROUGH.md`
- `AUDIT_FINAL_LIVE_ACCEPTANCE.md`
- `AUDIT_BUSINESS_RULES.md`
- `PAGE_BUSINESS_FLOW_DETAIL.md`
- `PAGE_LOGIC_MAP.md`
- `AUDIT_BUG_REPORT.md`
