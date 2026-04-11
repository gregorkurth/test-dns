import { NextResponse } from 'next/server'

import {
  apiError,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import {
  exportObj24History,
  type Obj24HistoryChangeType,
  Obj24DomainError,
} from '@/lib/obj24-baseline-history'

export const dynamic = 'force-dynamic'

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
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-obj24-history-export' })
  if (rateLimited) {
    return rateLimited
  }

  const auth = await requireSession(request, 'viewer')
  if (!auth.ok) {
    return auth.response
  }

  try {
    const url = new URL(request.url)
    const formatParam = normalizeParam(url.searchParams.get('format'))
    const actor = normalizeParam(url.searchParams.get('actor'))
    const changeType = normalizeParam(url.searchParams.get('changeType'))
    const scope = normalizeParam(url.searchParams.get('scope'))
    const from = normalizeParam(url.searchParams.get('from'))
    const to = normalizeParam(url.searchParams.get('to'))

    const format = formatParam === 'csv' ? 'csv' : formatParam === 'json' || !formatParam ? 'json' : null
    if (!format) {
      return apiError(422, {
        code: 'INVALID_HISTORY_EXPORT_FORMAT',
        message: 'format muss json oder csv sein.',
      })
    }

    if (changeType && !validChangeTypes.includes(changeType as Obj24HistoryChangeType)) {
      return apiError(422, {
        code: 'INVALID_HISTORY_CHANGE_TYPE',
        message:
          'changeType muss baseline_load, manual_update oder rollback sein.',
      })
    }

    const exported = await exportObj24History({
      format,
      actor,
      changeType: (changeType as Obj24HistoryChangeType | null) ?? null,
      scope,
      from,
      to,
      limit: 1000,
    })

    return new NextResponse(exported.payload, {
      status: 200,
      headers: {
        'content-type': exported.contentType,
        'content-disposition': `attachment; filename="${exported.fileName}"`,
      },
    })
  } catch (error) {
    if (error instanceof Obj24DomainError) {
      return handleObj24Error(error)
    }

    return handleUnexpectedApiError(
      error,
      'Historien-Export konnte nicht erstellt werden.',
    )
  }
}
