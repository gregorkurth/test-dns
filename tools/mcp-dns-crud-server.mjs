#!/usr/bin/env node

/**
 * DNS CRUD MCP Server (stdio)
 *
 * Provides MCP tools that proxy CRUD operations to the existing DNS REST API.
 * Target API defaults to: http://localhost:3000/api/v1
 */

const DEFAULT_PROTOCOL_VERSION = '2024-11-05'
const SERVER_INFO = {
  name: 'dns-crud-mcp',
  version: '0.1.0',
}

const API_BASE_URL = (process.env.DNS_API_BASE_URL ?? 'http://localhost:3000/api/v1').replace(/\/+$/, '')
const API_TOKEN = process.env.DNS_API_TOKEN?.trim()
const CLIENT_ID = process.env.DNS_API_CLIENT_ID?.trim() || 'mcp-dns-crud'

const TOOL_DEFINITIONS = [
  {
    name: 'dns_list_participants',
    description: 'Listet alle DNS Participants aus /participants.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 200 },
        search: { type: 'string', minLength: 1 },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'dns_get_participant',
    description: 'Liest einen Participant per ID aus /participants/{id}.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', minLength: 2 },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'dns_create_participant',
    description: 'Erstellt einen Participant via POST /participants.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', minLength: 2 },
        name: { type: 'string', minLength: 1 },
        notes: { type: 'string' },
        metadata: { type: 'object' },
      },
      required: ['id', 'name'],
      additionalProperties: false,
    },
  },
  {
    name: 'dns_update_participant',
    description: 'Aktualisiert einen Participant via PUT /participants/{id}.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', minLength: 2 },
        name: { type: 'string', minLength: 1 },
        notes: { type: 'string' },
        metadata: { type: 'object' },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'dns_delete_participant',
    description: 'Loescht einen Participant via DELETE /participants/{id}.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', minLength: 2 },
      },
      required: ['id'],
      additionalProperties: false,
    },
  },
  {
    name: 'dns_generate_zone_file',
    description: 'Erzeugt eine Zone-Datei via POST /zones/generate.',
    inputSchema: {
      type: 'object',
      properties: {
        zoneName: { type: 'string', minLength: 1 },
        records: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 1 },
              type: { type: 'string', minLength: 1 },
              value: { type: 'string', minLength: 1 },
              ttl: { type: 'integer', minimum: 1 },
            },
            required: ['name', 'type', 'value'],
            additionalProperties: false,
          },
        },
        ttl: { type: 'integer', minimum: 1 },
      },
      required: ['zoneName', 'records'],
      additionalProperties: false,
    },
  },
]

let messageBuffer = Buffer.alloc(0)
let expectedContentLength = null

function logError(message) {
  process.stderr.write(`[dns-crud-mcp] ${message}\n`)
}

function writeMessage(payload) {
  const json = JSON.stringify(payload)
  const bytes = Buffer.byteLength(json, 'utf8')
  const header = `Content-Length: ${bytes}\r\nContent-Type: application/json\r\n\r\n`
  process.stdout.write(header)
  process.stdout.write(json)
}

function writeResult(id, result) {
  writeMessage({
    jsonrpc: '2.0',
    id,
    result,
  })
}

function writeError(id, code, message, data) {
  writeMessage({
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(data !== undefined ? { data } : {}),
    },
  })
}

function toObject(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {}
  }
  return input
}

