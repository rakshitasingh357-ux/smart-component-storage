'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Clock } from 'lucide-react'

import { components } from '@/data/mock-data'
import { getStockStatus } from '@/lib/inventory'
import type { ComponentCategory } from '@/types'
import { cn } from '@/lib/utils'

import { ScreenHeader } from '@/components/app-shell'
import { ComponentCard } from '@/components/component-card'

type StockFilter = 'all' | 'in-stock' | 'low-out'

const stockFilters: { id: StockFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in-stock', label: 'In Stock' },
  { id: 'low-out', label: 'Low/Out' },
]

export default function InventoryPage() {
  const [query, setQuery] = useState('')
  const [stock, setStock] = useState<StockFilter>('all')
  const [category, setCategory] =
    useState<ComponentCategory | 'all'>('all')

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(components.map((c) => c.category))
    )

    return ['all', ...unique] as (
      | ComponentCategory
      | 'all'
    )[]
  }, [])

  const filtered = useMemo(() => {
    return components.filter((c) => {
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())

      const matchesCategory =
        category === 'all' || c.category === category

      const status = getStockStatus(c)

      const matchesStock =
        stock === 'all' ||
        (stock === 'in-stock' &&
          status === 'in-stock') ||
        (stock === 'low-out' &&
          status !== 'in-stock')

      return (
        matchesQuery &&
        matchesCategory &&
        matchesStock
      )
    })
  }, [query, stock, category])

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Inventory"
        action={
          <Link
            href="/inventory/add"
            className="flex size-10 items-center justify-center rounded-xl bg-lime text-lime-foreground glow-lime"
            aria-label="Add component"
          >
            <Plus
              className="size-5"
              strokeWidth={2.5}
            />
          </Link>
        }
      />

      <div className="px-5">
        <Link
          href="/expiry"
          className="mb-4 flex items-center justify-between rounded-2xl border border-lime/30 bg-lime/10 p-4 transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-lime/20 text-lime">
              <Clock className="size-5" />
            </div>

            <div>
              <h2 className="font-semibold text-foreground">
                Expiry Tracker
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Track shelf life and expiry dates
              </p>
            </div>
          </div>

          <span className="text-lg text-lime">
            →
          </span>
        </Link>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-card px-4 py-3">
          <Search className="size-4 text-muted-foreground" />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search components..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 px-5">
        {stockFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStock(f.id)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
              stock === f.id
                ? 'border-lime/40 bg-lime/15 text-lime'
                : 'border-white/10 bg-card text-muted-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
              category === c
                ? 'border-blue/40 bg-blue/15 text-blue'
                : 'border-white/10 bg-card text-muted-foreground'
            )}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      <p className="mt-4 px-5 text-xs text-muted-foreground">
        {filtered.length} items
      </p>

      <div className="mt-2 flex flex-col gap-3 px-5">
        {filtered.map((c) => (
          <ComponentCard
            key={c.id}
            component={c}
          />
        ))}

        {filtered.length === 0 && (
          <p className="rounded-2xl border border-white/8 bg-card p-6 text-center text-sm text-muted-foreground">
            No components match your filters.
          </p>
        )}
      </div>
    </div>
  )
}