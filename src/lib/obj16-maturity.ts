import { promises as fs } from 'node:fs'
import path from 'node:path'

import { getReleaseNotices } from '@/lib/obj14-release-management'
import { getObj17SecuritySummary } from '@/lib/obj17-security-scanning'
import { loadObj7TraceabilityData } from '@/lib/obj7-traceability'
import {
  loadTestExecutionDashboardData,
  type DashboardStatus,
} from '@/lib/test-execution-dashboard'

export type Obj16MaturityLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5'
export type Obj16ReleaseChannel = 'released' | 'beta' | 'preview' | 'unknown'
export type Obj16Priority = 'blocker' | 'high' | 'normal'
export type Obj16IndicatorState = 'healthy' | 'warning' | 'risk' | 'unknown'
export type Obj16FeatureStatus =
  | 'Planned'
  | 'In Progress'
  | 'In Review'
  | 'Completed'
  | 'Deployed'
  | 'Unknown'
export type Obj16TestStatus = 'passed' | 'failed' | 'never_executed'

export interface Obj16DimensionResult {
  key: 'delivery' | 'quality' | 'security' | 'documentation' | 'offline'
  label: string
  weight: number
  score: number
  level: Obj16MaturityLevel
  state: Obj16IndicatorState
  explanation: string
}

export interface Obj16FeatureEntry {
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

export interface Obj16OpenPoint {
  id: string
  priority: Obj16Priority
  title: string
  detail: string
  featureId: string | null
}

export interface Obj16Milestone {
  id: string
  title: string
  targetLevel: Obj16MaturityLevel
  status: 'planned' | 'on-track' | 'at-risk' | 'done'
  dueDate: string | null
  owner: string
}

export interface Obj16MaturityData {
  generatedAt: string
  sourceOfTruth: string
  overall: {
    score: number
    level: Obj16MaturityLevel
    rationale: string
  }
  model: {
    formula: string
    weights: Record<Obj16DimensionResult['key'], number>
  }
  legend: Array<{
    channel: Obj16ReleaseChannel
    label: string
    meaning: string
    riskHint: string
  }>
  kpis: {
    totalFeatures: number
    released: number
    beta: number
    preview: number
    tests: {
      passed: number
      failed: number
      neverExecuted: number
    }
    requirementsCoverage: {
      covered: number
      total: number
      percentage: number | null
    }
    security: {
      sbomAvailable: boolean
      lastScanStatus: 'passed' | 'failed' | 'unknown'
      openCriticalFindings: number
      openHighFindings: number
      gateStatus: 'pass' | 'fail' | 'accepted-risk' | 'unknown'
    }
    documentation: {
      arc42Current: boolean
      userManualCurrent: boolean
      operationsCurrent: boolean
    }
    offline: {
      zarfAvailable: boolean
      exportStatus: 'completed' | 'pending' | 'unknown'
      appOfAppsReady: boolean
    }
  }
  dimensions: Obj16DimensionResult[]
  features: Obj16FeatureEntry[]
  openPoints: Obj16OpenPoint[]
  milestones: Obj16Milestone[]
}

interface FeatureIndexRow {
  id: string
  name: string
  phase: string
  status: Obj16FeatureStatus
}

interface ObjTestAggregate {
  total: number
  passed: number
  failed: number
  neverExecuted: number
}

interface ObjRequirementsAggregate {
  total: Set<string>
  covered: Set<string>
}

const repoRoot = process.cwd()
const featuresIndexPath = path.join(repoRoot, 'features', 'INDEX.md')

const requiredDocumentationPaths = {
  arc42: [
    'docs/arc42/01-introduction-and-goals.md',
    'docs/arc42/02-constraints.md',
    'docs/arc42/03-context-and-scope.md',
    'docs/arc42/04-solution-strategy.md',
    'docs/arc42/05-building-block-view.md',
    'docs/arc42/06-runtime-view.md',
    'docs/arc42/07-deployment-view.md',
    'docs/arc42/08-cross-cutting-concepts.md',
    'docs/arc42/09-architecture-decisions.md',
    'docs/arc42/10-quality-requirements.md',
    'docs/arc42/11-risks-and-technical-debt.md',
    'docs/arc42/12-glossary-and-work-products.md',
  ],
  userManual: ['docs/user-manual/README.md', 'docs/user-manual/management.md'],
  operations: ['docs/operations.md', 'docs/release-process.md'],
}

const modelWeights: Record<Obj16DimensionResult['key'], number> = {
  delivery: 0.24,
  quality: 0.24,
  security: 0.24,
  documentation: 0.14,
  offline: 0.14,
}

const defaultMilestones: Obj16Milestone[] = [
  {
    id: 'MS-OBJ16-01',
    title: 'L3 baseline for management reporting',
    targetLevel: 'L3',
    status: 'on-track',
    dueDate: '2026-05-01',
    owner: 'Product Owner',
  },
  {
    id: 'MS-OBJ16-02',
    title: 'L4 with automated security and release evidence',
    targetLevel: 'L4',
    status: 'planned',
    dueDate: '2026-06-15',
    owner: 'Release Manager',
  },
  {
    id: 'MS-OBJ16-03',
    title: 'L5 with offline release readiness and full audit trace',
    targetLevel: 'L5',
    status: 'planned',
    dueDate: '2026-08-01',
    owner: 'Architecture Board',
  },
]

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function scoreToLevel(score: number): Obj16MaturityLevel {
  if (score >= 90) {
    return 'L5'
  }
  if (score >= 75) {
    return 'L4'
  }
  if (score >= 60) {
    return 'L3'
  }
  if (score >= 40) {
    return 'L2'
  }
  if (score >= 20) {
    return 'L1'
  }
  return 'L0'
}

function scoreToState(score: number): Obj16IndicatorState {
  if (score >= 75) {
    return 'healthy'
  }
  if (score >= 50) {
    return 'warning'
  }
  if (score >= 0) {
    return 'risk'
  }
  return 'unknown'
}

function parseFeatureStatus(value: string): Obj16FeatureStatus {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'planned') {
    return 'Planned'
  }
  if (normalized === 'in progress') {
    return 'In Progress'
  }
  if (normalized === 'in review') {
    return 'In Review'
  }
  if (normalized === 'completed') {
    return 'Completed'
  }
  if (normalized === 'deployed') {
    return 'Deployed'
  }
  return 'Unknown'
}

