'use client'

import { startTransition, useDeferredValue, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

const allFilterValue = 'ALL'

type Obj16ReleaseChannel = 'released' | 'beta' | 'preview' | 'unknown'
type Obj16Priority = 'blocker' | 'high' | 'normal'
type Obj16TestStatus = 'passed' | 'failed' | 'never_executed'
type Obj16FeatureStatus =
  | 'Planned'
  | 'In Progress'
  | 'In Review'
  | 'Completed'
  | 'Deployed'
  | 'Unknown'
type Obj16IndicatorState = 'healthy' | 'warning' | 'risk' | 'unknown'

interface Obj16FeatureEntry {
  id: string
  name: string
  phase: string
  status: Obj16FeatureStatus
  releaseChannel: Obj16ReleaseChannel
  testStatus: Obj16TestStatus
  testCounts: {
    total: number
    passed: number
    failed: number
    neverExecuted: number
  }
  requirementsCoverage: {
    covered: number
    total: number
    percentage: number | null
  }
  securityIndicator: Obj16IndicatorState
  documentationIndicator: Obj16IndicatorState
  offlineIndicator: Obj16IndicatorState
  riskPriority: Obj16Priority
  milestone: string
  nextStep: string
}

interface Obj16MaturityData {
  generatedAt: string
  sourceOfTruth: string
  overall: {
    score: number
    level: string
  }
  model: {
    formula: string
  }
  legend: Array<{
    channel: Obj16ReleaseChannel
    label: string
    meaning: string
    riskHint: string
  }>
  dimensions: Array<{
    key: string
    label: string
    score: number
    level: string
    state: Obj16IndicatorState
    explanation: string
  }>
  features: Obj16FeatureEntry[]
  openPoints: Array<{
    id: string
    priority: Obj16Priority
    title: string
    detail: string
  }>
  milestones: Array<{
    id: string
    title: string
    targetLevel: string
    status: string
    dueDate: string | null
    owner: string
  }>
}

interface Obj16FeatureFilters {
  phase?: string | null
  status?: Obj16FeatureStatus | null
  releaseChannel?: Obj16ReleaseChannel | null
  riskPriority?: Obj16Priority | null
  testStatus?: Obj16TestStatus | null
  query?: string | null
}

function filterObj16Features(
  features: Obj16FeatureEntry[],
  filters: Obj16FeatureFilters,
): Obj16FeatureEntry[] {
  const query = filters.query?.trim().toLowerCase() ?? ''

  return features.filter((feature) => {
    if (filters.phase && feature.phase !== filters.phase) {
      return false
    }
    if (filters.status && feature.status !== filters.status) {
      return false
    }
    if (filters.releaseChannel && feature.releaseChannel !== filters.releaseChannel) {
      return false
    }
    if (filters.riskPriority && feature.riskPriority !== filters.riskPriority) {
      return false
    }
    if (filters.testStatus && feature.testStatus !== filters.testStatus) {
      return false
    }
    if (!query) {
      return true
    }

    return (
      feature.id.toLowerCase().includes(query) ||
      feature.name.toLowerCase().includes(query) ||
      feature.nextStep.toLowerCase().includes(query)
    )
  })
}

function channelLabel(value: Obj16ReleaseChannel): string {
  if (value === 'released') {
    return 'Released'
  }
  if (value === 'beta') {
    return 'Beta'
  }
  if (value === 'preview') {
    return 'Preview'
  }
  return 'Unknown'
}

function testStatusLabel(value: Obj16TestStatus): string {
  if (value === 'passed') {
    return 'Passed'
  }
  if (value === 'failed') {
    return 'Failed'
  }
  return 'Never Executed'
}

function riskLabel(value: Obj16Priority): string {
  if (value === 'blocker') {
    return 'Blocker'
  }
  if (value === 'high') {
    return 'High'
  }
  return 'Normal'
}

function stateClassName(value: Obj16FeatureEntry['securityIndicator']): string {
  if (value === 'healthy') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (value === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  if (value === 'risk') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function channelClassName(value: Obj16ReleaseChannel): string {
  if (value === 'released') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (value === 'beta') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  if (value === 'preview') {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }
  return 'border-slate-200 bg-slate-100 text-slate-700'
}

function riskClassName(value: Obj16Priority): string {
  if (value === 'blocker') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  if (value === 'high') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }
  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function formatDateTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return `${parsed.toLocaleDateString('de-CH')} ${parsed.toLocaleTimeString('de-CH')}`
}

export function Obj16MaturityDashboard({
  initialData,
}: {
  initialData: Obj16MaturityData
}) {
  const [phaseFilter, setPhaseFilter] = useState(allFilterValue)
  const [statusFilter, setStatusFilter] = useState(allFilterValue)
  const [channelFilter, setChannelFilter] = useState(allFilterValue)
  const [riskFilter, setRiskFilter] = useState(allFilterValue)
  const [testStatusFilter, setTestStatusFilter] = useState(allFilterValue)
  const [queryFilter, setQueryFilter] = useState('')

  const deferredQueryFilter = useDeferredValue(queryFilter)

  const phaseOptions = Array.from(
    new Set(initialData.features.map((entry) => entry.phase)),
  ).sort((a, b) => a.localeCompare(b, 'de'))

  const filteredFeatures = filterObj16Features(initialData.features, {
    phase: phaseFilter === allFilterValue ? null : phaseFilter,
    status: statusFilter === allFilterValue ? null : (statusFilter as Obj16FeatureEntry['status']),
    releaseChannel: channelFilter === allFilterValue ? null : (channelFilter as Obj16ReleaseChannel),
    riskPriority: riskFilter === allFilterValue ? null : (riskFilter as Obj16Priority),
    testStatus:
      testStatusFilter === allFilterValue
        ? null
        : (testStatusFilter as Obj16TestStatus),
    query: deferredQueryFilter,
  })

  const filteredSummary = filteredFeatures.reduce(
    (accumulator, entry) => {
      accumulator.total += 1
      if (entry.releaseChannel === 'released') {
        accumulator.released += 1
      } else if (entry.releaseChannel === 'beta') {
        accumulator.beta += 1
      } else if (entry.releaseChannel === 'preview') {
        accumulator.preview += 1
      }
      if (entry.riskPriority === 'blocker') {
        accumulator.blocker += 1
      } else if (entry.riskPriority === 'high') {
        accumulator.high += 1
      }
      return accumulator
    },
    {
      total: 0,
      released: 0,
      beta: 0,
      preview: 0,
      blocker: 0,
      high: 0,
    },
  )

  const resetFilters = () => {
    startTransition(() => {
      setPhaseFilter(allFilterValue)
      setStatusFilter(allFilterValue)
      setChannelFilter(allFilterValue)
      setRiskFilter(allFilterValue)
      setTestStatusFilter(allFilterValue)
      setQueryFilter('')
    })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 print:max-w-none">
        <header className="rounded-2xl border bg-white p-6 shadow-sm print:rounded-none print:border-none print:shadow-none">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">OBJ-16</p>
              <h1 className="mt-1 text-2xl font-semibold">
                Maturity Status (L0-L5)
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Offline-faehige Reifegradsicht aus Repository-Daten mit konsolidierten
                Tests, Security- und Dokuindikatoren.
              </p>
            </div>
            <div className="print:hidden">
              <Button variant="outline" onClick={() => window.print()}>
                Druckansicht
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Overall Level</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-slate-900">{initialData.overall.level}</p>
                <p className="text-sm text-slate-600">{initialData.overall.score} / 100</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Features (filtered)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-slate-900">{filteredSummary.total}</p>
                <p className="text-sm text-slate-600">
                  Released {filteredSummary.released} · Beta {filteredSummary.beta} · Preview{' '}
                  {filteredSummary.preview}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-slate-900">
                  {filteredSummary.blocker + filteredSummary.high}
                </p>
                <p className="text-sm text-slate-600">
                  Blocker {filteredSummary.blocker} · High {filteredSummary.high}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">Data Timestamp</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-slate-900">
                  {formatDateTime(initialData.generatedAt)}
                </p>
                <p className="text-xs text-slate-500">Source of truth: {initialData.sourceOfTruth}</p>
              </CardContent>
            </Card>
          </div>
          <p className="mt-4 text-xs text-slate-500">{initialData.model.formula}</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 print:grid-cols-5">
          {initialData.dimensions.map((dimension) => (
            <Card key={dimension.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600">{dimension.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-semibold text-slate-900">{dimension.level}</p>
                  <Badge variant="outline" className={stateClassName(dimension.state)}>
                    {dimension.score}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-slate-600">{dimension.explanation}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border bg-white p-4 shadow-sm print:hidden">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allFilterValue}>Alle Phasen</SelectItem>
                {phaseOptions.map((phase) => (
                  <SelectItem key={phase} value={phase}>
                    {phase}
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
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Deployed">Deployed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Release Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allFilterValue}>Alle Kanaele</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
                <SelectItem value="preview">Preview</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allFilterValue}>Alle Prioritaeten</SelectItem>
                <SelectItem value="blocker">Blocker</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>

            <Select value={testStatusFilter} onValueChange={setTestStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Test Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allFilterValue}>Alle Teststatus</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="never_executed">Never Executed</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={queryFilter}
              onChange={(event) => startTransition(() => setQueryFilter(event.target.value))}
              placeholder="Suche OBJ / Name / Next Step"
            />

            <Button variant="outline" onClick={resetFilters}>
              Filter zuruecksetzen
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Release Channel Legend</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {initialData.legend.map((item) => (
              <Card key={item.channel}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className={channelClassName(item.channel)}>
                      {item.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-sm text-slate-700">{item.meaning}</p>
                  <p className="text-xs text-slate-500">{item.riskHint}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Feature Table</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Req Coverage</TableHead>
                <TableHead>Indicators</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Milestone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeatures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-slate-500">
                    Keine Features fuer den aktuellen Filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeatures.map((feature) => (
                  <TableRow key={feature.id}>
                    <TableCell>
                      <p className="font-medium text-slate-900">
                        {feature.id} · {feature.name}
                      </p>
                      <p className="text-xs text-slate-500">{feature.phase}</p>
                    </TableCell>
                    <TableCell>{feature.status}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={channelClassName(feature.releaseChannel)}>
                        {channelLabel(feature.releaseChannel)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <Badge variant="outline">{testStatusLabel(feature.testStatus)}</Badge>
                        <p className="text-xs text-slate-500">
                          T:{feature.testCounts.total} P:{feature.testCounts.passed} F:
                          {feature.testCounts.failed} N:{feature.testCounts.neverExecuted}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {feature.requirementsCoverage.percentage === null
                        ? 'n/a'
                        : `${feature.requirementsCoverage.percentage}%`}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className={stateClassName(feature.securityIndicator)}>
                          Sec
                        </Badge>
                        <Badge
                          variant="outline"
                          className={stateClassName(feature.documentationIndicator)}
                        >
                          Doc
                        </Badge>
                        <Badge variant="outline" className={stateClassName(feature.offlineIndicator)}>
                          Off
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={riskClassName(feature.riskPriority)}>
                        {riskLabel(feature.riskPriority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-700">{feature.milestone}</p>
                      <p className="text-xs text-slate-500">{feature.nextStep}</p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Open Points (prioritized)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {initialData.openPoints.length === 0 ? (
                <p className="text-sm text-slate-500">Keine offenen Punkte.</p>
              ) : (
                initialData.openPoints.map((point) => (
                  <div key={point.id} className="rounded-xl border p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={riskClassName(point.priority)}>
                        {riskLabel(point.priority)}
                      </Badge>
                      <span className="text-xs text-slate-500">{point.id}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900">{point.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{point.detail}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Milestones (configurable)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {initialData.milestones.map((milestone) => (
                <div key={milestone.id} className="rounded-xl border p-3">
                  <p className="text-xs text-slate-500">{milestone.id}</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{milestone.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline">{milestone.status}</Badge>
                    <Badge variant="outline">Target {milestone.targetLevel}</Badge>
                    <Badge variant="outline">Owner {milestone.owner}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Due: {milestone.dueDate ?? 'offen'}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
