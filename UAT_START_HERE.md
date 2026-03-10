# MULAI UAT WARUNGIN

Generated: 2026-03-09T22:09:40.978Z

Dokumen ini untuk tester non-coding. Fokusnya hanya: login, buka halaman yang benar, cocokkan behavior, lalu catat bug bila ada.

## 1. Nyalakan environment lokal

```bash
npm run uat:start
```

Tunggu sampai environment siap, lalu buka frontend lokal:

- `http://127.0.0.1:4173`

Jika kamu sedang memakai URL tunnel/deploy, gunakan URL aktif terbaru dari output deploy. Jangan jadikan URL tunnel lama sebagai acuan tetap.

Untuk verifikasi live otomatis setelah deploy, gunakan:

```bash
$env:PUBLIC_BASE_URL='https://URL-LIVE-AKTIF'
npm run audit:live:uat
```

Jika ingin tambah route sweep penuh:

```bash
$env:PUBLIC_BASE_URL='https://URL-LIVE-AKTIF'
npm run audit:live:uat -- --with-routes
```

Untuk walkthrough otomatis 5 role utama di environment aktif:

```bash
$env:PLAYWRIGHT_SKIP_WEBSERVER='1'
$env:PLAYWRIGHT_BASE_URL='https://URL-LIVE-AKTIF'
$env:PLAYWRIGHT_API_BASE_URL='https://URL-LIVE-AKTIF/api'
npm run test:playwright:roles
```

Untuk acceptance live final satu perintah:

```bash
$env:PUBLIC_BASE_URL='https://URL-LIVE-AKTIF'
npm run audit:live:final
```

Untuk sweep semua `82` route live tanpa mengulang suite billing/domain/critical, gunakan:

```bash
$env:PUBLIC_BASE_URL='https://URL-LIVE-AKTIF'
npm run audit:live:uat -- --routes-only
```

## 2. Login akun test

| Role | Email | Password |
|---|---|---|
| SUPER_ADMIN | `superadmin.audit@example.com` | `Password123!` |
| ADMIN_TENANT | `admin.audit@example.com` | `Password123!` |
| SUPERVISOR | `supervisor.audit@example.com` | `Password123!` |
| CASHIER | `cashier.audit@example.com` | `Password123!` |
| KITCHEN | `kitchen.audit@example.com` | `Password123!` |

## 3. Alur test minimum per role

- `SUPER_ADMIN`: buka dashboard platform, tenant list, tenant detail, global reports, lalu cek tenant switch.
- `ADMIN_TENANT`: buka dashboard, products, orders, users, stores, reports, subscription, addons.
- `SUPERVISOR`: buka dashboard, orders, products, customers, reports, open shift, kitchen.
- `CASHIER`: login, pastikan flow `open shift -> POS -> close shift` berjalan, cetak struk tidak 403, dan `/app/reports` menampilkan laporan sales store-scoped.
- `KITCHEN`: buka kitchen display dan update status order store yang ditugaskan.

## 4. Dokumen yang dipakai saat UAT

- `PAGE_BUSINESS_FLOW_DETAIL.md`: fungsi bisnis semua page, current truth, dan gap SaaS contract.
- `PAGE_LOGIC_MAP.md`: peta teknis halaman 1 per 1, route, role, API, dan guard.
- `AUDIT_UAT_HANDOFF.md`: kontrak role-flow dan checklist domain.
- `AUDIT_BUG_REPORT.md`: template bug + mini risk register.
- `SECURITY_ROTATION_RUNBOOK.md`: urutan rotasi secret yang aman setelah UAT.

## 5. Jika menemukan bug

Wajib catat:

- role, tenant, store
- route dan endpoint
- expected vs actual
- screenshot atau response error
- severity `P0/P1/P2/P3`

## 6. Setelah selesai

```bash
npm run uat:stop
```

## 7. Setelah UAT live selesai

- Pastikan bug baru dicatat dengan format role + tenant/store + route + endpoint + expected vs actual.
- Jalur live yang paling stabil:
  - `npm run audit:live:uat`
  - `npm run test:playwright:roles`
  - lalu `npm run audit:live:uat -- --routes-only`
  - atau langsung `npm run audit:live:final`
- Rotate semua kredensial yang pernah dibagikan di chat:
  - GitHub PAT
  - Coolify token
  - password SSH
  - secret lain yang sempat terekspos
- Jangan anggap URL `trycloudflare.com` permanen; pakai hanya untuk testing.

## Baseline Otomatis Saat Ini

- Audit health: GO
- Release readiness: READY
- Playwright critical: PASS
- Playwright domain walkthrough: PASS
- Page logic map coverage: 82 routed pages
- Page business flow coverage: 82 routed pages
