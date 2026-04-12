import { promises as fs } from 'node:fs'
import path from 'node:path'

import { compareReleaseVersions, type ReleaseChannel } from '@/lib/obj14-release-management'

export type Obj19PackageVariant = 'minimal' | 'full'

export interface Obj19PackageImage {
  name: string
  reference: string
  required: boolean
}

export interface Obj19DeploymentAsset {
  path: string
  type: string
  sizeBytes: number
  integrity: string
  required: boolean
}

export interface Obj19GitSource {
  role: string
  repository: string
  revision: string
}

export interface Obj19IntegrityEntry {
  path: string
  sha256: string
}

export interface Obj19PackageManifest {
  version: string
  variant: Obj19PackageVariant
  generatedAt: string
  images: Obj19PackageImage[]
  deploymentAssets: Obj19DeploymentAsset[]
  gitSources: Obj19GitSource[]
  integrity: Obj19IntegrityEntry[]
}

export interface Obj19ChecksumEntry {
  sha256: string
  path: string
}

export interface Obj19HandoverRecord {
  id: string
  version: string
  variant: Obj19PackageVariant
  createdAt: string
  createdByRole: string
  recipientRole: string
  targetEnvironment: string
  transferMedium: string
  checksumVerifiedBeforeTransfer: boolean
  checksumVerifiedAfterTransfer: boolean
  releaseEvidenceRef: string
  requiredArtifacts: string[]
}

interface Obj19PackageDescriptor {
  version: string
  variant: Obj19PackageVariant
  channel: ReleaseChannel
  createdAt: string
  ownerRole: string
  targetEnvironment: string
  packageFile: string
  packageSizeBytes: number
  checksumFile: string
  manifestFile: string
  handoverFile: string
  releaseAssigned: boolean
  pipelineArtifactStored: boolean
  importReady: boolean
  releaseProject: {
    repository: string
    revision: string
  }
  configurationProject: {
    repository: string
    revision: string
  }
  security: {
    bundleVersion: string
    offlineDbIncluded: boolean
    offlineDbPath: string | null
  }
  notes: string[]
}

export interface Obj19OfflinePackageRecord extends Obj19PackageDescriptor {
  manifest: Obj19PackageManifest
  checksums: Obj19ChecksumEntry[]
  handover: Obj19HandoverRecord
}

export interface Obj19OfflinePackageDocument {
  service: string
  sourceOfTruth: string
  updatedAt: string
  packages: Obj19OfflinePackageRecord[]
}

export interface Obj19OfflinePackageSummary {
  generatedAt: string
  sourceOfTruth: string
  totalPackages: number
  latestVersion: string | null
  variantsAvailable: Obj19PackageVariant[]
  releaseAssignedPackages: number
  importReadyPackages: number
  packagesWithOfflineDb: number
  targetEnvironments: string[]
}

const indexPath = path.join(process.cwd(), 'artifacts', 'offline-package', 'INDEX.json')
const releaseVersionPattern = /^\d{4}\.(0[1-9]|1[0-2])\.[1-9]\d*$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function ensureString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid OBJ-19 field: ${fieldName}`)
  }

  return value
}

function ensureBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid OBJ-19 field: ${fieldName}`)
  }

  return value
}

function ensureNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    throw new Error(`Invalid OBJ-19 field: ${fieldName}`)
  }

  return value
}

function ensureStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`Invalid OBJ-19 field: ${fieldName}`)
  }

  return value
}

function parseVariant(value: unknown, fieldName: string): Obj19PackageVariant {
  const normalized = ensureString(value, fieldName)
  if (normalized !== 'minimal' && normalized !== 'full') {
    throw new Error(`Invalid OBJ-19 variant in ${fieldName}: ${normalized}`)
  }
  return normalized
}

function parseChannel(value: unknown, fieldName: string): ReleaseChannel {
  const normalized = ensureString(value, fieldName)
  if (normalized !== 'ga' && normalized !== 'beta' && normalized !== 'rc') {
    throw new Error(`Invalid OBJ-19 channel in ${fieldName}: ${normalized}`)
  }
  return normalized
}

function ensureDigest(value: unknown, fieldName: string): string {
  const normalized = ensureString(value, fieldName)
  if (!/^sha256:[a-f0-9]{64}$/i.test(normalized)) {
    throw new Error(`Invalid OBJ-19 digest in ${fieldName}: ${normalized}`)
  }
  return normalized
}

