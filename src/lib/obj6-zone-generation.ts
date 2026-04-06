import { z } from 'zod'

import { isValidIpv4, type Obj3ParticipantRecord } from '@/lib/obj5-participant-config'

export interface Obj6SoaSettings {
  defaultTtl: number
  serial: string
  primaryNs: string
  adminMail: string
  refresh: number
  retry: number
  expire: number
  minimum: number
}

export interface ZoneGenerationApiPayload {
  zoneName: string
  defaultTtl?: number
  serial?: string
  soa?: {
    primaryNs?: string
    adminMail?: string
    refresh?: number
    retry?: number
    expire?: number
    minimum?: number
  }
  records: Array<{
    name: string
    type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'TXT' | 'PTR'
    value: string
    ttl?: number
  }>
}

export interface PreparedZoneGenerationInput {
  participantId: string
  participantName: string
  forward: ZoneGenerationApiPayload
  reverse: ZoneGenerationApiPayload[]
  warnings: string[]
}

const metadataSchema = z.object({
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
})

interface HostEntry {
  fqdn: string
  ipv4: string
}

function normalizeZone(zone: string): string {
  return zone.trim().toLowerCase().replace(/\.$/, '')
}

function normalizeFqdn(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '')
}

function zoneRecordNameForFqdn(zoneName: string, fqdn: string): string {
  const normalizedZone = normalizeZone(zoneName)
  const normalizedFqdn = normalizeFqdn(fqdn)

  if (normalizedFqdn === normalizedZone) {
    return '@'
  }

  if (normalizedFqdn.endsWith(`.${normalizedZone}`)) {
    return normalizedFqdn.slice(0, normalizedFqdn.length - normalizedZone.length - 1)
  }

  return normalizedFqdn
}

function buildUniqueHostEntries(input: HostEntry[]): HostEntry[] {
  const seen = new Set<string>()
  const result: HostEntry[] = []

  for (const entry of input) {
    const fqdn = normalizeFqdn(entry.fqdn)
    const ipv4 = entry.ipv4.trim()
    if (!fqdn || !isValidIpv4(ipv4)) {
      continue
    }

    const key = `${fqdn}|${ipv4}`
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push({ fqdn, ipv4 })
  }

  return result
}

function buildForwardRecords(zoneName: string, hosts: HostEntry[]): ZoneGenerationApiPayload['records'] {
  const records: ZoneGenerationApiPayload['records'] = []

  for (const host of hosts) {
    records.push({
      name: '@',
      type: 'NS',
      value: host.fqdn,
    })
  }

  for (const host of hosts) {
    records.push({
      name: zoneRecordNameForFqdn(zoneName, host.fqdn),
      type: 'A',
      value: host.ipv4,
    })
  }

  return records
}

function ptrNameForZone(ipv4: string, reverseZone: string): string | null {
  const zone = normalizeZone(reverseZone)
  if (!zone.endsWith('.in-addr.arpa')) {
    return null
  }

  const octets = ipv4.split('.')
  if (octets.length !== 4 || octets.some((entry) => !/^\d+$/.test(entry))) {
    return null
  }

  const reversedIp = octets.slice().reverse()
  const zoneOctets = zone.replace('.in-addr.arpa', '').split('.').filter(Boolean)

  if (zoneOctets.length >= reversedIp.length) {
    return null
  }

  const ipSuffix = reversedIp.slice(reversedIp.length - zoneOctets.length)
  if (ipSuffix.join('.') !== zoneOctets.join('.')) {
    return null
  }

  const remaining = reversedIp.slice(0, reversedIp.length - zoneOctets.length)
  if (remaining.length === 0) {
    return null
  }

  return remaining.join('.')
}

function buildSoaPayload(settings: Obj6SoaSettings): ZoneGenerationApiPayload['soa'] {
  return {
    primaryNs: settings.primaryNs.trim() || undefined,
    adminMail: settings.adminMail.trim() || undefined,
    refresh: settings.refresh,
    retry: settings.retry,
    expire: settings.expire,
    minimum: settings.minimum,
  }
}

export function createDefaultObj6SoaSettings(): Obj6SoaSettings {
  return {
    defaultTtl: 3600,
    serial: '',
    primaryNs: '',
    adminMail: '',
    refresh: 7200,
    retry: 3600,
    expire: 1209600,
    minimum: 3600,
  }
}

