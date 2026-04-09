import { z } from 'zod'

import { isValidFqdn, isValidIpv4 } from '@/lib/obj5-participant-config'
import { emitSuccessSignal } from '@/lib/obj11-observability'

function isValidIpv6(value: string): boolean {
  const input = value.trim()
  if (!input || !/^[0-9a-fA-F:.]+$/.test(input)) {
    return false
  }

  const doubleColonCount = input.split('::').length - 1
  if (doubleColonCount > 1) {
    return false
  }

  const [leftPart = '', rightPart = ''] = input.split('::')
  const leftGroups = leftPart ? leftPart.split(':').filter(Boolean) : []
  const rightGroups = rightPart ? rightPart.split(':').filter(Boolean) : []
  const allGroups = [...leftGroups, ...rightGroups]

  if (allGroups.some((group) => !/^[0-9a-fA-F]{1,4}$/.test(group))) {
    return false
  }

  if (doubleColonCount === 0) {
    return allGroups.length === 8
  }

  return allGroups.length < 8
}

const dnsRecordSchema = z.object({
  name: z.string().trim().min(1, 'record.name ist erforderlich.'),
  type: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (value) => ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'PTR'].includes(value),
      'record.type muss A, AAAA, CNAME, MX, NS, TXT oder PTR sein.',
  ),
  value: z.string().trim().min(1, 'record.value ist erforderlich.'),
  ttl: z.number().int().positive().optional(),
}).superRefine((record, context) => {
  const value = record.value.trim()

  switch (record.type) {
    case 'A':
      if (!isValidIpv4(value)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'record.value muss eine gueltige IPv4-Adresse sein.',
        })
      }
      break
    case 'AAAA':
      if (!isValidIpv6(value)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'record.value muss eine gueltige IPv6-Adresse sein.',
        })
      }
      break
    case 'CNAME':
    case 'NS':
    case 'PTR':
      if (!isValidFqdn(value)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'record.value muss ein gueltiger Hostname oder eine Domain sein.',
        })
      }
      break
    case 'MX': {
      const match = value.match(/^(\d{1,5})\s+(.+)$/)
      const priority = match ? Number(match[1]) : Number.NaN
      const host = match ? match[2].trim() : ''

      if (
        !match ||
        !Number.isInteger(priority) ||
        priority < 0 ||
        priority > 65535 ||
        !isValidFqdn(host)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'record.value muss im Format "<prio> <host>" vorliegen.',
        })
      }
      break
    }
    case 'TXT':
      if (!value.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'record.value darf fuer TXT nicht leer sein.',
        })
      }
      break
  }
})

export const zoneGenerationSchema = z.object({
  zoneName: z
    .string()
    .trim()
    .min(1, 'zoneName ist erforderlich.')
    .regex(
      /^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      'zoneName muss wie eine gueltige Domain aussehen (z. B. core.ndp.che).',
    ),
  defaultTtl: z.number().int().positive().optional(),
  serial: z
    .string()
    .trim()
    .regex(/^\d{10,12}$/, 'serial muss 10-12 numerische Zeichen enthalten.')
    .optional(),
  soa: z
    .object({
      primaryNs: z
        .string()
        .trim()
        .min(1, 'soa.primaryNs darf nicht leer sein.')
        .optional(),
      adminMail: z
        .string()
        .trim()
        .min(1, 'soa.adminMail darf nicht leer sein.')
        .optional(),
      refresh: z.number().int().positive().optional(),
      retry: z.number().int().positive().optional(),
      expire: z.number().int().positive().optional(),
      minimum: z.number().int().positive().optional(),
    })
    .optional(),
  records: z.array(dnsRecordSchema).min(1, 'Mindestens ein DNS-Record ist erforderlich.'),
})

export interface ZoneGenerationResult {
  zoneName: string
  serial: string
  fileName: string
  generatedAt: string
  recordCount: number
  zoneFile: string
}

type ZoneGenerationInput = z.infer<typeof zoneGenerationSchema>

function toSerial(date: Date): string {
  const year = date.getUTCFullYear().toString().padStart(4, '0')
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const day = date.getUTCDate().toString().padStart(2, '0')
  const hour = date.getUTCHours().toString().padStart(2, '0')
  return `${year}${month}${day}${hour}`
}

export function generateZoneFile(input: ZoneGenerationInput): ZoneGenerationResult {
  const generatedAtDate = new Date()
  const generatedAt = generatedAtDate.toISOString()
  const serial = input.serial ?? toSerial(generatedAtDate)
  const ttl = input.defaultTtl ?? 3600
  const zone = input.zoneName.toLowerCase()
  const soaHostInput = input.soa?.primaryNs?.trim()
  const adminMailInput = input.soa?.adminMail?.trim()
  const soaHost = soaHostInput
    ? soaHostInput.endsWith('.')
      ? soaHostInput
      : `${soaHostInput}.`
    : `ns1.${zone}.`
  const adminMail = adminMailInput
    ? adminMailInput.endsWith('.')
      ? adminMailInput
      : `${adminMailInput}.`
    : `hostmaster.${zone}.`
  const refresh = input.soa?.refresh ?? 7200
  const retry = input.soa?.retry ?? 3600
  const expire = input.soa?.expire ?? 1209600
  const minimum = input.soa?.minimum ?? ttl

  const lines: string[] = []
  lines.push(`$TTL ${ttl}`)
  lines.push(`@ IN SOA ${soaHost} ${adminMail} (`)
  lines.push(`  ${serial} ; serial`)
  lines.push(`  ${refresh} ; refresh`)
  lines.push(`  ${retry} ; retry`)
  lines.push(`  ${expire} ; expire`)
  lines.push(`  ${minimum} ; minimum`)
  lines.push(')')
  lines.push(`@ IN NS ${soaHost}`)
  lines.push('')

  for (const record of input.records) {
    const value =
      record.type === 'CNAME' || record.type === 'NS'
        ? record.value.endsWith('.')
          ? record.value
          : `${record.value}.`
        : record.value
    const recordTtl = record.ttl ?? ttl
    lines.push(`${record.name} ${recordTtl} IN ${record.type} ${value}`)
  }

  const result = {
    zoneName: zone,
    serial,
    fileName: `${zone}.zone`,
    generatedAt,
    recordCount: input.records.length,
    zoneFile: `${lines.join('\n')}\n`,
  }

  void emitSuccessSignal({
    name: 'dns.zone.generated',
    operation: 'zones.generate',
    route: '/api/v1/zones/generate',
    statusCode: 200,
    attributes: {
      zone_name: result.zoneName,
      record_count: result.recordCount,
      serial: result.serial,
    },
  })

  return result
}
