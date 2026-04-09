import { promises as fs } from 'node:fs'
import path from 'node:path'

import { participantFormValuesFromRecord, type Obj3ParticipantRecord } from '@/lib/obj5-participant-config'

export type Obj7RequirementStatus = 'fulfilled' | 'partial' | 'open' | 'manual'
export type Obj7RequirementFilterStatus = Obj7RequirementStatus | 'ALL'
export type Obj7SourceType = 'NATO' | 'ARCH' | 'CUST' | 'INT'
export type Obj7Priority = 'MUSS' | 'SOLLTE' | 'KANN'

export interface Obj7RequirementRecord {
  key: string
  id: string
  title: string
  sourceType: Obj7SourceType
  priority: Obj7Priority
  originalText: string
  germanText: string
  acceptanceCriteria: string[]
  capabilityId: string
  capabilityName: string
  serviceId: string
  serviceName: string
  serviceFunctionId: string
  serviceFunctionName: string
  path: string
}

export interface Obj7ParticipantSnapshot {
  id: string
  name: string
  updatedAt: string
  values: ReturnType<typeof participantFormValuesFromRecord>
}

export interface Obj7RuleCheck {
  field: 'forwardZones' | 'reverseZones' | 'nameservers' | 'resolvers' | 'anycast'
  label: string
  passed: boolean
  evidence: string
}

export interface Obj7RequirementTraceabilityEntry extends Obj7RequirementRecord {
  status: Obj7RequirementStatus
  reasons: string[]
  ruleChecks: Obj7RuleCheck[]
  participantId: string | null
  participantName: string | null
  deepLink: string
}

export interface Obj7TraceabilitySummary {
  total: number
  fulfilled: number
  partial: number
  open: number
  manual: number
  mussOpen: number
}

export interface Obj7TraceabilityFilters {
  sourceType: Obj7SourceType | 'ALL'
  priority: Obj7Priority | 'ALL'
  status: Obj7RequirementFilterStatus
  onlyOpen: boolean
}

export interface Obj7TraceabilityData {
  generatedAt: string
  sourcePath: string
  participantSourcePath: string
  participant: {
    available: boolean
    count: number
    selected: {
      id: string
      name: string
      updatedAt: string
    } | null
  }
  summary: Obj7TraceabilitySummary
  filters: {
    sourceTypes: Obj7SourceType[]
    priorities: Obj7Priority[]
    statuses: Obj7RequirementStatus[]
  }
  requirements: Obj7RequirementTraceabilityEntry[]
  notice: string | null
}

interface CapabilityDashboardRequirement {
  key?: unknown
  id?: unknown
  title?: unknown
  sourceType?: unknown
  priority?: unknown
  originalText?: unknown
  germanText?: unknown
  acceptanceCriteria?: unknown
  capabilityId?: unknown
  capabilityName?: unknown
  serviceId?: unknown
  serviceName?: unknown
  serviceFunctionId?: unknown
  serviceFunctionName?: unknown
  path?: unknown
}

interface CapabilityDashboardServiceFunction {
  id?: unknown
  name?: unknown
  path?: unknown
  requirements?: unknown
}

interface CapabilityDashboardService {
  id?: unknown
  name?: unknown
  serviceFunctions?: unknown
}

interface CapabilityDashboardCapability {
  id?: unknown
  name?: unknown
  services?: unknown
}

interface CapabilityDashboardPayload {
  generatedAt?: unknown
  sourceRoot?: unknown
  sourceIndex?: unknown
  supportedSourceTypes?: unknown
  supportedPriorities?: unknown
  capabilities?: unknown
}

const repoRoot = process.cwd()
const capabilitiesPath = path.join(
  repoRoot,
  'capability-dashboard-live',
  'data',
  'capabilities-dashboard.json',
)
const participantsPath = path.join(repoRoot, 'data', 'obj3', 'participants.json')

