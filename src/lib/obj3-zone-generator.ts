import { z } from 'zod'

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
  const serial = toSerial(generatedAtDate)
  const ttl = input.defaultTtl ?? 3600
  const zone = input.zoneName.toLowerCase()
  const soaHost = `ns1.${zone}.`
  const adminMail = `hostmaster.${zone}.`

  const lines: string[] = []
  lines.push(`$TTL ${ttl}`)
  lines.push(`@ IN SOA ${soaHost} ${adminMail} (`)
  lines.push(`  ${serial} ; serial`)
  lines.push('  7200 ; refresh')
  lines.push('  3600 ; retry')
  lines.push('  1209600 ; expire')
  lines.push(`  ${ttl} ; minimum`)
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

  return {
    zoneName: zone,
    serial,
    fileName: `${zone}.zone`,
    generatedAt,
    recordCount: input.records.length,
    zoneFile: `${lines.join('\n')}\n`,
  }
}
