#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const updateNoticesPath = path.join(repoRoot, 'docs', 'releases', 'UPDATE-NOTICES.json')
const securityBundlesPath = path.join(
  repoRoot,
  'docs',
  'releases',
  'SECURITY-SCAN-BUNDLES.json',
)
const offlinePackagesPath = path.join(repoRoot, 'artifacts', 'offline-package', 'INDEX.json')
const policyPath = path.join(repoRoot, 'release-policy', 'policy.yaml')
const exceptionsDir = path.join(repoRoot, 'release-policy', 'exceptions')
const gateReportsDir = path.join(repoRoot, 'artifacts', 'gate-reports')

const textInspectableSuffixes = [
  '.json',
  '.md',
  '.txt',
  '.yaml',
  '.yml',
  '.sarif',
  '.spdx.json',
]
const localReferencePrefixes = [
  'artifacts/',
  'docs/',
  'dist/',
  'helm/',
  'k8s/',
  'src/',
  'features/',
  'tests/',
  'capabilities/',
]

function parseArgs(argv) {
  const options = {
    version: null,
    write: true,
    json: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--version') {
      options.version = argv[index + 1] ?? null
      index += 1
      continue
    }
    if (arg === '--no-write') {
      options.write = false
      continue
    }
    if (arg === '--json') {
      options.json = true
      continue
    }
  }

  return options
}

async function readJsonLikeYaml(filePath) {
  const content = await fs.readFile(filePath, 'utf8')
  return JSON.parse(content)
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function semverParts(version) {
  const match =
    /^v(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(version)
  if (!match) {
    return null
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? null,
  }
}

function compareVersionsDesc(left, right) {
  const a = semverParts(left)
  const b = semverParts(right)
  if (!a || !b) {
    return right.localeCompare(left)
  }

  if (a.major !== b.major) {
    return b.major - a.major
  }
  if (a.minor !== b.minor) {
    return b.minor - a.minor
  }
  if (a.patch !== b.patch) {
    return b.patch - a.patch
  }
  if (a.prerelease === b.prerelease) {
    return 0
  }
  if (a.prerelease === null) {
    return -1
  }
  if (b.prerelease === null) {
    return 1
  }
  return a.prerelease.localeCompare(b.prerelease)
}

function isLocalReference(reference) {
  return localReferencePrefixes.some((prefix) => reference.startsWith(prefix))
}

function extractDigest(reference) {
  const match = /@sha256:[a-f0-9]{64}/i.exec(reference)
  return match ? match[0].slice(1) : null
}

function toPosixPath(value) {
  return value.split(path.sep).join(path.posix.sep)
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
}

function globToRegExp(pattern) {
  let escaped = escapeRegExp(pattern)
  escaped = escaped.replace(/\*\*/g, '::DOUBLE_STAR::')
  escaped = escaped.replace(/\*/g, '[^/]*')
  escaped = escaped.replace(/::DOUBLE_STAR::/g, '.*')
  return new RegExp(`^${escaped}$`)
}

function matchesGlob(targetPath, patterns) {
  return patterns.some((pattern) => globToRegExp(pattern).test(targetPath))
}

function matchesAllowedExtension(filename, suffixes) {
  return suffixes.some((suffix) => filename.endsWith(suffix))
}

async function listFilesRecursively(rootPath) {
  const stats = await fs.stat(rootPath)
  if (stats.isFile()) {
    return [
      {
        absolutePath: rootPath,
        relativePath: path.basename(rootPath),
        sizeBytes: stats.size,
      },
    ]
  }

  const files = []

  async function visit(currentPath, relativeBase) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true })
    for (const entry of entries) {
      const absolutePath = path.join(currentPath, entry.name)
      const relativePath = relativeBase
        ? path.posix.join(relativeBase, entry.name)
        : entry.name
      if (entry.isDirectory()) {
        await visit(absolutePath, relativePath)
        continue
      }
      if (!entry.isFile()) {
        continue
      }
      const entryStats = await fs.stat(absolutePath)
      files.push({
        absolutePath,
        relativePath,
        sizeBytes: entryStats.size,
      })
    }
  }

  await visit(rootPath, '')
  return files
}

