import fs from 'fs'
import path from 'path'

export type StepStatus = 'open' | 'passed' | 'failed' | 'na'

export type OverallResult = 'passed' | 'failed' | 'na' | null

export type TestCategory =
  | 'Build'
  | 'Unit'
  | 'Integration'
  | 'API'
  | 'UI'
  | 'Deployability'
  | 'Unkategorisiert'

export interface TestStep {
  number: number
  description: string
  status: StepStatus
  observation: string
  expectedResult?: string
}

export interface ManualTest {
  id: string
  requirementId: string
  oftTag: string
  oftCovers: string
  serviceFunctionId: string
  serviceFunctionName: string
  category: TestCategory
  estimatedDuration: string
  preparations: string[]
  steps: TestStep[]
  expectedResult: string
  filePath: string
}

export interface TestRunState {
  steps: TestStep[]
  preparations: boolean[]
  currentStep: number
  overallResult: OverallResult
  testerName: string
  testDate: string
}

export interface ValidationResult {
  errors: string[]
  warnings: string[]
}

const TEST_CATEGORIES: TestCategory[] = [
  'Build',
  'Unit',
  'Integration',
  'API',
  'UI',
  'Deployability',
  'Unkategorisiert',
]

const CATEGORY_ORDER: Record<TestCategory, number> = TEST_CATEGORIES.reduce(
  (acc, category, index) => {
    acc[category] = index
    return acc
  },
  {} as Record<TestCategory, number>
)

/** Map from directory name pattern to human-readable name */
const SERVICE_FUNCTION_NAMES: Record<string, string> = {
  'SFN-TIN26-dns-query': 'DNS Query (Authoritative)',
  'SFN-TIN370-dns-root': 'DNS Root Zone Hosting',
  'SFN-TIN43-zone-transfer': 'DNS Zone Transfer',
  'SFN-TIN114-anycast-dns': 'Anycast DNS Advertising',
  'SFN-RESOLV-query': 'Recursive DNS Resolution',
  'SFN-RESOLV-dnssec': 'DNSSEC Validation',
  'SFN-DNS-LOGGING': 'DNS Security & Event Logging',
}

function extractServiceFunctionId(dirName: string): string {
  const match = dirName.match(/^(SFN-[A-Z0-9]+(?:-\d+)?)/)
  return match ? match[1] : dirName
}

function extractServiceFunctionName(dirName: string): string {
  return SERVICE_FUNCTION_NAMES[dirName] ?? dirName
}

function findManualTestFiles(dir: string): string[] {
  const results: string[] = []

  if (!fs.existsSync(dir)) {
    return results
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findManualTestFiles(fullPath))
    } else if (
      entry.isFile() &&
      entry.name.endsWith('-manual.md') &&
      fullPath.includes(path.join('tests', 'manual'))
    ) {
      results.push(fullPath)
    }
  }

  return results
}

function stripQuotes(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

function parseFrontmatter(content: string): {
  metadata: Record<string, string>
  body: string
} {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/)
  if (!match) {
    return { metadata: {}, body: content }
  }

  const metadata: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf(':')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim().toLowerCase()
    const value = stripQuotes(trimmed.slice(separatorIndex + 1))
    if (key) {
      metadata[key] = value
    }
  }

  return {
    metadata,
    body: content.slice(match[0].length),
  }
}

function normalizeCategory(rawValue?: string): TestCategory {
  if (!rawValue) {
    return 'Unkategorisiert'
  }

  const normalized = rawValue.trim().toLowerCase()

  if (
    ['build', 'builds', 'release build', 'release-build', 'release'].includes(
      normalized
    )
  ) {
    return 'Build'
  }

  if (['unit', 'unit test', 'unit tests', 'test unit'].includes(normalized)) {
    return 'Unit'
  }

  if (
    ['integration', 'integrations', 'e2e', 'end-to-end'].includes(normalized)
  ) {
    return 'Integration'
  }

  if (['api', 'rest api', 'openapi', 'swagger'].includes(normalized)) {
    return 'API'
  }

  if (['ui', 'gui', 'frontend', 'browser'].includes(normalized)) {
    return 'UI'
  }

  if (
    ['deployability', 'deployment', 'deploy', 'release deploy'].includes(
      normalized
    )
  ) {
    return 'Deployability'
  }

  return 'Unkategorisiert'
}

