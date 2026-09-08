'use client'

import { useState } from 'react'
import type { Cabinet, CabinetSlot } from '@/types'
import { cn } from '@/lib/utils'

const stateStyle: Record<CabinetSlot['state'], string> = {
  empty: 'border-white/8 bg-white/[0.03]',
  occupied: 'border-lime/40 bg-lime/25',
  alert: 'border-danger/50 bg-danger/25',
}

export function CabinetSlotGrid({ cabinet }: { cabinet: Cabinet }) {
  const [selected, setSelected] = useState<CabinetSlot | null>(null)

  return (
    <div>
      <div className="rounded-2xl border border-white/8 bg-card p-4">
        {/* column headers */}
        <div
          className="mb-2 grid gap-2 pl-6"
          style={{ gridTemplateColumns: `repeat(${cabinet.cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cabinet.cols }).map((_, i) => (
            <span key={i} className="text-center text-[11px] text-muted-foreground">
              {i + 1}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {cabinet.rows.map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-4 text-[11px] text-muted-foreground">{row}</span>
              <div
                className="grid flex-1 gap-2"
                style={{ gridTemplateColumns: `repeat(${cabinet.cols}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: cabinet.cols }).map((_, col) => {
                  const slot = cabinet.slots.find(
                    (s) => s.row === row && s.col === col + 1,
                  ) ?? { row, col: col + 1, state: 'empty' as const }
                  const isSelected =
                    selected?.row === slot.row && selected?.col === slot.col
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelected(slot)}
                      aria-label={`Slot ${row}${col + 1}, ${slot.state}`}
                      className={cn(
                        'flex aspect-square items-center justify-center rounded-lg border transition-transform active:scale-95',
                        stateStyle[slot.state],
                        isSelected && 'ring-2 ring-white/60',
                      )}
                    >
                      {slot.state !== 'empty' && (
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            slot.state === 'occupied' ? 'bg-lime' : 'bg-danger',
                          )}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <Legend className="bg-white/[0.06] border-white/10" label="Empty" />
        <Legend className="bg-lime/25 border-lime/40" label="Occupied" />
        <Legend className="bg-danger/25 border-danger/50" label="Alert" />
      </div>

      {selected && (
        <p className="mt-3 rounded-xl border border-white/8 bg-card px-3 py-2 text-center text-xs">
          Slot <span className="font-mono font-semibold">{selected.row}{selected.col}</span>
          {' — '}
          <span
            className={cn(
              'font-medium',
              selected.state === 'occupied'
                ? 'text-lime'
                : selected.state === 'alert'
                  ? 'text-danger'
                  : 'text-muted-foreground',
            )}
          >
            {selected.state === 'empty'
              ? 'Available'
              : selected.state === 'occupied'
                ? 'Occupied'
                : 'Needs attention'}
          </span>
        </p>
      )}
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('size-3 rounded-md border', className)} />
      {label}
    </span>
  )
}
