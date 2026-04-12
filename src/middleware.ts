import { NextRequest, NextResponse } from 'next/server'

/**
 * Globales Auth-Middleware (S-06).
 *
 * Alle /api/* Routen erfordern einen Bearer-Token, ausser die explizit
 * aufgeführten öffentlichen Pfade. Dies ist eine Präventivschicht –
 * die vollständige HMAC-Verifikation erfolgt weiterhin in den Routen
 * via requireSession().
 */

const PUBLIC_PATHS = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/logout',
  '/api/v1/auth/session',
  '/api/v1',
  '/api/v1/openapi.json',
  '/api/v1/swagger',
])

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  const authorization = request.headers.get('authorization')?.trim()
  if (!authorization?.startsWith('Bearer ')) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Authentifizierung erforderlich.',
        code: 'UNAUTHORIZED',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
