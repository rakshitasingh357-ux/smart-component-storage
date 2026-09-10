import {
  cabinets,
  humidityHistory,
  temperatureHistory,
} from '@/data/mock-data'
import { cn } from '@/lib/utils'
import { ScreenHeader } from '@/components/app-shell'
import { SensorChart, ChartAxis } from '@/components/sensor-chart'

export default function EnvironmentPage() {
  const validTempCabinets = cabinets.filter((c: any) => typeof c.temperature === 'number')
  const avgTemp = validTempCabinets.length
    ? (validTempCabinets.reduce((s: number, c: any) => s + c.temperature, 0) / validTempCabinets.length).toFixed(1)
    : '0.0'

  const validHumidityCabinets = cabinets.filter((c: any) => typeof c.humidity === 'number')
  const avgHumidity = validHumidityCabinets.length
    ? Math.round(validHumidityCabinets.reduce((s: number, c: any) => s + c.humidity, 0) / validHumidityCabinets.length)
    : 0

  return (
    <div className="pb-6">
      <ScreenHeader title="Environment" />

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

      <section className="mt-5 px-5">
        <h3 className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground">
          PER-CABINET SENSORS
        </h3>
        <div className="flex flex-col gap-3">
          {cabinets.map((cab: any) => {
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
                        cab.tempWarning ? 'bg-warning' : 'bg-lime',
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