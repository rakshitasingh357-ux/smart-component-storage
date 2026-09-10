'use client'

import { useMemo, useState } from 'react'
import { CheckCheck } from 'lucide-react'
import { alerts as initialAlerts } from '@/data/mock-data'
import type { Alert, AlertLevel } from '@/types'
import { cn } from '@/lib/utils'
import { ScreenHeader } from '@/components/app-shell'
import { AlertItem } from '@/components/alert-item'

type Filter = 'all' | AlertLevel

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'warning', label: 'Warning' },
  { id: 'info', label: 'Info' },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? alerts : alerts.filter((a) => a.level === filter)),
    [alerts, filter],
  )
  const unread = alerts.filter((a) => !a.read).length

  function toggleRead(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: !a.read } : a)),
    )
  }

  function markAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
  }

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Alerts"
        action={
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-card px-3 py-2 text-xs font-medium"
          >
            <CheckCheck className="size-4" /> Mark all
          </button>
        }
      />

      <p className="px-5 text-xs text-muted-foreground">
        {unread} unread of {alerts.length} alerts
      </p>

      <div className="mt-3 flex gap-2 px-5">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
              filter === f.id
                ? 'border-lime/40 bg-lime/15 text-lime'
                : 'border-white/10 bg-card text-muted-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 px-5">
        {filtered.map((a) => (
          <AlertItem key={a.id} alert={a} onToggleRead={toggleRead} />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-white/8 bg-card p-6 text-center text-sm text-muted-foreground">
            No alerts in this category.
          </p>
        )}
      </div>
    </div>
  )
}
