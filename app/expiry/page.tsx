'use client'

import { useEffect, useState, useMemo } from 'react'
import { components as fallbackComponents } from '@/data/mock-data'
import { fetchApi } from '@/lib/api'
import type { Component } from '@/types'
import { ScreenHeader } from '@/components/app-shell'
import { RefreshCw, AlertOctagon, Clock, ShieldCheck, HelpCircle } from 'lucide-react'

function getExpiryStatus(expiryDate?: string) {
  if (!expiryDate) {
    return 'no-expiry'
  }

  const today = new Date()
  const expiry = new Date(expiryDate)

  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)

  const difference = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (difference < 0) {
    return 'expired'
  }

  if (difference <= 30) {
    return 'expiring-soon'
  }

  return 'safe'
}

export default function ExpiryPage() {
  const [componentsList, setComponentsList] = useState<Component[]>(fallbackComponents)
  const [loading, setLoading] = useState<boolean>(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchApi<Component[]>('/components')
      if (Array.isArray(data) && data.length > 0) {
        setComponentsList(data)
      } else {
        setComponentsList(fallbackComponents)
      }
    } catch {
      setComponentsList(fallbackComponents)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const expired = useMemo(
    () =>
      componentsList.filter(
        (c) => c.expiryDate && getExpiryStatus(c.expiryDate) === 'expired'
      ),
    [componentsList]
  )

  const expiringSoon = useMemo(
    () =>
      componentsList.filter(
        (c) => c.expiryDate && getExpiryStatus(c.expiryDate) === 'expiring-soon'
      ),
    [componentsList]
  )

  const safe = useMemo(
    () =>
      componentsList.filter(
        (c) => c.expiryDate && getExpiryStatus(c.expiryDate) === 'safe'
      ),
    [componentsList]
  )

  const noExpiry = useMemo(
    () => componentsList.filter((c) => !c.expiryDate),
    [componentsList]
  )

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Expiry Tracker"
        action={
          <button
            onClick={loadData}
            disabled={loading}
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-card text-muted-foreground transition active:scale-95 disabled:opacity-50"
            title="Refresh shelf life data"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin text-lime' : ''}`} />
          </button>
        }
      />

      <div className="space-y-6 px-5 pt-2">
        <div>
          <p className="text-sm text-muted-foreground">
            Real-time FEFO shelf-life telemetry and component risk audit
          </p>
        </div>

        {/* Expired Section */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <AlertOctagon className="size-4 text-rose-500" />
            <h2 className="text-sm font-bold tracking-wider text-rose-400 uppercase">
              Expired ({expired.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {expired.map((component) => (
              <div
                key={component.id}
                className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{component.name}</h3>
                    <p className="text-xs text-muted-foreground">{component.category}</p>
                  </div>
                  <span className="rounded-md border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 font-mono text-xs font-semibold text-rose-300">
                    Qty: {component.quantity}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-rose-400">
                  Expired on: {component.expiryDate}
                </p>
              </div>
            ))}

            {expired.length === 0 && (
              <p className="rounded-xl border border-white/5 bg-card/60 p-4 text-center text-xs text-muted-foreground">
                No expired components detected.
              </p>
            )}
          </div>
        </section>

        {/* Expiring Soon Section */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="size-4 text-amber-400" />
            <h2 className="text-sm font-bold tracking-wider text-amber-300 uppercase">
              Expiring Soon ({expiringSoon.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {expiringSoon.map((component) => (
              <div
                key={component.id}
                className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{component.name}</h3>
                    <p className="text-xs text-muted-foreground">{component.category}</p>
                  </div>
                  <span className="rounded-md border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 font-mono text-xs font-semibold text-amber-300">
                    Qty: {component.quantity}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-amber-300">
                  Target Expiry: {component.expiryDate}
                </p>
              </div>
            ))}

            {expiringSoon.length === 0 && (
              <p className="rounded-xl border border-white/5 bg-card/60 p-4 text-center text-xs text-muted-foreground">
                No components expiring in the next 30 days.
              </p>
            )}
          </div>
        </section>

        {/* Safe Section */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-lime" />
            <h2 className="text-sm font-bold tracking-wider text-lime uppercase">
              Safe & Valid ({safe.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {safe.map((component) => (
              <div
                key={component.id}
                className="rounded-2xl border border-white/10 bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{component.name}</h3>
                    <p className="text-xs text-muted-foreground">{component.category}</p>
                  </div>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs text-foreground">
                    Qty: {component.quantity}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Valid through: <span className="text-lime">{component.expiryDate}</span>
                </p>
              </div>
            ))}

            {safe.length === 0 && (
              <p className="rounded-xl border border-white/5 bg-card/60 p-4 text-center text-xs text-muted-foreground">
                No active components with assigned dates.
              </p>
            )}
          </div>
        </section>

        {/* No Expiry Date Section */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <HelpCircle className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
              Indefinite Shelf Life ({noExpiry.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {noExpiry.map((component) => (
              <div
                key={component.id}
                className="rounded-2xl border border-white/5 bg-card/40 p-4 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{component.name}</h3>
                    <p className="text-xs text-muted-foreground">{component.category}</p>
                  </div>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                    Qty: {component.quantity}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  No strict expiration date recorded
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}