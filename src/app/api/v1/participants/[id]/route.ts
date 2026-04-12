import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
  parseJsonBody,
  toValidationIssues,
  sanitizeForMessage,
} from '@/lib/obj3-api'
import {
  deleteParticipant,
  getParticipantById,
  participantUpdateSchema,
  updateParticipant,
} from '@/lib/obj3-participants-store'
import { requireSession } from '@/lib/obj12-auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'viewer')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const { id } = await context.params
    const participant = await getParticipantById(id)
    if (!participant) {
      return apiError(404, {
        code: 'PARTICIPANT_NOT_FOUND',
        message: `Participant "${sanitizeForMessage(id)}" wurde nicht gefunden.`,
      })
    }

    return apiSuccess(participant)
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Participant konnte nicht geladen werden.',
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'operator')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const { id } = await context.params
    const parsedBody = await parseJsonBody<unknown>(request)
    if (!parsedBody.ok) {
      return parsedBody.response
    }

    const parsed = participantUpdateSchema.safeParse(parsedBody.data)
    if (!parsed.success) {
      return apiError(422, {
        code: 'VALIDATION_ERROR',
        message: 'Participant-Update ist ungueltig.',
        details: toValidationIssues(parsed.error.issues),
      })
    }

    const updated = await updateParticipant(id, parsed.data)
    if (!updated) {
      return apiError(404, {
        code: 'PARTICIPANT_NOT_FOUND',
        message: `Participant "${sanitizeForMessage(id)}" wurde nicht gefunden.`,
      })
    }

    return apiSuccess(updated)
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Participant konnte nicht aktualisiert werden.',
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'operator')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const { id } = await context.params
    const deleted = await deleteParticipant(id)
    if (!deleted) {
      return apiError(404, {
        code: 'PARTICIPANT_NOT_FOUND',
        message: `Participant "${sanitizeForMessage(id)}" wurde nicht gefunden.`,
      })
    }

    return apiSuccess({ id, deleted: true })
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Participant konnte nicht geloescht werden.',
    )
  }
}
