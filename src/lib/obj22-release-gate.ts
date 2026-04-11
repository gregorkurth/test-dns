import { promises as fs } from 'node:fs'
import path from 'node:path'

import { compareReleaseVersions, type ReleaseChannel, type ReleaseStatus } from '@/lib/obj14-release-management'

export type Obj22GateDecision = 'pass' | 'fail' | 'accepted-risk'
export type Obj22ArtifactKind =
  | 'oci-image'
  | 'release-attachment'
  | 'manifest-bundle'
  | 'zarf-package'
  | 'security-bundle'

export interface Obj22GateViolation {
  ruleId: string
  severity: 'blocking' | 'warning'
  path: string | null
  message: string
  waived: boolean
  exceptionId: string | null
}

export interface Obj22GateException {
  id: string
  title: string
  version: string
  artifactKinds?: Obj22ArtifactKind[]
  artifactNamePattern?: string | null
  ruleIds: string[]
  decision: 'accepted-risk'
  reason: string
  approvedBy: string
  expiresAt: string
}

export interface Obj22ArtifactReport {
  id: string
  name: string
  kind: Obj22ArtifactKind
  version: string
  channel: ReleaseChannel
  reference: string
  localPath: string | null
  status: 'checked' | 'missing' | 'remote-only'
  exists: boolean
  decision: Obj22GateDecision
  sizeBytes: number | null
  fileCount: number | null
  topLevelEntries: string[]
  digest: string | null
  releaseStatus: ReleaseStatus
  checks: {
    allowlist: boolean
    forbiddenContent: boolean
    fileCountWithinLimit: boolean
    sizeWithinLimit: boolean
    securityState: boolean
    ociConformant: boolean
  }
  violations: Obj22GateViolation[]
  exceptionsApplied: Obj22GateException[]
  notes: string[]
}

export interface Obj22GateReport {
  service: string
  sourceOfTruth: string
  generatedAt: string
  version: string
  channel: ReleaseChannel
  releaseStatus: ReleaseStatus
  releaseTitle: string
  policyVersion: string
  policyPath: string
  decision: Obj22GateDecision
  blockPublish: boolean
  blockExport: boolean
  summary: {
    artifactCount: number
    passedArtifacts: number
    failedArtifacts: number
    acceptedRiskArtifacts: number
    blockingViolations: number
    warningViolations: number
  }
  artifacts: Obj22ArtifactReport[]
  exceptionsApplied: Obj22GateException[]
  notes: string[]
}

export interface Obj22GateIndex {
  service: string
  sourceOfTruth: string
  updatedAt: string
  policyVersion: string
  reports: Obj22GateReport[]
}

export interface Obj22GateSummary {
  generatedAt: string
  sourceOfTruth: string
  policyVersion: string
  totalReports: number
  latestVersion: string | null
  releaseDecisions: Record<Obj22GateDecision, number>
  blockingReports: number
  blockedVersions: string[]
  acceptedRiskVersions: string[]
  artifactKinds: Obj22ArtifactKind[]
}

const gateIndexPath = path.join(process.cwd(), 'artifacts', 'gate-reports', 'INDEX.json')

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function ensureString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid OBJ-22 field: ${fieldName}`)
  }
  return value
}

function ensureBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid OBJ-22 field: ${fieldName}`)
  }
  return value
}

function ensureNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    throw new Error(`Invalid OBJ-22 field: ${fieldName}`)
  }
  return value
}

function parseDecision(value: unknown, fieldName: string): Obj22GateDecision {
  const normalized = ensureString(value, fieldName)
  if (normalized !== 'pass' && normalized !== 'fail' && normalized !== 'accepted-risk') {
    throw new Error(`Invalid OBJ-22 decision in ${fieldName}: ${normalized}`)
  }
  return normalized
}

function parseArtifactKind(value: unknown, fieldName: string): Obj22ArtifactKind {
  const normalized = ensureString(value, fieldName)
  if (
    normalized !== 'oci-image' &&
    normalized !== 'release-attachment' &&
    normalized !== 'manifest-bundle' &&
    normalized !== 'zarf-package' &&
    normalized !== 'security-bundle'
  ) {
    throw new Error(`Invalid OBJ-22 artifact kind in ${fieldName}: ${normalized}`)
  }
  return normalized
}

function parseReleaseChannel(value: unknown, fieldName: string): ReleaseChannel {
  const normalized = ensureString(value, fieldName)
  if (normalized !== 'ga' && normalized !== 'beta' && normalized !== 'rc') {
    throw new Error(`Invalid OBJ-22 channel in ${fieldName}: ${normalized}`)
  }
  return normalized
}

