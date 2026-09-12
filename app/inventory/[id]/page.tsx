'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Minus, Plus, Pencil, MapPin, RefreshCw, Trash2 } from 'lucide-react'

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
  const [savingQuantity, setSavingQuantity] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)

  useEffect(() => {
    // Prevent route collisions where /inventory/add gets captured by dynamic [id]
    if (!componentId || componentId === 'add') {
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    // 1. Try FastAPI /inventory/{id} endpoint
    fetchApi<any>(`/inventory/${componentId}`)
      .then((data) => {
        if (isMounted && data) {
          const mapped: Component = {
            id: String(data.id ?? componentId),
            name: data.part_number || data.name || `Component ${componentId}`,
            category: data.category || 'Other',
            description: data.notes || `Batch: ${data.batch_id || 'N/A'} | Mfg: ${data.manufacturer || 'N/A'}`,
            quantity: data.quantity ?? 0,
            minStock: data.min_stock ?? 5,
            cabinet: data.cabinet_location || 'CAB-A',
            shelf: data.shelf || 'Shelf 1',
            slot: data.slot || 'Slot A',
            expiryDate: data.expiry_date || null,
            shelfLife: data.shelf_life_days ? `${data.shelf_life_days} days` : '365 days',
            lastActivity: data.last_accessed_date || new Date().toISOString().split('T')[0],
            updatedAgo: 'Recently',
          }
          setComponent(mapped)
          setQuantity(mapped.quantity)
        }
      })
      .catch(async () => {
        // 2. Fallback to /smart-logic/component/{id} telemetry
        try {
          const smart = await fetchApi<any>(`/smart-logic/component/${componentId}`)
          if (isMounted && smart) {
            const mapped: Component = {
              id: String(componentId),
              name: smart.partNumber || `Component ${componentId}`,
              category: smart.category || 'Other',
              description: `Batch: ${smart.batchId || 'N/A'} | Mfg: ${smart.manufacturer || 'N/A'}`,
              quantity: smart.quantity ?? 0,
              minStock: 5,
              cabinet: smart.cabinetLocation || 'CAB-A',
              shelf: 'Shelf 1',
              slot: 'Slot A',
              expiryDate: null,
              shelfLife: '365 days',
              lastActivity: new Date().toISOString().split('T')[0],
              updatedAgo: 'Recently',
            }
            setComponent(mapped)
            setQuantity(mapped.quantity)
            return
          }
        } catch {
          // 3. Fallback to local mock data
          const fallback = fallbackComponents.find((c) => String(c.id) === String(componentId))
          if (isMounted && fallback) {
            setComponent(fallback)
            setQuantity(fallback.quantity ?? 0)
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [componentId])

  const handleUpdateQuantityBackend = async (newQty: number) => {
    setQuantity(newQty)
    if (!componentId || componentId === 'add') return

    setSavingQuantity(true)
    try {
      await fetchApi(`/inventory/${componentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: newQty }),
      })
    } catch {
      // Keep optimistic UI update if PATCH is not implemented
    } finally {
      setSavingQuantity(false)
    }
  }

  const handleDelete = async () => {
    if (!component) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${component.name}"? This action cannot be undone.`
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      await fetchApi(`/inventory/${componentId}`, {
        method: 'DELETE',
      })
      router.push('/inventory')
      router.refresh()
    } catch (err: any) {
      alert(`Failed to delete component: ${err?.message || 'Server error'}`)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-5 py-24 text-center">
        <RefreshCw className="size-6 animate-spin text-lime" />
        <p className="text-sm text-muted-foreground">Loading component specs...</p>
      </div>
    )
  }

  if (!component || componentId === 'add') {
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
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-card"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <h1 className="text-lg font-bold">Component Details</h1>
        </div>

        {/* Delete Component Button */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex size-9 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20 active:scale-95 disabled:opacity-50"
          title="Delete Component"
          aria-label="Delete Component"
        >
          {deleting ? (
            <RefreshCw className="size-4 animate-spin text-rose-400" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
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
            <div>
              <p className="text-sm font-medium">Update quantity</p>
              {savingQuantity && <p className="text-[10px] text-lime">Saving to backend...</p>}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleUpdateQuantityBackend(Math.max(0, quantity - 1))}
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
                onClick={() => handleUpdateQuantityBackend(quantity + 1)}
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
          className="flex items-center justify-center gap-2 rounded-2xl bg-lime py-3 text-sm font-semibold text-lime-foreground glow-lime transition active:scale-[0.98]"
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