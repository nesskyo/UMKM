export interface Transaction {
  id: string;
  product: string;
  time: string;
  date: string;
  productCount: number;
  total: number;
  payment: string;
  status: string;
}

const TIME_BUCKETS = [
  { label: "pagi", start: 5, end: 12 },
  { label: "siang", start: 12, end: 17 },
  { label: "sore", start: 17, end: 19 },
  { label: "malam", start: 19, end: 24 },
];

export type SalesInsight = {
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  action: string;
};

function getTimeBucket(time: string) {
  const hour = Number.parseInt(time.split(":")[0], 10);
  return TIME_BUCKETS.find((bucket) => hour >= bucket.start && hour < bucket.end);
}

export function createSalesInsight(sales: Transaction[]): SalesInsight {
  const patterns = new Map<string, { product: string; bucket: string; count: number }>();

  sales.forEach((transaction) => {
    const bucket = getTimeBucket(transaction.time);
    if (!bucket || !transaction.product) return;

    const key = `${transaction.product}:${bucket.label}`;
    const current = patterns.get(key);
    patterns.set(key, {
      product: transaction.product,
      bucket: bucket.label,
      count: (current?.count ?? 0) + transaction.productCount,
    });
  });

  const strongestPattern = [...patterns.values()].sort((a, b) => b.count - a.count)[0];

  if (!strongestPattern || strongestPattern.count < 3) {
    return {
      title: "Belum cukup data untuk saran waktu penjualan",
      description: "Tambahkan lebih banyak transaksi dengan detail produk dan waktu agar pola penjualan dapat dianalisis dengan lebih akurat.",
      priority: "LOW",
      action: "Catat Transaksi",
    };
  }

  return {
    title: `Waktu terbaik untuk ${strongestPattern.product}`,
    description: `Berdasarkan data transaksi yang tersedia, ${strongestPattern.product} lebih sering terjual pada ${strongestPattern.bucket}. Pertimbangkan menyiapkan stok lebih banyak pada waktu tersebut.`,
    priority: "MEDIUM",
    action: "Lihat Data Penjualan",
  };
}