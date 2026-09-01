"use client"
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentBusinessId } from "@/lib/business";
import type { InventoryHistory, Product } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function getProductStatus(stock: number, minStock: number) {
  if (stock <= 0) return "Out of Stock" as const;
  if (stock <= minStock) return "Low Stock" as const;
  return "Available" as const;
}

type ProductRow = Product & { status: ReturnType<typeof getProductStatus>; categoryName: string };

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [history, setHistory] = useState<InventoryHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const businessId = await getCurrentBusinessId();
      if (!businessId) {
        setLoading(false);
        return;
      }

      const { data: productData } = await supabase
        .from("products")
        .select("*, product_categories(name)")
        .eq("business_id", businessId)
        .order("stock", { ascending: true });

      setProducts(
        (productData ?? []).map((p: Product & { product_categories: { name: string } }) => ({
          ...p,
          status: getProductStatus(p.stock, p.min_stock),
          categoryName: p.product_categories?.name ?? "-",
        }))
      );

      const { data: historyData } = await supabase
        .from("inventory_history")
        .select("*, products(name)")
        .eq("business_id", businessId)
        .order("recorded_at", { ascending: false })
        .limit(20);

      setHistory((historyData ?? []) as InventoryHistory[]);
      setLoading(false);
    };
    load();
  }, []);

  const columns = [
    { key: "id", header: "ID Produk", render: (item: ProductRow) => item.id.slice(0, 8).toUpperCase() },
    { key: "name", header: "Produk" },
    { key: "categoryName", header: "Kategori" },
    { key: "stock", header: "Stok Saat Ini", render: (item: ProductRow) => <span className="font-bold">{item.stock}</span> },
    { key: "min_stock", header: "Stok Minimum", render: (item: ProductRow) => <span className="text-muted">{item.min_stock}</span> },
    {
      key: "status",
      header: "Status",
      render: (item: ProductRow) => (
        <Badge variant={item.status === "Available" ? "success" : item.status === "Low Stock" ? "warning" : "critical"}>
          {item.status}
        </Badge>
      )
    },
  ];

  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.status === "Low Stock").length;
  const outOfStock = products.filter((p) => p.status === "Out of Stock").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Inventori</h1>
        <p className="text-muted text-sm mt-1">Pantau dan kelola stok produk Anda.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Produk" value={totalProducts} />
        <MetricCard title="Stok Rendah" value={lowStock} className="border-warning/50 bg-orange-50/30" />
        <MetricCard title="Stok Habis" value={outOfStock} className="border-critical/50 bg-red-50/30" />
        <MetricCard title="Perlu Restock" value={lowStock + outOfStock} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {loading ? (
            <p className="text-muted text-sm">Memuat inventori...</p>
          ) : (
            <DataTable data={products} columns={columns} />
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Histori Inventori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {history.length === 0 && (
                  <p className="text-sm text-muted">Belum ada histori inventori.</p>
                )}
                {history.map((entry) => (
                  <div key={entry.id} className="flex gap-4 relative">
                    <div className="absolute left-[5px] top-6 bottom-[-1.5rem] w-px bg-gray-200 last:hidden"></div>
                    <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 z-10 ${entry.quantity_changed > 0 ? 'bg-success' : 'bg-primary'}`}></div>
                    <div>
                      <p className="text-sm font-medium capitalize">{entry.change_type}: {(entry.products as unknown as { name?: string })?.name ?? "-"}</p>
                      <p className="text-xs text-muted">{new Date(entry.recorded_at).toLocaleString("id-ID")}</p>
                      <p className={`text-sm font-bold mt-1 ${entry.quantity_changed > 0 ? 'text-success' : 'text-foreground'}`}>
                        {entry.quantity_changed > 0 ? '+' : ''}{entry.quantity_changed}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}