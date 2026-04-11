'use client'

import { startTransition, useDeferredValue, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import type {
  Obj22ArtifactKind,
  Obj22GateDecision,
  Obj22GateReport,
  Obj22GateSummary,
} from '@/lib/obj22-release-gate'

const allValue = 'ALL'

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

function formatBytes(value: number | null): string {
  if (value === null) {
    return 'n/a'
  }
  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`
  }
  if (value >= 1024) {
    return `${(value / 1024).toFixed(1)} KB`
  }
  return `${value} B`
}

function decisionClassName(decision: Obj22GateDecision): string {
  if (decision === 'pass') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (decision === 'accepted-risk') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-rose-200 bg-rose-50 text-rose-700'
}

function artifactKindClassName(kind: Obj22ArtifactKind): string {
  if (kind === 'oci-image') {
    return 'border-sky-200 bg-sky-50 text-sky-700'
  }
  if (kind === 'zarf-package') {
    return 'border-indigo-200 bg-indigo-50 text-indigo-700'
  }
  if (kind === 'manifest-bundle') {
    return 'border-violet-200 bg-violet-50 text-violet-700'
  }
  if (kind === 'security-bundle') {
    return 'border-slate-200 bg-slate-100 text-slate-700'
  }
  return 'border-stone-200 bg-stone-100 text-stone-700'
}

function gateCheckLabel(state: boolean): string {
  return state ? 'ok' : 'blocked'
}

function checkClassName(state: boolean): string {
  return state
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-rose-200 bg-rose-50 text-rose-700'
}

function filterReports(
  reports: Obj22GateReport[],
  query: string,
  decision: Obj22GateDecision | null,
  artifactKind: Obj22ArtifactKind | null,
): Obj22GateReport[] {
  const normalizedQuery = query.trim().toLowerCase()

  return reports
    .map((report) => ({
      ...report,
      artifacts: artifactKind
        ? report.artifacts.filter((artifact) => artifact.kind === artifactKind)
        : report.artifacts,
    }))
    .filter((report) => {
      if (decision && report.decision !== decision) {
        return false
      }
      if (artifactKind && report.artifacts.length === 0) {
        return false
      }
      if (!normalizedQuery) {
        return true
      }

      return (
        report.version.toLowerCase().includes(normalizedQuery) ||
        report.releaseTitle.toLowerCase().includes(normalizedQuery) ||
        report.artifacts.some(
          (artifact) =>
            artifact.name.toLowerCase().includes(normalizedQuery) ||
            artifact.reference.toLowerCase().includes(normalizedQuery),
        )
      )
    })
}

export function GateDashboard({
  service,
  sourceOfTruth,
  updatedAt,
  policyVersion,
  summary,
  latest,
  reports,
}: {
  service: string
  sourceOfTruth: string
  updatedAt: string
  policyVersion: string
  summary: Obj22GateSummary
  latest: Obj22GateReport | null
  reports: Obj22GateReport[]
}) {
  const [query, setQuery] = useState('')
  const [decisionFilter, setDecisionFilter] = useState<Obj22GateDecision | null>(null)
  const [artifactKindFilter, setArtifactKindFilter] = useState<Obj22ArtifactKind | null>(null)
  const deferredQuery = useDeferredValue(query)

  const filteredReports = filterReports(
    reports,
    deferredQuery,
    decisionFilter,
    artifactKindFilter,
  )

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(190,24,93,0.10),_transparent_36%),linear-gradient(180deg,#fff7ed_0%,#fffaf0_42%,#f8fafc_100%)] px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-rose-700">OBJ-22</p>
          <div className="mt-2 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Publish Gate Dashboard
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
                Lesesicht fuer die versionierte Artefaktpruefung vor Publish, Export und
                Offline-Weitergabe. Die Primaerquelle bleibt Git, der Gate-Report macht
                Blocker, Risiken und dokumentierte Ausnahmen fuer Nicht-Entwickler sichtbar.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p>Service: {service}</p>
              <p>Source of truth: {sourceOfTruth}</p>
              <p>Policy: {policyVersion}</p>
              <p>Aktualisiert: {formatDateTime(updatedAt)}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Latest Decision</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Badge variant="outline" className={decisionClassName(latest?.decision ?? 'fail')}>
                {latest?.decision ?? 'n/a'}
              </Badge>
              <p className="text-sm text-slate-600">{latest?.version ?? 'n/a'}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Blocked Releases</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-semibold text-rose-700">
              {summary.blockingReports}
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Accepted Risk</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-semibold text-amber-700">
              {summary.releaseDecisions['accepted-risk']}
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Pass</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-semibold text-emerald-700">
              {summary.releaseDecisions.pass}
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Reports</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-semibold text-slate-950">
              {summary.totalReports}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle>Filter</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <Input
                value={query}
                onChange={(event) => {
                  const nextValue = event.target.value
                  startTransition(() => {
                    setQuery(nextValue)
                  })
                }}
                placeholder="Version, Titel oder Artefakt suchen"
              />
              <Select
                value={decisionFilter ?? allValue}
                onValueChange={(value) => {
                  startTransition(() => {
                    setDecisionFilter(
                      value === allValue ? null : (value as Obj22GateDecision),
                    )
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={allValue}>Alle Entscheidungen</SelectItem>
                  <SelectItem value="pass">pass</SelectItem>
                  <SelectItem value="accepted-risk">accepted-risk</SelectItem>
                  <SelectItem value="fail">fail</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={artifactKindFilter ?? allValue}
                onValueChange={(value) => {
                  startTransition(() => {
                    setArtifactKindFilter(
                      value === allValue ? null : (value as Obj22ArtifactKind),
                    )
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Artefakt-Typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={allValue}>Alle Artefakt-Typen</SelectItem>
                  {summary.artifactKinds.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {kind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/90">
            <CardHeader>
              <CardTitle>Block-Verhalten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>
                `fail` blockiert Publish, Export und Offline-Weitergabe konsequent.
              </p>
              <p>
                `accepted-risk` erlaubt die Fortsetzung nur mit dokumentierter Ausnahme,
                Owner und Verfallsdatum.
              </p>
              <p>
                `pass` bedeutet, dass Allowlist, Inhaltspruefung, Groessenlimits und
                OCI-Nachweise fuer den jeweiligen Bericht bestanden wurden.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Release Reports</h2>
              <p className="text-sm text-slate-600">
                {filteredReports.length} von {reports.length} Reports sichtbar
              </p>
            </div>
            <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
              API: /api/v1/gate
            </Badge>
          </div>

          <Accordion type="multiple" className="space-y-3">
            {filteredReports.map((report) => (
              <AccordionItem
                key={report.version}
                value={report.version}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4"
              >
                <AccordionTrigger className="py-4 text-left hover:no-underline">
                  <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{report.version}</p>
                      <p className="text-sm text-slate-600">{report.releaseTitle}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={decisionClassName(report.decision)}>
                        {report.decision}
                      </Badge>
                      <Badge variant="outline" className={checkClassName(!report.blockPublish)}>
                        Publish {report.blockPublish ? 'blocked' : 'open'}
                      </Badge>
                      <Badge variant="outline" className={checkClassName(!report.blockExport)}>
                        Export {report.blockExport ? 'blocked' : 'open'}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-4">
                  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Card className="border-slate-200 bg-white/90">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Artifacts</CardTitle>
                      </CardHeader>
                      <CardContent className="text-lg font-semibold text-slate-950">
                        {report.summary.artifactCount}
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200 bg-white/90">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Pass</CardTitle>
                      </CardHeader>
                      <CardContent className="text-lg font-semibold text-emerald-700">
                        {report.summary.passedArtifacts}
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200 bg-white/90">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Accepted Risk</CardTitle>
                      </CardHeader>
                      <CardContent className="text-lg font-semibold text-amber-700">
                        {report.summary.acceptedRiskArtifacts}
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200 bg-white/90">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Blocking Violations</CardTitle>
                      </CardHeader>
                      <CardContent className="text-lg font-semibold text-rose-700">
                        {report.summary.blockingViolations}
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200 bg-white/90">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-600">Generated</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm font-medium text-slate-700">
                        {formatDateTime(report.generatedAt)}
                      </CardContent>
                    </Card>
                  </section>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Artefakt</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Decision</TableHead>
                        <TableHead>Allowlist</TableHead>
                        <TableHead>OCI</TableHead>
                        <TableHead>Size / Count</TableHead>
                        <TableHead>Violations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.artifacts.map((artifact) => (
                        <TableRow key={artifact.id}>
                          <TableCell className="align-top">
                            <div className="space-y-1">
                              <p className="font-medium text-slate-950">{artifact.name}</p>
                              <p className="text-xs text-slate-500">{artifact.reference}</p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant="outline" className={artifactKindClassName(artifact.kind)}>
                              {artifact.kind}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant="outline" className={decisionClassName(artifact.decision)}>
                              {artifact.decision}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className={checkClassName(artifact.checks.allowlist)}>
                                Allowlist {gateCheckLabel(artifact.checks.allowlist)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={checkClassName(artifact.checks.forbiddenContent)}
                              >
                                Content {gateCheckLabel(artifact.checks.forbiddenContent)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant="outline" className={checkClassName(artifact.checks.ociConformant)}>
                              OCI {gateCheckLabel(artifact.checks.ociConformant)}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top text-sm text-slate-700">
                            <p>{formatBytes(artifact.sizeBytes)}</p>
                            <p>{artifact.fileCount ?? 'n/a'} Dateien</p>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="space-y-2">
                              {artifact.violations.length === 0 ? (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-200 bg-emerald-50 text-emerald-700"
                                >
                                  keine
                                </Badge>
                              ) : (
                                artifact.violations.map((violation) => (
                                  <div
                                    key={`${artifact.id}-${violation.ruleId}-${violation.path ?? 'global'}`}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                                  >
                                    <p className="font-medium text-slate-900">
                                      {violation.ruleId}
                                      {violation.waived ? ' (accepted-risk)' : ''}
                                    </p>
                                    <p>{violation.message}</p>
                                    {violation.path ? (
                                      <p className="mt-1 text-slate-500">{violation.path}</p>
                                    ) : null}
                                  </div>
                                ))
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {report.exceptionsApplied.length > 0 ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      <p className="font-medium">Dokumentierte Ausnahmen</p>
                      <div className="mt-2 space-y-2">
                        {report.exceptionsApplied.map((exception) => (
                          <div key={exception.id}>
                            <p>{exception.title}</p>
                            <p className="text-xs text-amber-800">
                              {exception.id} | Approved by {exception.approvedBy} | gueltig bis{' '}
                              {exception.expiresAt}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </main>
  )
}
