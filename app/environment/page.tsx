import {
  cabinets,
  humidityHistory,
  temperatureHistory,
} from '@/data/mock-data'
import { cn } from '@/lib/utils'
import { ScreenHeader } from '@/components/app-shell'
import { SensorChart, ChartAxis } from '@/components/sensor-chart'

export default function EnvironmentPage() {
  const avgTemp = (
    cabinets.reduce((s, c) => s + c.temperature, 0) / cabinets.length
  ).toFixed(1)
  const avgHumidity = Math.round(
    cabinets.reduce((s, c) => s + c.humidity, 0) / cabinets.length,
  )

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
          {cabinets.map((cab) => {
            const isTempWarning =
              (cab as any).tempWarning ?? (cab.maxTemperature != null ? cab.temperature > cab.maxTemperature : false)
            const pressureVal = (cab as any).pressure != null ? (cab as any).pressure.toFixed(1) : '--'

            return (
              <div key={cab.id} className="rounded-2xl border border-white/8 bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        isTempWarning ? 'bg-warning' : 'bg-lime',
                      )}
                    />
                    {cab.id}
                  </p>
                  {isTempWarning && (
                    <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
                      High Temp
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Sensor label="Temp" value={`${cab.temperature}°C`} tone="text-blue" warn={isTempWarning} />
                  <Sensor label="Humidity" value={`${cab.humidity}%`} tone="text-purple" />
                  <Sensor label="Pressure" value={pressureVal} tone="text-foreground" />
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