import { promises as fs } from 'node:fs'
import path from 'node:path'

export type Obj26TelemetryMode = 'local' | 'clickhouse'
export type Obj26RunStatus = 'passed' | 'failed' | 'skipped_due_to_active_run'

export interface Obj26ManifestCheck {
  label: string
  path: string
  present: boolean
  summary: string
}

export interface Obj26ScheduledRun {
  runId: string
  scheduledAt: string
  startedAt: string | null
  finishedAt: string | null
  durationMs: number
  status: Obj26RunStatus
  mode: Obj26TelemetryMode
  releaseId: string | null
  testsTotal: number
  testsPassed: number
  testsFailed: number
  testsSkipped: number
  errorMessage: string | null
  emittedEvent: string | null
}

export interface Obj26TestOperatorData {
  generatedAt: string
  operator: {
    name: string
    namespace: string
    image: string
    leaderElectionEnabled: boolean
    intervalMinutes: number
    maxRuntimeSeconds: number
    nonOverlapPolicy: string
  }
  telemetry: {
    mode: Obj26TelemetryMode
    endpoint: string
    spoolDirectory: string
    retryPolicy: string
  }
  security: {
    serviceAccount: string
    rbacProfile: string
    policyProfile: string
  }
  summary: {
    lastRunStatus: Obj26RunStatus | null
    lastRunAt: string | null
    totalRuns24h: number
    failedRuns24h: number
    skippedRuns24h: number
  }
  dashboardBridge: {
    evidenceFile: string
    dataSource: string
    mappedTests: number
    lastExportedAt: string | null
    evidencePresent: boolean
  }
  manifests: Obj26ManifestCheck[]
  runs: Obj26ScheduledRun[]
  limitations: string[]
}

interface Obj26StateFile {
  generatedAt: string
  operator: Obj26TestOperatorData['operator']
  telemetry: Obj26TestOperatorData['telemetry']
  security: Obj26TestOperatorData['security']
  dashboardBridge: {
    evidenceFile: string
    dataSource: string
    mappedTests: number
    lastExportedAt: string | null
  }
  limitations: string[]
}

const repoRoot = process.cwd()
const statePath = path.join(repoRoot, 'operator', 'examples', 'test-operator-state.json')
const historyPath = path.join(repoRoot, 'operator', 'examples', 'test-run-history.json')

function toPosixPath(value: string): string {
  return value.split(path.sep).join('/')
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw) as T
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function normalizeTelemetryMode(value: unknown): Obj26TelemetryMode {
  return String(value).toLowerCase() === 'clickhouse' ? 'clickhouse' : 'local'
}

function normalizeRunStatus(value: unknown): Obj26RunStatus {
  const normalized = String(value).toLowerCase()
  if (normalized === 'passed' || normalized === 'failed' || normalized === 'skipped_due_to_active_run') {
    return normalized
  }
  return 'failed'
}

function normalizeIsoDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed.toISOString()
}

function compareDateDesc(left: string | null, right: string | null): number {
  const leftTs = left ? Date.parse(left) : Number.NEGATIVE_INFINITY
  const rightTs = right ? Date.parse(right) : Number.NEGATIVE_INFINITY
  if (leftTs === rightTs) {
    return 0
  }
  return rightTs - leftTs
}

