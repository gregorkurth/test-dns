import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET as getCapabilityDetail } from './capabilities/[id]/route'
import { GET as getCapabilities } from './capabilities/route'
import { GET as getOpenApi } from './openapi.json/route'
import { GET as getSwaggerUi } from './swagger/route'
import { GET as getTelemetry } from './telemetry/route'
import {
  DELETE as deleteParticipant,
  GET as getParticipants,
  POST as createParticipant,
  PUT as updateParticipant,
} from './participants/route'
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

describe('OBJ-3 API v1', () => {
  let tmpDataDir = ''

  beforeEach(async () => {
    tmpDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obj3-api-'))
    process.env.OBJ3_DATA_DIR = tmpDataDir
  })

  afterEach(async () => {
    delete process.env.OBJ3_DATA_DIR
    if (tmpDataDir) {
      await fs.rm(tmpDataDir, { recursive: true, force: true })
    }
  })

  it('serves capabilities list and capability detail', async () => {
    const startedAt = Date.now()
    const listResponse = await getCapabilities(createRequest('/api/v1/capabilities'))
    const durationMs = Date.now() - startedAt
    expect(listResponse.status).toBe(200)
    expect(durationMs).toBeLessThan(200)
    const listBody = await listResponse.json()
    expect(Array.isArray(listBody.data)).toBe(true)
    expect(listBody.data.length).toBeGreaterThan(0)
    expect(listBody.error).toBeNull()
    expect(listBody.meta).toMatchObject({ apiVersion: 'v1' })

    const firstId = String(listBody.data[0].id)
    const detailResponse = await getCapabilityDetail(
      createRequest(`/api/v1/capabilities/${firstId}`),
      {
        params: Promise.resolve({ id: firstId }),
      },
    )

    expect(detailResponse.status).toBe(200)
    const detailBody = await detailResponse.json()
    expect(detailBody.data).toMatchObject({ id: firstId })
    expect(detailBody.error).toBeNull()
  })

  it('handles participants CRUD and invalid JSON body', async () => {
    const invalidCreateResponse = await createParticipant(
      createRequest('/api/v1/participants', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{ invalid-json',
      }),
    )

    expect(invalidCreateResponse.status).toBe(400)
    const invalidCreateBody = await invalidCreateResponse.json()
    expect(invalidCreateBody.error).toMatchObject({ code: 'INVALID_JSON' })

    const createResponse = await createParticipant(
      createRequest('/api/v1/participants', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
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
    expect(createBody.error).toBeNull()

    const listResponse = await getParticipants(createRequest('/api/v1/participants'))
    expect(listResponse.status).toBe(200)
    const listBody = await listResponse.json()
    expect(listBody.data).toHaveLength(1)

    const updateResponse = await updateParticipant(
      createRequest('/api/v1/participants?id=participant-alpha', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
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
    const invalidResponse = await generateZone(
      createRequest('/api/v1/zones/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
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
        headers: { 'content-type': 'application/json' },
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
          headers: { 'content-type': 'application/json' },
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

  it('serves API root and OpenAPI contract', async () => {
    const rootResponse = await getApiRoot(createRequest('/api/v1'))
    expect(rootResponse.status).toBe(200)
    const rootBody = await rootResponse.json()
    expect(rootBody.data).toMatchObject({
      version: 'v1',
    })
    expect(rootBody.data.endpoints).toContain('/api/v1/openapi.json')
    expect(rootBody.data.endpoints).toContain('/api/v1/swagger')
    expect(rootBody.data.endpoints).toContain('/api/v1/telemetry')

    const openApiResponse = await getOpenApi(createRequest('/api/v1/openapi.json'))
    expect(openApiResponse.status).toBe(200)
    const openApiBody = await openApiResponse.json()
    expect(openApiBody.data).toMatchObject({
      openapi: '3.0.3',
    })
    expect(openApiBody.data.paths).toHaveProperty('/participants')
    expect(openApiBody.data.paths).toHaveProperty('/zones/generate')
    expect(openApiBody.data.paths).toHaveProperty('/telemetry')
    expect(openApiBody.data.paths).toHaveProperty('/swagger')

    const swaggerResponse = await getSwaggerUi(createRequest('/api/v1/swagger'))
    expect(swaggerResponse.status).toBe(200)
    expect(swaggerResponse.headers.get('content-type')).toContain('text/html')
    const swaggerBody = await swaggerResponse.text()
    expect(swaggerBody).toContain('/api/v1/openapi.json')
  })

  it('serves a telemetry probe with structured observability metadata', async () => {
    const previousEnv = {
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
      const response = await getTelemetry(createRequest('/api/v1/telemetry'))

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
      Object.assign(mutableEnv, previousEnv)
    }
  })

  it('sanitizes participant fields to reduce stored XSS risk', async () => {
    const createResponse = await createParticipant(
      createRequest('/api/v1/participants', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
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

    const listResponse = await getParticipants(createRequest('/api/v1/participants'))
    expect(listResponse.status).toBe(200)
    const listBody = await listResponse.json()
    const participant = listBody.data.find((entry: { id: string }) => entry.id === 'participant-xss')
    expect(participant.name).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')

    const deleteResponse = await deleteParticipant(
      createRequest('/api/v1/participants?id=participant-xss', {
        method: 'DELETE',
      }),
    )
    expect(deleteResponse.status).toBe(200)
  })

  it('rate limits repeated requests for same client on api-v1', async () => {
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