function requireString(value, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Feld "${fieldName}" ist erforderlich.`)
  }
  return value.trim()
}

function normalizeApiResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  if ('data' in payload && 'error' in payload && 'meta' in payload) {
    return payload
  }

  return {
    data: payload,
    error: null,
    meta: {
      apiVersion: 'unknown',
      timestamp: new Date().toISOString(),
      requestId: 'mcp-local',
    },
  }
}

async function callDnsApi(pathname, options = {}) {
  const url = new URL(pathname.replace(/^\//, ''), `${API_BASE_URL}/`).toString()
  const headers = {
    Accept: 'application/json',
    'x-forwarded-for': CLIENT_ID,
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const raw = await response.text()
  let body = raw
  if (raw.trim().length > 0) {
    try {
      body = JSON.parse(raw)
    } catch {
      // Keep raw text for diagnostics.
    }
  } else {
    body = null
  }

  if (!response.ok) {
    const error = new Error(`DNS API Fehler ${response.status} bei ${options.method ?? 'GET'} ${pathname}`)
    error.status = response.status
    error.body = body
    throw error
  }

  return normalizeApiResponse(body)
}

function makeToolResult(data) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
    structuredContent: data,
  }
}

function makeToolError(error) {
  const status = typeof error?.status === 'number' ? error.status : null
  const body = error?.body ?? null
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            ok: false,
            message: error instanceof Error ? error.message : 'Unbekannter Fehler',
            status,
            body,
          },
          null,
          2,
        ),
      },
    ],
    isError: true,
  }
}

async function handleToolCall(name, args) {
  const input = toObject(args)

  switch (name) {
    case 'dns_list_participants': {
      const payload = await callDnsApi('/participants', { method: 'GET' })
      let entries = Array.isArray(payload?.data) ? payload.data : []

      if (typeof input.search === 'string' && input.search.trim()) {
        const needle = input.search.trim().toLowerCase()
        entries = entries.filter((entry) => {
          const id = String(entry?.id ?? '').toLowerCase()
          const participantName = String(entry?.name ?? '').toLowerCase()
          return id.includes(needle) || participantName.includes(needle)
        })
      }

      if (typeof input.limit === 'number' && Number.isInteger(input.limit) && input.limit > 0) {
        entries = entries.slice(0, input.limit)
      }

      return makeToolResult({
        ok: true,
        count: entries.length,
        participants: entries,
      })
    }

    case 'dns_get_participant': {
      const id = requireString(input.id, 'id')
      const payload = await callDnsApi(`/participants/${encodeURIComponent(id)}`, { method: 'GET' })
      return makeToolResult({
        ok: true,
        participant: payload?.data ?? null,
        meta: payload?.meta ?? null,
      })
    }

    case 'dns_create_participant': {
      const id = requireString(input.id, 'id')
      const participantName = requireString(input.name, 'name')
      const body = {
        id,
        name: participantName,
        ...(typeof input.notes === 'string' ? { notes: input.notes } : {}),
        ...(input.metadata && typeof input.metadata === 'object' ? { metadata: input.metadata } : {}),
      }
      const payload = await callDnsApi('/participants', { method: 'POST', body })
      return makeToolResult({
        ok: true,
        participant: payload?.data ?? null,
        meta: payload?.meta ?? null,
      })
    }

    case 'dns_update_participant': {
      const id = requireString(input.id, 'id')
      const body = {
        ...(typeof input.name === 'string' ? { name: input.name } : {}),
        ...(typeof input.notes === 'string' ? { notes: input.notes } : {}),
        ...(input.metadata && typeof input.metadata === 'object' ? { metadata: input.metadata } : {}),
      }

      if (Object.keys(body).length === 0) {
        throw new Error('Fuer Update muss mindestens eines der Felder name, notes oder metadata gesetzt werden.')
      }

      const payload = await callDnsApi(`/participants/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body,
      })

      return makeToolResult({
        ok: true,
        participant: payload?.data ?? null,
        meta: payload?.meta ?? null,
      })
    }

    case 'dns_delete_participant': {
      const id = requireString(input.id, 'id')
      const payload = await callDnsApi(`/participants/${encodeURIComponent(id)}`, { method: 'DELETE' })
      return makeToolResult({
        ok: true,
        result: payload?.data ?? null,
        meta: payload?.meta ?? null,
      })
    }

    case 'dns_generate_zone_file': {
      const zoneName = requireString(input.zoneName, 'zoneName')
      if (!Array.isArray(input.records) || input.records.length === 0) {
        throw new Error('Feld "records" muss ein nicht-leeres Array sein.')
      }

      const body = {
        zoneName,
        records: input.records,
        ...(typeof input.ttl === 'number' ? { ttl: input.ttl } : {}),
      }

      const payload = await callDnsApi('/zones/generate', { method: 'POST', body })
      return makeToolResult({
        ok: true,
        zone: payload?.data ?? null,
        meta: payload?.meta ?? null,
      })
    }

    default:
      throw new Error(`Unbekannter Tool-Name: ${name}`)
  }
}

