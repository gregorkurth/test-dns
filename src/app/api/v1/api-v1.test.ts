import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { POST as postAuthLogin } from './auth/login/route'
import { POST as postAuthLogout } from './auth/logout/route'
import { GET as getAuthSession } from './auth/session/route'
import { GET as getCapabilityDetail } from './capabilities/[id]/route'
import { GET as getCapabilities } from './capabilities/route'
import { GET as getOpenApi } from './openapi.json/route'
import { GET as getOperatorStatus } from './operator/route'
import { GET as getOperatorTests } from './operator/tests/route'
import { GET as getProductWebsite } from './product-website/route'
import { GET as getReleaseNotices } from './releases/route'
import { GET as getMaturity } from './maturity/route'
import { GET as getSecurityScans } from './security/scans/route'
import { GET as getSwaggerUi } from './swagger/route'
import { GET as getTelemetry } from './telemetry/route'
import {
  DELETE as deleteParticipant,
  GET as getParticipants,
  POST as createParticipant,
  PUT as updateParticipant,
} from './participants/route'
import { GET as getParticipantDetail } from './participants/[id]/route'
import { GET as getApiRoot } from './route'
import { POST as generateZone } from './zones/generate/route'

function createRequest(pathname: string, init?: RequestInit): Request {
  const headers = new Headers(init?.headers)
  if (!headers.has('x-forwarded-for')) {
    headers.set('x-forwarded-for', 'vitest-default-client')
  }

  return new Request(`http://localhost${pathname}`, {
    ...init,
    headers,
  })
}