async function inspectLocalArtifact(localPath) {
  if (!localPath) {
    return {
      exists: false,
      status: 'remote-only',
      sizeBytes: null,
      fileCount: null,
      topLevelEntries: [],
      files: [],
    }
  }

  const absolutePath = path.join(repoRoot, localPath)
  if (!(await fileExists(absolutePath))) {
    return {
      exists: false,
      status: 'missing',
      sizeBytes: null,
      fileCount: null,
      topLevelEntries: [],
      files: [],
    }
  }

  const stats = await fs.stat(absolutePath)
  const directChildren = stats.isDirectory()
    ? await fs.readdir(absolutePath, { withFileTypes: true })
    : [{ name: path.basename(absolutePath) }]
  const topLevelEntries = directChildren.map((entry) => entry.name).sort()
  const files = await listFilesRecursively(absolutePath)
  const totalSizeBytes = files.reduce((total, entry) => total + entry.sizeBytes, 0)

  return {
    exists: true,
    status: 'checked',
    sizeBytes: totalSizeBytes,
    fileCount: files.length,
    topLevelEntries,
    files: files.map((entry) => ({
      ...entry,
      repoRelativePath: toPosixPath(path.relative(repoRoot, entry.absolutePath)),
      artifactRelativePath: toPosixPath(entry.relativePath),
    })),
  }
}

async function findForbiddenContent(files, policy) {
  const violations = []

  for (const file of files) {
    if (!matchesAllowedExtension(file.repoRelativePath, textInspectableSuffixes)) {
      continue
    }
    if (file.sizeBytes > 512 * 1024) {
      continue
    }

    const content = await fs.readFile(file.absolutePath, 'utf8').catch(() => null)
    if (!content) {
      continue
    }

    for (const pattern of policy.forbiddenContentPatterns) {
      const matcher = new RegExp(pattern.pattern, 'm')
      if (matcher.test(content)) {
        violations.push({
          ruleId: pattern.id,
          severity: 'blocking',
          path: file.repoRelativePath,
          message: pattern.description,
        })
      }
    }
  }

  return violations
}

function createViolation(ruleId, message, pathValue = null, severity = 'blocking') {
  return {
    ruleId,
    severity,
    path: pathValue,
    message,
    waived: false,
    exceptionId: null,
  }
}

function applyExceptions(violations, exceptions, artifact) {
  const now = new Date()
  const applied = []

  for (const violation of violations) {
    const matched = exceptions.find((exception) => {
      if (exception.version !== artifact.version) {
        return false
      }
      if (!exception.ruleIds.includes(violation.ruleId)) {
        return false
      }
      if (
        Array.isArray(exception.artifactKinds) &&
        exception.artifactKinds.length > 0 &&
        !exception.artifactKinds.includes(artifact.kind)
      ) {
        return false
      }
      if (
        exception.artifactNamePattern &&
        !artifact.name.toLowerCase().includes(exception.artifactNamePattern.toLowerCase())
      ) {
        return false
      }
      const expiresAt = new Date(exception.expiresAt)
      return !Number.isNaN(expiresAt.getTime()) && expiresAt >= now
    })

    if (!matched) {
      continue
    }

    violation.waived = true
    violation.exceptionId = matched.id
    applied.push(matched)
  }

  return applied
}

function dedupeById(entries) {
  const seen = new Set()
  return entries.filter((entry) => {
    if (seen.has(entry.id)) {
      return false
    }
    seen.add(entry.id)
    return true
  })
}

function buildArtifactCandidates(release, securityBundle, offlinePackages) {
  const candidates = []

  for (const artifact of release.artifacts) {
    if (artifact.type === 'oci-image') {
      candidates.push({
        id: `${release.version}:oci-image:${artifact.name}`,
        name: artifact.name,
        kind: 'oci-image',
        version: release.version,
        channel: release.channel,
        reference: artifact.reference,
        localPath: null,
        releaseStatus: release.status,
        metadata: {
          verification: artifact.verification,
          mediaType: null,
          digest: extractDigest(artifact.reference),
        },
      })
      continue
    }

    candidates.push({
      id: `${release.version}:release-attachment:${artifact.name}`,
      name: artifact.name,
      kind: 'release-attachment',
      version: release.version,
      channel: release.channel,
      reference: artifact.reference,
      localPath: isLocalReference(artifact.reference) ? artifact.reference : null,
      releaseStatus: release.status,
      metadata: {
        verification: artifact.verification,
      },
    })
  }

  if (securityBundle) {
    candidates.push({
      id: `${release.version}:security-bundle`,
      name: `Security bundle ${release.version}`,
      kind: 'security-bundle',
      version: release.version,
      channel: securityBundle.channel,
      reference: securityBundle.evidence.ociRegistryReference,
      localPath: path.posix.dirname(securityBundle.sbom.path),
      releaseStatus: release.status,
      metadata: {
        gateStatus: securityBundle.gate.status,
      },
    })
  }

  for (const offlinePackage of offlinePackages) {
    candidates.push({
      id: `${release.version}:zarf-package:${offlinePackage.variant}`,
      name: `Zarf package ${offlinePackage.variant}`,
      kind: 'zarf-package',
      version: release.version,
      channel: offlinePackage.channel,
      reference: offlinePackage.packageFile,
      localPath: offlinePackage.packageFile,
      releaseStatus: release.status,
      metadata: {
        variant: offlinePackage.variant,
      },
    })
    candidates.push({
      id: `${release.version}:manifest-bundle:${offlinePackage.variant}`,
      name: `Manifest bundle ${offlinePackage.variant}`,
      kind: 'manifest-bundle',
      version: release.version,
      channel: offlinePackage.channel,
      reference: offlinePackage.manifestFile,
      localPath: path.posix.dirname(offlinePackage.manifestFile),
      releaseStatus: release.status,
      metadata: {
        variant: offlinePackage.variant,
      },
    })
  }

  return candidates
}

