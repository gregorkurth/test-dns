import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import { loadObj25HelmStatusData } from '@/lib/obj25-helm-status'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-helm-status' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'viewer')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const url = new URL(request.url)
    const runChecksParam = url.searchParams.get('runChecks')
    const releaseParam = url.searchParams.get('release')
    const namespaceParam = url.searchParams.get('namespace')

    if (
      runChecksParam !== null &&
      !['1', '0', 'true', 'false'].includes(runChecksParam.toLowerCase())
    ) {
      return apiError(422, {
        code: 'INVALID_RUN_CHECKS',
        message: 'runChecks muss true/false oder 1/0 sein.',
      })
    }

    const releaseName = releaseParam?.trim()
    const namespace = namespaceParam?.trim()

    if (releaseParam !== null && !releaseName) {
      return apiError(422, {
        code: 'INVALID_RELEASE',
        message: 'release darf nicht leer sein.',
      })
    }

    if (namespaceParam !== null && !namespace) {
      return apiError(422, {
        code: 'INVALID_NAMESPACE',
        message: 'namespace darf nicht leer sein.',
      })
    }

    const runChecks =
      runChecksParam === null
        ? true
        : runChecksParam === '1' || runChecksParam.toLowerCase() === 'true'

    const data = await loadObj25HelmStatusData({
      runChecks,
      releaseName,
      namespace,
    })
    return apiSuccess(data)
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'OBJ-25 Helm-Status konnte nicht geladen werden.',
    )
  }
}