function createOidcToken(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url')

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.signature`
}

async function createAccessToken(
  role: 'viewer' | 'operator' | 'admin' = 'operator',
): Promise<string> {
  const credentials = {
    viewer: {
      username: 'viewer',
      password: 'viewer-demo',
    },
    operator: {
      username: 'operator',
      password: 'operator-demo',
    },
    admin: {
      username: 'admin',
      password: 'admin-demo',
    },
  }

  const response = await postAuthLogin(
    createRequest('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        mode: 'local',
        ...credentials[role],
      }),
    }),
  )

  expect(response.status).toBe(200)
  const body = await response.json()
  expect(body.data.session.role).toBe(role)
  return String(body.data.accessToken)
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

describe('OBJ-3 API v1 with OBJ-12 auth', () => {
  let tmpDataDir = ''
  let previousEnv: Record<string, string | undefined> = {}

  beforeEach(async () => {
    previousEnv = {
      OBJ3_DATA_DIR: process.env.OBJ3_DATA_DIR,
      OBJ12_AUTH_MODE: process.env.OBJ12_AUTH_MODE,
      OBJ12_LOCAL_USERS_JSON: process.env.OBJ12_LOCAL_USERS_JSON,
      OBJ12_SESSION_SECRET: process.env.OBJ12_SESSION_SECRET,
      OBJ12_SESSION_TTL_SECONDS: process.env.OBJ12_SESSION_TTL_SECONDS,
      OBJ12_SESSION_TTL_HOURS: process.env.OBJ12_SESSION_TTL_HOURS,
      OBJ12_OIDC_ISSUER: process.env.OBJ12_OIDC_ISSUER,
      OBJ12_OIDC_AUDIENCE: process.env.OBJ12_OIDC_AUDIENCE,
    }

    tmpDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obj3-api-'))
    process.env.OBJ3_DATA_DIR = tmpDataDir
    process.env.OBJ12_SESSION_SECRET = 'vitest-obj12-auth-test-secret-min32chars'
    delete process.env.OBJ12_AUTH_MODE
    process.env.OBJ12_LOCAL_USERS_JSON = JSON.stringify([
      { username: 'viewer', role: 'viewer', password: 'viewer-demo' },
      { username: 'operator', role: 'operator', password: 'operator-demo' },
      { username: 'admin', role: 'admin', password: 'admin-demo' },
    ])
    delete process.env.OBJ12_SESSION_TTL_SECONDS
    delete process.env.OBJ12_SESSION_TTL_HOURS
    delete process.env.OBJ12_OIDC_ISSUER
    delete process.env.OBJ12_OIDC_AUDIENCE
  })

  afterEach(async () => {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }

    if (tmpDataDir) {
      await fs.rm(tmpDataDir, { recursive: true, force: true })
    }
  })

  it('issues local sessions with configurable TTL and validates logout', async () => {
    process.env.OBJ12_SESSION_TTL_SECONDS = '60'

    const loginResponse = await postAuthLogin(
      createRequest('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode: 'local',
          username: 'operator',
          password: 'operator-demo',
        }),
      }),
    )

    expect(loginResponse.status).toBe(200)
    const loginBody = await loginResponse.json()
    expect(loginBody.data.expiresInSeconds).toBe(60)
    expect(loginBody.data.auth.mode).toBe('hybrid')

    const sessionResponse = await getAuthSession(
      createRequest('/api/v1/auth/session', {
        headers: authHeaders(String(loginBody.data.accessToken)),
      }),
    )
    expect(sessionResponse.status).toBe(200)
    const sessionBody = await sessionResponse.json()
    expect(sessionBody.data.session).toMatchObject({
      username: 'operator',
      role: 'operator',
      provider: 'local',
    })

    const logoutResponse = await postAuthLogout(
      createRequest('/api/v1/auth/logout', {
        method: 'POST',
        headers: authHeaders(String(loginBody.data.accessToken)),
      }),
    )
    expect(logoutResponse.status).toBe(200)
    const logoutBody = await logoutResponse.json()
    expect(logoutBody.data).toMatchObject({
      loggedOut: true,
      username: 'operator',
    })

    const revokedSessionResponse = await getAuthSession(
      createRequest('/api/v1/auth/session', {
        headers: authHeaders(String(loginBody.data.accessToken)),
      }),
    )
    expect(revokedSessionResponse.status).toBe(401)
    const revokedSessionBody = await revokedSessionResponse.json()
    expect(revokedSessionBody.error).toMatchObject({ code: 'TOKEN_REVOKED' })
  })

  it('accepts an oidc-compatible token exchange and maps roles', async () => {
    process.env.OBJ12_OIDC_ISSUER = 'https://sso.example.test/realms/dns'
    process.env.OBJ12_OIDC_AUDIENCE = 'dns-management-service'
    process.env.OBJ12_OIDC_ALLOW_UNSIGNED_TOKEN = 'true'

    const oidcToken = createOidcToken({
      sub: 'oidc-user-1',
      iss: 'https://sso.example.test/realms/dns',
      aud: ['dns-management-service'],
      preferred_username: 'oidc-admin',
      name: 'OIDC Admin',
      roles: ['admin'],
    })

    const response = await postAuthLogin(
      createRequest('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode: 'oidc',
          token: oidcToken,
        }),
      }),
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.session).toMatchObject({
      username: 'oidc-admin',
      role: 'admin',
      provider: 'oidc',
    })
  })

  it('returns 503 when session secret is missing in production', async () => {
    const previousEnv = {
      NODE_ENV: process.env.NODE_ENV,
      OBJ12_SESSION_SECRET: process.env.OBJ12_SESSION_SECRET,
      OBJ12_LOCAL_USERS_JSON: process.env.OBJ12_LOCAL_USERS_JSON,
    }
    const mutableEnv = process.env as NodeJS.ProcessEnv & { NODE_ENV?: string }

    mutableEnv.NODE_ENV = 'production'
    delete mutableEnv.OBJ12_SESSION_SECRET
    mutableEnv.OBJ12_LOCAL_USERS_JSON = JSON.stringify([
      {
        username: 'operator',
        role: 'operator',
        displayName: 'Operator',
        password: 'operator-demo',
      },
    ])

    try {
      const response = await postAuthLogin(
        createRequest('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            mode: 'local',
            username: 'operator',
            password: 'operator-demo',
          }),
        }),
      )

      expect(response.status).toBe(503)
      const body = await response.json()
      expect(body.error).toMatchObject({ code: 'AUTH_CONFIGURATION_ERROR' })
    } finally {
      Object.assign(mutableEnv, previousEnv)
    }
  })

  it('protects capabilities with viewer access and returns detail', async () => {
    const viewerToken = await createAccessToken('viewer')

    const listResponse = await getCapabilities(
      createRequest('/api/v1/capabilities', {
        headers: authHeaders(viewerToken),
      }),
    )
    expect(listResponse.status).toBe(200)
    const listBody = await listResponse.json()
    expect(Array.isArray(listBody.data)).toBe(true)
    expect(listBody.data.length).toBeGreaterThan(0)

    const firstId = String(listBody.data[0].id)
    const detailResponse = await getCapabilityDetail(
      createRequest(`/api/v1/capabilities/${firstId}`, {
        headers: authHeaders(viewerToken),
      }),
      {
        params: Promise.resolve({ id: firstId }),
      },
    )
    expect(detailResponse.status).toBe(200)
    const detailBody = await detailResponse.json()
    expect(detailBody.data).toMatchObject({ id: firstId })
  })

  it('allows operator status read for viewer role', async () => {
    const viewerToken = await createAccessToken('viewer')

    const response = await getOperatorStatus(
      createRequest('/api/v1/operator', {
        headers: authHeaders(viewerToken),
      }),
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.customResource).toMatchObject({
      kind: 'DNSConfiguration',
    })
  })

  it('allows scheduled test operator status read for viewer role', async () => {
    const viewerToken = await createAccessToken('viewer')

    const response = await getOperatorTests(
      createRequest('/api/v1/operator/tests', {
        headers: authHeaders(viewerToken),
      }),
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.operator).toMatchObject({
      name: 'dns-test-operator',
      intervalMinutes: 15,
      nonOverlapPolicy: 'skip_if_active_run',
    })
    expect(Array.isArray(body.data.runs)).toBe(true)
    expect(body.data.runs.length).toBeGreaterThan(0)
    expect(body.data.summary).toHaveProperty('lastRunStatus')
  })

  it('validates release notice query parameters', async () => {
    const viewerToken = await createAccessToken('viewer')

    const invalidChannelResponse = await getReleaseNotices(
      createRequest('/api/v1/releases?channel=preview', { headers: authHeaders(viewerToken) }),
    )
    expect(invalidChannelResponse.status).toBe(422)
    const invalidChannelBody = await invalidChannelResponse.json()
    expect(invalidChannelBody.error).toMatchObject({ code: 'INVALID_RELEASE_CHANNEL' })

    const invalidLimitResponse = await getReleaseNotices(
      createRequest('/api/v1/releases?limit=0', { headers: authHeaders(viewerToken) }),
    )
    expect(invalidLimitResponse.status).toBe(422)
    const invalidLimitBody = await invalidLimitResponse.json()
    expect(invalidLimitBody.error).toMatchObject({ code: 'INVALID_RELEASE_LIMIT' })
  })

  it('serves maturity overview with viewer auth and validates filters', async () => {
    const viewerToken = await createAccessToken('viewer')

    const response = await getMaturity(
      createRequest('/api/v1/maturity?releaseChannel=beta', {
        headers: authHeaders(viewerToken),
      }),
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.overall.level).toMatch(/^L[0-5]$/)
    expect(Array.isArray(body.data.features)).toBe(true)
    expect(body.data.filtersApplied.releaseChannel).toBe('beta')

    const invalidResponse = await getMaturity(
      createRequest('/api/v1/maturity?status=broken', {
        headers: authHeaders(viewerToken),
      }),
    )
    expect(invalidResponse.status).toBe(422)
    const invalidBody = await invalidResponse.json()
    expect(invalidBody.error).toMatchObject({ code: 'INVALID_MATURITY_STATUS' })
  })

  it('serves security scan bundles with viewer auth and validates channel input', async () => {
    const viewerToken = await createAccessToken('viewer')

    const response = await getSecurityScans(
      createRequest('/api/v1/security/scans?channel=beta&limit=1', {
        headers: authHeaders(viewerToken),
      }),
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.summary).toMatchObject({
      sbomAvailable: true,
    })
    expect(Array.isArray(body.data.bundles)).toBe(true)
    expect(body.data.bundles.length).toBeLessThanOrEqual(1)

    const invalidResponse = await getSecurityScans(
      createRequest('/api/v1/security/scans?channel=preview', {
        headers: authHeaders(viewerToken),
      }),
    )
    expect(invalidResponse.status).toBe(422)
    const invalidBody = await invalidResponse.json()
    expect(invalidBody.error).toMatchObject({ code: 'INVALID_SECURITY_CHANNEL' })
  })

  it('serves product website data from versioned release sources', async () => {
    const viewerToken = await createAccessToken('viewer')
    const response = await getProductWebsite(
      createRequest('/api/v1/product-website', { headers: authHeaders(viewerToken) }),
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toMatchObject({
      sourceOfTruth: {
        releaseNoticesFile: 'docs/releases/UPDATE-NOTICES.json',
      },
    })
    expect(Array.isArray(body.data.updateNotices)).toBe(true)
    expect(body.data.release).toHaveProperty('channel')
  })

  it('returns 401 on protected calls without authentication', async () => {
    const participantsResponse = await getParticipants(
      createRequest('/api/v1/participants'),
    )
    expect(participantsResponse.status).toBe(401)
    const participantsBody = await participantsResponse.json()
    expect(participantsBody.error).toMatchObject({ code: 'AUTH_REQUIRED' })

    const zoneResponse = await generateZone(
      createRequest('/api/v1/zones/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          zoneName: 'core.ndp.che',
          records: [{ name: 'ns1', type: 'A', value: '10.0.0.1' }],
        }),
      }),
    )
    expect(zoneResponse.status).toBe(401)
    const zoneBody = await zoneResponse.json()
    expect(zoneBody.error).toMatchObject({ code: 'AUTH_REQUIRED' })

    const operatorResponse = await getOperatorStatus(
      createRequest('/api/v1/operator'),
    )
    expect(operatorResponse.status).toBe(401)
    const operatorBody = await operatorResponse.json()
    expect(operatorBody.error).toMatchObject({ code: 'AUTH_REQUIRED' })

    const operatorTestsResponse = await getOperatorTests(
      createRequest('/api/v1/operator/tests'),
    )
    expect(operatorTestsResponse.status).toBe(401)
    const operatorTestsBody = await operatorTestsResponse.json()
    expect(operatorTestsBody.error).toMatchObject({ code: 'AUTH_REQUIRED' })

    const maturityResponse = await getMaturity(createRequest('/api/v1/maturity'))
    expect(maturityResponse.status).toBe(401)
    const maturityBody = await maturityResponse.json()
    expect(maturityBody.error).toMatchObject({ code: 'AUTH_REQUIRED' })

    const securityResponse = await getSecurityScans(
      createRequest('/api/v1/security/scans'),
    )
    expect(securityResponse.status).toBe(401)
    const securityBody = await securityResponse.json()
    expect(securityBody.error).toMatchObject({ code: 'AUTH_REQUIRED' })
  })

  it('returns 403 when viewer tries to execute operator actions', async () => {
    const viewerToken = await createAccessToken('viewer')

    const response = await createParticipant(
      createRequest('/api/v1/participants', {
        method: 'POST',
        headers: authHeaders(viewerToken, {
          'content-type': 'application/json',
        }),
        body: JSON.stringify({
          id: 'participant-viewer-blocked',
          name: 'Viewer Blocked',
        }),
      }),
    )

    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toMatchObject({ code: 'FORBIDDEN' })
  })

  it('handles participants CRUD and invalid JSON body for operator role', async () => {
    const operatorToken = await createAccessToken('operator')

    const invalidCreateResponse = await createParticipant(
      createRequest('/api/v1/participants', {
        method: 'POST',
        headers: authHeaders(operatorToken, {
          'content-type': 'application/json',
        }),
        body: '{ invalid-json',
      }),
    )

    expect(invalidCreateResponse.status).toBe(400)
    const invalidCreateBody = await invalidCreateResponse.json()
    expect(invalidCreateBody.error).toMatchObject({ code: 'INVALID_JSON' })

    const createResponse = await createParticipant(
      createRequest('/api/v1/participants', {
        method: 'POST',
        headers: authHeaders(operatorToken, {
          'content-type': 'application/json',
        }),
        body: JSON.stringify({
          id: 'participant-alpha',
          name: 'Alpha',
          role: 'Operator',
        }),
      }),
    )

    expect(createResponse.status).toBe(201)
    const createBody = await createResponse.json()
    expect(createBody.data).toMatchObject({
      id: 'participant-alpha',
      name: 'Alpha',
      role: 'Operator',
    })

    const listResponse = await getParticipants(
      createRequest('/api/v1/participants', {
        headers: authHeaders(operatorToken),
      }),
    )
    expect(listResponse.status).toBe(200)
    const listBody = await listResponse.json()
    expect(listBody.data).toHaveLength(1)

    const detailResponse = await getParticipantDetail(
      createRequest('/api/v1/participants/participant-alpha', {
        headers: authHeaders(operatorToken),
      }),
      {
        params: Promise.resolve({ id: 'participant-alpha' }),
      },
    )
    expect(detailResponse.status).toBe(200)

    const updateResponse = await updateParticipant(
      createRequest('/api/v1/participants?id=participant-alpha', {
        method: 'PUT',
        headers: authHeaders(operatorToken, {
          'content-type': 'application/json',
        }),
        body: JSON.stringify({ notes: 'updated' }),
      }),
    )
    expect(updateResponse.status).toBe(200)
    const updateBody = await updateResponse.json()
    expect(updateBody.data).toMatchObject({
      id: 'participant-alpha',
      notes: 'updated',
    })

    const deleteResponse = await deleteParticipant(
      createRequest('/api/v1/participants?id=participant-alpha', {
        method: 'DELETE',
        headers: authHeaders(operatorToken),
      }),
    )
    expect(deleteResponse.status).toBe(200)
    const deleteBody = await deleteResponse.json()
    expect(deleteBody.data).toMatchObject({
      id: 'participant-alpha',
      deleted: true,
    })
  })

  it('validates zone generation payload and returns zone file on success', async () => {
    const operatorToken = await createAccessToken('operator')

    const invalidResponse = await generateZone(
      createRequest('/api/v1/zones/generate', {
        method: 'POST',
        headers: authHeaders(operatorToken, {
          'content-type': 'application/json',
        }),
        body: JSON.stringify({
          zoneName: 'core.ndp.che',
          records: [],
        }),
      }),
    )
    expect(invalidResponse.status).toBe(422)
    const invalidBody = await invalidResponse.json()
    expect(invalidBody.error).toMatchObject({ code: 'ZONE_VALIDATION_ERROR' })

    const successResponse = await generateZone(
      createRequest('/api/v1/zones/generate', {
        method: 'POST',
        headers: authHeaders(operatorToken, {
          'content-type': 'application/json',
        }),
        body: JSON.stringify({
          zoneName: 'core.ndp.che',
          records: [{ name: 'ns1', type: 'A', value: '10.0.0.1' }],
        }),
      }),
    )
    expect(successResponse.status).toBe(200)
    const successBody = await successResponse.json()
    expect(successBody.data).toMatchObject({
      zoneName: 'core.ndp.che',
      fileName: 'core.ndp.che.zone',
      recordCount: 1,
    })
    expect(String(successBody.data.zoneFile)).toContain('ns1 3600 IN A 10.0.0.1')
  })

  it('rejects type-specific invalid DNS record values during zone generation', async () => {
    const operatorToken = await createAccessToken('operator')
    const cases = [
      { type: 'A', value: '<script>alert(1)</script>' },
      { type: 'AAAA', value: 'not-an-ipv6' },
      { type: 'CNAME', value: 'not-a-valid-host' },
      { type: 'MX', value: '10 not-a-valid-host' },
      { type: 'TXT', value: '' },
    ] as const

    for (const testCase of cases) {
      const response = await generateZone(
        createRequest('/api/v1/zones/generate', {
          method: 'POST',
          headers: authHeaders(operatorToken, {
            'content-type': 'application/json',
          }),
          body: JSON.stringify({
            zoneName: 'core.ndp.che',
            records: [
              {
                name: 'record1',
                type: testCase.type,
                value: testCase.value,
              },
            ],
          }),
        }),
      )

      expect(response.status).toBe(422)
      const body = await response.json()
      expect(body.error).toMatchObject({ code: 'ZONE_VALIDATION_ERROR' })
    }
  })

  it('serves API root and OpenAPI contract with auth metadata', async () => {
    const rootResponse = await getApiRoot(createRequest('/api/v1'))
    expect(rootResponse.status).toBe(200)
    const rootBody = await rootResponse.json()
    expect(rootBody.data).toMatchObject({
      version: 'v1',
    })
    expect(rootBody.data.endpoints).toContain('/api/v1/auth/login')
    expect(rootBody.data.endpoints).toContain('/api/v1/operator')
    expect(rootBody.data.endpoints).toContain('/api/v1/operator/tests')
    expect(rootBody.data.endpoints).toContain('/api/v1/product-website')
    expect(rootBody.data.endpoints).toContain('/api/v1/maturity')
    expect(rootBody.data.endpoints).toContain('/api/v1/security/scans')
    expect(rootBody.data.endpoints).toContain('/api/v1/openapi.json')

    const openApiResponse = await getOpenApi(createRequest('/api/v1/openapi.json'))
    expect(openApiResponse.status).toBe(200)
    const openApiBody = await openApiResponse.json()
    expect(openApiBody).toMatchObject({
      openapi: '3.0.3',
    })
    expect(openApiBody.paths).toHaveProperty('/auth/login')
    expect(openApiBody.paths).toHaveProperty('/operator')
    expect(openApiBody.paths).toHaveProperty('/operator/tests')
    expect(openApiBody.paths).toHaveProperty('/product-website')
    expect(openApiBody.paths).toHaveProperty('/maturity')
    expect(openApiBody.paths).toHaveProperty('/security/scans')
    expect(openApiBody.paths).toHaveProperty('/participants')
    expect(openApiBody.components.securitySchemes).toHaveProperty('bearerAuth')

    const swaggerResponse = await getSwaggerUi(createRequest('/api/v1/swagger'))
    expect(swaggerResponse.status).toBe(200)
    expect(swaggerResponse.headers.get('content-type')).toContain('text/html')
    const swaggerBody = await swaggerResponse.text()
    expect(swaggerBody).toContain('/api/v1/openapi.json')
  })

  it('serves a telemetry probe with structured observability metadata', async () => {
    // Token vor NODE_ENV=production holen, da der 20-Zeichen-Secret sonst zu kurz wäre
    const viewerToken = await createAccessToken('viewer')

    const previousTelemetryEnv = {
      OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
      OTEL_EXPORT_MODE: process.env.OTEL_EXPORT_MODE,
      OTEL_EXPORT_ENDPOINT: process.env.OTEL_EXPORT_ENDPOINT,
      OBSERVABILITY_GRAFANA_DASHBOARD_VERSION:
        process.env.OBSERVABILITY_GRAFANA_DASHBOARD_VERSION,
      NODE_ENV: process.env.NODE_ENV,
    }
    const mutableEnv = process.env as NodeJS.ProcessEnv & {
      NODE_ENV?: string
    }

    mutableEnv.OTEL_SERVICE_NAME = 'dns-management-service'
    mutableEnv.OTEL_EXPORT_MODE = 'clickhouse'
    mutableEnv.OTEL_EXPORT_ENDPOINT =
      'http://otel-collector.monitoring.svc.cluster.local:4318'
    mutableEnv.OBSERVABILITY_GRAFANA_DASHBOARD_VERSION = 'dns-observability-v1'
    mutableEnv.NODE_ENV = 'production'

    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    try {
      const response = await getTelemetry(
        createRequest('/api/v1/telemetry', { headers: authHeaders(viewerToken) }),
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.data.probe).toMatchObject({
        serviceName: 'dns-management-service',
        exportMode: 'clickhouse',
        dashboardVersion: 'dns-observability-v1',
        environment: 'production',
      })
      expect(body.data.routing).toMatchObject({
        local: 'spool',
        clickhouse: 'clickhouse',
        siem: 'otel_security_events',
      })
      expect(body.data.transport).toBe('otlp/http')
      expect(body.data.probe.signals).toEqual(
        expect.arrayContaining(['metrics', 'logs', 'traces', 'security-events']),
      )
      expect(consoleSpy).toHaveBeenCalledTimes(1)

      const [message] = consoleSpy.mock.calls[0] ?? []
      expect(() => JSON.parse(String(message))).not.toThrow()
      expect(JSON.parse(String(message))).toMatchObject({
        event: 'observability-probe',
        serviceName: 'dns-management-service',
        exportMode: 'clickhouse',
      })
    } finally {
      consoleSpy.mockRestore()
      Object.assign(mutableEnv, previousTelemetryEnv)
    }
  })

  it('sanitizes participant fields to reduce stored XSS risk', async () => {
    const operatorToken = await createAccessToken('operator')

    const createResponse = await createParticipant(
      createRequest('/api/v1/participants', {
        method: 'POST',
        headers: authHeaders(operatorToken, {
          'content-type': 'application/json',
        }),
        body: JSON.stringify({
          id: 'participant-xss',
          name: '<script>alert(1)</script>',
          notes: '<img src=x onerror=alert(1)>',
          metadata: {
            nested: {
              value: '<b>unsafe</b>',
            },
          },
        }),
      }),
    )

    expect(createResponse.status).toBe(201)
    const createBody = await createResponse.json()
    expect(createBody.data.name).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(createBody.data.notes).toBe('&lt;img src=x onerror=alert(1)&gt;')
    expect(createBody.data.metadata.nested.value).toBe('&lt;b&gt;unsafe&lt;/b&gt;')

    const listResponse = await getParticipants(
      createRequest('/api/v1/participants', {
        headers: authHeaders(operatorToken),
      }),
    )
    expect(listResponse.status).toBe(200)
    const listBody = await listResponse.json()
    const participant = listBody.data.find(
      (entry: { id: string }) => entry.id === 'participant-xss',
    )
    expect(participant.name).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')

    const deleteResponse = await deleteParticipant(
      createRequest('/api/v1/participants?id=participant-xss', {
        method: 'DELETE',
        headers: authHeaders(operatorToken),
      }),
    )
    expect(deleteResponse.status).toBe(200)
  })

  it('rate limits repeated requests for same client on api-v1 root', async () => {
    const limitedClientHeader = { 'x-forwarded-for': 'vitest-rate-limit-client' }

    for (let index = 0; index < 60; index += 1) {
      const response = await getApiRoot(
        createRequest('/api/v1', {
          headers: limitedClientHeader,
        }),
      )
      expect(response.status).toBe(200)
    }

    const limitedResponse = await getApiRoot(
      createRequest('/api/v1', {
        headers: limitedClientHeader,
      }),
    )
    expect(limitedResponse.status).toBe(429)
    expect(limitedResponse.headers.get('Retry-After')).toBeTruthy()
    const limitedBody = await limitedResponse.json()
    expect(limitedBody.error).toMatchObject({ code: 'RATE_LIMITED' })
  })
})