export function prepareZoneGenerationInputFromParticipant(
  participant: Obj3ParticipantRecord,
  settings: Obj6SoaSettings,
): PreparedZoneGenerationInput {
  const metadataCandidate =
    participant.metadata &&
    typeof participant.metadata === 'object' &&
    participant.metadata.obj5 &&
    typeof participant.metadata.obj5 === 'object'
      ? participant.metadata.obj5
      : null

  const parsedMetadata = metadataSchema.safeParse(metadataCandidate)
  if (!parsedMetadata.success) {
    throw new Error(
      'Participant hat keine gueltigen OBJ-5 Metadaten. Bitte Konfiguration zuerst im OBJ-5 Formular speichern.',
    )
  }

  const metadata = parsedMetadata.data
  const forwardZones = (metadata.delegatedZones?.forward ?? []).map(normalizeZone).filter(Boolean)
  const reverseZones = (metadata.delegatedZones?.reverse ?? []).map(normalizeZone).filter(Boolean)

  if (forwardZones.length === 0) {
    throw new Error('Keine Forward-Zone vorhanden. Bitte OBJ-5 Konfiguration pruefen.')
  }

  const nameservers = buildUniqueHostEntries(metadata.nameservers ?? [])
  if (nameservers.length < 2) {
    throw new Error(
      'Mindestens zwei gueltige Nameserver fuer die Generierung erforderlich (SREQ-613).',
    )
  }

  const resolvers = buildUniqueHostEntries(metadata.resolvers ?? [])
  const hostsForARecords = buildUniqueHostEntries([...nameservers, ...resolvers])

  const anycastEnabled = Boolean(metadata.anycast?.enabled)
  const anycastEntry =
    anycastEnabled && metadata.anycast?.fqdn && metadata.anycast?.ipv4
      ? buildUniqueHostEntries([
          { fqdn: metadata.anycast.fqdn, ipv4: metadata.anycast.ipv4 },
        ])[0]
      : null

  const forwardZone = forwardZones[0]
  const warnings: string[] = []
  if (forwardZones.length > 1) {
    warnings.push(
      `Es sind ${forwardZones.length} Forward-Zonen vorhanden. Generiert wird aktuell die erste Zone (${forwardZone}).`,
    )
  }

  const forwardRecords = buildForwardRecords(
    forwardZone,
    anycastEntry ? [...hostsForARecords, anycastEntry] : hostsForARecords,
  )

  const soa = buildSoaPayload(settings)
  const forwardPayload: ZoneGenerationApiPayload = {
    zoneName: forwardZone,
    defaultTtl: settings.defaultTtl,
    serial: settings.serial.trim() || undefined,
    soa,
    records: forwardRecords,
  }

  const ptrSources = anycastEntry
    ? [...hostsForARecords, anycastEntry]
    : hostsForARecords
  const reversePayloads: ZoneGenerationApiPayload[] = []

  for (const reverseZone of reverseZones) {
    const ptrRecords: ZoneGenerationApiPayload['records'] = []
    for (const source of ptrSources) {
      const ptrName = ptrNameForZone(source.ipv4, reverseZone)
      if (!ptrName) {
        continue
      }
      ptrRecords.push({
        name: ptrName,
        type: 'PTR',
        value: `${source.fqdn}.`,
      })
    }

    if (ptrRecords.length === 0) {
      warnings.push(
        `Reverse-Zone ${reverseZone} wurde uebersprungen, weil keine PTR-Records aus den vorhandenen IPs abgeleitet werden konnten.`,
      )
      continue
    }

    reversePayloads.push({
      zoneName: reverseZone,
      defaultTtl: settings.defaultTtl,
      serial: settings.serial.trim() || undefined,
      soa,
      records: ptrRecords,
    })
  }

  if (reverseZones.length === 0) {
    warnings.push('Keine Reverse-Zone konfiguriert. Es wird nur die Forward-Zone erzeugt.')
  }

  return {
    participantId: participant.id,
    participantName: participant.name,
    forward: forwardPayload,
    reverse: reversePayloads,
    warnings,
  }
}
