import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  parseJsonBody,
  toValidationIssues,
} from '@/lib/obj3-api'
import {
  authenticateLocalUser,
  authenticateOidcToken,
  getPublicAuthConfiguration,
  obj12LoginSchema,
} from '@/lib/obj12-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, {
    namespace: 'api-v1-auth-login',
    maxRequests: 60,
  })
  if (rateLimited) {
    return rateLimited
  }

  const parsedBody = await parseJsonBody<unknown>(request)
  if (!parsedBody.ok) {
    return parsedBody.response
  }

  const parsed = obj12LoginSchema.safeParse(parsedBody.data)
  if (!parsed.success) {
    return apiError(422, {
      code: 'AUTH_VALIDATION_ERROR',
      message: 'Authentifizierungsdaten sind ungueltig.',
      details: toValidationIssues(parsed.error.issues),
    })
  }

  try {
    const result =
      parsed.data.mode === 'local'
        ? await authenticateLocalUser({
            username: parsed.data.username,
            password: parsed.data.password,
            request,
          })
        : await authenticateOidcToken({
            token: parsed.data.token,
            request,
          })

    const authConfig = getPublicAuthConfiguration()
    return apiSuccess(
      {
        accessToken: result.accessToken,
        tokenType: 'Bearer' as const,
        expiresAt: result.session.expiresAt,
        expiresInSeconds: authConfig.ttlSeconds,
        session: {
          username: result.session.username,
          displayName: result.session.displayName,
          role: result.session.role,
          provider: result.session.provider,
        },
        auth: {
          mode: authConfig.mode,
          ttlSeconds: authConfig.ttlSeconds,
        },
      },
      {
        status: 200,
      },
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Authentifizierung fehlgeschlagen.'

    const lower = message.toLowerCase()
    const status =
      lower.includes('deaktiviert')
        ? 403
        : lower.includes('konfiguration') || lower.includes('jwks')
          ? 503
          : 401

    return apiError(
      status,
      {
        code: status === 503 ? 'AUTH_CONFIGURATION_ERROR' : 'AUTHENTICATION_FAILED',
        message,
      },
    )
  }
}
