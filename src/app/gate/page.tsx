'use client'

import { useEffect, useState } from 'react'

import { GateDashboard } from '@/app/gate/gate-dashboard'
import { AuthGuard } from '@/components/auth-guard'
import { useObj12Auth, withObj12Authorization } from '@/lib/obj12-client-auth'

interface GateApiResponse {
  data: {
    service: string
    sourceOfTruth: string
    updatedAt: string
    policyVersion: string
    summary: Record<string, unknown>
    latest: Record<string, unknown> | null
    reports: Record<string, unknown>[]
  } | null
  error: { code?: string; message?: string } | null
}

function GatePageContent() {
  const auth = useObj12Auth()
  const [data, setData] = useState<GateApiResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.accessToken) {
      return
    }

    async function fetchGateData() {
      setLoading(true)
      try {
        const response = await fetch('/api/v1/gate', {
          headers: withObj12Authorization(undefined, auth.accessToken),
          cache: 'no-store',
        })
        const json = (await response.json()) as GateApiResponse
        if (json.data) {
          setData(json.data)
        } else {
          setError(json.error?.message ?? 'Gate-Daten konnten nicht geladen werden.')
        }
      } catch {
        setError('Gate-API ist nicht erreichbar.')
      } finally {
        setLoading(false)
      }
    }

    fetchGateData()
  }, [auth.accessToken])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Gate-Daten werden geladen...</p>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-rose-600">{error ?? 'Keine Daten verfuegbar.'}</p>
      </main>
    )
  }

  return (
    <GateDashboard
      service={data.service}
      sourceOfTruth={data.sourceOfTruth}
      updatedAt={data.updatedAt}
      policyVersion={data.policyVersion}
      summary={data.summary as never}
      latest={data.latest as never}
      reports={data.reports as never}
    />
  )
}

export default function GatePage() {
  return (
    <AuthGuard minimumRole="viewer">
      <GatePageContent />
    </AuthGuard>
  )
}
