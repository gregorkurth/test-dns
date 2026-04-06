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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  DashboardSnapshot,
  DashboardStatus,
  TestExecutionDashboardData,
  TestExecutionEntry,
  TestExecutionRecord,
} from '@/lib/test-execution-dashboard'

type FilterValue = 'ALL' | DashboardStatus | 'manual' | 'auto'
type SnapshotMode = 'run' | 'release'

interface ObjSnapshot {
  id: string
  name: string
  totalTests: number
  passed: number
  failed: number
  neverExecuted: number
}

export interface ClientDashboardFilters {
  objectFilter: string
  capabilityFilter: string
  serviceFunctionFilter: string
  testTypeFilter: FilterValue
  statusFilter: FilterValue
  requirementFilter: string
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

function statusLabel(value: DashboardStatus): string {
  if (value === 'passed') {
    return 'Passed'
  }
  if (value === 'failed') {
    return 'Failed'
  }
  return 'Never Executed'
}

function statusClassName(value: DashboardStatus): string {
  if (value === 'passed') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }
  if (value === 'failed') {
    return 'bg-red-100 text-red-700 border-red-200'
  }
  return 'bg-zinc-100 text-zinc-700 border-zinc-200'
}

function normalizeRunId(record: TestExecutionRecord): string {
  if (record.runId && record.runId.trim()) {
    return record.runId.trim()
  }
  if (record.executedAt) {
    return `RUN-${record.executedAt.slice(0, 10)}`
  }
  return 'RUN-UNASSIGNED'
}

function normalizeReleaseId(record: TestExecutionRecord): string {
  if (record.releaseId && record.releaseId.trim()) {
    return record.releaseId.trim()
  }
  return 'RELEASE-UNASSIGNED'
}

function compareDateDesc(left: string | null, right: string | null): number {
  const leftTs = left ? Date.parse(left) : Number.NEGATIVE_INFINITY
  const rightTs = right ? Date.parse(right) : Number.NEGATIVE_INFINITY
  if (leftTs === rightTs) {
    return 0
  }
  return rightTs - leftTs
}

function buildSnapshots(
  entries: TestExecutionEntry[],
  mode: SnapshotMode,
): DashboardSnapshot[] {
  const buckets = new Map<string, Array<{ testKey: string; record: TestExecutionRecord }>>()

  for (const entry of entries) {
    for (const record of entry.history) {
      if (!record.executedAt) {
        continue
      }
      const id = mode === 'run' ? normalizeRunId(record) : normalizeReleaseId(record)
      const list = buckets.get(id) ?? []
      list.push({ testKey: entry.key, record })
      buckets.set(id, list)
    }
  }

  const snapshots: DashboardSnapshot[] = []
  for (const [id, records] of buckets) {
    const latestByTest = new Map<string, TestExecutionRecord>()
    const runIds = new Set<string>()

    for (const item of records) {
      runIds.add(normalizeRunId(item.record))
      const existing = latestByTest.get(item.testKey)
      if (!existing || compareDateDesc(item.record.executedAt, existing.executedAt) < 0) {
        latestByTest.set(item.testKey, item.record)
      }
    }

    let passed = 0
    let failed = 0
    let lastExecutedAt: string | null = null

    for (const record of latestByTest.values()) {
      if (record.status === 'passed') {
        passed += 1
      } else if (record.status === 'failed') {
        failed += 1
      }

      if (compareDateDesc(record.executedAt, lastExecutedAt) < 0) {
        lastExecutedAt = record.executedAt
      }
    }

    const totalTests = entries.length
    const executedTests = latestByTest.size
    const neverExecuted = Math.max(totalTests - executedTests, 0)
    snapshots.push({
      id,
      lastExecutedAt,
      totalTests,
      passed,
      failed,
      neverExecuted,
      incomplete:
        neverExecuted > 0 ||
        id === 'RUN-UNASSIGNED' ||
        id === 'RELEASE-UNASSIGNED',
      runCount: runIds.size,
    })
  }

  snapshots.sort((left, right) => {
    const dateDiff = compareDateDesc(left.lastExecutedAt, right.lastExecutedAt)
    if (dateDiff !== 0) {
      return dateDiff
    }
    return left.id.localeCompare(right.id, 'de')
  })

  if (snapshots.length === 0) {
    snapshots.push({
      id: mode === 'run' ? 'RUN-UNASSIGNED' : 'RELEASE-UNASSIGNED',
      lastExecutedAt: null,
      totalTests: entries.length,
      passed: 0,
      failed: 0,
      neverExecuted: entries.length,
      incomplete: entries.length > 0,
      runCount: 0,
    })
  }

  return snapshots
}

