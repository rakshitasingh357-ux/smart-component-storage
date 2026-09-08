"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Archive,
  Thermometer,
  CalendarClock,
  Bell,
  User,
  Settings,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    name: "Cabinets",
    href: "/cabinets",
    icon: Archive,
  },
  {
    name: "Environment",
    href: "/environment",
    icon: Thermometer,
  },
  {
    name: "Expiry",
    href: "/expiry",
    icon: CalendarClock,
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: Bell,
  },
]

const bottomNavigation = [
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-white/10 bg-card p-4">
      
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold">
          Smart Storage
        </h1>

        <p className="text-sm text-muted-foreground">
          Component Manager
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 transition ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
        {bottomNavigation.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 transition ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>

    </aside>
  )
}