const SOURCE_TYPES: Obj7SourceType[] = ['NATO', 'ARCH', 'CUST', 'INT']
const PRIORITIES: Obj7Priority[] = ['MUSS', 'SOLLTE', 'KANN']
const STATUSES: Obj7RequirementStatus[] = ['fulfilled', 'partial', 'open', 'manual']

const MANUAL_KEYWORDS = [
  'documentation',
  'dokumentation',
  'guide',
  'quick guide',
  'handbook',
  'readme',
  'overview',
  'traceability',
  'export',
  'import',
  'release',
  'change management',
  'governance',
  'approval',
  'architecture',
  'decision',
  'maturity',
  'maturitaet',
  'confluence',
  'book',
  'report',
  'dashboard',
  'manual',
]

function toString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((entry): entry is string => typeof entry === 'string')
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0)))
}

function safeDateSortDesc(left: string | null, right: string | null): number {
  const leftTime = left ? Date.parse(left) : Number.NEGATIVE_INFINITY
  const rightTime = right ? Date.parse(right) : Number.NEGATIVE_INFINITY
  if (leftTime === rightTime) {
    return 0
  }
  return rightTime - leftTime
}

function buildRequirementSearchText(requirement: Obj7RequirementRecord): string {
  return [
    requirement.title,
    requirement.originalText,
    requirement.germanText,
    requirement.acceptanceCriteria.join(' '),
  ]
    .filter((value) => value.trim().length > 0)
    .join(' ')
}

function normalizeDomain(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '')
}

function expandDomainSuffixes(value: string): string[] {
  const labels = normalizeDomain(value).split('.').filter(Boolean)
  const suffixes: string[] = []

  for (let index = 0; index < labels.length; index += 1) {
    suffixes.push(labels.slice(index).join('.'))
  }

  return suffixes
}

function extractDomainCandidates(text: string): string[] {
  const matches = text.match(
    /\b(?:[a-z0-9-]+\.)+[a-z0-9-]{2,63}(?:\.[a-z0-9-]{2,63})*\b/gi,
  )
  if (!matches) {
    return []
  }

  return uniqueStrings(
    matches
      .map((value) => normalizeDomain(value))
      .filter((value) => !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)),
  )
}

function extractIpv4Candidates(text: string): string[] {
  const matches = text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)
  if (!matches) {
    return []
  }

  return uniqueStrings(matches.map((value) => value.trim()))
}

function looksManual(requirementText: string): boolean {
  const lower = requirementText.toLowerCase()
  return MANUAL_KEYWORDS.some((keyword) => lower.includes(keyword))
}

function matchesRequirementFamily(requirementText: string, keywords: string[]): boolean {
  const lower = requirementText.toLowerCase()
  return keywords.some((keyword) => lower.includes(keyword))
}

function participantHasMeaningfulConfig(values: ReturnType<typeof participantFormValuesFromRecord>): boolean {
  const hasForwardZones = values.forwardZones.some((entry) => entry.value.trim().length > 0)
  const hasReverseZones = values.reverseZones.some((entry) => entry.value.trim().length > 0)
  const hasNameservers = values.nameservers.some(
    (entry) => entry.fqdn.trim().length > 0 && entry.ipv4.trim().length > 0,
  )
  const hasResolvers = values.resolvers.some(
    (entry) => entry.fqdn.trim().length > 0 && entry.ipv4.trim().length > 0,
  )
  const hasAnycast = values.anycastEnabled || values.anycastFqdn.trim().length > 0 || values.anycastIpv4.trim().length > 0

  return hasForwardZones || hasReverseZones || hasNameservers || hasResolvers || hasAnycast
}

function pickActiveParticipant(participants: Obj3ParticipantRecord[]): Obj7ParticipantSnapshot | null {
  const enriched = participants
    .map((participant) => ({
      id: participant.id,
      name: participant.name,
      updatedAt: participant.updatedAt,
      values: participantFormValuesFromRecord(participant),
    }))
    .filter((participant) => participantHasMeaningfulConfig(participant.values))

  if (enriched.length === 0) {
    return null
  }

  enriched.sort((left, right) => {
    const dateDiff = safeDateSortDesc(left.updatedAt, right.updatedAt)
    if (dateDiff !== 0) {
      return dateDiff
    }
    return left.name.localeCompare(right.name, 'de')
  })

  return enriched[0]
}

