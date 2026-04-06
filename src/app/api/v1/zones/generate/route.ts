import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
  parseJsonBody,
  toValidationIssues,
} from '@/lib/obj3-api'
import { generateZoneFile, zoneGenerationSchema } from '@/lib/obj3-zone-generator'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1' })
  if (rateLimited) {
    return rateLimited
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
    return apiSuccess(generated)
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Zone-Generierung konnte nicht ausgefuehrt werden.',
    )
  }
}
