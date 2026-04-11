import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import { getObj24HistoryEntryById, Obj24DomainError } from '@/lib/obj24-baseline-history'

export const dynamic = 'force-dynamic'

function handleObj24Error(error: Obj24DomainError) {
  return apiError(error.status, {
    code: error.code,
    message: error.message,
    details: error.details,
  })
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-obj24-history-detail' })
  if (rateLimited) {
    return rateLimited
  }

  const auth = await requireSession(request, 'viewer')
  if (!auth.ok) {
    return auth.response
  }

  try {
    const { id } = await context.params
    const entry = await getObj24HistoryEntryById(id)
    if (!entry) {
      return apiError(404, {
        code: 'HISTORY_ENTRY_NOT_FOUND',
        message: `Kein Verlaufseintrag mit ID ${id} gefunden.`,
      })
    }

    return apiSuccess(entry)
  } catch (error) {
    if (error instanceof Obj24DomainError) {
      return handleObj24Error(error)
    }

    return handleUnexpectedApiError(
      error,
      'Verlaufseintrag konnte nicht geladen werden.',
    )
  }
}
