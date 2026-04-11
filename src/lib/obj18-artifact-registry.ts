import { promises as fs } from 'node:fs'

import {
  getReleaseNotices,
  type ReleaseNotice,
  type ReleaseArtifact,
} from '@/lib/obj14-release-management'
import {
  getObj17SecurityBundles,
  type Obj17GateStatus,
  type Obj17SecurityBundle,
} from '@/lib/obj17-security-scanning'

export type Obj18RegistryChannel = 'ga' | 'beta' | 'rc'
export type Obj18ArtifactType =
  | 'oci-image'
  | 'security-bundle'
  | 'sbom'
  | 'scan-report'
  | 'documentation-bundle'
  | 'release-bundle'
  | 'unknown'
export type Obj18PublishState = 'published' | 'blocked' | 'pending'
export type Obj18MetadataCompleteness = 'complete' | 'derived' | 'missing'

export interface Obj18RegistryRecord {
  id: string
  version: string
  channel: Obj18RegistryChannel
  publishedAt: string | null
  artifactType: Obj18ArtifactType
  artifactName: string
  reference: string
  repository: string
  primaryRegistry: string
  mirrorRegistry: string | null
  ociCompliant: boolean
  immutable: boolean
  tags: string[]
  digest: string | null
  publishState: Obj18PublishState
  metadata: {
    version: string
    buildDate: string | null
    gitSha: string | null
    buildPipelineUrl: string | null
    completeness: Obj18MetadataCompleteness
  }
  gate: {
    securityStatus: Obj17GateStatus | 'unknown'
    artifactGateStatus: 'passed' | 'blocked' | 'pending'
    publishedOnlyAfterGate: boolean
    decisionRefs: string[]
  }
  evidence: {
    linkedToRelease: boolean
    localPath: string | null
    localExists: boolean
  }
  retention: {
    policyLabel: string
    cleanupEligible: boolean
  }
  zarf: {
    included: boolean
    reason: string
  }
}

export interface Obj18RegistrySummary {
  generatedAt: string
  sourceOfTruth: string[]
  primaryRegistry: string
  mirrorRegistry: string | null
  totalArtifacts: number
  publishedArtifacts: number
  blockedArtifacts: number
  pendingArtifacts: number
  ociArtifacts: number
  zarfEligibleArtifacts: number
  metadataCompleteArtifacts: number
  publishedOnlyAfterGateArtifacts: number
  versions: string[]
}

export interface Obj18RegistryData {
  summary: Obj18RegistrySummary
  records: Obj18RegistryRecord[]
}

export interface Obj18RegistryFilters {
  version?: string | null
  channel?: Obj18RegistryChannel | null
  artifactType?: Obj18ArtifactType | null
  publishState?: Obj18PublishState | null
  zarfIncluded?: boolean | null
  limit?: number
}

const DEFAULT_PRIMARY_REGISTRY = 'ghcr.io'
const artifactTypeOrder: Obj18ArtifactType[] = [
  'oci-image',
  'security-bundle',
  'sbom',
  'scan-report',
  'documentation-bundle',
  'release-bundle',
  'unknown',
]

function unique<TValue>(values: TValue[]): TValue[] {
  return [...new Set(values)]
}

function deriveRepository(reference: string): string {
  const ghcrMatch = reference.match(/^ghcr\.io\/([^:@]+(?:\/[^:@]+)?)/)
  if (ghcrMatch?.[1]) {
    return ghcrMatch[1]
  }

  const pathMatch = reference.match(/^([^:]+(?:\/[^:]+)*)/)
  return pathMatch?.[1] ?? reference
}

function extractRepoSlug(reference: string): string | null {
  const ghcrMatch = reference.match(/^ghcr\.io\/([^/]+\/[^:@]+)(?:[:@].+)?$/)
  return ghcrMatch?.[1] ?? null
}

function extractTag(reference: string): string | null {
  const tagMatch = reference.match(/:([^:@/][^@]*)$/)
  return tagMatch?.[1] ?? null
}

function normalizeReleaseArtifactType(type: string): Obj18ArtifactType {
  switch (type) {
    case 'oci-image':
      return 'oci-image'
    case 'documentation-bundle':
      return 'documentation-bundle'
    case 'helm-chart':
    case 'manifest-bundle':
      return 'release-bundle'
    default:
      return 'unknown'
  }
}

function isOciCompliant(reference: string, artifactType: Obj18ArtifactType): boolean {
  if (artifactType === 'oci-image' || artifactType === 'security-bundle') {
    return reference.startsWith('ghcr.io/')
  }

  return artifactType === 'release-bundle'
}

