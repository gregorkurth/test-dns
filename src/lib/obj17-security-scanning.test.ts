import { describe, expect, it } from 'vitest'

import {
  getLatestObj17SecurityBundle,
  getObj17SecuritySummary,
  loadObj17SecurityDocument,
} from './obj17-security-scanning'

describe('obj17 security scanning model', () => {
  it('loads bundles sorted by newest version first', async () => {
    const document = await loadObj17SecurityDocument()

    expect(document.sourceOfTruth).toBe('git')
    expect(document.bundles.length).toBeGreaterThan(0)
    expect(document.bundles[0]?.version).toBe('2026.04.1')
  })

  it('returns latest bundle summary for maturity/security indicators', async () => {
    const latest = await getLatestObj17SecurityBundle()
    expect(latest).not.toBeNull()
    expect(latest?.sbom.available).toBe(true)
    expect(latest?.gate.status).toBe('accepted-risk')
  })

  it('derives summary with gate and findings data', async () => {
    const summary = await getObj17SecuritySummary()

    expect(summary).toMatchObject({
      latestVersion: '2026.04.1',
      sbomAvailable: true,
      openCriticalFindings: 0,
      gateStatus: 'accepted-risk',
      offlineSnapshotAvailable: true,
    })
  })
})