function ensureVersion(value: unknown, fieldName: string): string {
  const version = ensureString(value, fieldName)
  if (!releaseVersionPattern.test(version)) {
    throw new Error(`Invalid OBJ-19 version in ${fieldName}: ${version}`)
  }
  return version
}

function resolveRepoPath(relativePath: string): string {
  return path.join(process.cwd(), relativePath)
}

async function readJsonFile<TValue>(relativePath: string): Promise<TValue> {
  const content = await fs.readFile(resolveRepoPath(relativePath), 'utf8')
  return JSON.parse(content) as TValue
}

function parseManifestImage(value: unknown, fieldPrefix: string): Obj19PackageImage {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-19 field: ${fieldPrefix}`)
  }

  return {
    name: ensureString(value.name, `${fieldPrefix}.name`),
    reference: ensureString(value.reference, `${fieldPrefix}.reference`),
    required: ensureBoolean(value.required, `${fieldPrefix}.required`),
  }
}

function parseDeploymentAsset(
  value: unknown,
  fieldPrefix: string,
): Obj19DeploymentAsset {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-19 field: ${fieldPrefix}`)
  }

  return {
    path: ensureString(value.path, `${fieldPrefix}.path`),
    type: ensureString(value.type, `${fieldPrefix}.type`),
    sizeBytes: ensureNumber(value.sizeBytes, `${fieldPrefix}.sizeBytes`),
    integrity: ensureDigest(value.integrity, `${fieldPrefix}.integrity`),
    required: ensureBoolean(value.required, `${fieldPrefix}.required`),
  }
}

function parseGitSource(value: unknown, fieldPrefix: string): Obj19GitSource {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-19 field: ${fieldPrefix}`)
  }

  return {
    role: ensureString(value.role, `${fieldPrefix}.role`),
    repository: ensureString(value.repository, `${fieldPrefix}.repository`),
    revision: ensureString(value.revision, `${fieldPrefix}.revision`),
  }
}

function parseIntegrityEntry(value: unknown, fieldPrefix: string): Obj19IntegrityEntry {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-19 field: ${fieldPrefix}`)
  }

  return {
    path: ensureString(value.path, `${fieldPrefix}.path`),
    sha256: ensureString(value.sha256, `${fieldPrefix}.sha256`),
  }
}

function parseManifest(value: unknown, fieldName: string): Obj19PackageManifest {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-19 field: ${fieldName}`)
  }

  const images = Array.isArray(value.images)
    ? value.images.map((entry, index) =>
        parseManifestImage(entry, `${fieldName}.images[${index}]`),
      )
    : (() => {
        throw new Error(`Invalid OBJ-19 field: ${fieldName}.images`)
      })()

  const deploymentAssets = Array.isArray(value.deploymentAssets)
    ? value.deploymentAssets.map((entry, index) =>
        parseDeploymentAsset(entry, `${fieldName}.deploymentAssets[${index}]`),
      )
    : (() => {
        throw new Error(`Invalid OBJ-19 field: ${fieldName}.deploymentAssets`)
      })()

  const gitSources = Array.isArray(value.gitSources)
    ? value.gitSources.map((entry, index) =>
        parseGitSource(entry, `${fieldName}.gitSources[${index}]`),
      )
    : (() => {
        throw new Error(`Invalid OBJ-19 field: ${fieldName}.gitSources`)
      })()

  const integrity = Array.isArray(value.integrity)
    ? value.integrity.map((entry, index) =>
        parseIntegrityEntry(entry, `${fieldName}.integrity[${index}]`),
      )
    : (() => {
        throw new Error(`Invalid OBJ-19 field: ${fieldName}.integrity`)
      })()

  return {
    version: ensureVersion(value.version, `${fieldName}.version`),
    variant: parseVariant(value.variant, `${fieldName}.variant`),
    generatedAt: ensureString(value.generatedAt, `${fieldName}.generatedAt`),
    images,
    deploymentAssets,
    gitSources,
    integrity,
  }
}

function parseHandover(value: unknown, fieldName: string): Obj19HandoverRecord {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-19 field: ${fieldName}`)
  }

  return {
    id: ensureString(value.id, `${fieldName}.id`),
    version: ensureVersion(value.version, `${fieldName}.version`),
    variant: parseVariant(value.variant, `${fieldName}.variant`),
    createdAt: ensureString(value.createdAt, `${fieldName}.createdAt`),
    createdByRole: ensureString(value.createdByRole, `${fieldName}.createdByRole`),
    recipientRole: ensureString(value.recipientRole, `${fieldName}.recipientRole`),
    targetEnvironment: ensureString(value.targetEnvironment, `${fieldName}.targetEnvironment`),
    transferMedium: ensureString(value.transferMedium, `${fieldName}.transferMedium`),
    checksumVerifiedBeforeTransfer: ensureBoolean(
      value.checksumVerifiedBeforeTransfer,
      `${fieldName}.checksumVerifiedBeforeTransfer`,
    ),
    checksumVerifiedAfterTransfer: ensureBoolean(
      value.checksumVerifiedAfterTransfer,
      `${fieldName}.checksumVerifiedAfterTransfer`,
    ),
    releaseEvidenceRef: ensureString(value.releaseEvidenceRef, `${fieldName}.releaseEvidenceRef`),
    requiredArtifacts: ensureStringArray(value.requiredArtifacts, `${fieldName}.requiredArtifacts`),
  }
}

