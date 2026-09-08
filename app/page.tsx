import Link from 'next/link'
import { Bell } from 'lucide-react'
import {
  alerts,
  cabinets,
  components,
  userProfile,
} from '@/data/mock-data'
import { SectionHeader } from '@/components/section-header'
import { CabinetStatusList } from '@/components/dashboard/cabinet-status-list'
import { AlertItem } from '@/components/alert-item'
import { ComponentCard } from '@/components/component-card'

export default function DashboardPage() {
  const totalParts = components.reduce(
    (sum, component) => sum + component.quantity,
    0,
  )

  const unreadAlerts = alerts.filter(
    (alert) => !alert.read,
  ).length

  const avgTemp = (
    cabinets.reduce(
      (sum, cabinet) => sum + cabinet.temperature,
      0,
    ) / cabinets.length
  ).toFixed(1)

  const avgHumidity = Math.round(
    cabinets.reduce(
      (sum, cabinet) => sum + cabinet.humidity,
      0,
    ) / cabinets.length,
  )

  const priorityAlerts = alerts
    .filter((alert) => alert.level !== 'info')
    .slice(0, 2)

  const recentComponents = components.slice(0, 3)

  return (
    <div className="relative min-h-full overflow-hidden pb-8">

      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-600/15 blur-[100px]" />

      <div className="pointer-events-none absolute right-0 top-80 h-52 w-32 rounded-full bg-fuchsia-600/10 blur-[90px]" />

      <header className="relative z-10 flex items-start justify-between px-5 pb-5 pt-7">

        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-violet-300/70">
            SMART STORAGE
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Good morning,
            <span className="ml-2 bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
              {userProfile.name.split(' ')[0]}
            </span>
          </h1>
        </div>

        <Link
          href="/alerts"
          className="relative flex size-11 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/10 text-violet-100 shadow-[0_0_30px_rgba(139,92,246,0.15)] backdrop-blur-xl"
        >
          <Bell className="size-5" />

          {unreadAlerts > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-[10px] font-bold text-white shadow-[0_0_15px_rgba(217,70,239,0.7)]">
              {unreadAlerts}
            </span>
          )}
        </Link>

      </header>

      <section className="relative z-10 grid grid-cols-3 gap-3 px-5">

        <div className="rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/15 to-purple-500/5 p-4 backdrop-blur-xl">
          <p className="text-[11px] text-purple-200/60">
            Total Parts
          </p>

          <p className="mt-3 text-2xl font-bold text-fuchsia-300">
            {totalParts}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-purple-500/5 p-4 backdrop-blur-xl">
          <p className="text-[11px] text-purple-200/60">
            Cabinets
          </p>

          <p className="mt-3 text-2xl font-bold text-violet-300">
            {cabinets.length}
          </p>
        </div>

        <div className="rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/15 to-fuchsia-500/5 p-4 backdrop-blur-xl">
          <p className="text-[11px] text-purple-200/60">
            Alerts
          </p>

          <p className="mt-3 text-2xl font-bold text-purple-300">
            {unreadAlerts}
          </p>
        </div>

      </section>

      <section className="relative z-10 mt-5 px-5">

        <div className="rounded-3xl border border-violet-300/10 bg-gradient-to-br from-violet-950/50 via-purple-950/30 to-fuchsia-950/20 p-4 shadow-[0_15px_45px_rgba(0,0,0,0.3)] backdrop-blur-xl">

          <SectionHeader
            title="Cabinet Status"
            actionLabel="View all"
            actionHref="/cabinets"
          />

          <CabinetStatusList cabinets={cabinets} />

        </div>

      </section>

      <section className="relative z-10 mt-5 grid grid-cols-2 gap-3 px-5">

        <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-600/15 to-purple-950/30 p-4 backdrop-blur-xl">

          <p className="text-xs text-purple-200/60">
            Avg. Temperature
          </p>

          <p className="mt-3 bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-3xl font-bold text-transparent">
            {avgTemp}
            <span className="ml-1 text-sm font-medium text-violet-200">
              °C
            </span>
          </p>

          <p className="mt-3 flex items-center gap-2 text-[11px] text-purple-100/60">
            <span className="size-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            Normal range
          </p>

        </div>

        <div className="relative overflow-hidden rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-600/15 to-purple-950/30 p-4 backdrop-blur-xl">

          <p className="text-xs text-purple-200/60">
            Avg. Humidity
          </p>

          <p className="mt-3 bg-gradient-to-r from-fuchsia-300 to-pink-300 bg-clip-text text-3xl font-bold text-transparent">
            {avgHumidity}
            <span className="ml-1 text-sm font-medium text-fuchsia-200">
              %RH
            </span>
          </p>

          <p className="mt-3 flex items-center gap-2 text-[11px] text-purple-100/60">
            <span className="size-2 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.8)]" />
            Optimal
          </p>

        </div>

      </section>

      <section className="relative z-10 mt-7 px-5">

        <SectionHeader
          title="Priority Alerts"
          actionLabel="See all"
          actionHref="/alerts"
        />

        <div className="mt-3 flex flex-col gap-3">

          {priorityAlerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-2xl border border-fuchsia-400/10 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 backdrop-blur-xl"
            >
              <AlertItem alert={alert} />
            </div>
          ))}

        </div>

      </section>

      <section className="relative z-10 mt-7 px-5">

        <SectionHeader
          title="Recent Components"
          actionLabel="View all"
          actionHref="/inventory"
        />

        <div className="mt-3 flex flex-col gap-3">

          {recentComponents.map((component) => (
            <div
              key={component.id}
              className="overflow-hidden rounded-2xl border border-violet-400/10 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 backdrop-blur-xl"
            >
              <ComponentCard component={component} />
            </div>
          ))}

        </div>

      </section>

    </div>
  )
}
