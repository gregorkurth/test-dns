#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs'
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

const semverPattern =
  /^v(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:-(?<prerelease>[0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function parseVersion(version) {
  const match = version.match(semverPattern)
  ensure(match?.groups, `Ungueltige Version: ${version}`)
  return {
    major: Number(match.groups.major),
    minor: Number(match.groups.minor),
    patch: Number(match.groups.patch),
    prerelease: match.groups.prerelease ?? null,
  }
}

function comparePrereleaseToken(left, right) {
  const leftNumeric = /^\d+$/.test(left)
  const rightNumeric = /^\d+$/.test(right)
  if (leftNumeric && rightNumeric) {
    return Number(left) - Number(right)
  }
  if (leftNumeric) {
    return -1
  }
  if (rightNumeric) {
    return 1
  }
  return left.localeCompare(right)
}

function compareVersions(left, right) {
  const a = parseVersion(left)
  const b = parseVersion(right)

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
  ensure(semverPattern.test(bundle.version), `Bundle Version ungueltig: ${bundle.version}`)
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

  ensureScanResult(bundle.scans?.sast, 'SAST', bundle.version)
  ensureScanResult(bundle.scans?.sca, 'SCA', bundle.version)
  ensureScanResult(bundle.scans?.container, 'Container', bundle.version)
  ensureScanResult(bundle.scans?.config, 'Config', bundle.version)

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
