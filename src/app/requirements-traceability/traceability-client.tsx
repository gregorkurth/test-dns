'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type {
  Obj7Priority,
  Obj7RequirementFilterStatus,
  Obj7RequirementTraceabilityEntry,
  Obj7RequirementStatus,
  Obj7SourceType,
  Obj7TraceabilityData,
  Obj7TraceabilityFilters,
} from '@/lib/obj7-traceability'

function statusLabel(status: Obj7RequirementStatus): string {
  if (status === 'fulfilled') {
    return 'Fulfilled'
  }
  if (status === 'partial') {
    return 'Partial'
  }
  if (status === 'open') {
    return 'Open'
  }
  return 'Manual'
}

function statusClassName(status: Obj7RequirementStatus): string {
  if (status === 'fulfilled') {
    return 'border-emerald-200 bg-emerald-100 text-emerald-700'
  }
  if (status === 'partial') {
    return 'border-amber-200 bg-amber-100 text-amber-800'
  }
  if (status === 'open') {
    return 'border-red-200 bg-red-100 text-red-700'
  }
  return 'border-slate-200 bg-slate-100 text-slate-700'
}

function rowClassName(entry: Obj7RequirementTraceabilityEntry): string {
  if (entry.status === 'open' && entry.priority === 'MUSS') {
    return 'bg-red-50'
  }
  if (entry.status === 'partial') {
    return 'bg-amber-50/60'
  }
  return ''
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

function filterLabel(value: Obj7SourceType | Obj7Priority | Obj7RequirementFilterStatus | 'ALL'): string {
  return value
}

function filterTraceabilityEntries(
  entries: Obj7RequirementTraceabilityEntry[],
  filters: Obj7TraceabilityFilters,
): Obj7RequirementTraceabilityEntry[] {
  return entries.filter((entry) => {
    if (filters.sourceType !== 'ALL' && entry.sourceType !== filters.sourceType) {
      return false
    }
    if (filters.priority !== 'ALL' && entry.priority !== filters.priority) {
      return false
    }
    if (filters.status !== 'ALL' && entry.status !== filters.status) {
      return false
    }
    if (filters.onlyOpen && entry.status !== 'open') {
      return false
    }
    return true
  })
}

export function TraceabilityClient({
  initialData,
}: {
  initialData: Obj7TraceabilityData
}) {
  const [sourceType, setSourceType] = useState<Obj7TraceabilityData['filters']['sourceTypes'][number] | 'ALL'>('ALL')
  const [priority, setPriority] = useState<Obj7TraceabilityData['filters']['priorities'][number] | 'ALL'>('ALL')
  const [status, setStatus] = useState<Obj7RequirementFilterStatus>('ALL')
  const [onlyOpen, setOnlyOpen] = useState(false)

  const filteredRequirements = filterTraceabilityEntries(initialData.requirements, {
    sourceType,
    priority,
    status,
    onlyOpen,
  } satisfies Obj7TraceabilityFilters)

  const openMussCount = initialData.summary.mussOpen
  const total = initialData.summary.total
  const fulfilled = initialData.summary.fulfilled

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                OBJ-7 Requirements Traceability View
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-950">
                {fulfilled}/{total} erfuellt ({openMussCount} MUSS offen)
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Offline-faehige Bewertung der Requirements auf Basis von{' '}
                {initialData.sourcePath} und {initialData.participantSourcePath}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700">
                {initialData.participant.available
                  ? `OBJ-5 aktiv: ${initialData.participant.selected?.name ?? 'unbekannt'}`
                  : 'Keine verwertbare OBJ-5-Konfiguration'}
              </Badge>
              <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700">
                {formatDateTime(initialData.generatedAt)}
              </Badge>
            </div>
          </div>

          {initialData.notice ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {initialData.notice}
            </div>
          ) : null}
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Erfuellt</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-slate-950">
              {fulfilled}/{total}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">MUSS offen</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-slate-950">
              {openMussCount}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Manual</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-slate-950">
              {initialData.summary.manual}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Open</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-slate-950">
              {initialData.summary.open}
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="sourceType">Quelle</Label>
              <Select value={sourceType} onValueChange={(value) => setSourceType(value as Obj7SourceType | 'ALL')}>
                <SelectTrigger id="sourceType">
                  <SelectValue placeholder="Alle Quellen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Alle Quellen</SelectItem>
                  {initialData.filters.sourceTypes.map((value) => (
                    <SelectItem key={value} value={value}>
                      {filterLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioritaet</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Obj7Priority | 'ALL')}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Alle Prioritaeten" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Alle Prioritaeten</SelectItem>
                  {initialData.filters.priorities.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as Obj7RequirementFilterStatus)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Alle Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Alle Status</SelectItem>
                  {initialData.filters.statuses.map((value) => (
                    <SelectItem key={value} value={value}>
                      {statusLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                <Switch
                  id="onlyOpen"
                  checked={onlyOpen}
                  onCheckedChange={(checked) => setOnlyOpen(Boolean(checked))}
                />
                <Label htmlFor="onlyOpen" className="cursor-pointer">
                  Nur offene Requirements
                </Label>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSourceType('ALL')
                  setPriority('ALL')
                  setStatus('ALL')
                  setOnlyOpen(false)
                }}
              >
                Filter zuruecksetzen
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-600">
            {filteredRequirements.length} Requirements sichtbar
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requirement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Begruendung</TableHead>
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequirements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                    Keine Requirements fuer die aktuelle Filterkombination gefunden.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequirements.map((entry) => (
                  <TableRow key={entry.key} className={rowClassName(entry)}>
                    <TableCell className="align-top">
                      <div className="flex flex-col gap-2">
                        <div>
                          <div className="text-sm font-semibold text-slate-950">
                            {entry.id} - {entry.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {entry.capabilityId} | {entry.serviceFunctionId}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">
                            {entry.sourceType}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              entry.priority === 'MUSS'
                                ? 'border-red-200 bg-red-100 text-red-700'
                                : 'border-slate-200 bg-slate-100 text-slate-700'
                            }
                          >
                            {entry.priority}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge variant="outline" className={statusClassName(entry.status)}>
                        {statusLabel(entry.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top">
                      <ul className="space-y-1 text-sm text-slate-600">
                        {entry.reasons.length > 0 ? (
                          entry.reasons.map((reason) => <li key={reason}>{reason}</li>)
                        ) : (
                          <li>Keine Begruendung vorhanden.</li>
                        )}
                      </ul>
                    </TableCell>
                    <TableCell className="align-top">
                      <Button asChild variant="outline" size="sm">
                        <a href={entry.deepLink} target="_blank" rel="noreferrer">
                          OBJ-4 Detail
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>
      </div>
    </main>
  )
}
