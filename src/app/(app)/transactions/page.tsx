"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentBusinessId } from "@/lib/business";
import type { Product, Transaction, TransactionItem } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Modal } from "@/components/ui/modal";

interface TransactionRow extends Transaction {
  transaction_items: (TransactionItem & { products: Product })[];
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [newTrx, setNewTrx] = useState({
    productId: "",
    productCount: "",
    payment: "QRIS",
  });

  useEffect(() => {
    if (!isAddModalOpen) return;
    const loadProducts = async () => {
      const businessId = await getCurrentBusinessId();
      if (!businessId) return;
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", businessId);
      setProducts(data ?? []);
      if (data && data.length > 0) {
        setNewTrx((prev) => ({ ...prev, productId: prev.productId || data[0].id }));
      }
    };
    loadProducts();
  }, [isAddModalOpen]);

  useEffect(() => {
    const loadTransactions = async () => {
      const businessId = await getCurrentBusinessId();
      if (!businessId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("transactions")
        .select("*, transaction_items(*, products(*))")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(50);
      setTransactions((data ?? []) as TransactionRow[]);
      setLoading(false);
    };
    loadTransactions();
  }, []);

  const handleSaveTransaction = async () => {
    const businessId = await getCurrentBusinessId();
    if (!businessId) {
      setFeedback("Bisnis tidak ditemukan.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const product = products.find((p) => p.id === newTrx.productId);
    if (!product) {
      setFeedback("Pilih produk terlebih dahulu.");
      return;
    }

    const quantity = parseInt(newTrx.productCount) || 1;
    const total = product.price * quantity;

    const { data: trx, error } = await supabase
      .from("transactions")
      .insert({
        business_id: businessId,
        user_id: user.id,
        total_amount: total,
        payment_method: newTrx.payment,
        status: "Selesai",
      })
      .select()
      .single();

    if (error) {
      setFeedback(`Gagal menyimpan: ${error.message}`);
      return;
    }

    const { error: itemError } = await supabase.from("transaction_items").insert({
      transaction_id: trx.id,
      product_id: product.id,
      quantity,
      unit_price: product.price,
      subtotal: total,
    });

    if (itemError) {
      setFeedback(`Gagal menyimpan detail: ${itemError.message}`);
      return;
    }

    await supabase
      .from("products")
      .update({ stock: Math.max(0, product.stock - quantity) })
      .eq("id", product.id);

    await supabase.from("inventory_history").insert({
      business_id: businessId,
      product_id: product.id,
      change_type: "sale",
      quantity_changed: -quantity,
      notes: `Penjualan ${product.name}`,
    });

    setTransactions((prev) => [
      {
        ...trx,
        transaction_items: [{ id: "", transaction_id: trx.id, product_id: product.id, quantity, unit_price: product.price, subtotal: total, products: product }],
      } as TransactionRow,
      ...prev,
    ]);
    setIsAddModalOpen(false);
    setNewTrx({ productId: products[0]?.id ?? "", productCount: "", payment: "QRIS" });
    setFeedback("Transaksi berhasil ditambahkan.");
  };

  const columns = [
    { key: "id", header: "ID Transaksi", render: (item: TransactionRow) => shortId(item.id) },
    {
      key: "time",
      header: "Waktu",
      render: (item: TransactionRow) => new Date(item.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
    {
      key: "date",
      header: "Tanggal",
      render: (item: TransactionRow) => new Date(item.created_at).toLocaleDateString("id-ID"),
    },
    {
      key: "product",
      header: "Produk",
      render: (item: TransactionRow) =>
        (item.transaction_items ?? []).map((i) => i.products?.name ?? "-").join(", ") || "-",
    },
    {
      key: "productCount",
      header: "Jumlah Produk",
      render: (item: TransactionRow) =>
        `${(item.transaction_items ?? []).reduce((acc, i) => acc + i.quantity, 0)} item`,
    },
    {
      key: "total_amount",
      header: "Total",
      render: (item: TransactionRow) => `Rp ${Number(item.total_amount).toLocaleString('id-ID')}`,
    },
    { key: "payment_method", header: "Pembayaran" },
    {
      key: "status",
      header: "Status",
      render: (item: TransactionRow) => <Badge variant="success">{item.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transaksi</h1>
          <p className="text-muted text-sm mt-1">Pantau semua penjualan Anda.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Transaksi Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Penjualan Hari Ini" value={formatRp(transactionsToday(transactions))} />
        <MetricCard title="Transaksi Hari Ini" value={transactionsToday(transactions, true)} />
        <MetricCard title="Produk Terjual" value={productsSold(transactions)} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <Input placeholder="Cari transaksi (ID, tanggal)..." className="pl-10" />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      {feedback && <p className="text-sm text-success" role="status">{feedback}</p>}

      {loading ? (
        <p className="text-muted text-sm">Memuat transaksi...</p>
      ) : (
        <DataTable data={transactions} columns={columns} />
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Catat Transaksi Baru"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveTransaction}>Simpan Transaksi</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Produk</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-200 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={newTrx.productId}
              onChange={e => setNewTrx({ ...newTrx, productId: e.target.value })}
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name} — Rp {Number(product.price).toLocaleString("id-ID")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jumlah Item</label>
            <Input
              type="number"
              placeholder="2"
              value={newTrx.productCount}
              onChange={e => setNewTrx({ ...newTrx, productCount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Metode Pembayaran</label>
            <select
              className="flex h-10 w-full rounded-md border border-gray-200 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={newTrx.payment}
              onChange={e => setNewTrx({ ...newTrx, payment: e.target.value })}
            >
              <option value="QRIS">QRIS</option>
              <option value="Cash">Cash</option>
              <option value="Transfer Bank">Transfer Bank</option>
              <option value="Kartu Debit">Kartu Debit</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function transactionsToday(transactions: TransactionRow[], countOnly = false) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todays = transactions.filter((t) => new Date(t.created_at).getTime() >= todayStart && t.status === "Selesai");
  if (countOnly) return todays.length;
  return todays.reduce((acc, t) => acc + Number(t.total_amount), 0);
}

function productsSold(transactions: TransactionRow[]) {
  return transactions.reduce((acc, t) => {
    const items = (t.transaction_items ?? []).reduce((s, i) => s + i.quantity, 0);
    return acc + items;
  }, 0);
}

function formatRp(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}