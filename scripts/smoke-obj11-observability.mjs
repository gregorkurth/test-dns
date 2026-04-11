#!/usr/bin/env node

import http from 'node:http'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import os from 'node:os'
import path from 'node:path'

const repoRoot = process.cwd()
const appPort = Number(process.env.OBJ11_SMOKE_APP_PORT || 3010)
const collectorPort = Number(process.env.OBJ11_SMOKE_COLLECTOR_PORT || 4318)
const appBaseUrl = `http://127.0.0.1:${appPort}`
const collectorUrl = `http://127.0.0.1:${collectorPort}`
const spoolDir =
  process.env.OBJ11_SMOKE_SPOOL_DIR?.trim() ||
  path.join(os.tmpdir(), `obj11-smoke-spool-${Date.now()}`)

const collectorRequests = []

function parseJsonBody(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function createCollectorServer() {
  return http.createServer(async (request, response) => {
    if (request.method !== 'POST' || request.url !== '/v1/logs') {
      response.statusCode = 404
      response.end('not found')
      return
    }

    let raw = ''
    for await (const chunk of request) {
      raw += chunk
    }

    const parsed = parseJsonBody(raw)
    collectorRequests.push({
      url: request.url,
      headers: request.headers,
      raw,
      parsed,
    })

    response.statusCode = 200
    response.setHeader('content-type', 'text/plain')
    response.end('ok')
  })
}

function spawnAppServer() {
  const child = spawn(
    'npm',
    ['run', 'dev', '--', '--hostname', '127.0.0.1', '--port', String(appPort)],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        OTEL_EXPORT_MODE: 'clickhouse',
        OTEL_EXPORT_ENDPOINT: collectorUrl,
        OTEL_EXPORT_TIMEOUT_MS: '2500',
        OTEL_SERVICE_NAME: 'dns-management-service',
        SERVICE_NAME: 'dns-management-service',
        OTEL_RESOURCE_ATTRIBUTES:
          'service.namespace=dns,service.version=smoke,deployment.environment=qa',
        OBSERVABILITY_SPOOL_DIR: spoolDir,
        OBSERVABILITY_QUEUE_DIR: path.join(spoolDir, 'queue'),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  let stdout = ''
  let stderr = ''

  child.stdout?.on('data', (chunk) => {
    stdout += chunk.toString()
  })
  child.stderr?.on('data', (chunk) => {
    stderr += chunk.toString()
  })

  return {
    child,
    getLogs: () => ({ stdout, stderr }),
  }
}

async function waitForAppReady(baseUrl, timeoutMs = 120_000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/api/v1`)
      if (response.ok) {
        return
      }
    } catch {
      // keep waiting
    }
    await delay(1000)
  }

  throw new Error(`App did not become ready at ${baseUrl} within ${timeoutMs}ms`)
}

async function requestJson(url, init) {
  const response = await fetch(url, init)
  const text = await response.text()
  let body = null
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }

  return { status: response.status, body }
}

function extractLogNames(payload) {
  const names = []
  for (const resourceLog of payload?.resourceLogs ?? []) {
    for (const scopeLog of resourceLog?.scopeLogs ?? []) {
      for (const logRecord of scopeLog?.logRecords ?? []) {
        if (typeof logRecord?.body?.stringValue === 'string') {
          names.push(logRecord.body.stringValue)
        }
      }
    }
  }
  return names
}

function getServiceName(payload) {
  const attributes =
    payload?.resourceLogs?.[0]?.resource?.attributes ?? []

  for (const attribute of attributes) {
    if (attribute?.key !== 'service.name') {
      continue
    }
    return (
      attribute?.value?.stringValue ??
      attribute?.value?.intValue ??
      attribute?.value?.doubleValue ??
      null
    )
  }

  return null
}

async function main() {
  const collector = createCollectorServer()
  await new Promise((resolve, reject) => {
    collector.once('error', reject)
    collector.listen(collectorPort, '127.0.0.1', resolve)
  })

  const app = spawnAppServer()

  try {
    await waitForAppReady(appBaseUrl)

    const login = await requestJson(`${appBaseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'local',
        username: 'viewer',
        password: 'viewer-demo',
      }),
    })

    if (login.status !== 200) {
      throw new Error(
        `Expected /api/v1/auth/login to return 200, got ${login.status}`,
      )
    }

    const accessToken = login.body?.data?.accessToken
    if (typeof accessToken !== 'string' || !accessToken.trim()) {
      throw new Error('Expected auth/login response to include accessToken')
    }

    const capabilities = await requestJson(`${appBaseUrl}/api/v1/capabilities`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    const dashboard = await requestJson(
      `${appBaseUrl}/api/test-execution-dashboard`,
      {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (capabilities.status !== 200) {
      throw new Error(
        `Expected /api/v1/capabilities to return 200, got ${capabilities.status}`,
      )
    }

    if (dashboard.status !== 200) {
      throw new Error(
        `Expected /api/test-execution-dashboard to return 200, got ${dashboard.status}`,
      )
    }

    const deadline = Date.now() + 15_000
    while (collectorRequests.length < 2 && Date.now() < deadline) {
      await delay(250)
    }

    if (collectorRequests.length === 0) {
      throw new Error('Collector did not receive any OTLP payloads')
    }

    const parsedPayloads = collectorRequests
      .map((entry) => entry.parsed)
      .filter(Boolean)

    const logNames = parsedPayloads.flatMap((payload) => extractLogNames(payload))
    const serviceNames = parsedPayloads.map((payload) => getServiceName(payload))

    if (!serviceNames.includes('dns-management-service')) {
      throw new Error(
        'Collector payload does not carry service.name=dns-management-service',
      )
    }

    if (
      !logNames.some((name) =>
        ['dns.capabilities.listed', 'dns.test_execution_dashboard.loaded'].includes(name),
      )
    ) {
      throw new Error(
        `Collector payload missing expected observability signal. Got: ${logNames.join(', ')}`,
      )
    }

    console.log(
      JSON.stringify(
        {
          appUrl: appBaseUrl,
          collectorUrl,
          requests: {
            login: login.status,
            capabilities: capabilities.status,
            dashboard: dashboard.status,
          },
          collectorPayloads: collectorRequests.length,
          logNames,
          serviceNames,
          spoolDir,
        },
        null,
        2,
      ),
    )
  } finally {
    app.child.kill('SIGTERM')
    collector.close()
    await delay(500)
    if (app.child.exitCode === null) {
      app.child.kill('SIGKILL')
    }
  }
}

main().catch((error) => {
  console.error('OBJ-11 smoke test failed.')
  console.error(error instanceof Error ? error.stack || error.message : error)
  process.exitCode = 1
})
