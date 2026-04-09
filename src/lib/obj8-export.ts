import { z } from 'zod'

import { generateZoneFile, type ZoneGenerationResult } from '@/lib/obj3-zone-generator'
import {
  buildParticipantUpsertPayload,
  participantFormSchema,
  participantFormValuesFromRecord,
  type Obj3ParticipantRecord,
  type ParticipantFormValues,
} from '@/lib/obj5-participant-config'
import {
  createDefaultObj6SoaSettings,
  prepareZoneGenerationInputFromParticipant,
  type Obj6SoaSettings,
  type PreparedZoneGenerationInput,
} from '@/lib/obj6-zone-generation'

export const OBJ8_EXPORT_SCHEMA_VERSION = 1 as const
export const OBJ8_EXPORT_MANIFEST_FILE_NAME = 'export-manifest.json'

const obj8ParticipantSchema = z
  .object({
    id: z.string().trim().min(1, 'participant.id ist erforderlich.'),
    name: z.string().trim().min(1, 'participant.name ist erforderlich.'),
    ccNumber: z.string().trim().min(1, 'participant.ccNumber ist erforderlich.'),
  })
  .strict()

  const obj8MetadataSchema = z
  .object({
    ccNumber: z.string().optional(),
    poc: z
      .object({
        name: z.string().optional(),
        email: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
      })
      .optional(),
    spiralVersion: z.enum(['SP4', 'SP5']).optional(),
    delegatedZones: z
      .object({
        forward: z.array(z.string()).optional(),
        reverse: z.array(z.string()).optional(),
      })
      .optional(),
    nameservers: z
      .array(
        z.object({
          fqdn: z.string().trim().min(1),
          ipv4: z.string().trim().min(1),
        }),
      )
      .optional(),
    resolvers: z
      .array(
        z.object({
          fqdn: z.string().trim().min(1),
          ipv4: z.string().trim().min(1),
        }),
      )
      .optional(),
    anycast: z
      .object({
        enabled: z.boolean().optional(),
        fqdn: z.string().nullable().optional(),
        ipv4: z.string().nullable().optional(),
      })
      .optional(),
    notes: z.string().nullable().optional(),
  })

export const obj8ConfigExportDocumentSchema = z
  .object({
    schemaVersion: z.literal(OBJ8_EXPORT_SCHEMA_VERSION),
    exportedAt: z
      .string()
      .datetime({ offset: true })
      .refine((value) => value.length > 0, 'exportedAt ist erforderlich.'),
    participant: obj8ParticipantSchema,
    configuration: participantFormSchema,
  })
  .strict()

export type Obj8ConfigExportDocument = z.infer<typeof obj8ConfigExportDocumentSchema>

export type Obj8ArtifactKind =
  | 'forward-zone'
  | 'reverse-zone'
  | 'named-conf-snippet'
  | 'tsig-keygen-script'
  | 'json-export'
  | 'manifest'

export interface Obj8DownloadFile {
  kind: Obj8ArtifactKind
  fileName: string
  mimeType: string
  content: string
  generatedAt: string
}

export interface Obj8ExportManifest {
  schemaVersion: typeof OBJ8_EXPORT_SCHEMA_VERSION
  exportVersion: string
  exportedAt: string
  participant: {
    id: string
    name: string
    ccNumber: string
  }
  source: 'api' | 'import'
  files: Array<{
    kind: Exclude<Obj8ArtifactKind, 'manifest'>
    fileName: string
    generatedAt: string
  }>
  warnings: string[]
}

export interface Obj8ExportDraft {
  source: 'api' | 'import'
  ready: boolean
  validationIssues: string[]
  warnings: string[]
  participant: {
    id: string
    name: string
    ccNumber: string
  }
  configuration: ParticipantFormValues
  zonePlan: PreparedZoneGenerationInput | null
  jsonDocument: Obj8ConfigExportDocument
  files: Obj8DownloadFile[]
  manifest: Obj8ExportManifest
  zipFileName: string
}

export interface Obj8ImportResult {
  ok: true
  document: Obj8ConfigExportDocument
}

export interface Obj8ImportError {
  ok: false
  message: string
}

export type Obj8ImportParseResult = Obj8ImportResult | Obj8ImportError

