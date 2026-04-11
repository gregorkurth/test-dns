import { describe, expect, it } from 'vitest'

import { POST as postAuthLogin } from '@/app/api/v1/auth/login/route'
import { GET } from '@/app/api/v1/gate/route'

function createRequest(pathname: string, init?: RequestInit): Request {
  const headers = new Headers(init?.headers)
  if (!headers.has('x-forwarded-for')) {
    headers.set('x-forwarded-for', 'vitest-obj22-gate-client')
  }

  return new Request(`http://localhost${pathname}`, {
    ...init,
    headers,
  })
}

async function createAccessToken(): Promise<string> {
  const response = await postAuthLogin(
    createRequest('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
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

describe('OBJ-22 gate API', () => {
  it('returns summary and reports for authenticated viewers', async () => {
    const accessToken = await createAccessToken()
    const response = await GET(
      createRequest('/api/v1/gate', {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.summary.totalReports).toBeGreaterThanOrEqual(2)
    expect(body.data.latest.version).toBe('v1.0.0-beta.1')
  })

  it('filters by decision and artifact kind', async () => {
    const accessToken = await createAccessToken()
    const response = await GET(
      createRequest('/api/v1/gate?decision=fail&artifactKind=manifest-bundle', {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.reports.length).toBeGreaterThan(0)
    expect(
      body.data.reports.every((report: { artifacts: Array<{ kind: string }> }) =>
        report.artifacts.every((artifact) => artifact.kind === 'manifest-bundle'),
      ),
    ).toBe(true)
  })

  it('rejects invalid decision filters', async () => {
    const accessToken = await createAccessToken()
    const response = await GET(
      createRequest('/api/v1/gate?decision=warning', {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.error).toMatchObject({
      code: 'INVALID_GATE_DECISION',
    })
  })

  it('requires authentication', async () => {
    const response = await GET(createRequest('/api/v1/gate'))

    expect(response.status).toBe(401)
  })
})
