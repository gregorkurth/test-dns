import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/obj12-auth', () => ({
  requireSession: vi.fn().mockResolvedValue({
    ok: true,
    session: { username: 'operator', role: 'operator', provider: 'local' },
  }),
}))

import { GET, POST } from './route'

function createRequest(pathname: string, init?: RequestInit): Request {
  return new Request(`http://localhost${pathname}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': 'vitest-obj20',
      ...(init?.headers ?? {}),
    },
  })
}

describe('OBJ-20 target import route', () => {
  it('returns summary, environments and runs', async () => {
    const response = await GET(createRequest('/api/v1/target-import'))

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.data.service).toBe('DNS Management Service')
    expect(body.data.summary.totalRuns).toBe(3)
    expect(body.data.environments).toHaveLength(3)
  })

  it('filters by environment and returns matching run only', async () => {
    const response = await GET(
      createRequest('/api/v1/target-import?environmentId=fmn-staging'),
    )

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.data.runs).toHaveLength(1)
    expect(body.data.runs[0]).toMatchObject({
      environmentId: 'fmn-staging',
      status: 'degraded',
    })
  })

  it('returns 422 for invalid filters', async () => {
    const response = await GET(
      createRequest('/api/v1/target-import?deploymentMode=invalid'),
    )

    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.error.code).toBe('INVALID_TARGET_IMPORT_MODE')
  })

  it('returns a blocked dry-run with HTTP 409 when prerequisites fail', async () => {
    const response = await POST(
      createRequest('/api/v1/target-import', {
        method: 'POST',
        body: JSON.stringify({
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
            packageIntegrityVerified: true,
          },
        }),
      }),
    )

    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.data.mode).toBe('dry-run')
    expect(body.data.dryRun).toMatchObject({
      eligible: false,
      status: 'blocked',
    })
  })

  it('returns validation errors for malformed dry-run payloads', async () => {
    const response = await POST(
      createRequest('/api/v1/target-import', {
        method: 'POST',
        body: JSON.stringify({
          environmentId: '',
          environmentName: 'X',
        }),
      }),
    )

    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.error.code).toBe('TARGET_IMPORT_VALIDATION_ERROR')
  })
})
