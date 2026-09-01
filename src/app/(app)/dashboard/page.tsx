"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentBusinessId } from "@/lib/business";
import { MetricCard } from "@/components/dashboard/metric-card";
import { AIInsightCard } from "@/components/dashboard/ai-insight-card";
import { SimpleLineChart } from "@/components/charts/base-charts";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Transaction, TransactionItem } from "@/lib/types";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

interface TrendPoint {
  day: string;
  revenue: number;
}

interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("UMKM Saya");
  const [owner, setOwner] = useState("Pengguna");
  const [stats, setStats] = useState({
    revenue: 0,
    totalTransactions: 0,
    productsSold: 0,
    aov: 0,
  });
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const businessId = await getCurrentBusinessId();
      if (!businessId) {
        setLoading(false);
        return;
      }

      const { data: biz } = await supabase.from("businesses").select("name").eq("id", businessId).single();
      setBusinessName(biz?.name ?? "UMKM Saya");

      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      setOwner(profile?.full_name ?? "Pengguna");

      const { data: transactions } = await supabase
        .from("transactions")
        .select("*, transaction_items(*, products(name))")
        .eq("business_id", businessId)
        .eq("status", "Selesai")
        .order("created_at", { ascending: false })
        .limit(500);

      const rows = (transactions ?? []) as (Transaction & { transaction_items: (TransactionItem & { products: { name: string } })[] })[];

      const totalRevenue = rows.reduce((acc, t) => acc + Number(t.total_amount), 0);
      const totalItems = rows.reduce(
        (acc, t) => acc + (t.transaction_items ?? []).reduce((s, i) => s + i.quantity, 0),
        0
      );

      setStats({
        revenue: totalRevenue,
        totalTransactions: rows.length,
        productsSold: totalItems,
        aov: rows.length > 0 ? totalRevenue / rows.length : 0,
      });

      const today = new Date();
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const end = start + 86400000;
        return {
          day: DAY_NAMES[d.getDay()],
          revenue: rows
            .filter((t) => {
              const ts = new Date(t.created_at).getTime();
              return ts >= start && ts < end;
            })
            .reduce((acc, t) => acc + Number(t.total_amount), 0),
        };
      });
      setTrend(days);

      const productMap = new Map<string, TopProduct>();
      rows.forEach((t) => {
        (t.transaction_items ?? []).forEach((item) => {
          const name = item.products?.name ?? "Unknown";
          const current = productMap.get(name) ?? { name, sold: 0, revenue: 0 };
          current.sold += item.quantity;
          current.revenue += Number(item.subtotal);
          productMap.set(name, current);
        });
      });
      setTopProducts([...productMap.values()].sort((a, b) => b.revenue - a.revenue));
      setLoading(false);
    };
    load();
  }, [router]);

  const aiSummary =
    stats.totalTransactions > 0
      ? `Bisnis Anda mencatat ${stats.totalTransactions} transaksi dengan total pendapatan Rp ${stats.revenue.toLocaleString(
          "id-ID"
        )} dan ${stats.productsSold} produk terjual.`
      : "Belum ada data penjualan. Mulai catat transaksi untuk melihat insight bisnis Anda.";

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <p className="text-muted text-sm">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Selamat datang kembali, {owner.split(" ")[0]} 👋</h1>
          <p className="text-muted mt-1">Berikut ringkasan performa {businessName}.</p>
        </div>
        <div className="w-32">
          <Select defaultValue="7">
            <option value="7">7 Hari</option>
            <option value="30">30 Hari</option>
            <option value="90">3 Bulan</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Pendapatan" value={`Rp ${(stats.revenue / 1000000).toFixed(2)}M`} subtitle="total penjualan" />
        <MetricCard title="Total Transaksi" value={stats.totalTransactions} subtitle="transaksi selesai" />
        <MetricCard title="Produk Terjual" value={stats.productsSold} subtitle="unit terjual" />
        <MetricCard title="Rata-rata Transaksi" value={`Rp ${(stats.aov / 1000).toFixed(1)}k`} subtitle="rata-rata per transaksi" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performa Penjualan</CardTitle>
            <p className="text-sm text-muted">7 hari terakhir</p>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={trend} dataKey="revenue" seriesName="Pendapatan" />
          </CardContent>
        </Card>

        <div className="space-y-8">
          <AIInsightCard summary={aiSummary} />

          <Card>
            <CardHeader>
              <CardTitle>Produk Teratas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length === 0 && (
                  <p className="text-sm text-muted">Belum ada data produk terjual.</p>
                )}
                {topProducts.slice(0, 3).map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div>
                      <p className="font-medium">{idx + 1}. {prod.name}</p>
                      <p className="text-sm text-muted">{prod.sold} terjual</p>
                    </div>
                    <p className="font-semibold text-primary">Rp {(prod.revenue / 1000000).toFixed(2)}M</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}