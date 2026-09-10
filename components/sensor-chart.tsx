import type { SensorReading } from '@/types'

/**
 * Lightweight SVG line chart with a soft glow + gradient fill.
 * No chart dependency needed for these small trend sparklines.
 */
export function SensorChart({
  data,
  color = 'var(--blue)',
  height = 120,
}: {
  data: SensorReading[]
  color?: string
  height?: number
}) {
  const width = 320
  const padX = 8
  const padY = 16
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (width - padX * 2)
    const y = padY + (1 - (d.value - min) / range) * (height - padY * 2)
    return { x, y }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`

  const gradientId = `grad-${color.replace(/[^a-z]/gi, '')}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Sensor trend chart"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  )
}

export function ChartAxis({ data }: { data: SensorReading[] }) {
  return (
    <div className="mt-2 flex justify-between px-1 text-[10px] text-muted-foreground">
      {data
        .filter((d) => d.label)
        .map((d, i) => (
          <span key={`${d.label}-${i}`}>{d.label}</span>
        ))}
    </div>
  )
}
