'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Minus, Plus, Pencil, MapPin, RefreshCw } from 'lucide-react'

import { components as fallbackComponents } from '@/data/mock-data'
import { getStockStatus } from '@/lib/inventory'
import { fetchApi } from '@/lib/api'
import type { Component } from '@/types'

import { CategoryIcon } from '@/components/category-icon'
import { StatusBadge } from '@/components/status-badge'
import { SmartLogicCard } from '@/components/smart-logic-card'

export default function ComponentDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const componentId = params?.id

  const [component, setComponent] = useState<Component | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [quantity, setQuantity] = useState<number>(0)
  const [editing, setEditing] = useState<boolean>(false)

  useEffect(() => {
    if (!componentId) return

    let isMounted = true
    setLoading(true)

    // Attempt fetching from backend, fallback to mock list if offline
    fetchApi<Component>(`/components/${componentId}`)
      .then((data) => {
        if (isMounted && data) {
          setComponent(data)
          setQuantity(data.quantity ?? 0)
        }
      })
      .catch(() => {
        if (isMounted) {
          const fallback = fallbackComponents.find((c) => c.id === componentId) || null
          setComponent(fallback)
          if (fallback) setQuantity(fallback.quantity ?? 0)
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [componentId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-5 py-24 text-center">
        <RefreshCw className="size-6 animate-spin text-lime" />
        <p className="text-sm text-muted-foreground">Loading component specs...</p>
      </div>
    )
  }

  if (!component) {
    return (
      <div className="flex flex-col items-center gap-4 px-5 py-20 text-center">
        <p className="text-sm text-muted-foreground">Component not found.</p>
        <Link href="/inventory" className="text-sm font-medium text-lime">
          Back to inventory
        </Link>
      </div>
    )
  }

  const status = getStockStatus({ quantity, minStock: component.minStock })

  const facts = [
    { label: 'Quantity', value: String(quantity) },
    { label: 'Minimum Stock', value: String(component.minStock) },
    { label: 'Cabinet', value: component.cabinet },
    { label: 'Shelf', value: component.shelf },
    { label: 'Slot', value: component.slot },
    { label: 'Category', value: component.category },
  ]
  return (
    <div className="pb-6">
      <header className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-card"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-lg font-bold">Component Details</h1>
      </header>

      {/* Main Info Card */}
      <section className="px-5">
        <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-card p-4">
          <CategoryIcon category={component.category} className="size-14 rounded-2xl" iconClassName="size-7" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold">{component.name}</h2>
            <p className="text-sm text-muted-foreground">{component.category}</p>
          </div>
          <StatusBadge status={status} />
        </div>
      </section>

      {/* Smart Logic Telemetry & Diagnostics Section */}
      <section className="mt-4 px-5">
        <SmartLogicCard componentId={component.id} />
      </section>

      {/* Facts Grid */}
      <section className="mt-4 grid grid-cols-2 gap-3 px-5">
        {facts.map((f) => (
          <div key={f.label} className="rounded-2xl border border-white/8 bg-card p-3">
            <p className="text-[11px] text-muted-foreground">{f.label}</p>
            <p className="mt-1 font-mono text-sm font-semibold">{f.value}</p>
          </div>
        ))}
      </section>

      {/* Description */}
      <section className="mt-4 px-5">
        <div className="rounded-2xl border border-white/8 bg-card p-4">
          <p className="mb-2 text-sm font-semibold">Description</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{component.description}</p>
        </div>
      </section>

      {/* Quantity Adjustment Drawer */}
      {editing && (
        <section className="mt-4 px-5">
          <div className="flex items-center justify-between rounded-2xl border border-lime/25 bg-lime/[0.06] p-4">
            <p className="text-sm font-medium">Update quantity</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-card"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center font-mono text-lg font-bold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex size-9 items-center justify-center rounded-xl bg-lime text-lime-foreground"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Actions */}
      <section className="mt-5 flex flex-col gap-3 px-5">
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-lime py-3 text-sm font-semibold text-lime-foreground glow-lime transition active:scale-95"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          {editing ? 'Done updating' : 'Update Quantity'}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-card py-3 text-sm font-medium transition active:scale-95"
          >
            <Pencil className="size-4" /> Edit
          </button>
          <Link
    href={`/cabinets?cab=${component.cabinet}`}
    className="flex items-center justify-center gap-2 rounded-2xl border border-blue/30 bg-blue/10 py-3 text-sm font-medium text-blue transition active:scale-95"
  >
    <MapPin className="size-4" /> Locate
  </Link>
        </div>
      </section>
    </div>
  )
}