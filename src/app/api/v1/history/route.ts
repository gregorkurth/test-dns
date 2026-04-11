import { ZodError } from 'zod'

import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
  parseJsonBody,
  toValidationIssues,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import {
  appendObj24HistoryChange,
  getObj24HistoryEntries,
  obj24HistoryCreateSchema,
  type Obj24HistoryChangeType,
  Obj24DomainError,
} from '@/lib/obj24-baseline-history'

export const dynamic = 'force-dynamic'

const maxHistoryLimit = 1000

const validChangeTypes: Obj24HistoryChangeType[] = [
  'baseline_load',
  'manual_update',
  'rollback',
]

function normalizeParam(value: string | null): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function handleObj24Error(error: Obj24DomainError) {
  return apiError(error.status, {
    code: error.code,
    message: error.message,
    details: error.details,
  })
}

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-obj24-history' })
  if (rateLimited) {
    return rateLimited
  }

  const authGet = await requireSession(request, 'viewer')
  if (!authGet.ok) {
    return authGet.response
  }

  try {
    const url = new URL(request.url)
    const actor = normalizeParam(url.searchParams.get('actor'))
    const changeType = normalizeParam(url.searchParams.get('changeType'))
    const scope = normalizeParam(url.searchParams.get('scope'))
    const from = normalizeParam(url.searchParams.get('from'))
    const to = normalizeParam(url.searchParams.get('to'))
    const limitRaw = normalizeParam(url.searchParams.get('limit'))

    if (changeType && !validChangeTypes.includes(changeType as Obj24HistoryChangeType)) {
      return apiError(422, {
        code: 'INVALID_HISTORY_CHANGE_TYPE',
        message:
          'changeType muss baseline_load, manual_update oder rollback sein.',
      })
    }

    let limit: number | null = null
    if (limitRaw) {
      if (!/^\d+$/.test(limitRaw)) {
        return apiError(422, {
          code: 'INVALID_HISTORY_LIMIT',
          message: 'limit muss eine positive Ganzzahl sein.',
        })
      }

      const parsed = Number.parseInt(limitRaw, 10)
      if (parsed < 1 || parsed > maxHistoryLimit) {
        return apiError(422, {
          code: 'INVALID_HISTORY_LIMIT',
          message: `limit muss zwischen 1 und ${maxHistoryLimit} liegen.`,
        })
      }

      limit = parsed
    }

    const entries = await getObj24HistoryEntries({
      actor,
      changeType: (changeType as Obj24HistoryChangeType | null) ?? null,
      scope,
      from,
      to,
      limit,
    })

    return apiSuccess({
      total: entries.length,
      entries,
    })
  } catch (error) {
    if (error instanceof Obj24DomainError) {
      return handleObj24Error(error)
    }

    return handleUnexpectedApiError(
      error,
      'Historie konnte nicht geladen werden.',
    )
  }
}

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-obj24-history-write' })
  if (rateLimited) {
    return rateLimited
  }

  const authPost = await requireSession(request, 'operator')
  if (!authPost.ok) {
    return authPost.response
  }

  const body = await parseJsonBody<unknown>(request)
  if (!body.ok) {
    return body.response
  }

  try {
    const payload = obj24HistoryCreateSchema.parse(body.data)
    const entry = await appendObj24HistoryChange(payload)
    return apiSuccess(entry, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(422, {
        code: 'OBJ24_HISTORY_WRITE_VALIDATION',
        message: 'Ungueltige Aenderungsdaten fuer die Historie.',
        details: toValidationIssues(error.issues),
      })
    }

    if (error instanceof Obj24DomainError) {
      return handleObj24Error(error)
    }

    return handleUnexpectedApiError(
      error,
      'Historien-Eintrag konnte nicht gespeichert werden.',
    )
  }
}