export function sanitizeObj8FileNameSegment(value: string, fallback = 'export'): string {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+/, '')
    .replace(/\.+$/, '')
    .replace(/^-+/, '')
    .replace(/-+$/, '')

  return normalized || fallback
}

export function buildObj8JsonFileName(ccNumber: string): string {
  return `${sanitizeObj8FileNameSegment(ccNumber, 'dns')}-dns-config.json`
}

export function buildObj8ZipFileName(ccNumber: string): string {
  return `${sanitizeObj8FileNameSegment(ccNumber, 'dns')}-dns-export.zip`
}

export function buildObj8ZoneFileName(zoneName: string, kind: 'forward' | 'reverse'): string {
  const suffix = kind === 'forward' ? '.zone' : '.reverse.zone'
  return `${sanitizeObj8FileNameSegment(zoneName, 'zone')}${suffix}`
}

export function buildObj8NamedConfSnippetFileName(): string {
  return 'named.conf.local.snippet'
}

export function buildObj8TsigKeygenScriptFileName(): string {
  return 'tsig-keygen.sh'
}

function formatValidationIssues(issues: z.ZodIssue[]): string {
  const messages = issues
    .map((issue) => issue.message.trim())
    .filter(Boolean)
    .filter((message, index, all) => all.indexOf(message) === index)

  if (messages.length === 0) {
    return 'Die JSON-Datei ist unvollstaendig oder hat ein ungueltiges Format.'
  }

  return messages.join(' | ')
}

export function parseObj8ConfigExportDocument(raw: unknown): Obj8ConfigExportDocument {
  const parsed = obj8ConfigExportDocumentSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(
      `JSON-Import fehlgeschlagen: ${formatValidationIssues(parsed.error.issues)}`,
    )
  }

  if (parsed.data.participant.ccNumber.trim() !== parsed.data.configuration.ccNumber.trim()) {
    throw new Error(
      'JSON-Import fehlgeschlagen: CC-Number in Participant und Konfiguration muessen gleich sein.',
    )
  }

  return parsed.data
}

export function buildObj8ConfigExportDocument(
  participant: Obj3ParticipantRecord,
  configuration: ParticipantFormValues,
  exportedAt = new Date().toISOString(),
): Obj8ConfigExportDocument {
  const payload = buildParticipantUpsertPayload(configuration)

  return {
    schemaVersion: OBJ8_EXPORT_SCHEMA_VERSION,
    exportedAt,
    participant: {
      id: participant.id,
      name: participant.name,
      ccNumber: configuration.ccNumber,
    },
    configuration: {
      ...configuration,
      nameservers: payload.metadata.obj5.nameservers,
      resolvers: payload.metadata.obj5.resolvers,
      forwardZones: payload.metadata.obj5.delegatedZones.forward.map((value) => ({ value })),
      reverseZones: payload.metadata.obj5.delegatedZones.reverse.map((value) => ({ value })),
    },
  }
}

function extractParticipantConfiguration(
  record: Obj3ParticipantRecord,
): ParticipantFormValues {
  const metadataCandidate =
    record.metadata &&
    typeof record.metadata === 'object' &&
    'obj5' in record.metadata &&
    typeof record.metadata.obj5 === 'object'
      ? record.metadata.obj5
      : null

  const parsed = obj8MetadataSchema.safeParse(metadataCandidate)
  if (!parsed.success) {
    return participantFormValuesFromRecord(record)
  }

  const metadata = parsed.data
  return {
    participantName: record.name ?? '',
    ccNumber: metadata.ccNumber ?? '',
    pocName: metadata.poc?.name ?? '',
    pocEmail: metadata.poc?.email ?? '',
    pocPhone: metadata.poc?.phone ?? '',
    spiralVersion: metadata.spiralVersion ?? 'SP5',
    forwardZones:
      metadata.delegatedZones?.forward?.map((zone) => ({ value: zone })) ?? [
        { value: '' },
      ],
    reverseZones:
      metadata.delegatedZones?.reverse?.map((zone) => ({ value: zone })) ?? [],
    nameservers: metadata.nameservers ?? [],
    resolvers: metadata.resolvers ?? [],
    anycastEnabled: metadata.anycast?.enabled ?? false,
    anycastFqdn: metadata.anycast?.fqdn ?? '',
    anycastIpv4: metadata.anycast?.ipv4 ?? '',
    notes: metadata.notes ?? record.notes ?? '',
  }
}

