import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const ts = require('typescript')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const sourcePath = path.join(repoRoot, 'src', 'lib', 'test-execution-dashboard.ts')
const featureIndexPath = path.join(repoRoot, 'features', 'INDEX.md')
const outputDir = path.join(repoRoot, 'docs', 'testing')
const outputPath = path.join(outputDir, 'VALIDATION-MATRIX.md')

function cleanText(value) {
  return value
    .replace(/`/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function compareDatesDesc(left, right) {
  const leftTs = left ? Date.parse(left) : Number.NEGATIVE_INFINITY
  const rightTs = right ? Date.parse(right) : Number.NEGATIVE_INFINITY
  if (leftTs === rightTs) {
    return 0
  }
  return rightTs - leftTs
}

async function loadDashboardData() {
  const source = await fs.readFile(sourcePath, 'utf8')
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText

  const tempFile = path.join(
    os.tmpdir(),
    `validation-matrix-loader-${Date.now()}-${Math.random().toString(16).slice(2)}.cjs`,
  )
  await fs.writeFile(tempFile, transpiled, 'utf8')

  const previousCwd = process.cwd()
  process.chdir(repoRoot)

  try {
    const loadedModule = require(tempFile)
    const fn = loadedModule.loadTestExecutionDashboardData
    if (typeof fn !== 'function') {
      throw new Error(
        'loadTestExecutionDashboardData not found in src/lib/test-execution-dashboard.ts',
      )
    }
    return await fn()
  } finally {
    process.chdir(previousCwd)
    await fs.unlink(tempFile).catch(() => {})
  }
}

function parseFeatureRows(content) {
  const rows = []
  for (const line of content.split('\n')) {
    const rowMatch = line.match(
      /^\|\s*(OBJ-\d+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([0-9-]+)\s*\|/i,
    )
    if (!rowMatch) {
      continue
    }

    rows.push({
      objId: rowMatch[1].toUpperCase(),
      featureName: cleanText(rowMatch[2]),
      phase: cleanText(rowMatch[3]),
      featureStatus: cleanText(rowMatch[4]),
      specLabel: cleanText(rowMatch[5]),
      specRelativePath: path.join('features', rowMatch[6]),
      createdAt: rowMatch[7],
    })
  }
  return rows
}

function extractQaSectionContent(content) {
  const match = content.match(/##\s+QA Test Results([\s\S]*?)(?:\n##\s+[^\n]+|$)/i)
  if (!match) {
    return null
  }
  return match[1].trim()
}

async function loadFeatureQaMeta(featureRows) {
  const byObj = new Map()

  for (const row of featureRows) {
    const specPath = path.join(repoRoot, row.specRelativePath)
    const content = await fs.readFile(specPath, 'utf8').catch(() => '')
    if (!content) {
      byObj.set(row.objId, {
        qaSection: false,
        testedAt: null,
        productionReady: null,
      })
      continue
    }

    const qaSection = extractQaSectionContent(content)
    const hasQaSection = Boolean(
      qaSection &&
      qaSection.length > 0 &&
      !/_To be added by \/qa_/i.test(qaSection),
    )
    const testedAt = qaSection?.match(/\*\*Tested:\*\*\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i)?.[1] ?? null
    const productionReady =
      qaSection?.match(/\*\*Production Ready:\*\*\s*(YES|NO)/i)?.[1]?.toUpperCase() ??
      null

    byObj.set(row.objId, {
      qaSection: hasQaSection,
      testedAt,
      productionReady,
    })
  }

  return byObj
}

function aggregateByObj(tests) {
  const byObj = new Map()

  for (const test of tests) {
    const objIds = Array.isArray(test.objIds) && test.objIds.length > 0
      ? Array.from(new Set(test.objIds))
      : ['OBJ-UNASSIGNED']

    for (const objId of objIds) {
      const current = byObj.get(objId) ?? {
        total: 0,
        passed: 0,
        failed: 0,
        neverExecuted: 0,
        lastExecutedAt: null,
      }

      current.total += 1
      if (test.status === 'passed') {
        current.passed += 1
      } else if (test.status === 'failed') {
        current.failed += 1
      } else {
        current.neverExecuted += 1
      }

      if (compareDatesDesc(test.lastExecutedAt, current.lastExecutedAt) < 0) {
        current.lastExecutedAt = test.lastExecutedAt
      }

      byObj.set(objId, current)
    }
  }

  return byObj
}

function renderValidationDecision(featureStatus, aggregate, qaMeta) {
  if (!aggregate || aggregate.total === 0) {
    return 'Kein Testfall verknuepft'
  }

  if (aggregate.failed > 0) {
    return 'Blockiert (Failed vorhanden)'
  }

  if (aggregate.neverExecuted > 0) {
    return 'Teilweise validiert'
  }

  if (qaMeta?.productionReady === 'NO') {
    return 'QA sagt Nein'
  }

  if (featureStatus.toLowerCase() === 'completed') {
    return 'Validiert'
  }

  return 'In Arbeit'
}

function formatDate(isoOrDate) {
  if (!isoOrDate) {
    return '-'
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) {
    return isoOrDate
  }

  const parsed = new Date(isoOrDate)
  if (Number.isNaN(parsed.getTime())) {
    return '-'
  }
  return parsed.toISOString().slice(0, 19) + 'Z'
}

async function buildValidationMatrix() {
  const dashboardData = await loadDashboardData()
  const featureIndexContent = await fs.readFile(featureIndexPath, 'utf8')
  const featureRows = parseFeatureRows(featureIndexContent)
  const qaMetaByObj = await loadFeatureQaMeta(featureRows)
  const byObj = aggregateByObj(dashboardData.tests)

  const generatedAt = new Date().toISOString()
  const commitSha = process.env.GITHUB_SHA
    ? process.env.GITHUB_SHA.slice(0, 7)
    : 'local'

  const lines = []
  lines.push('# Validation Matrix (Repo-Testnachweis)')
  lines.push('')
  lines.push(`**Generiert am:** ${generatedAt}`)
  lines.push(`**Commit:** ${commitSha}`)
  lines.push('**Quelle:** Git Repository (Single Source of Truth)')
  lines.push('')
  lines.push('## Gesamtstand')
  lines.push('')
  lines.push('| Kennzahl | Wert |')
  lines.push('|---|---:|')
  lines.push(`| Testfaelle gesamt | ${dashboardData.summary.totalTests} |`)
  lines.push(`| Passed | ${dashboardData.summary.passed} |`)
  lines.push(`| Failed | ${dashboardData.summary.failed} |`)
  lines.push(`| Never Executed | ${dashboardData.summary.neverExecuted} |`)
  lines.push(`| Manuell | ${dashboardData.summary.manualTests} |`)
  lines.push(`| Automatisch | ${dashboardData.summary.autoTests} |`)
  lines.push('')
  lines.push('## OBJ Validation Matrix')
  lines.push('')
  lines.push('| OBJ | Feature | Status | QA | Prod Ready | Tests (T/P/F/N) | Letzter Nachweis | Validierung |')
  lines.push('|---|---|---|---|---|---|---|---|')

  for (const row of featureRows) {
    const aggregate = byObj.get(row.objId) ?? null
    const qaMeta = qaMetaByObj.get(row.objId) ?? {
      qaSection: false,
      testedAt: null,
      productionReady: null,
    }

    const qaState = qaMeta.qaSection
      ? qaMeta.testedAt
        ? `Ja (${qaMeta.testedAt})`
        : 'Ja'
      : 'Nein'

    const prodReady = qaMeta.productionReady ?? '-'
    const testSummary = aggregate
      ? `${aggregate.total}/${aggregate.passed}/${aggregate.failed}/${aggregate.neverExecuted}`
      : '0/0/0/0'
    const lastEvidence = formatDate(aggregate?.lastExecutedAt ?? null)
    const decision = renderValidationDecision(row.featureStatus, aggregate, qaMeta)

    lines.push(
      `| ${row.objId} | ${row.featureName} | ${row.featureStatus} | ${qaState} | ${prodReady} | ${testSummary} | ${lastEvidence} | ${decision} |`,
    )
  }

  lines.push('')
  lines.push('## Statusregeln')
  lines.push('')
  for (const rule of dashboardData.statusRules) {
    lines.push(`- ${rule}`)
  }

  lines.push('')
  lines.push('## Datenquellen')
  lines.push('')
  for (const source of dashboardData.dataSources) {
    lines.push(`- \`${source}\``)
  }

  lines.push('')
  lines.push('## Interpretation')
  lines.push('')
  lines.push('- `Tests (T/P/F/N)` bedeutet: `Total / Passed / Failed / Never Executed`.')
  lines.push('- Ein Test kann mehreren OBJs zugeordnet sein; deshalb sind OBJ-Summen nicht additiv zur Gesamtsumme.')
  lines.push('- Die Matrix ist ein Management-Nachweis und ersetzt keine Detailanalyse im Testfall selbst.')
  lines.push('- Detailnachweise bleiben in `tests/results/`, `tests/executions/` und den `QA Test Results` in `features/OBJ-*.md`.')
  lines.push('')

  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8')

  console.log(`Validation matrix generated: ${path.relative(repoRoot, outputPath)}`)
  console.log(
    `Summary -> Total: ${dashboardData.summary.totalTests}, Passed: ${dashboardData.summary.passed}, Failed: ${dashboardData.summary.failed}, Never: ${dashboardData.summary.neverExecuted}`,
  )
}

buildValidationMatrix().catch((error) => {
  console.error('Failed to build validation matrix.')
  console.error(error)
  process.exitCode = 1
})
