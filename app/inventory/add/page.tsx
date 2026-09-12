'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

import { ScreenHeader } from '@/components/app-shell'
import { fetchApi } from '@/lib/api'

const CATEGORIES = [
  'Microcontrollers',
  'Wireless Modules',
  'Sensors',
  'Op-Amps',
  'Passives',
  'Power Management',
  'RF Transceivers',
  'Connectors',
  'Other',
]

export default function AddComponentPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cabinet: 'CAB-A',
    row: 'ROW-A',
    slot: 'Slot 1',
    quantity: 1,
    minStock: 5,
    expiryDate: '',
    description: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'minStock' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const rowLetter = formData.row.includes('B') ? 'B' : 'A'
    const slotNumber = formData.slot.replace(/[^0-9]/g, '') || '1'
    const cabinetLocation = `${formData.cabinet} - ROW-${rowLetter} - SLOT ${slotNumber}`

    const today = new Date().toISOString().split('T')[0]
    const randomBatch = `BATCH-${Math.floor(1000 + Math.random() * 9000)}`

    let shelfLifeDays = 365
    if (formData.expiryDate) {
      const diffMs = new Date(formData.expiryDate).getTime() - new Date(today).getTime()
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays > 0) shelfLifeDays = diffDays
    }

    try {
      await fetchApi('/inventory', {
        method: 'POST',
        body: JSON.stringify({
          batch_id: randomBatch,
          part_number: formData.name,
          manufacturer: 'Generic',
          category: formData.category,
          cabinet_location: cabinetLocation,
          quantity: Number(formData.quantity) || 1,
          stored_date: today,
          last_accessed_date: today,
          expiry_date: formData.expiryDate || null,
          min_temperature_c: 15.0,
          max_temperature_c: 30.0,
          max_humidity_percent: 60.0,
          shelf_life_days: shelfLifeDays,
          notes: formData.description || 'Added via UI',
        }),
      })

      router.push('/inventory')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Failed to create component. Check backend connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pb-12">
      <ScreenHeader
        title="Add Component"
        action={
          <Link
            href="/inventory"
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-card text-foreground transition active:scale-95"
          >
            <ArrowLeft className="size-5" />
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="mx-auto max-w-xl px-5 pt-4">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Component Name / Part Number
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. ESP32-WROOM-32D"
              className="w-full rounded-xl border border-white/10 bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-lime"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Category
            </label>
            <div className="relative">
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border border-white/10 bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-lime"
              >
                <option value="" disabled className="bg-zinc-900 text-zinc-400">
                  Select category
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Cabinet
              </label>
              <select
                name="cabinet"
                value={formData.cabinet}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border border-white/10 bg-card px-3 py-3 text-sm text-foreground outline-none transition focus:border-lime"
              >
                <option value="CAB-A" className="bg-zinc-900 text-white">Cabinet A</option>
                <option value="CAB-B" className="bg-zinc-900 text-white">Cabinet B</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Row
              </label>
              <select
                name="row"
                value={formData.row}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border border-white/10 bg-card px-3 py-3 text-sm text-foreground outline-none transition focus:border-lime"
              >
                <option value="ROW-A" className="bg-zinc-900 text-white">ROW-A</option>
                <option value="ROW-B" className="bg-zinc-900 text-white">ROW-B</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Slot
              </label>
              <select
                name="slot"
                value={formData.slot}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border border-white/10 bg-card px-3 py-3 text-sm text-foreground outline-none transition focus:border-lime"
              >
                <option value="Slot 1" className="bg-zinc-900 text-white">Slot 1</option>
                <option value="Slot 2" className="bg-zinc-900 text-white">Slot 2</option>
                <option value="Slot 3" className="bg-zinc-900 text-white">Slot 3</option>
                <option value="Slot 4" className="bg-zinc-900 text-white">Slot 4</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Initial Qty
              </label>
              <input
                type="number"
                name="quantity"
                min="0"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-card px-3 py-3 text-sm text-foreground outline-none transition focus:border-lime"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Min Stock
              </label>
              <input
                type="number"
                name="minStock"
                min="0"
                value={formData.minStock}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-card px-3 py-3 text-sm text-foreground outline-none transition focus:border-lime"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-card px-3 py-3 text-sm text-foreground outline-none transition focus:border-lime"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Description / Notes
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Package type, pinout notes, or storage precautions..."
              className="w-full rounded-xl border border-white/10 bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-lime"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-lime py-3.5 text-sm font-semibold text-lime-foreground transition active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <span>Adding component...</span>
            ) : (
              <>
                <Save className="size-4" />
                <span>Save Component</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}