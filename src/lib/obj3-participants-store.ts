import { promises as fs } from 'node:fs'
import path from 'node:path'

import { z } from 'zod'

import { emitFailureSignal, emitSuccessSignal } from '@/lib/obj11-observability'

const participantIdRegex = /^[A-Za-z0-9_-]{2,64}$/

export const participantCreateSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(participantIdRegex, 'id muss 2-64 Zeichen enthalten (a-z, A-Z, 0-9, _, -).')
    .optional(),
  name: z.string().trim().min(1, 'name ist erforderlich.'),
  fqdn: z.string().trim().min(1).optional(),
  ipv4: z.string().trim().min(1).optional(),
  role: z.string().trim().min(1).optional(),
  notes: z.string().trim().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const participantUpdateSchema = participantCreateSchema
  .omit({ id: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Mindestens ein Feld fuer das Update ist erforderlich.',
  })

export interface ParticipantRecord {
  id: string
  name: string
  fqdn: string | null
  ipv4: string | null
  role: string | null
  notes: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

type ParticipantCreateInput = z.infer<typeof participantCreateSchema>
type ParticipantUpdateInput = z.infer<typeof participantUpdateSchema>

const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
}

function sanitizeText(value: string): string {
  return value.replace(/[&<>"'`]/g, (match) => htmlEscapeMap[match] ?? match)
}

function sanitizeUnknownValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return sanitizeText(value)
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeUnknownValue(entry))
  }

  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(objectValue).map(([key, entry]) => [
        key,
        sanitizeUnknownValue(entry),
      ]),
    )
  }

  return value
}

function sanitizeOptionalText(value: string | null): string | null {
  if (!value) {
    return null
  }
  return sanitizeText(value)
}

function sanitizeParticipantRecord(record: ParticipantRecord): ParticipantRecord {
  return {
    ...record,
    name: sanitizeText(record.name),
    fqdn: sanitizeOptionalText(record.fqdn),
    ipv4: sanitizeOptionalText(record.ipv4),
    role: sanitizeOptionalText(record.role),
    notes: sanitizeOptionalText(record.notes),
    metadata: sanitizeUnknownValue(record.metadata) as Record<string, unknown>,
  }
}

function getParticipantsFilePath(): string {
  const baseDir =
    process.env.OBJ3_DATA_DIR?.trim() || path.join(process.cwd(), 'data', 'obj3')
  return path.join(baseDir, 'participants.json')
}

async function ensureParticipantsFile(): Promise<string> {
  const filePath = getParticipantsFilePath()
  await fs.mkdir(path.dirname(filePath), { recursive: true })

  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, '[]\n', 'utf8')
  }

  return filePath
}

async function readAllParticipants(): Promise<ParticipantRecord[]> {
  const filePath = await ensureParticipantsFile()
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw) as unknown

  if (!Array.isArray(parsed)) {
    throw new Error('participants.json hat kein gueltiges Array-Format.')
  }

  return parsed as ParticipantRecord[]
}

async function writeAllParticipants(participants: ParticipantRecord[]): Promise<void> {
  const filePath = await ensureParticipantsFile()
  await fs.writeFile(filePath, `${JSON.stringify(participants, null, 2)}\n`, 'utf8')
}

function createParticipantId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
  const suffix = Date.now().toString(36)
  return `${slug || 'participant'}-${suffix}`
}

export async function listParticipants(): Promise<ParticipantRecord[]> {
  const participants = await readAllParticipants()
  const sanitized = participants
    .map((participant) => sanitizeParticipantRecord(participant))
    .sort((left, right) => left.id.localeCompare(right.id, 'de'))

  await emitSuccessSignal({
    name: 'dns.participants.listed',
    operation: 'participants.list',
    route: '/api/v1/participants',
    statusCode: 200,
    attributes: {
      'participant.count': sanitized.length,
    },
  })

  return sanitized
}

