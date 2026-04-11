import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import { promisify } from 'node:util'

import { z } from 'zod'

const execFileAsync = promisify(execFile)

export type Obj24BaselineStatus = 'never_loaded' | 'loaded' | 'error'
export type Obj24HistoryChangeType = 'baseline_load' | 'manual_update' | 'rollback'
export type Obj24HistoryResult = 'applied' | 'rejected'

export interface Obj24BaselineState {
  status: Obj24BaselineStatus
  repoUrl: string | null
  ref: string | null
  commitSha: string | null
  baselineFile: string | null
  loadedAt: string | null
  sourceRef: string | null
  lastError: string | null
}

export interface Obj24CurrentSnapshot {
  snapshot: unknown
  updatedAt: string
  sourceCommit: string | null
  sourceRef: string | null
}

export interface Obj24DiffEntry {
  path: string
  changeType: 'added' | 'removed' | 'changed'
  beforeValue: unknown
  afterValue: unknown
}

export interface Obj24HistoryEntry {
  id: string
  timestamp: string
  actor: string
  changeType: Obj24HistoryChangeType
  affectedScope: string[]
  summary: string
  before: unknown
  after: unknown
  diff: Obj24DiffEntry[]
  rollbackOf: string | null
  sourceCommit: string | null
  sourceRef: string | null
  result: Obj24HistoryResult
}

export interface Obj24BaselineStatusView {
  baseline: Obj24BaselineState
  initialStateMessage: string
  currentSnapshotAvailable: boolean
  latestHistoryEntry: Obj24HistoryEntry | null
}

export interface Obj24HistoryFilters {
  actor?: string | null
  changeType?: Obj24HistoryChangeType | null
  scope?: string | null
  from?: string | null
  to?: string | null
  limit?: number | null
}

export const obj24BaselineLoadSchema = z.object({
  repoUrl: z.string().min(1),
  ref: z.string().min(1).default('main'),
  baselineFile: z.string().min(1).default('baseline/dns-config.json'),
  actor: z.string().min(1).optional(),
  summary: z.string().min(1).max(400).optional(),
})

export const obj24HistoryCreateSchema = z.object({
  actor: z.string().min(1).optional(),
  summary: z.string().min(1).max(400),
  affectedScope: z.array(z.string().min(1)).optional(),
  after: z.unknown(),
  sourceCommit: z.string().min(1).optional(),
  sourceRef: z.string().min(1).optional(),
})

export const obj24HistoryRollbackSchema = z.object({
  actor: z.string().min(1).optional(),
  summary: z.string().min(1).max(400).optional(),
})

export class Obj24DomainError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

const DEFAULT_BASELINE_DIR = path.join(process.cwd(), 'artifacts', 'baseline')
const STATE_FILE = 'state.json'
const CURRENT_FILE = 'current-config.json'
const HISTORY_FILE = 'history.ndjson'
const MAX_GIT_OUTPUT_BUFFER = 10 * 1024 * 1024
const DEFAULT_HISTORY_LIMIT = 200
const MAX_HISTORY_LIMIT = 1000

function resolveObj24StorageDir(): string {
  const configured = process.env.OBJ24_BASELINE_DIR?.trim()
  if (!configured) {
    return DEFAULT_BASELINE_DIR
  }

  return path.isAbsolute(configured)
    ? configured
    : path.join(process.cwd(), configured)
}

function getStatePath(): string {
  return path.join(resolveObj24StorageDir(), STATE_FILE)
}

function getCurrentPath(): string {
  return path.join(resolveObj24StorageDir(), CURRENT_FILE)
}

function getHistoryPath(): string {
  return path.join(resolveObj24StorageDir(), HISTORY_FILE)
}

function createInitialBaselineState(): Obj24BaselineState {
  return {
    status: 'never_loaded',
    repoUrl: null,
    ref: null,
    commitSha: null,
    baselineFile: null,
    loadedAt: null,
    sourceRef: null,
    lastError: null,
  }
}

