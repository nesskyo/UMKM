"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CheckCircle, TrendingUp } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password harus terdiri dari minimal 6 karakter.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setCompleted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center">Buat Password Baru</h1>
          <p className="text-muted text-sm mt-2 text-center">
            Gunakan password baru untuk mengamankan akun Anda.
          </p>
        </div>

        {completed ? (
          <div className="space-y-5 text-center">
            <CheckCircle className="mx-auto h-10 w-10 text-success" />
            <p className="text-sm text-muted">
              Password berhasil diperbarui. Silakan login dengan password baru Anda.
            </p>
            <Link href="/login">
              <Button className="w-full">Kembali ke Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium mb-1">
                Password baru
              </label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                Konfirmasi password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-critical">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
