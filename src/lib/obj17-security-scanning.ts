import { promises as fs } from 'node:fs'
import path from 'node:path'

import { compareReleaseVersions } from '@/lib/obj14-release-management'

export type Obj17ReleaseChannel = 'ga' | 'beta' | 'rc'
export type Obj17ScanStatus = 'passed' | 'failed' | 'unknown'
export type Obj17GateStatus = 'pass' | 'fail' | 'accepted-risk' | 'unknown'

export interface Obj17ScanResult {
  status: Obj17ScanStatus
  tool: string
  reportPath: string
}

export interface Obj17SecurityBundle {
  version: string
  channel: Obj17ReleaseChannel
  generatedAt: string
  sbom: {
    available: boolean
    format: 'spdx-json' | 'cyclonedx-json'
    path: string
  }
  scans: {
    sast: Obj17ScanResult
    sca: Obj17ScanResult
    container: Obj17ScanResult
    config: Obj17ScanResult
  }
  findings: {
    criticalOpen: number
    highOpen: number
    highAcceptedRisk: number
  }
  gate: {
    status: Obj17GateStatus
    decisionRef: string
    owner: string
    acceptedRiskExpiresAt: string | null
    dbSnapshotVersion: string
    dbSnapshotUpdatedAt: string
  }
  evidence: {
    releaseAttachment: boolean
    ociRegistryReference: string
    offlineSnapshotAvailable: boolean
    offlineSnapshotPath: string
  }
}

export interface Obj17SecurityDocument {
  service: string
  sourceOfTruth: string
  updatedAt: string
  bundles: Obj17SecurityBundle[]
}

export interface Obj17SecuritySummary {
  generatedAt: string
  sourceOfTruth: string
  bundlesTotal: number
  latestVersion: string | null
  sbomAvailable: boolean
  lastScanStatus: Obj17ScanStatus
  openCriticalFindings: number
  openHighFindings: number
  gateStatus: Obj17GateStatus
  offlineSnapshotAvailable: boolean
  dbSnapshotVersion: string | null
  dbSnapshotUpdatedAt: string | null
}

const securityBundlesPath = path.join(
  process.cwd(),
  'docs',
  'releases',
  'SECURITY-SCAN-BUNDLES.json',
)

const semverPattern =
  /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function ensureString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid OBJ-17 field: ${fieldName}`)
  }
  return value
}

function ensureBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid OBJ-17 field: ${fieldName}`)
  }
  return value
}

function ensureNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    throw new Error(`Invalid OBJ-17 field: ${fieldName}`)
  }
  return value
}

function parseScanStatus(value: unknown, fieldName: string): Obj17ScanStatus {
  const normalized = ensureString(value, fieldName)
  if (normalized !== 'passed' && normalized !== 'failed' && normalized !== 'unknown') {
    throw new Error(`Invalid OBJ-17 status in ${fieldName}: ${normalized}`)
  }
  return normalized
}

function parseChannel(value: unknown, fieldName: string): Obj17ReleaseChannel {
  const normalized = ensureString(value, fieldName)
  if (normalized !== 'ga' && normalized !== 'beta' && normalized !== 'rc') {
    throw new Error(`Invalid OBJ-17 channel in ${fieldName}: ${normalized}`)
  }
  return normalized
}

function parseGateStatus(value: unknown, fieldName: string): Obj17GateStatus {
  const normalized = ensureString(value, fieldName)
  if (
    normalized !== 'pass' &&
    normalized !== 'fail' &&
    normalized !== 'accepted-risk' &&
    normalized !== 'unknown'
  ) {
    throw new Error(`Invalid OBJ-17 gate status in ${fieldName}: ${normalized}`)
  }
  return normalized
}

