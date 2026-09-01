"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentBusinessId } from "@/lib/business";
import { SimpleLineChart, SimpleBarChart } from "@/components/charts/base-charts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AIInsightCard } from "@/components/dashboard/ai-insight-card";
import type { Transaction } from "@/lib/types";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

interface TrendPoint {
  day: string;
  revenue: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [aiSummary, setAiSummary] = useState("Belum ada data penjualan.");
  const [loading, setLoading] = useState(true);

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
        .select("*")
        .eq("business_id", businessId)
        .eq("status", "Selesai")
        .order("created_at", { ascending: false })
        .limit(500);

      const rows = (transactions ?? []) as Transaction[];

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

      const totalRevenue = rows.reduce((acc, t) => acc + Number(t.total_amount), 0);
      setAiSummary(
        rows.length > 0
          ? `Total ${rows.length} transaksi dengan pendapatan Rp ${totalRevenue.toLocaleString(
              "id-ID"
            )} dalam 7 hari terakhir.`
          : "Belum ada data penjualan untuk dianalisis."
      );

      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <p className="text-muted text-sm">Memuat analitik...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Analitik Penjualan</h1>
        <p className="text-muted text-sm mt-1">Insight mendalam mengenai performa bisnis Anda.</p>
      </div>

      <AIInsightCard summary={aiSummary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tren Pendapatan (7 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={trend} dataKey="revenue" seriesName="Pendapatan" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penjualan Berdasarkan Hari</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={trend} xKey="day" yKey="revenue" seriesName="Pendapatan" />
          </CardContent>
        </Card>
      </div>

      {/* TODO: Untuk chart 30 hari dan metrik pertumbuhan, fetch transaksi
          lebih banyak dan bandingkan dengan periode sebelumnya. */}
    </div>
  )
}