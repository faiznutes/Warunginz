# AUDIT BUG REPORT

Generated: 2026-03-09T22:09:40.978Z

## Baseline Saat Ini

- Open P0: 0
- Open P1: 0
- Runtime critical mismatch: 0
- Expected-deny critical unverified: 0

## Aturan Severity

- `P0`: broken auth/authz, tenant data leak, privilege escalation, 5xx pada flow kritikal.
- `P1`: flow bisnis utama rusak, deny/allow salah pada role/store/tenant boundary.
- `P2`: bug fungsional non-blocker, validasi/UI state salah, tapi ada workaround.
- `P3`: cosmetic, copy, atau gap minor yang tidak mengubah correctness utama.

## Required Evidence

- Waktu temuan dan lingkungan (`local seeded DB`).
- Role, tenant, store, route, endpoint, payload/query/header.
- Expected vs actual.
- HTTP status/body atau stacktrace jika ada.
- Screenshot atau potongan log yang relevan.

## Template

```md
### BUG-<tanggal>-<nomor> - <judul singkat>
- Severity: P?
- Role: <SUPER_ADMIN|ADMIN_TENANT|SUPERVISOR|CASHIER|KITCHEN>
- Tenant: <nama/id tenant>
- Store: <nama/id store atau n/a>
- Route: </app/...>
- Endpoint: <METHOD /api/...>
- Payload/Query/Header: <ringkas>
- Expected: <harusnya bagaimana>
- Actual: <yang terjadi>
- Reproduksi:
  1. ...
  2. ...
  3. ...
- Evidence: <screenshot/log/response>
- Dampak: <bisnis/keamanan/operasional>
- Mitigasi Sementara: <jika ada>
- Acceptance Criteria Fix: <kondisi selesai>
```

## Mini Risk Register

| Risiko | Dampak | Probabilitas | Mitigasi | Deteksi Produksi | Acceptance Criteria |
|---|---|---|---|---|---|
| Isi per bug baru | Tinggi/Sedang/Rendah | Tinggi/Sedang/Rendah | Langkah containment/fix | log/metric/alert yang relevan | kondisi lulus setelah fix |

## Catatan

- Dokumen ini sekarang berfungsi sebagai template intake bug UAT, bukan daftar temuan lama.
- Untuk baseline hasil verifikasi, lihat `AUDIT_UAT_HANDOFF.md` dan `AUDIT_FINAL_SIGNOFF.md`.
