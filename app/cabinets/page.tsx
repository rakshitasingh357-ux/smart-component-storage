'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { cabinets as initialCabinets } from '@/data/mock-data'
import { cn } from '@/lib/utils'
import { ScreenHeader } from '@/components/app-shell'
import { CabinetSlotGrid, SlotComponent } from '@/components/cabinet-slot-grid'

function CabinetsView() {
  const params = useSearchParams()
  const initial = params.get('cab')
  const initialIndex = Math.max(
    0,
    initialCabinets.findIndex((c) => c.id === initial),
  )

  // Track cabinet state locally so slot additions update immediately
  const [cabinetList, setCabinetList] = useState<any[]>(initialCabinets)
  const [index, setIndex] = useState(initialIndex)
  const cabinet = cabinetList[index] || initialCabinets[0]

  const metrics = [
    { label: 'Temp', value: `${cabinet?.temperature ?? '--'}°C`, tone: 'text-blue' },
    { label: 'Humidity', value: `${cabinet?.humidity ?? '--'}%`, tone: 'text-purple' },
    { label: 'Utilization', value: `${cabinet?.utilization ?? '--'}%`, tone: 'text-lime' },
  ]

  // Handler to assign component to slot & persist to inventory
  const handleAddComponent = async (slotId: string, newComponent: SlotComponent) => {
    const cleanSlotId = slotId.replace(/^ROW-/, '').trim()
    const rowLetter = cleanSlotId.charAt(0)

    setCabinetList((prev) => {
      const updated = [...prev]
      const currentCab = { ...updated[index] }

      // Clone rows and slots
      if (Array.isArray(currentCab.rows)) {
        currentCab.rows = currentCab.rows.map((row: any) => {
          const rowId = String(row.id || '').replace(/^ROW-/, '').trim()
          if (rowId === rowLetter && Array.isArray(row.slots)) {
            return {
              ...row,
              slots: row.slots.map((s: any) => {
                const sId = String(s.id || '').replace(/^ROW-/, '').trim()
                if (sId === cleanSlotId) {
                  return {
                    ...s,
                    component: {
                      ...newComponent,
                      id: `comp-${Date.now()}`,
                    },
                  }
                }
                return s
              }),
            }
          }
          return row
        })
      }

      // Increment cabinet component count
      currentCab.componentCount = (currentCab.componentCount || 0) + 1
      updated[index] = currentCab
      return updated
    })

    // Optional: Sync with FastAPI backend
    try {
      await fetch('http://localhost:8000/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cabinet_id: cabinet.id,
          slot_id: slotId,
          name: newComponent.name,
          part_number: newComponent.partNumber,
          quantity: newComponent.quantity,
          batch: newComponent.batch,
        }),
      })
    } catch {
      // Backend not running or endpoint pending; local state remains updated
    }
  }

  return (
    <div className="pb-6">
      <ScreenHeader title="Smart Cabinets" />

      <div className="flex gap-2 px-5">
        {cabinetList.map((c, i) => (
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
                {cabinet.id} · {cabinet.componentCount ?? 0} components
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

      {/* Grid section with duplicate title removed */}
      <section className="mt-5 px-5">
        <CabinetSlotGrid
          cabinet={cabinet}
          onAddComponent={handleAddComponent}
        />
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