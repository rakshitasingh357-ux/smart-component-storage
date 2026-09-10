'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCheck, RefreshCw } from 'lucide-react'
import { alerts as initialAlerts } from '@/data/mock-data'
import { fetchApi } from '@/lib/api'
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
  const [loading, setLoading] = useState<boolean>(true)

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const data = await fetchApi<Alert[]>('/alerts')
      if (Array.isArray(data) && data.length > 0) {
        setAlerts(data)
      } else {
        setAlerts(initialAlerts)
      }
    } catch {
      setAlerts(initialAlerts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const filtered = useMemo(
    () => (filter === 'all' ? alerts : alerts.filter((a) => a.level === filter)),
    [alerts, filter]
  )
  const unread = alerts.filter((a) => !Boolean(a.read)).length

  async function toggleRead(id: string) {
    const target = alerts.find((a) => a.id === id)
    const nextRead = target ? !target.read : true

    // Optimistic UI update
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: nextRead } : a))
    )

    try {
      await fetchApi(`/alerts/${id}/read`, {
        method: 'PATCH',
        body: JSON.stringify({ read: nextRead }),
      })
    } catch {
      // Keep local optimistic state even if endpoint is mocked
    }
  }

  async function markAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))

    try {
      await fetchApi('/alerts/mark-all-read', {
        method: 'POST',
      })
    } catch {
      // Keep local state intact
    }
  }

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Alerts"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAlerts}
              disabled={loading}
              className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-card text-muted-foreground transition active:scale-95 disabled:opacity-50"
              title="Refresh alerts"
            >
              <RefreshCw className={cn('size-4', loading && 'animate-spin text-lime')} />
            </button>
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-card px-3 py-2 text-xs font-medium transition active:scale-95"
            >
              <CheckCheck className="size-4 text-lime" /> Mark all
            </button>
          </div>
        }
      />

      <div className="flex items-center justify-between px-5">
        <p className="text-xs text-muted-foreground">
          {unread} unread of {alerts.length} alerts
        </p>
        {loading && (
          <span className="text-[11px] text-lime">Syncing telemetry alerts...</span>
        )}
      </div>

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
                : 'border-white/10 bg-card text-muted-foreground'
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