function makeRuleCheck(field: Obj7RuleCheck['field'], label: string, passed: boolean, evidence: string): Obj7RuleCheck {
  return {
    field,
    label,
    passed,
    evidence,
  }
}

function evaluateForwardZoneChecks(
  requirementText: string,
  participant: Obj7ParticipantSnapshot | null,
): Obj7RuleCheck[] {
  if (!matchesRequirementFamily(requirementText, ['forward zone', 'delegated zone', 'zone file', 'subzone'])) {
    return []
  }

  const candidateZones = extractDomainCandidates(requirementText).filter(
    (candidate) => !candidate.endsWith('.arpa'),
  )
  if (candidateZones.length === 0) {
    return []
  }

  if (!participant) {
    return candidateZones.map((candidate) =>
      makeRuleCheck('forwardZones', `Forward-Zone ${candidate}`, false, 'Keine OBJ-5-Konfiguration vorhanden'),
    )
  }

  const participantZones = new Set(
    participant.values.forwardZones
      .map((entry) => normalizeDomain(entry.value))
      .filter((value) => value.length > 0),
  )

  return uniqueStrings(candidateZones)
    .map((candidate) => {
      const suffixes = expandDomainSuffixes(candidate)
      const matchedZone = suffixes.find((suffix) => participantZones.has(suffix)) ?? null
      return makeRuleCheck(
        'forwardZones',
        `Forward-Zone ${candidate}`,
        Boolean(matchedZone),
        matchedZone ? `Gefunden in OBJ-5 als ${matchedZone}` : 'Nicht in OBJ-5 vorhanden',
      )
    })
}

function evaluateReverseZoneChecks(
  requirementText: string,
  participant: Obj7ParticipantSnapshot | null,
): Obj7RuleCheck[] {
  if (!matchesRequirementFamily(requirementText, ['reverse zone', 'in-addr.arpa', 'ptr'])) {
    return []
  }

  const candidateZones = extractDomainCandidates(requirementText).filter((candidate) =>
    candidate.endsWith('.arpa'),
  )
  if (candidateZones.length === 0) {
    return []
  }

  if (!participant) {
    return candidateZones.map((candidate) =>
      makeRuleCheck('reverseZones', `Reverse-Zone ${candidate}`, false, 'Keine OBJ-5-Konfiguration vorhanden'),
    )
  }

  const participantZones = new Set(
    participant.values.reverseZones
      .map((entry) => normalizeDomain(entry.value))
      .filter((value) => value.length > 0),
  )

  return uniqueStrings(candidateZones)
    .map((candidate) => {
      const suffixes = expandDomainSuffixes(candidate)
      const matchedZone = suffixes.find((suffix) => participantZones.has(suffix)) ?? null
      return makeRuleCheck(
        'reverseZones',
        `Reverse-Zone ${candidate}`,
        Boolean(matchedZone),
        matchedZone ? `Gefunden in OBJ-5 als ${matchedZone}` : 'Nicht in OBJ-5 vorhanden',
      )
    })
}

