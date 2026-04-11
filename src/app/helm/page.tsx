'use client'

import { useEffect, useState } from 'react'

import { AuthGuard } from '@/components/auth-guard'
import { useObj12Auth, withObj12Authorization } from '@/lib/obj12-client-auth'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface HelmStatusData {
  generatedAt: string
  sourceOfTruth: string
  chartPath: string
  chart: {
    name: string
    description: string
    version: string
    appVersion: string
    semverValid: boolean
  }
  files: Array<{ path: string; required: boolean; present: boolean }>
  checks: Array<{
    profile: string
    checkType: string
    command: string
    status: 'passed' | 'failed' | 'skipped'
    reason: string | null
  }>
  summary: {
    totalChecks: number
    passedChecks: number
    failedChecks: number
    skippedChecks: number
  }
  release: {
    releaseName: string
    namespace: string
    command: string
    checkState: 'available' | 'missing' | 'skipped' | 'error'
    releaseStatus: string | null
    revision: string | null
    chart: string | null
    reason: string | null
  }
  oci: {
    ready: boolean
    repository: string
    packageCommand: string
    pushCommand: string
    reasons: string[]
  }
  imageDigestWarning?: string | null
}

function checkStatusClassName(value: 'passed' | 'failed' | 'skipped') {
  if (value === 'passed') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (value === 'failed') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function releaseStateClassName(value: 'available' | 'missing' | 'skipped' | 'error') {
  if (value === 'available') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (value === 'missing') {
    return 'border-slate-200 bg-slate-50 text-slate-700'
  }
  if (value === 'error') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function HelmPageContent() {
  const auth = useObj12Auth()
  const [data, setData] = useState<HelmStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.accessToken) {
      return
    }

    async function fetchHelmData() {
      setLoading(true)
      try {
        const response = await fetch('/api/v1/helm/status?runChecks=true', {
          headers: withObj12Authorization(undefined, auth.accessToken),
          cache: 'no-store',
        })
        const json = (await response.json()) as { data?: HelmStatusData; error?: { message?: string } }
        if (json.data) {
          setData(json.data)
        } else {
          setError(json.error?.message ?? 'Helm-Status konnte nicht geladen werden.')
        }
      } catch {
        setError('Helm-Status-API ist nicht erreichbar.')
      } finally {
        setLoading(false)
      }
    }

    fetchHelmData()
  }, [auth.accessToken])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Helm-Daten werden geladen...</p>
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
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">OBJ-25</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            Helm Chart Management View
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Chart-Status, lokale/offline Lint- und Template-Checks sowie OCI Push
            Readiness aus Repository-Daten.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Datenstand: {new Date(data.generatedAt).toLocaleString('de-CH')}
          </p>
        </header>

        {data.imageDigestWarning && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>Supply-Chain-Warnung:</strong> {data.imageDigestWarning}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Chart Version</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-slate-900">{data.chart.version}</p>
              <p className="text-xs text-slate-500">appVersion: {data.chart.appVersion}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Offline Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-slate-900">{data.summary.passedChecks}</p>
              <p className="text-xs text-slate-500">
                passed / {data.summary.totalChecks} total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-slate-900">{data.summary.failedChecks}</p>
              <p className="text-xs text-slate-500">skipped: {data.summary.skippedChecks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">OCI Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant="outline"
                className={
                  data.oci.ready
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                }
              >
                {data.oci.ready ? 'ready' : 'review needed'}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Release Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant="outline"
                className={releaseStateClassName(data.release.checkState)}
              >
                {data.release.checkState}
              </Badge>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-950">Required Files</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Path</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.files.map((entry) => (
                <TableRow key={entry.path}>
                  <TableCell className="font-mono text-xs">{entry.path}</TableCell>
                  <TableCell>{entry.required ? 'yes' : 'no'}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        entry.present
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-rose-200 bg-rose-50 text-rose-700'
                      }
                    >
                      {entry.present ? 'present' : 'missing'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-950">Lint / Template Checks</h2>
          {data.checks.length === 0 ? (
            <p className="text-sm text-slate-600">Checks wurden nicht ausgefuehrt.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>Check</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Command</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.checks.map((entry) => (
                  <TableRow key={`${entry.profile}-${entry.checkType}`}>
                    <TableCell>{entry.profile}</TableCell>
                    <TableCell>{entry.checkType}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={checkStatusClassName(entry.status)}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{entry.command}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {entry.reason ?? 'ok'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>OCI Push Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>Repository: {data.oci.repository}</p>
              <p className="font-mono text-xs">{data.oci.packageCommand}</p>
              <p className="font-mono text-xs">{data.oci.pushCommand}</p>
              {data.oci.reasons.length > 0 ? (
                <ul className="list-disc space-y-1 pl-4">
                  {data.oci.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p>Keine offenen Blocker fuer OCI Chart Push erkannt.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Chart Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>Name: {data.chart.name}</p>
              <p>Description: {data.chart.description}</p>
              <p>Chart path: {data.chartPath}</p>
              <p>Semver valid: {data.chart.semverValid ? 'yes' : 'no'}</p>
              <p>Source of truth: {data.sourceOfTruth}</p>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-950">Helm Release Status</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Release</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Revision</TableHead>
                <TableHead>Chart</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{data.release.releaseName}</TableCell>
                <TableCell>{data.release.namespace}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={releaseStateClassName(data.release.checkState)}
                  >
                    {data.release.checkState}
                  </Badge>
                </TableCell>
                <TableCell>{data.release.releaseStatus ?? '-'}</TableCell>
                <TableCell>{data.release.revision ?? '-'}</TableCell>
                <TableCell>{data.release.chart ?? '-'}</TableCell>
                <TableCell className="text-sm text-slate-600">
                  {data.release.reason ?? 'ok'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="mt-3 font-mono text-xs text-slate-500">{data.release.command}</p>
        </section>
      </div>
    </main>
  )
}

export default function HelmPage() {
  return (
    <AuthGuard minimumRole="viewer">
      <HelmPageContent />
    </AuthGuard>
  )
}
