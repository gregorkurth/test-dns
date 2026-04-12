import { NextRequest, NextResponse } from 'next/server'

/**
 * Globales Middleware (S-06, S-13).
 *
 * Auth: Alle /api/* Routen erfordern einen Bearer-Token, ausser die explizit
 * aufgeführten öffentlichen Pfade. Die vollständige HMAC-Verifikation
 * erfolgt in den Routen via requireSession().
 *
 * CORS: Nur erlaubte Origins erhalten Access-Control-Allow-Origin.
 * Im Airgap-Betrieb ist NEXT_PUBLIC_ALLOWED_ORIGINS leer → kein CORS-Header
 * → Same-Origin wird erzwungen.
 */

const PUBLIC_PATHS = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/logout',
  '/api/v1/auth/session',
  '/api/v1',
  '/api/v1/openapi.json',
  '/api/v1/swagger',
])

const allowedOrigins = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

function applyCors(request: NextRequest, response: NextResponse): NextResponse {
  if (allowedOrigins.length === 0) {
    return response
  }

  const origin = request.headers.get('origin') ?? ''
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
    response.headers.set('Vary', 'Origin')
  }

  return response
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // OPTIONS Preflight direkt beantworten
  if (request.method === 'OPTIONS') {
    return applyCors(request, new NextResponse(null, { status: 204 }))
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return applyCors(request, NextResponse.next())
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

  return applyCors(request, NextResponse.next())
}

export const config = {
  matcher: '/api/:path*',
}
