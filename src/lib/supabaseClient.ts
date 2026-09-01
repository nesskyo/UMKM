import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

function clearLegacyAuthStorage(url: string) {
  try {
    if (typeof window === "undefined") return;
    const ref = new URL(url).hostname.split(".")[0];
    const prefix = `sb-${ref}-auth-token`;
    const storagePairs: [string, Storage][] = [
      ["localStorage", window.localStorage],
      ["sessionStorage", window.sessionStorage],
    ];
    for (const [, storage] of storagePairs) {
      try {
        for (let i = storage.length - 1; i >= 0; i--) {
          const key = storage.key(i);
          if (key && (key === prefix || key.startsWith(`${prefix}-`))) {
            storage.removeItem(key);
          }
        }
      } catch {}
    }
  } catch {}
}

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    !anonKey ||
    url === "your-supabase-url" ||
    anonKey === "your-supabase-anon-key"
  ) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local terlebih dahulu."
    );
  }

  if (typeof window !== "undefined") {
    clearLegacyAuthStorage(url);
  }

  _supabase = createBrowserClient(url, anonKey);
  return _supabase;
}

// Proxy lazy: client hanya dibuat saat pertama kali digunakan (di client),
// sehingga proses build/prerender dengan env placeholder tidak gagal.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as unknown as Record<PropertyKey, unknown>)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});