async function handleRequest(message) {
  if (!message || typeof message !== 'object') {
    return
  }

  const id = Object.prototype.hasOwnProperty.call(message, 'id') ? message.id : null
  const method = message.method

  if (typeof method !== 'string') {
    if (id !== null) {
      writeError(id, -32600, 'Invalid Request')
    }
    return
  }

  if (method === 'initialize') {
    const params = toObject(message.params)
    const protocolVersion =
      typeof params.protocolVersion === 'string' && params.protocolVersion.trim()
        ? params.protocolVersion.trim()
        : DEFAULT_PROTOCOL_VERSION

    writeResult(id, {
      protocolVersion,
      capabilities: {
        tools: {},
      },
      serverInfo: SERVER_INFO,
      instructions:
        'DNS CRUD MCP Server: Nutze die dns_* Tools fuer Participants CRUD und Zone-File-Generierung.',
    })
    return
  }

  if (method === 'notifications/initialized') {
    return
  }

  if (method === 'tools/list') {
    writeResult(id, {
      tools: TOOL_DEFINITIONS,
    })
    return
  }

  if (method === 'tools/call') {
    const params = toObject(message.params)
    const name = requireString(params.name, 'name')
    const args = toObject(params.arguments)
    try {
      const toolResult = await handleToolCall(name, args)
      writeResult(id, toolResult)
    } catch (error) {
      writeResult(id, makeToolError(error))
    }
    return
  }

  if (method === 'ping') {
    writeResult(id, {
      pong: true,
      server: SERVER_INFO.name,
      ts: new Date().toISOString(),
    })
    return
  }

  writeError(id, -32601, `Method not found: ${method}`)
}

function processBuffer() {
  // Parse LSP/MCP style frames: headers + body
  while (true) {
    if (expectedContentLength === null) {
      const headerEnd = messageBuffer.indexOf('\r\n\r\n')
      if (headerEnd === -1) {
        return
      }

      const headerRaw = messageBuffer.subarray(0, headerEnd).toString('utf8')
      const headerLines = headerRaw.split('\r\n')
      let contentLength = null

      for (const line of headerLines) {
        const [key, ...rest] = line.split(':')
        if (!key || rest.length === 0) {
          continue
        }

        if (key.trim().toLowerCase() === 'content-length') {
          const value = Number.parseInt(rest.join(':').trim(), 10)
          if (Number.isFinite(value) && value >= 0) {
            contentLength = value
          }
        }
      }

      messageBuffer = messageBuffer.subarray(headerEnd + 4)

      if (contentLength === null) {
        logError('Frame ohne gueltigen Content-Length Header empfangen.')
        continue
      }

      expectedContentLength = contentLength
    }

    if (messageBuffer.length < expectedContentLength) {
      return
    }

    const payloadRaw = messageBuffer.subarray(0, expectedContentLength).toString('utf8')
    messageBuffer = messageBuffer.subarray(expectedContentLength)
    expectedContentLength = null

    try {
      const message = JSON.parse(payloadRaw)
      void handleRequest(message)
    } catch (error) {
      logError(`Ungueltiges JSON empfangen: ${String(error)}`)
    }
  }
}

process.stdin.on('data', (chunk) => {
  messageBuffer = Buffer.concat([messageBuffer, chunk])
  processBuffer()
})

process.stdin.on('error', (error) => {
  logError(`stdin error: ${String(error)}`)
})

process.on('uncaughtException', (error) => {
  logError(`uncaughtException: ${error?.stack ?? String(error)}`)
})

process.on('unhandledRejection', (reason) => {
  logError(`unhandledRejection: ${String(reason)}`)
})
