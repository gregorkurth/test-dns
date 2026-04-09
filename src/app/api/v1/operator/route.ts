import { apiSuccess, enforceRateLimit, handleUnexpectedApiError } from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import { loadObj13OperatorData } from '@/lib/obj13-operator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-operator' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'viewer')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const data = await loadObj13OperatorData()
    return apiSuccess(data)
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Operator-Status konnte nicht geladen werden.',
    )
  }
}
