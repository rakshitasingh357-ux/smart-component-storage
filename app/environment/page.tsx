'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  cabinets as fallbackCabinets,
  humidityHistory,
  temperatureHistory,
} from '@/data/mock-data'
import { cn } from '@/lib/utils'
import { fetchApi } from '@/lib/api'
import { ScreenHeader } from '@/components/app-shell'
import { SensorChart, ChartAxis } from '@/components/sensor-chart'
import { RefreshCw, Sliders, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function EnvironmentPage() {
  const [cabinetList, setCabinetList] = useState<any[]>(fallbackCabinets)
  const [loading, setLoading] = useState<boolean>(true)

  // Interactive Digital Twin Simulation state
  const [simHumidity, setSimHumidity] = useState<number>(45)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [simFeedback, setSimFeedback] = useState<string | null>(null)

  const loadEnvironmentData = async () => {
    setLoading(true)
    try {
      const data = await fetchApi<any[]>('/cabinets')
      if (Array.isArray(data) && data.length > 0) {
        setCabinetList(data)
      } else {
        setCabinetList(fallbackCabinets)
      }
    } catch {
      setCabinetList(fallbackCabinets)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEnvironmentData()
  }, [])

  // Send simulation payload to backend on slider release
  const handleSimulateChange = async (value: number) => {
    setIsSimulating(true)
    setSimFeedback(null)
    try {
      await fetchApi('/telemetry/simulate', {
        method: 'POST',
        body: JSON.stringify({
          humidity: value,
          timestamp: new Date().toISOString(),
        }),
      })
      setSimFeedback(value > 60 ? 'Breach triggered: Notification dispatched' : 'Nominal range restored')
    } catch {
      // Graceful local feedback if backend simulator route is not active yet
      setSimFeedback(value > 60 ? 'Simulated breach: Humidity exceeded 60%' : 'Simulated nominal humidity')
    } finally {
      setIsSimulating(false)
    }
  }

  const validTempCabinets = useMemo(
    () => cabinetList.filter((c: any) => typeof c.temperature === 'number'),
    [cabinetList]
  )

  const avgTemp = validTempCabinets.length
    ? (validTempCabinets.reduce((s: number, c: any) => s + c.temperature, 0) / validTempCabinets.length).toFixed(1)
    : '0.0'

  const validHumidityCabinets = useMemo(
    () => cabinetList.filter((c: any) => typeof c.humidity === 'number'),
    [cabinetList]
  )

  const avgHumidity = validHumidityCabinets.length
    ? Math.round(validHumidityCabinets.reduce((s: number, c: any) => s + c.humidity, 0) / validHumidityCabinets.length)
    : 0

  return (
    <div className="pb-6">
      <ScreenHeader
        title="Environment"
        action={
          <button
            onClick={loadEnvironmentData}
            disabled={loading}
            className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-card text-muted-foreground transition active:scale-95 disabled:opacity-50"
            title="Refresh telemetry"
          >
            <RefreshCw className={cn('size-4', loading && 'animate-spin text-lime')} />
          </button>
        }
      />

      {/* Digital Twin Simulator Control */}
      <section className="mb-4 px-5">
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="size-4 text-purple-400" />
              <p className="text-xs font-semibold tracking-wide text-purple-200 uppercase">
                Digital Twin Telemetry Simulator
              </p>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                simHumidity > 60
                  ? 'border border-rose-500/40 bg-rose-500/20 text-rose-300'
                  : 'border border-lime/40 bg-lime/15 text-lime'
              )}
            >
              {simHumidity > 60 ? (
                <>
                  <AlertTriangle className="size-3" /> Critical Humidity
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3" /> Safe Storage
                </>
              )}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Simulated Chamber Humidity</span>
              <span className="font-mono font-bold text-foreground">{simHumidity}% RH</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={simHumidity}
              onChange={(e) => setSimHumidity(Number(e.target.value))}
              onMouseUp={() => handleSimulateChange(simHumidity)}
              onTouchEnd={() => handleSimulateChange(simHumidity)}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-purple-500"
            />
          </div>

          {simFeedback && (
            <p className="mt-2 text-center text-[11px] text-purple-300/80">
              {simFeedback} {isSimulating && '...'}
            </p>
          )}
        </div>
      </section>

      {/* Top Telemetry Summary Cards */}
      <section className="grid grid-cols-2 gap-3 px-5">
        <div className="rounded-2xl border border-blue/20 bg-blue/[0.06] p-4">
          <p className="text-xs text-muted-foreground">Avg Temperature</p>
          <p className="mt-2 text-2xl font-bold text-blue">
            {avgTemp}
            <span className="ml-1 text-sm font-medium">°C</span>
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-lime" /> Normal
          </p>
        </div>
        <div className="rounded-2xl border border-purple/20 bg-purple/[0.06] p-4">
          <p className="text-xs text-muted-foreground">Avg Humidity</p>
          <p className="mt-2 text-2xl font-bold text-purple">
            {avgHumidity}
            <span className="ml-1 text-sm font-medium">%RH</span>
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-lime" /> Optimal
          </p>
        </div>
      </section>

      {/* Temperature Historical Chart */}
      <section className="mt-4 px-5">
        <div className="rounded-2xl border border-white/8 bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              Temperature <span className="text-muted-foreground">· 12h</span>
            </p>
            <p className="font-mono text-xs text-blue">{avgTemp}°C avg</p>
          </div>
          <div className="mt-3">
            <SensorChart data={temperatureHistory} color="var(--blue)" />
            <ChartAxis data={temperatureHistory} />
          </div>
        </div>
      </section>

      {/* Humidity Historical Chart */}
      <section className="mt-4 px-5">
        <div className="rounded-2xl border border-white/8 bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              Humidity <span className="text-muted-foreground">· 12h</span>
            </p>
            <p className="font-mono text-xs text-purple">{avgHumidity}% avg</p>
          </div>
          <div className="mt-3">
            <SensorChart data={humidityHistory} color="var(--purple)" />
            <ChartAxis data={humidityHistory} />
          </div>
        </div>
      </section>

      {/* Per-Cabinet Sensors */}
      <section className="mt-5 px-5">
        <h3 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground">
          PER-CABINET SENSORS
        </h3>
        <div className="flex flex-col gap-3">
          {cabinetList.map((cab: any) => {
            const rawPressure = cab.pressure ?? cab.telemetry?.pressure_hpa ?? cab.telemetry?.pressure
            const displayPressure =
              typeof rawPressure === 'number'
                ? rawPressure.toFixed(1)
                : rawPressure ?? 'N/A'

            const displayTemp =
              typeof cab.temperature === 'number'
                ? `${cab.temperature.toFixed(1)}°C`
                : cab.temperature != null
                ? `${cab.temperature}°C`
                : '--°C'

            const displayHumidity =
              typeof cab.humidity === 'number'
                ? `${Math.round(cab.humidity)}%`
                : cab.humidity != null
                ? `${cab.humidity}%`
                : '--%'

            return (
              <div key={cab.id} className="rounded-2xl border border-white/8 bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        cab.tempWarning ? 'bg-warning' : 'bg-lime'
                      )}
                    />
                    {cab.id}
                  </p>
                  {cab.tempWarning && (
                    <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
                      High Temp
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Sensor label="Temp" value={displayTemp} tone="text-blue" warn={cab.tempWarning} />
                  <Sensor label="Humidity" value={displayHumidity} tone="text-purple" />
                  <Sensor label="Pressure" value={displayPressure} tone="text-foreground" />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function Sensor({
  label,
  value,
  tone,
  warn,
}: {
  label: string
  value: string
  tone: string
  warn?: boolean
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-2 text-center">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn('mt-1 font-mono text-sm font-semibold', warn ? 'text-warning' : tone)}>
        {value}
      </p>
    </div>
  )
}