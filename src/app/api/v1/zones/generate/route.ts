import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
  parseJsonBody,
  toValidationIssues,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import { emitFailureSignal, emitSuccessSignal } from '@/lib/obj11-observability'
import { generateZoneFile, zoneGenerationSchema } from '@/lib/obj3-zone-generator'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'operator')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const parsedBody = await parseJsonBody<unknown>(request)
    if (!parsedBody.ok) {
      return parsedBody.response
    }

    const parsed = zoneGenerationSchema.safeParse(parsedBody.data)
    if (!parsed.success) {
      return apiError(422, {
        code: 'ZONE_VALIDATION_ERROR',
        message: 'Zone-Generierung fehlgeschlagen: ungueltige Eingabedaten.',
        details: toValidationIssues(parsed.error.issues),
      })
    }

    const generated = generateZoneFile(parsed.data)
    await emitSuccessSignal({
      name: 'dns.zone.generated',
      operation: 'zones.generate',
      route: '/api/v1/zones/generate',
      statusCode: 200,
      attributes: {
        zone_name: generated.zoneName,
        record_count: generated.recordCount,
        serial: generated.serial,
      },
    })
    return apiSuccess(generated)
  } catch (error) {
    await emitFailureSignal({
      name: 'dns.zone.generate.failed',
      operation: 'zones.generate',
      route: '/api/v1/zones/generate',
      statusCode: 500,
      attributes: {
        error_message:
          error instanceof Error ? error.message : 'Zone-Generierung fehlgeschlagen.',
      },
    })
    return handleUnexpectedApiError(
      error,
      'Zone-Generierung konnte nicht ausgefuehrt werden.',
    )
  }
}
