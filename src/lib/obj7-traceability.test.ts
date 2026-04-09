import { describe, expect, it } from 'vitest'

import type { Obj3ParticipantRecord } from '@/lib/obj5-participant-config'

import {
  filterTraceabilityEntries,
  obj7TraceabilityInternals,
  type Obj7RequirementRecord,
  type Obj7RequirementTraceabilityEntry,
} from './obj7-traceability'

function createParticipantRecord(
  overrides: Partial<Obj3ParticipantRecord> = {},
): Obj3ParticipantRecord {
  return {
    id: 'participant-alpha',
    name: 'Participant Alpha',
    fqdn: 'ns1.core.ndp.che',
    ipv4: '10.0.0.11',
    role: 'Mission Network Operator',
    notes: null,
    metadata: {
      obj5: {
        delegatedZones: {
          forward: ['core.ndp.che'],
          reverse: ['0.0.10.in-addr.arpa'],
        },
        nameservers: [
          { fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' },
          { fqdn: 'ns2.core.ndp.che', ipv4: '10.0.0.12' },
        ],
        resolvers: [
          { fqdn: 'rs1.core.ndp.che', ipv4: '10.0.0.21' },
          { fqdn: 'rs2.core.ndp.che', ipv4: '10.0.0.22' },
        ],
        anycast: {
          enabled: true,
          fqdn: 'ns-anycast.core.ndp.che',
          ipv4: '10.0.0.53',
        },
      },
    },
    createdAt: '2026-04-09T10:00:00.000Z',
    updatedAt: '2026-04-09T10:00:00.000Z',
    ...overrides,
  }
}

function createRequirement(
  overrides: Partial<Obj7RequirementTraceabilityEntry>,
): Obj7RequirementTraceabilityEntry {
  return {
    key: 'requirement:test',
    id: 'SREQ-TEST',
    title: 'Test Requirement',
    sourceType: 'NATO',
    priority: 'MUSS',
    originalText: '',
    germanText: '',
    acceptanceCriteria: [],
    capabilityId: 'CAP-001',
    capabilityName: 'Domain Naming',
    serviceId: 'SVC-AUTH',
    serviceName: 'Authoritative Name Services',
    serviceFunctionId: 'SFN-TIN26',
    serviceFunctionName: 'DNS Query (Authoritative)',
    path: 'capabilities/test.md',
    status: 'open',
    reasons: [],
    ruleChecks: [],
    participantId: null,
    participantName: null,
    deepLink: '/capability-dashboard-live/#requirement-SREQ-TEST',
    ...overrides,
  }
}

describe('OBJ-7 traceability evaluation', () => {
  it('marks explicit objective requirements as fulfilled when OBJ-5 data matches', () => {
    const participant = obj7TraceabilityInternals.pickActiveParticipant([
      createParticipantRecord(),
    ])

    const requirement = {
      key: 'requirement:cap-001:sfn-tin26:sreq-001',
      id: 'SREQ-001',
      title: 'Delegierte Zone core.ndp.che und Reverse-Zone',
      sourceType: 'CUST',
      priority: 'MUSS',
      originalText: 'Delegated Zone: core.ndp.che and 0.0.10.in-addr.arpa',
      germanText: 'Der DNS-Service muss die delegierten Zonen core.ndp.che und 0.0.10.in-addr.arpa bedienen.',
      acceptanceCriteria: ['core.ndp.che', '0.0.10.in-addr.arpa'],
      capabilityId: 'CAP-001',
      capabilityName: 'Domain Naming',
      serviceId: 'SVC-AUTH',
      serviceName: 'Authoritative Name Services',
      serviceFunctionId: 'SFN-TIN26',
      serviceFunctionName: 'DNS Query (Authoritative)',
      path: 'capabilities/test.md',
    } as const satisfies Obj7RequirementRecord

    const result = obj7TraceabilityInternals.evaluateRequirement(
      requirement,
      participant,
    )

    expect(result.status).toBe('fulfilled')
    expect(result.reasons.join(' ')).toContain('core.ndp.che')
    expect(result.reasons.join(' ')).toContain('0.0.10.in-addr.arpa')
  })

  it('marks anycast requirements as partial when only some facts match', () => {
    const participant = obj7TraceabilityInternals.pickActiveParticipant([
      createParticipantRecord({
        metadata: {
          obj5: {
            anycast: {
              enabled: true,
              fqdn: 'ns-anycast.core.ndp.che',
              ipv4: '10.0.0.99',
            },
          },
        },
      }),
    ])

    const requirement = {
      key: 'requirement:cap-001:sfn-tin114:sreq-609',
      id: 'SREQ-609',
      title: 'Anycast mit konfigurierbarer Adresse',
      sourceType: 'NATO',
      priority: 'MUSS',
      originalText:
        'The Domain Name Service shall support anycast with a configurable address 10.0.0.53.',
      germanText:
        'Anycast muss mit konfigurierbarer Adresse 10.0.0.53 funktionieren.',
      acceptanceCriteria: ['Anycast aktiviert', 'IPv4 10.0.0.53 muss passen'],
      capabilityId: 'CAP-001',
      capabilityName: 'Domain Naming',
      serviceId: 'SVC-AUTH',
      serviceName: 'Authoritative Name Services',
      serviceFunctionId: 'SFN-TIN114',
      serviceFunctionName: 'Anycast DNS Advertising',
      path: 'capabilities/test.md',
    } as const satisfies Obj7RequirementRecord

    const result = obj7TraceabilityInternals.evaluateRequirement(
      requirement,
      participant,
    )

    expect(result.status).toBe('partial')
    expect(result.reasons.join(' ')).toContain('Anycast aktiviert')
  })

  it('marks manual requirements as manual', () => {
    const result = obj7TraceabilityInternals.evaluateRequirement(
      createRequirement({
        title: 'Dokumentation fuer Release und Export',
        originalText: 'Release notes and documentation must be maintained.',
        germanText: 'Die Dokumentation muss gepflegt werden.',
      }),
      null,
    )

    expect(result.status).toBe('manual')
    expect(result.reasons[0]).toContain('manuell')
  })

  it('marks objective requirements as open when no OBJ-5 configuration is available', () => {
    const result = obj7TraceabilityInternals.evaluateRequirement(
      createRequirement({
        title: 'Nameserver ns1.core.ndp.che und ns2.core.ndp.che',
        originalText: 'Name servers: ns1.core.ndp.che and ns2.core.ndp.che',
        germanText: 'Die Nameserver ns1.core.ndp.che und ns2.core.ndp.che muessen vorhanden sein.',
      }),
      null,
    )

    expect(result.status).toBe('open')
    expect(result.reasons.join(' ')).toContain('Keine OBJ-5-Konfiguration')
  })
})

describe('OBJ-7 filter logic', () => {
  it('filters by source, priority, status and open-only toggle', () => {
    const entries: Obj7RequirementTraceabilityEntry[] = [
      createRequirement({
        id: 'SREQ-1',
        sourceType: 'NATO',
        priority: 'MUSS',
        status: 'open',
      }),
      createRequirement({
        id: 'SREQ-2',
        sourceType: 'ARCH',
        priority: 'SOLLTE',
        status: 'fulfilled',
      }),
      createRequirement({
        id: 'SREQ-3',
        sourceType: 'CUST',
        priority: 'MUSS',
        status: 'manual',
      }),
    ]

    const filtered = filterTraceabilityEntries(entries, {
      sourceType: 'NATO',
      priority: 'MUSS',
      status: 'ALL',
      onlyOpen: true,
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('SREQ-1')
  })
})
