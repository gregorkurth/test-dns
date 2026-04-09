import {
  apiSuccess,
  enforceRateLimit,
  handleUnexpectedApiError,
} from '@/lib/obj3-api'

export const dynamic = 'force-dynamic'

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'DNS Management Service API',
    version: '1.0.0',
    description: 'OBJ-3 REST API fuer Capabilities, Participants und Zone-Generierung.',
  },
  servers: [
    {
      url: '/api/v1',
    },
  ],
  paths: {
    '/capabilities': {
      get: {
        summary: 'Capabilities auflisten',
        responses: {
          '200': { description: 'Capabilities erfolgreich geladen.' },
        },
      },
    },
    '/capabilities/{id}': {
      get: {
        summary: 'Capability-Detail laden',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Capability erfolgreich geladen.' },
          '404': { description: 'Capability nicht gefunden.' },
        },
      },
    },
    '/participants': {
      get: {
        summary: 'Participants auflisten',
        responses: {
          '200': { description: 'Participant-Liste erfolgreich geladen.' },
        },
      },
      post: {
        summary: 'Participant erstellen',
        responses: {
          '201': { description: 'Participant erstellt.' },
          '400': { description: 'Ungueltiger Request-Body.' },
          '422': { description: 'Validierungsfehler.' },
        },
      },
      put: {
        summary: 'Participant aktualisieren (id in Query oder Body)',
        responses: {
          '200': { description: 'Participant aktualisiert.' },
          '400': { description: 'Fehlende oder ungueltige Daten.' },
          '404': { description: 'Participant nicht gefunden.' },
          '422': { description: 'Validierungsfehler.' },
        },
      },
      delete: {
        summary: 'Participant loeschen (id in Query oder Body)',
        responses: {
          '200': { description: 'Participant geloescht.' },
          '400': { description: 'Fehlende oder ungueltige Daten.' },
          '404': { description: 'Participant nicht gefunden.' },
        },
      },
    },
    '/participants/{id}': {
      get: {
        summary: 'Participant-Detail laden',
        responses: {
          '200': { description: 'Participant erfolgreich geladen.' },
          '404': { description: 'Participant nicht gefunden.' },
        },
      },
      put: {
        summary: 'Participant via ID aktualisieren',
        responses: {
          '200': { description: 'Participant aktualisiert.' },
          '422': { description: 'Validierungsfehler.' },
          '404': { description: 'Participant nicht gefunden.' },
        },
      },
      delete: {
        summary: 'Participant via ID loeschen',
        responses: {
          '200': { description: 'Participant geloescht.' },
          '404': { description: 'Participant nicht gefunden.' },
        },
      },
    },
    '/zones/generate': {
      post: {
        summary: 'Zone-File generieren',
        responses: {
          '200': { description: 'Zone-File erfolgreich erzeugt.' },
          '400': { description: 'Ungueltiger Request-Body.' },
          '422': { description: 'Validierungs- oder Generierungsfehler.' },
        },
      },
    },
    '/telemetry': {
      get: {
        summary: 'Observability-Probe abrufen',
        responses: {
          '200': { description: 'Observability-Probe erfolgreich geladen.' },
        },
      },
    },
    '/openapi.json': {
      get: {
        summary: 'OpenAPI-Spezifikation abrufen',
        responses: {
          '200': { description: 'OpenAPI-Spezifikation erfolgreich geladen.' },
        },
      },
    },
    '/swagger': {
      get: {
        summary: 'Swagger-Dokuansicht abrufen',
        responses: {
          '200': { description: 'Swagger-Dokuansicht erfolgreich geladen.' },
        },
      },
    },
  },
}

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, { namespace: 'api-v1' })
  if (rateLimited) {
    return rateLimited
  }

  try {
    return apiSuccess(openApiSpec)
  } catch (error) {
    return handleUnexpectedApiError(
      error,
      'OpenAPI-Spezifikation konnte nicht geladen werden.',
    )
  }
}