function parseDescriptor(value: unknown, index: number): Obj19PackageDescriptor {
  if (!isRecord(value)) {
    throw new Error(`Invalid OBJ-19 package at index ${index}`)
  }

  if (!isRecord(value.releaseProject) || !isRecord(value.configurationProject)) {
    throw new Error(`Invalid OBJ-19 package source mapping at index ${index}`)
  }

  if (!isRecord(value.security)) {
    throw new Error(`Invalid OBJ-19 package security field at index ${index}`)
  }

  return {
    version: ensureVersion(value.version, `packages[${index}].version`),
    variant: parseVariant(value.variant, `packages[${index}].variant`),
    channel: parseChannel(value.channel, `packages[${index}].channel`),
    createdAt: ensureString(value.createdAt, `packages[${index}].createdAt`),
    ownerRole: ensureString(value.ownerRole, `packages[${index}].ownerRole`),
    targetEnvironment: ensureString(
      value.targetEnvironment,
      `packages[${index}].targetEnvironment`,
    ),
    packageFile: ensureString(value.packageFile, `packages[${index}].packageFile`),
    packageSizeBytes: ensureNumber(value.packageSizeBytes, `packages[${index}].packageSizeBytes`),
    checksumFile: ensureString(value.checksumFile, `packages[${index}].checksumFile`),
    manifestFile: ensureString(value.manifestFile, `packages[${index}].manifestFile`),
    handoverFile: ensureString(value.handoverFile, `packages[${index}].handoverFile`),
    releaseAssigned: ensureBoolean(value.releaseAssigned, `packages[${index}].releaseAssigned`),
    pipelineArtifactStored: ensureBoolean(
      value.pipelineArtifactStored,
      `packages[${index}].pipelineArtifactStored`,
    ),
    importReady: ensureBoolean(value.importReady, `packages[${index}].importReady`),
    releaseProject: {
      repository: ensureString(
        value.releaseProject.repository,
        `packages[${index}].releaseProject.repository`,
      ),
      revision: ensureString(
        value.releaseProject.revision,
        `packages[${index}].releaseProject.revision`,
      ),
    },
    configurationProject: {
      repository: ensureString(
        value.configurationProject.repository,
        `packages[${index}].configurationProject.repository`,
      ),
      revision: ensureString(
        value.configurationProject.revision,
        `packages[${index}].configurationProject.revision`,
      ),
    },
    security: {
      bundleVersion: ensureVersion(
        value.security.bundleVersion,
        `packages[${index}].security.bundleVersion`,
      ),
      offlineDbIncluded: ensureBoolean(
        value.security.offlineDbIncluded,
        `packages[${index}].security.offlineDbIncluded`,
      ),
      offlineDbPath:
        value.security.offlineDbPath === null
          ? null
          : ensureString(
              value.security.offlineDbPath,
              `packages[${index}].security.offlineDbPath`,
            ),
    },
    notes: ensureStringArray(value.notes, `packages[${index}].notes`),
  }
}

function parseChecksumFile(content: string, fieldName: string): Obj19ChecksumEntry[] {
  const entries: Obj19ChecksumEntry[] = []

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const match = trimmed.match(/^([a-f0-9]{64})\s+\*?(.+)$/i)
    if (!match) {
      throw new Error(`Invalid OBJ-19 checksum line in ${fieldName}: ${line}`)
    }

    entries.push({
      sha256: match[1].toLowerCase(),
      path: match[2].trim(),
    })
  }

  return entries
}

