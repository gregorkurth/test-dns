import { describe, expect, it } from 'vitest'

import {
  buildParticipantUpsertPayload,
  createDefaultParticipantFormValues,
  participantFormSchema,
  participantFormValuesFromRecord,
  type Obj3ParticipantRecord,
} from './obj5-participant-config'

function createValidFormValues() {
  return {
    ...createDefaultParticipantFormValues(),
    participantName: 'Alpha',
    ccNumber: 'CC-517',
    pocName: 'Jane Doe',
    pocEmail: 'jane@example.org',
    forwardZones: [{ value: 'CORE.NDP.CHE' }],
    nameservers: [
      { fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' },
      { fqdn: 'ns2.core.ndp.che', ipv4: '10.0.0.12' },
    ],
  }
}

describe('participantFormSchema', () => {
  it('enforces at least two nameservers (SREQ-613 guard)', () => {
    const values = createValidFormValues()
    values.nameservers = [{ fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' }]

    const parsed = participantFormSchema.safeParse(values)
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => issue.message)
      expect(messages.some((message) => message.includes('Mindestens 2 Nameserver'))).toBe(true)
    }
  })
})

describe('buildParticipantUpsertPayload', () => {
  it('normalizes zones and writes obj5 metadata payload', () => {
    const payload = buildParticipantUpsertPayload(createValidFormValues())

    expect(payload).toMatchObject({
      name: 'Alpha',
      fqdn: 'ns1.core.ndp.che',
      ipv4: '10.0.0.11',
      role: 'Mission Network Operator',
    })
    expect(payload.metadata).toMatchObject({
      obj5: {
        ccNumber: 'CC-517',
        delegatedZones: {
          forward: ['core.ndp.che'],
        },
        nameservers: [
          { fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' },
          { fqdn: 'ns2.core.ndp.che', ipv4: '10.0.0.12' },
        ],
      },
    })
  })
})

describe('participantFormValuesFromRecord', () => {
  it('hydrates form from participant metadata when obj5 payload exists', () => {
    const record: Obj3ParticipantRecord = {
      id: 'alpha',
      name: 'Alpha',
      fqdn: 'ns1.core.ndp.che',
      ipv4: '10.0.0.11',
      role: 'Mission Network Operator',
      notes: 'legacy note',
      createdAt: '2026-04-06T18:00:00.000Z',
      updatedAt: '2026-04-06T18:00:00.000Z',
      metadata: {
        obj5: {
          ccNumber: 'CC-900',
          poc: {
            name: 'MNO Ops',
            email: 'ops@example.org',
          },
          spiralVersion: 'SP4',
          delegatedZones: {
            forward: ['core.ndp.che'],
            reverse: ['0.168.192.in-addr.arpa'],
          },
          nameservers: [
            { fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' },
            { fqdn: 'ns2.core.ndp.che', ipv4: '10.0.0.12' },
          ],
          resolvers: [{ fqdn: 'resolver.core.ndp.che', ipv4: '10.0.0.21' }],
          anycast: {
            enabled: true,
            fqdn: 'ns-anycast.core.ndp.che',
            ipv4: '10.0.0.53',
          },
          notes: 'from metadata',
        },
      },
    }

    const values = participantFormValuesFromRecord(record)
    expect(values.participantName).toBe('Alpha')
    expect(values.ccNumber).toBe('CC-900')
    expect(values.spiralVersion).toBe('SP4')
    expect(values.forwardZones).toEqual([{ value: 'core.ndp.che' }])
    expect(values.reverseZones).toEqual([{ value: '0.168.192.in-addr.arpa' }])
    expect(values.nameservers).toHaveLength(2)
    expect(values.anycastEnabled).toBe(true)
    expect(values.anycastFqdn).toBe('ns-anycast.core.ndp.che')
    expect(values.notes).toBe('from metadata')
  })
})
