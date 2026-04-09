import { describe, expect, it } from 'vitest'

import {
  buildObj8ArchiveEntries,
  buildObj8ConfigExportDocument,
  buildObj8JsonFileName,
  buildObj8ZipFileName,
  buildObj8ZoneFileName,
  buildZipArchive,
  createObj8ExportDraftFromParticipant,
  parseObj8ConfigExportDocument,
  sanitizeObj8FileNameSegment,
} from './obj8-export'
import {
  buildParticipantUpsertPayload,
  createDefaultParticipantFormValues,
  type Obj3ParticipantRecord,
} from './obj5-participant-config'

function createValidParticipant(): Obj3ParticipantRecord {
  const configuration = {
    ...createDefaultParticipantFormValues(),
    participantName: 'Alpha Mission',
    ccNumber: 'CC 517 / Alpha',
    pocName: 'Jane Doe',
    pocEmail: 'jane@example.org',
    forwardZones: [{ value: 'core.ndp.che' }],
    reverseZones: [{ value: '0.0.10.in-addr.arpa' }],
    nameservers: [
      { fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' },
      { fqdn: 'ns2.core.ndp.che', ipv4: '10.0.0.12' },
    ],
  }

  const payload = buildParticipantUpsertPayload(configuration)
  return {
    id: 'participant-alpha',
    name: configuration.participantName,
    fqdn: payload.fqdn ?? null,
    ipv4: payload.ipv4 ?? null,
    role: payload.role,
    notes: payload.notes ?? null,
    metadata: payload.metadata,
    createdAt: '2026-04-09T10:00:00.000Z',
    updatedAt: '2026-04-09T10:00:00.000Z',
  }
}

describe('sanitizeObj8FileNameSegment', () => {
  it('removes unsafe characters and keeps a fallback', () => {
    expect(sanitizeObj8FileNameSegment('CC 517 / Alpha!')).toBe('cc-517-alpha')
    expect(sanitizeObj8FileNameSegment('')).toBe('export')
  })
})

describe('file naming helpers', () => {
  it('builds safe download filenames', () => {
    expect(buildObj8JsonFileName('CC 517 / Alpha')).toBe('cc-517-alpha-dns-config.json')
    expect(buildObj8ZipFileName('CC 517 / Alpha')).toBe('cc-517-alpha-dns-export.zip')
    expect(buildObj8ZoneFileName('Core.NDP.CHE.', 'forward')).toBe('core.ndp.che.zone')
    expect(buildObj8ZoneFileName('0.168.192.in-addr.arpa', 'reverse')).toBe(
      '0.168.192.in-addr.arpa.reverse.zone',
    )
  })
})

describe('export draft and manifest', () => {
  it('creates a ready draft with manifest and download files', () => {
    const participant = createValidParticipant()
    const draft = createObj8ExportDraftFromParticipant(participant)

    expect(draft.ready).toBe(true)
    expect(draft.validationIssues).toHaveLength(0)
    expect(draft.zipFileName).toBe('cc-517-alpha-dns-export.zip')
    expect(draft.files.map((file) => file.fileName)).toEqual([
      'core.ndp.che.zone',
      '0.0.10.in-addr.arpa.reverse.zone',
      'named.conf.local.snippet',
      'tsig-keygen.sh',
      'cc-517-alpha-dns-config.json',
    ])
    expect(draft.manifest.exportVersion).toBe('obj8-export-v1')
    expect(draft.manifest.files.map((file) => file.fileName)).toEqual([
      'core.ndp.che.zone',
      '0.0.10.in-addr.arpa.reverse.zone',
      'named.conf.local.snippet',
      'tsig-keygen.sh',
      'cc-517-alpha-dns-config.json',
    ])
    expect(draft.manifest.warnings).toEqual([])
  })

  it('blocks export when the configuration is incomplete', () => {
    const participant = createValidParticipant()
    participant.metadata = {
      obj5: {
        ...participant.metadata.obj5,
        nameservers: [{ fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' }],
      },
    }

    const draft = createObj8ExportDraftFromParticipant(participant)
    expect(draft.ready).toBe(false)
    expect(draft.validationIssues.length).toBeGreaterThan(0)
  })
})

describe('JSON import validation', () => {
  it('rejects invalid or mismatched JSON with a friendly error', () => {
    const participant = createValidParticipant()
    const configuration = buildParticipantUpsertPayload({
      ...createDefaultParticipantFormValues(),
      participantName: 'Alpha Mission',
      ccNumber: 'CC 999',
      pocName: 'Jane Doe',
      pocEmail: 'jane@example.org',
      forwardZones: [{ value: 'core.ndp.che' }],
      nameservers: [
        { fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' },
        { fqdn: 'ns2.core.ndp.che', ipv4: '10.0.0.12' },
      ],
    })

    expect(() =>
      parseObj8ConfigExportDocument({
        schemaVersion: 1,
        exportedAt: '2026-04-09T10:00:00.000Z',
        participant: {
          id: participant.id,
          name: participant.name,
          ccNumber: 'CC 517 / Alpha',
        },
        configuration: {
          ...createDefaultParticipantFormValues(),
          participantName: 'Alpha Mission',
          ccNumber: 'CC 999',
          pocName: 'Jane Doe',
          forwardZones: [{ value: 'core.ndp.che' }],
          nameservers: [
            { fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' },
            { fqdn: 'ns2.core.ndp.che', ipv4: '10.0.0.12' },
          ],
          reverseZones: [],
          resolvers: [],
        },
      }),
    ).toThrow('CC-Number in Participant und Konfiguration muessen gleich sein.')

    expect(() =>
      parseObj8ConfigExportDocument({
        schemaVersion: 1,
        exportedAt: '2026-04-09T10:00:00.000Z',
        participant: {
          id: participant.id,
          name: participant.name,
          ccNumber: 'CC 517 / Alpha',
        },
        configuration: {
          ...createDefaultParticipantFormValues(),
          participantName: 'Alpha Mission',
          ccNumber: 'CC 517 / Alpha',
          pocName: 'Jane Doe',
          forwardZones: [{ value: 'core.ndp.che' }],
          nameservers: [{ fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' }],
        },
      }),
    ).toThrow()

    expect(configuration.metadata.obj5.ccNumber).toBe('CC 999')
  })
})

describe('ZIP archive', () => {
  it('creates a local zip archive with the PK signature', () => {
    const draft = createObj8ExportDraftFromParticipant(createValidParticipant())
    const bytes = buildZipArchive(buildObj8ArchiveEntries(draft))

    expect(bytes.slice(0, 4)).toEqual(new Uint8Array([0x50, 0x4b, 0x03, 0x04]))
  })
})

describe('document builder', () => {
  it('creates a serializable config export document', () => {
    const participant = createValidParticipant()
    const configuration = buildParticipantUpsertPayload({
      ...createDefaultParticipantFormValues(),
      participantName: 'Alpha Mission',
      ccNumber: 'CC 517 / Alpha',
      pocName: 'Jane Doe',
      pocEmail: 'jane@example.org',
      forwardZones: [{ value: 'core.ndp.che' }],
      reverseZones: [{ value: '0.0.10.in-addr.arpa' }],
      nameservers: [
        { fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' },
        { fqdn: 'ns2.core.ndp.che', ipv4: '10.0.0.12' },
      ],
    })
    const document = buildObj8ConfigExportDocument(
      participant,
      {
        ...createDefaultParticipantFormValues(),
        participantName: 'Alpha Mission',
        ccNumber: 'CC 517 / Alpha',
        pocName: 'Jane Doe',
        pocEmail: 'jane@example.org',
        forwardZones: [{ value: 'core.ndp.che' }],
        reverseZones: [{ value: '0.168.192.in-addr.arpa' }],
        nameservers: [
          { fqdn: 'ns1.core.ndp.che', ipv4: '10.0.0.11' },
          { fqdn: 'ns2.core.ndp.che', ipv4: '10.0.0.12' },
        ],
      },
      '2026-04-09T10:00:00.000Z',
    )

    expect(document.schemaVersion).toBe(1)
    expect(document.participant.ccNumber).toBe('CC 517 / Alpha')
    expect(configuration.metadata.obj5.delegatedZones.forward).toEqual(['core.ndp.che'])
  })
})
