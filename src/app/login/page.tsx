"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { TrendingUp } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // DEBUG (sementara): verifikasi nilai yang dikirim saat login gagal.
    // Password TIDAK dicetak mentah demi keamanan; hanya panjang & karakter awal/akhir.
    // Hapus baris ini setelah selesai debugging.
    console.log(
      "[login] attempt -> email:",
      JSON.stringify(email.trim().toLowerCase()),
      "| password (masked):",
      `len=${password.length} first=${password.charAt(0)} last=${password.charAt(password.length - 1)}`
    );

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    // DEBUG (sementara): pastikan session dibuat & cookie auth tersimpan oleh
    // @supabase/ssr (createBrowserClient). Hapus setelah debugging selesai.
    if (data?.session) {
      console.log(
        "[login] session OK ->",
        data.session.user.email,
        "| expires_at:",
        new Date((data.session.expires_at ?? 0) * 1000).toISOString()
      );
      console.log(
        "[login] cookie auth:",
        document.cookie
          .split(";")
          .filter((c) => c.trim().startsWith("sb-") && c.includes("auth-token"))
          .map((c) => c.trim().split("=")[0])
      );
    } else {
      console.warn("[login] session TIDAK terbentuk setelah signInWithPassword");
    }

    setLoading(false);

    if (authError) {
      if (authError.code === "invalid_credentials" || authError.status === 400) {
        setError(
          "Email atau password tidak sesuai. Periksa kembali, atau gunakan tombol “Lupa password?” untuk memperbarui password Anda."
        );
      } else {
        setError(authError.message);
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center">Masuk ke Akun Anda</h1>
          <p className="text-muted text-sm mt-2 text-center">Masuk untuk melihat performa bisnis Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              placeholder="andi@kopisenja.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Password</label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Lupa password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-critical">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Masuk..." : "Masuk"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
