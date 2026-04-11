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
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type {
  Obj21GitOpsDocument,
  Obj21GitOpsSummary,
  Obj21HealthStatus,
  Obj21ManagedApplication,
  Obj21SourceRole,
  Obj21SyncMode,
} from '@/lib/obj21-gitops'

const allFilterValue = 'ALL'

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

function statusClassName(status: Obj21HealthStatus): string {
  if (status === 'Healthy') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (status === 'Progressing') {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }
  if (status === 'Degraded') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-rose-200 bg-rose-50 text-rose-700'
}

function syncModeClassName(syncMode: Obj21SyncMode): string {
  if (syncMode === 'automated') {
    return 'border-violet-200 bg-violet-50 text-violet-700'
  }

  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function sourceRoleClassName(role: Obj21SourceRole): string {
  if (role === 'release') {
    return 'border-sky-200 bg-sky-50 text-sky-700'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function filterApplications(
  applications: Obj21ManagedApplication[],
  query: string,
  status: Obj21HealthStatus | null,
  syncMode: Obj21SyncMode | null,
  sourceRole: Obj21SourceRole | null,
): Obj21ManagedApplication[] {
  const normalizedQuery = query.trim().toLowerCase()

  return applications.filter((application) => {
    if (status && application.healthStatus !== status) {
      return false
    }
    if (syncMode && application.syncMode !== syncMode) {
      return false
    }
    if (sourceRole && sourceRole === 'release' && application.releaseSourceId !== 'release-source') {
      return false
    }
    if (sourceRole && sourceRole === 'config' && application.configSourceId !== 'config-source') {
      return false
    }
    if (!normalizedQuery) {
      return true
    }

    return (
      application.name.toLowerCase().includes(normalizedQuery) ||
      application.component.toLowerCase().includes(normalizedQuery) ||
      application.namespace.toLowerCase().includes(normalizedQuery) ||
      application.blockingReason?.toLowerCase().includes(normalizedQuery) === true
    )
  })
}

export function GitOpsDashboard({
  document,
  summary,
}: {
  document: Obj21GitOpsDocument
  summary: Obj21GitOpsSummary
}) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Obj21HealthStatus | null>(null)
  const [syncModeFilter, setSyncModeFilter] = useState<Obj21SyncMode | null>(null)
  const [sourceRoleFilter, setSourceRoleFilter] = useState<Obj21SourceRole | null>(null)
  const deferredQuery = useDeferredValue(query)
  const filteredApplications = filterApplications(
    document.applications,
    deferredQuery,
    statusFilter,
    syncModeFilter,
    sourceRoleFilter,
  )

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe_0%,#f8fafc_40%,#eef2ff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">OBJ-21</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                GitOps and Argo CD Control View
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Management-Sicht fuer Root-Application, Child-Applications,
                Quellenbindung und den Offline-Bootstrap des App-of-Apps-Modells.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p>Source of truth: {document.sourceOfTruth}</p>
              <p>Aktualisiert: {formatDateTime(document.updatedAt)}</p>
              <p>API: /api/v1/gitops</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="outline" className={statusClassName(document.rootApplication.healthStatus)}>
              Root Application {document.rootApplication.healthStatus}
            </Badge>
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
              Sync {document.rootApplication.syncStatus}
            </Badge>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              Deployable only with Healthy evidence
            </Badge>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Healthy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{summary.healthyApplications}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Progressing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{summary.progressingApplications}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Degraded</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{summary.degradedApplications}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Missing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{summary.missingApplications}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Deployed-ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{summary.deployableApplications}</p>
              <p className="mt-1 text-xs text-slate-500">Nur Healthy-Apps zaehlen.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Bootstrap offline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {summary.bootstrapOfflineReady ? 'Ready' : 'Open'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {document.bootstrap.length} Schritte dokumentiert
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <Input
                  value={query}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    startTransition(() => {
                      setQuery(nextValue)
                    })
                  }}
                  placeholder="Komponente, Namespace oder Hinweis suchen"
                />
                <Select
                  value={statusFilter ?? allFilterValue}
                  onValueChange={(value) => {
                    startTransition(() => {
                      setStatusFilter(
                        value === allFilterValue ? null : (value as Obj21HealthStatus),
                      )
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Health" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={allFilterValue}>Alle Health-Status</SelectItem>
                    <SelectItem value="Healthy">Healthy</SelectItem>
                    <SelectItem value="Progressing">Progressing</SelectItem>
                    <SelectItem value="Degraded">Degraded</SelectItem>
                    <SelectItem value="Missing">Missing</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={syncModeFilter ?? allFilterValue}
                  onValueChange={(value) => {
                    startTransition(() => {
                      setSyncModeFilter(
                        value === allFilterValue ? null : (value as Obj21SyncMode),
                      )
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sync mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={allFilterValue}>Alle Sync-Modi</SelectItem>
                    <SelectItem value="manual">manual</SelectItem>
                    <SelectItem value="automated">automated</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sourceRoleFilter ?? allFilterValue}
                  onValueChange={(value) => {
                    startTransition(() => {
                      setSourceRoleFilter(
                        value === allFilterValue ? null : (value as Obj21SourceRole),
                      )
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Source role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={allFilterValue}>Alle Quellen</SelectItem>
                    <SelectItem value="release">release</SelectItem>
                    <SelectItem value="config">config</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sync</TableHead>
                      <TableHead>Namespace</TableHead>
                      <TableHead>Decision</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{application.name}</p>
                            <p className="text-xs text-slate-500">{application.component}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusClassName(application.healthStatus)}
                          >
                            {application.healthStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className={syncModeClassName(application.syncMode)}
                            >
                              {application.syncMode}
                            </Badge>
                            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                              {application.syncStatus}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{application.namespace}</TableCell>
                        <TableCell className="max-w-xs text-sm text-slate-600">
                          {application.operatorDecision}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Root Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>Name: {document.rootApplication.name}</p>
                <p>Namespace: {document.rootApplication.namespace}</p>
                <p>Project: {document.rootApplication.project}</p>
                <p>Manifest: {document.rootApplication.manifestRef}</p>
                <p>Bootstrap: {document.rootApplication.bootstrapRef}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Two Source Binding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {document.sources.map((source) => (
                  <div key={source.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{source.name}</p>
                      <Badge
                        variant="outline"
                        className={sourceRoleClassName(source.role)}
                      >
                        {source.role}
                      </Badge>
                    </div>
                    <p className="mt-2 break-all">{source.repository}</p>
                    <p className="mt-1">Revision: {source.revision}</p>
                    <p className="mt-1">Path: {source.path}</p>
                    <p className="mt-1">{source.purpose}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Revision Matrix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.revisionBindings.map((binding) => (
                <div key={binding.environment} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{binding.environment}</p>
                    <Badge
                      variant="outline"
                      className={
                        binding.compatibility === 'validated'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }
                    >
                      {binding.compatibility}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  <p className="text-sm text-slate-600">
                    Release: {binding.releaseRevision}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Config: {binding.configRevision}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{binding.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Offline Bootstrap Procedure</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {document.bootstrap.map((step, index) => (
                  <AccordionItem key={step.id} value={step.id}>
                    <AccordionTrigger>
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-medium">
                          {index + 1}. {step.title}
                        </span>
                        <span className="text-xs text-slate-500">{step.objective}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm text-slate-600">
                      <p>
                        <span className="font-medium text-slate-900">Command:</span>{' '}
                        {step.command}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Verification:</span>{' '}
                        {step.verification}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Evidence:</span>{' '}
                        {step.evidenceRef}
                      </p>
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700"
                      >
                        Offline capable
                      </Badge>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