async function evaluateArtifact(candidate, profile, policy, exceptions) {
  const inspection = await inspectLocalArtifact(candidate.localPath)
  const violations = []
  const notes = []

  if (profile.requireLocalPath && !inspection.exists) {
    violations.push(
      createViolation(
        'ARTIFACT_PATH_MISSING',
        'Das erwartete Endartefakt ist lokal nicht vorhanden und kann daher nicht freigegeben werden.',
        candidate.localPath,
      ),
    )
  }

  if (inspection.exists) {
    for (const requiredEntry of profile.requiredTopLevelEntries) {
      if (!inspection.topLevelEntries.includes(requiredEntry)) {
        violations.push(
          createViolation(
            'REQUIRED_TOP_LEVEL_ENTRY_MISSING',
            `Pflichtbestandteil ${requiredEntry} fehlt im Artefakt.`,
            requiredEntry,
          ),
        )
      }
    }

    if (
      typeof profile.maxFileCount === 'number' &&
      inspection.fileCount !== null &&
      inspection.fileCount > profile.maxFileCount
    ) {
      violations.push(
        createViolation(
          'MAX_FILE_COUNT_EXCEEDED',
          `Artefakt enthaelt ${inspection.fileCount} Dateien und ueberschreitet das Limit ${profile.maxFileCount}.`,
          candidate.localPath,
        ),
      )
    }

    if (
      typeof profile.maxArtifactSizeBytes === 'number' &&
      inspection.sizeBytes !== null &&
      inspection.sizeBytes > profile.maxArtifactSizeBytes
    ) {
      violations.push(
        createViolation(
          'MAX_ARTIFACT_SIZE_EXCEEDED',
          `Artefaktgroesse ${inspection.sizeBytes} Bytes ueberschreitet das Limit ${profile.maxArtifactSizeBytes}.`,
          candidate.localPath,
        ),
      )
    }

    for (const file of inspection.files) {
      if (
        profile.allowedPathPatterns.length > 0 &&
        !matchesGlob(file.repoRelativePath, profile.allowedPathPatterns)
      ) {
        violations.push(
          createViolation(
            'ALLOWLIST_PATH_VIOLATION',
            `Pfad ${file.repoRelativePath} ist nicht durch die Allowlist freigegeben.`,
            file.repoRelativePath,
          ),
        )
      }

      if (
        profile.allowedFileExtensions.length > 0 &&
        !matchesAllowedExtension(file.repoRelativePath, profile.allowedFileExtensions)
      ) {
        violations.push(
          createViolation(
            'ALLOWLIST_FILETYPE_VIOLATION',
            `Dateityp von ${file.repoRelativePath} ist nicht freigegeben.`,
            file.repoRelativePath,
          ),
        )
      }

      if (matchesGlob(file.repoRelativePath, profile.forbiddenPathPatterns)) {
        violations.push(
          createViolation(
            'FORBIDDEN_PATH_PATTERN',
            `Pfad ${file.repoRelativePath} ist gemaess Gate-Policy verboten.`,
            file.repoRelativePath,
          ),
        )
      }
    }

    if (profile.inspectContents) {
      const contentViolations = await findForbiddenContent(inspection.files, policy)
      for (const violation of contentViolations) {
        violations.push({
          ...violation,
          waived: false,
          exceptionId: null,
        })
      }
    }
  }

  let acceptedRiskByMetadata = false
  if (candidate.kind === 'oci-image') {
    if (profile.requireDigest && !candidate.metadata.digest) {
      violations.push(
        createViolation(
          'OCI_DIGEST_REQUIRED',
          'Container-Image ist nur per Tag referenziert. Fuer den Publish-Gate ist ein Digest-Nachweis verpflichtend.',
          candidate.reference,
        ),
      )
    }
    if (profile.allowedMediaTypes.length > 0 && !candidate.metadata.mediaType) {
      violations.push(
        createViolation(
          'OCI_MEDIA_TYPE_MISSING',
          'OCI-Media-Type ist nicht nachgewiesen und kann daher nicht als konform bestaetigt werden.',
          candidate.reference,
        ),
      )
    }
  }

  if (candidate.kind === 'security-bundle') {
    if (candidate.metadata.gateStatus === 'fail' || candidate.metadata.gateStatus === 'unknown') {
      violations.push(
        createViolation(
          'SECURITY_GATE_BLOCKED',
          `Security-Gate meldet ${candidate.metadata.gateStatus}; Publish bleibt blockiert.`,
          candidate.reference,
        ),
      )
    }
    if (candidate.metadata.gateStatus === 'accepted-risk') {
      acceptedRiskByMetadata = true
      notes.push('Security-Bundle hat einen dokumentierten accepted-risk-Status aus OBJ-17.')
    }
  }

  const appliedExceptions = dedupeById(applyExceptions(violations, exceptions, candidate))
  const hasBlockingViolations = violations.some(
    (violation) => violation.severity === 'blocking' && !violation.waived,
  )
  const hasAcceptedRisk = acceptedRiskByMetadata || violations.some((violation) => violation.waived)
  const decision = hasBlockingViolations ? 'fail' : hasAcceptedRisk ? 'accepted-risk' : 'pass'

  const ruleState = (ruleIds) =>
    !violations.some((violation) => ruleIds.includes(violation.ruleId) && !violation.waived)

  return {
    id: candidate.id,
    name: candidate.name,
    kind: candidate.kind,
    version: candidate.version,
    channel: candidate.channel,
    reference: candidate.reference,
    localPath: candidate.localPath,
    status: inspection.status,
    exists: inspection.exists,
    decision,
    sizeBytes: inspection.sizeBytes,
    fileCount: inspection.fileCount,
    topLevelEntries: inspection.topLevelEntries,
    digest: candidate.metadata.digest ?? null,
    releaseStatus: candidate.releaseStatus,
    checks: {
      allowlist: ruleState([
        'ALLOWLIST_PATH_VIOLATION',
        'ALLOWLIST_FILETYPE_VIOLATION',
        'REQUIRED_TOP_LEVEL_ENTRY_MISSING',
      ]),
      forbiddenContent: ruleState([
        'FORBIDDEN_PATH_PATTERN',
        'SECRET_PRIVATE_KEY',
        'SECRET_AWS_ACCESS_KEY',
        'SECRET_GENERIC_PASSWORD',
      ]),
      fileCountWithinLimit: ruleState(['MAX_FILE_COUNT_EXCEEDED']),
      sizeWithinLimit: ruleState(['MAX_ARTIFACT_SIZE_EXCEEDED']),
      securityState: ruleState(['SECURITY_GATE_BLOCKED']),
      ociConformant: ruleState(['OCI_DIGEST_REQUIRED', 'OCI_MEDIA_TYPE_MISSING']),
    },
    violations,
    exceptionsApplied: appliedExceptions,
    notes,
  }
}

