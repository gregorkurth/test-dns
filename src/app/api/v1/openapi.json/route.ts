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
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'OBJ12 Session Token',
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'Lokale oder OIDC-kompatible Anmeldung',
        responses: {
          '200': { description: 'Session-Token erfolgreich ausgestellt.' },
          '401': { description: 'Authentifizierung fehlgeschlagen.' },
          '403': { description: 'Anmeldemodus ist deaktiviert.' },
          '422': { description: 'Ungueltige Authentifizierungsdaten.' },
        },
      },
    },
    '/auth/session': {
      get: {
        summary: 'Aktuelle Session pruefen',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Session ist gueltig.' },
          '401': { description: 'Token fehlt oder ist ungueltig.' },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Session beenden',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Logout erfolgreich quittiert.' },
          '401': { description: 'Token fehlt oder ist ungueltig.' },
        },
      },
    },
    '/capabilities': {
      get: {
        summary: 'Capabilities auflisten',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Capabilities erfolgreich geladen.' },
          '401': { description: 'Authentifizierung erforderlich.' },
        },
      },
    },
    '/capabilities/{id}': {
      get: {
        summary: 'Capability-Detail laden',
        security: [{ bearerAuth: [] }],
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
          '401': { description: 'Authentifizierung erforderlich.' },
          '404': { description: 'Capability nicht gefunden.' },
        },
      },
    },
    '/participants': {
      get: {
        summary: 'Participants auflisten',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Participant-Liste erfolgreich geladen.' },
          '401': { description: 'Authentifizierung erforderlich.' },
        },
      },
      post: {
        summary: 'Participant erstellen',
        security: [{ bearerAuth: [] }],
        responses: {
          '201': { description: 'Participant erstellt.' },
          '400': { description: 'Ungueltiger Request-Body.' },
          '401': { description: 'Authentifizierung erforderlich.' },
          '403': { description: 'Operator oder Admin erforderlich.' },
          '422': { description: 'Validierungsfehler.' },
        },
      },
      put: {
        summary: 'Participant aktualisieren (id in Query oder Body)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Participant aktualisiert.' },
          '400': { description: 'Fehlende oder ungueltige Daten.' },
          '401': { description: 'Authentifizierung erforderlich.' },
          '403': { description: 'Operator oder Admin erforderlich.' },
          '404': { description: 'Participant nicht gefunden.' },
          '422': { description: 'Validierungsfehler.' },
        },
      },
      delete: {
        summary: 'Participant loeschen (id in Query oder Body)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Participant geloescht.' },
          '400': { description: 'Fehlende oder ungueltige Daten.' },
          '401': { description: 'Authentifizierung erforderlich.' },
          '403': { description: 'Operator oder Admin erforderlich.' },
          '404': { description: 'Participant nicht gefunden.' },
        },
      },
    },
    '/participants/{id}': {
      get: {
        summary: 'Participant-Detail laden',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Participant erfolgreich geladen.' },
          '401': { description: 'Authentifizierung erforderlich.' },
          '404': { description: 'Participant nicht gefunden.' },
        },
      },
      put: {
        summary: 'Participant via ID aktualisieren',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Participant aktualisiert.' },
          '401': { description: 'Authentifizierung erforderlich.' },
          '403': { description: 'Operator oder Admin erforderlich.' },
          '422': { description: 'Validierungsfehler.' },
          '404': { description: 'Participant nicht gefunden.' },
        },
      },
      delete: {
        summary: 'Participant via ID loeschen',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Participant geloescht.' },
          '401': { description: 'Authentifizierung erforderlich.' },
          '403': { description: 'Operator oder Admin erforderlich.' },
          '404': { description: 'Participant nicht gefunden.' },
        },
      },
    },
    '/zones/generate': {
      post: {
        summary: 'Zone-File generieren',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Zone-File erfolgreich erzeugt.' },
          '400': { description: 'Ungueltiger Request-Body.' },
          '401': { description: 'Authentifizierung erforderlich.' },
          '403': { description: 'Operator oder Admin erforderlich.' },
          '422': { description: 'Validierungs- oder Generierungsfehler.' },
        },
      },
    },
    '/operator': {
      get: {
        summary: 'Operator-Status und Baseline-/Rollback-Informationen abrufen',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Operator-Status erfolgreich geladen.' },
          '401': { description: 'Authentifizierung erforderlich.' },
        },
      },
    },
    '/product-website': {
      get: {
        summary: 'Produkt-Website-Daten fuer Startseite und Management-Sicht laden',
        responses: {
          '200': { description: 'Produkt-Website-Daten erfolgreich geladen.' },
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
    '/releases': {
      get: {
        summary: 'Release-Hinweise und Update-Notices abrufen',
        parameters: [
          {
            in: 'query',
            name: 'version',
            required: false,
            schema: { type: 'string' },
          },
          {
            in: 'query',
            name: 'channel',
            required: false,
            schema: { type: 'string', enum: ['ga', 'beta', 'rc'] },
          },
          {
            in: 'query',
            name: 'includeDrafts',
            required: false,
            schema: { type: 'boolean' },
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          '200': { description: 'Release-Hinweise erfolgreich geladen.' },
          '404': { description: 'Release-Hinweis nicht gefunden.' },
        },
      },
    },
    '/maturity': {
      get: {
        summary: 'Maturitaetsstatus (L0-L5) und Feature-Risikotabelle abrufen',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'phase',
            required: false,
            schema: { type: 'string' },
          },
          {
            in: 'query',
            name: 'status',
            required: false,
            schema: {
              type: 'string',
              enum: ['Planned', 'In Progress', 'In Review', 'Completed', 'Deployed'],
            },
          },
          {
            in: 'query',
            name: 'releaseChannel',
            required: false,
            schema: {
              type: 'string',
              enum: ['released', 'beta', 'preview', 'unknown'],
            },
          },
          {
            in: 'query',
            name: 'riskPriority',
            required: false,
            schema: {
              type: 'string',
              enum: ['blocker', 'high', 'normal'],
            },
          },
          {
            in: 'query',
            name: 'testStatus',
            required: false,
            schema: {
              type: 'string',
              enum: ['passed', 'failed', 'never_executed'],
            },
          },
          {
            in: 'query',
            name: 'query',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Maturitaetsdaten erfolgreich geladen.' },
          '401': { description: 'Authentifizierung erforderlich.' },
          '422': { description: 'Ungueltige Filterparameter.' },
        },
      },
    },
    '/security/scans': {
      get: {
        summary: 'SBOM- und Security-Scan-Bundles pro Version abrufen',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'version',
            required: false,
            schema: { type: 'string' },
          },
          {
            in: 'query',
            name: 'channel',
            required: false,
            schema: { type: 'string', enum: ['ga', 'beta', 'rc'] },
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          '200': { description: 'Security-Bundles erfolgreich geladen.' },
          '401': { description: 'Authentifizierung erforderlich.' },
          '404': { description: 'Version nicht gefunden.' },
          '422': { description: 'Ungueltige Query-Parameter.' },
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
