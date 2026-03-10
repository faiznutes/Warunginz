# New-Warungin

Warungin adalah **SaaS POS multi-tenant** untuk UMKM/F&B.

Kontrak produk saat ini:
- `SUPER_ADMIN`: akses lintas tenant, monitoring platform, tenant switching.
- `ADMIN_TENANT`: mengelola bisnis tenant sendiri, termasuk subscription dan addon.
- `SUPERVISOR`: operasional store-scoped.
- `CASHIER`: lifecycle `open shift -> POS -> close shift`.
- `KITCHEN`: menerima order dari kasir dan mengelola status dapur.

Stack utama:
- Backend: NestJS + Prisma (`nest/`)
- Frontend: Vue 3 + Pinia + Vue Router (`client/`)
- Database: PostgreSQL via Prisma

## Quick Start

### Install

```bash
npm install
cd client && npm install
cd ..
```

### Environment

- Copy `.env.example` menjadi `.env.local` atau `.env`
- Isi minimal `DATABASE_URL`, `JWT_SECRET`, dan variabel pembayaran/auth yang diperlukan

### Jalankan aplikasi

Backend dev:

```bash
npm run dev
```

Frontend dev terpisah:

```bash
cd client
npm run dev
```

## Perintah Utama

### Development

- `npm run dev` - jalankan backend NestJS mode development
- `npm run build` - build frontend + backend
- `npm run type-check` - type-check backend + frontend
- `npm run lint` - lint backend
- `cd client && npm run lint` - lint frontend

### Audit dan UAT

- `npm run audit:strict` - full deterministic local audit: lint, type-check, build, logic check, local DB seed, runtime critical, runtime routes, phase23, Playwright critical, dan packaging UAT
- `npm run audit:status` - refresh `AUDIT_HEALTH_STATUS.md`
- `npm run audit:gate` - enforce GO/NO-GO dari artefak audit
- `npm run audit:release` - generate `RELEASE_READINESS.md`
- `npm run audit:uat:ready` - jalur tercepat untuk siap manual bug hunting/UAT
- `npm run uat:start` - verifikasi akhir lalu nyalakan frontend + backend UAT di background
- `npm run uat:stop` - matikan environment UAT
- `npm run audit:runtime:critical` - runtime auth/authz endpoint audit
- `npm run audit:runtime:routes` - runtime critical route checklist
- `npm run test:playwright:critical` - Playwright critical multi-role

### Local seeded environment

- `npm run localdb:start` - bootstrap PostgreSQL lokal untuk audit
- `npm run seed:roles` - seed akun audit semua role
- `npm run teardown:roles` - bersihkan seed audit
- `npm run localdb:stop` - stop PostgreSQL lokal

## Artefak Final UAT

Setelah `npm run audit:uat:ready`, pakai file berikut:
- `AUDIT_UAT_HANDOFF.md` - actor-flow matrix, akun seed, checklist UAT
- `AUDIT_BUG_REPORT.md` - template intake bug + mini risk register
- `AUDIT_PLAYWRIGHT_CRITICAL.md` - hasil Playwright multi-role
- `AUDIT_HEALTH_STATUS.md` - snapshot gate akhir
- `RELEASE_READINESS.md` - verdict readiness akhir
- `UAT_START_HERE.md` - panduan singkat non-teknis untuk mulai test

## Struktur Folder

- `nest/` - backend API dan auth/authz
- `client/` - frontend router, pages, stores
- `prisma/` - schema dan migrasi
- `scripts/` - automation audit, seed, readiness
- `monitoring/`, `observability/` - komponen observability

## Catatan Operasional

- Tenant isolation adalah boundary inti; semua verifikasi role/store harus mempertahankan `tenantId` dan `outletId` scope.
- Baseline seeded audit account ada di `AUDIT_UAT_HANDOFF.md`.
- Jika gate strict tidak dijalankan sebelum merge/UAT, residual risk utama adalah regression operasional.
