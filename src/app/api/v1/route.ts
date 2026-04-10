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
    auth: {
      login: '/api/v1/auth/login',
      session: '/api/v1/auth/session',
      logout: '/api/v1/auth/logout',
      protectedRoleModel: ['viewer', 'operator', 'admin'],
    },
    endpoints: [
      '/api/v1/auth/login',
      '/api/v1/auth/session',
      '/api/v1/auth/logout',
      '/api/v1/capabilities',
      '/api/v1/capabilities/{id}',
      '/api/v1/participants',
      '/api/v1/participants/{id}',
      '/api/v1/zones/generate',
      '/api/v1/operator',
      '/api/v1/product-website',
      '/api/v1/telemetry',
      '/api/v1/releases',
      '/api/v1/maturity',
      '/api/v1/security/scans',
      '/api/v1/openapi.json',
      '/api/v1/swagger',
    ],
  })
}
