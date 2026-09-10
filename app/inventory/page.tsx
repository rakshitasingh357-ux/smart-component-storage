'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Clock, Download, ArrowUpDown, RefreshCw } from 'lucide-react'

import { components as fallbackComponents } from '@/data/mock-data'
import { getStockStatus } from '@/lib/inventory'
import { fetchApi, API_BASE_URL } from '@/lib/api'
import type { Component, ComponentCategory } from '@/types'
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
  const [componentsList, setComponentsList] = useState<Component[]>(fallbackComponents)
  const [loading, setLoading] = useState<boolean>(true)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [fefoActive, setFefoActive] = useState<boolean>(false)

  const [query, setQuery] = useState('')
  const [stock, setStock] = useState<StockFilter>('all')
  const [category, setCategory] = useState<ComponentCategory | 'all'>('all')

  // Load components from FastAPI backend
  const loadComponents = async () => {
    setLoading(true)
    try {
      const endpoint = fefoActive ? '/components?sort=fefo' : '/components'
      const data = await fetchApi<Component[]>(endpoint)
      if (Array.isArray(data) && data.length > 0) {
        setComponentsList(data)
      } else {
        setComponentsList(fallbackComponents)
      }
    } catch {
      // Graceful fallback to mock data if backend isn't reachable yet
      setComponentsList(fallbackComponents)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComponents()
  }, [fefoActive])

  // Handle Excel Export download
  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/components/export`, {
        method: 'GET',
      })
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `inventory-report-${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch {
      alert('Excel export endpoint is not reachable or completed yet on the backend.')
    } finally {
      setIsExporting(false)
    }
  }

  const categories = useMemo(() => {
    const unique = Array.from(new Set(componentsList.map((c) => c.category)))
    return ['all', ...unique] as (ComponentCategory | 'all')[]
  }, [componentsList])

  const filtered = useMemo(() => {
    let list = componentsList.filter((c) => {
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())

      const matchesCategory = category === 'all' || c.category === category
      const status = getStockStatus(c)

      const matchesStock =
        stock === 'all' ||
        (stock === 'in-stock' && status === 'in-stock') ||
        (stock === 'low-out' && status !== 'in-stock')

      return matchesQuery && matchesCategory && matchesStock
    })

    if (fefoActive) {
      list = [...list].sort((a, b) => {
        if (!a.expiryDate) return 1
        if (!b.expiryDate) return -1
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      })
    }

    return list
  }, [componentsList, query, stock, category, fefoActive])

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Inventory"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              aria-label="Export Excel"
              className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-card text-foreground transition active:scale-95 disabled:opacity-50"
              title="Export to Excel"
            >
              <Download className="size-4 text-lime" />
            </button>
            <Link
              href="/inventory/add"
              className="flex size-10 items-center justify-center rounded-xl bg-lime text-lime-foreground glow-lime transition active:scale-95"
              aria-label="Add component"
            >
              <Plus className="size-5" strokeWidth={2.5} />
            </Link>
          </div>
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
              <h2 className="font-semibold text-foreground">Expiry Tracker</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Track shelf life and expiry dates
              </p>
            </div>
          </div>

          <span className="text-lg text-lime">→</span>
        </Link>

        {/* Search input */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-card px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Primary sorting and stock filter row */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-5">
        <div className="flex gap-2">
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

        {/* FEFO Sort Button */}
        <button
          type="button"
          onClick={() => setFefoActive(!fefoActive)}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
            fefoActive
              ? 'border-amber-400/50 bg-amber-400/15 text-amber-300'
              : 'border-white/10 bg-card text-muted-foreground hover:text-foreground'
          )}
        >
          <ArrowUpDown className="size-3" />
          <span>FEFO Sort</span>
        </button>
      </div>

      {/* Category horizontal scroll */}
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

      <div className="mt-4 flex items-center justify-between px-5 text-xs text-muted-foreground">
        <span>{filtered.length} items</span>
        {loading && (
          <span className="flex items-center gap-1 text-lime">
            <RefreshCw className="size-3 animate-spin" /> Syncing API...
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-3 px-5">
        {filtered.map((c) => (
          <ComponentCard key={c.id} component={c} />
        ))}

        {filtered.length === 0 && !loading && (
          <p className="rounded-2xl border border-white/8 bg-card p-6 text-center text-sm text-muted-foreground">
            No components match your filters.
          </p>
        )}
      </div>
    </div>
  )
}