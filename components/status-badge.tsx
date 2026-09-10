import type { StockStatus } from '@/types'
import { stockStatusLabel } from '@/lib/inventory'
import { cn } from '@/lib/utils'

const styles: Record<StockStatus, string> = {
  'in-stock': 'border-lime/30 bg-lime/10 text-lime',
  'low-stock': 'border-warning/30 bg-warning/10 text-warning',
  'out-of-stock': 'border-danger/40 bg-danger/10 text-danger',
}

export function StatusBadge({
  status,
  className,
}: {
  status: StockStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium',
        styles[status],
        className,
      )}
    >
      {stockStatusLabel[status]}
    </span>
  )
}