function evaluateNameserverChecks(
  requirementText: string,
  participant: Obj7ParticipantSnapshot | null,
): Obj7RuleCheck[] {
  if (!matchesRequirementFamily(requirementText, ['nameserver', 'name server', 'ns-record', 'ns record'])) {
    return []
  }

  const candidateHosts = extractDomainCandidates(requirementText).filter(
    (candidate) => !candidate.endsWith('.arpa'),
  )
  const countMatch = requirementText.match(
    /(?:mindestens|at least|minimum of)\s+(\d+)\s+(?:nameservers?|name servers?|ns-records?|ns records?)/i,
  )

  if (!participant) {
    if (candidateHosts.length > 0) {
      return candidateHosts.map((candidate) =>
        makeRuleCheck('nameservers', `Nameserver ${candidate}`, false, 'Keine OBJ-5-Konfiguration vorhanden'),
      )
    }

    if (countMatch) {
      return [
        makeRuleCheck(
          'nameservers',
          'Nameserver-Anzahl',
          false,
          'Keine OBJ-5-Konfiguration vorhanden',
        ),
      ]
    }
    return []
  }

  const participantHosts = new Set(
    participant.values.nameservers
      .map((entry) => normalizeDomain(entry.fqdn))
      .filter((value) => value.length > 0),
  )

  if (candidateHosts.length > 0) {
    return uniqueStrings(candidateHosts).map((candidate) =>
      makeRuleCheck(
        'nameservers',
        `Nameserver ${candidate}`,
        participantHosts.has(candidate),
        participantHosts.has(candidate) ? 'In OBJ-5 vorhanden' : 'Nicht in OBJ-5 vorhanden',
      ),
    )
  }

  if (countMatch) {
    const requiredCount = Number(countMatch[1])
    const actualCount = participant.values.nameservers.filter(
      (entry) => entry.fqdn.trim().length > 0 && entry.ipv4.trim().length > 0,
    ).length
    return [
      makeRuleCheck(
        'nameservers',
        'Nameserver-Anzahl',
        actualCount >= requiredCount,
        `${actualCount}/${requiredCount} Nameserver in OBJ-5 vorhanden`,
      ),
    ]
  }

  return []
}

function evaluateResolverChecks(
  requirementText: string,
  participant: Obj7ParticipantSnapshot | null,
): Obj7RuleCheck[] {
  if (!matchesRequirementFamily(requirementText, ['resolver', 'recursive resolver', 'unbound'])) {
    return []
  }

  const candidateHosts = extractDomainCandidates(requirementText).filter(
    (candidate) => !candidate.endsWith('.arpa'),
  )
  const countMatch = requirementText.match(
    /(?:mindestens|at least|minimum of)\s+(\d+)\s+(?:resolvers?|recursive resolvers?)/i,
  )

  if (!participant) {
    if (candidateHosts.length > 0) {
      return candidateHosts.map((candidate) =>
        makeRuleCheck('resolvers', `Resolver ${candidate}`, false, 'Keine OBJ-5-Konfiguration vorhanden'),
      )
    }

    if (countMatch) {
      return [
        makeRuleCheck(
          'resolvers',
          'Resolver-Anzahl',
          false,
          'Keine OBJ-5-Konfiguration vorhanden',
        ),
      ]
    }
    return []
  }

  const participantHosts = new Set(
    participant.values.resolvers
      .map((entry) => normalizeDomain(entry.fqdn))
      .filter((value) => value.length > 0),
  )

  if (candidateHosts.length > 0) {
    return uniqueStrings(candidateHosts).map((candidate) =>
      makeRuleCheck(
        'resolvers',
        `Resolver ${candidate}`,
        participantHosts.has(candidate),
        participantHosts.has(candidate) ? 'In OBJ-5 vorhanden' : 'Nicht in OBJ-5 vorhanden',
      ),
    )
  }

  if (countMatch) {
    const requiredCount = Number(countMatch[1])
    const actualCount = participant.values.resolvers.filter(
      (entry) => entry.fqdn.trim().length > 0 && entry.ipv4.trim().length > 0,
    ).length
    return [
      makeRuleCheck(
        'resolvers',
        'Resolver-Anzahl',
        actualCount >= requiredCount,
        `${actualCount}/${requiredCount} Resolver in OBJ-5 vorhanden`,
      ),
    ]
  }

  return []
}

