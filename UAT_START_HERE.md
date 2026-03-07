# MULAI UAT WARUNGIN

Generated: 2026-03-07T13:22:57.997Z

Dokumen ini untuk tester non-coding. Fokusnya hanya: login, buka halaman yang benar, cocokkan behavior, lalu catat bug bila ada.

## 1. Nyalakan environment lokal

```bash
npm run uat:start
```

Tunggu sampai environment siap, lalu buka frontend lokal:

- `http://127.0.0.1:4173`

Jika kamu sedang memakai URL tunnel/deploy, gunakan URL aktif terbaru dari output deploy. Jangan jadikan URL tunnel lama sebagai acuan tetap.

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
- `CASHIER`: login, pastikan flow `open shift -> POS -> close shift` berjalan dan halaman cash shift tidak salah state.
- `KITCHEN`: buka kitchen display dan update status order store yang ditugaskan.

## 4. Dokumen yang dipakai saat UAT

- `PAGE_BUSINESS_FLOW_DETAIL.md`: fungsi bisnis semua page, current truth, dan gap SaaS contract.
- `PAGE_LOGIC_MAP.md`: peta teknis halaman 1 per 1, route, role, API, dan guard.
- `AUDIT_UAT_HANDOFF.md`: kontrak role-flow dan checklist domain.
- `AUDIT_BUG_REPORT.md`: template bug + mini risk register.

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

## Baseline Otomatis Saat Ini

- Audit health: GO
- Release readiness: READY
- Playwright critical: PASS
- Playwright domain walkthrough: PASS
- Page logic map coverage: 82 routed pages
- Page business flow coverage: 82 routed pages

