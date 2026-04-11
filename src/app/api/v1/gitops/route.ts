import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import { requireSession } from '@/lib/obj12-auth'
import {
  getObj21GitOpsSummary,
  getObj21ManagedApplications,
  loadObj21GitOpsDocument,
  type Obj21HealthStatus,
  type Obj21SourceRole,
  type Obj21SyncMode,
} from '@/lib/obj21-gitops'

export const dynamic = 'force-dynamic'

const validStatuses: Obj21HealthStatus[] = [
  'Healthy',
  'Degraded',
  'Progressing',
  'Missing',
]
const validSyncModes: Obj21SyncMode[] = ['manual', 'automated']
const validSourceRoles: Obj21SourceRole[] = ['release', 'config']

function normalizeParam(value: string | null): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, {
    namespace: 'api-v1-gitops',
    maxRequests: 90,
  })
  if (rateLimited) {
    return rateLimited
  }

  const auth = await requireSession(request, 'viewer')
  if (!auth.ok) {
    return auth.response
  }

  try {
    const url = new URL(request.url)
    const status = normalizeParam(url.searchParams.get('status'))
    const component = normalizeParam(url.searchParams.get('component'))
    const syncMode = normalizeParam(url.searchParams.get('syncMode'))
    const sourceRole = normalizeParam(url.searchParams.get('sourceRole'))

    if (status && !validStatuses.includes(status as Obj21HealthStatus)) {
      return apiError(422, {
        code: 'INVALID_GITOPS_STATUS',
        message: `Ungueltiger status-Parameter: ${status}.`,
      })
    }

    if (syncMode && !validSyncModes.includes(syncMode as Obj21SyncMode)) {
      return apiError(422, {
        code: 'INVALID_GITOPS_SYNC_MODE',
        message: `Ungueltiger syncMode-Parameter: ${syncMode}.`,
      })
    }

    if (sourceRole && !validSourceRoles.includes(sourceRole as Obj21SourceRole)) {
      return apiError(422, {
        code: 'INVALID_GITOPS_SOURCE_ROLE',
        message: `Ungueltiger sourceRole-Parameter: ${sourceRole}.`,
      })
    }

    const [document, summary, applications] = await Promise.all([
      loadObj21GitOpsDocument(),
      getObj21GitOpsSummary(),
      getObj21ManagedApplications({
        status: (status as Obj21HealthStatus | null) ?? null,
        component,
        syncMode: (syncMode as Obj21SyncMode | null) ?? null,
        sourceRole: (sourceRole as Obj21SourceRole | null) ?? null,
      }),
    ])

    if ((status || component || syncMode || sourceRole) && applications.length === 0) {
      return apiError(404, {
        code: 'GITOPS_APPLICATIONS_NOT_FOUND',
        message: 'Keine GitOps-Applications fuer die angegebenen Filter gefunden.',
      })
    }

    return apiSuccess({
      service: document.service,
      sourceOfTruth: document.sourceOfTruth,
      updatedAt: document.updatedAt,
      rootApplication: document.rootApplication,
      appProject: document.appProject,
      sources: document.sources,
      revisionBindings: document.revisionBindings,
      bootstrap: document.bootstrap,
      summary,
      applications,
    })
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'GitOps- und Argo-CD-Status konnte nicht geladen werden.',
    )
  }
}
