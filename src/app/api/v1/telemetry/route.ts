import { apiSuccess, enforceRateLimit } from '@/lib/obj3-api'
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
