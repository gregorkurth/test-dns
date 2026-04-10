import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import {
  filterObj16Features,
  loadObj16MaturityData,
  type Obj16Priority,
  type Obj16ReleaseChannel,
  type Obj16TestStatus,
} from '@/lib/obj16-maturity'

export const dynamic = 'force-dynamic'

const validStatuses = ['Planned', 'In Progress', 'In Review', 'Completed', 'Deployed'] as const
const validChannels: Obj16ReleaseChannel[] = ['released', 'beta', 'preview', 'unknown']
const validRisks: Obj16Priority[] = ['blocker', 'high', 'normal']
const validTestStatuses: Obj16TestStatus[] = ['passed', 'failed', 'never_executed']

function normalizeParam(value: string | null): string | null {
  if (!value) {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-maturity' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'viewer')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const url = new URL(request.url)
    const status = normalizeParam(url.searchParams.get('status'))
    const releaseChannel = normalizeParam(url.searchParams.get('releaseChannel'))
    const riskPriority = normalizeParam(url.searchParams.get('riskPriority'))
    const testStatus = normalizeParam(url.searchParams.get('testStatus'))
    const phase = normalizeParam(url.searchParams.get('phase'))
    const query = normalizeParam(url.searchParams.get('query'))

    if (status && !validStatuses.includes(status as (typeof validStatuses)[number])) {
      return apiError(422, {
        code: 'INVALID_MATURITY_STATUS',
        message: `Ungueltiger status-Parameter: ${status}`,
      })
    }
    if (releaseChannel && !validChannels.includes(releaseChannel as Obj16ReleaseChannel)) {
      return apiError(422, {
        code: 'INVALID_MATURITY_CHANNEL',
        message: `Ungueltiger releaseChannel-Parameter: ${releaseChannel}`,
      })
    }
    if (riskPriority && !validRisks.includes(riskPriority as Obj16Priority)) {
      return apiError(422, {
        code: 'INVALID_MATURITY_RISK',
        message: `Ungueltiger riskPriority-Parameter: ${riskPriority}`,
      })
    }
    if (testStatus && !validTestStatuses.includes(testStatus as Obj16TestStatus)) {
      return apiError(422, {
        code: 'INVALID_MATURITY_TEST_STATUS',
        message: `Ungueltiger testStatus-Parameter: ${testStatus}`,
      })
    }

    const data = await loadObj16MaturityData()
    const filteredFeatures = filterObj16Features(data.features, {
      phase,
      status: status as (typeof validStatuses)[number] | null,
      releaseChannel: releaseChannel as Obj16ReleaseChannel | null,
      riskPriority: riskPriority as Obj16Priority | null,
      testStatus: testStatus as Obj16TestStatus | null,
      query,
    })

    return apiSuccess({
      ...data,
      features: filteredFeatures,
      filtersApplied: {
        phase,
        status,
        releaseChannel,
        riskPriority,
        testStatus,
        query,
      },
    })
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Maturitaetsstatus konnte nicht geladen werden.',
    )
  }
}