function parseFeatureIndexRows(content: string): FeatureIndexRow[] {
  const rows: FeatureIndexRow[] = []
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line.startsWith('| OBJ-')) {
      continue
    }
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim())
    if (cells.length < 4) {
      continue
    }

    rows.push({
      id: cells[0],
      name: cells[1],
      phase: cells[2],
      status: parseFeatureStatus(cells[3]),
    })
  }

  rows.sort((left, right) => {
    const leftNum = Number.parseInt(left.id.replace('OBJ-', ''), 10)
    const rightNum = Number.parseInt(right.id.replace('OBJ-', ''), 10)
    if (Number.isFinite(leftNum) && Number.isFinite(rightNum)) {
      return leftNum - rightNum
    }
    return left.id.localeCompare(right.id, 'de')
  })
  return rows
}

function extractObjIdsFromText(value: string): string[] {
  const matches = value.match(/OBJ-\d+/gi) ?? []
  return Array.from(new Set(matches.map((entry) => entry.toUpperCase())))
}

function channelFromFeatureStatus(status: Obj16FeatureStatus): Obj16ReleaseChannel {
  if (status === 'Completed' || status === 'Deployed') {
    return 'released'
  }
  if (status === 'In Review') {
    return 'beta'
  }
  if (status === 'In Progress' || status === 'Planned') {
    return 'preview'
  }
  return 'unknown'
}

function channelFromReleaseChannel(channel: string): Obj16ReleaseChannel {
  if (channel === 'ga') {
    return 'released'
  }
  if (channel === 'beta') {
    return 'beta'
  }
  if (channel === 'rc') {
    return 'preview'
  }
  return 'unknown'
}