function buildObjSnapshots(
  entries: TestExecutionEntry[],
  objects: Array<{ id: string; name: string }>,
  focusObjectId: string | null,
): ObjSnapshot[] {
  const knownObjects = new Map(objects.map((objectEntry) => [objectEntry.id, objectEntry.name]))
  const byObject = new Map<string, ObjSnapshot>()

  function ensureSnapshot(objId: string): ObjSnapshot {
    const existing = byObject.get(objId)
    if (existing) {
      return existing
    }

    const created: ObjSnapshot = {
      id: objId,
      name:
        knownObjects.get(objId) ??
        (objId === 'OBJ-UNASSIGNED' ? 'Unzugeordnet' : 'Unbekanntes Objekt'),
      totalTests: 0,
      passed: 0,
      failed: 0,
      neverExecuted: 0,
    }
    byObject.set(objId, created)
    return created
  }

  for (const entry of entries) {
    const objectIds = Array.from(
      new Set((entry.objIds.length > 0 ? entry.objIds : ['OBJ-UNASSIGNED']).map((id) => id.toUpperCase())),
    )
    const relevantObjectIds = focusObjectId
      ? objectIds.filter((id) => id === focusObjectId)
      : objectIds

    for (const objId of relevantObjectIds) {
      const snapshot = ensureSnapshot(objId)
      snapshot.totalTests += 1

      if (entry.status === 'passed') {
        snapshot.passed += 1
      } else if (entry.status === 'failed') {
        snapshot.failed += 1
      } else {
        snapshot.neverExecuted += 1
      }
    }
  }

  return Array.from(byObject.values()).sort((left, right) =>
    left.id.localeCompare(right.id, 'de'),
  )
}

export function filterTestExecutionEntries(
  tests: TestExecutionEntry[],
  filters: ClientDashboardFilters,
): TestExecutionEntry[] {
  const requirementQuery = filters.requirementFilter.trim().toLowerCase()

  return tests.filter((test) => {
    if (filters.objectFilter !== 'ALL' && !test.objIds.includes(filters.objectFilter)) {
      return false
    }
    if (filters.capabilityFilter !== 'ALL' && test.capabilityId !== filters.capabilityFilter) {
      return false
    }
    if (
      filters.serviceFunctionFilter !== 'ALL' &&
      test.serviceFunctionId !== filters.serviceFunctionFilter
    ) {
      return false
    }
    if (filters.testTypeFilter !== 'ALL' && test.testType !== filters.testTypeFilter) {
      return false
    }
    if (filters.statusFilter !== 'ALL' && test.status !== filters.statusFilter) {
      return false
    }
    if (!requirementQuery) {
      return true
    }

    const requirement = test.requirementId?.toLowerCase() ?? ''
    return (
      requirement.includes(requirementQuery) ||
      test.testId.toLowerCase().includes(requirementQuery)
    )
  })
}

