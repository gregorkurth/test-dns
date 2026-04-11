'use client'

import Link from 'next/link'
import { startTransition, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type BaselineStatus = {
  status: 'never_loaded' | 'loaded' | 'error'
  repoUrl: string | null
  ref: string | null
  commitSha: string | null
  baselineFile: string | null
  loadedAt: string | null
  sourceRef: string | null
  lastError: string | null
}

type HistoryEntry = {
  id: string
  timestamp: string
  actor: string
  changeType: 'baseline_load' | 'manual_update' | 'rollback'
  summary: string
}

type BaselineStatusResponse = {
  baseline: BaselineStatus
  initialStateMessage: string
  currentSnapshotAvailable: boolean
  latestHistoryEntry: HistoryEntry | null
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'n/a'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

function statusBadgeClass(status: BaselineStatus['status']): string {
  if (status === 'loaded') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (status === 'error') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

export function Obj24BaselineClient({
  initialStatus,
}: {
  initialStatus: BaselineStatusResponse
}) {
  const [statusView, setStatusView] = useState(initialStatus)
  const [repoUrl, setRepoUrl] = useState('')
  const [refValue, setRefValue] = useState('main')
  const [baselineFile, setBaselineFile] = useState('baseline/dns-config.json')
  const [actor, setActor] = useState('')
  const [summary, setSummary] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const refreshStatus = async () => {
    const response = await fetch('/api/v1/baseline', { cache: 'no-store' })
    const body = await response.json()
    if (!response.ok || !body.data) {
      throw new Error(body.error?.message || 'Baseline-Status konnte nicht aktualisiert werden.')
    }
    setStatusView(body.data as BaselineStatusResponse)
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/v1/baseline/load', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl,
          ref: refValue,
          baselineFile,
          actor: actor || undefined,
          summary: summary || undefined,
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        throw new Error(body.error?.message || 'Baseline konnte nicht geladen werden.')
      }

      await refreshStatus()
      setSuccessMessage('Baseline wurde erfolgreich geladen und in der Historie protokolliert.')
      setSummary('')
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">OBJ-24</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Baseline Repository
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            DNS-Grundkonfiguration aus separatem Git-Repository laden, inklusive Source-Ref
            (Branch/Tag + Commit SHA) und nachvollziehbarer Historie.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={statusBadgeClass(statusView.baseline.status)}>
              {statusView.initialStateMessage}
            </Badge>
            <Badge variant="outline">API: /api/v1/baseline</Badge>
            <Badge variant="outline">Load: /api/v1/baseline/load</Badge>
          </div>
        </header>

        {statusView.baseline.status === 'never_loaded' ? (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTitle>Keine Baseline geladen</AlertTitle>
            <AlertDescription>
              Bitte zuerst Repository, Ref und Baseline-Datei konfigurieren.
              Danach wird der exakte Quellenstand inklusive SHA angezeigt.
            </AlertDescription>
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert className="border-emerald-200 bg-emerald-50">
            <AlertTitle>Status</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Baseline laden</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="repo-url">Repository URL/Pfad</Label>
                  <Input
                    id="repo-url"
                    value={repoUrl}
                    onChange={(event) => {
                      const value = event.target.value
                      startTransition(() => {
                        setRepoUrl(value)
                      })
                    }}
                    placeholder="/pfad/zum/repo oder https://git.example.local/dns-baseline.git"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ref">Branch/Tag/Ref</Label>
                    <Input
                      id="ref"
                      value={refValue}
                      onChange={(event) => setRefValue(event.target.value)}
                      placeholder="main"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baseline-file">Baseline-Datei</Label>
                    <Input
                      id="baseline-file"
                      value={baselineFile}
                      onChange={(event) => setBaselineFile(event.target.value)}
                      placeholder="baseline/dns-config.json"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="actor">Akteur (optional)</Label>
                    <Input
                      id="actor"
                      value={actor}
                      onChange={(event) => setActor(event.target.value)}
                      placeholder="system/anonymous"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Kurzbeschreibung (optional)</Label>
                    <Textarea
                      id="summary"
                      value={summary}
                      onChange={(event) => setSummary(event.target.value)}
                      rows={2}
                      placeholder="Warum wurde diese Baseline geladen?"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Lade Baseline...' : 'Baseline laden'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktueller Quellenstand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-900">Repository:</span>{' '}
                {statusView.baseline.repoUrl ?? 'n/a'}
              </p>
              <p>
                <span className="font-medium text-slate-900">Ref:</span>{' '}
                {statusView.baseline.ref ?? 'n/a'}
              </p>
              <p>
                <span className="font-medium text-slate-900">Commit SHA:</span>{' '}
                <span className="font-mono">{statusView.baseline.commitSha ?? 'n/a'}</span>
              </p>
              <p>
                <span className="font-medium text-slate-900">Source-Ref:</span>{' '}
                {statusView.baseline.sourceRef ?? 'n/a'}
              </p>
              <p>
                <span className="font-medium text-slate-900">Baseline-Datei:</span>{' '}
                {statusView.baseline.baselineFile ?? 'n/a'}
              </p>
              <p>
                <span className="font-medium text-slate-900">Geladen am:</span>{' '}
                {formatDate(statusView.baseline.loadedAt)}
              </p>
              <p>
                <span className="font-medium text-slate-900">Snapshot:</span>{' '}
                {statusView.currentSnapshotAvailable ? 'vorhanden' : 'nicht vorhanden'}
              </p>
              {statusView.baseline.lastError ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-800">
                  Letzter Fehler: {statusView.baseline.lastError}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Naechster Schritt</h2>
          <p className="mt-2 text-sm text-slate-600">
            Nach dem Laden kannst du unter <span className="font-mono">/history</span> den
            append-only Verlauf, Diff-Ansicht, Rollback und JSON/CSV-Export nutzen.
          </p>
          <div className="mt-4">
            <Link
              href="/history"
              className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              Zur History-Ansicht
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
