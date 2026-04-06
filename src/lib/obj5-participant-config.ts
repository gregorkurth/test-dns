import { z } from 'zod'

export const MIN_NAMESERVERS = 2

const ipv4Regex =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
const fqdnRegex =
  /^(?=.{1,253}$)(?:(?!-)[a-z0-9-]{1,63}(?<!-)\.)+(?:[a-z]{2,63})$/i

const zoneEntrySchema = z.object({
  value: z.string().trim().min(1, 'Zone ist erforderlich.'),
})

const hostEntrySchema = z.object({
  fqdn: z
    .string()
    .trim()
    .min(1, 'FQDN ist erforderlich.')
    .refine((value) => isValidFqdn(value), 'Bitte ein gueltiges FQDN verwenden.'),
  ipv4: z
    .string()
    .trim()
    .min(1, 'IPv4 ist erforderlich.')
    .refine((value) => isValidIpv4(value), 'Bitte eine gueltige IPv4-Adresse verwenden.'),
})

export const participantFormSchema = z
  .object({
    participantName: z.string().trim().min(1, 'Participant Name ist erforderlich.'),
    ccNumber: z.string().trim().min(1, 'CC-Number ist erforderlich.'),
    pocName: z.string().trim().min(1, 'PoC Name ist erforderlich.'),
    pocEmail: z
      .string()
      .trim()
      .refine(
        (value) => !value || z.email().safeParse(value).success,
        'Bitte eine gueltige E-Mail-Adresse verwenden.',
      ),
    pocPhone: z.string().trim(),
    spiralVersion: z.enum(['SP4', 'SP5']),
    forwardZones: z.array(zoneEntrySchema),
    reverseZones: z.array(zoneEntrySchema),
    nameservers: z.array(hostEntrySchema),
    resolvers: z.array(hostEntrySchema),
    anycastEnabled: z.boolean(),
    anycastFqdn: z.string().trim(),
    anycastIpv4: z.string().trim(),
    notes: z.string().trim(),
  })
  .superRefine((values, context) => {
    const delegatedZoneCount =
      values.forwardZones.filter((entry) => entry.value.trim().length > 0).length +
      values.reverseZones.filter((entry) => entry.value.trim().length > 0).length

    if (delegatedZoneCount < 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['forwardZones'],
        message: 'Mindestens eine delegierte Zone ist erforderlich.',
      })
    }

    if (values.nameservers.length < MIN_NAMESERVERS) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nameservers'],
        message: `Mindestens ${MIN_NAMESERVERS} Nameserver sind erforderlich (SREQ-613).`,
      })
    }

    values.reverseZones.forEach((entry, index) => {
      if (!isReverseZone(entry.value)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['reverseZones', index, 'value'],
          message:
            'Reverse-Zonen muessen mit ".in-addr.arpa" enden (z. B. 0.168.192.in-addr.arpa).',
        })
      }
    })

    if (values.anycastEnabled) {
      if (!values.anycastFqdn || !isValidFqdn(values.anycastFqdn)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['anycastFqdn'],
          message: 'Bei aktivem Anycast ist ein gueltiges Anycast-FQDN erforderlich.',
        })
      }
      if (!values.anycastIpv4 || !isValidIpv4(values.anycastIpv4)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['anycastIpv4'],
          message: 'Bei aktivem Anycast ist eine gueltige Anycast-IPv4 erforderlich.',
        })
      }
    }
  })

const participantDraftSchema = z.object({
  participantName: z.string(),
  ccNumber: z.string(),
  pocName: z.string(),
  pocEmail: z.string(),
  pocPhone: z.string(),
  spiralVersion: z.enum(['SP4', 'SP5']),
  forwardZones: z.array(z.object({ value: z.string() })),
  reverseZones: z.array(z.object({ value: z.string() })),
  nameservers: z.array(z.object({ fqdn: z.string(), ipv4: z.string() })),
  resolvers: z.array(z.object({ fqdn: z.string(), ipv4: z.string() })),
  anycastEnabled: z.boolean(),
  anycastFqdn: z.string(),
  anycastIpv4: z.string(),
  notes: z.string(),
})

