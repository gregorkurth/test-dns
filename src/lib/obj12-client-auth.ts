'use client'

import { useEffect, useState } from 'react'

export type Obj12ClientRole = 'viewer' | 'operator' | 'admin'
export type Obj12ClientAuthMode = 'local' | 'oidc' | 'hybrid'
export type Obj12ClientProvider = 'local' | 'oidc'

interface Obj12AuthEnvelope<TData> {
  data: TData | null
  error: {
    code?: string
    message?: string
  } | null
}

interface Obj12SessionPayload {
  accessToken: string
  tokenType: 'Bearer'
  expiresAt: string
  expiresInSeconds: number
  session: {
    username: string
    displayName: string
    role: Obj12ClientRole
    provider: Obj12ClientProvider
  }
  auth: {
    mode: Obj12ClientAuthMode
    ttlSeconds: number
  }
}

interface Obj12SessionState {
  accessToken: string
  expiresAt: string | null
  session: Obj12SessionPayload['session'] | null
  authMode: Obj12ClientAuthMode
}

const OBJ12_STORAGE_KEY = 'obj12.auth.session'

const emptyState: Obj12SessionState = {
  accessToken: '',
  expiresAt: null,
  session: null,
  authMode: 'hybrid',
}

function readStoredState(): Obj12SessionState {
  if (typeof window === 'undefined') {
    return emptyState
  }

  const raw = window.localStorage.getItem(OBJ12_STORAGE_KEY)
  if (!raw) {
    return emptyState
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Obj12SessionState>
    return {
      accessToken:
        typeof parsed.accessToken === 'string' ? parsed.accessToken : '',
      expiresAt: typeof parsed.expiresAt === 'string' ? parsed.expiresAt : null,
      session:
        parsed.session &&
        typeof parsed.session === 'object' &&
        typeof parsed.session.username === 'string' &&
        typeof parsed.session.displayName === 'string' &&
        typeof parsed.session.role === 'string' &&
        typeof parsed.session.provider === 'string'
          ? {
              username: parsed.session.username,
              displayName: parsed.session.displayName,
              role: parsed.session.role as Obj12ClientRole,
              provider: parsed.session.provider as Obj12ClientProvider,
            }
          : null,
      authMode:
        parsed.authMode === 'local' ||
        parsed.authMode === 'oidc' ||
        parsed.authMode === 'hybrid'
          ? parsed.authMode
          : 'hybrid',
    }
  } catch {
    return emptyState
  }
}

function writeStoredState(value: Obj12SessionState): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(OBJ12_STORAGE_KEY, JSON.stringify(value))
}

function clearStoredState(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(OBJ12_STORAGE_KEY)
}

async function parseEnvelope<TData>(
  response: Response,
): Promise<
  | { ok: true; data: TData }
  | { ok: false; message: string }
> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return {
      ok: false,
      message: `Unerwartete Server-Antwort (HTTP ${response.status}).`,
    }
  }

  const body = (await response.json()) as Obj12AuthEnvelope<TData>
  if (!response.ok || body.error || body.data === null) {
    return {
      ok: false,
      message:
        body.error?.message?.trim() ||
        `Authentifizierungsanfrage fehlgeschlagen (HTTP ${response.status}).`,
    }
  }

  return { ok: true, data: body.data }
}

function toStoredState(payload: Obj12SessionPayload): Obj12SessionState {
  return {
    accessToken: payload.accessToken,
    expiresAt: payload.expiresAt,
    session: payload.session,
    authMode: payload.auth.mode,
  }
}

export function withObj12Authorization(
  headers: HeadersInit | undefined,
  accessToken: string,
): Headers {
  const nextHeaders = new Headers(headers)
  if (accessToken.trim()) {
    nextHeaders.set('authorization', `Bearer ${accessToken.trim()}`)
  }
  return nextHeaders
}

export function useObj12Auth() {
  const [state, setState] = useState<Obj12SessionState>(emptyState)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      setState(readStoredState())
      setHydrated(true)
    })
  }, [])

  async function refreshSession(nextToken?: string): Promise<boolean> {
    const accessToken = (nextToken ?? state.accessToken).trim()
    if (!accessToken) {
      setState((previous) => ({
        ...previous,
        accessToken: '',
        session: null,
        expiresAt: null,
      }))
      return false
    }

    setLoading(true)
    const response = await fetch('/api/v1/auth/session', {
      headers: withObj12Authorization(undefined, accessToken),
      cache: 'no-store',
    })
    const parsed = await parseEnvelope<Obj12SessionPayload>(response)
    setLoading(false)

    if (!parsed.ok) {
      clearStoredState()
      setState(emptyState)
      setErrorMessage(parsed.message)
      return false
    }

    const nextState = toStoredState(parsed.data)
    writeStoredState(nextState)
    setState(nextState)
    setErrorMessage('')
    return true
  }

  async function loginLocal(username: string, password: string): Promise<boolean> {
    setLoading(true)
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'local',
        username,
        password,
      }),
    })
    const parsed = await parseEnvelope<Obj12SessionPayload>(response)
    setLoading(false)

    if (!parsed.ok) {
      setErrorMessage(parsed.message)
      return false
    }

    const nextState = toStoredState(parsed.data)
    writeStoredState(nextState)
    setState(nextState)
    setErrorMessage('')
    return true
  }

  async function exchangeOidcToken(token: string): Promise<boolean> {
    setLoading(true)
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'oidc',
        token,
      }),
    })
    const parsed = await parseEnvelope<Obj12SessionPayload>(response)
    setLoading(false)

    if (!parsed.ok) {
      setErrorMessage(parsed.message)
      return false
    }

    const nextState = toStoredState(parsed.data)
    writeStoredState(nextState)
    setState(nextState)
    setErrorMessage('')
    return true
  }

  function setTokenManually(token: string): void {
    const nextState: Obj12SessionState = {
      ...state,
      accessToken: token.trim(),
    }
    writeStoredState(nextState)
    setState(nextState)
  }

  async function logout(): Promise<void> {
    const accessToken = state.accessToken.trim()
    if (accessToken) {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: withObj12Authorization(undefined, accessToken),
      }).catch(() => undefined)
    }

    clearStoredState()
    setState(emptyState)
    setErrorMessage('')
  }

  return {
    accessToken: state.accessToken,
    authMode: state.authMode,
    currentSession: state.session,
    expiresAt: state.expiresAt,
    hydrated,
    loading,
    errorMessage,
    setErrorMessage,
    loginLocal,
    exchangeOidcToken,
    refreshSession,
    setTokenManually,
    logout,
  }
}