function parseReleaseStatus(value: unknown, fieldName: string): ReleaseStatus {
  const normalized = ensureString(value, fieldName)
  if (
    normalized !== 'planned' &&
    normalized !== 'draft' &&
    normalized !== 'release-candidate' &&
    normalized !== 'released'
  ) {
    throw new Error(`Invalid OBJ-22 release status in ${fieldName}: ${normalized}`)
  }
  return normalized
}

function parseViolation(value: unknown, fieldPrefix: string): Obj22GateViolation {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-22 field: ${fieldPrefix}`)
  }

  const severity = ensureString(value.severity, `${fieldPrefix}.severity`)
  if (severity !== 'blocking' && severity !== 'warning') {
    throw new Error(`Invalid OBJ-22 severity in ${fieldPrefix}.severity: ${severity}`)
  }

  return {
    ruleId: ensureString(value.ruleId, `${fieldPrefix}.ruleId`),
    severity,
    path: value.path === null ? null : ensureString(value.path, `${fieldPrefix}.path`),
    message: ensureString(value.message, `${fieldPrefix}.message`),
    waived: ensureBoolean(value.waived, `${fieldPrefix}.waived`),
    exceptionId:
      value.exceptionId === null
        ? null
        : ensureString(value.exceptionId, `${fieldPrefix}.exceptionId`),
  }
}

function parseException(value: unknown, fieldPrefix: string): Obj22GateException {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-22 field: ${fieldPrefix}`)
  }

  const artifactKinds = Array.isArray(value.artifactKinds)
    ? value.artifactKinds.map((entry, index) =>
        parseArtifactKind(entry, `${fieldPrefix}.artifactKinds[${index}]`),
      )
    : undefined
  const ruleIds = Array.isArray(value.ruleIds)
    ? value.ruleIds.map((entry, index) =>
        ensureString(entry, `${fieldPrefix}.ruleIds[${index}]`),
      )
    : (() => {
        throw new Error(`Invalid OBJ-22 field: ${fieldPrefix}.ruleIds`)
      })()

  return {
    id: ensureString(value.id, `${fieldPrefix}.id`),
    title: ensureString(value.title, `${fieldPrefix}.title`),
    version: ensureString(value.version, `${fieldPrefix}.version`),
    artifactKinds,
    artifactNamePattern:
      value.artifactNamePattern === undefined || value.artifactNamePattern === null
        ? null
        : ensureString(value.artifactNamePattern, `${fieldPrefix}.artifactNamePattern`),
    ruleIds,
    decision: parseDecision(value.decision, `${fieldPrefix}.decision`) as 'accepted-risk',
    reason: ensureString(value.reason, `${fieldPrefix}.reason`),
    approvedBy: ensureString(value.approvedBy, `${fieldPrefix}.approvedBy`),
    expiresAt: ensureString(value.expiresAt, `${fieldPrefix}.expiresAt`),
  }
}

