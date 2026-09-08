'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Thermometer, Droplets, Shield, Palette, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToggleSwitch } from '@/components/toggle-switch'

export default function SettingsPage() {
  const router = useRouter()

  const [toggles, setToggles] = useState({
    stockAlerts: true,
    sensorAlerts: true,
    weeklyReport: false,
    biometric: true,
    reduceMotion: false,
    analytics: false,
  })
  const [tempMax, setTempMax] = useState(26)
  const [humidityMax, setHumidityMax] = useState(60)

  function setToggle(key: keyof typeof toggles, v: boolean) {
    setToggles((prev) => ({ ...prev, [key]: v }))
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
        <h1 className="text-lg font-bold">Settings</h1>
      </header>

      <SettingsGroup icon={Bell} title="Notifications" tint="text-lime">
        <ToggleRow
          title="Stock Alerts"
          desc="Low and out-of-stock warnings"
          checked={toggles.stockAlerts}
          onChange={(v) => setToggle('stockAlerts', v)}
        />
        <ToggleRow
          title="Sensor Alerts"
          desc="Temperature and humidity limits"
          checked={toggles.sensorAlerts}
          onChange={(v) => setToggle('sensorAlerts', v)}
        />
        <ToggleRow
          title="Weekly Report"
          desc="Summary every Monday"
          checked={toggles.weeklyReport}
          onChange={(v) => setToggle('weeklyReport', v)}
        />
      </SettingsGroup>

      <SettingsGroup icon={Thermometer} title="Temperature Limit" tint="text-blue">
        <SliderRow
          label="Max temperature alert"
          value={tempMax}
          min={18}
          max={40}
          unit="°C"
          onChange={setTempMax}
        />
      </SettingsGroup>

      <SettingsGroup icon={Droplets} title="Humidity Limit" tint="text-purple">
        <SliderRow
          label="Max humidity alert"
          value={humidityMax}
          min={20}
          max={90}
          unit="%"
          onChange={setHumidityMax}
        />
      </SettingsGroup>

      <SettingsGroup icon={Shield} title="Security" tint="text-lime">
        <ToggleRow
          title="Biometric Unlock"
          desc="Use device biometrics"
          checked={toggles.biometric}
          onChange={(v) => setToggle('biometric', v)}
        />
      </SettingsGroup>

      <SettingsGroup icon={Palette} title="Appearance" tint="text-warning">
        <ToggleRow
          title="Reduce Motion"
          desc="Minimize animations"
          checked={toggles.reduceMotion}
          onChange={(v) => setToggle('reduceMotion', v)}
        />
      </SettingsGroup>

      <SettingsGroup icon={Lock} title="Privacy" tint="text-danger">
        <ToggleRow
          title="Usage Analytics"
          desc="Share anonymous usage data"
          checked={toggles.analytics}
          onChange={(v) => setToggle('analytics', v)}
        />
      </SettingsGroup>
    </div>
  )
}

function SettingsGroup({
  icon: Icon,
  title,
  tint,
  children,
}: {
  icon: typeof Bell
  title: string
  tint: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-4 px-5">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={cn('size-4', tint)} />
        <h2 className="text-xs font-semibold tracking-widest text-muted-foreground">
          {title.toUpperCase()}
        </h2>
      </div>
      <div className="rounded-2xl border border-white/8 bg-card p-1">{children}</div>
    </section>
  )
}

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between px-3 py-3 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-white/8">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ToggleSwitch label={title} checked={checked} onChange={onChange} />
    </div>
  )
}

function SliderRow({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div className="px-3 py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <span className="font-mono text-sm text-lime">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-lime"
      />
    </div>
  )
}
