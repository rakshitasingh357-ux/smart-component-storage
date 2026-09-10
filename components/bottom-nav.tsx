'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, PackageSearch, Grid3x3, MapPin, User, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  match: (path: string) => boolean
}

const items: NavItem[] = [
  { href: '/', label: 'Home', icon: LayoutGrid, match: (p) => p === '/' },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: PackageSearch,
    match: (p) => p.startsWith('/inventory'),
  },
  {
    href: '/cabinets',
    label: 'Cabinet',
    icon: Grid3x3,
    match: (p) => p.startsWith('/cabinets'),
  },
  {
    href: '/environment',
    label: 'Environ.',
    icon: MapPin,
    match: (p) => p.startsWith('/environment'),
  },
  { href: '/profile', label: 'Profile', icon: User, match: (p) => p.startsWith('/profile') },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-20 border-t border-white/10 bg-background/85 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="flex items-stretch justify-between">
        {items.map((item) => {
          const active = item.match(pathname)
          const Icon = item.icon
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className="flex flex-col items-center gap-1 py-2.5"
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-xl transition-colors',
                    active ? 'bg-lime/15 text-lime glow-lime' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="size-5" strokeWidth={2} />
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    active ? 'text-lime' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
