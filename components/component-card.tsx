import Link from 'next/link'
import type { Component } from '@/types'
import { getStockStatus } from '@/lib/inventory'
import { cn } from '@/lib/utils'
import { CategoryIcon } from '@/components/category-icon'
import { StatusBadge } from '@/components/status-badge'

const qtyColor = {
  'in-stock': 'text-foreground',
  'low-stock': 'text-warning',
  'out-of-stock': 'text-danger',
} as const

export function ComponentCard({ component }: { component: Component }) {
  const status = getStockStatus(component)

  return (
    <Link
      href={`/inventory/${component.id}`}
      className={cn(
        'flex items-center gap-3 rounded-2xl border p-3 transition-colors',
        status === 'out-of-stock'
          ? 'border-danger/30 bg-danger/[0.06]'
          : 'border-white/8 bg-card hover:border-white/15',
      )}
    >
      <CategoryIcon category={component.category} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{component.name}</p>
        <p className="truncate text-xs text-muted-foreground">{component.category}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {component.cabinetId}/{component.slot}
          </span>
          <span className="text-[10px] text-muted-foreground">{component.updatedAgo}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className={cn('text-xl font-bold tabular-nums', qtyColor[status])}>
          {component.quantity}
        </span>
        <StatusBadge status={status} />
      </div>
    </Link>
  )
}
