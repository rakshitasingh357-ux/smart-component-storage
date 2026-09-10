'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { cabinets as initialCabinets } from '@/data/mock-data'
import { fetchApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { ScreenHeader } from '@/components/app-shell'
import { CabinetSlotGrid, SlotComponent } from '@/components/cabinet-slot-grid'

function CabinetsView() {
  const params = useSearchParams()
  const cabParam = params.get('cab')

  const [cabinetList, setCabinetList] = useState<any[]>(initialCabinets)
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  // Load cabinets from FastAPI backend
  const loadCabinets = async () => {
    setLoading(true)
    try {
      const data = await fetchApi<any[]>('/cabinets')
      if (Array.isArray(data) && data.length > 0) {
        setCabinetList(data)
      } else {
        setCabinetList(initialCabinets)
      }
    } catch {
      setCabinetList(initialCabinets)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCabinets()
  }, [])

  // Sync index whenever query parameter or cabinet list changes
  useEffect(() => {
    if (cabParam && cabinetList.length > 0) {
      const foundIdx = cabinetList.findIndex(
        (c) => c.id?.toLowerCase() === cabParam.toLowerCase()
      )
      if (foundIdx !== -1) {
        setIndex(foundIdx)
      }
    }
  }, [cabParam, cabinetList])

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

      currentCab.componentCount = (currentCab.componentCount || 0) + 1
      updated[index] = currentCab
      return updated
    })

    try {
      await fetchApi('/components', {
        method: 'POST',
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
      <ScreenHeader
        title="Smart Cabinets"
        action={
          <button
            type="button"
            onClick={loadCabinets}
            disabled={loading}
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-card text-muted-foreground transition active:scale-95 disabled:opacity-50"
            title="Refresh cabinets"
          >
            <RefreshCw className={cn('size-4', loading && 'animate-spin text-lime')} />
          </button>
        }
      />

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
                : 'border-white/10 bg-card text-muted-foreground'
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
              <h2 className="text-lg font-bold">{cabinet?.name ?? 'Cabinet'}</h2>
              <p className="text-xs text-muted-foreground">
                {cabinet?.id} · {cabinet?.componentCount ?? 0} components
              </p>
            </div>
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                cabinet?.status === 'online'
                  ? 'border-lime/30 bg-lime/10 text-lime'
                  : 'border-white/10 text-muted-foreground'
              )}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {cabinet?.status === 'online' ? 'Online' : 'Offline'}
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