export function TestExecutionDashboardClient({
  initialData,
}: {
  initialData: TestExecutionDashboardData
}) {
  const [activeTab, setActiveTab] = useState('current')
  const [objectFilter, setObjectFilter] = useState('ALL')
  const [capabilityFilter, setCapabilityFilter] = useState('ALL')
  const [serviceFunctionFilter, setServiceFunctionFilter] = useState('ALL')
  const [testTypeFilter, setTestTypeFilter] = useState<FilterValue>('ALL')
  const [statusFilter, setStatusFilter] = useState<FilterValue>('ALL')
  const [requirementFilter, setRequirementFilter] = useState('')
  const [selectedTestKey, setSelectedTestKey] = useState<string | null>(null)

  const deferredRequirementFilter = useDeferredValue(requirementFilter)

  const filteredTests = filterTestExecutionEntries(initialData.tests, {
    objectFilter,
    capabilityFilter,
    serviceFunctionFilter,
    testTypeFilter,
    statusFilter,
    requirementFilter: deferredRequirementFilter,
  })

  const effectiveSelectedKey =
    selectedTestKey && filteredTests.some((entry) => entry.key === selectedTestKey)
      ? selectedTestKey
      : (filteredTests[0]?.key ?? null)

  const selectedTest = filteredTests.find((entry) => entry.key === effectiveSelectedKey) ?? null

  let passed = 0
  let failed = 0
  let neverExecuted = 0
  for (const test of filteredTests) {
    if (test.status === 'passed') {
      passed += 1
    } else if (test.status === 'failed') {
      failed += 1
    } else {
      neverExecuted += 1
    }
  }

  const filteredRunSnapshots = buildSnapshots(filteredTests, 'run')
  const filteredReleaseSnapshots = buildSnapshots(filteredTests, 'release')
  const filteredObjSnapshots = buildObjSnapshots(
    filteredTests,
    initialData.filters.objects,
    objectFilter === 'ALL' ? null : objectFilter,
  )

  const resetFilters = () => {
    startTransition(() => {
      setObjectFilter('ALL')
      setCapabilityFilter('ALL')
      setServiceFunctionFilter('ALL')
      setTestTypeFilter('ALL')
      setStatusFilter('ALL')
      setRequirementFilter('')
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6 rounded-xl border bg-white p-4 shadow-sm sm:p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">OBJ-23</p>
          <h1 className="mt-1 text-2xl font-semibold">Test Execution Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Kombinierte Sicht fuer manuelle und automatische Tests mit Status
            <span className="font-medium"> Passed / Failed / Never Executed</span>.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Datenstand: {formatDateTime(initialData.generatedAt)}
          </p>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-emerald-600">{passed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-red-600">{failed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Never Executed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-600">{neverExecuted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Gesamt (gefiltert)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">{filteredTests.length}</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            <Select value={objectFilter} onValueChange={setObjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="OBJ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Alle OBJs</SelectItem>
                {initialData.filters.objects.map((objectEntry) => (
                  <SelectItem key={objectEntry.id} value={objectEntry.id}>
                    {objectEntry.id} · {objectEntry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={capabilityFilter} onValueChange={setCapabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Capability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Alle Capabilities</SelectItem>
                {initialData.filters.capabilities.map((capability) => (
                  <SelectItem key={capability.id} value={capability.id}>
                    {capability.id} · {capability.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={serviceFunctionFilter}
              onValueChange={setServiceFunctionFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Service Function" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Alle SFNs</SelectItem>
                {initialData.filters.serviceFunctions.map((serviceFunction) => (
                  <SelectItem key={serviceFunction.id} value={serviceFunction.id}>
                    {serviceFunction.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={testTypeFilter}
              onValueChange={(value) => setTestTypeFilter(value as FilterValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Testtyp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Alle Typen</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as FilterValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Alle Status</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="never_executed">Never Executed</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={requirementFilter}
              onChange={(event) =>
                startTransition(() => setRequirementFilter(event.target.value))
              }
              placeholder="Requirement-ID oder Test-ID"
            />

            <Button variant="outline" onClick={resetFilters}>
              Filter zuruecksetzen
            </Button>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="current">Aktueller Stand</TabsTrigger>
            <TabsTrigger value="object">Pro OBJ</TabsTrigger>
            <TabsTrigger value="release">Pro Release</TabsTrigger>
            <TabsTrigger value="run">Pro Run</TabsTrigger>
            <TabsTrigger value="rules">Regeln & Quellen</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Testfaelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test</TableHead>
                        <TableHead>OBJ</TableHead>
                        <TableHead>Requirement</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Run</TableHead>
                        <TableHead>Release</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-slate-500">
                            Keine Tests fuer den aktuellen Filter gefunden.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTests.map((test) => (
                          <TableRow
                            key={test.key}
                            className={test.key === effectiveSelectedKey ? 'bg-slate-100' : ''}
                            onClick={() => setSelectedTestKey(test.key)}
                          >
                            <TableCell className="font-medium">{test.testId}</TableCell>
                            <TableCell>{test.objIds.join(', ')}</TableCell>
                            <TableCell>{test.requirementId ?? '—'}</TableCell>
                            <TableCell>{test.testType}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={statusClassName(test.status)}
                              >
                                {statusLabel(test.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>{test.lastRunId ?? '—'}</TableCell>
                            <TableCell>{test.lastReleaseId ?? '—'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Detailansicht</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedTest ? (
                    <>
                      <div>
                        <p className="text-sm text-slate-500">Testfall</p>
                        <p className="font-medium">{selectedTest.testId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">OBJ</p>
                        <p>{selectedTest.objIds.join(', ')}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500">Capability</p>
                          <p>{selectedTest.capabilityId}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Service Function</p>
                          <p>{selectedTest.serviceFunctionId}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Requirement</p>
                          <p>{selectedTest.requirementId ?? '—'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Letzte Ausfuehrung</p>
                          <p>{formatDateTime(selectedTest.lastExecutedAt)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-sm text-slate-500">Historie</p>
                        <div className="max-h-72 space-y-2 overflow-auto pr-1">
                          {selectedTest.history.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              Kein Ausfuehrungsnachweis vorhanden.
                            </p>
                          ) : (
                            selectedTest.history.map((record, index) => (
                              <div
                                key={`${record.evidencePath}-${index}`}
                                className="rounded-md border p-2 text-sm"
                              >
                                <div className="mb-1 flex items-center justify-between gap-2">
                                  <Badge
                                    variant="outline"
                                    className={statusClassName(record.status)}
                                  >
                                    {statusLabel(record.status)}
                                  </Badge>
                                  <span className="text-xs text-slate-500">
                                    {formatDateTime(record.executedAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600">
                                  Run: {normalizeRunId(record)} · Release:{' '}
                                  {normalizeReleaseId(record)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Nachweis: {record.evidencePath}
                                </p>
                                {record.note ? (
                                  <p className="mt-1 text-xs text-red-700">
                                    Hinweis: {record.note}
                                  </p>
                                ) : null}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Waehle einen Testfall aus, um Details zu sehen.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="object">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">OBJ-Snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OBJ</TableHead>
                      <TableHead>Feature</TableHead>
                      <TableHead>Passed</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Never</TableHead>
                      <TableHead>Gesamt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredObjSnapshots.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-slate-500">
                          Keine Tests fuer den aktuellen Filter gefunden.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredObjSnapshots.map((snapshot) => (
                        <TableRow key={snapshot.id}>
                          <TableCell className="font-medium">{snapshot.id}</TableCell>
                          <TableCell>{snapshot.name}</TableCell>
                          <TableCell>{snapshot.passed}</TableCell>
                          <TableCell>{snapshot.failed}</TableCell>
                          <TableCell>{snapshot.neverExecuted}</TableCell>
                          <TableCell>{snapshot.totalTests}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="release">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Release-Snapshots</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Release</TableHead>
                      <TableHead>Passed</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Never</TableHead>
                      <TableHead>Unvollstaendig</TableHead>
                      <TableHead>Letzte Ausfuehrung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReleaseSnapshots.map((snapshot) => (
                      <TableRow key={snapshot.id}>
                        <TableCell className="font-medium">{snapshot.id}</TableCell>
                        <TableCell>{snapshot.passed}</TableCell>
                        <TableCell>{snapshot.failed}</TableCell>
                        <TableCell>{snapshot.neverExecuted}</TableCell>
                        <TableCell>{snapshot.incomplete ? 'Ja' : 'Nein'}</TableCell>
                        <TableCell>{formatDateTime(snapshot.lastExecutedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="run">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Run-Snapshots</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run</TableHead>
                      <TableHead>Passed</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Never</TableHead>
                      <TableHead>Unvollstaendig</TableHead>
                      <TableHead>Letzte Ausfuehrung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRunSnapshots.map((snapshot) => (
                      <TableRow key={snapshot.id}>
                        <TableCell className="font-medium">{snapshot.id}</TableCell>
                        <TableCell>{snapshot.passed}</TableCell>
                        <TableCell>{snapshot.failed}</TableCell>
                        <TableCell>{snapshot.neverExecuted}</TableCell>
                        <TableCell>{snapshot.incomplete ? 'Ja' : 'Nein'}</TableCell>
                        <TableCell>{formatDateTime(snapshot.lastExecutedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Statusregeln</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-700">
                  {initialData.statusRules.map((rule) => (
                    <p key={rule}>{rule}</p>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Datenquellen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-700">
                  {initialData.dataSources.map((source) => (
                    <p key={source} className="font-mono text-xs">
                      {source}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
