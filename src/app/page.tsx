import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "@/components/ui/icons";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-primary">Smart Advisor</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Masuk</Link>
          <Link href="/register">
            <Button>Buat Akun</Button>
          </Link>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center text-center px-4 py-20 mt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-sm font-medium mb-6">
          <SparklesIcon className="w-4 h-4" /> UMKM Business Intelligence
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground max-w-4xl leading-tight">
          Data Penjualanmu.<br/><span className="text-primary">Keputusan Lebih Cerdas.</span>
        </h1>
        <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
          UMKM Smart Advisor membantu Anda memahami performa bisnis, memprediksi kebutuhan stok, dan mendapatkan rekomendasi bisnis berbasis AI.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">Mulai Sekarang</Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full">Masuk ke Akun</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

function SparklesIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
  )
}