function evaluateAnycastChecks(
  requirementText: string,
  participant: Obj7ParticipantSnapshot | null,
): Obj7RuleCheck[] {
  if (!matchesRequirementFamily(requirementText, ['anycast'])) {
    return []
  }

  if (!participant) {
    return [
      makeRuleCheck('anycast', 'Anycast aktiviert', false, 'Keine OBJ-5-Konfiguration vorhanden'),
    ]
  }

  const checks: Obj7RuleCheck[] = [
    makeRuleCheck(
      'anycast',
      'Anycast aktiviert',
      participant.values.anycastEnabled,
      participant.values.anycastEnabled ? 'Anycast ist in OBJ-5 aktiviert' : 'Anycast ist in OBJ-5 deaktiviert',
    ),
  ]

  const candidateHosts = uniqueStrings(
    extractDomainCandidates(requirementText).filter((candidate) => !candidate.endsWith('.arpa')),
  )
  if (candidateHosts.length > 0) {
    const participantAnycastHost = normalizeDomain(participant.values.anycastFqdn)
    const matchedHost = candidateHosts.find((candidate) => candidate === participantAnycastHost) ?? null
    checks.push(
      makeRuleCheck(
        'anycast',
        'Anycast-FQDN',
        Boolean(matchedHost),
        matchedHost ? `Gefunden in OBJ-5 als ${matchedHost}` : 'FQDN fehlt oder weicht ab',
      ),
    )
  } else if (participant.values.anycastFqdn.trim().length > 0) {
    checks.push(
      makeRuleCheck(
        'anycast',
        'Anycast-FQDN',
        true,
        `OBJ-5 hat ${normalizeDomain(participant.values.anycastFqdn)}`,
      ),
    )
  }

  const candidateIps = uniqueStrings(extractIpv4Candidates(requirementText))
  if (candidateIps.length > 0) {
    const matchedIp = candidateIps.find((candidate) => candidate === participant.values.anycastIpv4.trim()) ?? null
    checks.push(
      makeRuleCheck(
        'anycast',
        'Anycast-IPv4',
        Boolean(matchedIp),
        matchedIp ? `Gefunden in OBJ-5 als ${matchedIp}` : 'IPv4 fehlt oder weicht ab',
      ),
    )
  } else if (participant.values.anycastIpv4.trim().length > 0) {
    checks.push(
      makeRuleCheck(
        'anycast',
        'Anycast-IPv4',
        true,
        `OBJ-5 hat ${participant.values.anycastIpv4.trim()}`,
      ),
    )
  }

  return checks
}

function deriveManualReason(requirementText: string): string | null {
  if (!looksManual(requirementText)) {
    return null
  }

  return 'Anforderung ist fachlich/manuell zu pruefen; keine automatische Regel hinterlegt.'
}

function deriveStatusFromChecks(checks: Obj7RuleCheck[]): Obj7RequirementStatus {
  const passedCount = checks.filter((check) => check.passed).length
  if (passedCount === checks.length) {
    return 'fulfilled'
  }
  if (passedCount > 0) {
    return 'partial'
  }
  return 'open'
}