export async function getParticipantById(id: string): Promise<ParticipantRecord | null> {
  const normalized = id.trim()
  if (!normalized) {
    return null
  }

  const participants = await readAllParticipants()
  const participant =
    participants.find((entry) => entry.id === normalized) ?? null
  const sanitized = participant ? sanitizeParticipantRecord(participant) : null

  if (sanitized) {
    await emitSuccessSignal({
      name: 'dns.participant.loaded',
      operation: 'participants.detail',
      route: `/api/v1/participants/${normalized}`,
      statusCode: 200,
      attributes: {
        participant_id: normalized,
      },
    })
  } else {
    await emitFailureSignal({
      name: 'dns.participant.missing',
      operation: 'participants.detail',
      route: `/api/v1/participants/${normalized}`,
      statusCode: 404,
      severity: 'WARN',
      outcome: 'failure',
      attributes: {
        participant_id: normalized,
      },
    })
  }

  return sanitized
}

export async function createParticipant(
  input: ParticipantCreateInput,
): Promise<ParticipantRecord> {
  const participants = await readAllParticipants()
  const now = new Date().toISOString()

  const id = input.id?.trim() || createParticipantId(input.name)
  if (participants.some((participant) => participant.id === id)) {
    throw new Error(`Participant mit id "${id}" existiert bereits.`)
  }

  const participant: ParticipantRecord = {
    id,
    name: input.name.trim(),
    fqdn: input.fqdn?.trim() || null,
    ipv4: input.ipv4?.trim() || null,
    role: input.role?.trim() || null,
    notes: input.notes?.trim() || null,
    metadata: input.metadata ?? {},
    createdAt: now,
    updatedAt: now,
  }

  participants.push(participant)
  await writeAllParticipants(participants)
  const sanitized = sanitizeParticipantRecord(participant)
  await emitSuccessSignal({
    name: 'dns.participant.created',
    operation: 'participants.create',
    route: '/api/v1/participants',
    statusCode: 201,
    attributes: {
      participant_id: sanitized.id,
    },
  })

  return sanitized
}

export async function updateParticipant(
  id: string,
  input: ParticipantUpdateInput,
): Promise<ParticipantRecord | null> {
  const participants = await readAllParticipants()
  const index = participants.findIndex((participant) => participant.id === id)
  if (index < 0) {
    await emitFailureSignal({
      name: 'dns.participant.update_missing',
      operation: 'participants.update',
      route: `/api/v1/participants/${id}`,
      statusCode: 404,
      severity: 'WARN',
      outcome: 'failure',
      attributes: {
        participant_id: id,
      },
    })
    return null
  }

  const current = participants[index]
  const updated: ParticipantRecord = {
    ...current,
    name: input.name?.trim() ?? current.name,
    fqdn:
      input.fqdn === undefined
        ? current.fqdn
        : input.fqdn?.trim() || null,
    ipv4:
      input.ipv4 === undefined
        ? current.ipv4
        : input.ipv4?.trim() || null,
    role:
      input.role === undefined
        ? current.role
        : input.role?.trim() || null,
    notes:
      input.notes === undefined
        ? current.notes
        : input.notes?.trim() || null,
    metadata:
      input.metadata === undefined
        ? current.metadata
        : input.metadata,
    updatedAt: new Date().toISOString(),
  }

  participants[index] = updated
  await writeAllParticipants(participants)
  const sanitized = sanitizeParticipantRecord(updated)
  await emitSuccessSignal({
    name: 'dns.participant.updated',
    operation: 'participants.update',
    route: `/api/v1/participants/${id}`,
    statusCode: 200,
    attributes: {
      participant_id: sanitized.id,
    },
  })

  return sanitized
}

export async function deleteParticipant(id: string): Promise<boolean> {
  const participants = await readAllParticipants()
  const next = participants.filter((participant) => participant.id !== id)
  if (next.length === participants.length) {
    await emitFailureSignal({
      name: 'dns.participant.delete_missing',
      operation: 'participants.delete',
      route: `/api/v1/participants/${id}`,
      statusCode: 404,
      severity: 'WARN',
      outcome: 'failure',
      attributes: {
        participant_id: id,
      },
    })
    return false
  }

  await writeAllParticipants(next)
  await emitSuccessSignal({
    name: 'dns.participant.deleted',
    operation: 'participants.delete',
    route: `/api/v1/participants/${id}`,
    statusCode: 200,
    attributes: {
      participant_id: id,
    },
  })
  return true
}
