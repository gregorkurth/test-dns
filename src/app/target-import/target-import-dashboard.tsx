'use client'

import { startTransition, useDeferredValue, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
  Obj20DeploymentMode,
  Obj20DryRunResult,
  Obj20RunStatus,
  Obj20TargetImportDocument,
  Obj20TargetImportRun,
  Obj20TargetImportSummary,
} from '@/lib/obj20-target-import'

const allFilterValue = 'ALL'

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'laufend'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

function statusClassName(status: Obj20RunStatus): string {
  if (status === 'completed') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (status === 'degraded') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  if (status === 'recovering') {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }
  return 'border-rose-200 bg-rose-50 text-rose-700'
}

function checkClassName(state: 'pass' | 'warn' | 'fail'): string {
  if (state === 'pass') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (state === 'warn') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-rose-200 bg-rose-50 text-rose-700'
}

function modeLabel(mode: Obj20DeploymentMode): string {
  if (mode === 'fresh') {
    return 'Fresh Import'
  }
  if (mode === 'rerun') {
    return 'Controlled Re-Run'
  }
  return 'Recovery'
}

function smokeClassName(status: 'passed' | 'failed' | 'pending'): string {
  if (status === 'passed') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (status === 'failed') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function channelClassName(channel: Obj20TargetImportRun['channel']): string {
  if (channel === 'ga') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (channel === 'beta') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-blue-200 bg-blue-50 text-blue-700'
}

function buildInitialForm(
  run: Obj20TargetImportRun | null,
  document: Obj20TargetImportDocument,
) {
  const fallbackEnvironment = document.environments[0]
  return {
    environmentId: run?.environmentId ?? fallbackEnvironment?.id ?? 'fmn-core',
    environmentName: run?.environmentName ?? fallbackEnvironment?.name ?? 'FMN Core Target',
    version: run?.version ?? 'v1.0.0',
    deploymentMode: run?.deploymentMode ?? ('fresh' as Obj20DeploymentMode),
    cluster: run?.target.cluster ?? 'fmn-core-cluster',
    namespace: run?.target.namespace ?? 'dns-prod',
    registryUrl: run?.target.registryUrl ?? 'harbor.fmn-core.local/dns',
    ingressHostname: run?.target.ingressHostname ?? 'dns.fmn-core.example',
    oidcIssuer:
      run?.target.oidcIssuer ?? 'https://keycloak.fmn-core.example/realms/dns',
    argocdUrl: run?.target.argocdUrl ?? 'https://argocd.fmn-core.example',
    releaseProjectName: run?.sourceBinding.releaseProject.name ?? 'dns-release',
    releaseProjectRevision:
      run?.sourceBinding.releaseProject.revision ?? 'release/v1.0.0',
    releaseProjectPath: run?.sourceBinding.releaseProject.path ?? 'releases/v1.0.0',
    configProjectName:
      run?.sourceBinding.configProject.name ?? 'dns-config-fmn-core',
    configProjectRevision:
      run?.sourceBinding.configProject.revision ?? 'env/fmn-core/v1.0.0',
    configProjectPath:
      run?.sourceBinding.configProject.path ?? 'environments/fmn-core',
    appOfAppsRef:
      run?.sourceBinding.appOfAppsRef ?? 'argocd/root-apps/dns-management-service',
    clusterReachable: true,
    registryReachable: true,
    argocdReachable: true,
    namespacesReady: true,
    packageIntegrityVerified: true,
  }
}

export function Obj20TargetImportDashboard({
  document,
  summary,
  latestRun,
}: {
  document: Obj20TargetImportDocument
  summary: Obj20TargetImportSummary
  latestRun: Obj20TargetImportRun | null
}) {
  const [environmentFilter, setEnvironmentFilter] = useState<string>(allFilterValue)
  const [statusFilter, setStatusFilter] = useState<string>(allFilterValue)
  const [modeFilter, setModeFilter] = useState<string>(allFilterValue)
  const [query, setQuery] = useState('')
  const [formState, setFormState] = useState(() => buildInitialForm(latestRun, document))
  const [dryRunResult, setDryRunResult] = useState<Obj20DryRunResult | null>(null)
  const [dryRunError, setDryRunError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const filteredRuns = document.runs.filter((run) => {
    if (environmentFilter !== allFilterValue && run.environmentId !== environmentFilter) {
      return false
    }
    if (statusFilter !== allFilterValue && run.status !== statusFilter) {
      return false
    }
    if (modeFilter !== allFilterValue && run.deploymentMode !== modeFilter) {
      return false
    }
    if (!normalizedQuery) {
      return true
    }

    return (
      run.environmentName.toLowerCase().includes(normalizedQuery) ||
      run.version.toLowerCase().includes(normalizedQuery) ||
      run.target.namespace.toLowerCase().includes(normalizedQuery) ||
      run.sourceBinding.appOfAppsRef.toLowerCase().includes(normalizedQuery)
    )
  })

  async function submitDryRun() {
    setSubmitting(true)
    setDryRunError(null)

    startTransition(async () => {
      try {
        const response = await fetch('/api/v1/target-import', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            environmentId: formState.environmentId,
            environmentName: formState.environmentName,
            version: formState.version,
            deploymentMode: formState.deploymentMode,
            target: {
              cluster: formState.cluster,
              namespace: formState.namespace,
              registryUrl: formState.registryUrl,
              ingressHostname: formState.ingressHostname,
              oidcIssuer: formState.oidcIssuer,
              argocdUrl: formState.argocdUrl,
            },
            sourceBinding: {
              releaseProject: {
                name: formState.releaseProjectName,
                revision: formState.releaseProjectRevision,
                path: formState.releaseProjectPath,
              },
              configProject: {
                name: formState.configProjectName,
                revision: formState.configProjectRevision,
                path: formState.configProjectPath,
              },
              appOfAppsRef: formState.appOfAppsRef,
            },
            prerequisites: {
              clusterReachable: formState.clusterReachable,
              registryReachable: formState.registryReachable,
              argocdReachable: formState.argocdReachable,
              namespacesReady: formState.namespacesReady,
              packageIntegrityVerified: formState.packageIntegrityVerified,
            },
          }),
        })

        const payload = await response.json()
        if (!response.ok) {
          setDryRunResult(payload.data?.dryRun ?? null)
          setDryRunError(payload.error?.message ?? 'Dry-Run konnte nicht berechnet werden.')
          return
        }

        setDryRunResult(payload.data.dryRun)
      } catch (error) {
        setDryRunError(
          error instanceof Error
            ? error.message
            : 'Dry-Run konnte nicht berechnet werden.',
        )
      } finally {
        setSubmitting(false)
      }
    })
  }

  function applyEnvironmentPreset(environmentId: string) {
    const matchingRun =
      document.runs.find((run) => run.environmentId === environmentId) ?? latestRun
    const preset = buildInitialForm(matchingRun ?? null, document)
    setFormState({
      ...preset,
      environmentId,
      environmentName:
        document.environments.find((entry) => entry.id === environmentId)?.name ??
        preset.environmentName,
    })
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.18),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_44%,_#f8fafc_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-[28px] border border-sky-100 bg-white/90 p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.28em] text-sky-700">OBJ-20</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Zielumgebung, Import und Rehydrierung
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Operative Sicht fuer den Offline-Import: Preflight, Gitea-Quellen,
                App-of-Apps-Bindung, Rehydrierungsnachweis und Recovery-Pfad in einer
                gemeinsamen Bedienoberflaeche.
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Source of truth: {document.sourceOfTruth} · Aktualisiert:{' '}
                {formatDateTime(document.updatedAt)}
              </p>
            </div>
            <div className="grid min-w-[240px] gap-3 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-slate-50">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky-200">
                  Letzter Lauf
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {latestRun?.environmentName ?? 'kein Lauf'}
                </p>
                <p className="text-sm text-slate-300">
                  {latestRun?.version ?? 'n/a'} · {latestRun ? modeLabel(latestRun.deploymentMode) : 'n/a'}
                </p>
              </div>
              <Badge variant="outline" className={latestRun ? statusClassName(latestRun.status) : 'border-slate-500 bg-slate-800 text-slate-100'}>
                {latestRun?.status ?? 'unknown'}
              </Badge>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Runs total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{summary.totalRuns}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-emerald-700">
                {summary.completedRuns}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Degraded</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-amber-700">
                {summary.degradedRuns}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Blocked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-rose-700">
                {summary.blockedRuns}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">Environments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{summary.environmentsCovered}</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <Card className="border-slate-200 bg-white/90 shadow-sm">
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <CardTitle>Laufuebersicht</CardTitle>
                  <p className="mt-1 text-sm text-slate-600">
                    Filterbare Sicht auf Fresh Imports, Re-Runs und Recovery-Laeufe.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Umgebung" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={allFilterValue}>Alle Umgebungen</SelectItem>
                      {document.environments.map((environment) => (
                        <SelectItem key={environment.id} value={environment.id}>
                          {environment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={allFilterValue}>Alle Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="degraded">Degraded</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="recovering">Recovering</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={modeFilter} onValueChange={setModeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Modus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={allFilterValue}>Alle Modi</SelectItem>
                      <SelectItem value="fresh">Fresh</SelectItem>
                      <SelectItem value="rerun">Re-Run</SelectItem>
                      <SelectItem value="recovery">Recovery</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Suche nach Version, Namespace, Ref"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Umgebung</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Smoke</TableHead>
                      <TableHead>Rehydrierung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRuns.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell>
                          <p className="font-medium">{run.environmentName}</p>
                          <p className="text-xs text-slate-500">
                            {run.target.cluster} · {run.target.namespace}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{run.version}</p>
                            <Badge variant="outline" className={channelClassName(run.channel)}>
                              {run.channel}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusClassName(run.status)}>
                            {run.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{modeLabel(run.deploymentMode)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={smokeClassName(run.evidence.smokeTestStatus)}
                          >
                            {run.evidence.smokeTestStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {run.evidence.healthyResources}/{run.evidence.importedResources}
                          </p>
                          <p className="text-xs text-slate-500">
                            degraded {run.evidence.degradedResources}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredRuns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-500">
                          Keine Laeufe fuer den aktuellen Filter gefunden.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>

              <Accordion type="single" collapsible className="rounded-2xl border border-slate-200 px-4">
                {filteredRuns.map((run) => (
                  <AccordionItem key={`${run.id}-details`} value={run.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {run.environmentName} · {run.version}
                        </span>
                        <span className="text-xs text-slate-500">
                          gestartet {formatDateTime(run.startedAt)} · beendet {formatDateTime(run.completedAt)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-5">
                      <div className="grid gap-4 lg:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Preflight
                          </p>
                          <div className="mt-3 space-y-2">
                            {run.preflight.map((check) => (
                              <div key={check.id} className="rounded-lg border border-slate-200 bg-white p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-medium">{check.label}</p>
                                  <Badge variant="outline" className={checkClassName(check.state)}>
                                    {check.state}
                                  </Badge>
                                </div>
                                <p className="mt-2 text-xs leading-5 text-slate-600">
                                  {check.detail}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Quellenbindung
                          </p>
                          <dl className="mt-3 space-y-3 text-sm">
                            <div>
                              <dt className="text-slate-500">Release-Projekt</dt>
                              <dd className="font-medium">{run.sourceBinding.releaseProject.name}</dd>
                              <dd className="text-xs text-slate-500">
                                {run.sourceBinding.releaseProject.revision} · {run.sourceBinding.releaseProject.path}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-slate-500">Konfig-Projekt</dt>
                              <dd className="font-medium">{run.sourceBinding.configProject.name}</dd>
                              <dd className="text-xs text-slate-500">
                                {run.sourceBinding.configProject.revision} · {run.sourceBinding.configProject.path}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-slate-500">App-of-Apps Ref</dt>
                              <dd className="text-xs font-medium text-slate-700">
                                {run.sourceBinding.appOfAppsRef}
                              </dd>
                            </div>
                          </dl>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Recovery & Nachweis
                          </p>
                          <div className="mt-3 space-y-3 text-sm">
                            <div>
                              <p className="text-slate-500">Runbook</p>
                              <p className="font-medium">{run.evidence.runbookRef}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Recovery-Hinweis</p>
                              <p className="font-medium">{run.recovery.commandHint}</p>
                              <p className="text-xs text-slate-500">{run.recovery.note}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Notizen</p>
                              <ul className="space-y-1 text-xs text-slate-600">
                                {run.notes.map((note) => (
                                  <li key={note}>{note}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>Dry-Run fuer Zielimport</CardTitle>
              <p className="text-sm text-slate-600">
                Simuliert den OBJ-20-Preflight, bevor `zarf package deploy` und der
                Argo-CD-Sync freigegeben werden.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="environment">Umgebung</Label>
                  <Select
                    value={formState.environmentId}
                    onValueChange={(value) => applyEnvironmentPreset(value)}
                  >
                    <SelectTrigger id="environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {document.environments.map((environment) => (
                        <SelectItem key={environment.id} value={environment.id}>
                          {environment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mode">Deployment Mode</Label>
                  <Select
                    value={formState.deploymentMode}
                    onValueChange={(value) =>
                      setFormState((current) => ({
                        ...current,
                        deploymentMode: value as Obj20DeploymentMode,
                      }))
                    }
                  >
                    <SelectTrigger id="mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresh">Fresh Import</SelectItem>
                      <SelectItem value="rerun">Controlled Re-Run</SelectItem>
                      <SelectItem value="recovery">Recovery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formState.version}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        version: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="namespace">Namespace</Label>
                  <Input
                    id="namespace"
                    value={formState.namespace}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        namespace: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registry">Registry URL</Label>
                  <Input
                    id="registry"
                    value={formState.registryUrl}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        registryUrl: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hostname">Ingress Hostname</Label>
                  <Input
                    id="hostname"
                    value={formState.ingressHostname}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        ingressHostname: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release-ref">Release Revision</Label>
                  <Input
                    id="release-ref"
                    value={formState.releaseProjectRevision}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        releaseProjectRevision: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="config-ref">Config Revision</Label>
                  <Input
                    id="config-ref"
                    value={formState.configProjectRevision}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        configProjectRevision: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-800">Pflicht-Checks</p>
                {[
                  ['clusterReachable', 'Cluster erreichbar'],
                  ['registryReachable', 'Registry erreichbar'],
                  ['argocdReachable', 'Argo CD erreichbar'],
                  ['namespacesReady', 'Namespaces bereit'],
                  ['packageIntegrityVerified', 'Paketintegritaet verifiziert'],
                ].map(([field, label]) => (
                  <div key={field} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <Label htmlFor={field} className="text-sm">
                      {label}
                    </Label>
                    <Switch
                      id={field}
                      checked={Boolean(formState[field as keyof typeof formState])}
                      onCheckedChange={(checked) =>
                        setFormState((current) => ({
                          ...current,
                          [field]: checked,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <Button onClick={submitDryRun} disabled={submitting} className="w-full">
                {submitting ? 'Dry-Run wird berechnet...' : 'Dry-Run ausfuehren'}
              </Button>

              {dryRunError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {dryRunError}
                </div>
              ) : null}

              {dryRunResult ? (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className={statusClassName(dryRunResult.status)}>
                      {dryRunResult.status}
                    </Badge>
                    <p className="text-sm text-slate-600">{dryRunResult.summary}</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Blocker
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {dryRunResult.blockers.length > 0 ? (
                          dryRunResult.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)
                        ) : (
                          <li>Keine Blocker.</li>
                        )}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Naechste Schritte
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {dryRunResult.nextActions.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Rehydrierungsnachweis
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {dryRunResult.evidencePreview.evidenceNote}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Runbook: {dryRunResult.evidencePreview.runbookRef}
                    </p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
