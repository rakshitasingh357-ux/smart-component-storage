'use client'

import { cn } from '@/lib/utils'

export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full border transition-colors',
        checked ? 'border-lime/40 bg-lime/80 glow-lime' : 'border-white/15 bg-white/10',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-white transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
