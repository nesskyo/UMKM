# Troubleshooting — UMKM Smart Advisor

## Error native `lightningcss` saat `npm run dev` di Windows

```
Error: Cannot find module '../lightningcss.win32-x64-msvc.node'
Require stack:
- ...\node_modules\lightningcss\node\index.js
- ...\node_modules\@tailwindcss\node\dist\index.js
- ...\node_modules\@tailwindcss\postcss\dist\index.js
```

### Penyebab

Tailwind CSS v4 dan pengolahan CSS-nya memakai paket native **Rust**:

- `lightningcss` → binding `lightningcss-<platform>`.
- `@tailwindcss/oxide` → binding `@tailwindcss/oxide-<platform>`.

npm hanya mengunduh binding yang cocok dengan OS saat `npm install` dijalankan.
Jika proyek dibuat/di-install di Linux (atau WSL) kemudian `node_modules` dipakai
bersama di Windows, binding Windows (`lightningcss-win32-x64-msvc`) tidak ada —
persis seperti error di atas.

### Solusi permanen (sudah diterapkan di project ini)

Project ini sudah mengatasi masalahnya di dua lapis:

1. **Binding Windows ditambahkan ke `node_modules`** (lihat Opsi A di bawah)
   sehingga tidak perlu install ulang.
2. **`next.config.ts` menambahkan `serverExternalPackages: ["lightningcss", "@tailwindcss/oxide"]`**
   agar Turbopack TIDAK membundel loader native ini dan memutuskannya lewat
   `require` Node normal — resolver akan memilih binding sesuai platform saat
   runtime.

Jika error masih muncul setelah itu, satu lagi penyebab umum: **cache Turbopack
yang basi** di folder `.next` (tersisa dari build platform lain). Perbaiki dengan:

```bash
# Windows (PowerShell/CMD)
# 1. Hentikan server dev (Ctrl+C)
# 2. Hapus folder .next
rmdir /s .next
# 3. Jalankan ulang dev
npm run dev
```

### Solusi bila binding Windows belum ada

#### Opsi A — Tambahkan binding Windows (cepat, tanpa install ulang)

Jalankan di folder proyek (Windows PowerShell/CMD):

```bash
npm install --no-save --force lightningcss-win32-x64-msvc@1.32.0 @tailwindcss/oxide-win32-x64-msvc@4.3.3
```

Versi `1.32.0` / `4.3.3` harus sama dengan yang terpasang — cek dengan:

```bash
npm ls lightningcss @tailwindcss/oxide
```

#### Opsi B — Install ulang di OS tujuan (paling bersih)

```bash
# Windows
rmdir /s node_modules
npm install
```

#### Pemulihan cepat untuk kasus serupa

```bash
npm rebuild lightningcss @tailwindcss/oxide --force
```

### Catatan penting

- **JANGAN** menambahkan nama paket binding (mis. `lightningcss-win32-x64-msvc`)
  ke `dependencies` di `package.json`. Install npm di platform lain akan gagal
  dengan error `EBADPLATFORM/notsup` (`os` yang dideklarasikan tidak cocok).
  Biarkan npm memilih binding yang benar lewat `optionalDependencies` paket induknya.
- Project ini berada di drive bersama (`C:\...`). Setiap kali berganti OS
  (Linux ↔ Windows) dan `node_modules` dibagikan, jalankan salah satu opsi di atas.
- `npm ci` akan meniru isi `node_modules` dari `package-lock.json` untuk platform saat ini.

## Verifikasi setelah perbaikan

```bash
npx tsc --noEmit
npm run build
npm run dev
```