function inferCategoryFromContent(content: string, filePath: string): TestCategory {
  const haystack = `${filePath}\n${content}`.toLowerCase()

  if (
    /deploy|deployment|zarf|smoke[- ]?test|target import|package deploy|kubectl get pods|import/.test(
      haystack
    )
  ) {
    return 'Deployability'
  }

  if (/api|openapi|swagger|endpoint|rest api|http|curl|postman/.test(haystack)) {
    return 'API'
  }

  if (/ui|gui|dashboard|frontend|browser|webseite|screen|view/.test(haystack)) {
    return 'UI'
  }

  if (
    /build|release build|image|container|dockerfile|sbom|artifact|packaging|trivy image/.test(
      haystack
    )
  ) {
    return 'Build'
  }

  if (
    /integration|reconciliation|sync|workflow|e2e|end-to-end|logging|audit|telemetry|event/.test(
      haystack
    )
  ) {
    return 'Integration'
  }

  if (/\bunit\b|parser|validator|validation|helper|utility|\bfunction\b/.test(haystack)) {
    return 'Unit'
  }

  return 'Unkategorisiert'
}

function extractRequirementId(
  metadata: Record<string, string>,
  content: string,
  fileName: string
): string {
  const frontmatterRequirement =
    metadata.requirement ??
    metadata.requirementid ??
    metadata['requirement-id'] ??
    metadata.req

  if (frontmatterRequirement) {
    return frontmatterRequirement.replace(/^\[/, '').replace(/\]$/, '').trim()
  }

  const patterns = [
    />\s*\*\*Requirement:\*\*\s*\[?([A-Z]+-\d+(?:-\d+)?)\]?/,
    /\|\s*\*\*Requirement\*\*\s*\|\s*\[?([A-Z]+-\d+(?:-\d+)?)\]?/m,
    /Requirement:\s*\[?([A-Z]+-\d+(?:-\d+)?)\]?/i,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match) {
      return match[1]
    }
  }

  const fileMatch = fileName.match(/^TEST-([A-Z]+-\d+(?:-\d+)?)-/)
  return fileMatch ? fileMatch[1] : ''
}

