import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { data, error } = await supabase.auth.signInWithPassword({
  email: "siti@warungbusiti.com",
  password: "WarungSiti2024!",
});
if (error || !data.session) {
  console.error("LOGIN FAILED:", error?.message ?? "no session");
  process.exit(1);
}
const uid = data.session.user.id;
console.log("USER ID:", uid);
console.log("EMAIL:", data.session.user.email);

const { data: profile } = await supabase.from("profiles").select("*").eq("id", uid).single();
console.log("PROFILE:", profile);

const { data: businesses } = await supabase.from("businesses").select("id,name,type,created_at").eq("created_by", uid).order("created_at", { ascending: true });
console.log("BUSINESSES:", businesses?.length ?? 0);

for (const b of businesses ?? []) {
  const t = await supabase.from("transactions").select("id", { count: "estimated" }).eq("business_id", b.id).limit(1);
  const p = await supabase.from("products").select("id", { count: "estimated" }).eq("business_id", b.id).limit(1);
  const n = await supabase.from("notifications").select("id", { count: "estimated" }).eq("business_id", b.id).limit(1);
  const ih = await supabase.from("inventory_history").select("id", { count: "estimated" }).eq("business_id", b.id).limit(1);
  console.log(` biz ${b.id} name=${b.name} | txs=${t.count} products=${p.count} notif=${n.count} inv=${ih.count}`);
}

const { count: cats } = await supabase.from("product_categories").select("id", { count: "exact" }).limit(100);
console.log("CATEGORIES total:", cats);