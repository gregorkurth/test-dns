import { apiSuccess, enforceRateLimit } from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import {
  buildObservabilityProbe,
  emitObservabilityProbeLog,
} from '@/lib/observability'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-telemetry' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'viewer')
  if (!authResult.ok) {
    return authResult.response
  }

  const probe = buildObservabilityProbe()
  emitObservabilityProbeLog(probe)

  return apiSuccess({
    probe,
    routing: {
      local: 'spool',
      clickhouse: 'clickhouse',
      siem: 'otel_security_events',
    },
    transport: 'otlp/http',
  })
}