function buildParticipantFromDocument(document: Obj8ConfigExportDocument): Obj3ParticipantRecord {
  const payload = buildParticipantUpsertPayload(document.configuration)
  return {
    id: document.participant.id,
    name: document.participant.name,
    fqdn: payload.fqdn ?? null,
    ipv4: payload.ipv4 ?? null,
    role: payload.role,
    notes: payload.notes ?? null,
    metadata: payload.metadata,
    createdAt: document.exportedAt,
    updatedAt: document.exportedAt,
  }
}

function buildNamedConfSnippet(plan: PreparedZoneGenerationInput, source: string): string {
  const lines: string[] = []
  lines.push(`// Generated from ${source}`)
  lines.push(`// Participant: ${plan.participantName} (${plan.participantId})`)
  lines.push('')
  lines.push(`zone "${plan.forward.zoneName}" {`)
  lines.push('  type master;')
  lines.push(`  file "/etc/bind/${buildObj8ZoneFileName(plan.forward.zoneName, 'forward')}";`)
  lines.push('};')
  lines.push('')

  for (const reverseZone of plan.reverse) {
    lines.push(`zone "${reverseZone.zoneName}" {`)
    lines.push('  type master;')
    lines.push(`  file "/etc/bind/${buildObj8ZoneFileName(reverseZone.zoneName, 'reverse')}";`)
    lines.push('};')
    lines.push('')
  }

  return `${lines.join('\n')}\n`
}

function buildTsigKeygenScript(plan: PreparedZoneGenerationInput): string {
  const keyLabel = sanitizeObj8FileNameSegment(
    `${plan.participantId}-${plan.participantName}`,
    'dns-transfer',
  )

  return [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    '',
    `KEY_NAME="${keyLabel}-transfer"`,
    'KEY_ALGO="hmac-sha256"',
    '',
    'if ! command -v tsig-keygen >/dev/null 2>&1; then',
    '  echo "tsig-keygen fehlt. Bitte BIND-Tools installieren." >&2',
    '  exit 1',
    'fi',
    '',
    'echo "Erzeuge TSIG-Key ${KEY_NAME} mit ${KEY_ALGO}..."',
    'tsig-keygen -a "${KEY_ALGO}" "${KEY_NAME}"',
    '',
  ].join('\n')
}

function createDownloadFile(
  kind: Obj8ArtifactKind,
  fileName: string,
  mimeType: string,
  content: string,
  generatedAt: string,
): Obj8DownloadFile {
  return {
    kind,
    fileName,
    mimeType,
    content,
    generatedAt,
  }
}

function buildManifest(
  source: 'api' | 'import',
  participant: Obj8ExportDraft['participant'],
  files: Obj8DownloadFile[],
  exportedAt: string,
  warnings: string[],
): Obj8ExportManifest {
  return {
    schemaVersion: OBJ8_EXPORT_SCHEMA_VERSION,
    exportVersion: 'obj8-export-v1',
    exportedAt,
    participant,
    source,
    files: files.map((file) => ({
      kind: file.kind,
      fileName: file.fileName,
      generatedAt: file.generatedAt,
    })),
    warnings,
  }
}

