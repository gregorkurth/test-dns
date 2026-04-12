import { describe, expect, it } from 'vitest'

import {
  buildObj20DryRun,
  getLatestObj20TargetImportRun,
  getObj20TargetImportSummary,
  getObj20TargetImportRuns,
  loadObj20TargetImportDocument,
} from './obj20-target-import'

describe('obj20 target import model', () => {
  it('loads target import runs sorted by latest startedAt first', async () => {
    const document = await loadObj20TargetImportDocument()

    expect(document.sourceOfTruth).toContain('docs/offline-install.md')
    expect(document.runs[0]?.id).toBe('run-obj20-003')
    expect(document.runs).toHaveLength(3)
  })

  it('derives summary counts across completed, degraded and blocked runs', async () => {
    const summary = await getObj20TargetImportSummary()

    expect(summary).toMatchObject({
      totalRuns: 3,
      completedRuns: 1,
      degradedRuns: 1,
      blockedRuns: 1,
      recoveryRuns: 1,
      latestVersion: '2026.04.1',
      latestCompletedEnvironment: 'FMN Core Target',
    })
  })

  it('filters runs by environment and mode', async () => {
    const runs = await getObj20TargetImportRuns({
      environmentId: 'fmn-staging',
      deploymentMode: 'rerun',
    })

    expect(runs).toHaveLength(1)
    expect(runs[0]).toMatchObject({
      environmentId: 'fmn-staging',
      deploymentMode: 'rerun',
      status: 'degraded',
    })
  })

  it('returns the latest run shortcut', async () => {
    const latest = await getLatestObj20TargetImportRun()

    expect(latest).not.toBeNull()
    expect(latest?.status).toBe('blocked')
  })

  it('creates a blocked dry-run when mandatory prerequisites fail', () => {
    const result = buildObj20DryRun({
      environmentId: 'fmn-core',
      environmentName: 'FMN Core Target',
      version: '2026.04.2',
      deploymentMode: 'fresh',
      target: {
        cluster: 'fmn-core-cluster',
        namespace: 'dns-prod',
        registryUrl: 'harbor.fmn-core.local/dns',
        ingressHostname: 'dns.fmn-core.example',
        oidcIssuer: 'https://keycloak.fmn-core.example/realms/dns',
        argocdUrl: 'https://argocd.fmn-core.example',
      },
      sourceBinding: {
        releaseProject: {
          name: 'dns-release',
          revision: 'release/2026.04.2',
          path: 'releases/2026.04.2',
        },
        configProject: {
          name: 'dns-config-fmn-core',
          revision: 'env/fmn-core/2026.04.2',
          path: 'environments/fmn-core',
        },
        appOfAppsRef: 'argocd/root-apps/dns-management-service',
      },
      prerequisites: {
        clusterReachable: true,
        registryReachable: false,
        argocdReachable: true,
        namespacesReady: true,
        packageIntegrityVerified: false,
      },
    })

    expect(result.eligible).toBe(false)
    expect(result.status).toBe('blocked')
    expect(result.blockers).toHaveLength(2)
    expect(result.nextActions[0]).toContain('Blockierende')
  })
})
