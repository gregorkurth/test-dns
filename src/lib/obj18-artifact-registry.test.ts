import { describe, expect, it } from 'vitest'

import {
  getObj18ArtifactBadgeLabel,
  getObj18GateTone,
  loadObj18RegistryData,
} from './obj18-artifact-registry'

describe('OBJ-18 registry data model', () => {
  it('loads a registry catalog with summary and records', async () => {
    const data = await loadObj18RegistryData()

    expect(data.summary.primaryRegistry).toBe('ghcr.io')
    expect(data.summary.totalArtifacts).toBeGreaterThan(0)
    expect(data.summary.versions).toContain('2026.04.1')
    expect(
      data.records.some((record) => record.artifactType === 'oci-image'),
    ).toBe(true)
    expect(
      data.records.some((record) => record.artifactType === 'security-bundle'),
    ).toBe(true)
  })

  it('supports filtering by publish state and zarf relevance', async () => {
    const data = await loadObj18RegistryData({
      publishState: 'published',
      zarfIncluded: true,
    })

    expect(data.records.length).toBeGreaterThan(0)
    expect(data.records.every((record) => record.publishState === 'published')).toBe(true)
    expect(data.records.every((record) => record.zarf.included)).toBe(true)
  })

  it('exposes stable labels for UI badges', () => {
    expect(getObj18ArtifactBadgeLabel('oci-image')).toBe('OCI image')
    expect(
      getObj18GateTone({
        publishState: 'blocked',
        gate: {
          securityStatus: 'fail',
          artifactGateStatus: 'blocked',
          publishedOnlyAfterGate: false,
          decisionRefs: [],
        },
      }),
    ).toBe('risk')
  })
})
