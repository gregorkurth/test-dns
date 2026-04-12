import { apiSuccess, enforceRateLimit, handleUnexpectedApiError } from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import { loadObj13OperatorData } from '@/lib/obj13-operator'
import { loadObj26TestOperatorData } from '@/lib/obj26-test-operator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-operator' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'viewer')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const [data, obj26] = await Promise.all([
      loadObj13OperatorData(),
      loadObj26TestOperatorData(),
    ])
    return apiSuccess({
      ...data,
      testOperator: {
        name: obj26.operator.name,
        intervalMinutes: obj26.operator.intervalMinutes,
        telemetryMode: obj26.telemetry.mode,
        lastRunStatus: obj26.summary.lastRunStatus,
        lastRunAt: obj26.summary.lastRunAt,
      },
    })
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Operator-Status konnte nicht geladen werden.',
    )
  }
}
