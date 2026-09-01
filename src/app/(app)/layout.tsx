import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AIAssistant } from "@/components/ai/ai-assistant";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      <div id="app-custom-background" aria-hidden="true" />
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 w-full h-full relative z-10">
        <TopNavbar
          userName={profile?.full_name ?? user.email ?? "User"}
          businessName={business?.name ?? "UMKM Saya"}
          avatarUrl={profile?.avatar_url ?? null}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
      <AIAssistant />
    </div>
  )
}