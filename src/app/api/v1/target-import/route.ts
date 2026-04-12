import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
  parseJsonBody,
  toValidationIssues,
  sanitizeForMessage,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import {
  buildObj20DryRun,
  getLatestObj20TargetImportRun,
  getObj20TargetImportRuns,
  getObj20TargetImportSummary,
  loadObj20TargetImportDocument,
  obj20TargetImportRequestSchema,
  type Obj20DeploymentMode,
  type Obj20RunStatus,
} from '@/lib/obj20-target-import'

export const dynamic = 'force-dynamic'

const validStatuses: Obj20RunStatus[] = ['completed', 'degraded', 'blocked', 'recovering']
const validModes: Obj20DeploymentMode[] = ['fresh', 'rerun', 'recovery']

function normalizeParam(value: string | null): string | null {
  if (!value) {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, {
    namespace: 'api-v1-target-import',
    maxRequests: 90,
  })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'viewer')
  if (!authResult.ok) {
    return authResult.response
  }

  try {
    const url = new URL(request.url)
    const environmentId = normalizeParam(url.searchParams.get('environmentId'))
    const status = normalizeParam(url.searchParams.get('status'))
    const deploymentMode = normalizeParam(url.searchParams.get('deploymentMode'))
    const latestOnly =
      normalizeParam(url.searchParams.get('latestOnly')) === 'true' ||
      normalizeParam(url.searchParams.get('latestOnly')) === '1'

    if (status && !validStatuses.includes(status as Obj20RunStatus)) {
      return apiError(422, {
        code: 'INVALID_TARGET_IMPORT_STATUS',
        message: `Ungueltiger status-Parameter: ${sanitizeForMessage(status)}.`,
      })
    }

    if (deploymentMode && !validModes.includes(deploymentMode as Obj20DeploymentMode)) {
      return apiError(422, {
        code: 'INVALID_TARGET_IMPORT_MODE',
        message: `Ungueltiger deploymentMode-Parameter: ${sanitizeForMessage(deploymentMode)}.`,
      })
    }

    const [document, summary, latest, runs] = await Promise.all([
      loadObj20TargetImportDocument(),
      getObj20TargetImportSummary(),
      getLatestObj20TargetImportRun(),
      getObj20TargetImportRuns({
        environmentId,
        status: (status as Obj20RunStatus | null) ?? null,
        deploymentMode: (deploymentMode as Obj20DeploymentMode | null) ?? null,
        latestOnly,
      }),
    ])

    return apiSuccess({
      service: document.service,
      sourceOfTruth: document.sourceOfTruth,
      updatedAt: document.updatedAt,
      environments: document.environments,
      summary,
      latest,
      runs,
    })
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Zielimport- und Rehydrierungsstatus konnte nicht geladen werden.',
    )
  }
}

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, {
    namespace: 'api-v1-target-import-dry-run',
    maxRequests: 30,
  })
  if (rateLimited) {
    return rateLimited
  }

  const authResult = await requireSession(request, 'operator')
  if (!authResult.ok) {
    return authResult.response
  }

  const parsedBody = await parseJsonBody<unknown>(request)
  if (!parsedBody.ok) {
    return parsedBody.response
  }

  const parsed = obj20TargetImportRequestSchema.safeParse(parsedBody.data)
  if (!parsed.success) {
    return apiError(422, {
      code: 'TARGET_IMPORT_VALIDATION_ERROR',
      message: 'Dry-Run fuer Zielimport ist ungueltig.',
      details: toValidationIssues(parsed.error.issues),
    })
  }

  try {
    const dryRun = buildObj20DryRun(parsed.data)

    return apiSuccess(
      {
        mode: 'dry-run',
        dryRun,
      },
      {
        status: dryRun.eligible ? 200 : 409,
      },
    )
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Dry-Run fuer Zielimport konnte nicht berechnet werden.',
    )
  }
}
