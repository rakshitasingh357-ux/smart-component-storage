import {
  Cpu,
  Wifi,
  Zap,
  CircuitBoard,
  Radio,
  Activity,
  Gauge,
  type LucideIcon,
} from 'lucide-react'
import type { ComponentCategory } from '@/types'
import { cn } from '@/lib/utils'

const iconMap: Record<ComponentCategory, LucideIcon> = {
  Microcontrollers: Cpu,
  'Wireless Modules': Wifi,
  'Voltage Regulators': Zap,
  Capacitors: CircuitBoard,
  Transistors: Radio,
  Resistors: Activity,
  Sensors: Gauge,
}

export function CategoryIcon({
  category,
  className,
  iconClassName,
}: {
  category: ComponentCategory
  className?: string
  iconClassName?: string
}) {
  const Icon = iconMap[category] ?? CircuitBoard
  const tinted = category === 'Voltage Regulators'

  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-xl border',
        tinted
          ? 'border-warning/30 bg-warning/10 text-warning'
          : 'border-white/10 bg-white/5 text-foreground',
        className,
      )}
    >
      <Icon className={cn('size-5', iconClassName)} strokeWidth={2} />
    </div>
  )
}
