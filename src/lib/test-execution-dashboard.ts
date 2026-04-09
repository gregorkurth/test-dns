import { promises as fs } from 'node:fs'
import path from 'node:path'

import { emitSuccessSignal } from '@/lib/obj11-observability'

export type TestType = 'manual' | 'auto'
export type DashboardStatus = 'passed' | 'failed' | 'never_executed'

export interface TestExecutionRecord {
  testType: TestType
  tagId: string | null
  testId: string | null
  objIds?: string[]
  status: DashboardStatus
  executedAt: string | null
  runId: string | null
  releaseId: string | null
  note: string | null
  evidencePath: string
  source: 'result_markdown' | 'result_json'
}

export interface TestExecutionEntry {
  key: string
  testId: string
  tagId: string | null
  objIds: string[]
  requirementId: string | null
  capabilityId: string
  capabilityName: string
  serviceFunctionId: string
  serviceFunctionName: string
  testType: TestType
  sourcePath: string
  status: DashboardStatus
  lastExecutedAt: string | null
  lastRunId: string | null
  lastReleaseId: string | null
  lastNote: string | null
  lastEvidencePath: string | null
  history: TestExecutionRecord[]
}

export interface DashboardSnapshot {
  id: string
  lastExecutedAt: string | null
  totalTests: number
  passed: number
  failed: number
  neverExecuted: number
  incomplete: boolean
  runCount: number
}

export interface TestExecutionDashboardData {
  generatedAt: string
  summary: {
    totalTests: number
    passed: number
    failed: number
    neverExecuted: number
    manualTests: number
    autoTests: number
  }
  filters: {
    objects: Array<{ id: string; name: string }>
    capabilities: Array<{ id: string; name: string }>
    serviceFunctions: Array<{ id: string; name: string }>
  }
  tests: TestExecutionEntry[]
  runSnapshots: DashboardSnapshot[]
  releaseSnapshots: DashboardSnapshot[]
  statusRules: string[]
  dataSources: string[]
}

interface CapabilityCatalogEntry {
  id: string
  name: string
}

interface ObjCatalogEntry {
  id: string
  name: string
}

interface ParsedTag {
  testType: TestType
  tagId: string
}

interface DraftExecutionEntry {
  key: string
  testId: string
  tagId: string | null
  objIds: string[]
  requirementId: string | null
  capabilityId: string
  capabilityName: string
  serviceFunctionId: string
  serviceFunctionName: string
  testType: TestType
  sourcePath: string
  history: TestExecutionRecord[]
}

export interface DashboardEntryFilters {
  objectId?: string | null
  capabilityId?: string | null
  serviceFunctionId?: string | null
  testType?: TestType | null
  status?: DashboardStatus | null
  requirementOrTestQuery?: string | null
}

const repoRoot = process.cwd()
const capabilitiesRoot = path.join(repoRoot, 'capabilities')
const capabilitiesIndexPath = path.join(capabilitiesRoot, 'INDEX.md')
const featuresIndexPath = path.join(repoRoot, 'features', 'INDEX.md')
const resultsRoot = path.join(repoRoot, 'tests', 'results')
const executionsRoot = path.join(repoRoot, 'tests', 'executions')

function toPosixPath(value: string): string {
  return value.split(path.sep).join('/')
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function cleanText(value: string): string {
  return value
    .replace(/`/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeIdentifier(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeDate(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00.000Z`).toISOString()
  }

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString()
}

function compareDatesDesc(left: string | null, right: string | null): number {
  const leftTs = left ? Date.parse(left) : Number.NEGATIVE_INFINITY
  const rightTs = right ? Date.parse(right) : Number.NEGATIVE_INFINITY

  if (leftTs === rightTs) {
    return 0
  }
  return rightTs - leftTs
}

function normalizeStatus(value: string | null | undefined): DashboardStatus | null {
  if (!value) {
    return null
  }

  const normalized = value.toLowerCase()
  if (
    normalized.includes('nicht bestanden') ||
    normalized.includes('failed') ||
    normalized.includes('fail') ||
    normalized.includes('error') ||
    normalized.includes('fehler')
  ) {
    return 'failed'
  }
  if (
    normalized.includes('bestanden') ||
    normalized.includes('passed') ||
    normalized.includes('success')
  ) {
    return 'passed'
  }
  if (normalized.includes('never executed') || normalized.includes('offen')) {
    return 'never_executed'
  }
  if (normalized.includes('nicht anwendbar') || normalized.includes('n/a')) {
    return 'failed'
  }

  return null
}

