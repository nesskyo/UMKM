# Setup Supabase untuk UMKM Smart Advisor

Panduan lengkap untuk menghubungkan project ini dengan Supabase (PostgreSQL + Auth).

## Prasyarat

- Node.js 18+ dan npm
- Akun Supabase gratis (https://supabase.com)
- Project Next.js sudah ter-install (`npm install`)

## 1. Buat Project Supabase

1. Login ke https://supabase.com dan klik **New project**.
2. Isi nama project (misal `umkm-smart-advisor`), database password, dan region terdekat.
3. Tunggu hingga project selesai dibuat (beberapa menit).

## 2. Jalankan Skema & Seed Database

1. Buka project Supabase Anda → menu **SQL Editor**.
2. Buka file `supabase/schema.sql`, salin seluruh isinya, lalu klik **Run**.
   Fungsi ini membuat 8 tabel berikut:
   - `profiles` (melengkapi `auth.users` dari Supabase Auth)
   - `businesses`
   - `product_categories`
   - `products`
   - `transactions`
   - `transaction_items`
   - `inventory_history`
   - `notifications`

   Plus: enumerasi, index, trigger `updated_at`, **Row Level Security (RLS)**, dan trigger `handle_new_user` (otomatis membuat profil saat registrasi).

3. Buka file `supabase/data.sql`, salin isinya, lalu klik **Run**.
   Ini mengisi 10 kategori produk reference:

   ```
   Makanan, Minuman, Pakaian dan Fashion, Kecantikan dan Perawatan,
   Rumah Tangga, Elektronik, Mainan, Jasa, Produk Digital, Lainnya
   ```

## 3. Isi `.env.local`

1. Di dashboard Supabase → **Project Settings → API**.
2. Salin **Project URL** dan **anon public key**.
3. Edit file `.env.local` di root project:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

4. Simpan. (Afterrestart server dev jika sedang berjalan.)

## 4. Jalankan Project Lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## 5. Alur Pengujian (Data Awal)

Database diisi ulang **setiap user register** via trigger — jadi cukup:

1. Buka `/register`, buat akun baru (nama lengkap + nama UMKM).
2. Secara otomatis:
   - `profiles` dibuat oleh trigger `handle_new_user`.
   - `businesses` dibuat oleh halaman register.
3. Klik **Tambah Produk** di halaman `/products`, lalu **Catat Transaksi** di `/transactions`.
4. Halaman `/dashboard`, `/analytics`, `/inventory`, dan `/forecast` otomatis menampilkan data sesuai transaksi yang Anda catat.

### Opsi: Isi dengan Data Contoh (Demo)

Untuk mempercepat demo, daftar dulu dengan email `andi@kopisenja.com` di `/register`,
lalu buka `supabase/seed-example.sql` di SQL Editor dan klik **Run**.
File itu mengisi otomatis 10 produk, 7 transaksi (7 hari terakhir), item, dan notifikasi
untuk bisnis yang dibuat akun tersebut — berapa pun nama bisnisnya. File aman dijalankan ulang.



## 6. Row Level Security (RLS)

RLS sudah aktif pada `schema.sql`. Kebijakan dasarnya:

- User hanya bisa membaca/mengubah **profilnya sendiri**.
- User hanya bisa mengelola bisnis yang ia buat (`created_by = auth.uid()`).
- Data `products`, `transactions`, `inventory_history`, `notifications` hanya bisa diakses via bisnis miliknya.
- `product_categories` bisa dibaca oleh semua user yang login.

Penting: **snapshot anon key** tidak bisa mengakses data TANPA login (semua tabel RLS aktif). Pastikan user sudah login sebelum fetch data.

## 7. APIn Supabase yang Digunakan di Aplikasi

| Halaman | Tabel | Operasi |
|---|---|---|
| `/login`, `/register` | `auth.users`, `businesses` | signUp, signInWithPassword |
| `/forgot-password`, `/reset-password` | `auth.users` | resetPasswordForEmail, updateUser |
| `/dashboard` | `businesses`, `profiles`, `transactions`, `transaction_items` | SELECT + agregasi |
| `/products` | `products`, `product_categories` | SELECT, INSERT, UPDATE |
| `/transactions` | `transactions`, `transaction_items`, `products`, `inventory_history` | INSERT + update stok |
| `/inventory` | `products`, `inventory_history` | SELECT |
| `/notifications` | `notifications` | SELECT, UPDATE, DELETE |
| `/profile` | `profiles`, `businesses` | SELECT, UPDATE |

## 8. Troubleshooting

- **Error `Cannot find module '../lightningcss.win32-x64-msvc.node'` (Windows)**: binding native `lightningcss` untuk Windows tidak ter-resolve.
  - Project ini sudah memuat binding Windows di `node_modules` (file `lightningcss.win32-x64-msvc.node`) dan `next.config.ts` sudah mem-blacklist paket native dari bundler (`serverExternalPackages`).
  - Jika error masih muncul: **hentikan dev server**, hapus folder `.next` (`rmdir /s .next`), lalu `npm run dev` lagi — cache Turbopack yang basi sering jadi biang keladinya.
  - Solusi/user guide lengkap: file `TROUBLESHOOTING.md`.

- **Error `Invalid login credentials` saat login**: email/password tidak cocok dengan kredensial yang tersimpan di Supabase Auth.
  - Form login **tidak lagi mengisi password otomatis** — ketik password yang dipakai saat akun itu didaftarkan.
  - Jika akun `andi@kopisenja.com` dibuat lewat dashboard Supabase, gunakan password yang diset saat itu, atau tekan **Lupa password?** untuk mereset.
  - Verifikasi nilai yang dikirim lewat console log berlabel `[login] attempt` (password hanya ditampilkan panjang + karakter awal/akhir, bukan teks penuh).
- **Data tidak muncul**: Pastikan login dulu; semua tabel memakai RLS. Login di `/login`.
- **Email terdaftar untuk demo**: gunakan akun baru atau reset password via Supabase dashboard.
- **Upload avatar gagal (opsional)**: buat bucket `avatars` di **Storage** → New bucket → name `avatars`, public. Fitur foto profil butuh bucket tersebut.
- **Build error TypeScript**: jalankan `npm run build` dan pastikan tidak ada error; lihat bagian berikut.

## 9. Scripts

```bash
npm run dev     # development server
npm run build   # build production
npm run lint    # eslint
```

---

Selamat mengembangkan! 🚀