const obj5MetadataSchema = z.object({
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
  nameservers: z.array(z.object({ fqdn: z.string(), ipv4: z.string() })).optional(),
  resolvers: z.array(z.object({ fqdn: z.string(), ipv4: z.string() })).optional(),
  anycast: z
    .object({
      enabled: z.boolean().optional(),
      fqdn: z.string().nullable().optional(),
      ipv4: z.string().nullable().optional(),
    })
    .optional(),
  notes: z.string().optional(),
})

export interface ParticipantFormValues {
  participantName: string
  ccNumber: string
  pocName: string
  pocEmail: string
  pocPhone: string
  spiralVersion: 'SP4' | 'SP5'
  forwardZones: Array<{ value: string }>
  reverseZones: Array<{ value: string }>
  nameservers: Array<{ fqdn: string; ipv4: string }>
  resolvers: Array<{ fqdn: string; ipv4: string }>
  anycastEnabled: boolean
  anycastFqdn: string
  anycastIpv4: string
  notes: string
}

export interface Obj3ParticipantRecord {
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

export interface ParticipantDraftEnvelope {
  participantId: string | null
  savedAt: string
  values: ParticipantFormValues
}

export interface ParticipantUpsertPayload {
  name: string
  fqdn?: string
  ipv4?: string
  role: string
  notes?: string
  metadata: Record<string, unknown>
}

export function isValidIpv4(value: string): boolean {
  return ipv4Regex.test(value.trim())
}

export function isValidFqdn(value: string): boolean {
  const normalized = value.trim().replace(/\.$/, '')
  return fqdnRegex.test(normalized)
}

export function isReverseZone(value: string): boolean {
  return value.trim().toLowerCase().endsWith('.in-addr.arpa')
}

function normalizeZone(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '')
}

function normalizeHostEntry(entry: { fqdn: string; ipv4: string }): {
  fqdn: string
  ipv4: string
} {
  return {
    fqdn: entry.fqdn.trim().toLowerCase().replace(/\.$/, ''),
    ipv4: entry.ipv4.trim(),
  }
}

function ensureMinimumNameservers(
  values: Array<{ fqdn: string; ipv4: string }>,
): Array<{ fqdn: string; ipv4: string }> {
  const next = values.slice()
  while (next.length < MIN_NAMESERVERS) {
    next.push({ fqdn: '', ipv4: '' })
  }
  return next
}

export function createDefaultParticipantFormValues(): ParticipantFormValues {
  return {
    participantName: '',
    ccNumber: '',
    pocName: '',
    pocEmail: '',
    pocPhone: '',
    spiralVersion: 'SP5',
    forwardZones: [{ value: '' }],
    reverseZones: [],
    nameservers: ensureMinimumNameservers([]),
    resolvers: [],
    anycastEnabled: false,
    anycastFqdn: '',
    anycastIpv4: '',
    notes: '',
  }
}

export function coerceParticipantFormValues(input: unknown): ParticipantFormValues {
  const parsed = participantDraftSchema.safeParse(input)
  if (!parsed.success) {
    return createDefaultParticipantFormValues()
  }

  const source = parsed.data
  return {
    participantName: source.participantName,
    ccNumber: source.ccNumber,
    pocName: source.pocName,
    pocEmail: source.pocEmail,
    pocPhone: source.pocPhone,
    spiralVersion: source.spiralVersion,
    forwardZones:
      source.forwardZones.length > 0
        ? source.forwardZones
        : [{ value: '' }],
    reverseZones: source.reverseZones,
    nameservers: ensureMinimumNameservers(source.nameservers),
    resolvers: source.resolvers,
    anycastEnabled: source.anycastEnabled,
    anycastFqdn: source.anycastFqdn,
    anycastIpv4: source.anycastIpv4,
    notes: source.notes,
  }
}

export function normalizeParticipantFormValues(
  values: ParticipantFormValues,
): ParticipantFormValues {
  return {
    participantName: values.participantName.trim(),
    ccNumber: values.ccNumber.trim(),
    pocName: values.pocName.trim(),
    pocEmail: values.pocEmail.trim(),
    pocPhone: values.pocPhone.trim(),
    spiralVersion: values.spiralVersion,
    forwardZones: values.forwardZones.map((entry) => ({
      value: normalizeZone(entry.value),
    })),
    reverseZones: values.reverseZones.map((entry) => ({
      value: normalizeZone(entry.value),
    })),
    nameservers: ensureMinimumNameservers(values.nameservers.map(normalizeHostEntry)),
    resolvers: values.resolvers.map(normalizeHostEntry),
    anycastEnabled: values.anycastEnabled,
    anycastFqdn: values.anycastFqdn.trim().toLowerCase().replace(/\.$/, ''),
    anycastIpv4: values.anycastIpv4.trim(),
    notes: values.notes.trim(),
  }
}

