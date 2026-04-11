import { describe, expect, it } from 'vitest'

import {
  getObj21GitOpsSummary,
  getObj21ManagedApplications,
  loadObj21GitOpsDocument,
} from './obj21-gitops'

describe('obj21 gitops model', () => {
  it('loads the gitops document with two tracked sources and offline bootstrap', async () => {
    const document = await loadObj21GitOpsDocument()

    expect(document.rootApplication.name).toBe('dns-management-root')
    expect(document.sources.map((source) => source.role)).toEqual(['release', 'config'])
    expect(document.bootstrap.every((step) => step.offlineCapable)).toBe(true)
  })

  it('derives summary counts from child application health', async () => {
    const summary = await getObj21GitOpsSummary()

    expect(summary).toMatchObject({
      totalApplications: 4,
      healthyApplications: 1,
      degradedApplications: 1,
      progressingApplications: 1,
      missingApplications: 1,
      deployableApplications: 1,
      trackedEnvironments: 2,
      twoSourceBindingsVerified: true,
      bootstrapOfflineReady: true,
    })
  })

  it('filters applications by status and sync mode', async () => {
    const applications = await getObj21ManagedApplications({
      status: 'Healthy',
      syncMode: 'manual',
    })

    expect(applications).toHaveLength(1)
    expect(applications[0]).toMatchObject({
      id: 'dns-core',
      component: 'Core Service',
      healthStatus: 'Healthy',
    })
  })
})
