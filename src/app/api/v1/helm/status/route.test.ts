import { describe, expect, it } from 'vitest'

import { POST as postAuthLogin } from '@/app/api/v1/auth/login/route'

import { GET as getHelmStatus } from './route'

function createRequest(pathname: string, init?: RequestInit): Request {
  const headers = new Headers(init?.headers)
  if (!headers.has('x-forwarded-for')) {
    headers.set('x-forwarded-for', 'vitest-obj25-helm-route')
  }

  return new Request(`http://localhost${pathname}`, {
    ...init,
    headers,
  })
}

function authHeaders(
  accessToken: string,
  headers?: Record<string, string>,
): Record<string, string> {
  return {
    ...(headers ?? {}),
    authorization: `Bearer ${accessToken}`,
  }
}

async function createAccessToken() {
  const response = await postAuthLogin(
    createRequest('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
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

describe('OBJ-25 helm status API route', () => {
  it('returns 401 without bearer token', async () => {
    const response = await getHelmStatus(createRequest('/api/v1/helm/status'))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toMatchObject({ code: 'AUTH_REQUIRED' })
  })

  it('validates runChecks query parameter', async () => {
    const token = await createAccessToken()
    const response = await getHelmStatus(
      createRequest('/api/v1/helm/status?runChecks=maybe', {
        headers: authHeaders(token),
      }),
    )
    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.error).toMatchObject({ code: 'INVALID_RUN_CHECKS' })
  })

  it('validates empty release parameter', async () => {
    const token = await createAccessToken()
    const response = await getHelmStatus(
      createRequest('/api/v1/helm/status?release=%20%20%20', {
        headers: authHeaders(token),
      }),
    )
    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.error).toMatchObject({ code: 'INVALID_RELEASE' })
  })

  it('returns helm status data for authenticated viewer', async () => {
    const token = await createAccessToken()
    const response = await getHelmStatus(
      createRequest('/api/v1/helm/status?runChecks=false', {
        headers: authHeaders(token),
      }),
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toMatchObject({
      sourceOfTruth: 'git',
      chartPath: 'helm/dns-management-service',
    })
    expect(body.data.chart).toMatchObject({ name: 'dns-management-service' })
    expect(body.data.release).toMatchObject({
      releaseName: 'dns-management-service',
      namespace: 'dns-management',
      checkState: 'skipped',
    })
    expect(Array.isArray(body.data.files)).toBe(true)
  })
})