async function ensureStorageDir(): Promise<void> {
  await fs.mkdir(resolveObj24StorageDir(), { recursive: true })
}

async function readJsonFile<TValue>(filePath: string): Promise<TValue | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as TValue
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }
    throw error
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await ensureStorageDir()
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function sanitizeBaselineFilePath(baselineFile: string): string {
  const normalized = path.posix.normalize(baselineFile.replace(/\\/g, '/'))

  if (
    normalized.length === 0 ||
    normalized === '.' ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    path.posix.isAbsolute(normalized)
  ) {
    throw new Obj24DomainError(
      422,
      'INVALID_BASELINE_FILE_PATH',
      'baselineFile muss ein relativer Pfad innerhalb des Repositorys sein.',
    )
  }

  return normalized
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeActor(actor: string | undefined): string {
  const normalized = actor?.trim()
  if (!normalized) {
    return 'system/anonymous'
  }
  return normalized
}

function formatDiffPath(basePath: string, child: string): string {
  if (!basePath) {
    return child
  }
  return `${basePath}.${child}`
}

function buildDiffEntries(
  beforeValue: unknown,
  afterValue: unknown,
  currentPath = '$',
): Obj24DiffEntry[] {
  if (isDeepStrictEqual(beforeValue, afterValue)) {
    return []
  }

  if (Array.isArray(beforeValue) && Array.isArray(afterValue)) {
    const maxLength = Math.max(beforeValue.length, afterValue.length)
    const entries: Obj24DiffEntry[] = []

    for (let index = 0; index < maxLength; index += 1) {
      const nextPath = `${currentPath}[${index}]`
      const beforeEntry = beforeValue[index]
      const afterEntry = afterValue[index]
      if (index >= beforeValue.length) {
        entries.push({
          path: nextPath,
          changeType: 'added',
          beforeValue: null,
          afterValue: afterEntry,
        })
      } else if (index >= afterValue.length) {
        entries.push({
          path: nextPath,
          changeType: 'removed',
          beforeValue: beforeEntry,
          afterValue: null,
        })
      } else {
        entries.push(...buildDiffEntries(beforeEntry, afterEntry, nextPath))
      }
    }

    return entries
  }

  if (isPlainObject(beforeValue) && isPlainObject(afterValue)) {
    const keys = new Set([...Object.keys(beforeValue), ...Object.keys(afterValue)])
    const entries: Obj24DiffEntry[] = []

    for (const key of [...keys].sort()) {
      const hasBefore = Object.prototype.hasOwnProperty.call(beforeValue, key)
      const hasAfter = Object.prototype.hasOwnProperty.call(afterValue, key)
      const nextPath = formatDiffPath(currentPath, key)

      if (!hasBefore && hasAfter) {
        entries.push({
          path: nextPath,
          changeType: 'added',
          beforeValue: null,
          afterValue: afterValue[key],
        })
      } else if (hasBefore && !hasAfter) {
        entries.push({
          path: nextPath,
          changeType: 'removed',
          beforeValue: beforeValue[key],
          afterValue: null,
        })
      } else {
        entries.push(
          ...buildDiffEntries(beforeValue[key], afterValue[key], nextPath),
        )
      }
    }

    return entries
  }

  return [
    {
      path: currentPath,
      changeType:
        beforeValue === undefined
          ? 'added'
          : afterValue === undefined
            ? 'removed'
            : 'changed',
      beforeValue: beforeValue ?? null,
      afterValue: afterValue ?? null,
    },
  ]
}

function deriveAffectedScope(diff: Obj24DiffEntry[]): string[] {
  const scope = new Set<string>()
  for (const entry of diff) {
    const pathWithoutRoot = entry.path.startsWith('$.')
      ? entry.path.slice(2)
      : entry.path === '$'
        ? ''
        : entry.path.replace(/^\$/, '')
    const topLevel = pathWithoutRoot.split(/[.[\]]/).find((segment) => segment.length > 0)
    if (topLevel) {
      scope.add(topLevel)
    }
  }

  if (scope.size === 0) {
    scope.add('baseline')
  }

  return [...scope]
}

function normalizeHistoryLine(line: string): Obj24HistoryEntry | null {
  const trimmed = line.trim()
  if (!trimmed) {
    return null
  }

  const parsed = JSON.parse(trimmed) as Obj24HistoryEntry
  if (!parsed.id || !parsed.timestamp) {
    return null
  }

  return parsed
}

async function appendHistoryEntry(entry: Obj24HistoryEntry): Promise<void> {
  await ensureStorageDir()
  await fs.appendFile(getHistoryPath(), `${JSON.stringify(entry)}\n`, 'utf8')
}

async function readHistoryEntries(): Promise<Obj24HistoryEntry[]> {
  await ensureStorageDir()
  let raw = ''
  try {
    raw = await fs.readFile(getHistoryPath(), 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }

  const entries: Obj24HistoryEntry[] = []
  for (const line of raw.split('\n')) {
    if (!line.trim()) {
      continue
    }
    const parsed = normalizeHistoryLine(line)
    if (parsed) {
      entries.push(parsed)
    }
  }

  return entries
}

async function readCurrentSnapshot(): Promise<Obj24CurrentSnapshot | null> {
  return readJsonFile<Obj24CurrentSnapshot>(getCurrentPath())
}

async function writeCurrentSnapshot(snapshot: Obj24CurrentSnapshot): Promise<void> {
  await writeJsonFile(getCurrentPath(), snapshot)
}

async function readBaselineState(): Promise<Obj24BaselineState> {
  const existing = await readJsonFile<Obj24BaselineState>(getStatePath())
  if (!existing) {
    return createInitialBaselineState()
  }

  return {
    ...createInitialBaselineState(),
    ...existing,
  }
}

async function writeBaselineState(state: Obj24BaselineState): Promise<void> {
  await writeJsonFile(getStatePath(), state)
}

async function runGitCommand(args: string[], cwd?: string): Promise<string> {
  try {
    const result = await execFileAsync('git', args, {
      cwd,
      maxBuffer: MAX_GIT_OUTPUT_BUFFER,
    })
    return result.stdout.trim()
  } catch (error) {
    const stderr = String((error as { stderr?: string }).stderr || '').trim()
    const message = stderr || (error as Error).message
    throw new Obj24DomainError(
      503,
      'BASELINE_REPOSITORY_UNREACHABLE',
      `Git-Zugriff fehlgeschlagen: ${message}`,
    )
  }
}

function resolveLocalRepositoryPath(repoUrl: string): string | null {
  const trimmed = repoUrl.trim()

  if (trimmed.startsWith('file://')) {
    return path.resolve(new URL(trimmed).pathname)
  }

  const isRemote =
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('ssh://') ||
    trimmed.startsWith('git@')
  if (isRemote) {
    return null
  }

  return path.isAbsolute(trimmed) ? trimmed : path.join(process.cwd(), trimmed)
}

function ensureJsonConfig(value: unknown): unknown {
  if (!Array.isArray(value) && !isPlainObject(value)) {
    throw new Obj24DomainError(
      422,
      'INVALID_BASELINE_CONFIG',
      'Baseline-Konfiguration muss ein JSON-Objekt oder JSON-Array sein.',
    )
  }

  return value
}

function validateDnsConfigStructure(value: unknown): void {
  if (!isPlainObject(value) && !Array.isArray(value)) {
    throw new Obj24DomainError(
      422,
      'INVALID_DNS_CONFIG',
      'DNS-Konfiguration muss ein JSON-Objekt oder JSON-Array sein.',
    )
  }

  if (isPlainObject(value)) {
    const record = value as Record<string, unknown>
    const knownTopLevelKeys = [
      'participants',
      'zones',
      'records',
      'nameservers',
      'tsigKeys',
      'forwarders',
      'acls',
      'options',
      'version',
      'metadata',
    ]
    const keys = Object.keys(record)
    if (keys.length === 0) {
      throw new Obj24DomainError(
        422,
        'INVALID_DNS_CONFIG',
        'DNS-Konfiguration darf nicht leer sein.',
      )
    }

    const hasKnownKey = keys.some((key) => knownTopLevelKeys.includes(key))
    if (!hasKnownKey) {
      throw new Obj24DomainError(
        422,
        'INVALID_DNS_CONFIG',
        `DNS-Konfiguration enthaelt keine bekannten Schluessel. Erwartet: mindestens einer von ${knownTopLevelKeys.join(', ')}.`,
      )
    }

    for (const key of keys) {
      if (typeof record[key] === 'string' && typeof key === 'string') {
        continue
      }
    }
  }
}

async function loadBaselineFromRemoteRepository(input: {
  repoUrl: string
  ref: string
  baselineFile: string
}): Promise<{ snapshot: unknown; commitSha: string }> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obj24-baseline-'))

  try {
    await runGitCommand(
      ['clone', '--depth', '1', '--branch', input.ref, '--single-branch', input.repoUrl, tempDir],
      process.cwd(),
    )

    const commitSha = await runGitCommand(['rev-parse', 'HEAD'], tempDir)
    const filePath = path.join(tempDir, input.baselineFile)
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = ensureJsonConfig(JSON.parse(raw))

    return {
      snapshot: parsed,
      commitSha,
    }
  } catch (error) {
    if (error instanceof Obj24DomainError) {
      throw error
    }

    if (error instanceof SyntaxError) {
      throw new Obj24DomainError(
        422,
        'INVALID_BASELINE_CONFIG',
        'Die geladene Baseline-Datei ist kein gueltiges JSON.',
      )
    }

    throw new Obj24DomainError(
      422,
      'BASELINE_LOAD_FAILED',
      `Baseline konnte nicht geladen werden: ${(error as Error).message}`,
    )
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

async function loadBaselineFromLocalRepository(input: {
  repoPath: string
  ref: string
  baselineFile: string
}): Promise<{ snapshot: unknown; commitSha: string }> {
  try {
    await fs.access(input.repoPath)
  } catch {
    throw new Obj24DomainError(
      404,
      'BASELINE_REPOSITORY_NOT_FOUND',
      `Lokales Repository wurde nicht gefunden: ${input.repoPath}`,
    )
  }

  const commitSha = await runGitCommand(['rev-parse', input.ref], input.repoPath)
  const fileContent = await runGitCommand(
    ['show', `${input.ref}:${input.baselineFile}`],
    input.repoPath,
  )

  try {
    const parsed = ensureJsonConfig(JSON.parse(fileContent))
    return {
      snapshot: parsed,
      commitSha,
    }
  } catch (error) {
    if (error instanceof Obj24DomainError) {
      throw error
    }

    throw new Obj24DomainError(
      422,
      'INVALID_BASELINE_CONFIG',
      'Die Baseline-Datei ist kein gueltiges JSON oder fehlt im angegebenen Ref.',
    )
  }
}

function nowIso(): string {
  return new Date().toISOString()
}

function createHistoryId(): string {
  return `chg-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`
}

function filterHistoryEntries(
  entries: Obj24HistoryEntry[],
  filters?: Obj24HistoryFilters,
): Obj24HistoryEntry[] {
  const actorFilter = filters?.actor?.trim().toLowerCase() || null
  const scopeFilter = filters?.scope?.trim().toLowerCase() || null
  const typeFilter = filters?.changeType || null
  const fromTs = filters?.from ? Date.parse(filters.from) : Number.NEGATIVE_INFINITY
  const toTs = filters?.to ? Date.parse(filters.to) : Number.POSITIVE_INFINITY
  const limit = Math.min(
    Math.max(filters?.limit ?? DEFAULT_HISTORY_LIMIT, 1),
    MAX_HISTORY_LIMIT,
  )

  const filtered = entries.filter((entry) => {
    if (actorFilter && !entry.actor.toLowerCase().includes(actorFilter)) {
      return false
    }

    if (typeFilter && entry.changeType !== typeFilter) {
      return false
    }

    if (
      scopeFilter &&
      !entry.affectedScope.some((scope) => scope.toLowerCase().includes(scopeFilter))
    ) {
      return false
    }

    const ts = Date.parse(entry.timestamp)
    if (!Number.isFinite(ts) || ts < fromTs || ts > toTs) {
      return false
    }

    return true
  })

  return filtered
    .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp))
    .slice(0, limit)
}

export async function getObj24BaselineStatusView(): Promise<Obj24BaselineStatusView> {
  const [baseline, history, snapshot] = await Promise.all([
    readBaselineState(),
    readHistoryEntries(),
    readCurrentSnapshot(),
  ])

  const latestHistoryEntry = history.length > 0 ? history[history.length - 1] : null

  return {
    baseline,
    initialStateMessage:
      baseline.status === 'never_loaded'
        ? 'Keine Baseline geladen'
        : baseline.status === 'error'
          ? 'Baseline-Laden fehlgeschlagen'
          : 'Baseline geladen',
    currentSnapshotAvailable: snapshot !== null,
    latestHistoryEntry,
  }
}

export async function loadObj24BaselineFromRepository(
  input: z.infer<typeof obj24BaselineLoadSchema>,
): Promise<{
  baseline: Obj24BaselineState
  historyEntry: Obj24HistoryEntry
}> {
  const parsedInput = obj24BaselineLoadSchema.parse(input)
  const baselineFile = sanitizeBaselineFilePath(parsedInput.baselineFile)
  const localRepoPath = resolveLocalRepositoryPath(parsedInput.repoUrl)

  const [baselineState, currentSnapshot] = await Promise.all([
    readBaselineState(),
    readCurrentSnapshot(),
  ])
  const beforeSnapshot = currentSnapshot?.snapshot ?? null

  try {
    const loaded = localRepoPath
      ? await loadBaselineFromLocalRepository({
          repoPath: localRepoPath,
          ref: parsedInput.ref,
          baselineFile,
        })
      : await loadBaselineFromRemoteRepository({
          repoUrl: parsedInput.repoUrl,
          ref: parsedInput.ref,
          baselineFile,
        })

    const timestamp = nowIso()
    const afterSnapshot = loaded.snapshot
    const diff = buildDiffEntries(beforeSnapshot, afterSnapshot)
    const entry: Obj24HistoryEntry = {
      id: createHistoryId(),
      timestamp,
      actor: normalizeActor(parsedInput.actor),
      changeType: 'baseline_load',
      affectedScope: deriveAffectedScope(diff),
      summary:
        parsedInput.summary ??
        `Baseline aus ${parsedInput.repoUrl}@${parsedInput.ref} geladen.`,
      before: beforeSnapshot,
      after: afterSnapshot,
      diff,
      rollbackOf: null,
      sourceCommit: loaded.commitSha,
      sourceRef: parsedInput.ref,
      result: 'applied',
    }

    const nextState: Obj24BaselineState = {
      status: 'loaded',
      repoUrl: parsedInput.repoUrl,
      ref: parsedInput.ref,
      commitSha: loaded.commitSha,
      baselineFile,
      loadedAt: timestamp,
      sourceRef: `${parsedInput.ref}@${loaded.commitSha.slice(0, 12)}`,
      lastError: null,
    }

    await Promise.all([
      writeCurrentSnapshot({
        snapshot: afterSnapshot,
        updatedAt: timestamp,
        sourceCommit: loaded.commitSha,
        sourceRef: parsedInput.ref,
      }),
      writeBaselineState(nextState),
      appendHistoryEntry(entry),
    ])

    return {
      baseline: nextState,
      historyEntry: entry,
    }
  } catch (error) {
    const message =
      error instanceof Obj24DomainError ? error.message : (error as Error).message
    const failedState: Obj24BaselineState = {
      ...baselineState,
      status: 'error',
      lastError: message,
    }
    await writeBaselineState(failedState)

    if (error instanceof Obj24DomainError) {
      throw error
    }

    throw new Obj24DomainError(
      500,
      'BASELINE_LOAD_FAILED',
      `Baseline konnte nicht geladen werden: ${message}`,
    )
  }
}

export async function appendObj24HistoryChange(
  input: z.infer<typeof obj24HistoryCreateSchema>,
): Promise<Obj24HistoryEntry> {
  const parsedInput = obj24HistoryCreateSchema.parse(input)
  const [baselineState, currentSnapshot] = await Promise.all([
    readBaselineState(),
    readCurrentSnapshot(),
  ])

  if (baselineState.status === 'never_loaded' || !currentSnapshot) {
    throw new Obj24DomainError(
      409,
      'BASELINE_NOT_LOADED',
      'Keine Baseline geladen. Bitte zuerst /api/v1/baseline/load ausfuehren.',
    )
  }

  const afterSnapshot = parsedInput.after
  validateDnsConfigStructure(afterSnapshot)

  const beforeSnapshot = currentSnapshot.snapshot
  const diff = buildDiffEntries(beforeSnapshot, afterSnapshot)

  if (diff.length === 0) {
    throw new Obj24DomainError(
      409,
      'NO_EFFECTIVE_CHANGE',
      'Die Aenderung wurde nicht gespeichert, weil kein Unterschied erkannt wurde.',
    )
  }

  const timestamp = nowIso()
  const entry: Obj24HistoryEntry = {
    id: createHistoryId(),
    timestamp,
    actor: normalizeActor(parsedInput.actor),
    changeType: 'manual_update',
    affectedScope:
      parsedInput.affectedScope && parsedInput.affectedScope.length > 0
        ? parsedInput.affectedScope
        : deriveAffectedScope(diff),
    summary: parsedInput.summary,
    before: beforeSnapshot,
    after: afterSnapshot,
    diff,
    rollbackOf: null,
    sourceCommit: parsedInput.sourceCommit ?? baselineState.commitSha,
    sourceRef: parsedInput.sourceRef ?? baselineState.ref,
    result: 'applied',
  }

  await Promise.all([
    writeCurrentSnapshot({
      snapshot: afterSnapshot,
      updatedAt: timestamp,
      sourceCommit: entry.sourceCommit,
      sourceRef: entry.sourceRef,
    }),
    appendHistoryEntry(entry),
  ])

  return entry
}

export async function getObj24HistoryEntries(
  filters?: Obj24HistoryFilters,
): Promise<Obj24HistoryEntry[]> {
  const entries = await readHistoryEntries()
  return filterHistoryEntries(entries, filters)
}

export async function getObj24HistoryEntryById(
  id: string,
): Promise<Obj24HistoryEntry | null> {
  const entries = await readHistoryEntries()
  return entries.find((entry) => entry.id === id) ?? null
}

export async function rollbackObj24HistoryEntry(
  id: string,
  input: z.infer<typeof obj24HistoryRollbackSchema>,
): Promise<Obj24HistoryEntry> {
  const parsedInput = obj24HistoryRollbackSchema.parse(input)
  const [entries, currentSnapshot, baselineState] = await Promise.all([
    readHistoryEntries(),
    readCurrentSnapshot(),
    readBaselineState(),
  ])

  if (entries.length === 0) {
    throw new Obj24DomainError(
      404,
      'HISTORY_ENTRY_NOT_FOUND',
      'Es existieren keine Verlaufseintraege fuer einen Rollback.',
    )
  }

  const target = entries.find((entry) => entry.id === id)
  if (!target) {
    throw new Obj24DomainError(
      404,
      'HISTORY_ENTRY_NOT_FOUND',
      `Kein Verlaufseintrag mit ID ${id} gefunden.`,
    )
  }

  if (!currentSnapshot) {
    throw new Obj24DomainError(
      409,
      'BASELINE_NOT_LOADED',
      'Kein aktueller Snapshot vorhanden. Bitte zuerst eine Baseline laden.',
    )
  }

  const latestEntry = entries[entries.length - 1]
  if (!latestEntry || latestEntry.id !== target.id) {
    throw new Obj24DomainError(
      409,
      'ROLLBACK_CONFLICT',
      'Rollback-Konflikt: Der gewaehlte Eintrag ist nicht der neueste Stand. Bitte zuerst auf den aktuellen Eintrag zurueckrollen oder eine neue Aenderung erfassen.',
      {
        latestEntryId: latestEntry?.id ?? null,
        requestedEntryId: target.id,
      },
    )
  }

  const isRollbackOfInitialBaselineLoad =
    target.changeType === 'baseline_load' && target.before === null

  const afterSnapshot = target.before
  const beforeSnapshot = currentSnapshot.snapshot
  const diff = buildDiffEntries(beforeSnapshot, afterSnapshot)
  const timestamp = nowIso()
  const entry: Obj24HistoryEntry = {
    id: createHistoryId(),
    timestamp,
    actor: normalizeActor(parsedInput.actor),
    changeType: 'rollback',
    affectedScope: deriveAffectedScope(diff),
    summary:
      parsedInput.summary ??
      `Rollback fuer Eintrag ${target.id} wurde als neuer Verlaufseintrag erstellt.`,
    before: beforeSnapshot,
    after: afterSnapshot,
    diff,
    rollbackOf: target.id,
    sourceCommit: baselineState.commitSha,
    sourceRef: baselineState.ref,
    result: 'applied',
  }

  if (isRollbackOfInitialBaselineLoad) {
    const resetState = createInitialBaselineState()
    await Promise.all([
      writeBaselineState(resetState),
      writeJsonFile(getCurrentPath(), null),
      appendHistoryEntry(entry),
    ])
  } else {
    await Promise.all([
      writeCurrentSnapshot({
        snapshot: afterSnapshot,
        updatedAt: timestamp,
        sourceCommit: entry.sourceCommit,
        sourceRef: entry.sourceRef,
      }),
      appendHistoryEntry(entry),
    ])
  }

  return entry
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function buildCsvPayload(entries: Obj24HistoryEntry[]): string {
  const header = [
    'id',
    'timestamp',
    'actor',
    'changeType',
    'affectedScope',
    'summary',
    'result',
    'rollbackOf',
    'sourceCommit',
    'sourceRef',
  ]

  const rows = entries.map((entry) =>
    [
      entry.id,
      entry.timestamp,
      entry.actor,
      entry.changeType,
      entry.affectedScope.join('|'),
      entry.summary,
      entry.result,
      entry.rollbackOf ?? '',
      entry.sourceCommit ?? '',
      entry.sourceRef ?? '',
    ]
      .map((field) => csvEscape(field))
      .join(','),
  )

  return `${header.join(',')}\n${rows.join('\n')}\n`
}

export async function exportObj24History(filters?: Obj24HistoryFilters & {
  format?: 'json' | 'csv'
}): Promise<{
  format: 'json' | 'csv'
  fileName: string
  contentType: string
  payload: string
}> {
  const format = filters?.format ?? 'json'
  const entries = await getObj24HistoryEntries(filters)
  const timestamp = nowIso().replace(/[:.]/g, '-')

  if (format === 'csv') {
    return {
      format,
      fileName: `obj24-history-${timestamp}.csv`,
      contentType: 'text/csv; charset=utf-8',
      payload: buildCsvPayload(entries),
    }
  }

  return {
    format: 'json',
    fileName: `obj24-history-${timestamp}.json`,
    contentType: 'application/json; charset=utf-8',
    payload: `${JSON.stringify(entries, null, 2)}\n`,
  }
}
