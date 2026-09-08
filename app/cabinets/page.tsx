'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { cabinets } from '@/data/mock-data'
import { cn } from '@/lib/utils'
import { ScreenHeader } from '@/components/app-shell'
import { CabinetSlotGrid } from '@/components/cabinet-slot-grid'

function CabinetsView() {
  const params = useSearchParams()
  const initial = params.get('cab')
  const initialIndex = Math.max(
    0,
    cabinets.findIndex((c) => c.id === initial),
  )
  const [index, setIndex] = useState(initialIndex)
  const cabinet = cabinets[index]

  const metrics = [
    { label: 'Temp', value: `${cabinet.temperature}°C`, tone: 'text-blue' },
    { label: 'Humidity', value: `${cabinet.humidity}%`, tone: 'text-purple' },
    { label: 'Utilization', value: `${cabinet.utilization}%`, tone: 'text-lime' },
  ]

  return (
    <div className="pb-6">
      <ScreenHeader title="Smart Cabinets" />

      <div className="flex gap-2 px-5">
        {cabinets.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              'flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors',
              i === index
                ? 'border-lime/40 bg-lime/15 text-lime'
                : 'border-white/10 bg-card text-muted-foreground',
            )}
          >
            {c.id}
          </button>
        ))}
      </div>

      <section className="mt-4 px-5">
        <div className="rounded-2xl border border-white/8 bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">{cabinet.name}</h2>
              <p className="text-xs text-muted-foreground">
                {cabinet.id} · {cabinet.componentCount} components
              </p>
            </div>
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                cabinet.status === 'online'
                  ? 'border-lime/30 bg-lime/10 text-lime'
                  : 'border-white/10 text-muted-foreground',
              )}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {cabinet.status === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-xl bg-white/[0.03] p-2 text-center">
                <p className="text-[11px] text-muted-foreground">{m.label}</p>
                <p className={cn('mt-1 text-lg font-bold', m.tone)}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 px-5">
        <h3 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground">
          SLOT GRID
        </h3>
        <CabinetSlotGrid cabinet={cabinet} />
      </section>
    </div>
  )
}

export default function CabinetsPage() {
  return (
    <Suspense fallback={<div className="px-5 py-10 text-sm text-muted-foreground">Loading…</div>}>
      <CabinetsView />
    </Suspense>
  )
}
