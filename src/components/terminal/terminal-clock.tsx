'use client'

import { useEffect, useState } from 'react'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function TerminalClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const tick = () => setNow(new Date())
    const interval = setInterval(tick, 1000)
    // Kick off the first tick on the next frame so we don't setState synchronously.
    const raf =
      typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame(tick)
        : (setTimeout(tick, 0) as unknown as number)
    return () => {
      clearInterval(interval)
      if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(raf)
      } else {
        clearTimeout(raf)
      }
    }
  }, [])

  if (!now) {
    return (
      <span className="topbar-clock" aria-label="UTC time">
        00<span className="colon">:</span>00<span className="colon">:</span>00
      </span>
    )
  }

  return (
    <span className="topbar-clock" aria-label="UTC time">
      {pad(now.getUTCHours())}
      <span className="colon">:</span>
      {pad(now.getUTCMinutes())}
      <span className="colon">:</span>
      {pad(now.getUTCSeconds())}
    </span>
  )
}
