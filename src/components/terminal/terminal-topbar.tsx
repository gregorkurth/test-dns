'use client'

import { TerminalClock } from './terminal-clock'

export type SystemStatus = 'operational' | 'degraded'

interface TerminalTopbarProps {
  title: string
  subtitle?: string
  status: SystemStatus
  statusLabel?: string
}

export function TerminalTopbar({
  title,
  subtitle,
  status,
  statusLabel,
}: TerminalTopbarProps) {
  const badgeClass =
    status === 'operational' ? 'sbadge online' : 'sbadge degraded'
  const label = statusLabel ?? (status === 'operational' ? 'OPERATIONAL' : 'DEGRADED')

  return (
    <header
      className="flex h-[54px] items-center justify-between gap-4 border-b px-5"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--tborder)',
      }}
      role="banner"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="truncate text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: 'var(--text-bright)' }}
        >
          {title}
        </span>
        {subtitle ? (
          <span
            className="hidden truncate text-[10px] uppercase tracking-[0.2em] md:inline"
            style={{ color: 'var(--text-muted)' }}
          >
            / {subtitle}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <span
          className={badgeClass}
          aria-label={`System status: ${label}`}
        >
          <span className={`sdot ${status === 'operational' ? 'online' : 'degraded'}`} aria-hidden="true" />
          {label}
        </span>
        <TerminalClock />
      </div>
    </header>
  )
}
