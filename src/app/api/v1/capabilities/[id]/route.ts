import {
  apiError,
  apiSuccess,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { getCapabilityById } from '@/lib/obj3-capabilities'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
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
