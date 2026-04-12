#!/usr/bin/env node

import { readFileSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const securityBundlesPath = path.join(
  repoRoot,
  'docs',
  'releases',
  'SECURITY-SCAN-BUNDLES.json',
)
const releaseNoticesPath = path.join(repoRoot, 'docs', 'releases', 'UPDATE-NOTICES.json')
const workflowPath = path.join(repoRoot, '.github', 'workflows', 'ci.yml')
const maxOfflineDbAgeDays = Number.parseInt(
  process.env.OBJ17_MAX_OFFLINE_DB_AGE_DAYS ?? '14',
  10,
)

const releasePattern = /^(?<year>\d{4})\.(?<month>0[1-9]|1[0-2])\.(?<sequence>[1-9]\d*)$/

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function resolveRepoPath(relativePath) {
  return path.resolve(repoRoot, relativePath)
}

function parseIsoDate(value, fieldName, version) {
  const parsed = Date.parse(value)
  ensure(
    Number.isFinite(parsed),
    `${fieldName} ist kein gueltiger ISO-Zeitstempel fuer ${version}`,
  )
  return parsed
}

function ageInDaysFromNow(timestampMs) {
  const diffMs = Date.now() - timestampMs
  if (diffMs < 0) {
    return 0
  }
  return Math.floor(diffMs / (24 * 60 * 60 * 1000))
}

function ensureArtifactExists(relativePath, label, version) {
  ensure(
    typeof relativePath === 'string' && relativePath.trim().length > 0,
    `${label} Pfad fehlt fuer ${version}`,
  )
  const absolutePath = resolveRepoPath(relativePath)
  ensure(existsSync(absolutePath), `${label} fehlt fuer ${version}: ${relativePath}`)
}

function parseVersion(version) {
  const match = version.match(releasePattern)
  ensure(match?.groups, `Ungueltige Version (erwartet YYYY.MM.N): ${version}`)
  return {
    year: Number(match.groups.year),
    month: Number(match.groups.month),
    sequence: Number(match.groups.sequence),
  }
}

function compareVersions(left, right) {
  const a = parseVersion(left)
  const b = parseVersion(right)

  if (a.year !== b.year) {
    return a.year - b.year
  }
  if (a.month !== b.month) {
    return a.month - b.month
  }
  if (a.sequence !== b.sequence) {
    return a.sequence - b.sequence
  }

  return 0
}

function ensureScanResult(scan, name, version) {
  ensure(scan && typeof scan === 'object', `${name} Scan fehlt fuer ${version}`)
  ensure(
    ['passed', 'failed', 'unknown'].includes(scan.status),
    `${name} Scanstatus ungueltig fuer ${version}`,
  )
  ensure(
    typeof scan.tool === 'string' && scan.tool.trim().length > 0,
    `${name} Tool fehlt fuer ${version}`,
  )
  ensure(
    typeof scan.reportPath === 'string' && scan.reportPath.trim().length > 0,
    `${name} reportPath fehlt fuer ${version}`,
  )
}

function validateBundle(bundle) {
  ensure(typeof bundle.version === 'string', 'Bundle Version fehlt')
  ensure(
    releasePattern.test(bundle.version),
    `Bundle Version ungueltig (erwartet YYYY.MM.N): ${bundle.version}`,
  )
  ensure(['ga', 'beta', 'rc'].includes(bundle.channel), `Bundle Kanal ungueltig: ${bundle.version}`)

  ensure(bundle.sbom?.available === true, `SBOM fehlt fuer ${bundle.version}`)
  ensure(
    ['spdx-json', 'cyclonedx-json'].includes(bundle.sbom?.format),
    `SBOM Format ungueltig fuer ${bundle.version}`,
  )
  ensure(
    typeof bundle.sbom?.path === 'string' && bundle.sbom.path.trim().length > 0,
    `SBOM Pfad fehlt fuer ${bundle.version}`,
  )
  ensureArtifactExists(bundle.sbom.path, 'SBOM Artefakt', bundle.version)

  const sbomAbsPath = resolveRepoPath(bundle.sbom.path)
  const sbomDoc = readJson(sbomAbsPath)
  ensure(
    Array.isArray(sbomDoc.packages) && sbomDoc.packages.length > 0,
    `SBOM fuer ${bundle.version} enthaelt kein 'packages'-Array mit Eintraegen. Bitte mit syft oder vergleichbarem Tool neu erzeugen.`,
  )

  ensureScanResult(bundle.scans?.sast, 'SAST', bundle.version)
  ensureScanResult(bundle.scans?.sca, 'SCA', bundle.version)
  ensureScanResult(bundle.scans?.container, 'Container', bundle.version)
  ensureScanResult(bundle.scans?.config, 'Config', bundle.version)
  ensureArtifactExists(bundle.scans.sast.reportPath, 'SAST Report', bundle.version)
  ensureArtifactExists(bundle.scans.sca.reportPath, 'SCA Report', bundle.version)
  ensureArtifactExists(
    bundle.scans.container.reportPath,
    'Container Report',
    bundle.version,
  )
  ensureArtifactExists(bundle.scans.config.reportPath, 'Config Report', bundle.version)

  ensure(
    Number.isInteger(bundle.findings?.criticalOpen) && bundle.findings.criticalOpen >= 0,
    `criticalOpen ungueltig fuer ${bundle.version}`,
  )
  ensure(
    Number.isInteger(bundle.findings?.highOpen) && bundle.findings.highOpen >= 0,
    `highOpen ungueltig fuer ${bundle.version}`,
  )
  ensure(
    Number.isInteger(bundle.findings?.highAcceptedRisk) &&
      bundle.findings.highAcceptedRisk >= 0,
    `highAcceptedRisk ungueltig fuer ${bundle.version}`,
  )

  ensure(
    ['pass', 'fail', 'accepted-risk', 'unknown'].includes(bundle.gate?.status),
    `Gate Status ungueltig fuer ${bundle.version}`,
  )
  ensure(
    typeof bundle.gate?.owner === 'string' && bundle.gate.owner.trim().length > 0,
    `Gate Owner fehlt fuer ${bundle.version}`,
  )
  ensure(
    typeof bundle.gate?.dbSnapshotVersion === 'string' &&
      bundle.gate.dbSnapshotVersion.trim().length > 0,
    `DB Snapshot Version fehlt fuer ${bundle.version}`,
  )
  ensure(
    typeof bundle.gate?.dbSnapshotUpdatedAt === 'string' &&
      bundle.gate.dbSnapshotUpdatedAt.trim().length > 0,
    `DB Snapshot Zeitpunkt fehlt fuer ${bundle.version}`,
  )
  const dbSnapshotTimestamp = parseIsoDate(
    bundle.gate.dbSnapshotUpdatedAt,
    'dbSnapshotUpdatedAt',
    bundle.version,
  )
  ensure(
    Number.isInteger(maxOfflineDbAgeDays) && maxOfflineDbAgeDays > 0,
    'OBJ17_MAX_OFFLINE_DB_AGE_DAYS muss > 0 sein',
  )
  const dbSnapshotAgeDays = ageInDaysFromNow(dbSnapshotTimestamp)
  ensure(
    dbSnapshotAgeDays <= maxOfflineDbAgeDays,
    `Offline DB Snapshot ist zu alt fuer ${bundle.version}: ${dbSnapshotAgeDays} Tage (Limit ${maxOfflineDbAgeDays})`,
  )

  if (bundle.findings.criticalOpen > 0) {
    ensure(bundle.gate.status === 'fail', `Critical Findings muessen Gate failen: ${bundle.version}`)
  }

  if (bundle.findings.highOpen > 0) {
    ensure(
      bundle.gate.status === 'accepted-risk' || bundle.gate.status === 'fail',
      `High Findings brauchen accepted-risk oder fail: ${bundle.version}`,
    )
    if (bundle.gate.status === 'accepted-risk') {
      ensure(
        typeof bundle.gate.acceptedRiskExpiresAt === 'string' &&
          bundle.gate.acceptedRiskExpiresAt.trim().length > 0,
        `acceptedRiskExpiresAt fehlt fuer ${bundle.version}`,
      )
      const acceptedRiskExpiry = Date.parse(bundle.gate.acceptedRiskExpiresAt)
      ensure(
        Number.isFinite(acceptedRiskExpiry),
        `acceptedRiskExpiresAt ist ungueltig fuer ${bundle.version}`,
      )
      ensure(
        acceptedRiskExpiry >= Date.now(),
        `acceptedRisk fuer ${bundle.version} ist abgelaufen`,
      )
    }
  }

  ensure(
    bundle.evidence?.releaseAttachment === true,
    `Release Attachment fehlt fuer ${bundle.version}`,
  )
  ensure(
    typeof bundle.evidence?.ociRegistryReference === 'string' &&
      bundle.evidence.ociRegistryReference.includes(bundle.version),
    `OCI Security Bundle Reference fehlt fuer ${bundle.version}`,
  )
  ensure(
    bundle.evidence?.offlineSnapshotAvailable === true,
    `Offline Snapshot fehlt fuer ${bundle.version}`,
  )
  ensure(
    typeof bundle.evidence?.offlineSnapshotPath === 'string' &&
      bundle.evidence.offlineSnapshotPath.trim().length > 0,
    `Offline Snapshot Pfad fehlt fuer ${bundle.version}`,
  )
  const snapshotAbsPath = resolveRepoPath(bundle.evidence.offlineSnapshotPath)
  ensureArtifactExists(
    bundle.evidence.offlineSnapshotPath,
    'Offline Snapshot Artefakt',
    bundle.version,
  )

  const snapshotSizeBytes = statSync(snapshotAbsPath).size
  const minSnapshotSizeBytes = 1024 * 1024 // 1 MB
  if (snapshotSizeBytes < minSnapshotSizeBytes) {
    console.warn(
      `[WARN] Offline DB Snapshot fuer ${bundle.version} ist nur ${snapshotSizeBytes} Bytes gross.` +
      ` Erwartet: >= ${minSnapshotSizeBytes} Bytes. Platzhalter erkannt – bitte durch echten Trivy-DB-Snapshot aus dem CI-Release-Gate-Lauf ersetzen.`,
    )
  }
}

function main() {
  ensure(existsSync(securityBundlesPath), 'docs/releases/SECURITY-SCAN-BUNDLES.json fehlt')
  ensure(existsSync(releaseNoticesPath), 'docs/releases/UPDATE-NOTICES.json fehlt')
  ensure(existsSync(workflowPath), '.github/workflows/ci.yml fehlt')

  const securityDocument = readJson(securityBundlesPath)
  const releaseDocument = readJson(releaseNoticesPath)
  const workflow = readFileSync(workflowPath, 'utf8')

  ensure(securityDocument.sourceOfTruth === 'git', 'OBJ-17 sourceOfTruth muss git sein')
  ensure(Array.isArray(securityDocument.bundles), 'OBJ-17 bundles[] fehlt')
  ensure(securityDocument.bundles.length > 0, 'Mindestens ein Security-Bundle ist erforderlich')

  const bundleVersions = securityDocument.bundles.map((bundle) => bundle.version)
  ensure(
    new Set(bundleVersions).size === bundleVersions.length,
    'Security-Bundle-Versionen muessen eindeutig sein',
  )
  const sortedBundleVersions = [...bundleVersions].sort((left, right) => compareVersions(right, left))
  ensure(
    JSON.stringify(bundleVersions) === JSON.stringify(sortedBundleVersions),
    'Security-Bundles muessen nach Version absteigend sortiert sein',
  )

  for (const bundle of securityDocument.bundles) {
    validateBundle(bundle)
  }

  const releaseVersions = new Set(
    (Array.isArray(releaseDocument.releases) ? releaseDocument.releases : [])
      .filter((entry) =>
        entry &&
        typeof entry === 'object' &&
        ['release-candidate', 'released', 'planned'].includes(entry.status),
      )
      .map((entry) => entry.version),
  )

  for (const version of releaseVersions) {
    ensure(
      bundleVersions.includes(version),
      `Release ${version} hat keinen OBJ-17 Security-Bundle-Nachweis`,
    )
  }

  ensure(
    workflow.includes('npm run check:obj17'),
    'CI Workflow fuehrt check:obj17 noch nicht aus',
  )
  ensure(
    workflow.includes('SAST Scan (Semgrep)'),
    'CI Workflow fuehrt keinen SAST Scan (Semgrep) aus',
  )
  ensure(
    workflow.includes('SCA Scan (npm audit)'),
    'CI Workflow fuehrt keinen SCA Scan (npm audit) aus',
  )
  ensure(
    workflow.includes('Config Scan (Trivy)'),
    'CI Workflow fuehrt keinen Config Scan (Trivy) aus',
  )
  ensure(
    workflow.includes('Container Scan by Digest (Trivy)'),
    'CI Workflow fuehrt keinen digest-basierten Container-Scan aus',
  )

  console.log('OBJ-17 verification passed')
  console.log(`- bundles documented: ${securityDocument.bundles.length}`)
  console.log(`- release versions covered: ${releaseVersions.size}`)
  console.log('- policy checks: sbom/scans/gate/offline validated')
}

try {
  main()
} catch (error) {
  console.error('OBJ-17 verification failed')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
