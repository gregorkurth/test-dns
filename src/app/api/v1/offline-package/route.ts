import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import {
  getLatestObj19OfflinePackage,
  getObj19OfflinePackages,
  getObj19OfflinePackageSummary,
  loadObj19OfflinePackageDocument,
  type Obj19PackageVariant,
} from '@/lib/obj19-offline-package'

export const dynamic = 'force-dynamic'

const maxLimit = 20
const validVariants: Obj19PackageVariant[] = ['minimal', 'full']

function normalizeParam(value: string | null): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-offline-package' })
  if (rateLimited) {
    return rateLimited
  }

  try {
    const url = new URL(request.url)
    const version = normalizeParam(url.searchParams.get('version'))
    const variant = normalizeParam(url.searchParams.get('variant'))
    const limitRaw = normalizeParam(url.searchParams.get('limit'))

    if (variant && !validVariants.includes(variant as Obj19PackageVariant)) {
      return apiError(422, {
        code: 'INVALID_OFFLINE_PACKAGE_VARIANT',
        message: `Ungueltiger variant-Parameter: ${variant}. Erlaubt sind minimal oder full.`,
      })
    }

    let limit: number | undefined
    if (limitRaw) {
      if (!/^\d+$/.test(limitRaw)) {
        return apiError(422, {
          code: 'INVALID_OFFLINE_PACKAGE_LIMIT',
          message: 'limit muss eine positive Ganzzahl sein.',
        })
      }

      const parsed = Number.parseInt(limitRaw, 10)
      if (parsed < 1 || parsed > maxLimit) {
        return apiError(422, {
          code: 'INVALID_OFFLINE_PACKAGE_LIMIT',
          message: `limit muss zwischen 1 und ${maxLimit} liegen.`,
        })
      }

      limit = parsed
    }

    const [document, summary, latestPackage, packages] = await Promise.all([
      loadObj19OfflinePackageDocument(),
      getObj19OfflinePackageSummary(),
      getLatestObj19OfflinePackage(),
      getObj19OfflinePackages({
        version,
        variant: (variant as Obj19PackageVariant | null) ?? null,
        limit,
      }),
    ])

    if ((version || variant) && packages.length === 0) {
      return apiError(404, {
        code: 'OFFLINE_PACKAGE_NOT_FOUND',
        message: 'Kein passendes Offline-Paket fuer die angegebenen Filter gefunden.',
      })
    }

    return apiSuccess({
      service: document.service,
      sourceOfTruth: document.sourceOfTruth,
      updatedAt: document.updatedAt,
      summary,
      latestPackage,
      packages,
    })
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Offline-Paket-Metadaten konnten nicht geladen werden.',
    )
  }
}
