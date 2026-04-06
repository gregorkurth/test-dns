import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { GET as getCapabilityDetail } from './capabilities/[id]/route'
import { GET as getCapabilities } from './capabilities/route'
import { GET as getOpenApi } from './openapi.json/route'
import { GET as getSwaggerUi } from './swagger/route'
import {
  DELETE as deleteParticipant,
  GET as getParticipants,
  POST as createParticipant,
  PUT as updateParticipant,
} from './participants/route'
import { GET as getApiRoot } from './route'
import { POST as generateZone } from './zones/generate/route'

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
    const listResponse = await getCapabilities()
    const durationMs = Date.now() - startedAt
    expect(listResponse.status).toBe(200)
    expect(durationMs).toBeLessThan(200)
    const listBody = await listResponse.json()
    expect(Array.isArray(listBody.data)).toBe(true)
    expect(listBody.data.length).toBeGreaterThan(0)
    expect(listBody.error).toBeNull()
    expect(listBody.meta).toMatchObject({ apiVersion: 'v1' })

    const firstId = String(listBody.data[0].id)
    const detailResponse = await getCapabilityDetail(new Request(`http://localhost/api/v1/capabilities/${firstId}`), {
      params: Promise.resolve({ id: firstId }),
    })

    expect(detailResponse.status).toBe(200)
    const detailBody = await detailResponse.json()
    expect(detailBody.data).toMatchObject({ id: firstId })
    expect(detailBody.error).toBeNull()
  })

  it('handles participants CRUD and invalid JSON body', async () => {
    const invalidCreateResponse = await createParticipant(
      new Request('http://localhost/api/v1/participants', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{ invalid-json',
      }),
    )

    expect(invalidCreateResponse.status).toBe(400)
    const invalidCreateBody = await invalidCreateResponse.json()
    expect(invalidCreateBody.error).toMatchObject({ code: 'INVALID_JSON' })

    const createResponse = await createParticipant(
      new Request('http://localhost/api/v1/participants', {
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

    const listResponse = await getParticipants()
    expect(listResponse.status).toBe(200)
    const listBody = await listResponse.json()
    expect(listBody.data).toHaveLength(1)

    const updateResponse = await updateParticipant(
      new Request('http://localhost/api/v1/participants?id=participant-alpha', {
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
      new Request('http://localhost/api/v1/participants?id=participant-alpha', {
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
      new Request('http://localhost/api/v1/zones/generate', {
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
      new Request('http://localhost/api/v1/zones/generate', {
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

  it('serves API root and OpenAPI contract', async () => {
    const rootResponse = await getApiRoot()
    expect(rootResponse.status).toBe(200)
    const rootBody = await rootResponse.json()
    expect(rootBody.data).toMatchObject({
      version: 'v1',
    })
    expect(rootBody.data.endpoints).toContain('/api/v1/openapi.json')
    expect(rootBody.data.endpoints).toContain('/api/v1/swagger')

    const openApiResponse = await getOpenApi()
    expect(openApiResponse.status).toBe(200)
    const openApiBody = await openApiResponse.json()
    expect(openApiBody.data).toMatchObject({
      openapi: '3.0.3',
    })
    expect(openApiBody.data.paths).toHaveProperty('/participants')
    expect(openApiBody.data.paths).toHaveProperty('/zones/generate')

    const swaggerResponse = await getSwaggerUi()
    expect(swaggerResponse.status).toBe(200)
    expect(swaggerResponse.headers.get('content-type')).toContain('text/html')
    const swaggerBody = await swaggerResponse.text()
    expect(swaggerBody).toContain('/api/v1/openapi.json')
  })
})
