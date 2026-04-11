import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import { getObj24BaselineStatusView, Obj24DomainError } from '@/lib/obj24-baseline-history'

export const dynamic = 'force-dynamic'

function handleObj24Error(error: Obj24DomainError) {
  return apiError(error.status, {
    code: error.code,
    message: error.message,
    details: error.details,
  })
}

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-obj24-baseline' })
  if (rateLimited) {
    return rateLimited
  }

  const auth = await requireSession(request, 'viewer')
  if (!auth.ok) {
    return auth.response
  }

  try {
    const statusView = await getObj24BaselineStatusView()
    return apiSuccess(statusView)
  } catch (error) {
    if (error instanceof Obj24DomainError) {
      return handleObj24Error(error)
    }

    return handleUnexpectedApiError(
      error,
      'Baseline-Status konnte nicht geladen werden.',
    )
  }
}
