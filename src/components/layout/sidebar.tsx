"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  BarChart3, 
  TrendingUp, 
  Lightbulb, 
  Archive, 
  Settings,
  Bell,
  UserCircle2,
  type LucideIcon,
} from "@/components/ui/icons"

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Produk", href: "/products", icon: Package },
  { title: "Transaksi", href: "/transactions", icon: Receipt },
  { title: "Inventori", href: "/inventory", icon: Archive },
  { title: "Profil", href: "/profile", icon: UserCircle2 },
  { title: "Notifikasi", href: "/notifications", icon: Bell },
]

const insightItems: NavItem[] = [
  { title: "Analitik", href: "/analytics", icon: BarChart3 },
  { title: "AI Forecast", href: "/forecast", icon: TrendingUp },
  { title: "Rekomendasi", href: "/recommendations", icon: Lightbulb },
]

export function Sidebar() {
  const pathname = usePathname()

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive ? "bg-primary text-white" : "text-muted hover:bg-gray-100 hover:text-foreground"
        )}
      >
        <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted")} />
        {item.title}
      </Link>
    )
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-gray-200 bg-surface h-screen fixed left-0 top-0">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-lg text-primary">Smart Advisor</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bisnis</p>
          <nav className="space-y-1">
            {navItems.map((item) => <NavLink key={item.href} item={item} />)}
          </nav>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Insight</p>
          <nav className="space-y-1">
            {insightItems.map((item) => <NavLink key={item.href} item={item} />)}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/settings" ? "bg-primary text-white" : "text-muted hover:bg-gray-100 hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          Pengaturan
        </Link>
      </div>
    </aside>
  )
}
