import { apiSuccess } from '@/lib/obj3-api'
import { getPublicAuthConfiguration, requireSession } from '@/lib/obj12-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const sessionResult = await requireSession(request, 'viewer')
  if (!sessionResult.ok) {
    return sessionResult.response
  }

  const authConfig = getPublicAuthConfiguration()
  return apiSuccess({
    tokenType: 'Bearer' as const,
    expiresAt: sessionResult.session.expiresAt,
    expiresInSeconds: authConfig.ttlSeconds,
    session: {
      username: sessionResult.session.username,
      displayName: sessionResult.session.displayName,
      role: sessionResult.session.role,
      provider: sessionResult.session.provider,
    },
    auth: {
      mode: authConfig.mode,
      ttlSeconds: authConfig.ttlSeconds,
    },
  })
}

