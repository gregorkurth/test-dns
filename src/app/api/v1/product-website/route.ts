import {
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { getProductWebsiteViewModel } from '@/lib/obj15-product-website'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-product-website' })
  if (rateLimited) {
    return rateLimited
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