function evaluateRequirement(
  requirement: Obj7RequirementRecord,
  participant: Obj7ParticipantSnapshot | null,
): Obj7RequirementTraceabilityEntry {
  const requirementText = buildRequirementSearchText(requirement)
  const manualReason = deriveManualReason(requirementText)

  if (manualReason) {
    return {
      ...requirement,
      status: 'manual',
      reasons: [manualReason],
      ruleChecks: [],
      participantId: participant?.id ?? null,
      participantName: participant?.name ?? null,
      deepLink: `/capability-dashboard-live/#requirement-${encodeURIComponent(requirement.id)}`,
    }
  }

  const ruleChecks = [
    ...evaluateForwardZoneChecks(requirementText, participant),
    ...evaluateReverseZoneChecks(requirementText, participant),
    ...evaluateNameserverChecks(requirementText, participant),
    ...evaluateResolverChecks(requirementText, participant),
    ...evaluateAnycastChecks(requirementText, participant),
  ]

  if (ruleChecks.length === 0) {
    return {
      ...requirement,
      status: 'manual',
      reasons: ['Keine automatische Regel hinterlegt; fachlich manuell pruefen.'],
      ruleChecks: [],
      participantId: participant?.id ?? null,
      participantName: participant?.name ?? null,
      deepLink: `/capability-dashboard-live/#requirement-${encodeURIComponent(requirement.id)}`,
    }
  }

  if (!participant) {
    return {
      ...requirement,
      status: 'open',
      reasons: [
        'Keine OBJ-5-Konfiguration vorhanden; automatische Pruefung kann noch nicht positiv bewertet werden.',
      ],
      ruleChecks,
      participantId: null,
      participantName: null,
      deepLink: `/capability-dashboard-live/#requirement-${encodeURIComponent(requirement.id)}`,
    }
  }

  const status = deriveStatusFromChecks(ruleChecks)
  const passedChecks = ruleChecks.filter((check) => check.passed)
  const failedChecks = ruleChecks.filter((check) => !check.passed)

  const reasons =
    status === 'fulfilled'
      ? passedChecks.map((check) => `${check.label}: ${check.evidence}`)
      : status === 'partial'
        ? [
            ...passedChecks.map((check) => `${check.label}: ${check.evidence}`),
            ...failedChecks.map((check) => `${check.label}: ${check.evidence}`),
          ]
        : failedChecks.map((check) => `${check.label}: ${check.evidence}`)

  return {
    ...requirement,
    status,
    reasons,
    ruleChecks,
    participantId: participant.id,
    participantName: participant.name,
    deepLink: `/capability-dashboard-live/#requirement-${encodeURIComponent(requirement.id)}`,
  }
}

