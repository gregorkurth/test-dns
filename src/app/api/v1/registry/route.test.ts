import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/obj12-auth', () => ({
  requireSession: vi.fn().mockResolvedValue({
    ok: true,
    session: { username: 'viewer', role: 'viewer', provider: 'local' },
  }),
}))

import { GET as getRegistry } from './route'

function createRequest(pathname: string): Request {
  return new Request(`http://localhost${pathname}`, {
    headers: {
      'x-forwarded-for': 'vitest-obj18-client',
    },
  })
}

describe('OBJ-18 registry API', () => {
  it('returns the registry catalog summary and records', async () => {
    const response = await getRegistry(createRequest('/api/v1/registry'))

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.data.summary.primaryRegistry).toBe('ghcr.io')
    expect(body.data.records.length).toBeGreaterThan(0)
  })

  it('filters by artifact type', async () => {
    const response = await getRegistry(
      createRequest('/api/v1/registry?artifactType=oci-image'),
    )

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.data.records.length).toBeGreaterThan(0)
    expect(
      body.data.records.every(
        (record: { artifactType: string }) => record.artifactType === 'oci-image',
      ),
    ).toBe(true)
  })

  it('rejects invalid filter values', async () => {
    const response = await getRegistry(
      createRequest('/api/v1/registry?publishState=broken'),
    )

    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.error.code).toBe('INVALID_REGISTRY_PUBLISH_STATE')
  })
})
