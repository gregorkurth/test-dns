import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import { getCapabilityById } from '@/lib/obj3-capabilities'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'viewer')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const { id } = await context.params
    const capability = await getCapabilityById(id)
    if (!capability) {
      return apiError(404, {
        code: 'CAPABILITY_NOT_FOUND',
        message: `Capability "${id}" wurde nicht gefunden.`,
      })
    }

    return apiSuccess(capability)
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Capability-Detail konnte nicht geladen werden.',
    )
  }
}
