import { Zap, TriangleAlert, Info, type LucideIcon } from 'lucide-react'
import type { Alert, AlertLevel } from '@/types'
import { cn } from '@/lib/utils'

interface LevelStyle {
  icon: LucideIcon
  wrap: string
  iconBox: string
  title: string
}

const config: Record<AlertLevel, LevelStyle> = {
  critical: {
    icon: Zap,
    wrap: 'border-danger/30 bg-danger/[0.07]',
    iconBox: 'bg-danger/15 text-danger',
    title: 'text-danger',
  },
  warning: {
    icon: TriangleAlert,
    wrap: 'border-warning/25 bg-warning/[0.06]',
    iconBox: 'bg-warning/15 text-warning',
    title: 'text-warning',
  },
  info: {
    icon: Info,
    wrap: 'border-blue/25 bg-blue/[0.06]',
    iconBox: 'bg-blue/15 text-blue',
    title: 'text-blue',
  },
}

export function AlertItem({
  alert,
  onToggleRead,
}: {
  alert: Alert
  onToggleRead?: (id: string) => void
}) {
  const style = config[alert.level]
  const Icon = style.icon

  return (
    <div className={cn('flex items-start gap-3 rounded-2xl border p-3', style.wrap)}>
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
          style.iconBox,
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm font-semibold', style.title)}>{alert.title}</p>
          {!alert.read && <span className="size-1.5 rounded-full bg-current opacity-70" />}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{alert.message}</p>
        <p className="mt-1 text-[10px] text-muted-foreground/70">{alert.timeAgo}</p>
      </div>
      {onToggleRead && (
        <button
          type="button"
          onClick={() => onToggleRead(alert.id)}
          className={cn(
            'shrink-0 rounded-lg border px-2 py-1 text-[10px] font-medium transition-colors',
            alert.read
              ? 'border-white/10 text-muted-foreground'
              : 'border-lime/30 bg-lime/10 text-lime',
          )}
        >
          {alert.read ? 'Read' : 'Mark read'}
        </button>
      )}
    </div>
  )
}