function normalizeRuns(input: unknown): Obj26ScheduledRun[] {
  if (!Array.isArray(input)) {
    return []
  }

  const runs = input
    .filter((entry) => Boolean(entry) && typeof entry === 'object')
    .map((entry) => {
      const candidate = entry as Record<string, unknown>
      const scheduledAt = normalizeIsoDate(candidate.scheduledAt)
      return {
        runId: String(candidate.runId ?? 'RUN-UNBEKANNT'),
        scheduledAt: scheduledAt ?? new Date(0).toISOString(),
        startedAt: normalizeIsoDate(candidate.startedAt),
        finishedAt: normalizeIsoDate(candidate.finishedAt),
        durationMs: Number(candidate.durationMs ?? 0),
        status: normalizeRunStatus(candidate.status),
        mode: normalizeTelemetryMode(candidate.mode),
        releaseId: typeof candidate.releaseId === 'string' ? candidate.releaseId : null,
        testsTotal: Number(candidate.testsTotal ?? 0),
        testsPassed: Number(candidate.testsPassed ?? 0),
        testsFailed: Number(candidate.testsFailed ?? 0),
        testsSkipped: Number(candidate.testsSkipped ?? 0),
        errorMessage: typeof candidate.errorMessage === 'string' ? candidate.errorMessage : null,
        emittedEvent: typeof candidate.emittedEvent === 'string' ? candidate.emittedEvent : null,
      }
    })

  runs.sort((left, right) => compareDateDesc(left.scheduledAt, right.scheduledAt))
  return runs
}

function summarizeRuns(
  runs: Obj26ScheduledRun[],
  generatedAt: string,
): Obj26TestOperatorData['summary'] {
  const generatedTs = Date.parse(generatedAt)
  const last24hThreshold = Number.isFinite(generatedTs)
    ? generatedTs - 24 * 60 * 60 * 1000
    : Number.NEGATIVE_INFINITY

  const recentRuns = runs.filter((run) => Date.parse(run.scheduledAt) >= last24hThreshold)
  const lastRun = runs[0] ?? null

  return {
    lastRunStatus: lastRun?.status ?? null,
    lastRunAt: lastRun?.scheduledAt ?? null,
    totalRuns24h: recentRuns.length,
    failedRuns24h: recentRuns.filter((run) => run.status === 'failed').length,
    skippedRuns24h: recentRuns.filter(
      (run) => run.status === 'skipped_due_to_active_run',
    ).length,
  }
}

export async function loadObj26TestOperatorData(): Promise<Obj26TestOperatorData> {
  const [state, rawRuns] = await Promise.all([
    readJsonFile<Obj26StateFile>(statePath),
    readJsonFile<unknown>(historyPath),
  ])

  const runs = normalizeRuns(rawRuns)
  const generatedAt = normalizeIsoDate(state.generatedAt) ?? new Date().toISOString()
  const evidencePath = path.join(repoRoot, state.dashboardBridge.evidenceFile)
  const evidencePresent = await exists(evidencePath)

  const manifests: Obj26ManifestCheck[] = await Promise.all(
    [
      {
        label: 'K8s Deployment',
        path: path.join(repoRoot, 'k8s', 'operator', 'test-operator-deployment.yaml'),
        summary: 'Deployment des dedizierten Go-Testoperators mit Intervallkonfiguration.',
      },
      {
        label: 'K8s RBAC',
        path: path.join(repoRoot, 'k8s', 'operator', 'test-operator-rbac.yaml'),
        summary: 'Least-Privilege ServiceAccount und Rollen fuer periodische Testausfuehrung.',
      },
      {
        label: 'Helm Template',
        path: path.join(
          repoRoot,
          'helm',
          'dns-management-service',
          'templates',
          'test-operator-deployment.yaml',
        ),
        summary: 'Helm-Integration fuer App-of-Apps-/GitOps-Deployment des Testoperators.',
      },
    ].map(async (entry) => ({
      label: entry.label,
      path: toPosixPath(path.relative(repoRoot, entry.path)),
      present: await exists(entry.path),
      summary: entry.summary,
    })),
  )

  return {
    generatedAt,
    operator: state.operator,
    telemetry: {
      ...state.telemetry,
      mode: normalizeTelemetryMode(state.telemetry.mode),
    },
    security: state.security,
    summary: summarizeRuns(runs, generatedAt),
    dashboardBridge: {
      ...state.dashboardBridge,
      evidencePresent,
      lastExportedAt: normalizeIsoDate(state.dashboardBridge.lastExportedAt),
    },
    manifests,
    runs,
    limitations: Array.isArray(state.limitations) ? state.limitations : [],
  }
}
