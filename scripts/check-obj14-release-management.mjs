#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const updateNoticesPath = path.join(
  repoRoot,
  'docs',
  'releases',
  'UPDATE-NOTICES.json',
)
const exportLogPath = path.join(repoRoot, 'docs', 'exports', 'EXPORT-LOG.md')
const workflowPath = path.join(repoRoot, '.github', 'workflows', 'ci.yml')
const releaseReadmePath = path.join(repoRoot, 'docs', 'releases', 'README.md')
const changelogPath = path.join(repoRoot, 'CHANGELOG.md')

const releasePattern = /^(?<year>\d{4})\.(?<month>0[1-9]|1[0-2])\.(?<sequence>[1-9]\d*)$/

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function parseVersion(version) {
  const match = version.match(releasePattern)
  ensure(match?.groups, `Version entspricht nicht YYYY.MM.N: ${version}`)

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

function validateReleaseEntry(entry, exportLogContent) {
  ensure(typeof entry.version === 'string', 'Release-Version fehlt')
  ensure(
    releasePattern.test(entry.version),
    `Ungueltige Version (erwartet YYYY.MM.N): ${entry.version}`,
  )
  ensure(typeof entry.channel === 'string', `Release-Kanal fehlt fuer ${entry.version}`)
  ensure(typeof entry.status === 'string', `Release-Status fehlt fuer ${entry.version}`)
  ensure(typeof entry.title === 'string' && entry.title.trim(), `Release-Titel fehlt fuer ${entry.version}`)
  ensure(
    Array.isArray(entry.changes) && entry.changes.length > 0,
    `Mindestens eine Aenderung ist Pflicht fuer ${entry.version}`,
  )
  ensure(
    Array.isArray(entry.artifactChecklist) && entry.artifactChecklist.length > 0,
    `Artefakt-Checkliste fehlt fuer ${entry.version}`,
  )
  ensure(Array.isArray(entry.artifacts) && entry.artifacts.length > 0, `Artefakte fehlen fuer ${entry.version}`)

  const hasOciArtifact = entry.artifacts.some(
    (artifact) =>
      artifact &&
      artifact.type === 'oci-image' &&
      typeof artifact.reference === 'string' &&
      artifact.reference.includes(entry.version),
  )
  ensure(
    hasOciArtifact || entry.status === 'released',
    `OCI-Artefakt-Pfad fehlt fuer ${entry.version}`,
  )

  const hasDocumentationBundle = entry.artifacts.some(
    (artifact) =>
      artifact &&
      typeof artifact.type === 'string' &&
      artifact.type.includes('documentation'),
  )
  ensure(
    hasDocumentationBundle,
    `Doku-Export-Artefakt fehlt fuer ${entry.version}`,
  )

  ensure(
    entry.documentation &&
      typeof entry.documentation.exportRequired === 'boolean' &&
      typeof entry.documentation.exportStatus === 'string',
    `Dokumentationsstatus fehlt fuer ${entry.version}`,
  )

  if (
    entry.documentation.exportRequired &&
    entry.documentation.exportStatus === 'completed'
  ) {
    ensure(
      typeof entry.documentation.exportLogId === 'string' &&
        exportLogContent.includes(entry.documentation.exportLogId),
      `Export-Log-Nachweis fehlt fuer ${entry.version}`,
    )
  }

  if (entry.ui?.showBanner) {
    ensure(
      typeof entry.ui.callToActionLabel === 'string' &&
        entry.ui.callToActionLabel.trim().length > 0,
      `CTA-Label fehlt fuer ${entry.version}`,
    )
  }
}

function main() {
  ensure(existsSync(updateNoticesPath), 'docs/releases/UPDATE-NOTICES.json fehlt')
  ensure(existsSync(exportLogPath), 'docs/exports/EXPORT-LOG.md fehlt')
  ensure(existsSync(releaseReadmePath), 'docs/releases/README.md fehlt')
  ensure(existsSync(workflowPath), '.github/workflows/ci.yml fehlt')

  const document = readJson(updateNoticesPath)
  const exportLogContent = readFileSync(exportLogPath, 'utf8')
  const workflowContent = readFileSync(workflowPath, 'utf8')

  ensure(document.sourceOfTruth === 'git', 'sourceOfTruth muss auf git stehen')
  ensure(Array.isArray(document.releases), 'Release-Liste fehlt')
  ensure(document.releases.length > 0, 'Mindestens ein Release-Hinweis ist erforderlich')

  const versions = document.releases.map((entry) => entry.version)
  ensure(
    new Set(versions).size === versions.length,
    'Release-Versionen muessen eindeutig sein',
  )

  const sortedVersions = [...versions].sort((left, right) => compareVersions(right, left))
  ensure(
    JSON.stringify(versions) === JSON.stringify(sortedVersions),
    'Release-Hinweise muessen absteigend nach Version sortiert sein',
  )

  for (const entry of document.releases) {
    validateReleaseEntry(entry, exportLogContent)
  }

  ensure(
    exportLogContent.includes('Erst Git aktualisieren') &&
      exportLogContent.includes('Dann exportieren'),
    'Export-Log enthaelt die Git-zuerst-Regel nicht vollstaendig',
  )
  ensure(
    workflowContent.includes('npm run check:obj14'),
    'CI-Workflow fuehrt den OBJ-14-Check noch nicht aus',
  )

  const warnings = []
  if (!existsSync(changelogPath)) {
    warnings.push('CHANGELOG.md fehlt noch und bleibt fuer das vollstaendige Release-Gate offen.')
  }

  const pendingExports = document.releases.filter(
    (entry) =>
      entry.documentation?.exportRequired &&
      entry.documentation?.exportStatus !== 'completed',
  ).length

  console.log('OBJ-14 verification passed')
  console.log(`- releases documented: ${document.releases.length}`)
  console.log(`- pending exports: ${pendingExports}`)
  console.log(`- workflow integration: check:obj14 configured`)

  for (const warning of warnings) {
    console.log(`- warning: ${warning}`)
  }
}

try {
  main()
} catch (error) {
  console.error('OBJ-14 verification failed')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