function flattenRequirements(payload: CapabilityDashboardPayload): Obj7RequirementRecord[] {
  const requirements: Obj7RequirementRecord[] = []
  const capabilities = Array.isArray(payload.capabilities) ? payload.capabilities : []

  for (const capabilityRaw of capabilities) {
    const capability = capabilityRaw as CapabilityDashboardCapability
    const services = Array.isArray(capability.services) ? capability.services : []

    for (const serviceRaw of services) {
      const service = serviceRaw as CapabilityDashboardService
      const serviceFunctions = Array.isArray(service.serviceFunctions)
        ? service.serviceFunctions
        : []

      for (const serviceFunctionRaw of serviceFunctions) {
        const serviceFunction = serviceFunctionRaw as CapabilityDashboardServiceFunction
        const rawRequirements = Array.isArray(serviceFunction.requirements)
          ? serviceFunction.requirements
          : []

        for (const requirementRaw of rawRequirements) {
          const requirement = requirementRaw as CapabilityDashboardRequirement
          const id = toString(requirement.id)
          const title = toString(requirement.title)
          const sourceType = toString(requirement.sourceType) as Obj7SourceType
          const priority = toString(requirement.priority) as Obj7Priority

          if (!id || !title || !SOURCE_TYPES.includes(sourceType) || !PRIORITIES.includes(priority)) {
            continue
          }

          requirements.push({
            key: toString(requirement.key) || id,
            id,
            title,
            sourceType,
            priority,
            originalText: toString(requirement.originalText),
            germanText: toString(requirement.germanText),
            acceptanceCriteria: toStringArray(requirement.acceptanceCriteria),
            capabilityId: toString(requirement.capabilityId) || toString(capability.id),
            capabilityName: toString(capability.name),
            serviceId: toString(requirement.serviceId) || toString(service.id),
            serviceName: toString(service.name),
            serviceFunctionId:
              toString(requirement.serviceFunctionId) || toString(serviceFunction.id),
            serviceFunctionName: toString(serviceFunction.name),
            path: toString(requirement.path),
          })
        }
      }
    }
  }

  requirements.sort((left, right) => {
    const capabilityDiff = left.capabilityId.localeCompare(right.capabilityId, 'de')
    if (capabilityDiff !== 0) {
      return capabilityDiff
    }
    const serviceDiff = left.serviceId.localeCompare(right.serviceId, 'de')
    if (serviceDiff !== 0) {
      return serviceDiff
    }
    const serviceFunctionDiff = left.serviceFunctionId.localeCompare(right.serviceFunctionId, 'de')
    if (serviceFunctionDiff !== 0) {
      return serviceFunctionDiff
    }
    return left.id.localeCompare(right.id, 'de')
  })

  return requirements
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function summarizeRequirements(
  requirements: Obj7RequirementTraceabilityEntry[],
): Obj7TraceabilitySummary {
  return requirements.reduce<Obj7TraceabilitySummary>(
    (accumulator, entry) => {
      accumulator.total += 1
      accumulator[entry.status] += 1
      if (entry.priority === 'MUSS' && entry.status === 'open') {
        accumulator.mussOpen += 1
      }
      return accumulator
    },
    {
      total: 0,
      fulfilled: 0,
      partial: 0,
      open: 0,
      manual: 0,
      mussOpen: 0,
    },
  )
}

function buildNotice(participant: Obj7ParticipantSnapshot | null, participantCount: number): string | null {
  if (participant) {
    return `Aktive OBJ-5-Konfiguration: ${participant.name}`
  }

  if (participantCount === 0) {
    return 'Keine OBJ-5-Konfiguration gefunden. Objektive Requirements werden als open angezeigt, manuelle als manual.'
  }

  return 'Es liegt zwar eine OBJ-5-Datenbasis vor, aber keine verwertbare Konfiguration wurde gefunden.'
}

export function filterTraceabilityEntries(
  entries: Obj7RequirementTraceabilityEntry[],
  filters: Obj7TraceabilityFilters,
): Obj7RequirementTraceabilityEntry[] {
  return entries.filter((entry) => {
    if (filters.sourceType !== 'ALL' && entry.sourceType !== filters.sourceType) {
      return false
    }
    if (filters.priority !== 'ALL' && entry.priority !== filters.priority) {
      return false
    }
    if (filters.onlyOpen && entry.status !== 'open') {
      return false
    }
    if (filters.status !== 'ALL' && entry.status !== filters.status) {
      return false
    }
    return true
  })
}

export async function loadObj7TraceabilityData(): Promise<Obj7TraceabilityData> {
  const [capabilitiesPayload, participantsPayload] = await Promise.all([
    readJsonFile<CapabilityDashboardPayload>(capabilitiesPath),
    readJsonFile<Obj3ParticipantRecord[]>(participantsPath),
  ])

  const requirements = flattenRequirements(capabilitiesPayload ?? { capabilities: [] })
  const participantList = Array.isArray(participantsPayload) ? participantsPayload : []
  const activeParticipant = pickActiveParticipant(participantList)

  const entries = requirements.map((requirement) =>
    evaluateRequirement(requirement, activeParticipant),
  )

  const summary = summarizeRequirements(entries)

  return {
    generatedAt:
      typeof capabilitiesPayload?.generatedAt === 'string'
        ? capabilitiesPayload.generatedAt
        : new Date().toISOString(),
    sourcePath: 'capability-dashboard-live/data/capabilities-dashboard.json',
    participantSourcePath: 'data/obj3/participants.json',
    participant: {
      available: Boolean(activeParticipant),
      count: participantList.length,
      selected: activeParticipant
        ? {
            id: activeParticipant.id,
            name: activeParticipant.name,
            updatedAt: activeParticipant.updatedAt,
          }
        : null,
    },
    summary,
    filters: {
      sourceTypes: SOURCE_TYPES,
      priorities: PRIORITIES,
      statuses: STATUSES,
    },
    requirements: entries,
    notice: buildNotice(activeParticipant, participantList.length),
  }
}

export const obj7TraceabilityInternals = {
  buildRequirementSearchText,
  deriveManualReason,
  evaluateAnycastChecks,
  evaluateForwardZoneChecks,
  evaluateNameserverChecks,
  evaluateRequirement,
  evaluateResolverChecks,
  evaluateReverseZoneChecks,
  filterTraceabilityEntries,
  flattenRequirements,
  loadObj7TraceabilityData,
  participantHasMeaningfulConfig,
  pickActiveParticipant,
}
