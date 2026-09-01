"use client"
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentBusinessId } from "@/lib/business";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { createSalesInsight, type SalesInsight } from "@/lib/sales-insights";
import type { Transaction, TransactionItem } from "@/lib/types";

interface LocalTransaction {
  id: string;
  product: string;
  time: string;
  productCount: number;
  date: string;
  total: number;
  payment: string;
  status: string;
}

const FALLBACK_INSIGHT: SalesInsight = {
  title: "Analisa pola penjualan Anda",
  description:
    "Tambahkan lebih banyak transaksi untuk mendapatkan rekomendasi waktu terbaik penjualan produk Anda.",
  priority: "LOW",
  action: "Catat Transaksi",
};

const STATIC_RECOMMENDATIONS = [
  {
    id: 1,
    priority: "MEDIUM" as const,
    title: "Pantau produk dengan stok rendah",
    description:
      "Produk yang mendekati stok minimum berisiko kehabisan. Pertimbangkan untuk melakukan restock segera.",
    action: "Lihat Inventori",
  },
  {
    id: 2,
    priority: "LOW" as const,
    title: "Evaluasi produk dengan penjualan rendah",
    description:
      "Identifikasi produk yang jarang terjual dan pertimbangkan promosi atau bundling untuk meningkatkan volume.",
    action: "Lihat Detail",
  },
];

export default function RecommendationsPage() {
  const [salesInsight, setSalesInsight] = useState<SalesInsight>(FALLBACK_INSIGHT);

  useEffect(() => {
    const load = async () => {
      const businessId = await getCurrentBusinessId();
      if (!businessId) return;

      const { data: transactions } = await supabase
        .from("transactions")
        .select("id, created_at, transaction_items(*, products(name))")
        .eq("business_id", businessId)
        .eq("status", "Selesai")
        .order("created_at", { ascending: false })
        .limit(100);

      const rows = (transactions ?? []) as (Pick<Transaction, "id" | "created_at"> & {
        transaction_items: (TransactionItem & { products: { name: string } })[];
      })[];

      const local: LocalTransaction[] = rows.flatMap((t) =>
        (t.transaction_items ?? []).map((item) => ({
          id: t.id,
          product: item.products?.name ?? "Unknown",
          time: new Date(t.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          productCount: item.quantity,
          date: new Date(t.created_at).toLocaleDateString("id-ID"),
          total: Number(item.subtotal),
          payment: "Cash",
          status: "Selesai",
        }))
      );

      setSalesInsight(local.length > 0 ? createSalesInsight(local) : FALLBACK_INSIGHT);
    };
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">AI Recommendations</h1>
        <p className="text-muted text-sm mt-1">
          Rekomendasi bisnis berdasarkan kondisi dan prediksi bisnis Anda.
        </p>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto">
        <button className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium">Semua</button>
        <button className="px-4 py-2 rounded-full border border-gray-200 bg-surface text-foreground text-sm font-medium hover:bg-gray-50">High</button>
        <button className="px-4 py-2 rounded-full border border-gray-200 bg-surface text-foreground text-sm font-medium hover:bg-gray-50">Medium</button>
        <button className="px-4 py-2 rounded-full border border-gray-200 bg-surface text-foreground text-sm font-medium hover:bg-gray-50">Low</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <RecommendationCard
          priority={salesInsight.priority}
          title={salesInsight.title}
          description={salesInsight.description}
          actionText={salesInsight.action}
        />
        {STATIC_RECOMMENDATIONS.map((rec) => (
          <RecommendationCard
            key={rec.id}
            priority={rec.priority}
            title={rec.title}
            description={rec.description}
            actionText={rec.action}
          />
        ))}
      </div>

      {/* TODO: Simpan rekomendasi AI ke tabel ai_recommendations jika dibutuhkan persistensi */}
    </div>
  )
}