'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseTerminalPollResult<T> {
  data: T | null
  error: string | null
  loading: boolean
  lastUpdated: Date | null
  reload: () => void
}

interface UseTerminalPollOptions<T> {
  fetcher: (signal: AbortSignal) => Promise<T>
  intervalMs: number
  enabled?: boolean
}

/**
 * Small polling hook used by the terminal dashboards.
 * - Calls `fetcher` immediately, then again every `intervalMs` ms.
 * - Cancels in-flight requests when unmounted or when a new poll starts.
 * - Keeps the last good data visible if a subsequent poll fails.
 */
export function useTerminalPoll<T>({
  fetcher,
  intervalMs,
  enabled = true,
}: UseTerminalPollOptions<T>): UseTerminalPollResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const abortRef = useRef<AbortController | null>(null)

  const run = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    try {
      const result = await fetcherRef.current(controller.signal)
      if (controller.signal.aborted) return
      setData(result)
      setError(null)
      setLastUpdated(new Date())
    } catch (err) {
      if (controller.signal.aborted) return
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler.'
      setError(message)
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    run()
    const id = setInterval(run, intervalMs)
    return () => {
      clearInterval(id)
      abortRef.current?.abort()
    }
  }, [run, intervalMs, enabled])

  return { data, error, loading, lastUpdated, reload: run }
}
