import { apiSuccess } from '@/lib/obj3-api'
import { logoutSession, requireSession } from '@/lib/obj12-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const sessionResult = await requireSession(request, 'viewer')
  if (!sessionResult.ok) {
    return sessionResult.response
  }

  await logoutSession(request)
  return apiSuccess({
    loggedOut: true,
    username: sessionResult.session.username,
  })
}