function parseTag(content: string): ParsedTag | null {
  const match = content.match(/`(itest|utest)~([a-z0-9-]+)(?:~result)?~\d+`/i)
  if (!match) {
    return null
  }

  return {
    testType: match[1].toLowerCase() === 'itest' ? 'manual' : 'auto',
    tagId: match[2].toLowerCase(),
  }
}

function parseFrontmatter(content: string): { meta: Record<string, string>; body: string } {
  if (!content.startsWith('---\n')) {
    return { meta: {}, body: content }
  }

  const endIndex = content.indexOf('\n---\n', 4)
  if (endIndex < 0) {
    return { meta: {}, body: content }
  }

  const raw = content.slice(4, endIndex)
  const meta: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.+)$/)
    if (!match) {
      continue
    }
    meta[match[1].toLowerCase()] = match[2].trim()
  }

  return {
    meta,
    body: content.slice(endIndex + 5),
  }
}

async function listFilesRecursive(root: string): Promise<string[]> {
  const files: string[] = []
  const stack = [root]

  while (stack.length > 0) {
    const currentPath = stack.pop()
    if (!currentPath) {
      continue
    }

    const entries = await fs.readdir(currentPath, { withFileTypes: true }).catch(() => [])
    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        continue
      }
      const fullPath = path.join(currentPath, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
      } else if (entry.isFile()) {
        files.push(fullPath)
      }
    }
  }

  files.sort((left, right) => left.localeCompare(right, 'de'))
  return files
}

