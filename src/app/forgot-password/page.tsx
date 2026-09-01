"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle, TrendingUp } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center">Lupa Password?</h1>
          <p className="text-muted text-sm mt-2 text-center">
            Masukkan email akun Anda untuk mendapatkan instruksi pemulihan.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-5 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-success" />
            <p className="text-sm text-muted">
              Jika email tersebut terdaftar, instruksi reset password akan dikirimkan ke email Anda.
            </p>
            <Link href="/login" className="block text-sm text-primary hover:underline">
              Kembali ke login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="recovery-email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(error)}
              />
              {error && <p className="mt-1 text-sm text-critical">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Instruksi"}
            </Button>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
