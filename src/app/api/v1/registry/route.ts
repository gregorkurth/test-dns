import {
  apiError,
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'
import {
  loadObj18RegistryData,
  parseObj18ArtifactType,
  parseObj18Boolean,
  parseObj18PublishState,
  parseObj18RegistryChannel,
} from '@/lib/obj18-artifact-registry'

export const dynamic = 'force-dynamic'

const MAX_LIMIT = 100

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1-registry' })
  if (rateLimited) {
    return rateLimited
  }

  try {
    const url = new URL(request.url)
    const version = url.searchParams.get('version')
    const channel = url.searchParams.get('channel')
    const artifactType = url.searchParams.get('artifactType')
    const publishState = url.searchParams.get('publishState')
    const zarfIncluded = url.searchParams.get('zarfIncluded')
    const limitParam = url.searchParams.get('limit')

    if (channel && !parseObj18RegistryChannel(channel)) {
      return apiError(422, {
        code: 'INVALID_REGISTRY_CHANNEL',
        message: `Ungueltiger channel-Parameter: ${channel}. Erlaubt sind ga, beta oder rc.`,
      })
    }

    if (artifactType && !parseObj18ArtifactType(artifactType)) {
      return apiError(422, {
        code: 'INVALID_REGISTRY_ARTIFACT_TYPE',
        message: `Ungueltiger artifactType-Parameter: ${artifactType}.`,
      })
    }

    if (publishState && !parseObj18PublishState(publishState)) {
      return apiError(422, {
        code: 'INVALID_REGISTRY_PUBLISH_STATE',
        message: `Ungueltiger publishState-Parameter: ${publishState}.`,
      })
    }

    if (zarfIncluded && parseObj18Boolean(zarfIncluded) === null) {
      return apiError(422, {
        code: 'INVALID_REGISTRY_ZARF_FLAG',
        message: 'zarfIncluded muss true/false oder 1/0 sein.',
      })
    }

    let limit: number | undefined
    if (limitParam) {
      if (!/^\d+$/.test(limitParam)) {
        return apiError(422, {
          code: 'INVALID_REGISTRY_LIMIT',
          message: 'limit muss eine positive Ganzzahl sein.',
        })
      }

      limit = Number.parseInt(limitParam, 10)
      if (limit < 1 || limit > MAX_LIMIT) {
        return apiError(422, {
          code: 'INVALID_REGISTRY_LIMIT',
          message: `limit muss zwischen 1 und ${MAX_LIMIT} liegen.`,
        })
      }
    }

    const data = await loadObj18RegistryData({
      version,
      channel: channel ? parseObj18RegistryChannel(channel) : null,
      artifactType: artifactType ? parseObj18ArtifactType(artifactType) : null,
      publishState: publishState ? parseObj18PublishState(publishState) : null,
      zarfIncluded: zarfIncluded ? parseObj18Boolean(zarfIncluded) : null,
      limit,
    })

    return apiSuccess({
      sourceOfTruth: data.summary.sourceOfTruth,
      summary: data.summary,
      records: data.records,
    })
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'Registry-Daten konnten nicht geladen werden.',
    )
  }
}
