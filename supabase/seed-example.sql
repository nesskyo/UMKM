-- ============================================================
-- UMKM Smart Advisor — Contoh Data Demo (setelah register)
-- ============================================================
-- Cara pakai:
--   1. Jalankan schema.sql lalu data.sql (kategori) di SQL Editor.
--   2. Di aplikasi, daftar akun dengan email:  andi@kopisenja.com
--   3. Setelah register, jalankan file ini di SQL Editor.
--      Semua data tersambung otomatis ke bisnis yang dibuat akun
--      andi@kopisenja.com (tidak peduli nama bisnisnya apa).
--   4. Login kembali di /login untuk melihat dashboard terisi data.
--
-- File ini AMAN dijalankan berulang kali (idempotent).
-- ============================================================

-- ============================================================
-- 1. PRODUK (stock = stok awal sebelum penjualan seed)
-- ============================================================
INSERT INTO products (id, business_id, category_id, name, price, stock, min_stock)
SELECT p.id, b.id, pc.id, p.name, p.price, p.initial_stock, p.min_stock
FROM businesses b
JOIN auth.users u ON u.id = b.created_by
CROSS JOIN (VALUES
  ('c1000000-0000-0000-0000-000000000001'::uuid, 'Minuman', 'Kopi Arabica', 25000, 52, 10),
  ('c1000000-0000-0000-0000-000000000002'::uuid, 'Minuman', 'Kopi Robusta', 22000, 62, 10),
  ('c1000000-0000-0000-0000-000000000003'::uuid, 'Minuman', 'Es Teh Manis', 10000, 76, 15),
  ('c1000000-0000-0000-0000-000000000004'::uuid, 'Makanan', 'Klepon', 15000, 32, 5),
  ('c1000000-0000-0000-0000-000000000005'::uuid, 'Makanan', 'Pisang Goreng', 12000, 27, 5),
  ('c1000000-0000-0000-0000-000000000006'::uuid, 'Pakaian dan Fashion', 'Batik Pekalongan', 150000, 13, 3),
  ('c1000000-0000-0000-0000-000000000007'::uuid, 'Kecantikan dan Perawatan', 'Sabun Herbal', 35000, 43, 8),
  ('c1000000-0000-0000-0000-000000000008'::uuid, 'Rumah Tangga', 'Tas Rotan', 90000, 9, 2),
  ('c1000000-0000-0000-0000-000000000009'::uuid, 'Minuman', 'Jamu Botol', 18000, 57, 10),
  ('c1000000-0000-0000-0000-000000000010'::uuid, 'Jasa', 'Jasa Pelatihan UMKM', 250000, 3, 1)
) AS p(id, category_name, name, price, initial_stock, min_stock)
JOIN product_categories pc ON pc.name = p.category_name
WHERE u.email = 'andi@kopisenja.com'
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. TRANSAKSI SELAMA 7 HARI TERAKHIR
--    (total_amount diisi otomatis dari item pada langkah 4)
-- ============================================================
INSERT INTO transactions (id, business_id, user_id, total_amount, payment_method, status, created_at)
SELECT tx.id, b.id, u.id, 0,
       tx.payment::payment_method,
       'Selesai'::transaction_status,
       tx.created_at
FROM businesses b
JOIN auth.users u ON u.id = b.created_by
CROSS JOIN (VALUES
  ('b1000000-0000-0000-0000-000000000001'::uuid, 'QRIS', now() - interval '6 days'),
  ('b1000000-0000-0000-0000-000000000002'::uuid, 'Cash', now() - interval '5 days'),
  ('b1000000-0000-0000-0000-000000000003'::uuid, 'QRIS', now() - interval '4 days'),
  ('b1000000-0000-0000-0000-000000000004'::uuid, 'Cash', now() - interval '3 days'),
  ('b1000000-0000-0000-0000-000000000005'::uuid, 'Transfer Bank', now() - interval '2 days'),
  ('b1000000-0000-0000-0000-000000000006'::uuid, 'QRIS', now() - interval '1 day'),
  ('b1000000-0000-0000-0000-000000000007'::uuid, 'Cash', now())
) AS tx(id, payment, created_at)
WHERE u.email = 'andi@kopisenja.com'
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. ITEM TRANSAKSI
-- ============================================================
INSERT INTO transaction_items (id, transaction_id, product_id, quantity, unit_price, subtotal)
SELECT it.id, it.transaction_id, it.product_id, it.quantity, it.unit_price,
       it.quantity * it.unit_price