function parseScanResult(value: unknown, fieldPrefix: string): Obj17ScanResult {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-17 field: ${fieldPrefix}`)
  }
  return {
    status: parseScanStatus(value.status, `${fieldPrefix}.status`),
    tool: ensureString(value.tool, `${fieldPrefix}.tool`),
    reportPath: ensureString(value.reportPath, `${fieldPrefix}.reportPath`),
  }
}

function parseBundle(value: unknown, index: number): Obj17SecurityBundle {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-17 bundle at index ${index}`)
  }

  const version = ensureString(value.version, `bundles[${index}].version`)
  if (!semverPattern.test(version)) {
    throw new Error(`Invalid OBJ-17 bundle version: ${version}`)
  }

  if (!isRecord(value.sbom)) {
    throw new Error(`Invalid OBJ-17 field: bundles[${index}].sbom`)
  }

  const sbomFormat = ensureString(value.sbom.format, `bundles[${index}].sbom.format`)
  if (sbomFormat !== 'spdx-json' && sbomFormat !== 'cyclonedx-json') {
    throw new Error(`Invalid OBJ-17 SBOM format: ${sbomFormat}`)
  }

  if (!isRecord(value.scans)) {
    throw new Error(`Invalid OBJ-17 field: bundles[${index}].scans`)
  }

  if (!isRecord(value.findings)) {
    throw new Error(`Invalid OBJ-17 field: bundles[${index}].findings`)
  }

  if (!isRecord(value.gate)) {
    throw new Error(`Invalid OBJ-17 field: bundles[${index}].gate`)
  }

  if (!isRecord(value.evidence)) {
    throw new Error(`Invalid OBJ-17 field: bundles[${index}].evidence`)
  }

  return {
    version,
    channel: parseChannel(value.channel, `bundles[${index}].channel`),
    generatedAt: ensureString(value.generatedAt, `bundles[${index}].generatedAt`),
    sbom: {
      available: ensureBoolean(value.sbom.available, `bundles[${index}].sbom.available`),
      format: sbomFormat,
      path: ensureString(value.sbom.path, `bundles[${index}].sbom.path`),
    },
    scans: {
      sast: parseScanResult(value.scans.sast, `bundles[${index}].scans.sast`),
      sca: parseScanResult(value.scans.sca, `bundles[${index}].scans.sca`),
      container: parseScanResult(
        value.scans.container,
        `bundles[${index}].scans.container`,
      ),
      config: parseScanResult(value.scans.config, `bundles[${index}].scans.config`),
    },
    findings: {
      criticalOpen: ensureNumber(
        value.findings.criticalOpen,
        `bundles[${index}].findings.criticalOpen`,
      ),
      highOpen: ensureNumber(value.findings.highOpen, `bundles[${index}].findings.highOpen`),
      highAcceptedRisk: ensureNumber(
        value.findings.highAcceptedRisk,
        `bundles[${index}].findings.highAcceptedRisk`,
      ),
    },
    gate: {
      status: parseGateStatus(value.gate.status, `bundles[${index}].gate.status`),
      decisionRef: ensureString(value.gate.decisionRef, `bundles[${index}].gate.decisionRef`),
      owner: ensureString(value.gate.owner, `bundles[${index}].gate.owner`),
      acceptedRiskExpiresAt:
        value.gate.acceptedRiskExpiresAt === null
          ? null
          : ensureString(
              value.gate.acceptedRiskExpiresAt,
              `bundles[${index}].gate.acceptedRiskExpiresAt`,
            ),
      dbSnapshotVersion: ensureString(
        value.gate.dbSnapshotVersion,
        `bundles[${index}].gate.dbSnapshotVersion`,
      ),
      dbSnapshotUpdatedAt: ensureString(
        value.gate.dbSnapshotUpdatedAt,
        `bundles[${index}].gate.dbSnapshotUpdatedAt`,
      ),
    },
    evidence: {
      releaseAttachment: ensureBoolean(
        value.evidence.releaseAttachment,
        `bundles[${index}].evidence.releaseAttachment`,
      ),
      ociRegistryReference: ensureString(
        value.evidence.ociRegistryReference,
        `bundles[${index}].evidence.ociRegistryReference`,
      ),
      offlineSnapshotAvailable: ensureBoolean(
        value.evidence.offlineSnapshotAvailable,
        `bundles[${index}].evidence.offlineSnapshotAvailable`,
      ),
      offlineSnapshotPath: ensureString(
        value.evidence.offlineSnapshotPath,
        `bundles[${index}].evidence.offlineSnapshotPath`,
      ),
    },
  }
}