function resolveReleaseChannel(
  feature: FeatureIndexRow,
  overrides: Map<string, Obj16ReleaseChannel>,
): Obj16ReleaseChannel {
  const mapped = overrides.get(feature.id)
  if (mapped) {
    return mapped
  }
  return channelFromFeatureStatus(feature.status)
}

function resolveTestStatus(aggregate: ObjTestAggregate | undefined): Obj16TestStatus {
  if (!aggregate || aggregate.total === 0) {
    return 'never_executed'
  }
  if (aggregate.failed > 0) {
    return 'failed'
  }
  if (aggregate.passed === aggregate.total) {
    return 'passed'
  }
  return 'never_executed'
}

function determineRiskPriority(input: {
  featureStatus: Obj16FeatureStatus
  releaseChannel: Obj16ReleaseChannel
  testStatus: Obj16TestStatus
  securityState: Obj16IndicatorState
  docsState: Obj16IndicatorState
  offlineState: Obj16IndicatorState
}): Obj16Priority {
  if (
    input.testStatus === 'failed' &&
    (input.releaseChannel === 'released' || input.releaseChannel === 'beta')
  ) {
    return 'blocker'
  }
  if (
    input.securityState === 'risk' ||
    input.docsState === 'risk' ||
    input.offlineState === 'risk'
  ) {
    return 'high'
  }
  if (input.featureStatus === 'Unknown') {
    return 'high'
  }
  return 'normal'
}

function computeDeliveryScore(features: FeatureIndexRow[]): number {
  if (features.length === 0) {
    return 0
  }

  const weighted = features.reduce((accumulator, feature) => {
    if (feature.status === 'Deployed') {
      return accumulator + 1
    }
    if (feature.status === 'Completed') {
      return accumulator + 0.9
    }
    if (feature.status === 'In Review') {
      return accumulator + 0.7
    }
    if (feature.status === 'In Progress') {
      return accumulator + 0.45
    }
    if (feature.status === 'Planned') {
      return accumulator + 0.2
    }
    return accumulator + 0.1
  }, 0)

  return clampScore((weighted / features.length) * 100)
}

function computeQualityScore(tests: {
  passed: number
  failed: number
  neverExecuted: number
}): number {
  const total = tests.passed + tests.failed + tests.neverExecuted
  if (total === 0) {
    return 0
  }

  const executed = tests.passed + tests.failed
  const passRate = executed > 0 ? tests.passed / executed : 0
  const executionCoverage = executed / total
  const baseScore = passRate * 70 + executionCoverage * 30

  return clampScore(baseScore * 100)
}

function computeSecurityScore(input: {
  sbomAvailable: boolean
  lastScanStatus: 'passed' | 'failed' | 'unknown'
  gateStatus: 'pass' | 'fail' | 'accepted-risk' | 'unknown'
  openCriticalFindings: number
  openHighFindings: number
}): number {
  let score = 0
  score += input.sbomAvailable ? 25 : 0
  score += input.lastScanStatus === 'passed' ? 25 : input.lastScanStatus === 'unknown' ? 10 : 0
  score += input.gateStatus === 'pass' ? 25 : input.gateStatus === 'accepted-risk' ? 15 : 5
  score += input.openCriticalFindings === 0 ? 25 : 0
  score -= Math.min(20, input.openHighFindings * 5)
  return clampScore(score)
}

async function exists(relativePath: string): Promise<boolean> {
  try {
    await fs.access(path.join(repoRoot, relativePath))
    return true
  } catch {
    return false
  }
}

async function latestMtime(relativePaths: string[]): Promise<number | null> {
  const timestamps: number[] = []
  for (const relativePath of relativePaths) {
    try {
      const stats = await fs.stat(path.join(repoRoot, relativePath))
      timestamps.push(stats.mtimeMs)
    } catch {
      continue
    }
  }

  if (timestamps.length === 0) {
    return null
  }
  return Math.max(...timestamps)
}

