import { describe, expect, it } from 'vitest'

import {
  loadObj25HelmStatusData,
  obj25HelmStatusInternals,
} from './obj25-helm-status'

describe('obj25 chart.yaml parsing', () => {
  it('extracts chart metadata scalars from Chart.yaml content', () => {
    const parsed = obj25HelmStatusInternals.parseChartYaml(`
apiVersion: v2
name: dns-management-service
description: Helm chart for DNS
version: 1.2.3
appVersion: "2.0.0"
`)

    expect(parsed).toEqual({
      name: 'dns-management-service',
      description: 'Helm chart for DNS',
      version: '1.2.3',
      appVersion: '2.0.0',
    })
  })
})

describe('obj25 helm status parsing', () => {
  it('parses helm status json payload', () => {
    const parsed = obj25HelmStatusInternals.parseHelmReleaseStatusJson(
      JSON.stringify({
        chart: 'dns-management-service-1.2.3',
        app_version: '1.0.0',
        version: 4,
        info: {
          status: 'deployed',
          last_deployed: '2026-04-10T12:00:00Z',
        },
      }),
    )

    expect(parsed).toEqual({
      releaseStatus: 'deployed',
      revision: '4',
      chart: 'dns-management-service-1.2.3',
      appVersion: '1.0.0',
      updated: '2026-04-10T12:00:00Z',
    })
  })
})

describe('obj25 helm status data', () => {
  it('loads chart metadata and required files without running helm binary checks', async () => {
    const data = await loadObj25HelmStatusData({ runChecks: false })

    expect(data.sourceOfTruth).toBe('git')
    expect(data.chart.name).toBe('dns-management-service')
    expect(data.chart.semverValid).toBe(true)
    expect(data.files.some((entry) => entry.path.endsWith('values-prod.yaml'))).toBe(true)
    expect(data.files.some((entry) => entry.path.endsWith('values.schema.json'))).toBe(true)
    expect(data.summary.totalChecks).toBe(0)
    expect(data.release.checkState).toBe('skipped')
    expect(data.release.releaseName).toBe('dns-management-service')
    expect(data.release.namespace).toBe('dns-management')
  })
})
