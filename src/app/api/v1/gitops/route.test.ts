import { describe, expect, it } from 'vitest'

import { POST as postAuthLogin } from '@/app/api/v1/auth/login/route'

import { GET } from './route'

function createRequest(pathname: string): Request {
  return new Request(`http://localhost${pathname}`, {
    headers: {
      'x-forwarded-for': 'vitest-obj21',
    },
  })
}

function createAuthRequest(pathname: string, token: string): Request {
  return new Request(`http://localhost${pathname}`, {
    headers: {
      'x-forwarded-for': 'vitest-obj21',
      authorization: `Bearer ${token}`,
    },
  })
}

async function createAccessToken() {
  const response = await postAuthLogin(
    new Request('http://localhost/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': 'vitest-obj21-auth',
      },
      body: JSON.stringify({
        mode: 'local',
        username: 'viewer',
        password: 'viewer-demo',
      }),
    }),
  )

  expect(response.status).toBe(200)
  const body = await response.json()
  return String(body.data.accessToken)
}

describe('OBJ-21 gitops route', () => {
  it('returns root application, sources and child app summary', async () => {
    const token = await createAccessToken()
    const response = await GET(createAuthRequest('/api/v1/gitops', token))

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.data.rootApplication.name).toBe('dns-management-root')
    expect(body.data.sources).toHaveLength(2)
    expect(body.data.summary.totalApplications).toBe(4)
  })

  it('filters managed applications by health status', async () => {
    const token = await createAccessToken()
    const response = await GET(
      createAuthRequest('/api/v1/gitops?status=Healthy', token),
    )

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.data.applications).toHaveLength(1)
    expect(body.data.applications[0].id).toBe('dns-core')
  })

  it('returns 422 for invalid status filters', async () => {
    const token = await createAccessToken()
    const response = await GET(
      createAuthRequest('/api/v1/gitops?status=Broken', token),
    )

    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.error.code).toBe('INVALID_GITOPS_STATUS')
  })

  it('returns 401 without bearer token', async () => {
    const response = await GET(createRequest('/api/v1/gitops'))
    expect(response.status).toBe(401)
  })
})