export function buildParticipantUpsertPayload(
  values: ParticipantFormValues,
): ParticipantUpsertPayload {
  const normalized = normalizeParticipantFormValues(values)

  const forwardZones = normalized.forwardZones
    .map((zone) => zone.value)
    .filter((value) => value.length > 0)

  const reverseZones = normalized.reverseZones
    .map((zone) => zone.value)
    .filter((value) => value.length > 0)

  const nameservers = normalized.nameservers.filter(
    (entry) => entry.fqdn.length > 0 && entry.ipv4.length > 0,
  )

  const resolvers = normalized.resolvers.filter(
    (entry) => entry.fqdn.length > 0 && entry.ipv4.length > 0,
  )

  const anycast = {
    enabled: normalized.anycastEnabled,
    fqdn: normalized.anycastEnabled ? normalized.anycastFqdn || null : null,
    ipv4: normalized.anycastEnabled ? normalized.anycastIpv4 || null : null,
  }

  const primaryHost = nameservers[0]
  const payload: ParticipantUpsertPayload = {
    name: normalized.participantName,
    role: 'Mission Network Operator',
    metadata: {
      obj5: {
        formVersion: 1,
        ccNumber: normalized.ccNumber,
        poc: {
          name: normalized.pocName,
          email: normalized.pocEmail || null,
          phone: normalized.pocPhone || null,
        },
        spiralVersion: normalized.spiralVersion,
        delegatedZones: {
          forward: forwardZones,
          reverse: reverseZones,
        },
        nameservers,
        resolvers,
        anycast,
        notes: normalized.notes || null,
      },
    },
  }

  if (primaryHost?.fqdn) {
    payload.fqdn = primaryHost.fqdn
  }
  if (primaryHost?.ipv4) {
    payload.ipv4 = primaryHost.ipv4
  }
  if (normalized.notes) {
    payload.notes = normalized.notes
  }

  return payload
}

export function participantFormValuesFromRecord(
  record: Obj3ParticipantRecord,
): ParticipantFormValues {
  const metadataCandidate =
    record.metadata &&
    typeof record.metadata === 'object' &&
    record.metadata.obj5 &&
    typeof record.metadata.obj5 === 'object'
      ? record.metadata.obj5
      : null
  const metadataParsed = obj5MetadataSchema.safeParse(metadataCandidate)
  const metadata = metadataParsed.success ? metadataParsed.data : null

  const nameserversFromMetadata = metadata?.nameservers ?? []
  const fallbackNameservers =
    record.fqdn && record.ipv4
      ? [
          {
            fqdn: record.fqdn,
            ipv4: record.ipv4,
          },
        ]
      : []

  return coerceParticipantFormValues({
    participantName: record.name ?? '',
    ccNumber: metadata?.ccNumber ?? '',
    pocName: metadata?.poc?.name ?? '',
    pocEmail: metadata?.poc?.email ?? '',
    pocPhone: metadata?.poc?.phone ?? '',
    spiralVersion: metadata?.spiralVersion ?? 'SP5',
    forwardZones:
      metadata?.delegatedZones?.forward?.map((zone) => ({ value: zone })) ?? [
        { value: '' },
      ],
    reverseZones:
      metadata?.delegatedZones?.reverse?.map((zone) => ({ value: zone })) ?? [],
    nameservers:
      nameserversFromMetadata.length > 0
        ? nameserversFromMetadata
        : fallbackNameservers,
    resolvers: metadata?.resolvers ?? [],
    anycastEnabled: metadata?.anycast?.enabled ?? false,
    anycastFqdn: metadata?.anycast?.fqdn ?? '',
    anycastIpv4: metadata?.anycast?.ipv4 ?? '',
    notes: metadata?.notes ?? record.notes ?? '',
  })
}

export function createDraftEnvelope(
  participantId: string | null,
  values: ParticipantFormValues,
): ParticipantDraftEnvelope {
  return {
    participantId,
    savedAt: new Date().toISOString(),
    values: coerceParticipantFormValues(values),
  }
}