function summarizeArtifacts(artifacts) {
  return {
    artifactCount: artifacts.length,
    passedArtifacts: artifacts.filter((artifact) => artifact.decision === 'pass').length,
    failedArtifacts: artifacts.filter((artifact) => artifact.decision === 'fail').length,
    acceptedRiskArtifacts: artifacts.filter((artifact) => artifact.decision === 'accepted-risk')
      .length,
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
  }
}

async function buildReport(version, documents) {
  const release = documents.releases.releases.find((entry) => entry.version === version)
  if (!release) {
    throw new Error(`Version ${version} wurde in docs/releases/UPDATE-NOTICES.json nicht gefunden.`)
  }

  const securityBundle = documents.security.bundles.find((entry) => entry.version === version) ?? null
  const offlinePackages = documents.offline.packages.filter((entry) => entry.version === version)
  const exceptions = documents.exceptions.filter((entry) => entry.version === version)

  const candidates = buildArtifactCandidates(release, securityBundle, offlinePackages)
  const artifacts = []

  for (const candidate of candidates) {
    const profile = documents.policy.artifactProfiles.find(
      (entry) => entry.artifactKind === candidate.kind,
    )
    if (!profile) {
      throw new Error(`Kein Gate-Profil fuer Artefakt-Typ ${candidate.kind} definiert.`)
    }
    artifacts.push(await evaluateArtifact(candidate, profile, documents.policy, exceptions))
  }

  const summary = summarizeArtifacts(artifacts)
  const decision = summary.failedArtifacts > 0 ? 'fail' : summary.acceptedRiskArtifacts > 0 ? 'accepted-risk' : 'pass'
  const exceptionsApplied = dedupeById(
    artifacts.flatMap((artifact) => artifact.exceptionsApplied),
  )

  return {
    service: documents.policy.service,
    sourceOfTruth: documents.policy.sourceOfTruth,
    generatedAt: new Date().toISOString(),
    version: release.version,
    channel: release.channel,
    releaseStatus: release.status,
    releaseTitle: release.title,
    policyVersion: documents.policy.policyVersion,
    policyPath: 'release-policy/policy.yaml',
    decision,
    blockPublish: decision === 'fail',
    blockExport: decision === 'fail',
    summary,
    artifacts,
    exceptionsApplied,
    notes: [
      decision === 'fail'
        ? 'Publish und Export bleiben blockiert, bis alle blockierenden Verstosse beseitigt oder formal genehmigt sind.'
        : 'Artefaktpruefung abgeschlossen.',
      'Gate-Berichte werden aus Git-Quellen und den finalen Artefaktpfaden erzeugt.',
    ],
  }
}