function derivePublishState(
  release: ReleaseNotice | null,
  securityBundle: Obj17SecurityBundle | null,
): Obj18PublishState {
  if (release?.status === 'released') {
    return 'published'
  }

  if (securityBundle?.gate.status === 'fail') {
    return 'blocked'
  }

  return 'pending'
}

function deriveArtifactGateStatus(
  publishState: Obj18PublishState,
): Obj18RegistryRecord['gate']['artifactGateStatus'] {
  if (publishState === 'published') {
    return 'passed'
  }
  if (publishState === 'blocked') {
    return 'blocked'
  }
  return 'pending'
}

function deriveRetentionPolicy(
  release: ReleaseNotice | null,
  artifactType: Obj18ArtifactType,
): Obj18RegistryRecord['retention'] {
  if (release?.status === 'released') {
    return {
      policyLabel: 'Immutable release tags stay available; rolling tags may move.',
      cleanupEligible: false,
    }
  }

  if (artifactType === 'documentation-bundle') {
    return {
      policyLabel: 'Keep until export and release evidence are completed.',
      cleanupEligible: false,
    }
  }

  return {
    policyLabel: 'Rolling retention policy; keep latest working set and prune older previews.',
    cleanupEligible: true,
  }
}

function deriveZarfDecision(
  artifactType: Obj18ArtifactType,
): Obj18RegistryRecord['zarf'] {
  if (artifactType === 'oci-image' || artifactType === 'release-bundle') {
    return {
      included: true,
      reason: 'Required for offline package composition and target import.',
    }
  }

  if (artifactType === 'security-bundle') {
    return {
      included: true,
      reason: 'Security evidence may travel with offline release proof.',
    }
  }

  return {
    included: false,
    reason: 'Reference-only artifact; not required inside the Zarf payload.',
  }
}

