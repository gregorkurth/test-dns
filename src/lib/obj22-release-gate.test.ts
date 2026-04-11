import { describe, expect, it } from 'vitest'

import {
  getLatestObj22GateReport,
  getObj22GateReports,
  getObj22GateSummary,
  loadObj22GateIndex,
} from '@/lib/obj22-release-gate'

describe('OBJ-22 publish gate reports', () => {
  it('loads the persisted gate index with multiple release reports', async () => {
    const index = await loadObj22GateIndex()

    expect(index.service).toBe('DNS Management Service')
    expect(index.reports.length).toBeGreaterThanOrEqual(2)
    expect(index.reports.some((report) => report.version === 'v1.0.0-beta.1')).toBe(true)
  })

  it('returns the latest report and exposes blocking state', async () => {
    const latest = await getLatestObj22GateReport()

    expect(latest).not.toBeNull()
    expect(latest?.version).toBe('v1.0.0-beta.1')
    expect(latest?.decision).toBe('fail')
    expect(latest?.blockPublish).toBe(true)
  })

  it('filters reports by artifact kind', async () => {
    const reports = await getObj22GateReports({ artifactKind: 'manifest-bundle' })

    expect(reports.length).toBeGreaterThan(0)
    expect(reports.every((report) => report.artifacts.every((artifact) => artifact.kind === 'manifest-bundle'))).toBe(true)
  })

  it('builds a management summary for the dashboard', async () => {
    const summary = await getObj22GateSummary()

    expect(summary.totalReports).toBeGreaterThanOrEqual(2)
    expect(summary.releaseDecisions.fail).toBeGreaterThanOrEqual(1)
    expect(summary.blockedVersions).toContain('v1.0.0-beta.1')
  })
})