async function computeDocumentationSignals() {
  const [arc42Exists, userManualExists, operationsExists] = await Promise.all([
    Promise.all(requiredDocumentationPaths.arc42.map((entry) => exists(entry))).then((items) =>
      items.every(Boolean),
    ),
    Promise.all(requiredDocumentationPaths.userManual.map((entry) => exists(entry))).then(
      (items) => items.every(Boolean),
    ),
    Promise.all(requiredDocumentationPaths.operations.map((entry) => exists(entry))).then(
      (items) => items.every(Boolean),
    ),
  ])

  const [arc42Mtime, userManualMtime, operationsMtime] = await Promise.all([
    latestMtime(requiredDocumentationPaths.arc42),
    latestMtime(requiredDocumentationPaths.userManual),
    latestMtime(requiredDocumentationPaths.operations),
  ])

  const freshnessThresholdMs = 120 * 24 * 60 * 60 * 1000
  const now = Date.now()
  const arc42Current = arc42Exists && arc42Mtime !== null && now - arc42Mtime <= freshnessThresholdMs
  const userManualCurrent =
    userManualExists && userManualMtime !== null && now - userManualMtime <= freshnessThresholdMs
  const operationsCurrent =
    operationsExists && operationsMtime !== null && now - operationsMtime <= freshnessThresholdMs

  const score = clampScore(
    (arc42Exists ? 30 : 0) +
      (userManualExists ? 25 : 0) +
      (operationsExists ? 25 : 0) +
      (arc42Current ? 8 : 0) +
      (userManualCurrent ? 6 : 0) +
      (operationsCurrent ? 6 : 0),
  )

  return {
    score,
    arc42Current,
    userManualCurrent,
    operationsCurrent,
  }
}

async function computeOfflineSignals(): Promise<{
  score: number
  zarfAvailable: boolean
  exportStatus: 'completed' | 'pending' | 'unknown'
  appOfAppsReady: boolean
}> {
  const [zarfYamlExists, zarfYmlExists, appOfAppsDocExists, releaseNotices] =
    await Promise.all([
      exists('zarf.yaml'),
      exists('zarf.yml'),
      exists(
        'capabilities/gitops/services/argocd-installation/service-functions/SFN-GIT-001-app-of-apps/README.md',
      ),
      getReleaseNotices({ includeDrafts: true, limit: 1 }),
    ])

  const zarfAvailable = zarfYamlExists || zarfYmlExists
  const latestNotice = releaseNotices[0] ?? null
  const exportStatus: 'completed' | 'pending' | 'unknown' = latestNotice
    ? latestNotice.documentation.exportStatus
    : 'unknown'

  const score = clampScore(
    (zarfAvailable ? 35 : 0) +
      (appOfAppsDocExists ? 30 : 0) +
      (exportStatus === 'completed' ? 35 : exportStatus === 'pending' ? 12 : 0),
  )

  return {
    score,
    zarfAvailable,
    exportStatus,
    appOfAppsReady: appOfAppsDocExists,
  }
}

function loadMilestonesFromEnv(): Obj16Milestone[] {
  const raw = process.env.OBJ16_MILESTONES_JSON?.trim()
  if (!raw) {
    return defaultMilestones
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return defaultMilestones
    }
    const items = parsed.filter((entry): entry is Obj16Milestone => {
      if (typeof entry !== 'object' || entry === null) {
        return false
      }
      const candidate = entry as Record<string, unknown>
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.title === 'string' &&
        typeof candidate.targetLevel === 'string' &&
        typeof candidate.status === 'string' &&
        typeof candidate.owner === 'string'
      )
    })
    return items.length > 0 ? items : defaultMilestones
  } catch {
    return defaultMilestones
  }
}

