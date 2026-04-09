import { promises as fs } from 'node:fs'
import path from 'node:path'

export type ReleaseChannel = 'ga' | 'beta' | 'rc'
export type ReleaseStatus = 'planned' | 'draft' | 'release-candidate' | 'released'
export type ReleaseSeverity = 'low' | 'medium' | 'high'

export interface ReleaseArtifact {
  name: string
  type: string
  reference: string
  verification: string
}

export interface ReleaseDocumentationState {
  exportRequired: boolean
  exportStatus: 'pending' | 'completed'
  exportLogId: string | null
  confluenceTarget: string
  copyMechanism: string
}

export interface ReleaseUiState {
  showBanner: boolean
  callToActionLabel: string
  betaFeatures: string[]
}

export interface ReleaseNotice {
  version: string
  channel: ReleaseChannel
  status: ReleaseStatus
  publishedAt: string | null
  severity: ReleaseSeverity
  title: string
  summary: string
  changes: string[]
  breakingChanges: string[]
  artifactChecklist: string[]
  artifacts: ReleaseArtifact[]
  documentation: ReleaseDocumentationState
  ui: ReleaseUiState
}

export interface ReleaseNoticesDocument {
  service: string
  sourceOfTruth: string
  updatedAt: string
  releases: ReleaseNotice[]
}

const UPDATE_NOTICES_PATH = path.join(
  process.cwd(),
  'docs',
  'releases',
  'UPDATE-NOTICES.json',
)

const SEMVER_PATTERN =
  /^v(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function ensureString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Ungueltiges Release-Feld: ${fieldName}`)
  }

  return value
}

function ensureStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`Ungueltiges Release-Feld: ${fieldName}`)
  }

  return value
}

function ensureBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Ungueltiges Release-Feld: ${fieldName}`)
  }

  return value
}

function ensureVersion(version: string): string {
  if (!SEMVER_PATTERN.test(version)) {
    throw new Error(`Version entspricht nicht SemVer mit v-Praefix: ${version}`)
  }

  return version
}

function parseReleaseArtifact(
  value: unknown,
  index: number,
): ReleaseArtifact {
  if (!isRecord(value)) {
    throw new Error(`Ungueltiges Artefakt an Position ${index}`)
  }

  return {
    name: ensureString(value.name, `releases[${index}].artifacts.name`),
    type: ensureString(value.type, `releases[${index}].artifacts.type`),
    reference: ensureString(
      value.reference,
      `releases[${index}].artifacts.reference`,
    ),
    verification: ensureString(
      value.verification,
      `releases[${index}].artifacts.verification`,
    ),
  }
}

function parseReleaseDocumentationState(
  value: unknown,
): ReleaseDocumentationState {
  if (!isRecord(value)) {
    throw new Error('Ungueltiges Release-Feld: documentation')
  }

  const exportStatus = ensureString(value.exportStatus, 'documentation.exportStatus')
  if (exportStatus !== 'pending' && exportStatus !== 'completed') {
    throw new Error(`Ungueltiger Exportstatus: ${exportStatus}`)
  }

  const exportLogId =
    value.exportLogId === null
      ? null
      : ensureString(value.exportLogId, 'documentation.exportLogId')

  return {
    exportRequired: ensureBoolean(
      value.exportRequired,
      'documentation.exportRequired',
    ),
    exportStatus,
    exportLogId,
    confluenceTarget: ensureString(
      value.confluenceTarget,
      'documentation.confluenceTarget',
    ),
    copyMechanism: ensureString(
      value.copyMechanism,
      'documentation.copyMechanism',
    ),
  }
}

function parseReleaseUiState(value: unknown): ReleaseUiState {
  if (!isRecord(value)) {
    throw new Error('Ungueltiges Release-Feld: ui')
  }

  return {
    showBanner: ensureBoolean(value.showBanner, 'ui.showBanner'),
    callToActionLabel: ensureString(value.callToActionLabel, 'ui.callToActionLabel'),
    betaFeatures: ensureStringArray(value.betaFeatures, 'ui.betaFeatures'),
  }
}

function parseReleaseNotice(value: unknown, index: number): ReleaseNotice {
  if (!isRecord(value)) {
    throw new Error(`Ungueltiger Release-Eintrag an Position ${index}`)
  }

  const version = ensureVersion(
    ensureString(value.version, `releases[${index}].version`),
  )
  const channel = ensureString(value.channel, `releases[${index}].channel`)
  if (channel !== 'ga' && channel !== 'beta' && channel !== 'rc') {
    throw new Error(`Ungueltiger Release-Kanal: ${channel}`)
  }

  const status = ensureString(value.status, `releases[${index}].status`)
  if (
    status !== 'planned' &&
    status !== 'draft' &&
    status !== 'release-candidate' &&
    status !== 'released'
  ) {
    throw new Error(`Ungueltiger Release-Status: ${status}`)
  }

  const severity = ensureString(value.severity, `releases[${index}].severity`)
  if (severity !== 'low' && severity !== 'medium' && severity !== 'high') {
    throw new Error(`Ungueltiger Release-Schweregrad: ${severity}`)
  }

  const publishedAt =
    value.publishedAt === null
      ? null
      : ensureString(value.publishedAt, `releases[${index}].publishedAt`)

  return {
    version,
    channel,
    status,
    publishedAt,
    severity,
    title: ensureString(value.title, `releases[${index}].title`),
    summary: ensureString(value.summary, `releases[${index}].summary`),
    changes: ensureStringArray(value.changes, `releases[${index}].changes`),
    breakingChanges: ensureStringArray(
      value.breakingChanges,
      `releases[${index}].breakingChanges`,
    ),
    artifactChecklist: ensureStringArray(
      value.artifactChecklist,
      `releases[${index}].artifactChecklist`,
    ),
    artifacts: Array.isArray(value.artifacts)
      ? value.artifacts.map((artifact, artifactIndex) =>
          parseReleaseArtifact(artifact, artifactIndex),
        )
      : (() => {
          throw new Error(`Ungueltiges Release-Feld: releases[${index}].artifacts`)
        })(),
    documentation: parseReleaseDocumentationState(value.documentation),
    ui: parseReleaseUiState(value.ui),
  }
}