function compareVariant(left: Obj19PackageVariant, right: Obj19PackageVariant): number {
  const order: Record<Obj19PackageVariant, number> = {
    full: 0,
    minimal: 1,
  }

  return order[left] - order[right]
}

function comparePackageDesc(
  left: Obj19OfflinePackageRecord,
  right: Obj19OfflinePackageRecord,
): number {
  const versionCompare = compareReleaseVersions(right.version, left.version)
  if (versionCompare !== 0) {
    return versionCompare
  }

  const createdAtCompare = Date.parse(right.createdAt) - Date.parse(left.createdAt)
  if (createdAtCompare !== 0) {
    return createdAtCompare
  }

  return compareVariant(left.variant, right.variant)
}

async function loadDescriptorRecord(
  descriptor: Obj19PackageDescriptor,
): Promise<Obj19OfflinePackageRecord> {
  const [manifestValue, handoverValue, checksumContent] = await Promise.all([
    readJsonFile<unknown>(descriptor.manifestFile),
    readJsonFile<unknown>(descriptor.handoverFile),
    fs.readFile(resolveRepoPath(descriptor.checksumFile), 'utf8'),
  ])

  const manifest = parseManifest(manifestValue, descriptor.manifestFile)
  const handover = parseHandover(handoverValue, descriptor.handoverFile)
  const checksums = parseChecksumFile(checksumContent, descriptor.checksumFile)

  return {
    ...descriptor,
    manifest,
    handover,
    checksums,
  }
}

export async function loadObj19OfflinePackageDocument(): Promise<Obj19OfflinePackageDocument> {
  const raw = await fs.readFile(indexPath, 'utf8')
  const parsed = JSON.parse(raw) as unknown

  if (!isRecord(parsed)) {
    throw new Error('Invalid OBJ-19 document root')
  }

  const packageDescriptors = Array.isArray(parsed.packages)
    ? parsed.packages.map((entry, index) => parseDescriptor(entry, index))
    : (() => {
        throw new Error('Invalid OBJ-19 field: packages')
      })()

  const packages = await Promise.all(
    packageDescriptors.map((descriptor) => loadDescriptorRecord(descriptor)),
  )

  packages.sort(comparePackageDesc)

  return {
    service: ensureString(parsed.service, 'service'),
    sourceOfTruth: ensureString(parsed.sourceOfTruth, 'sourceOfTruth'),
    updatedAt: ensureString(parsed.updatedAt, 'updatedAt'),
    packages,
  }
}

export async function getObj19OfflinePackages(filters?: {
  version?: string | null
  variant?: Obj19PackageVariant | null
  limit?: number
}): Promise<Obj19OfflinePackageRecord[]> {
  const document = await loadObj19OfflinePackageDocument()

  return document.packages
    .filter((entry) => {
      if (filters?.version && entry.version !== filters.version) {
        return false
      }

      if (filters?.variant && entry.variant !== filters.variant) {
        return false
      }

      return true
    })
    .slice(0, filters?.limit ?? document.packages.length)
}

export async function getLatestObj19OfflinePackage(): Promise<Obj19OfflinePackageRecord | null> {
  const packages = await getObj19OfflinePackages({ limit: 1 })
  return packages[0] ?? null
}

export async function getObj19OfflinePackageSummary(): Promise<Obj19OfflinePackageSummary> {
  const document = await loadObj19OfflinePackageDocument()
  const variantsAvailable = Array.from(new Set(document.packages.map((entry) => entry.variant)))
  const targetEnvironments = Array.from(
    new Set(document.packages.map((entry) => entry.targetEnvironment)),
  )

  return {
    generatedAt: document.updatedAt,
    sourceOfTruth: document.sourceOfTruth,
    totalPackages: document.packages.length,
    latestVersion: document.packages[0]?.version ?? null,
    variantsAvailable,
    releaseAssignedPackages: document.packages.filter((entry) => entry.releaseAssigned).length,
    importReadyPackages: document.packages.filter((entry) => entry.importReady).length,
    packagesWithOfflineDb: document.packages.filter(
      (entry) => entry.security.offlineDbIncluded,
    ).length,
    targetEnvironments,
  }
}
