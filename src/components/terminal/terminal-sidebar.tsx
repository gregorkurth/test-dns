'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavEntry {
  href: string
  label: string
  icon: string
}

const NAV_ENTRIES: NavEntry[] = [
  { href: '/', label: 'Home', icon: '◇' },
  { href: '/dns-dashboard', label: 'DNS Overview', icon: '▣' },
  { href: '/capabilities', label: 'Capabilities', icon: '▤' },
  { href: '/participant-config', label: 'Participants', icon: '◎' },
  { href: '/zone-generator', label: 'Zone Generator', icon: '▶' },
  { href: '/test-execution-dashboard', label: 'Test Status', icon: '✓' },
]

interface TerminalSidebarProps {
  missionId?: string
  serviceTag?: string
}

export function TerminalSidebar({
  missionId = 'FMN-MNO',
  serviceTag = 'DNS // CC517',
}: TerminalSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="flex w-[210px] shrink-0 flex-col border-r"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--tborder)',
        minHeight: '100vh',
      }}
      aria-label="Primary navigation"
    >
      <div
        className="flex flex-col gap-1 border-b px-4 py-4"
        style={{ borderColor: 'var(--tborder)' }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.24em]"
          style={{ color: 'var(--accent-color)' }}
        >
          {missionId}
        </span>
        <span
          className="text-[9px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--text-dim)' }}
        >
          {serviceTag}
        </span>
      </div>

      <nav className="flex flex-1 flex-col py-3" aria-label="Dashboard sections">
        {NAV_ENTRIES.map((entry) => {
          const active =
            entry.href === '/'
              ? pathname === '/'
              : pathname === entry.href || pathname?.startsWith(`${entry.href}/`)
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={`nav-item${active ? ' active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span aria-hidden="true" style={{ width: 12, textAlign: 'center' }}>
                {entry.icon}
              </span>
              <span>{entry.label}</span>
            </Link>
          )
        })}
      </nav>

      <div
        className="border-t px-4 py-3 text-[9px] uppercase tracking-[0.2em]"
        style={{ borderColor: 'var(--tborder)', color: 'var(--text-dim)' }}
      >
        <div className="flex items-center gap-2">
          <span className="sdot online" aria-hidden="true" />
          <span>System OK</span>
        </div>
        <div className="mt-2" style={{ color: 'var(--text-muted)' }}>
          Airgapped Mode
        </div>
      </div>
    </aside>
  )
}
