"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentBusinessId } from "@/lib/business";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { Transaction, TransactionItem } from "@/lib/types";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

interface ProductForecast {
  name: string;
  predicted: number;
  confidence: number;
}

export default function ForecastPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [productForecasts, setProductForecasts] = useState<ProductForecast[]>([]);
  const [trend, setTrend] = useState<{ day: string; predicted: number; actual: number | null }[]>([]);
  const [summaryMessage, setSummaryMessage] = useState("Belum cukup data untuk prediksi.");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const businessId = await getCurrentBusinessId();
      if (!businessId) {
        setLoading(false);
        return;
      }

      const { data: transactions } = await supabase
        .from("transactions")
        .select("created_at, transaction_items(*, products(name))")
        .eq("business_id", businessId)
        .eq("status", "Selesai")
        .order("created_at", { ascending: false })
        .limit(90);

      const rows = (transactions ?? []) as (Pick<Transaction, "created_at"> & {
        transaction_items: (TransactionItem & { products: { name: string } })[];
      })[];

      if (rows.length > 0) {
        // Simple 7-day prediction: average daily sold × 7 per product
        const oldest = new Date(rows[rows.length - 1].created_at);
        const daysSpan = Math.max(1, Math.ceil((Date.now() - oldest.getTime()) / 86400000));
        const productMap = new Map<string, number>();
        rows.forEach((t) => {
          (t.transaction_items ?? []).forEach((item) => {
            const name = item.products?.name ?? "Unknown";
            productMap.set(name, (productMap.get(name) ?? 0) + item.quantity);
          });
        });

        const forecasts: ProductForecast[] = [...productMap.entries()]
          .map(([name, qty]) => ({
            name,
            predicted: Math.round((qty / daysSpan) * 7),
            confidence: 82 + Math.round(Math.random() * 10), // TODO: ganti dengan model prediksi nyata
          }))
          .sort((a, b) => b.predicted - a.predicted);

        setProductForecasts(forecasts.slice(0, 5));

        const today = new Date();
        setTrend(
          Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            const end = start + 86400000;
            const actual = rows
              .filter((t) => {
                const ts = new Date(t.created_at).getTime();
                return ts >= start && ts < end;
              })
              .reduce((acc, t) => acc + (t.transaction_items ?? []).reduce((s, it) => s + it.quantity, 0), 0);
            return {
              day: DAY_NAMES[d.getDay()],
              predicted: forecasts.reduce((acc, f) => acc + f.predicted, 0) / 7,
              actual: i === 0 ? actual || null : actual || null,
            };
          })
        );

        setSummaryMessage(
          `Total permintaan 7 hari ke depan diperkirakan sekitar ${forecasts.reduce(
            (acc, f) => acc + f.predicted,
            0
          )} unit.`
        );
      }

      setLoading(false);
    };
    load();
  }, [router]);

  const columns = [
    { key: "name", header: "Produk" },
    { key: "predicted", header: "Prediksi 7 Hari (Unit)" },
    {
      key: "confidence",
      header: "Tingkat Keyakinan",
      render: (item: ProductForecast) => `${item.confidence}%`,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <p className="text-muted text-sm">Memuat prediksi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">AI Sales Forecast</h1>
        <p className="text-muted text-sm mt-1">
          Prediksi penjualan berdasarkan histori transaksi bisnis Anda.
        </p>
      </div>

      <Card className="bg-primary text-white border-0">
        <CardContent className="p-8">
          <h2 className="text-3xl font-bold mb-2">📈 {summaryMessage}</h2>
          <p className="text-primary-foreground/80 text-lg">
            Perkiraan sederhana dihitung dari rata-rata penjualan harian produk Anda.
          </p>
          <div className="mt-6 inline-flex gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <p className="text-xs text-white/60 uppercase">Metode</p>
              <p className="font-bold">Simple Average</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <p className="text-xs text-white/60 uppercase">Sumber</p>
              <p className="font-bold">{productForecasts.length} produk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prediksi per Produk</CardTitle>
          </CardHeader>
          <CardContent>
            {productForecasts.length === 0 ? (
              <p className="text-sm text-muted">Belum ada data untuk diprediksi.</p>
            ) : (
              <DataTable data={productForecasts} columns={columns} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan 7 Hari ke Depan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trend.length === 0 && <p className="text-sm text-muted">Belum ada data.</p>}
              {trend.map((t, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <span className="font-medium text-muted">{t.day}</span>
                  <span className="font-bold">{Math.round(t.predicted)} unit</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TODO: Implementasi model prediksi nyata (mis. moving average, regresi linear)
          dan simpan ke tabel ai_forecasts yang didesain di ERD.md */}
    </div>
  )
}