async function loadCapabilityCatalog(): Promise<Map<string, CapabilityCatalogEntry>> {
  const catalog = new Map<string, CapabilityCatalogEntry>()
  const folders = await fs.readdir(capabilitiesRoot, { withFileTypes: true }).catch(() => [])

  for (const folder of folders) {
    if (!folder.isDirectory()) {
      continue
    }

    const slug = folder.name
    const readmePath = path.join(capabilitiesRoot, slug, 'README.md')
    const content = await fs.readFile(readmePath, 'utf8').catch(() => '')

    const id = content.match(/Capability ID:\*\*\s*(CAP-\d+)/i)?.[1] ?? slug.toUpperCase()
    const name =
      cleanText(content.match(/^#\s*Capability:\s*(.+)$/m)?.[1] ?? '') ||
      slugToTitle(slug)

    catalog.set(slug, { id, name })
  }

  return catalog
}

async function loadCapabilityToObjsMap(): Promise<Map<string, string[]>> {
  const mapping = new Map<string, string[]>()
  const content = await fs.readFile(capabilitiesIndexPath, 'utf8').catch(() => '')
  if (!content) {
    return mapping
  }

  const sectionMatch = content.match(
    /## Capability → Feature Mapping([\s\S]*?)(?:\n##\s+[^\n]+|$)/,
  )
  if (!sectionMatch) {
    return mapping
  }

  const lines = sectionMatch[1].split('\n')
  for (const line of lines) {
    if (!line.trim().startsWith('|')) {
      continue
    }
    if (line.includes('Capability |') || line.includes('---')) {
      continue
    }

    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0)
    if (cells.length < 2) {
      continue
    }

    const capabilityId = cells[0].match(/(CAP-\d+)/i)?.[1]?.toUpperCase()
    if (!capabilityId) {
      continue
    }

    const objIds = Array.from(
      new Set((cells[1].match(/OBJ-\d+/gi) ?? []).map((id) => id.toUpperCase())),
    )
    if (objIds.length > 0) {
      mapping.set(capabilityId, objIds)
    }
  }

  return mapping
}

async function loadObjCatalog(): Promise<Map<string, ObjCatalogEntry>> {
  const catalog = new Map<string, ObjCatalogEntry>()
  const content = await fs.readFile(featuresIndexPath, 'utf8').catch(() => '')
  if (!content) {
    return catalog
  }

  for (const line of content.split('\n')) {
    const rowMatch = line.match(/^\|\s*(OBJ-\d+)\s*\|\s*([^|]+)\s*\|/i)
    if (!rowMatch) {
      continue
    }

    const id = rowMatch[1].toUpperCase()
    const name = cleanText(rowMatch[2])
    catalog.set(id, { id, name })
  }

  return catalog
}

function parseRequirementId(content: string): string | null {
  const coversMatch = content.match(/Covers:\s*req~([a-z0-9-]+)~\d+/i)
  if (coversMatch) {
    return coversMatch[1].toUpperCase()
  }

  const requirementMatch = content.match(/\*\*Requirement:\*\*\s*\[([A-Za-z0-9-]+)\]/i)
  if (requirementMatch) {
    return requirementMatch[1].toUpperCase()
  }

  return null
}

function parseServiceFunctionIdentity(folderName: string): {
  serviceFunctionId: string
  serviceFunctionName: string
} {
  const idMatch = folderName.match(/^(SFN-[A-Z0-9-]+)/i)
  const serviceFunctionId = idMatch ? idMatch[1].toUpperCase() : folderName.toUpperCase()
  const serviceFunctionName = slugToTitle(
    folderName.replace(/^SFN-[A-Z0-9-]+-?/i, '') || folderName,
  )

  return { serviceFunctionId, serviceFunctionName }
}

function parseDefinitionEntry(
  absolutePath: string,
  content: string,
  capabilityCatalog: Map<string, CapabilityCatalogEntry>,
  capabilityToObjs: Map<string, string[]>,
): DraftExecutionEntry | null {
  const relativePath = toPosixPath(path.relative(repoRoot, absolutePath))
  if (!relativePath.includes('/tests/manual/') && !relativePath.includes('/tests/auto/')) {
    return null
  }

  const testType: TestType = relativePath.includes('/tests/manual/') ? 'manual' : 'auto'
  const testId =
    cleanText(content.match(/\*\*Testfall-ID:\*\*\s*([^\n]+)/i)?.[1] ?? '') ||
    path.basename(absolutePath, '.md')
  const tag = parseTag(content)
  const requirementId = parseRequirementId(content)

  const segments = relativePath.split('/')
  const capabilitySlug = segments[1] ?? 'unknown'
  const capabilityInfo = capabilityCatalog.get(capabilitySlug)
  const capabilityId = capabilityInfo?.id ?? capabilitySlug.toUpperCase()
  const capabilityName = capabilityInfo?.name ?? slugToTitle(capabilitySlug)
  const objIds = capabilityToObjs.get(capabilityId) ?? ['OBJ-UNASSIGNED']

  const serviceFunctionIndex = segments.indexOf('service-functions')
  const serviceFunctionFolder =
    serviceFunctionIndex >= 0 && serviceFunctionIndex + 1 < segments.length
      ? segments[serviceFunctionIndex + 1]
      : 'unknown'
  const { serviceFunctionId, serviceFunctionName } =
    parseServiceFunctionIdentity(serviceFunctionFolder)

  const identityPart = tag?.tagId ?? normalizeIdentifier(testId)
  return {
    key: `${testType}:${identityPart}`,
    testId,
    tagId: tag?.tagId ?? null,
    objIds,
    requirementId,
    capabilityId,
    capabilityName,
    serviceFunctionId,
    serviceFunctionName,
    testType,
    sourcePath: relativePath,
    history: [],
  }
}

function inferStatusFromMarkdownBody(body: string): DashboardStatus | null {
  const summaryMatch = body.match(/\*\*Gesamtbewertung:\*\*\s*([^\n]+)/i)
  const summaryStatus = normalizeStatus(summaryMatch?.[1] ?? null)
  if (summaryStatus) {
    return summaryStatus
  }

  if (/\-\s*\[x\]\s*Bestanden/i.test(body)) {
    return 'passed'
  }
  if (/\-\s*\[x\]\s*Nicht bestanden/i.test(body)) {
    return 'failed'
  }
  if (/\-\s*\[x\]\s*Nicht anwendbar/i.test(body)) {
    return 'failed'
  }

  const genericStatus = body.match(/\*\*Status:\*\*\s*([^\n]+)/i)
  return normalizeStatus(genericStatus?.[1] ?? null)
}

function inferDateFromMarkdownBody(body: string): string | null {
  const explicitDate = body.match(/\*\*Datum:\*\*\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i)?.[1]
  if (explicitDate) {
    return normalizeDate(explicitDate)
  }

  const headingDate = body.match(/^#\s*TEST-RESULT-[^–\n]+[–-]\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/im)?.[1]
  if (headingDate) {
    return normalizeDate(headingDate)
  }

  return null
}

function inferRunId(record: TestExecutionRecord): string {
  if (record.runId && record.runId.trim()) {
    return record.runId.trim()
  }

  if (record.executedAt) {
    return `RUN-${record.executedAt.slice(0, 10)}`
  }

  return 'RUN-UNASSIGNED'
}

function inferReleaseId(record: TestExecutionRecord): string {
  if (record.releaseId && record.releaseId.trim()) {
    return record.releaseId.trim()
  }

  return 'RELEASE-UNASSIGNED'
}

function inferTestTypeFromPath(absolutePath: string, fallback: TestType): TestType {
  const normalizedPath = toPosixPath(absolutePath).toLowerCase()
  if (normalizedPath.includes('/manual/')) {
    return 'manual'
  }
  if (normalizedPath.includes('/auto/')) {
    return 'auto'
  }

  return fallback
}

function inferTestTypeFromHints(
  absolutePath: string,
  hints: Array<string | null | undefined>,
  fallback: TestType,
): TestType {
  for (const hint of hints) {
    if (!hint) {
      continue
    }
    const normalizedHint = hint.toLowerCase()
    if (normalizedHint.includes('manual') || normalizedHint.includes('itest')) {
      return 'manual'
    }
    if (normalizedHint.includes('auto') || normalizedHint.includes('utest')) {
      return 'auto'
    }
  }

  return inferTestTypeFromPath(absolutePath, fallback)
}

function normalizeObjIds(
  values: unknown,
): string[] | null {
  const input = Array.isArray(values)
    ? values
    : typeof values === 'string'
      ? [values]
      : null

  if (!input) {
    return null
  }

  const normalized = Array.from(
    new Set(
      input
        .map((entry) => String(entry).trim().toUpperCase())
        .filter((entry) => /^OBJ-\d+$/.test(entry)),
    ),
  )

  return normalized.length > 0 ? normalized : null
}

function appendEvidenceIssue(
  note: string | null,
  issues: string[],
): string | null {
  if (issues.length === 0) {
    return note
  }

  const issueText = `Nachweis fehlerhaft: ${issues.join('; ')}`
  if (!note) {
    return issueText
  }

  return `${note}; ${issueText}`
}

function parseMarkdownEvidence(
  absolutePath: string,
  content: string,
): TestExecutionRecord[] {
  const evidencePath = toPosixPath(path.relative(repoRoot, absolutePath))
  const { meta, body } = parseFrontmatter(content)
  const tag = parseTag(body)
  const status =
    normalizeStatus(meta.status) ??
    normalizeStatus(meta.result) ??
    inferStatusFromMarkdownBody(body)

  const testId =
    cleanText(body.match(/\*\*Testfall-ID:\*\*\s*([^\n]+)/i)?.[1] ?? '') ||
    cleanText(body.match(/^#\s*(TEST-[A-Z0-9-]+)/im)?.[1] ?? '') ||
    null

  const runId =
    meta.run_id ??
    meta.run ??
    body.match(/(?:Run-ID|Run):\s*([A-Za-z0-9._-]+)/i)?.[1] ??
    null
  const releaseId =
    meta.release_id ??
    meta.release ??
    meta.version ??
    body.match(/(?:Release|Version):\s*([A-Za-z0-9._-]+)/i)?.[1] ??
    null
  const note =
    meta.note ??
    body.match(/(?:Fehlerhinweis|Hinweis):\s*([^\n]+)/i)?.[1] ??
    null

  const executedAt =
    normalizeDate(meta.executed_at) ??
    normalizeDate(meta.timestamp) ??
    normalizeDate(meta.date) ??
    normalizeDate(meta.datum) ??
    inferDateFromMarkdownBody(body)

  const issues: string[] = []
  if (!tag) {
    issues.push('fehlender OFT-Test-Tag (itest/utest)')
  }
  if (!status) {
    issues.push('fehlender oder ungueltiger Status')
  }
  if (!executedAt) {
    issues.push('zeitlich nicht auswertbar (fehlender/ungueltiger Zeitstempel)')
  }

  const testType = tag?.testType ?? inferTestTypeFromPath(absolutePath, 'manual')
  const resolvedStatus: DashboardStatus = issues.length > 0 ? 'failed' : status ?? 'failed'
  const resolvedNote = appendEvidenceIssue(note ? cleanText(note) : null, issues)

  return [
    {
      testType,
      tagId: tag?.tagId ?? null,
      testId,
      status: resolvedStatus,
      executedAt,
      runId,
      releaseId,
      note: resolvedNote,
      evidencePath,
      source: 'result_markdown',
    },
  ]
}

function parseJsonEvidence(absolutePath: string, content: string): TestExecutionRecord[] {
  const evidencePath = toPosixPath(path.relative(repoRoot, absolutePath))
  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    return [
      {
        testType: inferTestTypeFromPath(absolutePath, 'auto'),
        tagId: null,
        testId: null,
        status: 'failed',
        executedAt: null,
        runId: null,
        releaseId: null,
        note: 'Nachweis fehlerhaft: JSON nicht parsebar',
        evidencePath,
        source: 'result_json',
      },
    ]
  }

  const records: Record<string, unknown>[] = []
  if (Array.isArray(parsed)) {
    for (const entry of parsed) {
      if (entry && typeof entry === 'object') {
        records.push(entry as Record<string, unknown>)
      }
    }
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    const embedded =
      (Array.isArray(obj.records) ? obj.records : null) ??
      (Array.isArray(obj.results) ? obj.results : null) ??
      (Array.isArray(obj.executions) ? obj.executions : null) ??
      (Array.isArray(obj.tests) ? obj.tests : null)

    if (embedded) {
      for (const entry of embedded) {
        if (entry && typeof entry === 'object') {
          records.push(entry as Record<string, unknown>)
        }
      }
    } else {
      records.push(obj)
    }
  }

  const normalizedRecords: TestExecutionRecord[] = []
  for (const record of records) {
    const rawType = String(record.testType ?? record.type ?? '').toLowerCase()
    const tagFromField =
      typeof record.tagId === 'string'
        ? record.tagId
        : typeof record.oftTag === 'string'
          ? record.oftTag
          : ''
    const tag = parseTag(`\`${tagFromField}\``)
    const testType: TestType | null =
      rawType === 'manual' || rawType === 'auto' ? rawType : tag?.testType ?? null
    const rawStatus = String(record.status ?? record.result ?? record.outcome ?? '')
    const status = normalizeStatus(rawStatus)
    const testId =
      typeof record.testId === 'string'
        ? record.testId
        : typeof record.id === 'string'
          ? record.id
          : typeof record.name === 'string'
            ? record.name
            : null
    const rawTimestamp = String(record.executedAt ?? record.timestamp ?? record.date ?? '')
    const executedAt = normalizeDate(rawTimestamp)
    const runId =
      typeof record.runId === 'string'
        ? record.runId
        : typeof record.run === 'string'
          ? record.run
          : null
    const releaseId =
      typeof record.releaseId === 'string'
        ? record.releaseId
        : typeof record.release === 'string'
          ? record.release
          : typeof record.version === 'string'
            ? record.version
            : null
    const note =
      typeof record.note === 'string'
        ? record.note
        : typeof record.message === 'string'
          ? record.message
        : typeof record.error === 'string'
          ? record.error
          : null
    const objIds =
      normalizeObjIds(record.objIds) ??
      normalizeObjIds(record.objId) ??
      normalizeObjIds(record.objectIds) ??
      undefined

    const issues: string[] = []
    if (!testType) {
      issues.push('fehlender oder ungueltiger Testtyp')
    }
    if (!status) {
      issues.push('fehlender oder ungueltiger Status')
    }
    if (!executedAt) {
      issues.push('zeitlich nicht auswertbar (fehlender/ungueltiger Zeitstempel)')
    }
    if (!tag && !testId) {
      issues.push('fehlende Test-ID/OFT-Referenz')
    }

    const resolvedTestType =
      testType ??
      inferTestTypeFromHints(
        absolutePath,
        [testId, tagFromField],
        'auto',
      )
    const resolvedStatus: DashboardStatus = issues.length > 0 ? 'failed' : status ?? 'failed'
    const resolvedNote = appendEvidenceIssue(note ? cleanText(note) : null, issues)

    normalizedRecords.push({
      testType: resolvedTestType,
      tagId: tag?.tagId ?? null,
      testId: testId ? cleanText(testId) : null,
      objIds,
      status: resolvedStatus,
      executedAt,
      runId,
      releaseId,
      note: resolvedNote,
      evidencePath,
      source: 'result_json',
    })
  }

  return normalizedRecords
}

export function resolveLatestRecord(
  history: TestExecutionRecord[],
): TestExecutionRecord | null {
  if (history.length === 0) {
    return null
  }

  const sortedHistory = [...history].sort((left, right) =>
    compareDatesDesc(left.executedAt, right.executedAt),
  )
  const latestWithValidTimestamp =
    sortedHistory.find((record) => record.executedAt !== null) ?? null
  const latestUndatedFailure =
    sortedHistory.find(
      (record) => record.executedAt === null && record.status === 'failed',
    ) ?? null

  return latestWithValidTimestamp ?? latestUndatedFailure ?? null
}

export function filterDashboardEntries(
  entries: TestExecutionEntry[],
  filters: DashboardEntryFilters,
): TestExecutionEntry[] {
  const requirementQuery = filters.requirementOrTestQuery?.trim().toLowerCase() ?? ''

  return entries.filter((entry) => {
    if (filters.objectId && !entry.objIds.includes(filters.objectId)) {
      return false
    }
    if (filters.capabilityId && entry.capabilityId !== filters.capabilityId) {
      return false
    }
    if (
      filters.serviceFunctionId &&
      entry.serviceFunctionId !== filters.serviceFunctionId
    ) {
      return false
    }
    if (filters.testType && entry.testType !== filters.testType) {
      return false
    }
    if (filters.status && entry.status !== filters.status) {
      return false
    }
    if (!requirementQuery) {
      return true
    }

    const requirement = entry.requirementId?.toLowerCase() ?? ''
    return (
      requirement.includes(requirementQuery) ||
      entry.testId.toLowerCase().includes(requirementQuery)
    )
  })
}

async function loadEvidenceRecords(): Promise<TestExecutionRecord[]> {
  const evidenceFiles = new Set<string>()
  for (const root of [resultsRoot, executionsRoot]) {
    const files = await listFilesRecursive(root).catch(() => [])
    for (const filePath of files) {
      if (!filePath.endsWith('.md') && !filePath.endsWith('.json')) {
        continue
      }
      evidenceFiles.add(filePath)
    }
  }

  const records: TestExecutionRecord[] = []
  for (const filePath of evidenceFiles) {
    const content = await fs.readFile(filePath, 'utf8').catch(() => '')
    if (!content) {
      continue
    }

    if (filePath.endsWith('.md')) {
      records.push(...parseMarkdownEvidence(filePath, content))
      continue
    }

    records.push(...parseJsonEvidence(filePath, content))
  }

  return records
}

function buildRunSnapshots(entries: TestExecutionEntry[], totalTests: number): DashboardSnapshot[] {
  const byRun = new Map<string, Array<{ testKey: string; record: TestExecutionRecord }>>()

  for (const entry of entries) {
    for (const record of entry.history) {
      if (!record.executedAt) {
        continue
      }
      const runId = inferRunId(record)
      const list = byRun.get(runId) ?? []
      list.push({ testKey: entry.key, record })
      byRun.set(runId, list)
    }
  }

  const snapshots: DashboardSnapshot[] = []
  for (const [runId, records] of byRun) {
    const latestByTest = new Map<string, TestExecutionRecord>()
    for (const item of records) {
      const existing = latestByTest.get(item.testKey)
      if (!existing || compareDatesDesc(item.record.executedAt, existing.executedAt) < 0) {
        latestByTest.set(item.testKey, item.record)
      }
    }

    let passed = 0
    let failed = 0
    let lastExecutedAt: string | null = null

    for (const record of latestByTest.values()) {
      if (record.status === 'passed') {
        passed += 1
      } else if (record.status === 'failed') {
        failed += 1
      }

      if (compareDatesDesc(record.executedAt, lastExecutedAt) < 0) {
        lastExecutedAt = record.executedAt
      }
    }

    const executedTests = latestByTest.size
    const neverExecuted = Math.max(totalTests - executedTests, 0)
    snapshots.push({
      id: runId,
      lastExecutedAt,
      totalTests,
      passed,
      failed,
      neverExecuted,
      incomplete: neverExecuted > 0,
      runCount: 1,
    })
  }

  snapshots.sort((left, right) => {
    const dateCompare = compareDatesDesc(left.lastExecutedAt, right.lastExecutedAt)
    if (dateCompare !== 0) {
      return dateCompare
    }
    return left.id.localeCompare(right.id, 'de')
  })

  if (snapshots.length === 0) {
    snapshots.push({
      id: 'RUN-UNASSIGNED',
      lastExecutedAt: null,
      totalTests,
      passed: 0,
      failed: 0,
      neverExecuted: totalTests,
      incomplete: totalTests > 0,
      runCount: 0,
    })
  }

  return snapshots
}

function buildReleaseSnapshots(entries: TestExecutionEntry[], totalTests: number): DashboardSnapshot[] {
  const byRelease = new Map<string, Array<{ testKey: string; record: TestExecutionRecord }>>()

  for (const entry of entries) {
    for (const record of entry.history) {
      if (!record.executedAt) {
        continue
      }
      const releaseId = inferReleaseId(record)
      const list = byRelease.get(releaseId) ?? []
      list.push({ testKey: entry.key, record })
      byRelease.set(releaseId, list)
    }
  }

  const snapshots: DashboardSnapshot[] = []
  for (const [releaseId, records] of byRelease) {
    const latestByTest = new Map<string, TestExecutionRecord>()
    const runIds = new Set<string>()

    for (const item of records) {
      runIds.add(inferRunId(item.record))
      const existing = latestByTest.get(item.testKey)
      if (!existing || compareDatesDesc(item.record.executedAt, existing.executedAt) < 0) {
        latestByTest.set(item.testKey, item.record)
      }
    }

    let passed = 0
    let failed = 0
    let lastExecutedAt: string | null = null

    for (const record of latestByTest.values()) {
      if (record.status === 'passed') {
        passed += 1
      } else if (record.status === 'failed') {
        failed += 1
      }

      if (compareDatesDesc(record.executedAt, lastExecutedAt) < 0) {
        lastExecutedAt = record.executedAt
      }
    }

    const executedTests = latestByTest.size
    const neverExecuted = Math.max(totalTests - executedTests, 0)
    snapshots.push({
      id: releaseId,
      lastExecutedAt,
      totalTests,
      passed,
      failed,
      neverExecuted,
      incomplete: neverExecuted > 0 || releaseId === 'RELEASE-UNASSIGNED',
      runCount: runIds.size,
    })
  }

  snapshots.sort((left, right) => {
    const dateCompare = compareDatesDesc(left.lastExecutedAt, right.lastExecutedAt)
    if (dateCompare !== 0) {
      return dateCompare
    }
    return left.id.localeCompare(right.id, 'de')
  })

  if (snapshots.length === 0) {
    snapshots.push({
      id: 'RELEASE-UNASSIGNED',
      lastExecutedAt: null,
      totalTests,
      passed: 0,
      failed: 0,
      neverExecuted: totalTests,
      incomplete: totalTests > 0,
      runCount: 0,
    })
  }

  return snapshots
}

export async function loadTestExecutionDashboardData(): Promise<TestExecutionDashboardData> {
  const capabilityCatalog = await loadCapabilityCatalog()
  const capabilityToObjs = await loadCapabilityToObjsMap()
  const objCatalog = await loadObjCatalog()
  const capabilityFiles = await listFilesRecursive(capabilitiesRoot)
  const definitionEntries: DraftExecutionEntry[] = []

  for (const filePath of capabilityFiles) {
    if (!filePath.endsWith('.md')) {
      continue
    }
    if (!filePath.includes(`${path.sep}tests${path.sep}`)) {
      continue
    }

    const content = await fs.readFile(filePath, 'utf8').catch(() => '')
    if (!content) {
      continue
    }

    const parsed = parseDefinitionEntry(
      filePath,
      content,
      capabilityCatalog,
      capabilityToObjs,
    )
    if (parsed) {
      definitionEntries.push(parsed)
    }
  }

  const byTag = new Map<string, DraftExecutionEntry>()
  const byId = new Map<string, DraftExecutionEntry>()
  for (const entry of definitionEntries) {
    if (entry.tagId) {
      byTag.set(`${entry.testType}:${entry.tagId}`, entry)
    }
    byId.set(`${entry.testType}:${normalizeIdentifier(entry.testId)}`, entry)
  }

  const evidenceRecords = await loadEvidenceRecords()
  let orphanCounter = 1

  for (const record of evidenceRecords) {
    const matchedByTag = record.tagId
      ? byTag.get(`${record.testType}:${record.tagId}`)
      : null

    const matchedById = record.testId
      ? byId.get(`${record.testType}:${normalizeIdentifier(record.testId)}`) ?? null
      : null

    const matched = matchedByTag ?? matchedById

    if (matched) {
      matched.history.push(record)
      continue
    }

    const orphanId = orphanCounter
    const orphanKey = `${record.testType}:orphan-${orphanId}`
    orphanCounter += 1
    const orphanObjIds = normalizeObjIds(record.objIds) ?? ['OBJ-UNASSIGNED']
    definitionEntries.push({
      key: orphanKey,
      testId: `ORPHAN-${orphanId}`,
      tagId: null,
      objIds: orphanObjIds,
      requirementId: null,
      capabilityId: 'CAP-UNBEKANNT',
      capabilityName: 'Unbekannt',
      serviceFunctionId: 'SFN-UNBEKANNT',
      serviceFunctionName: 'Unbekannt',
      testType: record.testType,
      sourcePath: record.evidencePath,
      history: [record],
    })
  }

  const tests: TestExecutionEntry[] = definitionEntries.map((entry) => {
    entry.history.sort((left, right) => compareDatesDesc(left.executedAt, right.executedAt))
    const latest = resolveLatestRecord(entry.history)

    return {
      ...entry,
      status: latest ? latest.status : 'never_executed',
      lastExecutedAt: latest?.executedAt ?? null,
      lastRunId: latest?.runId ?? null,
      lastReleaseId: latest?.releaseId ?? null,
      lastNote: latest?.note ?? null,
      lastEvidencePath: latest?.evidencePath ?? null,
    }
  })

  const statusPriority: Record<DashboardStatus, number> = {
    failed: 0,
    never_executed: 1,
    passed: 2,
  }

  tests.sort((left, right) => {
    const statusDiff = statusPriority[left.status] - statusPriority[right.status]
    if (statusDiff !== 0) {
      return statusDiff
    }

    const capabilityDiff = left.capabilityId.localeCompare(right.capabilityId, 'de')
    if (capabilityDiff !== 0) {
      return capabilityDiff
    }

    const sfnDiff = left.serviceFunctionId.localeCompare(right.serviceFunctionId, 'de')
    if (sfnDiff !== 0) {
      return sfnDiff
    }

    return left.testId.localeCompare(right.testId, 'de')
  })

  let passed = 0
  let failed = 0
  let neverExecuted = 0
  let manualTests = 0
  let autoTests = 0

  for (const test of tests) {
    if (test.status === 'passed') {
      passed += 1
    } else if (test.status === 'failed') {
      failed += 1
    } else {
      neverExecuted += 1
    }

    if (test.testType === 'manual') {
      manualTests += 1
    } else {
      autoTests += 1
    }
  }

  const capabilities = Array.from(
    new Map(tests.map((test) => [test.capabilityId, { id: test.capabilityId, name: test.capabilityName }])).values(),
  ).sort((left, right) => left.id.localeCompare(right.id, 'de'))

  const serviceFunctions = Array.from(
    new Map(
      tests.map((test) => [
        test.serviceFunctionId,
        { id: test.serviceFunctionId, name: test.serviceFunctionName },
      ]),
    ).values(),
  ).sort((left, right) => left.id.localeCompare(right.id, 'de'))

  const objects = Array.from(
    new Map(
      tests
        .flatMap((test) => test.objIds)
        .map((objId) => [
          objId,
          {
            id: objId,
            name: objCatalog.get(objId)?.name ?? 'Unzugeordnet',
          },
        ]),
    ).values(),
  ).sort((left, right) => left.id.localeCompare(right.id, 'de'))

  const data = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalTests: tests.length,
      passed,
      failed,
      neverExecuted,
      manualTests,
      autoTests,
    },
    filters: {
      objects,
      capabilities,
      serviceFunctions,
    },
    tests,
    runSnapshots: buildRunSnapshots(tests, tests.length),
    releaseSnapshots: buildReleaseSnapshots(tests, tests.length),
    statusRules: [
      'Never Executed: kein gueltiger Ausfuehrungsnachweis vorhanden.',
      'Passed: letzter gueltiger Nachweis ist erfolgreich.',
      'Failed: letzter gueltiger Nachweis ist fehlgeschlagen oder fehlerhaft.',
      'Zeitstempel-Regel: Nachweise ohne gueltigen Zeitstempel gelten nicht als gueltiger letzter Nachweis.',
    ],
    dataSources: [
      'capabilities/**/tests/manual/*.md',
      'capabilities/**/tests/auto/*.md',
      'tests/results/**/*.md',
      'tests/results/**/*.json',
      'tests/executions/**/*.json',
    ],
  }

  await emitSuccessSignal({
    name: 'dns.test_execution_dashboard.loaded',
    operation: 'dashboard.load',
    route: '/api/test-execution-dashboard',
    statusCode: 200,
    attributes: {
      test_count: data.summary.totalTests,
      passed_count: data.summary.passed,
      failed_count: data.summary.failed,
      never_executed_count: data.summary.neverExecuted,
    },
  })

  return data
}

export const testExecutionDashboardInternals = {
  normalizeStatus,
  parseJsonEvidence,
}