async function fileExists(filePath: string | null): Promise<boolean> {
  if (!filePath) {
    return false
  }

  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function deriveMetadata(
  release: ReleaseNotice | null,
  securityBundle: Obj17SecurityBundle | null,
  reference: string,
): Promise<Obj18RegistryRecord['metadata']> {
  const repoSlug = extractRepoSlug(reference)
  const buildPipelineUrl = repoSlug
    ? `https://github.com/${repoSlug}/actions`
    : null
  const gitSha =
    extractTag(reference)?.startsWith('sha-')
      ? extractTag(reference)?.replace(/^sha-/, '') ?? null
      : null

  if (gitSha && buildPipelineUrl) {
    return {
      version: release?.version ?? securityBundle?.version ?? 'unknown',
      buildDate:
        release?.publishedAt ?? securityBundle?.generatedAt ?? null,
      gitSha,
      buildPipelineUrl,
      completeness: 'complete',
    }
  }

  if (buildPipelineUrl || release?.publishedAt || securityBundle?.generatedAt) {
    return {
      version: release?.version ?? securityBundle?.version ?? 'unknown',
      buildDate:
        release?.publishedAt ?? securityBundle?.generatedAt ?? null,
      gitSha: null,
      buildPipelineUrl,
      completeness: 'derived',
    }
  }

  return {
    version: release?.version ?? securityBundle?.version ?? 'unknown',
    buildDate: null,
    gitSha: null,
    buildPipelineUrl: null,
    completeness: 'missing',
  }
}

async function createRecord(input: {
  id: string
  version: string
  channel: Obj18RegistryChannel
  publishedAt: string | null
  artifactType: Obj18ArtifactType
  artifactName: string
  reference: string
  release: ReleaseNotice | null
  securityBundle: Obj17SecurityBundle | null
  localPath: string | null
  linkedToRelease: boolean
}): Promise<Obj18RegistryRecord> {
  const publishState = derivePublishState(input.release, input.securityBundle)
  const localExists = await fileExists(input.localPath)
  const metadata = await deriveMetadata(
    input.release,
    input.securityBundle,
    input.reference,
  )
  const tag = extractTag(input.reference)
  const zarf = deriveZarfDecision(input.artifactType)

  return {
    id: input.id,
    version: input.version,
    channel: input.channel,
    publishedAt: input.publishedAt,
    artifactType: input.artifactType,
    artifactName: input.artifactName,
    reference: input.reference,
    repository: deriveRepository(input.reference),
    primaryRegistry: DEFAULT_PRIMARY_REGISTRY,
    mirrorRegistry: null,
    ociCompliant: isOciCompliant(input.reference, input.artifactType),
    immutable: tag !== 'latest',
    tags: unique(
      [
        tag,
        input.release?.status === 'released' ? 'latest' : null,
      ].filter((value): value is string => Boolean(value)),
    ),
    digest: null,
    publishState,
    metadata,
    gate: {
      securityStatus: input.securityBundle?.gate.status ?? 'unknown',
      artifactGateStatus: deriveArtifactGateStatus(publishState),
      publishedOnlyAfterGate:
        publishState !== 'published' ||
        input.securityBundle?.gate.status === 'pass' ||
        input.securityBundle?.gate.status === 'accepted-risk',
      decisionRefs: unique(
        [input.securityBundle?.gate.decisionRef ?? null].filter(
          (value): value is string => Boolean(value),
        ),
      ),
    },
    evidence: {
      linkedToRelease: input.linkedToRelease,
      localPath: input.localPath,
      localExists,
    },
    retention: deriveRetentionPolicy(input.release, input.artifactType),
    zarf,
  }
}

async function createReleaseArtifactRecords(
  release: ReleaseNotice,
  securityBundle: Obj17SecurityBundle | null,
): Promise<Obj18RegistryRecord[]> {
  const records = await Promise.all(
    release.artifacts.map((artifact, index) =>
      createRecord({
        id: `${release.version}-${index}-${artifact.type}`,
        version: release.version,
        channel: release.channel,
        publishedAt: release.publishedAt,
        artifactType: normalizeReleaseArtifactType(artifact.type),
        artifactName: artifact.name,
        reference: artifact.reference,
        release,
        securityBundle,
        localPath:
          artifact.reference.startsWith('docs/') || artifact.reference.startsWith('artifacts/')
            ? artifact.reference
            : null,
        linkedToRelease: true,
      }),
    ),
  )

  return records
}

async function createSecurityRecords(
  securityBundle: Obj17SecurityBundle,
  release: ReleaseNotice | null,
): Promise<Obj18RegistryRecord[]> {
  const securityArtifacts: Array<{
    id: string
    artifactType: Obj18ArtifactType
    artifactName: string
    reference: string
    localPath: string | null
  }> = [
    {
      id: `${securityBundle.version}-security-bundle`,
      artifactType: 'security-bundle',
      artifactName: 'Security Bundle',
      reference: securityBundle.evidence.ociRegistryReference,
      localPath: null,
    },
    {
      id: `${securityBundle.version}-sbom`,
      artifactType: 'sbom',
      artifactName: 'SBOM',
      reference: securityBundle.sbom.path,
      localPath: securityBundle.sbom.path,
    },
    {
      id: `${securityBundle.version}-scan-report`,
      artifactType: 'scan-report',
      artifactName: 'Security Scan Pack',
      reference: securityBundle.scans.container.reportPath,
      localPath: securityBundle.scans.container.reportPath,
    },
  ]

  return Promise.all(
    securityArtifacts.map((artifact) =>
      createRecord({
        id: artifact.id,
        version: securityBundle.version,
        channel: securityBundle.channel,
        publishedAt: release?.publishedAt ?? null,
        artifactType: artifact.artifactType,
        artifactName: artifact.artifactName,
        reference: artifact.reference,
        release,
        securityBundle,
        localPath: artifact.localPath,
        linkedToRelease: Boolean(release),
      }),
    ),
  )
}

function sortRecords(left: Obj18RegistryRecord, right: Obj18RegistryRecord): number {
  if (left.version !== right.version) {
    return right.version.localeCompare(left.version, undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  }

  const leftIndex = artifactTypeOrder.indexOf(left.artifactType)
  const rightIndex = artifactTypeOrder.indexOf(right.artifactType)
  return leftIndex - rightIndex
}

function applyFilters(
  records: Obj18RegistryRecord[],
  filters?: Obj18RegistryFilters,
): Obj18RegistryRecord[] {
  const filtered = records.filter((record) => {
    if (filters?.version && record.version !== filters.version) {
      return false
    }

    if (filters?.channel && record.channel !== filters.channel) {
      return false
    }

    if (filters?.artifactType && record.artifactType !== filters.artifactType) {
      return false
    }

    if (filters?.publishState && record.publishState !== filters.publishState) {
      return false
    }

    if (typeof filters?.zarfIncluded === 'boolean' && record.zarf.included !== filters.zarfIncluded) {
      return false
    }

    return true
  })

  if (typeof filters?.limit === 'number' && Number.isFinite(filters.limit)) {
    return filtered.slice(0, Math.max(filters.limit, 0))
  }

  return filtered
}

function buildSummary(records: Obj18RegistryRecord[]): Obj18RegistrySummary {
  return {
    generatedAt: new Date().toISOString(),
    sourceOfTruth: [
      'docs/releases/UPDATE-NOTICES.json',
      'docs/releases/SECURITY-SCAN-BUNDLES.json',
      '.github/workflows/ci.yml',
    ],
    primaryRegistry: DEFAULT_PRIMARY_REGISTRY,
    mirrorRegistry: null,
    totalArtifacts: records.length,
    publishedArtifacts: records.filter((record) => record.publishState === 'published').length,
    blockedArtifacts: records.filter((record) => record.publishState === 'blocked').length,
    pendingArtifacts: records.filter((record) => record.publishState === 'pending').length,
    ociArtifacts: records.filter((record) => record.ociCompliant).length,
    zarfEligibleArtifacts: records.filter((record) => record.zarf.included).length,
    metadataCompleteArtifacts: records.filter(
      (record) => record.metadata.completeness === 'complete',
    ).length,
    publishedOnlyAfterGateArtifacts: records.filter(
      (record) => record.gate.publishedOnlyAfterGate,
    ).length,
    versions: unique(records.map((record) => record.version)),
  }
}

export async function loadObj18RegistryData(
  filters?: Obj18RegistryFilters,
): Promise<Obj18RegistryData> {
  const [releases, securityBundles] = await Promise.all([
    getReleaseNotices({ includeDrafts: true, limit: 50 }),
    getObj17SecurityBundles(),
  ])

  const securityByVersion = new Map(
    securityBundles.map((bundle) => [bundle.version, bundle] as const),
  )
  const releaseByVersion = new Map(
    releases.map((release) => [release.version, release] as const),
  )

  const releaseRecords = await Promise.all(
    releases.map((release) =>
      createReleaseArtifactRecords(
        release,
        securityByVersion.get(release.version) ?? null,
      ),
    ),
  )

  const securityOnlyRecords = await Promise.all(
    securityBundles.map((bundle) =>
      createSecurityRecords(bundle, releaseByVersion.get(bundle.version) ?? null),
    ),
  )

  const records = [...releaseRecords.flat(), ...securityOnlyRecords.flat()].sort(sortRecords)
  const filteredRecords = applyFilters(records, filters)

  return {
    summary: buildSummary(filteredRecords),
    records: filteredRecords,
  }
}

export function parseObj18RegistryChannel(value: string): Obj18RegistryChannel | null {
  if (value === 'ga' || value === 'beta' || value === 'rc') {
    return value
  }
  return null
}

export function parseObj18ArtifactType(value: string): Obj18ArtifactType | null {
  if (
    value === 'oci-image' ||
    value === 'security-bundle' ||
    value === 'sbom' ||
    value === 'scan-report' ||
    value === 'documentation-bundle' ||
    value === 'release-bundle' ||
    value === 'unknown'
  ) {
    return value
  }
  return null
}

export function parseObj18PublishState(value: string): Obj18PublishState | null {
  if (value === 'published' || value === 'blocked' || value === 'pending') {
    return value
  }
  return null
}

export function parseObj18Boolean(value: string): boolean | null {
  if (value === 'true' || value === '1') {
    return true
  }
  if (value === 'false' || value === '0') {
    return false
  }
  return null
}

export function getObj18ArtifactBadgeLabel(type: Obj18ArtifactType): string {
  switch (type) {
    case 'oci-image':
      return 'OCI image'
    case 'security-bundle':
      return 'Security bundle'
    case 'sbom':
      return 'SBOM'
    case 'scan-report':
      return 'Scan report'
    case 'documentation-bundle':
      return 'Documentation'
    case 'release-bundle':
      return 'Release bundle'
    default:
      return 'Unknown'
  }
}

export function getObj18GateTone(
  record: Pick<Obj18RegistryRecord, 'publishState' | 'gate'>,
): 'good' | 'warn' | 'risk' {
  if (
    record.publishState === 'published' &&
    record.gate.publishedOnlyAfterGate &&
    (record.gate.securityStatus === 'pass' ||
      record.gate.securityStatus === 'accepted-risk')
  ) {
    return 'good'
  }

  if (record.publishState === 'blocked') {
    return 'risk'
  }

  return 'warn'
}

export function getObj18ReleaseArtifactVerification(
  artifact: ReleaseArtifact,
): string {
  return artifact.verification
}
