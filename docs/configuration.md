# Konfiguration

Diese Seite sammelt alle aktuell bekannten Konfigurationsparameter.
Sie unterscheidet zwischen Laufzeit-Variablen, Build-Variablen und Zielumgebungs-Konfiguration.

## Grundregel

- Keine Secrets in ConfigMaps
- Sensible Werte gehoeren in K8s Secrets
- Nicht-sensible Werte koennen als ENV-Variable oder ConfigMap dokumentiert werden
- Jede neue Variable muss hier nachgetragen werden

## Laufzeit- und Build-Variablen

| Variable | Wo genutzt | Pflicht | Zweck |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Nur bei aktivem Supabase | URL der Supabase-Instanz |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Nur bei aktivem Supabase | Oeffentlicher Supabase-Schluessel |
| `OBJ3_DATA_DIR` | API / lokale Datenhaltung | Optional | Speicherort fuer `participants.json` |
| `NEXT_PUBLIC_APP_VERSION` | Build / UI | Empfohlen | Sichtbare Versionsnummer der App |
| `NEXT_PUBLIC_SENTRY_DSN` | Fehlertracking | Optional | Oeffentlicher Sentry-Endpunkt |
| `SENTRY_DSN` | Fehlertracking | Optional | Serverseitiger Sentry-Endpunkt |
| `SENTRY_AUTH_TOKEN` | Fehlertracking | Optional | Token fuer Source-Maps und Uploads |
| `UPSTASH_REDIS_REST_URL` | Rate Limiting | Optional | Redis-REST-URL fuer Rate Limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Rate Limiting | Optional | Token fuer Upstash Redis |

### Aktuelle Repo-Sicht

Im aktuellen Code sind direkt referenziert:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OBJ3_DATA_DIR`

Die anderen Werte sind in der Dokumentation und in den Betriebsseiten bereits vorgesehen.

## Zielumgebung: ConfigMap-Felder

Die Kubernetes-Zielumgebung fuehrt nicht-sensible Betriebswerte in einer ConfigMap oder in gleichwertigen GitOps-Values.

| Feld | Zweck | Hinweis |
|---|---|---|
| `APP_NAME` | Anzeigename der App | Kein Secret |
| `INGRESS_HOSTNAME` | Oeffentliche Adresse | Fuer Routing und Links |
| `OTEL_COLLECTOR_ENDPOINT` | Telemetrieziel | Fuer `local` und `clickhouse` relevant |
| `LOG_LEVEL` | Log-Tiefe | Zum Beispiel `info`, `warn`, `debug` |
| `RELEASE_CHANNEL` | Kanalanzeige | Zum Beispiel `released`, `beta`, `preview` |
| `DOCS_VERSION` | Doku-Stand | Muss zur Release-Version passen |
| `UPDATE_NOTICES_URL` | Quelle fuer Update-Hinweise | Versionierte Datei oder Release-Referenz |
| `MATERIALITY_SOURCE` | Quelle fuer Maturitaetsstatus | Link oder Repo-Pfad |
| `GITOPS_RELEASE_REPO` | Release-Projekt in Gitea | Fuer App-of-Apps |
| `GITOPS_CONFIG_REPO` | Konfigurationsprojekt in Gitea | Fuer App-of-Apps |
| `SECURITY_PROFILE` | Sicherheitsmodus | Z. B. `strict` |
| `SECRETS_MODE` | Secrets-Betrieb | Z. B. `openbao` oder `local` |
| `SIEM_MODE` | Observability-/Security-Betrieb | Z. B. `clickhouse` oder `local` |

## Secrets

Diese Werte duerfen nicht in einer ConfigMap stehen.

| Secret | Zweck |
|---|---|
| OIDC-Client-Secret | Anmeldung ueber Keycloak/OIDC |
| TSIG-Key | DNS-/Transfer-Sicherheit |
| API-Schluessel | Externe Integrationen, falls vorhanden |

## Woher kommt was?

- Lokale Entwicklung: `.env.local`
- Beispielwerte: `.env.local.example`
- Kubernetes-Betrieb: ConfigMap und Secrets
- Release-/GitOps-Betrieb: versionierte Repo- oder Helm-Values

## Weiter lesen

- [Quickstart](quickstart.md)
- [Betrieb](operations.md)
- [Offline-Installation](offline-install.md)
- [Argo CD](argocd.md)