function extractOftTag(content: string): string {
  const oftTagMatch = content.match(/`(itest~[^`]+)`/)
  return oftTagMatch ? oftTagMatch[1] : ''
}

function extractOftCovers(content: string): string {
  const oftCoversMatch = content.match(/Covers:\s*(.+)/)
  return oftCoversMatch ? oftCoversMatch[1].trim() : ''
}

function extractEstimatedDuration(
  metadata: Record<string, string>,
  content: string
): string {
  const frontmatterDuration =
    metadata['estimated-duration'] ?? metadata.duration ?? metadata['dauer']
  if (frontmatterDuration) {
    return frontmatterDuration
  }

  const durationMatch = content.match(
    />\s*\*\*Geschaetzte Dauer:\*\*\s*(.+)/i
  )
  return durationMatch ? durationMatch[1].trim() : ''
}

function splitSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const parts = content.split(/^## /m)

  for (const part of parts) {
    const newlineIndex = part.indexOf('\n')
    if (newlineIndex === -1) continue
    const heading = part.substring(0, newlineIndex).trim()
    const body = part.substring(newlineIndex + 1)
    if (heading) {
      sections[heading] = body
    }
  }

  return sections
}

function isTableBlock(lines: string[]): boolean {
  if (lines.length < 2) {
    return false
  }

  return lines.some((line) => /^\s*\|(?:.+\|)+\s*$/.test(line)) &&
    lines.some((line) => /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(line))
}

function splitTableCells(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function parseStepTable(
  lines: string[]
): Array<{ description: string; expectedResult?: string }> {
  const headerIndex = lines.findIndex(
    (line) =>
      /^\s*\|/.test(line) &&
      /(schritt|step)/i.test(line) &&
      /(aktion|action|beschreibung|description)/i.test(line)
  )

  if (headerIndex === -1 || headerIndex + 2 >= lines.length) {
    return []
  }

  const header = splitTableCells(lines[headerIndex]).map((cell) =>
    cell.toLowerCase()
  )
  const rows: Array<{ description: string; expectedResult?: string }> = []

  for (let index = headerIndex + 2; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (!line || !line.startsWith('|')) {
      break
    }

    const cells = splitTableCells(line)
    if (cells.length < 2) continue

    const firstCell = cells[0].trim()
    if (!/^\d+$/.test(firstCell)) continue

    const actionIndex = header.findIndex((cell) =>
      /(aktion|action|beschreibung|description|step)/i.test(cell)
    )
    const expectedIndex = header.findIndex((cell) =>
      /(erwartet|expected)/i.test(cell)
    )

    const description =
      (actionIndex !== -1 ? cells[actionIndex] : cells[1]) ||
      `Schritt ${firstCell}`
    const expectedResult =
      expectedIndex !== -1 && cells[expectedIndex]
        ? cells[expectedIndex]
        : undefined

    rows.push({
      description,
      expectedResult,
    })
  }

  return rows
}

function parseNumberedSteps(section: string): Array<{
  description: string
  expectedResult?: string
}> {
  return section
    .split('\n')
    .filter((line) => line.match(/^\s*\d+\.\s+/))
    .map((line) => {
      const desc = line.replace(/^\s*\d+\.\s+/, '').trim()
      return {
        description: desc,
      }
    })
}

function parseStepBody(section: string): Array<{
  description: string
  expectedResult?: string
}> {
  const lines = section
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .filter((line) => line.trim().length > 0)

  if (isTableBlock(lines)) {
    const parsed = parseStepTable(lines)
    if (parsed.length > 0) {
      return parsed
    }
  }

  return parseNumberedSteps(section)
}

function parsePreparations(section: string): string[] {
  return section
    .split('\n')
    .filter((line) => line.match(/^\s*-\s+/))
    .map((line) => line.replace(/^\s*-\s+/, '').trim())
}

function extractExpectedResult(
  sections: Record<string, string>,
  content: string
): string {
  const fromSection = (sections['Erwartetes Ergebnis'] ?? '').trim()
  if (fromSection) {
    return fromSection
  }

  const fromTestergebnis = (sections['Testergebnis'] ?? '').trim()
  if (fromTestergebnis) {
    return fromTestergebnis
  }

  const match = content.match(/\*\*Erwartetes Ergebnis\*\*\s*[:\-]?\s*(.+)/i)
  return match ? match[1].trim() : ''
}

function inferCategory(
  metadata: Record<string, string>,
  content: string,
  filePath: string
): TestCategory {
  const explicitCategory = metadata.category ?? metadata.kategorie
  if (explicitCategory) {
    return normalizeCategory(explicitCategory)
  }

  return inferCategoryFromContent(content, filePath)
}

export function parseManualTestMarkdown(
  filePath: string,
  content: string
): ManualTest {
  const fileName = path.basename(filePath, '.md')
  const { metadata, body } = parseFrontmatter(content)
  const sections = splitSections(body)

  const requirementId = extractRequirementId(metadata, body, fileName)
  const oftTag = extractOftTag(body)
  const oftCovers = extractOftCovers(body)
  const estimatedDuration = extractEstimatedDuration(metadata, body)
  const category = inferCategory(metadata, body, filePath)

  const sfMatch = filePath.match(/service-functions\/([^/]+)\/tests/)
  const sfDirName = sfMatch ? sfMatch[1] : ''
  const serviceFunctionId = extractServiceFunctionId(sfDirName)
  const serviceFunctionName = extractServiceFunctionName(sfDirName)

  const preparationsSection = sections['Testvorbereitung'] ?? ''
  const preparations = parsePreparations(preparationsSection)

  const stepSection =
    sections['Testschritte'] ??
    sections['Steps'] ??
    sections['Schritte'] ??
    body
  const parsedSteps = parseStepBody(stepSection)
  const steps: TestStep[] = parsedSteps.map((step, index) => ({
    number: index + 1,
    description: step.description,
    expectedResult: step.expectedResult,
    status: 'open',
    observation: '',
  }))

  const expectedResult = extractExpectedResult(sections, body)

  return {
    id: fileName,
    requirementId,
    oftTag,
    oftCovers,
    serviceFunctionId,
    serviceFunctionName,
    category,
    estimatedDuration,
    preparations,
    steps,
    expectedResult,
    filePath,
  }
}

export function validateTestRun(
  test: ManualTest,
  state: TestRunState
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!state.overallResult) {
    errors.push('Eine Gesamtbewertung ist erforderlich, bevor das Ergebnis gespeichert wird.')
  }

  if (!state.testDate || Number.isNaN(Date.parse(state.testDate))) {
    errors.push('Ein gueltiges Datum ist erforderlich.')
  }

  if (!state.steps.some((step) => step.status !== 'open')) {
    errors.push('Mindestens ein Schritt muss bewertet sein.')
  }

  if (!state.testerName.trim()) {
    warnings.push(
      'Testername ist optional, aber fuer die Nachvollziehbarkeit empfohlen.'
    )
  }

  if (!test.steps.length) {
    warnings.push('Der Testfall enthaelt keine Schritte und kann nur eingeschraenkt ausgewertet werden.')
  }

  return { errors, warnings }
}

export function formatCategoryLabel(category: TestCategory): string {
  return category
}

export async function loadManualTests(): Promise<ManualTest[]> {
  const capabilitiesDir = path.join(process.cwd(), 'capabilities')
  const files = findManualTestFiles(capabilitiesDir)

  const tests: ManualTest[] = []

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const relativePath = path.relative(process.cwd(), filePath)
    tests.push(parseManualTestMarkdown(relativePath, content))
  }

  tests.sort((a, b) => {
    const categoryDiff = CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category]
    if (categoryDiff !== 0) {
      return categoryDiff
    }

    if (a.serviceFunctionName !== b.serviceFunctionName) {
      return a.serviceFunctionName.localeCompare(b.serviceFunctionName)
    }

    return a.id.localeCompare(b.id)
  })

  return tests
}

export { TEST_CATEGORIES }
