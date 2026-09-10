'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { cabinets } from '@/data/mock-data'
import { cn } from '@/lib/utils'

const categories: string[] = [
  'Microcontrollers',
  'Wireless Modules',
  'Voltage Regulators',
  'Capacitors',
  'Transistors',
  'Resistors',
  'Sensors',
]

interface FormState {
  name: string
  category: string
  quantity: string
  minStock: string
  cabinetId: string
  shelf: string
  slot: string
  description: string
}

const empty: FormState = {
  name: '',
  category: '',
  quantity: '',
  minStock: '',
  cabinetId: '',
  shelf: '',
  slot: '',
  description: '',
}

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-lime/40'

export default function AddComponentPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [saved, setSaved] = useState(false)

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate() {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.category) next.category = 'Choose a category'
    if (!form.quantity || Number(form.quantity) < 0) next.quantity = 'Enter a valid quantity'
    if (!form.minStock || Number(form.minStock) < 0) next.minStock = 'Enter a minimum level'
    if (!form.cabinetId) next.cabinetId = 'Choose a cabinet'
    if (!form.slot.trim()) next.slot = 'Slot is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaved(true)
    setTimeout(() => router.push('/inventory'), 900)
  }

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
        <h1 className="text-lg font-bold">Add Component</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5">
        <Field label="Component Name" error={errors.name}>
          <input
            className={fieldClass}
            placeholder="e.g. ATmega328P"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </Field>

        <Field label="Category" error={errors.category}>
          <select
            className={cn(fieldClass, !form.category && 'text-muted-foreground')}
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c} className="text-foreground">
                {c}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity" error={errors.quantity}>
            <input
              type="number"
              min={0}
              className={fieldClass}
              placeholder="0"
              value={form.quantity}
              onChange={(e) => update('quantity', e.target.value)}
            />
          </Field>
          <Field label="Min. Stock Level" error={errors.minStock}>
            <input
              type="number"
              min={0}
              className={fieldClass}
              placeholder="0"
              value={form.minStock}
              onChange={(e) => update('minStock', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Cabinet" error={errors.cabinetId}>
          <select
            className={cn(fieldClass, !form.cabinetId && 'text-muted-foreground')}
            value={form.cabinetId}
            onChange={(e) => update('cabinetId', e.target.value)}
          >
            <option value="">Select cabinet</option>
            {cabinets.map((c) => (
              <option key={c.id} value={c.id} className="text-foreground">
                {c.id} — {c.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Shelf">
            <input
              className={fieldClass}
              placeholder="e.g. A"
              value={form.shelf}
              onChange={(e) => update('shelf', e.target.value)}
            />
          </Field>
          <Field label="Slot" error={errors.slot}>
            <input
              className={fieldClass}
              placeholder="e.g. A3"
              value={form.slot}
              onChange={(e) => update('slot', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            rows={3}
            className={cn(fieldClass, 'resize-none')}
            placeholder="Notes about this component..."
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </Field>

        <button
          type="submit"
          disabled={saved}
          className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-lime py-3.5 text-sm font-semibold text-lime-foreground glow-lime disabled:opacity-70"
        >
          {saved ? (
            <>
              <Check className="size-4" strokeWidth={2.5} /> Component added
            </>
          ) : (
            'Add Component'
          )}
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {error && <span className="text-[11px] text-danger">{error}</span>}
    </label>
  )
}