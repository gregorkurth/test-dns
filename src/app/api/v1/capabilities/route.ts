import {
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { listCapabilities } from '@/lib/obj3-capabilities'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1' })
  if (rateLimited) {
    return rateLimited
  }

  try {
    const capabilities = await listCapabilities()
    return apiSuccess(capabilities, {
      meta: {
        count: capabilities.length,
      },
    })
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Capabilities konnten nicht geladen werden.',
    )
  }
}
