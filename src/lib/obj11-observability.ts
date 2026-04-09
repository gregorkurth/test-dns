import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomBytes, randomUUID } from 'node:crypto'

type ObservabilitySignalKind = 'log' | 'metric' | 'trace' | 'security'
type ObservabilityOutcome = 'success' | 'failure' | 'blocked'
type OTelSeverity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export interface ObservabilitySignalInput {
  kind: ObservabilitySignalKind
  name: string
  outcome: ObservabilityOutcome
  severity?: OTelSeverity
  route?: string
  operation?: string
  statusCode?: number
  durationMs?: number
  requestId?: string
  traceId?: string
  spanId?: string
  attributes?: Record<string, string | number | boolean | null | undefined>
}

interface ResourceAttribute {
  key: string
  value: {
    stringValue?: string
    boolValue?: boolean
    intValue?: string
    doubleValue?: number
  }
}

interface OTelLogRecord {
  timeUnixNano: string
  severityText: OTelSeverity
  body: { stringValue: string }
  traceId: string
  spanId: string
  attributes: Array<
    | { key: string; value: { stringValue: string } }
    | { key: string; value: { boolValue: boolean } }
    | { key: string; value: { intValue: string } }
    | { key: string; value: { doubleValue: number } }
  >
}

function getServiceName(): string {
  return (
    process.env.OTEL_SERVICE_NAME?.trim() ||
    process.env.SERVICE_NAME?.trim() ||
    'dns-management-service'
  )
}

function getExportMode(): string {
  return process.env.OTEL_EXPORT_MODE?.trim().toLowerCase() || 'local'
}

function getCollectorEndpoint(): string | null {
  const endpoint = process.env.OTEL_EXPORT_ENDPOINT?.trim()
  if (!endpoint) {
    return null
  }

  return endpoint.replace(/\/+$/, '')
}

function getSpoolDir(): string | null {
  const spoolDir = process.env.OBSERVABILITY_SPOOL_DIR?.trim()
  return spoolDir && spoolDir.length > 0 ? spoolDir : '/tmp/otel/spool'
}

function getTimeoutMs(): number {
  const rawTimeout = process.env.OTEL_EXPORT_TIMEOUT_MS?.trim()
  if (!rawTimeout) {
    return 5000
  }

  const parsed = Number(rawTimeout)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5000
}

function parseResourceAttributes(): ResourceAttribute[] {
  const attributes: ResourceAttribute[] = [
    {
      key: 'service.name',
      value: { stringValue: getServiceName() },
    },
  ]

  const raw = process.env.OTEL_RESOURCE_ATTRIBUTES?.trim()
  if (!raw) {
    return attributes
  }

  for (const pair of raw.split(',')) {
    const [rawKey, ...rawValueParts] = pair.split('=')
    const key = rawKey?.trim()
    const rawValue = rawValueParts.join('=').trim()
    if (!key || !rawValue) {
      continue
    }

    if (rawValue === 'true' || rawValue === 'false') {
      attributes.push({ key, value: { boolValue: rawValue === 'true' } })
      continue
    }

    const numericValue = Number(rawValue)
    if (Number.isFinite(numericValue) && rawValue.match(/^-?\d+(\.\d+)?$/)) {
      if (Number.isInteger(numericValue)) {
        attributes.push({ key, value: { intValue: String(Math.trunc(numericValue)) } })
      } else {
        attributes.push({ key, value: { doubleValue: numericValue } })
      }
      continue
    }

    attributes.push({ key, value: { stringValue: rawValue } })
  }

  return attributes
}

function toTraceId(value?: string): string {
  const clean = value?.replace(/[^a-f0-9]/gi, '').toLowerCase()
  if (clean && clean.length >= 32) {
    return clean.slice(0, 32)
  }
  return randomBytes(16).toString('hex')
}

function toSpanId(value?: string): string {
  const clean = value?.replace(/[^a-f0-9]/gi, '').toLowerCase()
  if (clean && clean.length >= 16) {
    return clean.slice(0, 16)
  }
  return randomBytes(8).toString('hex')
}

function toAttributeEntries(
  attributes: Record<string, string | number | boolean | null | undefined>,
): Array<
  | { key: string; value: { stringValue: string } }
  | { key: string; value: { boolValue: boolean } }
  | { key: string; value: { intValue: string } }
  | { key: string; value: { doubleValue: number } }
> {
  const entries: Array<
    | { key: string; value: { stringValue: string } }
    | { key: string; value: { boolValue: boolean } }
    | { key: string; value: { intValue: string } }
    | { key: string; value: { doubleValue: number } }
  > = []

  for (const [key, value] of Object.entries(attributes)) {
    if (value === null || value === undefined) {
      continue
    }

    if (typeof value === 'boolean') {
      entries.push({ key, value: { boolValue: value } })
      continue
    }

    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        entries.push({ key, value: { intValue: String(value) } })
      } else {
        entries.push({ key, value: { doubleValue: value } })
      }
      continue
    }

    entries.push({ key, value: { stringValue: value } })
  }

  return entries
}