function compareBundleDesc(left: Obj17SecurityBundle, right: Obj17SecurityBundle): number {
  return compareReleaseVersions(right.version, left.version)
}

function deriveLastScanStatus(bundle: Obj17SecurityBundle): Obj17ScanStatus {
  const statuses = [
    bundle.scans.sast.status,
    bundle.scans.sca.status,
    bundle.scans.container.status,
    bundle.scans.config.status,
  ]
  if (statuses.includes('failed')) {
    return 'failed'
  }
  if (statuses.every((status) => status === 'passed')) {
    return 'passed'
  }
  return 'unknown'
}

export async function loadObj17SecurityDocument(): Promise<Obj17SecurityDocument> {
  const raw = await fs.readFile(securityBundlesPath, 'utf8')
  const parsed = JSON.parse(raw) as unknown
  if (!isRecord(parsed)) {
    throw new Error('SECURITY-SCAN-BUNDLES.json must contain a JSON object.')
  }

  if (!Array.isArray(parsed.bundles)) {
    throw new Error('SECURITY-SCAN-BUNDLES.json is missing bundles[].')
  }

  const bundles = parsed.bundles.map((entry, index) => parseBundle(entry, index))
  bundles.sort(compareBundleDesc)

  return {
    service: ensureString(parsed.service, 'service'),
    sourceOfTruth: ensureString(parsed.sourceOfTruth, 'sourceOfTruth'),
    updatedAt: ensureString(parsed.updatedAt, 'updatedAt'),
    bundles,
  }
}

export async function getObj17SecurityBundles(options?: {
  version?: string | null
  channel?: Obj17ReleaseChannel | null
  limit?: number
}): Promise<Obj17SecurityBundle[]> {
  const document = await loadObj17SecurityDocument()
  const filtered = document.bundles.filter((bundle) => {
    if (options?.version && bundle.version !== options.version) {
      return false
    }
    if (options?.channel && bundle.channel !== options.channel) {
      return false
    }
    return true
  })

  if (typeof options?.limit === 'number' && Number.isFinite(options.limit)) {
    return filtered.slice(0, Math.max(0, options.limit))
  }
  return filtered
}

export async function getLatestObj17SecurityBundle(): Promise<Obj17SecurityBundle | null> {
  const bundles = await getObj17SecurityBundles({ limit: 1 })
  return bundles[0] ?? null
}

export async function getObj17SecuritySummary(): Promise<Obj17SecuritySummary> {
  const document = await loadObj17SecurityDocument()
  const latest = document.bundles[0] ?? null

  if (!latest) {
    return {
      generatedAt: document.updatedAt,
      sourceOfTruth: document.sourceOfTruth,
      bundlesTotal: 0,
      latestVersion: null,
      sbomAvailable: false,
      lastScanStatus: 'unknown',
      openCriticalFindings: 0,
      openHighFindings: 0,
      gateStatus: 'unknown',
      offlineSnapshotAvailable: false,
      dbSnapshotVersion: null,
      dbSnapshotUpdatedAt: null,
    }
  }

  return {
    generatedAt: document.updatedAt,
    sourceOfTruth: document.sourceOfTruth,
    bundlesTotal: document.bundles.length,
    latestVersion: latest.version,
    sbomAvailable: latest.sbom.available,
    lastScanStatus: deriveLastScanStatus(latest),
    openCriticalFindings: latest.findings.criticalOpen,
    openHighFindings: latest.findings.highOpen,
    gateStatus: latest.gate.status,
    offlineSnapshotAvailable: latest.evidence.offlineSnapshotAvailable,
    dbSnapshotVersion: latest.gate.dbSnapshotVersion,
    dbSnapshotUpdatedAt: latest.gate.dbSnapshotUpdatedAt,
  }
}
