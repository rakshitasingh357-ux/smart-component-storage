import type { ReactNode } from 'react'
import { BottomNav } from '@/components/bottom-nav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh w-full justify-center overflow-hidden bg-transparent sm:py-6">

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[150px]" />

        <div className="absolute top-[25%] -right-48 h-[500px] w-[500px] rounded-full bg-fuchsia-600/15 blur-[150px]" />

        <div className="absolute top-[55%] -left-48 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[150px]" />

        <div className="absolute -bottom-48 right-0 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[150px]" />

      </div>

      <div className="relative z-10 flex min-h-dvh w-full max-w-[420px] flex-col overflow-hidden bg-transparent sm:min-h-[860px] sm:rounded-[2.5rem] sm:border sm:border-white/10 sm:shadow-2xl">

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        <BottomNav />

      </div>

    </div>
  )
}

export function ScreenHeader({
  title,
  action,
}: {
  title: string
  action?: ReactNode
}) {
  return (
    <header className="flex items-center justify-between px-5 pb-4 pt-6">
      <h1 className="text-2xl font-bold tracking-tight text-white">
        {title}
      </h1>

      {action}
    </header>
  )
}