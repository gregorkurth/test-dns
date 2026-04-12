import { describe, expect, it } from 'vitest'

import { loadObj26TestOperatorData } from '@/lib/obj26-test-operator'

describe('loadObj26TestOperatorData', () => {
  it('loads scheduled test operator baseline data', async () => {
    const data = await loadObj26TestOperatorData()

    expect(data.operator.name).toBe('dns-test-operator')
    expect(data.operator.intervalMinutes).toBe(15)
    expect(data.telemetry.mode).toMatch(/local|clickhouse/)
    expect(data.runs.length).toBeGreaterThan(0)
  })

  it('keeps run history sorted and exposes dashboard bridge evidence', async () => {
    const data = await loadObj26TestOperatorData()

    expect(data.runs[0]?.scheduledAt >= data.runs[1]?.scheduledAt).toBe(true)
    expect(data.dashboardBridge.evidenceFile).toContain('operator-test-runs.latest.json')
    expect(data.manifests.length).toBeGreaterThan(0)
    expect(data.manifests.some((entry) => entry.path.includes('test-operator-deployment.yaml'))).toBe(true)
  })
})
