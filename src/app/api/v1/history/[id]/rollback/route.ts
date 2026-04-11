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
  obj24HistoryRollbackSchema,
  Obj24DomainError,
  rollbackObj24HistoryEntry,
} from '@/lib/obj24-baseline-history'

export const dynamic = 'force-dynamic'

function handleObj24Error(error: Obj24DomainError) {
  return apiError(error.status, {
    code: error.code,
    message: error.message,
    details: error.details,
  })
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-obj24-history-rollback' })
  if (rateLimited) {
    return rateLimited
  }

  const auth = await requireSession(request, 'operator')
  if (!auth.ok) {
    return auth.response
  }

  const body = await parseJsonBody<unknown>(request)
  if (!body.ok) {
    return body.response
  }

  try {
    const { id } = await context.params
    const payload = obj24HistoryRollbackSchema.parse(body.data)
    const rollbackEntry = await rollbackObj24HistoryEntry(id, payload)
    return apiSuccess(rollbackEntry)
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(422, {
        code: 'OBJ24_HISTORY_ROLLBACK_VALIDATION',
        message: 'Ungueltige Rollback-Parameter.',
        details: toValidationIssues(error.issues),
      })
    }

    if (error instanceof Obj24DomainError) {
      return handleObj24Error(error)
    }

    return handleUnexpectedApiError(
      error,
      'Rollback konnte nicht ausgefuehrt werden.',
    )
  }
}
