import { ZodError } from 'zod'

import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
  parseJsonBody,
  toValidationIssues,
} from '@/lib/obj3-api'
import {
  createParticipant,
  deleteParticipant,
  listParticipants,
  participantCreateSchema,
  participantUpdateSchema,
  updateParticipant,
} from '@/lib/obj3-participants-store'
import { requireSession } from '@/lib/obj12-auth'

export const dynamic = 'force-dynamic'

function idFromUrl(request: Request): string | null {
  const id = new URL(request.url).searchParams.get('id')
  if (!id) {
    return null
  }
  const trimmed = id.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'viewer')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const participants = await listParticipants()
    return apiSuccess(participants, {
      meta: { count: participants.length },
    })
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Participant-Liste konnte nicht geladen werden.',
    )
  }
}

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

    const parsed = participantCreateSchema.safeParse(parsedBody.data)
    if (!parsed.success) {
      return apiError(422, {
        code: 'VALIDATION_ERROR',
        message: 'Participant-Daten sind ungueltig.',
        details: toValidationIssues(parsed.error.issues),
      })
    }

    const created = await createParticipant(parsed.data)
    return apiSuccess(created, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('existiert bereits')) {
      return apiError(422, {
        code: 'DUPLICATE_PARTICIPANT',
        message: error.message,
      })
    }

    return handleUnexpectedApiError(
      error,
      'Participant konnte nicht erstellt werden.',
    )
  }
}

export async function PUT(request: Request) {
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

    if (!parsedBody.data || typeof parsedBody.data !== 'object') {
      return apiError(400, {
        code: 'INVALID_BODY',
        message: 'Ungueltiger Request-Body.',
      })
    }

    const candidate = parsedBody.data as Record<string, unknown>
    const id =
      idFromUrl(request) ??
      (typeof candidate.id === 'string' ? candidate.id.trim() : null)

    if (!id) {
      return apiError(400, {
        code: 'MISSING_ID',
        message: 'Participant-ID fehlt (Query-Parameter id oder body.id).',
      })
    }

    const parsed = participantUpdateSchema.safeParse(candidate)
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
        message: `Participant "${id}" wurde nicht gefunden.`,
      })
    }

    return apiSuccess(updated)
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(422, {
        code: 'VALIDATION_ERROR',
        message: 'Participant-Update ist ungueltig.',
        details: toValidationIssues(error.issues),
      })
    }

    return handleUnexpectedApiError(
      error,
      'Participant konnte nicht aktualisiert werden.',
    )
  }
}

export async function DELETE(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'operator')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    let id = idFromUrl(request)

    if (!id) {
      const raw = await request.text().catch(() => '')
      if (raw.trim()) {
        try {
          const parsed = JSON.parse(raw) as Record<string, unknown>
          if (typeof parsed.id === 'string' && parsed.id.trim()) {
            id = parsed.id.trim()
          }
        } catch {
          return apiError(400, {
            code: 'INVALID_JSON',
            message: 'Ungueltiger JSON-Body.',
          })
        }
      }
    }

    if (!id) {
      return apiError(400, {
        code: 'MISSING_ID',
        message: 'Participant-ID fehlt (Query-Parameter id oder body.id).',
      })
    }

    const deleted = await deleteParticipant(id)
    if (!deleted) {
      return apiError(404, {
        code: 'PARTICIPANT_NOT_FOUND',
        message: `Participant "${id}" wurde nicht gefunden.`,
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
