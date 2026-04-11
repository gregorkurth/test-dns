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
  loadObj24BaselineFromRepository,
  obj24BaselineLoadSchema,
  Obj24DomainError,
} from '@/lib/obj24-baseline-history'

export const dynamic = 'force-dynamic'

function handleObj24Error(error: Obj24DomainError) {
  return apiError(error.status, {
    code: error.code,
    message: error.message,
    details: error.details,
  })
}

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-obj24-baseline-load' })
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
    const payload = obj24BaselineLoadSchema.parse(body.data)
    const result = await loadObj24BaselineFromRepository(payload)
    return apiSuccess(result)
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(422, {
        code: 'OBJ24_BASELINE_LOAD_VALIDATION',
        message: 'Ungueltige Baseline-Ladeparameter.',
        details: toValidationIssues(error.issues),
      })
    }

    if (error instanceof Obj24DomainError) {
      return handleObj24Error(error)
    }

    return handleUnexpectedApiError(
      error,
      'Baseline konnte nicht geladen werden.',
    )
  }
}
