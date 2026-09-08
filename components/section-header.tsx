import Link from 'next/link'

export function SectionHeader({
  title,
  actionLabel,
  actionHref,
  actionColor = 'text-lime',
}: {
  title: string
  actionLabel?: string
  actionHref?: string
  actionColor?: string
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold tracking-wide text-foreground">{title}</h2>
      {actionLabel && actionHref && (
        <Link href={actionHref} className={`text-xs font-medium ${actionColor}`}>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