function parseArtifactReport(value: unknown, fieldPrefix: string): Obj22ArtifactReport {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-22 field: ${fieldPrefix}`)
  }

  if (!isRecord(value.checks)) {
    throw new Error(`Invalid OBJ-22 field: ${fieldPrefix}.checks`)
  }

  return {
    id: ensureString(value.id, `${fieldPrefix}.id`),
    name: ensureString(value.name, `${fieldPrefix}.name`),
    kind: parseArtifactKind(value.kind, `${fieldPrefix}.kind`),
    version: ensureString(value.version, `${fieldPrefix}.version`),
    channel: parseReleaseChannel(value.channel, `${fieldPrefix}.channel`),
    reference: ensureString(value.reference, `${fieldPrefix}.reference`),
    localPath:
      value.localPath === null
        ? null
        : ensureString(value.localPath, `${fieldPrefix}.localPath`),
    status: ensureString(value.status, `${fieldPrefix}.status`) as Obj22ArtifactReport['status'],
    exists: ensureBoolean(value.exists, `${fieldPrefix}.exists`),
    decision: parseDecision(value.decision, `${fieldPrefix}.decision`),
    sizeBytes:
      value.sizeBytes === null
        ? null
        : ensureNumber(value.sizeBytes, `${fieldPrefix}.sizeBytes`),
    fileCount:
      value.fileCount === null
        ? null
        : ensureNumber(value.fileCount, `${fieldPrefix}.fileCount`),
    topLevelEntries: Array.isArray(value.topLevelEntries)
      ? value.topLevelEntries.map((entry, index) =>
          ensureString(entry, `${fieldPrefix}.topLevelEntries[${index}]`),
        )
      : [],
    digest:
      value.digest === null ? null : ensureString(value.digest, `${fieldPrefix}.digest`),
    releaseStatus: parseReleaseStatus(value.releaseStatus, `${fieldPrefix}.releaseStatus`),
    checks: {
      allowlist: ensureBoolean(value.checks.allowlist, `${fieldPrefix}.checks.allowlist`),
      forbiddenContent: ensureBoolean(
        value.checks.forbiddenContent,
        `${fieldPrefix}.checks.forbiddenContent`,
      ),
      fileCountWithinLimit: ensureBoolean(
        value.checks.fileCountWithinLimit,
        `${fieldPrefix}.checks.fileCountWithinLimit`,
      ),
      sizeWithinLimit: ensureBoolean(
        value.checks.sizeWithinLimit,
        `${fieldPrefix}.checks.sizeWithinLimit`,
      ),
      securityState: ensureBoolean(
        value.checks.securityState,
        `${fieldPrefix}.checks.securityState`,
      ),
      ociConformant: ensureBoolean(
        value.checks.ociConformant,
        `${fieldPrefix}.checks.ociConformant`,
      ),
    },
    violations: Array.isArray(value.violations)
      ? value.violations.map((entry, index) =>
          parseViolation(entry, `${fieldPrefix}.violations[${index}]`),
        )
      : [],
    exceptionsApplied: Array.isArray(value.exceptionsApplied)
      ? value.exceptionsApplied.map((entry, index) =>
          parseException(entry, `${fieldPrefix}.exceptionsApplied[${index}]`),
        )
      : [],
    notes: Array.isArray(value.notes)
      ? value.notes.map((entry, index) => ensureString(entry, `${fieldPrefix}.notes[${index}]`))
      : [],
  }
}

function parseReport(value: unknown, fieldPrefix: string): Obj22GateReport {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-22 field: ${fieldPrefix}`)
  }
  if (!isRecord(value.summary)) {
    throw new Error(`Invalid OBJ-22 field: ${fieldPrefix}.summary`)
  }

  return {
    service: ensureString(value.service, `${fieldPrefix}.service`),
    sourceOfTruth: ensureString(value.sourceOfTruth, `${fieldPrefix}.sourceOfTruth`),
    generatedAt: ensureString(value.generatedAt, `${fieldPrefix}.generatedAt`),
    version: ensureString(value.version, `${fieldPrefix}.version`),
    channel: parseReleaseChannel(value.channel, `${fieldPrefix}.channel`),
    releaseStatus: parseReleaseStatus(value.releaseStatus, `${fieldPrefix}.releaseStatus`),
    releaseTitle: ensureString(value.releaseTitle, `${fieldPrefix}.releaseTitle`),
    policyVersion: ensureString(value.policyVersion, `${fieldPrefix}.policyVersion`),
    policyPath: ensureString(value.policyPath, `${fieldPrefix}.policyPath`),
    decision: parseDecision(value.decision, `${fieldPrefix}.decision`),
    blockPublish: ensureBoolean(value.blockPublish, `${fieldPrefix}.blockPublish`),
    blockExport: ensureBoolean(value.blockExport, `${fieldPrefix}.blockExport`),
    summary: {
      artifactCount: ensureNumber(value.summary.artifactCount, `${fieldPrefix}.summary.artifactCount`),
      passedArtifacts: ensureNumber(value.summary.passedArtifacts, `${fieldPrefix}.summary.passedArtifacts`),
      failedArtifacts: ensureNumber(value.summary.failedArtifacts, `${fieldPrefix}.summary.failedArtifacts`),
      acceptedRiskArtifacts: ensureNumber(
        value.summary.acceptedRiskArtifacts,
        `${fieldPrefix}.summary.acceptedRiskArtifacts`,
      ),
      blockingViolations: ensureNumber(
        value.summary.blockingViolations,
        `${fieldPrefix}.summary.blockingViolations`,
      ),
      warningViolations: ensureNumber(
        value.summary.warningViolations,
        `${fieldPrefix}.summary.warningViolations`,
      ),
    },
    artifacts: Array.isArray(value.artifacts)
      ? value.artifacts.map((entry, index) =>
          parseArtifactReport(entry, `${fieldPrefix}.artifacts[${index}]`),
        )
      : [],
    exceptionsApplied: Array.isArray(value.exceptionsApplied)
      ? value.exceptionsApplied.map((entry, index) =>
          parseException(entry, `${fieldPrefix}.exceptionsApplied[${index}]`),
        )
      : [],
    notes: Array.isArray(value.notes)
      ? value.notes.map((entry, index) => ensureString(entry, `${fieldPrefix}.notes[${index}]`))
      : [],
  }
}

