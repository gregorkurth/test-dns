'use client'

interface TerminalUpdateBarProps {
  intervalSeconds: number
  lastUpdated: Date | null
  loading?: boolean
  onManualRefresh?: () => void
}

function formatUtcTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`
}

export function TerminalUpdateBar({
  intervalSeconds,
  lastUpdated,
  loading,
  onManualRefresh,
}: TerminalUpdateBarProps) {
  // Use the timestamp itself as a React key on the animated fill element so
  // it re-mounts and restarts its CSS keyframe after each refresh tick.
  const fillKey = lastUpdated ? lastUpdated.getTime() : 'initial'

  return (
    <div className="update-bar" role="status" aria-live="polite">
      <div className="flex items-center gap-2">
        <span aria-hidden="true">▸</span>
        <span>
          Auto-Refresh alle {intervalSeconds}s
          <span className="poll-bar" aria-hidden="true">
            <span
              key={fillKey}
              className="poll-fill"
              style={{
                animationDuration: `${intervalSeconds}s`,
              }}
            />
          </span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span>
          Last updated:{' '}
          <span
            style={{
              color: loading ? 'var(--warn)' : 'var(--accent-color)',
            }}
          >
            {loading ? 'loading…' : lastUpdated ? formatUtcTime(lastUpdated) : '—'}
          </span>
        </span>
        {onManualRefresh ? (
          <button
            type="button"
            onClick={onManualRefresh}
            disabled={loading}
            className="border px-2 py-[2px] text-[9px] uppercase tracking-[0.18em] transition-colors"
            style={{
              borderColor: 'var(--tborder)',
              color: loading ? 'var(--text-dim)' : 'var(--accent-dim)',
              background: 'transparent',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            aria-label="Refresh now"
          >
            Refresh
          </button>
        ) : null}
      </div>
    </div>
  )
}
