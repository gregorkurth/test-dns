import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/obj12-auth', () => ({
  requireSession: vi.fn().mockResolvedValue({
    ok: true,
    session: { username: 'viewer', role: 'viewer', provider: 'local' },
  }),
}))

import { GET } from '@/app/api/v1/offline-package/route'

function createRequest(pathname: string): Request {
  return new Request(`http://localhost${pathname}`, {
    headers: {
      'x-forwarded-for': 'vitest-obj19-client',
    },
  })
}

describe('OBJ-19 offline package API', () => {
  it('returns summary and package list', async () => {
    const response = await GET(createRequest('/api/v1/offline-package'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data.summary).toMatchObject({
      totalPackages: 2,
      latestVersion: '2026.04.1',
    })
    expect(body.data.packages).toHaveLength(2)
  })

  it('filters by variant', async () => {
    const response = await GET(createRequest('/api/v1/offline-package?variant=minimal'))
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.data.packages).toHaveLength(1)
    expect(body.data.packages[0].variant).toBe('minimal')
  })

  it('rejects invalid variants', async () => {
    const response = await GET(createRequest('/api/v1/offline-package?variant=preview'))
    expect(response.status).toBe(422)

    const body = await response.json()
    expect(body.error).toMatchObject({
      code: 'INVALID_OFFLINE_PACKAGE_VARIANT',
    })
  })
})
