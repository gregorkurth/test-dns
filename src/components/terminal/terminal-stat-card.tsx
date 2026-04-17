interface TerminalStatCardProps {
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
}

export function TerminalStatCard({
  label,
  value,
  sub,
  highlight,
}: TerminalStatCardProps) {
  return (
    <div className="panel stat-card">
      <div className="stat-lbl">{label}</div>
      <div className={`stat-val${highlight ? ' g' : ''}`}>{value}</div>
      {sub ? <div className="stat-sub">{sub}</div> : null}
    </div>
  )
}
