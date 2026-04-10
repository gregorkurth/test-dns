import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import {
  getLatestObj17SecurityBundle,
  getObj17SecurityBundles,
  getObj17SecuritySummary,
  loadObj17SecurityDocument,
  type Obj17ReleaseChannel,
} from '@/lib/obj17-security-scanning'

export const dynamic = 'force-dynamic'

const validChannels: Obj17ReleaseChannel[] = ['ga', 'beta', 'rc']
const maxLimit = 50

function normalizeParam(value: string | null): string | null {
  if (!value) {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-security-scans' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'viewer')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const url = new URL(request.url)
    const channel = normalizeParam(url.searchParams.get('channel'))
    const version = normalizeParam(url.searchParams.get('version'))
    const limitRaw = normalizeParam(url.searchParams.get('limit'))

    if (channel && !validChannels.includes(channel as Obj17ReleaseChannel)) {
      return apiError(422, {
        code: 'INVALID_SECURITY_CHANNEL',
        message: `Ungueltiger channel-Parameter: ${channel}. Erlaubt sind ga, beta, rc.`,
      })
    }

    let limit: number | undefined
    if (limitRaw) {
      if (!/^\d+$/.test(limitRaw)) {
        return apiError(422, {
          code: 'INVALID_SECURITY_LIMIT',
          message: 'limit muss eine positive Ganzzahl sein.',
        })
      }
      const parsed = Number.parseInt(limitRaw, 10)
      if (parsed < 1 || parsed > maxLimit) {
        return apiError(422, {
          code: 'INVALID_SECURITY_LIMIT',
          message: `limit muss zwischen 1 und ${maxLimit} liegen.`,
        })
      }
      limit = parsed
    }

    const [document, summary, latest, bundles] = await Promise.all([
      loadObj17SecurityDocument(),
      getObj17SecuritySummary(),
      getLatestObj17SecurityBundle(),
      getObj17SecurityBundles({
        channel: (channel as Obj17ReleaseChannel | null) ?? null,
        version,
        limit,
      }),
    ])

    if (version && bundles.length === 0) {
      return apiError(404, {
        code: 'SECURITY_BUNDLE_NOT_FOUND',
        message: `Kein Security-Bundle fuer Version ${version} gefunden.`,
      })
    }

    return apiSuccess({
      service: document.service,
      sourceOfTruth: document.sourceOfTruth,
      updatedAt: document.updatedAt,
      summary,
      latest,
      bundles,
    })
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Security- und SBOM-Status konnte nicht geladen werden.',
    )
  }
}