function parseVersionParts(version: string) {
  const match = version.match(SEMVER_PATTERN)
  if (!match) {
    throw new Error(`Version kann nicht verglichen werden: ${version}`)
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? null,
  }
}

function comparePrereleaseToken(left: string, right: string): number {
  const leftIsNumber = /^\d+$/.test(left)
  const rightIsNumber = /^\d+$/.test(right)

  if (leftIsNumber && rightIsNumber) {
    return Number(left) - Number(right)
  }

  if (leftIsNumber) {
    return -1
  }

  if (rightIsNumber) {
    return 1
  }

  return left.localeCompare(right)
}

export function compareReleaseVersions(left: string, right: string): number {
  const a = parseVersionParts(left)
  const b = parseVersionParts(right)

  if (a.major !== b.major) {
    return a.major - b.major
  }
  if (a.minor !== b.minor) {
    return a.minor - b.minor
  }
  if (a.patch !== b.patch) {
    return a.patch - b.patch
  }

  if (!a.prerelease && !b.prerelease) {
    return 0
  }
  if (!a.prerelease) {
    return 1
  }
  if (!b.prerelease) {
    return -1
  }

  const leftTokens = a.prerelease.split('.')
  const rightTokens = b.prerelease.split('.')
  const maxLength = Math.max(leftTokens.length, rightTokens.length)

  for (let index = 0; index < maxLength; index += 1) {
    const leftToken = leftTokens[index]
    const rightToken = rightTokens[index]
    if (!leftToken) {
      return -1
    }
    if (!rightToken) {
      return 1
    }

    const diff = comparePrereleaseToken(leftToken, rightToken)
    if (diff !== 0) {
      return diff
    }
  }

  return 0
}

export async function loadReleaseNoticesDocument(): Promise<ReleaseNoticesDocument> {
  const raw = await fs.readFile(UPDATE_NOTICES_PATH, 'utf8')
  const parsed = JSON.parse(raw) as unknown

  if (!isRecord(parsed)) {
    throw new Error('UPDATE-NOTICES.json hat kein gueltiges Wurzelobjekt.')
  }

  const releasesRaw = parsed.releases
  if (!Array.isArray(releasesRaw)) {
    throw new Error('UPDATE-NOTICES.json enthaelt keine Release-Liste.')
  }

  const releases = releasesRaw.map((entry, index) => parseReleaseNotice(entry, index))

  return {
    service: ensureString(parsed.service, 'service'),
    sourceOfTruth: ensureString(parsed.sourceOfTruth, 'sourceOfTruth'),
    updatedAt: ensureString(parsed.updatedAt, 'updatedAt'),
    releases,
  }
}

export async function getReleaseNotices(options?: {
  channel?: string | null
  version?: string | null
  includeDrafts?: boolean
  limit?: number
}): Promise<ReleaseNotice[]> {
  const document = await loadReleaseNoticesDocument()
  const includeDrafts = options?.includeDrafts ?? false

  const filtered = document.releases.filter((notice) => {
    if (!includeDrafts && notice.status === 'draft') {
      return false
    }
    if (options?.channel && notice.channel !== options.channel) {
      return false
    }
    if (options?.version && notice.version !== options.version) {
      return false
    }
    return true
  })

  const sorted = filtered.sort((left, right) =>
    compareReleaseVersions(right.version, left.version),
  )

  if (typeof options?.limit === 'number' && Number.isFinite(options.limit)) {
    return sorted.slice(0, Math.max(0, options.limit))
  }

  return sorted
}

export async function getLatestReleaseNotice(): Promise<ReleaseNotice | null> {
  const notices = await getReleaseNotices({ includeDrafts: true, limit: 1 })
  return notices[0] ?? null
}

export async function getReleaseSummary() {
  const notices = await getReleaseNotices({ includeDrafts: true })
  return {
    total: notices.length,
    released: notices.filter((notice) => notice.status === 'released').length,
    beta: notices.filter((notice) => notice.channel === 'beta').length,
    pendingExports: notices.filter(
      (notice) =>
        notice.documentation.exportRequired &&
        notice.documentation.exportStatus !== 'completed',
    ).length,
  }
}
