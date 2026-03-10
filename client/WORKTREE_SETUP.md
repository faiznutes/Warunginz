# Worktree Setup Guide

## ⚠️ Penting: Setup Dependencies untuk Cursor Worktree

Jika Anda menggunakan Cursor worktree dan melihat error TypeScript seperti:
- "Cannot find type definition file for 'vite/client'"
- "Cannot find type definition file for 'node'"

**Ini berarti worktree belum memiliki `node_modules` yang lengkap.**

## 🚀 Solusi Cepat

### Opsi 1: Install Manual (Paling Cepat)

1. Buka terminal di Cursor (atau PowerShell/CMD)
2. Masuk ke folder worktree client:
   ```bash
   cd c:/Users/Iz/.cursor/worktrees/New-Warungin/oso/client
   ```
3. Install semua dependencies:
   ```bash
   npm install
   ```
4. Install type definitions yang diperlukan:
   ```bash
   npm install -D @types/node
   npm install vite
   ```
5. Restart TypeScript server di Cursor:
   - Tekan `Ctrl+Shift+P`
   - Ketik: `TypeScript: Restart TS Server`
   - Enter

### Opsi 2: Gunakan Script (Otomatis)

**PowerShell:**
```powershell
.\scripts\install-worktree-deps.ps1
```

**Bash/Git Bash:**
```bash
bash scripts/install-worktree-deps.sh
```

## ✅ Verifikasi

Setelah install, pastikan file berikut ada:
- `c:/Users/Iz/.cursor/worktrees/New-Warungin/oso/client/node_modules/vite/client.d.ts`
- `c:/Users/Iz/.cursor/worktrees/New-Warungin/oso/client/node_modules/@types/node/index.d.ts`

## 🔍 Mengapa Ini Perlu?

Cursor worktree memiliki `node_modules` terpisah dari repo utama. Setiap worktree perlu install dependencies sendiri.

## 📝 Catatan

- Worktree path mungkin berbeda tergantung setup Cursor Anda
- Update path di script jika worktree Anda di lokasi lain
- Setelah install, error TypeScript seharusnya hilang

---

**Last Updated:** December 10, 2025

