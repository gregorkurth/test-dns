import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import {
  getLatestObj22GateReport,
  getObj22GateReports,
  getObj22GateSummary,
  loadObj22GateIndex,
  parseObj22ArtifactKind,
  parseObj22GateDecision,
} from '@/lib/obj22-release-gate'

export const dynamic = 'force-dynamic'

const maxLimit = 50

function normalizeParam(value: string | null): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-gate' })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'viewer')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const url = new URL(request.url)
    const version = normalizeParam(url.searchParams.get('version'))
    const decisionRaw = normalizeParam(url.searchParams.get('decision'))
    const artifactKindRaw = normalizeParam(url.searchParams.get('artifactKind'))
    const limitRaw = normalizeParam(url.searchParams.get('limit'))

    const decision = decisionRaw ? parseObj22GateDecision(decisionRaw) : null
    if (decisionRaw && !decision) {
      return apiError(422, {
        code: 'INVALID_GATE_DECISION',
        message: `Ungueltiger decision-Parameter: ${decisionRaw}.`,
      })
    }

    const artifactKind = artifactKindRaw ? parseObj22ArtifactKind(artifactKindRaw) : null
    if (artifactKindRaw && !artifactKind) {
      return apiError(422, {
        code: 'INVALID_GATE_ARTIFACT_KIND',
        message: `Ungueltiger artifactKind-Parameter: ${artifactKindRaw}.`,
      })
    }

    let limit: number | undefined
    if (limitRaw) {
      if (!/^\d+$/.test(limitRaw)) {
        return apiError(422, {
          code: 'INVALID_GATE_LIMIT',
          message: 'limit muss eine positive Ganzzahl sein.',
        })
      }

      const parsed = Number.parseInt(limitRaw, 10)
      if (parsed < 1 || parsed > maxLimit) {
        return apiError(422, {
          code: 'INVALID_GATE_LIMIT',
          message: `limit muss zwischen 1 und ${maxLimit} liegen.`,
        })
      }
      limit = parsed
    }

    const [index, summary, latest, reports] = await Promise.all([
      loadObj22GateIndex(),
      getObj22GateSummary(),
      getLatestObj22GateReport(),
      getObj22GateReports({
        version,
        decision,
        artifactKind,
        limit,
      }),
    ])

    if ((version || decision || artifactKind) && reports.length === 0) {
      return apiError(404, {
        code: 'GATE_REPORT_NOT_FOUND',
        message: 'Kein Gate-Report fuer die angegebenen Filter gefunden.',
      })
    }

    return apiSuccess({
      service: index.service,
      sourceOfTruth: index.sourceOfTruth,
      updatedAt: index.updatedAt,
      policyVersion: index.policyVersion,
      summary,
      latest,
      reports,
    })
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Gate-Status konnte nicht geladen werden.',
    )
  }
}
