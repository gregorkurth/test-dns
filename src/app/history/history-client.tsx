'use client'

import Link from 'next/link'
import { startTransition, useDeferredValue, useMemo, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Obj24DiffEntry = {
  path: string
  changeType: 'added' | 'removed' | 'changed'
  beforeValue: unknown
  afterValue: unknown
}

type Obj24HistoryEntry = {
  id: string
  timestamp: string
  actor: string
  changeType: 'baseline_load' | 'manual_update' | 'rollback'
  affectedScope: string[]
  summary: string
  before: unknown
  after: unknown
  diff: Obj24DiffEntry[]
  rollbackOf: string | null
  sourceCommit: string | null
  sourceRef: string | null
  result: 'applied' | 'rejected'
}

type Obj24BaselineStatusView = {
  baseline: {
    status: 'never_loaded' | 'loaded' | 'error'
  }
  initialStateMessage: string
}

const allFilterValue = 'ALL'

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

function changeTypeLabel(changeType: Obj24HistoryEntry['changeType']): string {
  if (changeType === 'baseline_load') {
    return 'Baseline Load'
  }
  if (changeType === 'manual_update') {
    return 'Update'
  }
  return 'Rollback'
}

function changeTypeBadgeClass(changeType: Obj24HistoryEntry['changeType']): string {
  if (changeType === 'baseline_load') {
    return 'border-sky-200 bg-sky-50 text-sky-700'
  }
  if (changeType === 'manual_update') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function buildExportUrl(
  format: 'json' | 'csv',
  filters: {
    actor: string
    scope: string
    changeType: Obj24HistoryEntry['changeType'] | null
    from: string
    to: string
  },
): string {
  const params = new URLSearchParams()
  params.set('format', format)
  if (filters.actor.trim()) {
    params.set('actor', filters.actor.trim())
  }
  if (filters.scope.trim()) {
    params.set('scope', filters.scope.trim())
  }
  if (filters.changeType) {
    params.set('changeType', filters.changeType)
  }
  if (filters.from.trim()) {
    params.set('from', filters.from.trim())
  }
  if (filters.to.trim()) {
    params.set('to', filters.to.trim())
  }
  return `/api/v1/history/export?${params.toString()}`
}

export function Obj24HistoryClient({
  initialBaselineStatus,
  initialEntries,
}: {
  initialBaselineStatus: Obj24BaselineStatusView
  initialEntries: Obj24HistoryEntry[]
}) {
  const [entries, setEntries] = useState(initialEntries)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(
    initialEntries[0]?.id ?? null,
  )
  const [actorFilter, setActorFilter] = useState('')
  const [scopeFilter, setScopeFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<Obj24HistoryEntry['changeType'] | null>(null)
  const [fromFilter, setFromFilter] = useState('')
  const [toFilter, setToFilter] = useState('')
  const [rollbackActor, setRollbackActor] = useState('')
  const [rollbackSummary, setRollbackSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const deferredActorFilter = useDeferredValue(actorFilter)
  const deferredScopeFilter = useDeferredValue(scopeFilter)

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) ?? null,
    [entries, selectedEntryId],
  )

  const refreshHistory = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    setStatusMessage(null)

    try {
      const params = new URLSearchParams()
      params.set('limit', '200')
      if (deferredActorFilter.trim()) {
        params.set('actor', deferredActorFilter.trim())
      }
      if (deferredScopeFilter.trim()) {
        params.set('scope', deferredScopeFilter.trim())
      }
      if (typeFilter) {
        params.set('changeType', typeFilter)
      }
      if (fromFilter.trim()) {
        params.set('from', fromFilter.trim())
      }
      if (toFilter.trim()) {
        params.set('to', toFilter.trim())
      }

      const response = await fetch(`/api/v1/history?${params.toString()}`, {
        cache: 'no-store',
      })
      const body = await response.json()
      if (!response.ok) {
        throw new Error(body.error?.message || 'Historie konnte nicht geladen werden.')
      }

      const nextEntries = Array.isArray(body.data?.entries)
        ? (body.data.entries as Obj24HistoryEntry[])
        : []
      setEntries(nextEntries)
      setSelectedEntryId(nextEntries[0]?.id ?? null)
      setStatusMessage(`Historie aktualisiert (${nextEntries.length} Eintraege).`)
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const onApplyFilters = async () => {
    await refreshHistory()
  }

  const onRollback = async () => {
    if (!selectedEntry) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const response = await fetch(`/api/v1/history/${selectedEntry.id}/rollback`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          actor: rollbackActor || undefined,
          summary: rollbackSummary || undefined,
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        throw new Error(body.error?.message || 'Rollback konnte nicht ausgefuehrt werden.')
      }

      setStatusMessage(`Rollback ausgefuehrt. Neuer Eintrag: ${body.data?.id ?? 'n/a'}`)
      setRollbackSummary('')
      await refreshHistory()
    } catch (error) {
      setErrorMessage((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const exportFilters = {
    actor: deferredActorFilter,
    scope: deferredScopeFilter,
    changeType: typeFilter,
    from: fromFilter,
    to: toFilter,
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">OBJ-24</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Change History & Rollback
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Append-only Verlauf mit Diff-Ansicht, Filter, Rollback als neuer Eintrag
            und Audit-Export als JSON/CSV.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
              {initialBaselineStatus.initialStateMessage}
            </Badge>
            <Badge variant="outline">API: /api/v1/history</Badge>
            <Badge variant="outline">Export: /api/v1/history/export</Badge>
          </div>
        </header>

        {initialBaselineStatus.baseline.status === 'never_loaded' ? (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTitle>Keine Baseline geladen</AlertTitle>
            <AlertDescription>
              Historie ist erst nach dem ersten Baseline-Load belastbar. Bitte zuerst in
              der Baseline-Ansicht laden.
            </AlertDescription>
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Fehler</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {statusMessage ? (
          <Alert className="border-emerald-200 bg-emerald-50">
            <AlertTitle>Status</AlertTitle>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Filter</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="filter-actor">Akteur</Label>
                <Input
                  id="filter-actor"
                  value={actorFilter}
                  onChange={(event) => {
                    const value = event.target.value
                    startTransition(() => setActorFilter(value))
                  }}
                  placeholder="operator oder system"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-scope">Objekt/Scope</Label>
                <Input
                  id="filter-scope"
                  value={scopeFilter}
                  onChange={(event) => {
                    const value = event.target.value
                    startTransition(() => setScopeFilter(value))
                  }}
                  placeholder="participants, zones, ..."
                />
              </div>

              <div className="space-y-2">
                <Label>Aenderungstyp</Label>
                <Select
                  value={typeFilter ?? allFilterValue}
                  onValueChange={(value) => {
                    setTypeFilter(
                      value === allFilterValue
                        ? null
                        : (value as Obj24HistoryEntry['changeType']),
                    )
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Typen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={allFilterValue}>Alle Typen</SelectItem>
                    <SelectItem value="baseline_load">Baseline Load</SelectItem>
                    <SelectItem value="manual_update">Update</SelectItem>
                    <SelectItem value="rollback">Rollback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="filter-from">Von (ISO)</Label>
                  <Input
                    id="filter-from"
                    value={fromFilter}
                    onChange={(event) => setFromFilter(event.target.value)}
                    placeholder="2026-04-10T00:00:00Z"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-to">Bis (ISO)</Label>
                  <Input
                    id="filter-to"
                    value={toFilter}
                    onChange={(event) => setToFilter(event.target.value)}
                    placeholder="2026-04-10T23:59:59Z"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>
                Export enthaelt Pflichtfelder fuer Audit: ID, Zeitstempel, Akteur,
                Scope, Zusammenfassung, Ergebnis.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={buildExportUrl('json', exportFilters)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100"
                >
                  Export JSON
                </a>
                <a
                  href={buildExportUrl('csv', exportFilters)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100"
                >
                  Export CSV
                </a>
              </div>
              <Link
                href="/baseline"
                className="inline-flex text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-900"
              >
                Zur Baseline-Ansicht
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Append-only Verlauf</h2>
              <p className="text-sm text-slate-600">
                {entries.length} Eintraege sichtbar
              </p>
            </div>
            <Button type="button" onClick={onApplyFilters} disabled={isLoading}>
              {isLoading ? 'Aktualisiere...' : 'Filter anwenden'}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zeit</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Akteur</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  <TableCell className="align-top text-xs text-slate-600">
                    {formatDateTime(entry.timestamp)}
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge variant="outline" className={changeTypeBadgeClass(entry.changeType)}>
                      {changeTypeLabel(entry.changeType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top text-sm text-slate-700">{entry.actor}</TableCell>
                  <TableCell className="align-top text-sm text-slate-700">
                    {entry.affectedScope.join(', ')}
                  </TableCell>
                  <TableCell className="align-top text-sm text-slate-700">
                    {entry.summary}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        {selectedEntry ? (
          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle>Diff-Ansicht ({selectedEntry.id})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                  <p>
                    <span className="font-medium text-slate-900">Akteur:</span>{' '}
                    {selectedEntry.actor}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Typ:</span>{' '}
                    {changeTypeLabel(selectedEntry.changeType)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Source Commit:</span>{' '}
                    <span className="font-mono text-xs">
                      {selectedEntry.sourceCommit ?? 'n/a'}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Source Ref:</span>{' '}
                    {selectedEntry.sourceRef ?? 'n/a'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-900">Feldbasierter Diff</p>
                  {selectedEntry.diff.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-600">Keine Feldaenderungen erkannt.</p>
                  ) : (
                    <ul className="mt-2 space-y-2 text-xs text-slate-700">
                      {selectedEntry.diff.slice(0, 100).map((item, index) => (
                        <li
                          key={`${selectedEntry.id}-${item.path}-${index.toString()}`}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"
                        >
                          <p className="font-mono text-[11px]">{item.path}</p>
                          <p className="text-slate-600">Typ: {item.changeType}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-900">Before</p>
                    <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-700">
                      {JSON.stringify(selectedEntry.before, null, 2)}
                    </pre>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-900">After</p>
                    <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-700">
                      {JSON.stringify(selectedEntry.after, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rollback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-700">
                  Rollback erzeugt einen neuen Verlaufseintrag und ueberschreibt
                  keinen bestehenden Eintrag (append-only).
                </p>
                <div className="space-y-2">
                  <Label htmlFor="rollback-actor">Akteur (optional)</Label>
                  <Input
                    id="rollback-actor"
                    value={rollbackActor}
                    onChange={(event) => setRollbackActor(event.target.value)}
                    placeholder="system/anonymous"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollback-summary">Kurzbeschreibung (optional)</Label>
                  <Input
                    id="rollback-summary"
                    value={rollbackSummary}
                    onChange={(event) => setRollbackSummary(event.target.value)}
                    placeholder="Warum wird dieser Eintrag rollbackt?"
                  />
                </div>
                <Button type="button" onClick={onRollback} disabled={isLoading}>
                  {isLoading ? 'Rollback laeuft...' : `Rollback fuer ${selectedEntry.id}`}
                </Button>
              </CardContent>
            </Card>
          </section>
        ) : (
          <Alert>
            <AlertTitle>Kein Verlaufseintrag ausgewaehlt</AlertTitle>
            <AlertDescription>
              Sobald Eintraege vorhanden sind, kannst du hier Diff und Rollback sehen.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </main>
  )
}
