import { withObj12Authorization } from '@/lib/obj12-client-auth'

interface TerminalApiEnvelope<T> {
  data: T | null
  error: { code?: string; message?: string } | null
}

export class TerminalApiError extends Error {
  public readonly status: number
  public readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

/**
 * Authenticated JSON fetch that unwraps the standard { data, error, meta } envelope
 * used by /api/v1/*. Throws a TerminalApiError on any non-ok state.
 */
export async function terminalApiFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit & { signal?: AbortSignal },
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    method: init?.method ?? 'GET',
    headers: withObj12Authorization(init?.headers, accessToken ?? ''),
    cache: 'no-store',
    signal: init?.signal,
  })

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new TerminalApiError(
      `Unerwartete Server-Antwort (HTTP ${response.status}).`,
      response.status,
    )
  }

  const body = (await response.json()) as TerminalApiEnvelope<T>

  if (!response.ok || body.error || body.data === null) {
    throw new TerminalApiError(
      body.error?.message?.trim() || `Anfrage fehlgeschlagen (HTTP ${response.status}).`,
      response.status,
      body.error?.code,
    )
  }

  return body.data
}