function createDraftFromPreparedInput(
  source: 'api' | 'import',
  participant: Obj3ParticipantRecord,
  configuration: ParticipantFormValues,
  plan: PreparedZoneGenerationInput,
  warnings: string[],
): Obj8ExportDraft {
  const exportedAt = new Date().toISOString()
  const forwardResult = generateZoneFile(plan.forward)
  const reverseResults: ZoneGenerationResult[] = plan.reverse.map((entry) =>
    generateZoneFile(entry),
  )

  const files: Obj8DownloadFile[] = [
    createDownloadFile(
      'forward-zone',
      buildObj8ZoneFileName(forwardResult.zoneName, 'forward'),
      'text/plain;charset=utf-8',
      forwardResult.zoneFile,
      forwardResult.generatedAt,
    ),
    ...reverseResults.map((result) =>
      createDownloadFile(
        'reverse-zone',
        buildObj8ZoneFileName(result.zoneName, 'reverse'),
        'text/plain;charset=utf-8',
        result.zoneFile,
        result.generatedAt,
      ),
    ),
    createDownloadFile(
      'named-conf-snippet',
      buildObj8NamedConfSnippetFileName(),
      'text/plain;charset=utf-8',
      buildNamedConfSnippet(plan, source),
      exportedAt,
    ),
    createDownloadFile(
      'tsig-keygen-script',
      buildObj8TsigKeygenScriptFileName(),
      'text/x-shellscript;charset=utf-8',
      buildTsigKeygenScript(plan),
      exportedAt,
    ),
  ]

  const jsonDocument = buildObj8ConfigExportDocument(participant, configuration, exportedAt)
  files.push(
    createDownloadFile(
      'json-export',
      buildObj8JsonFileName(configuration.ccNumber),
      'application/json;charset=utf-8',
      `${JSON.stringify(jsonDocument, null, 2)}\n`,
      exportedAt,
    ),
  )

  const manifestParticipant = {
    id: participant.id,
    name: participant.name,
    ccNumber: configuration.ccNumber,
  }
  const manifest = buildManifest(source, manifestParticipant, files, exportedAt, warnings)

  return {
    source,
    ready: true,
    validationIssues: [],
    warnings,
    participant: manifestParticipant,
    configuration,
    zonePlan: plan,
    jsonDocument,
    files,
    manifest,
    zipFileName: buildObj8ZipFileName(configuration.ccNumber),
  }
}

function createFallbackDraft(
  source: 'api' | 'import',
  participant: Obj3ParticipantRecord,
  configuration: ParticipantFormValues,
  issues: string[],
): Obj8ExportDraft {
  const exportedAt = new Date().toISOString()
  const jsonDocument = buildObj8ConfigExportDocument(participant, configuration, exportedAt)
  const participantSnapshot = {
    id: participant.id,
    name: participant.name,
    ccNumber: configuration.ccNumber,
  }
  const manifest = buildManifest(source, participantSnapshot, [], exportedAt, [])

  return {
    source,
    ready: false,
    validationIssues: issues,
    warnings: [],
    participant: participantSnapshot,
    configuration,
    zonePlan: null,
    jsonDocument,
    files: [],
    manifest,
    zipFileName: buildObj8ZipFileName(configuration.ccNumber),
  }
}

function buildIssuesFromSchema(configuration: ParticipantFormValues): string[] {
  const parsed = participantFormSchema.safeParse(configuration)
  if (parsed.success) {
    return []
  }

  return parsed.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
    return `${path}${issue.message}`
  })
}

function createDraftFromParticipant(
  participant: Obj3ParticipantRecord,
  source: 'api' | 'import',
  settings: Obj6SoaSettings = createDefaultObj6SoaSettings(),
): Obj8ExportDraft {
  const configuration = extractParticipantConfiguration(participant)
  const issues = buildIssuesFromSchema(configuration)

  if (issues.length > 0) {
    return createFallbackDraft(source, participant, configuration, issues)
  }

  try {
    const plan = prepareZoneGenerationInputFromParticipant(participant, settings)
    return createDraftFromPreparedInput(source, participant, configuration, plan, plan.warnings)
  } catch (error) {
    const validationIssues = [
      ...(issues.length > 0 ? issues : []),
      error instanceof Error ? error.message : 'Konfiguration ist unvollstaendig.',
    ]
    return createFallbackDraft(source, participant, configuration, validationIssues)
  }
}

export function createObj8ExportDraftFromParticipant(
  participant: Obj3ParticipantRecord,
  settings: Obj6SoaSettings = createDefaultObj6SoaSettings(),
): Obj8ExportDraft {
  return createDraftFromParticipant(participant, 'api', settings)
}

export function createObj8ExportDraftFromImport(
  rawInput: unknown,
  settings: Obj6SoaSettings = createDefaultObj6SoaSettings(),
): Obj8ExportDraft {
  const parsed = parseObj8ConfigExportDocument(rawInput)
  const participant = buildParticipantFromDocument(parsed)
  return createDraftFromParticipant(participant, 'import', settings)
}

