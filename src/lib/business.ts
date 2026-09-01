import { supabase } from "@/lib/supabaseClient";

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getCurrentBusinessId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("created_by", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  return data?.id ?? null;
}