async function writeReports(indexDocument) {
  await fs.mkdir(gateReportsDir, { recursive: true })
  await fs.writeFile(
    path.join(gateReportsDir, 'INDEX.json'),
    JSON.stringify(indexDocument, null, 2),
    'utf8',
  )

  for (const report of indexDocument.reports) {
    const targetDir = path.join(gateReportsDir, report.version)
    await fs.mkdir(targetDir, { recursive: true })
    await fs.writeFile(
      path.join(targetDir, 'gate-report.json'),
      JSON.stringify(report, null, 2),
      'utf8',
    )
  }
}

function printSummary(indexDocument) {
  for (const report of indexDocument.reports) {
    const blockState = report.blockPublish ? 'BLOCKED' : 'OPEN'
    console.log(
      [
        report.version,
        `decision=${report.decision}`,
        `publish=${blockState}`,
        `artifacts=${report.summary.artifactCount}`,
        `blockingViolations=${report.summary.blockingViolations}`,
      ].join(' | '),
    )
  }
}

async function loadExceptions() {
  if (!(await fileExists(exceptionsDir))) {
    return []
  }

  const entries = await fs.readdir(exceptionsDir)
  const files = entries.filter((entry) => entry.endsWith('.yaml'))
  const exceptions = []
  for (const filename of files) {
    exceptions.push(await readJsonLikeYaml(path.join(exceptionsDir, filename)))
  }
  return exceptions
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const documents = {
    releases: await readJsonLikeYaml(updateNoticesPath),
    security: await readJsonLikeYaml(securityBundlesPath),
    offline: await readJsonLikeYaml(offlinePackagesPath),
    policy: await readJsonLikeYaml(policyPath),
    exceptions: await loadExceptions(),
  }

  const versions = options.version
    ? [options.version]
    : documents.releases.releases
        .map((entry) => entry.version)
        .sort(compareVersionsDesc)

  const reports = []
  for (const version of versions) {
    reports.push(await buildReport(version, documents))
  }

  const indexDocument = {
    service: documents.policy.service,
    sourceOfTruth: documents.policy.sourceOfTruth,
    updatedAt: new Date().toISOString(),
    policyVersion: documents.policy.policyVersion,
    reports,
  }

  if (options.write) {
    await writeReports(indexDocument)
  }

  if (options.json) {
    console.log(JSON.stringify(options.version ? reports[0] : indexDocument, null, 2))
  } else {
    printSummary(indexDocument)
  }

  if (reports.some((report) => report.decision === 'fail')) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`OBJ-22 publish gate failed: ${message}`)
  process.exitCode = 1
})
