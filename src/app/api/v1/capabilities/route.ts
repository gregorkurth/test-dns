import { apiSuccess, handleUnexpectedApiError } from '@/lib/obj3-api'
import { listCapabilities } from '@/lib/obj3-capabilities'

export const dynamic = 'force-dynamic'

export async function GET() {
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
