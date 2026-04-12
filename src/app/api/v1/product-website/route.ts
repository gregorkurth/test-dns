import {
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import { getProductWebsiteViewModel } from '@/lib/obj15-product-website'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-product-website' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'viewer')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const data = await getProductWebsiteViewModel()
    return apiSuccess(data)
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Produkt-Website-Daten konnten nicht geladen werden.',
    )
  }
}
