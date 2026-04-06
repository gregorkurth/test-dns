import { apiSuccess, enforceRateLimit } from '@/lib/obj3-api'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1' })
  if (rateLimited) {
    return rateLimited
  }

  return apiSuccess({
    name: 'DNS Management Service API',
    version: 'v1',
    endpoints: [
      '/api/v1/capabilities',
      '/api/v1/capabilities/{id}',
      '/api/v1/participants',
      '/api/v1/participants/{id}',
      '/api/v1/zones/generate',
      '/api/v1/openapi.json',
      '/api/v1/swagger',
    ],
  })
}
