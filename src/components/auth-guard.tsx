'use client'

import { useEffect } from 'react'

import { useObj12Auth } from '@/lib/obj12-client-auth'

interface AuthGuardProps {
  children: React.ReactNode
  minimumRole?: 'viewer' | 'operator' | 'admin'
}

export function AuthGuard({ children, minimumRole = 'viewer' }: AuthGuardProps) {
  const auth = useObj12Auth()
  const refreshSession = auth.refreshSession

  useEffect(() => {
    if (auth.hydrated && !auth.accessToken) {
      return
    }

    if (auth.hydrated && auth.accessToken && !auth.currentSession) {
      refreshSession()
    }
  }, [auth.hydrated, auth.accessToken, auth.currentSession, refreshSession])

  if (!auth.hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Session wird geprueft...</p>
      </main>
    )
  }

  if (!auth.accessToken || !auth.currentSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-amber-900">
            Zugriff eingeschraenkt
          </h1>
          <p className="mt-2 text-sm text-amber-700">
            Diese Seite erfordert eine Anmeldung mit der Rolle{' '}
            <strong>{minimumRole}</strong> oder hoeher.
          </p>
          <p className="mt-4 text-sm text-amber-600">
            Bitte melden Sie sich unter{' '}
            <a href="/auth" className="underline hover:text-amber-800">
              /auth
            </a>{' '}
            an.
          </p>
        </div>
      </main>
    )
  }

  const roleOrder: Record<string, number> = {
    viewer: 1,
    operator: 2,
    admin: 3,
  }

  const currentRoleLevel = roleOrder[auth.currentSession.role] ?? 0
  const requiredRoleLevel = roleOrder[minimumRole] ?? 0

  if (currentRoleLevel < requiredRoleLevel) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-rose-900">
            Berechtigung nicht ausreichend
          </h1>
          <p className="mt-2 text-sm text-rose-700">
            Diese Seite erfordert die Rolle <strong>{minimumRole}</strong>.
            Ihre aktuelle Rolle: <strong>{auth.currentSession.role}</strong>.
          </p>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