FROM (VALUES
  -- TX-01 (6 hari lalu)
  ('b2000000-0000-0000-0000-000000000001'::uuid, 'b1000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000010'::uuid, 1, 250000),
  -- TX-02 (5 hari lalu)
  ('b2000000-0000-0000-0000-000000000002'::uuid, 'b1000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 2, 25000),
  ('b2000000-0000-0000-0000-000000000003'::uuid, 'b1000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 3, 10000),
  ('b2000000-0000-0000-0000-000000000004'::uuid, 'b1000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000005'::uuid, 2, 12000),
  -- TX-03 (4 hari lalu)
  ('b2000000-0000-0000-0000-000000000005'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 2, 22000),
  ('b2000000-0000-0000-0000-000000000006'::uuid, 'b1000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000004'::uuid, 2, 15000),
  -- TX-04 (3 hari lalu)
  ('b2000000-0000-0000-0000-000000000007'::uuid, 'b1000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000006'::uuid, 1, 150000),
  ('b2000000-0000-0000-0000-000000000008'::uuid, 'b1000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 2, 25000),
  ('b2000000-0000-0000-0000-000000000009'::uuid, 'b1000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000007'::uuid, 1, 35000),
  -- TX-05 (2 hari lalu)
  ('b2000000-0000-0000-0000-000000000010'::uuid, 'b1000000-0000-0000-0000-000000000005'::uuid, 'c1000000-0000-0000-0000-000000000006'::uuid, 2, 150000),
  ('b2000000-0000-0000-0000-000000000011'::uuid, 'b1000000-0000-0000-0000-000000000005'::uuid, 'c1000000-0000-0000-0000-000000000008'::uuid, 1, 90000),
  ('b2000000-0000-0000-0000-000000000012'::uuid, 'b1000000-0000-0000-0000-000000000005'::uuid, 'c1000000-0000-0000-0000-000000000007'::uuid, 2, 35000),
  -- TX-06 (1 hari lalu)
  ('b2000000-0000-0000-0000-000000000013'::uuid, 'b1000000-0000-0000-0000-000000000006'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 3, 25000),
  ('b2000000-0000-0000-0000-000000000014'::uuid, 'b1000000-0000-0000-0000-000000000006'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 2, 22000),
  ('b2000000-0000-0000-0000-000000000015'::uuid, 'b1000000-0000-0000-0000-000000000006'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 2, 10000),
  -- TX-07 (hari ini)
  ('b2000000-0000-0000-0000-000000000016'::uuid, 'b1000000-0000-0000-0000-000000000007'::uuid, 'c1000000-0000-0000-0000-000000000005'::uuid, 3, 12000),
  ('b2000000-0000-0000-0000-000000000017'::uuid, 'b1000000-0000-0000-0000-000000000007'::uuid, 'c1000000-0000-0000-0000-000000000004'::uuid, 2, 15000),
  ('b2000000-0000-0000-0000-000000000018'::uuid, 'b1000000-0000-0000-0000-000000000007'::uuid, 'c1000000-0000-0000-0000-000000000009'::uuid, 2, 18000),
  ('b2000000-0000-0000-0000-000000000019'::uuid, 'b1000000-0000-0000-0000-000000000007'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 1, 10000)
) AS it(id, transaction_id, product_id, quantity, unit_price)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. HITUNG ULANG total_amount DARI ITEM
-- ============================================================
UPDATE transactions t
SET total_amount = s.total
FROM (
  SELECT ti.transaction_id, SUM(ti.subtotal) AS total
  FROM transaction_items ti
  JOIN transactions tr ON tr.id = ti.transaction_id
  WHERE tr.id::text LIKE 'b1000000-%'
  GROUP BY ti.transaction_id
) s
WHERE s.transaction_id = t.id;

-- ============================================================
-- 5. SINKRONKAN STOK = stok_awal - jumlah terjual
--    (idempotent: aman dijalankan ulang)
-- ============================================================
UPDATE products p
SET stock = o.initial_stock - COALESCE(s.sold, 0)
FROM (VALUES
  ('c1000000-0000-0000-0000-000000000001'::uuid, 52),
  ('c1000000-0000-0000-0000-000000000002'::uuid, 62),
  ('c1000000-0000-0000-0000-000000000003'::uuid, 76),
  ('c1000000-0000-0000-0000-000000000004'::uuid, 32),
  ('c1000000-0000-0000-0000-000000000005'::uuid, 27),
  ('c1000000-0000-0000-0000-000000000006'::uuid, 13),
  ('c1000000-0000-0000-0000-000000000007'::uuid, 43),
  ('c1000000-0000-0000-0000-000000000008'::uuid, 9),
  ('c1000000-0000-0000-0000-000000000009'::uuid, 57),
  ('c1000000-0000-0000-0000-000000000010'::uuid, 3)
) AS o(id, initial_stock)
LEFT JOIN (
  SELECT product_id, SUM(quantity) AS sold
  FROM transaction_items
  WHERE product_id::text LIKE 'c1000000-%'
  GROUP BY product_id
) s ON s.product_id = o.id
WHERE p.id = o.id;

-- ============================================================
-- 6. NOTIFIKASI PENJUALAN & STOK (opsional)
-- ============================================================
INSERT INTO notifications (business_id, user_id, title, description, category, priority)
SELECT b.id, u.id, 'Suguhan data demo siap!',
       '7 transaksi contoh dan 10 produk telah diisi untuk bisnis Anda.',
       'system', 'medium'
FROM businesses b
JOIN auth.users u ON u.id = b.created_by
WHERE u.email = 'andi@kopisenja.com'
  AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = u.id AND n.title = 'Suguhan data demo siap!'
  );

-- ============================================================
-- SELESAI — cek hasil:
--   SELECT * FROM products;
--   SELECT * FROM transactions ORDER BY created_at DESC;
-- ============================================================