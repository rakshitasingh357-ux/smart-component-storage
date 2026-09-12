'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Flame, Droplets, Clock, Cpu } from 'lucide-react'
import { fetchApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface SmartLogicAlert {
  batchId?: string
  partNumber?: string
  alertType?: string
  severity: string
  message: string
  recommendation: string
  timestamp?: string
}

interface SmartLogicData {
  batchId?: string
  partNumber?: string
  manufacturer?: string
  category?: string
  cabinetLocation?: string
  quantity?: number
  lifecycle?: {
    batchId?: string
    partNumber?: string
    storedDays?: number
    remainingDays?: number
    status?: string
  }
  idle?: {
    batchId?: string
    partNumber?: string
    idleDays?: number
    idleLimit?: number
    isIdle?: boolean
  }
  environment?: {
    batchId?: string
    partNumber?: string
    currentTemperature?: number | null
    currentHumidity?: number | null
    temperatureSafe?: boolean
    humiditySafe?: boolean
    environmentSafe?: boolean
  }
  alerts?: SmartLogicAlert[]
}

interface SmartLogicCardProps {
  componentId: string | number
}

export function SmartLogicCard({ componentId }: SmartLogicCardProps) {
  const [data, setData] = useState<SmartLogicData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!componentId) return

    let isMounted = true
    setLoading(true)
    setError(null)

    fetchApi<SmartLogicData>(`/smart-logic/component/${componentId}`)
      .then((res) => {
        if (isMounted) {
          setData(res)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Failed to fetch Smart Logic data')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [componentId])

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="size-4 animate-spin rounded-full border-2 border-lime border-t-transparent" />
          <p className="text-sm text-muted-foreground">Running Smart Logic diagnostics...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-card p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Cpu className="size-4 text-muted-foreground" />
          <p className="text-xs">Smart Logic telemetry awaiting active backend connection.</p>
        </div>
      </div>
    )
  }

  const isSafe = data.environment?.environmentSafe ?? true
  const alerts = data.alerts ?? []

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-lime" />
          <h3 className="text-xs font-semibold tracking-wider text-foreground uppercase">
            Smart Logic Analysis
          </h3>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
            isSafe
              ? 'border border-lime/40 bg-lime/15 text-lime'
              : 'border border-rose-500/40 bg-rose-500/15 text-rose-400'
          )}
        >
          {isSafe ? (
            <>
              <CheckCircle2 className="size-3" /> Environment Safe
            </>
          ) : (
            <>
              <AlertTriangle className="size-3" /> Breach Detected
            </>
          )}
        </span>
      </div>

      {/* 4 Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Lifecycle */}
        <div className="rounded-xl border border-white/5 bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3 text-lime" />
            <span>Lifecycle</span>
          </div>
          <p className="mt-1 text-sm font-semibold capitalize text-foreground">
            {data.lifecycle?.status || 'Nominal'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {data.lifecycle?.remainingDays ?? '--'} days remaining
          </p>
        </div>

        {/* Idle Status */}
        <div className="rounded-xl border border-white/5 bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3 text-amber-400" />
            <span>Idle State</span>
          </div>
          <p className="mt-1 text-sm font-semibold capitalize text-foreground">
            {data.idle?.isIdle ? 'Idle Flagged' : 'Active'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {data.idle?.idleDays ?? 0} days unaccessed
          </p>
        </div>

        {/* Temperature */}
        <div className="rounded-xl border border-white/5 bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="size-3 text-rose-400" />
            <span>Storage Temp</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {data.environment?.currentTemperature != null
              ? `${data.environment.currentTemperature}°C`
              : '--'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {data.environment?.temperatureSafe ? 'Within limits' : 'Out of range'}
          </p>
        </div>

        {/* Humidity */}
        <div className="rounded-xl border border-white/5 bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Droplets className="size-3 text-blue" />
            <span>Humidity</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {data.environment?.currentHumidity != null
              ? `${data.environment.currentHumidity}% RH`
              : '--'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {data.environment?.humiditySafe ? 'Optimal' : 'Exceeded'}
          </p>
        </div>
      </div>

      {/* Alerts & Recommendations */}
      {alerts.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Active Recommendations
          </p>
          {alerts.map((alert, index) => {
            const isCritical =
              alert.severity?.toLowerCase() === 'critical' ||
              alert.severity?.toLowerCase() === 'high'

            return (
              <div
                key={index}
                className={cn(
                  'rounded-xl border p-3 text-xs',
                  isCritical
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                )}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="capitalize">
                    {alert.alertType ? `${alert.alertType} · ` : ''}
                    {alert.severity} Priority
                  </span>
                </div>
                {alert.message && (
                  <p className="mt-1 font-normal text-white/90">{alert.message}</p>
                )}
                {alert.recommendation && (
                  <p className="mt-1">
                    <span className="font-semibold text-white">Action: </span>
                    {alert.recommendation}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}