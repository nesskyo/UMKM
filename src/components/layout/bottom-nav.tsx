"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Receipt, Archive, UserCircle2, Bell } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Beranda", href: "/dashboard", icon: LayoutDashboard },
  { title: "Produk", href: "/products", icon: Package },
  { title: "Transaksi", href: "/transactions", icon: Receipt },
  { title: "Inventori", href: "/inventory", icon: Archive },
  { title: "Profil", href: "/profile", icon: UserCircle2 },
  { title: "Notif", href: "/notifications", icon: Bell },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted")} />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
