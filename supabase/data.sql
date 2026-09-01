-- ============================================================
-- UMKM Smart Advisor — Seed Data for Supabase
-- ============================================================
-- Jalankan schema.sql terlebih dahulu, lalu file ini.
-- File ini hanya mengisi data referensi (kategori produk).
-- Untuk data demo lengkap (produk + transaksi), gunakan
-- supabase/seed-example.sql SETELAH register di aplikasi.
-- ============================================================

-- 1. PRODUCT CATEGORIES
INSERT INTO product_categories (id, name) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Makanan'),
  ('a1000000-0000-0000-0000-000000000002', 'Minuman'),
  ('a1000000-0000-0000-0000-000000000003', 'Pakaian dan Fashion'),
  ('a1000000-0000-0000-0000-000000000004', 'Kecantikan dan Perawatan'),
  ('a1000000-0000-0000-0000-000000000005', 'Rumah Tangga'),
  ('a1000000-0000-0000-0000-000000000006', 'Elektronik'),
  ('a1000000-0000-0000-0000-000000000007', 'Mainan'),
  ('a1000000-0000-0000-0000-000000000008', 'Jasa'),
  ('a1000000-0000-0000-0000-000000000009', 'Produk Digital'),
  ('a1000000-0000-0000-0000-000000000010', 'Lainnya')
ON CONFLICT (name) DO NOTHING;
