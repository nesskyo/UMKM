"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Bell, Search, Menu, X, LayoutDashboard, Package, Receipt, BarChart3, TrendingUp, Lightbulb, Archive, Settings, UserCircle2, LogOut } from "@/components/ui/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"

interface TopNavbarProps {
  userName: string
  businessName: string
  avatarUrl: string | null
}

export function TopNavbar({ userName, businessName, avatarUrl }: TopNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false);
      setUnreadCount(count ?? 0);
    };
    fetchUnreadCount();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Produk", href: "/products", icon: Package },
    { title: "Transaksi", href: "/transactions", icon: Receipt },
    { title: "Inventori", href: "/inventory", icon: Archive },
    { title: "Analitik", href: "/analytics", icon: BarChart3 },
    { title: "AI Forecast", href: "/forecast", icon: TrendingUp },
    { title: "Rekomendasi", href: "/recommendations", icon: Lightbulb },
    { title: "Profil", href: "/profile", icon: UserCircle2 },
    { title: "Notifikasi", href: "/notifications", icon: Bell },
    { title: "Pengaturan", href: "/settings", icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-surface px-4 lg:px-8">
      <div className="flex items-center gap-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Buka menu navigasi"
          aria-expanded={isMenuOpen}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-bold text-lg text-primary">Smart Advisor</span>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu navigasi">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Tutup menu navigasi"
          />
          <nav className="relative h-full w-72 max-w-[85vw] overflow-y-auto bg-surface p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-bold text-lg text-primary">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} aria-label="Tutup menu navigasi">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${pathname === item.href ? "bg-primary text-white" : "text-muted hover:bg-gray-100 hover:text-foreground"}`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                )
              })}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-critical hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5" />
                Keluar
              </button>
            </div>
          </nav>
        </div>
      )}

      <div className="hidden lg:flex items-center flex-1 max-w-md ml-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Cari transaksi, produk..."
            className="h-9 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <Link href="/notifications" className="relative" aria-label="Buka notifikasi">
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5 text-muted" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-critical text-[8px] text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>
        <div className="hidden sm:flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="text-right">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted">{businessName}</p>
          </div>
          <Avatar>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
            <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}