function buildOpenPoints(input: {
  features: Obj16FeatureEntry[]
  security: Awaited<ReturnType<typeof getObj17SecuritySummary>>
  documentationState: Obj16IndicatorState
  offlineState: Obj16IndicatorState
}): Obj16OpenPoint[] {
  const points: Obj16OpenPoint[] = []

  for (const feature of input.features) {
    if (feature.riskPriority === 'normal') {
      continue
    }
    points.push({
      id: `OPEN-${feature.id}`,
      priority: feature.riskPriority,
      title: `${feature.id} needs risk follow-up`,
      detail:
        feature.testStatus === 'failed'
          ? 'Failed test evidence exists. Resolve before promoting release channel.'
          : 'Quality/security/documentation indicators are below target threshold.',
      featureId: feature.id,
    })
  }

  if (input.security.openCriticalFindings > 0) {
    points.push({
      id: 'OPEN-SEC-CRITICAL',
      priority: 'blocker',
      title: 'Critical security findings are still open',
      detail: 'Release gate should stay blocked until critical findings are fixed or formally accepted.',
      featureId: 'OBJ-17',
    })
  }

  if (input.documentationState === 'risk') {
    points.push({
      id: 'OPEN-DOC',
      priority: 'high',
      title: 'Documentation is incomplete or outdated',
      detail: 'arc42, user manual and operations docs must be updated before release review.',
      featureId: 'OBJ-2',
    })
  }

  if (input.offlineState === 'risk') {
    points.push({
      id: 'OPEN-OFFLINE',
      priority: 'high',
      title: 'Offline readiness not released',
      detail: 'Zarf/App-of-Apps/export status is incomplete for audited offline delivery.',
      featureId: 'OBJ-19',
    })
  }

  points.sort((left, right) => {
    const rank: Record<Obj16Priority, number> = {
      blocker: 0,
      high: 1,
      normal: 2,
    }
    if (rank[left.priority] !== rank[right.priority]) {
      return rank[left.priority] - rank[right.priority]
    }
    return left.id.localeCompare(right.id, 'de')
  })
  return points
}

function filterUnknownStatus(value: string | null | undefined): DashboardStatus {
  if (value === 'passed' || value === 'failed' || value === 'never_executed') {
    return value
  }
  return 'never_executed'
}

