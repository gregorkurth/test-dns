import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import {
  getLatestReleaseNotice,
  getReleaseNotices,
  getReleaseSummary,
  loadReleaseNoticesDocument,
} from '@/lib/obj14-release-management'

export const dynamic = 'force-dynamic'
const RELEASE_CHANNELS = ['ga', 'beta', 'rc'] as const
const MAX_RELEASE_LIMIT = 50

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-releases' })
  if (rateLimited) {
    return rateLimited
  }

  try {
    const url = new URL(request.url)
    const version = url.searchParams.get('version')
    const channel = url.searchParams.get('channel')
    if (channel && !RELEASE_CHANNELS.includes(channel as (typeof RELEASE_CHANNELS)[number])) {
      return apiError(422, {
        code: 'INVALID_RELEASE_CHANNEL',
        message: `Ungueltiger channel-Parameter: ${channel}. Erlaubt sind ga, beta oder rc.`,
      })
    }

    const includeDrafts =
      url.searchParams.get('includeDrafts') === 'true' ||
      url.searchParams.get('includeDrafts') === '1'
    const limitParam = url.searchParams.get('limit')
    let limit: number | undefined
    if (limitParam) {
      if (!/^\d+$/.test(limitParam)) {
        return apiError(422, {
          code: 'INVALID_RELEASE_LIMIT',
          message: 'limit muss eine positive Ganzzahl sein.',
        })
      }

      const parsedLimit = Number.parseInt(limitParam, 10)
      if (parsedLimit < 1 || parsedLimit > MAX_RELEASE_LIMIT) {
        return apiError(422, {
          code: 'INVALID_RELEASE_LIMIT',
          message: `limit muss zwischen 1 und ${MAX_RELEASE_LIMIT} liegen.`,
        })
      }

      limit = parsedLimit
    }

    const [document, notices, latest, summary] = await Promise.all([
      loadReleaseNoticesDocument(),
      getReleaseNotices({
        version,
        channel,
        includeDrafts,
        limit,
      }),
      getLatestReleaseNotice(),
      getReleaseSummary(),
    ])

    if (version && notices.length === 0) {
      return apiError(404, {
        code: 'RELEASE_NOTICE_NOT_FOUND',
        message: `Kein Release-Hinweis fuer ${version} gefunden.`,
      })
    }

    return apiSuccess({
      sourceOfTruth: 'docs/releases/UPDATE-NOTICES.json',
      service: document.service,
      updatedAt: document.updatedAt,
      latest,
      summary,
      notices,
    })
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Release-Hinweise konnten nicht geladen werden.',
    )
  }
}