export function parseObj22GateDecision(value: string): Obj22GateDecision | null {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'pass' || normalized === 'fail' || normalized === 'accepted-risk') {
    return normalized
  }
  return null
}

export function parseObj22ArtifactKind(value: string): Obj22ArtifactKind | null {
  const normalized = value.trim().toLowerCase()
  if (
    normalized === 'oci-image' ||
    normalized === 'release-attachment' ||
    normalized === 'manifest-bundle' ||
    normalized === 'zarf-package' ||
    normalized === 'security-bundle'
  ) {
    return normalized
  }
  return null
}

export async function loadObj22GateIndex(): Promise<Obj22GateIndex> {
  const content = await fs.readFile(gateIndexPath, 'utf8')
  const parsed = JSON.parse(content) as unknown
  if (!isRecord(parsed)) {
    throw new Error('Invalid OBJ-22 gate report index.')
  }

  const reports = Array.isArray(parsed.reports)
    ? parsed.reports.map((entry, index) => parseReport(entry, `reports[${index}]`))
    : (() => {
        throw new Error('Invalid OBJ-22 field: reports')
      })()

  return {
    service: ensureString(parsed.service, 'service'),
    sourceOfTruth: ensureString(parsed.sourceOfTruth, 'sourceOfTruth'),
    updatedAt: ensureString(parsed.updatedAt, 'updatedAt'),
    policyVersion: ensureString(parsed.policyVersion, 'policyVersion'),
    reports,
  }
}

export async function getObj22GateReports(filters?: {
  version?: string | null
  decision?: Obj22GateDecision | null
  artifactKind?: Obj22ArtifactKind | null
  limit?: number
}): Promise<Obj22GateReport[]> {
  const index = await loadObj22GateIndex()

  const filtered = index.reports
    .slice()
    .sort((left, right) => compareReleaseVersions(right.version, left.version))
    .map((report) => {
      if (!filters?.artifactKind) {
        return report
      }

      const artifacts = report.artifacts.filter((artifact) => artifact.kind === filters.artifactKind)
      return {
        ...report,
        artifacts,
        summary: {
          ...report.summary,
          artifactCount: artifacts.length,
          passedArtifacts: artifacts.filter((artifact) => artifact.decision === 'pass').length,
          failedArtifacts: artifacts.filter((artifact) => artifact.decision === 'fail').length,
          acceptedRiskArtifacts: artifacts.filter(
            (artifact) => artifact.decision === 'accepted-risk',
          ).length,
          blockingViolations: artifacts.reduce(
            (total, artifact) =>
              total +
              artifact.violations.filter(
                (violation) => violation.severity === 'blocking' && !violation.waived,
              ).length,
            0,
          ),
          warningViolations: artifacts.reduce(
            (total, artifact) =>
              total + artifact.violations.filter((violation) => violation.waived).length,
            0,
          ),
        },
      }
    })
    .filter((report) => {
      if (filters?.version && report.version !== filters.version) {
        return false
      }
      if (filters?.decision && report.decision !== filters.decision) {
        return false
      }
      if (filters?.artifactKind && report.artifacts.length === 0) {
        return false
      }
      return true
    })

  return typeof filters?.limit === 'number' ? filtered.slice(0, filters.limit) : filtered
}

export async function getLatestObj22GateReport(): Promise<Obj22GateReport | null> {
  const reports = await getObj22GateReports({ limit: 1 })
  return reports[0] ?? null
}

export async function getObj22GateSummary(): Promise<Obj22GateSummary> {
  const index = await loadObj22GateIndex()
  const reports = index.reports
    .slice()
    .sort((left, right) => compareReleaseVersions(right.version, left.version))

  const releaseDecisions: Record<Obj22GateDecision, number> = {
    pass: 0,
    fail: 0,
    'accepted-risk': 0,
  }
  const artifactKinds = new Set<Obj22ArtifactKind>()
  for (const report of reports) {
    releaseDecisions[report.decision] += 1
    for (const artifact of report.artifacts) {
      artifactKinds.add(artifact.kind)
    }
  }

  return {
    generatedAt: index.updatedAt,
    sourceOfTruth: index.sourceOfTruth,
    policyVersion: index.policyVersion,
    totalReports: reports.length,
    latestVersion: reports[0]?.version ?? null,
    releaseDecisions,
    blockingReports: reports.filter((report) => report.blockPublish).length,
    blockedVersions: reports.filter((report) => report.blockPublish).map((report) => report.version),
    acceptedRiskVersions: reports
      .filter((report) => report.decision === 'accepted-risk')
      .map((report) => report.version),
    artifactKinds: Array.from(artifactKinds).sort(),
  }
}
