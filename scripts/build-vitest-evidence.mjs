import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const inputPath =
  process.env.VITEST_RAW_REPORT_PATH?.trim() ||
  path.join(repoRoot, '.tmp', 'vitest-report.raw.json')
const outputPath =
  process.env.VITEST_EVIDENCE_PATH?.trim() ||
  path.join(repoRoot, 'tests', 'executions', 'vitest-report.latest.json')

function toPosixPath(value) {
  return value.split(path.sep).join('/')
}

function toIsoTimestamp(value) {
  const asNumber = Number(value)
  if (!Number.isFinite(asNumber)) {
    return null
  }
  return new Date(asNumber).toISOString()
}

function inferObjIdsFromSuitePath(filePath) {
  const normalized = toPosixPath(filePath).toLowerCase()
  const objIds = new Set()

  if (
    normalized.includes('/src/app/api/v1/') ||
    normalized.includes('/src/lib/obj3-')
  ) {
    objIds.add('OBJ-3')
  }
  if (
    normalized.includes('/src/app/test-execution-dashboard/') ||
    normalized.includes('/src/lib/test-execution-dashboard') ||
    normalized.includes('/src/app/api/test-execution-dashboard/')
  ) {
    objIds.add('OBJ-23')
  }
  if (
    normalized.includes('/src/app/test-runner/') ||
    normalized.includes('/src/lib/test-runner')
  ) {
    objIds.add('OBJ-9')
  }

  return Array.from(objIds)
}

function parseTagId(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return null
  }
  const match = value.match(/(?:itest|utest)~([a-z0-9-]+)~\d+/i)
  if (!match) {
    return null
  }
  return match[1].toLowerCase()
}

function normalizeStatus(status) {
  const normalized = String(status ?? '').toLowerCase().trim()
  if (normalized === 'passed') {
    return 'passed'
  }
  if (normalized === 'failed') {
    return 'failed'
  }
  return 'failed'
}

function buildRunId() {
  if (process.env.GITHUB_RUN_ID) {
    return `GHA-${process.env.GITHUB_RUN_ID}`
  }
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  const h = String(now.getUTCHours()).padStart(2, '0')
  const min = String(now.getUTCMinutes()).padStart(2, '0')
  const s = String(now.getUTCSeconds()).padStart(2, '0')
  return `LOCAL-${y}${m}${d}-${h}${min}${s}`
}

function buildReleaseId() {
  if (process.env.RELEASE_ID?.trim()) {
    return process.env.RELEASE_ID.trim()
  }
  const refName = process.env.GITHUB_REF_NAME?.trim()
  if (refName) {
    return `REF-${refName}`
  }
  return 'RELEASE-UNASSIGNED'
}

function compactMessage(message) {
  if (!message) {
    return null
  }
  const flattened = String(message).replace(/\s+/g, ' ').trim()
  if (!flattened) {
    return null
  }
  return flattened.slice(0, 500)
}

async function buildVitestEvidence() {
  const rawContent = await fs.readFile(inputPath, 'utf8')
  const raw = JSON.parse(rawContent)
  const runId = buildRunId()
  const releaseId = buildReleaseId()
  const records = []

  const suites = Array.isArray(raw.testResults) ? raw.testResults : []
  for (const suite of suites) {
    const suiteFile = typeof suite.name === 'string' ? suite.name : ''
    const suitePathRelative = suiteFile
      ? toPosixPath(path.relative(repoRoot, suiteFile))
      : 'vitest-unknown-suite'
    const suiteObjIds = inferObjIdsFromSuitePath(suiteFile)
    const executedAt =
      toIsoTimestamp(suite.endTime) ??
      toIsoTimestamp(suite.startTime) ??
      new Date().toISOString()

    const assertions = Array.isArray(suite.assertionResults)
      ? suite.assertionResults
      : []

    for (const assertion of assertions) {
      const fullName =
        typeof assertion.fullName === 'string' && assertion.fullName.trim()
          ? assertion.fullName.trim()
          : typeof assertion.title === 'string' && assertion.title.trim()
            ? assertion.title.trim()
            : path.basename(suitePathRelative)
      const note =
        Array.isArray(assertion.failureMessages) &&
        assertion.failureMessages.length > 0
          ? compactMessage(assertion.failureMessages.join(' | '))
          : null

      records.push({
        testType: 'auto',
        tagId: parseTagId(fullName),
        testId: fullName,
        objIds: suiteObjIds,
        status: normalizeStatus(assertion.status),
        executedAt,
        runId,
        releaseId,
        note,
        evidencePath: 'tests/executions/vitest-report.latest.json',
        source: 'result_json',
        suitePath: suitePathRelative,
      })
    }
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`, 'utf8')

  console.log(`Vitest evidence generated: ${path.relative(repoRoot, outputPath)}`)
  console.log(`Records: ${records.length}`)
}

buildVitestEvidence().catch((error) => {
  console.error('Failed to build Vitest evidence.')
  console.error(error)
  process.exitCode = 1
})