export function buildObj8ArchiveEntries(draft: Obj8ExportDraft): Obj8DownloadFile[] {
  const manifestFile = createDownloadFile(
    'manifest',
    OBJ8_EXPORT_MANIFEST_FILE_NAME,
    'application/json;charset=utf-8',
    `${JSON.stringify(draft.manifest, null, 2)}\n`,
    draft.manifest.exportedAt,
  )

  return [...draft.files, manifestFile]
}

function toUtf8Bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value)
}

function writeUint16LE(target: Uint8Array, offset: number, value: number): void {
  const view = new DataView(target.buffer, target.byteOffset, target.byteLength)
  view.setUint16(offset, value, true)
}

function writeUint32LE(target: Uint8Array, offset: number, value: number): void {
  const view = new DataView(target.buffer, target.byteOffset, target.byteLength)
  view.setUint32(offset, value >>> 0, true)
}

const crc32Table = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let crc = i
    for (let j = 0; j < 8; j += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
    }
    table[i] = crc >>> 0
  }
  return table
})()

function calculateCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc = crc32Table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const output = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.length
  }
  return output
}

export function buildZipArchive(files: Obj8DownloadFile[]): Uint8Array {
  const entries = files.map((file) => ({
    name: file.fileName,
    bytes: toUtf8Bytes(file.content),
  }))

  const seen = new Set<string>()
  for (const entry of entries) {
    if (seen.has(entry.name)) {
      throw new Error(`ZIP-Dateiname doppelt vorhanden: ${entry.name}`)
    }
    seen.add(entry.name)
  }

  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0

  for (const entry of entries) {
    const nameBytes = toUtf8Bytes(entry.name)
    const crc32 = calculateCrc32(entry.bytes)
    const localHeader = new Uint8Array(30 + nameBytes.length)
    writeUint32LE(localHeader, 0, 0x04034b50)
    writeUint16LE(localHeader, 4, 20)
    writeUint16LE(localHeader, 6, 0x0800)
    writeUint16LE(localHeader, 8, 0)
    writeUint16LE(localHeader, 10, 0)
    writeUint16LE(localHeader, 12, 0)
    writeUint32LE(localHeader, 14, crc32)
    writeUint32LE(localHeader, 18, entry.bytes.length)
    writeUint32LE(localHeader, 22, entry.bytes.length)
    writeUint16LE(localHeader, 26, nameBytes.length)
    writeUint16LE(localHeader, 28, 0)
    localHeader.set(nameBytes, 30)

    localParts.push(localHeader, entry.bytes)

    const centralHeader = new Uint8Array(46 + nameBytes.length)
    writeUint32LE(centralHeader, 0, 0x02014b50)
    writeUint16LE(centralHeader, 4, 20)
    writeUint16LE(centralHeader, 6, 20)
    writeUint16LE(centralHeader, 8, 0x0800)
    writeUint16LE(centralHeader, 10, 0)
    writeUint16LE(centralHeader, 12, 0)
    writeUint16LE(centralHeader, 14, 0)
    writeUint32LE(centralHeader, 16, crc32)
    writeUint32LE(centralHeader, 20, entry.bytes.length)
    writeUint32LE(centralHeader, 24, entry.bytes.length)
    writeUint16LE(centralHeader, 28, nameBytes.length)
    writeUint16LE(centralHeader, 30, 0)
    writeUint16LE(centralHeader, 32, 0)
    writeUint16LE(centralHeader, 34, 0)
    writeUint16LE(centralHeader, 36, 0)
    writeUint32LE(centralHeader, 38, 0)
    writeUint32LE(centralHeader, 42, offset)
    centralHeader.set(nameBytes, 46)
    centralParts.push(centralHeader)

    offset += localHeader.length + entry.bytes.length
  }

  const centralDirectory = concatBytes(centralParts)
  const endRecord = new Uint8Array(22)
  writeUint32LE(endRecord, 0, 0x06054b50)
  writeUint16LE(endRecord, 4, 0)
  writeUint16LE(endRecord, 6, 0)
  writeUint16LE(endRecord, 8, entries.length)
  writeUint16LE(endRecord, 10, entries.length)
  writeUint32LE(endRecord, 12, centralDirectory.length)
  writeUint32LE(endRecord, 16, offset)
  writeUint16LE(endRecord, 20, 0)

  return concatBytes([...localParts, centralDirectory, endRecord])
}