export async function loadObj16MaturityData(): Promise<Obj16MaturityData> {
  const featuresRaw = await fs.readFile(featuresIndexPath, 'utf8')
  const features = parseFeatureIndexRows(featuresRaw)

  const [releaseNotices, tests, traceability, securitySummary, docs, offline] =
    await Promise.all([
      getReleaseNotices({ includeDrafts: true }),
      loadTestExecutionDashboardData(),
      loadObj7TraceabilityData(),
      getObj17SecuritySummary(),
      computeDocumentationSignals(),
      computeOfflineSignals(),
    ])

  const channelOverrides = new Map<string, Obj16ReleaseChannel>()
  for (const notice of releaseNotices) {
    const ids = new Set<string>()
    for (const feature of notice.ui.betaFeatures) {
      for (const objId of extractObjIdsFromText(feature)) {
        ids.add(objId)
      }
    }
    for (const objId of extractObjIdsFromText(notice.title)) {
      ids.add(objId)
    }
    for (const objId of extractObjIdsFromText(notice.summary)) {
      ids.add(objId)
    }

    const mappedChannel = channelFromReleaseChannel(notice.channel)
    for (const id of ids) {
      if (!channelOverrides.has(id)) {
        channelOverrides.set(id, mappedChannel)
      }
    }
  }

  const testsByObj = new Map<string, ObjTestAggregate>()
  const requirementsByObj = new Map<string, ObjRequirementsAggregate>()
  for (const test of tests.tests) {
    const relevantObjIds = test.objIds.length > 0 ? test.objIds : ['OBJ-UNASSIGNED']
    for (const objId of relevantObjIds) {
      const aggregate = testsByObj.get(objId) ?? {
        total: 0,
        passed: 0,
        failed: 0,
        neverExecuted: 0,
      }
      aggregate.total += 1

      const normalizedStatus = filterUnknownStatus(test.status)
      if (normalizedStatus === 'passed') {
        aggregate.passed += 1
      } else if (normalizedStatus === 'failed') {
        aggregate.failed += 1
      } else {
        aggregate.neverExecuted += 1
      }
      testsByObj.set(objId, aggregate)

      if (test.requirementId) {
        const reqAggregate = requirementsByObj.get(objId) ?? {
          total: new Set<string>(),
          covered: new Set<string>(),
        }
        reqAggregate.total.add(test.requirementId)
        if (normalizedStatus === 'passed') {
          reqAggregate.covered.add(test.requirementId)
        }
        requirementsByObj.set(objId, reqAggregate)
      }
    }
  }

  const qualityScore = computeQualityScore({
    passed: tests.summary.passed,
    failed: tests.summary.failed,
    neverExecuted: tests.summary.neverExecuted,
  })
  const deliveryScore = computeDeliveryScore(features)
  const securityScore = computeSecurityScore({
    sbomAvailable: securitySummary.sbomAvailable,
    lastScanStatus: securitySummary.lastScanStatus,
    gateStatus: securitySummary.gateStatus,
    openCriticalFindings: securitySummary.openCriticalFindings,
    openHighFindings: securitySummary.openHighFindings,
  })
  const documentationScore = docs.score
  const offlineScore = offline.score

  const dimensions: Obj16DimensionResult[] = [
    {
      key: 'delivery',
      label: 'Delivery',
      weight: modelWeights.delivery,
      score: deliveryScore,
      level: scoreToLevel(deliveryScore),
      state: scoreToState(deliveryScore),
      explanation: 'Build progress by feature phase and review status.',
    },
    {
      key: 'quality',
      label: 'Quality',
      weight: modelWeights.quality,
      score: qualityScore,
      level: scoreToLevel(qualityScore),
      state: scoreToState(qualityScore),
      explanation: 'Consolidated test status (Passed / Failed / Never Executed).',
    },
    {
      key: 'security',
      label: 'Security',
      weight: modelWeights.security,
      score: securityScore,
      level: scoreToLevel(securityScore),
      state: scoreToState(securityScore),
      explanation: 'SBOM + scan posture + open findings + gate decision.',
    },
    {
      key: 'documentation',
      label: 'Documentation',
      weight: modelWeights.documentation,
      score: documentationScore,
      level: scoreToLevel(documentationScore),
      state: scoreToState(documentationScore),
      explanation: 'arc42, user manual and operations docs are present and current.',
    },
    {
      key: 'offline',
      label: 'Offline Readiness',
      weight: modelWeights.offline,
      score: offlineScore,
      level: scoreToLevel(offlineScore),
      state: scoreToState(offlineScore),
      explanation: 'Zarf, export status and App-of-Apps readiness.',
    },
  ]

  const overallScore = clampScore(
    dimensions.reduce((accumulator, dimension) => {
      return accumulator + dimension.score * dimension.weight
    }, 0),
  )

  const featuresData: Obj16FeatureEntry[] = features.map((feature) => {
    const testAggregate = testsByObj.get(feature.id)
    const requirementAggregate = requirementsByObj.get(feature.id)

    const releaseChannel = resolveReleaseChannel(feature, channelOverrides)
    const testStatus = resolveTestStatus(testAggregate)
    const reqTotal = requirementAggregate?.total.size ?? 0
    const reqCovered = requirementAggregate?.covered.size ?? 0
    const requirementPercentage =
      reqTotal > 0 ? clampScore((reqCovered / reqTotal) * 100) : null

    const securityState =
      feature.id === 'OBJ-17'
        ? scoreToState(securityScore)
        : securitySummary.openCriticalFindings > 0
          ? 'warning'
          : 'healthy'
    const docsState = scoreToState(documentationScore)
    const offlineState = scoreToState(offlineScore)

    const riskPriority = determineRiskPriority({
      featureStatus: feature.status,
      releaseChannel,
      testStatus,
      securityState,
      docsState,
      offlineState,
    })

    return {
      id: feature.id,
      name: feature.name,
      phase: feature.phase,
      status: feature.status,
      releaseChannel,
      testStatus,
      testCounts: testAggregate ?? {
        total: 0,
        passed: 0,
        failed: 0,
        neverExecuted: 0,
      },
      requirementsCoverage: {
        covered: reqCovered,
        total: reqTotal,
        percentage: requirementPercentage,
      },
      securityIndicator: securityState,
      documentationIndicator: docsState,
      offlineIndicator: offlineState,
      riskPriority,
      milestone:
        riskPriority === 'blocker'
          ? 'Fix before next release gate'
          : riskPriority === 'high'
            ? 'Resolve in current planning cycle'
            : 'Keep monitoring in normal cadence',
      nextStep:
        testStatus === 'failed'
          ? 'Run targeted bugfix + /qa rerun'
          : testStatus === 'never_executed'
            ? 'Create/execute evidence for this feature'
            : 'Keep evidence and documentation synchronized',
    }
  })

  const openPoints = buildOpenPoints({
    features: featuresData,
    security: securitySummary,
    documentationState: scoreToState(documentationScore),
    offlineState: scoreToState(offlineScore),
  })

  const totalRequirements = traceability.summary.total
  const coveredRequirements =
    traceability.summary.fulfilled + traceability.summary.partial + traceability.summary.manual
  const requirementsCoverage =
    totalRequirements > 0
      ? clampScore((coveredRequirements / totalRequirements) * 100)
      : null

  return {
    generatedAt: new Date().toISOString(),
    sourceOfTruth: 'git',
    overall: {
      score: overallScore,
      level: scoreToLevel(overallScore),
      rationale:
        'Overall level is weighted across Delivery, Quality, Security, Documentation and Offline readiness.',
    },
    model: {
      formula:
        'overall = delivery*0.24 + quality*0.24 + security*0.24 + documentation*0.14 + offline*0.14',
      weights: modelWeights,
    },
    legend: [
      {
        channel: 'released',
        label: 'Released',
        meaning: 'General availability for operational use.',
        riskHint: 'Only with green quality/security gate.',
      },
      {
        channel: 'beta',
        label: 'Beta',
        meaning: 'Usable with known constraints and active monitoring.',
        riskHint: 'Needs focused QA and explicit stakeholder awareness.',
      },
      {
        channel: 'preview',
        label: 'Preview',
        meaning: 'Early state for validation and fast feedback.',
        riskHint: 'Not for mission-critical production rollout.',
      },
      {
        channel: 'unknown',
        label: 'Unknown',
        meaning: 'Channel not mapped from feature/release metadata.',
        riskHint: 'Treat as risk until metadata is completed.',
      },
    ],
    kpis: {
      totalFeatures: featuresData.length,
      released: featuresData.filter((entry) => entry.releaseChannel === 'released').length,
      beta: featuresData.filter((entry) => entry.releaseChannel === 'beta').length,
      preview: featuresData.filter((entry) => entry.releaseChannel === 'preview').length,
      tests: {
        passed: tests.summary.passed,
        failed: tests.summary.failed,
        neverExecuted: tests.summary.neverExecuted,
      },
      requirementsCoverage: {
        covered: coveredRequirements,
        total: totalRequirements,
        percentage: requirementsCoverage,
      },
      security: {
        sbomAvailable: securitySummary.sbomAvailable,
        lastScanStatus: securitySummary.lastScanStatus,
        openCriticalFindings: securitySummary.openCriticalFindings,
        openHighFindings: securitySummary.openHighFindings,
        gateStatus: securitySummary.gateStatus,
      },
      documentation: {
        arc42Current: docs.arc42Current,
        userManualCurrent: docs.userManualCurrent,
        operationsCurrent: docs.operationsCurrent,
      },
      offline: {
        zarfAvailable: offline.zarfAvailable,
        exportStatus: offline.exportStatus,
        appOfAppsReady: offline.appOfAppsReady,
      },
    },
    dimensions,
    features: featuresData,
    openPoints,
    milestones: loadMilestonesFromEnv(),
  }
}

export interface Obj16FeatureFilters {
  phase?: string | null
  status?: Obj16FeatureStatus | null
  releaseChannel?: Obj16ReleaseChannel | null
  riskPriority?: Obj16Priority | null
  testStatus?: Obj16TestStatus | null
  query?: string | null
}

export function filterObj16Features(
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
