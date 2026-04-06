import { describe, expect, it } from 'vitest'

import type { Obj3ParticipantRecord } from '@/lib/obj5-participant-config'

import {
  createDefaultObj6SoaSettings,
  prepareZoneGenerationInputFromParticipant,
} from './obj6-zone-generation'

function createParticipant(overrides?: Partial<Obj3ParticipantRecord>): Obj3ParticipantRecord {
  return {
    id: 'participant-alpha',
    name: 'Participant Alpha',
    fqdn: 'ns1.core.ndp.che',
    ipv4: '10.0.0.11',
    role: 'Mission Network Operator',
    notes: null,
    createdAt: '2026-04-06T00:00:00.000Z',
    updatedAt: '2026-04-06T00:00:00.000Z',
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
        resolvers: [{ fqdn: 'resolver1.core.ndp.che', ipv4: '10.0.0.21' }],
        anycast: {
          enabled: true,
          fqdn: 'ns-anycast.core.ndp.che',
          ipv4: '10.0.0.53',
        },
      },
    },
    ...(overrides ?? {}),
  }
}

describe('prepareZoneGenerationInputFromParticipant', () => {
  it('builds forward and reverse payloads from OBJ-5 participant metadata', () => {
    const prepared = prepareZoneGenerationInputFromParticipant(
      createParticipant(),
      createDefaultObj6SoaSettings(),
    )

    expect(prepared.forward.zoneName).toBe('core.ndp.che')
    expect(prepared.forward.records.some((record) => record.type === 'NS')).toBe(true)
    expect(
      prepared.forward.records.some(
        (record) => record.type === 'A' && record.value === '10.0.0.53',
      ),
    ).toBe(true)

    expect(prepared.reverse).toHaveLength(1)
    expect(prepared.reverse[0].zoneName).toBe('0.0.10.in-addr.arpa')
    expect(prepared.reverse[0].records.some((record) => record.type === 'PTR')).toBe(
      true,
    )
  })

  it('throws when mandatory OBJ-5 data is missing', () => {
    const participant = createParticipant({
      metadata: {
        obj5: {
          delegatedZones: { forward: [] },
          nameservers: [{ fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' }],
        },
      },
    })

    expect(() =>
      prepareZoneGenerationInputFromParticipant(
        participant,
        createDefaultObj6SoaSettings(),
      ),
    ).toThrow()
  })
})
