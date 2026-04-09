import { NextResponse } from 'next/server'

import { emitSecuritySignal, createObservabilityRequestId } from '@/lib/obj11-observability'

export interface ApiMeta {
  apiVersion: 'v1'
  timestamp: string
  requestId: string
  [key: string]: unknown
}

export interface ApiErrorShape {
  code: string
  message: string
  details?: unknown
}

export interface ApiResponseShape<TData> {
  data: TData | null
  error: ApiErrorShape | null
  meta: ApiMeta
}

interface RateLimitBucket {
  windowStart: number
  count: number
  expiresAt: number
}

const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 60
const rateLimitStore = new Map<string, RateLimitBucket>()

function createRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function createMeta(overrides?: Record<string, unknown>): ApiMeta {
  return {
    apiVersion: 'v1',
    timestamp: new Date().toISOString(),
    requestId: createRequestId(),
    ...(overrides ?? {}),
  }
}

export function apiSuccess<TData>(
  data: TData,
  options?: {
    status?: number
    meta?: Record<string, unknown>
  },
): NextResponse<ApiResponseShape<TData>> {
  return NextResponse.json(
    {
      data,
      error: null,
      meta: createMeta(options?.meta),
    },
    { status: options?.status ?? 200 },
  )
}

export function apiError(
  status: number,
  error: ApiErrorShape,
  options?: {
    meta?: Record<string, unknown>
    headers?: HeadersInit
  },
): NextResponse<ApiResponseShape<null>> {
  return NextResponse.json(
    {
      data: null,
      error,
      meta: createMeta(options?.meta),
    },
    {
      status,
      headers: options?.headers,
    },
  )
}

export async function parseJsonBody<TBody>(
  request: Request,
): Promise<
  | { ok: true; data: TBody }
  | { ok: false; response: NextResponse<ApiResponseShape<null>> }
> {
  const raw = await request.text().catch(() => '')
  if (!raw.trim()) {
    return {
      ok: false,
      response: apiError(400, {
        code: 'EMPTY_BODY',
        message: 'Request-Body fehlt oder ist leer.',
      }),
    }
  }

  try {
    const parsed = JSON.parse(raw) as TBody
    return { ok: true, data: parsed }
  } catch {
    return {
      ok: false,
      response: apiError(400, {
        code: 'INVALID_JSON',
        message: 'Ungueltiger JSON-Body.',
      }),
    }
  }
}

export function toValidationIssues(
  issues: Array<{
    path: Array<PropertyKey>
    message: string
  }>,
): Array<{ field: string; message: string }> {
  return issues.map((issue) => ({
    field:
      issue.path.length > 0
        ? issue.path.map((part) => String(part)).join('.')
        : 'body',
    message: issue.message,
  }))
}

export function handleUnexpectedApiError(
  error: unknown,
  fallbackMessage: string,
): NextResponse<ApiResponseShape<null>> {
  const message =
    error instanceof Error && error.message.trim().length > 0
      ? error.message
      : fallbackMessage

  return apiError(500, {
    code: 'INTERNAL_ERROR',
    message,
  })
}

function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) {
      return first
    }
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) {
    return realIp
  }

  return 'unknown-client'
}

function cleanupRateLimitStore(now: number): void {
  for (const [key, bucket] of rateLimitStore) {
    if (now >= bucket.expiresAt) {
      rateLimitStore.delete(key)
    }
  }
}

export function enforceRateLimit(
  request: Request,
  options?: {
    namespace?: string
    windowMs?: number
    maxRequests?: number
  },
): NextResponse<ApiResponseShape<null>> | null {
  const now = Date.now()
  cleanupRateLimitStore(now)

  const namespace = options?.namespace ?? 'global'
  const windowMs = options?.windowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS
  const maxRequests = options?.maxRequests ?? DEFAULT_RATE_LIMIT_MAX_REQUESTS

  const clientId = getClientId(request)
  const key = `${namespace}:${clientId}`
  const existing = rateLimitStore.get(key)

  if (!existing || now - existing.windowStart >= windowMs) {
    rateLimitStore.set(key, {
      windowStart: now,
      count: 1,
      expiresAt: now + windowMs * 2,
    })
    return null
  }

  if (existing.count >= maxRequests) {
    void emitSecuritySignal({
      name: 'dns.api.rate_limit.blocked',
      route: namespace,
      operation: 'rate-limit',
      requestId: createObservabilityRequestId(),
      severity: 'WARN',
      statusCode: 429,
      outcome: 'blocked',
      attributes: {
        'client.id': getClientId(request),
        'rate_limit.namespace': namespace,
        'rate_limit.limit': maxRequests,
      },
    })
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((windowMs - (now - existing.windowStart)) / 1000),
    )
    return apiError(
      429,
      {
        code: 'RATE_LIMITED',
        message: 'Zu viele Anfragen. Bitte in kurzer Zeit erneut versuchen.',
        details: {
          limit: maxRequests,
          windowMs,
        },
      },
      {
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      },
    )
  }

  existing.count += 1
  existing.expiresAt = now + windowMs * 2
  rateLimitStore.set(key, existing)
  return null
}
