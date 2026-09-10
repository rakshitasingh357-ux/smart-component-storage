'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Flame, Droplets, Clock, Cpu } from 'lucide-react'
import { fetchApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface SmartLogicAlert {
  severity: 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
  message?: string
}

interface SmartLogicData {
  component_id: string
  lifecycle?: {
    status: string
    remaining_days: number
  }
  idle?: {
    status: string
    idle_days: number
  }
  environment?: {
    temperature: number
    humidity: number
    is_safe: boolean
  }
  alerts?: SmartLogicAlert[]
}

interface SmartLogicCardProps {
  componentId: string
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
          setError(err.message || 'Failed to fetch Smart Logic data')
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

  const isSafe = data.environment?.is_safe ?? true

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
            {data.lifecycle?.remaining_days ?? '--'} days remaining
          </p>
        </div>

        {/* Idle Status */}
        <div className="rounded-xl border border-white/5 bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3 text-amber-400" />
            <span>Idle State</span>
          </div>
          <p className="mt-1 text-sm font-semibold capitalize text-foreground">
            {data.idle?.status || 'Active'}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {data.idle?.idle_days ?? 0} days unaccessed
          </p>
        </div>

        {/* Temperature */}
        <div className="rounded-xl border border-white/5 bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="size-3 text-rose-400" />
            <span>Storage Temp</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {data.environment?.temperature != null ? `${data.environment.temperature}°C` : '--'}
          </p>
          <p className="text-[11px] text-muted-foreground">Ambient reading</p>
        </div>

        {/* Humidity */}
        <div className="rounded-xl border border-white/5 bg-background/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Droplets className="size-3 text-blue" />
            <span>Humidity</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {data.environment?.humidity != null ? `${data.environment.humidity}% RH` : '--'}
          </p>
          <p className="text-[11px] text-muted-foreground">Target &lt; 60%</p>
        </div>
      </div>

      {/* Alerts & Recommendations */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Active Recommendations
          </p>
          {data.alerts.map((alert, index) => (
            <div
              key={index}
              className={cn(
                'rounded-xl border p-3 text-xs',
                alert.severity === 'critical' || alert.severity === 'high'
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
              )}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="capitalize">{alert.severity} Priority</span>
              </div>
              {alert.message && <p className="mt-1 font-normal text-white/90">{alert.message}</p>}
              <p className="mt-1">
                <span className="font-semibold text-white">Action: </span>
                {alert.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}