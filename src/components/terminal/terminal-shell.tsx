'use client'

import type { ReactNode } from 'react'

import { TerminalSidebar } from './terminal-sidebar'
import { TerminalTopbar, type SystemStatus } from './terminal-topbar'

interface TerminalShellProps {
  title: string
  subtitle?: string
  status: SystemStatus
  statusLabel?: string
  children: ReactNode
}

export function TerminalShell({
  title,
  subtitle,
  status,
  statusLabel,
  children,
}: TerminalShellProps) {
  return (
    <div className="terminal flex min-h-screen">
      <TerminalSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TerminalTopbar
          title={title}
          subtitle={subtitle}
          status={status}
          statusLabel={statusLabel}
        />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{ background: 'var(--bg-base)' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
