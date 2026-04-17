import type { HTMLAttributes, ReactNode } from 'react'

interface TerminalPanelProps extends HTMLAttributes<HTMLElement> {
  label?: ReactNode
  right?: ReactNode
  children: ReactNode
}

export function TerminalPanel({
  label,
  right,
  children,
  className,
  ...rest
}: TerminalPanelProps) {
  return (
    <section
      {...rest}
      className={`panel${className ? ` ${className}` : ''}`}
    >
      {label ? (
        <div className="panel-label">
          <span>{label}</span>
          {right ? <span style={{ marginLeft: 'auto' }}>{right}</span> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
