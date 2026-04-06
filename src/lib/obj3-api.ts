import { NextResponse } from 'next/server'

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
  },
): NextResponse<ApiResponseShape<null>> {
  return NextResponse.json(
    {
      data: null,
      error,
      meta: createMeta(options?.meta),
    },
    { status },
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
