import { describe, expect, it } from 'vitest'

import {
  filterObj16Features,
  loadObj16MaturityData,
  type Obj16FeatureEntry,
} from './obj16-maturity'

function createFeatureEntry(
  overrides: Partial<Obj16FeatureEntry>,
): Obj16FeatureEntry {
  return {
    id: 'OBJ-16',
    name: 'Maturity Dashboard',
    phase: '6 - Abschluss',
    status: 'In Progress',
    releaseChannel: 'preview',
    testStatus: 'never_executed',
    testCounts: {
      total: 0,
      passed: 0,
      failed: 0,
      neverExecuted: 0,
    },
    requirementsCoverage: {
      covered: 0,
      total: 0,
      percentage: null,
    },
    securityIndicator: 'warning',
    documentationIndicator: 'healthy',
    offlineIndicator: 'warning',
    riskPriority: 'high',
    milestone: 'Resolve in current planning cycle',
    nextStep: 'Create/execute evidence for this feature',
    ...overrides,
  }
}

describe('obj16 feature filtering', () => {
  it('filters by release channel and risk priority', () => {
    const entries: Obj16FeatureEntry[] = [
      createFeatureEntry({
        id: 'OBJ-15',
        releaseChannel: 'released',
        riskPriority: 'normal',
      }),
      createFeatureEntry({
        id: 'OBJ-16',
        releaseChannel: 'beta',
        riskPriority: 'high',
      }),
      createFeatureEntry({
        id: 'OBJ-17',
        releaseChannel: 'preview',
        riskPriority: 'blocker',
      }),
    ]

    const filtered = filterObj16Features(entries, {
      releaseChannel: 'beta',
      riskPriority: 'high',
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.id).toBe('OBJ-16')
  })
})

describe('obj16 maturity data', () => {
  it('loads overall maturity data with weighted dimensions', async () => {
    const data = await loadObj16MaturityData()

    expect(data.sourceOfTruth).toBe('git')
    expect(data.overall.level).toMatch(/^L[0-5]$/)
    expect(data.model.weights.delivery).toBeGreaterThan(0)
    expect(data.dimensions).toHaveLength(5)
    expect(data.features.length).toBeGreaterThan(0)
  })
})