function buildOtelLogRecord(
  signal: ObservabilitySignalInput,
): { resourceAttributes: ResourceAttribute[]; logRecord: OTelLogRecord } {
  const timestamp = new Date().toISOString()
  const traceId = toTraceId(signal.traceId)
  const spanId = toSpanId(signal.spanId)
  const severity = signal.severity ?? (signal.outcome === 'success' ? 'INFO' : 'WARN')

  const eventAttributes: Record<string, string | number | boolean | null | undefined> = {
    'event.domain': signal.kind === 'security' ? 'security' : 'application',
    'observability.kind': signal.kind,
    'observability.outcome': signal.outcome,
    'service.name': getServiceName(),
    'service.version': process.env.npm_package_version ?? '1.0.0',
    'deployment.mode': getExportMode(),
    'request.id': signal.requestId ?? null,
    'http.route': signal.route ?? null,
    'operation.name': signal.operation ?? null,
    'http.status_code': signal.statusCode ?? null,
    'observability.duration_ms': signal.durationMs ?? null,
    ...(signal.attributes ?? {}),
  }

  return {
    resourceAttributes: parseResourceAttributes(),
    logRecord: {
      timeUnixNano: String(BigInt(Date.parse(timestamp)) * BigInt(1_000_000)),
      severityText: severity,
      body: { stringValue: signal.name },
      traceId,
      spanId,
      attributes: toAttributeEntries(eventAttributes),
    },
  }
}

function buildOtelPayload(signal: ObservabilitySignalInput) {
  const { resourceAttributes, logRecord } = buildOtelLogRecord(signal)

  return {
    resourceLogs: [
      {
        resource: {
          attributes: resourceAttributes,
        },
        scopeLogs: [
          {
            scope: {
              name: `${getServiceName()}.observability`,
              version: process.env.npm_package_version ?? '1.0.0',
            },
            logRecords: [logRecord],
          },
        ],
      },
    ],
  }
}

async function appendLocalSpool(payload: unknown): Promise<void> {
  const spoolDir = getSpoolDir()
  if (!spoolDir) {
    return
  }

  await fs.mkdir(spoolDir, { recursive: true })
  const filePath = path.join(spoolDir, 'telemetry.jsonl')
  await fs.appendFile(filePath, `${JSON.stringify(payload)}\n`, 'utf8')
}

async function postToCollector(payload: unknown): Promise<boolean> {
  const endpoint = getCollectorEndpoint()
  if (!endpoint) {
    return false
  }

  const timeoutMs = getTimeoutMs()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${endpoint}/v1/logs`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    return response.ok
  } finally {
    clearTimeout(timeout)
  }
}

export async function emitObservabilitySignal(
  signal: ObservabilitySignalInput,
): Promise<void> {
  const payload = buildOtelPayload(signal)

  if (getExportMode() === 'local') {
    await appendLocalSpool(payload)
    return
  }

  try {
    const delivered = await postToCollector(payload)
    if (!delivered) {
      await appendLocalSpool(payload)
    }
  } catch {
    await appendLocalSpool(payload)
  }
}

export async function emitSuccessSignal(
  input: Omit<ObservabilitySignalInput, 'kind' | 'outcome'> & {
    kind?: ObservabilitySignalKind
  },
): Promise<void> {
  await emitObservabilitySignal({
    kind: input.kind ?? 'log',
    outcome: 'success',
    severity: 'INFO',
    ...input,
  })
}

export async function emitFailureSignal(
  input: Omit<ObservabilitySignalInput, 'kind' | 'outcome'> & {
    kind?: ObservabilitySignalKind
    outcome?: ObservabilityOutcome
    severity?: OTelSeverity
  },
): Promise<void> {
  await emitObservabilitySignal({
    kind: input.kind ?? 'log',
    outcome: input.outcome ?? 'failure',
    severity: input.severity ?? 'ERROR',
    ...input,
  })
}

export async function emitSecuritySignal(
  input: Omit<ObservabilitySignalInput, 'kind' | 'outcome'> & {
    outcome?: ObservabilityOutcome
    severity?: OTelSeverity
  },
): Promise<void> {
  await emitObservabilitySignal({
    kind: 'security',
    outcome: input.outcome ?? 'blocked',
    severity: input.severity ?? 'WARN',
    ...input,
  })
}

export function createObservabilityRequestId(): string {
  return randomUUID()
}
