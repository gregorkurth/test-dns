# Betrieb

Dieser Teil ist fuer Operator und Plattform-Betrieb gedacht.

## Was du hier erwarten kannst

- Start und Stop
- Update und Release-Import
- Backup und Wiederherstellung
- Fehlerbilder und erste Checks
- OTel-Betriebsmodi

## Alltagsschritte

1. App starten oder neu starten.
2. Status und Erreichbarkeit pruefen.
3. Bei Release-Wechseln die neue Version importieren.
4. Nach dem Import einen Smoke-Test ausfuehren.
5. Wichtige Aenderungen im Export-Log oder im Betriebsprotokoll festhalten.

## Helm-Betrieb (OBJ-25)

Chart-Pfad:
- `helm/dns-management-service`

### 1. Vor jedem Deploy: Offline-Checks

```bash
helm lint helm/dns-management-service -f helm/dns-management-service/values.yaml -f helm/dns-management-service/values-local.yaml --strict
helm lint helm/dns-management-service -f helm/dns-management-service/values.yaml -f helm/dns-management-service/values-internal.yaml --strict
helm lint helm/dns-management-service -f helm/dns-management-service/values.yaml -f helm/dns-management-service/values-prod.yaml --strict

helm template dns-management-service-local helm/dns-management-service -f helm/dns-management-service/values.yaml -f helm/dns-management-service/values-local.yaml
helm template dns-management-service-internal helm/dns-management-service -f helm/dns-management-service/values.yaml -f helm/dns-management-service/values-internal.yaml
helm template dns-management-service-prod helm/dns-management-service -f helm/dns-management-service/values.yaml -f helm/dns-management-service/values-prod.yaml
```

### 2. Install / Upgrade

```bash
# local
helm upgrade --install dns-management-service helm/dns-management-service \
  -f helm/dns-management-service/values.yaml \
  -f helm/dns-management-service/values-local.yaml

# internal
helm upgrade --install dns-management-service helm/dns-management-service \
  -f helm/dns-management-service/values.yaml \
  -f helm/dns-management-service/values-internal.yaml

# prod
helm upgrade --install dns-management-service helm/dns-management-service \
  -f helm/dns-management-service/values.yaml \
  -f helm/dns-management-service/values-prod.yaml
```

### 3. Rollback

```bash
helm history dns-management-service
helm rollback dns-management-service <revision>
```

### 4. OCI Chart Push (Harbor-kompatibel)

```bash
mkdir -p artifacts/charts
helm package helm/dns-management-service --destination artifacts/charts
helm push artifacts/charts/dns-management-service-<chart-version>.tgz oci://harbor.internal/dns-management/charts
```

Wichtig:
- `values-prod.yaml` hat TLS-Pflicht und kein Debug-Modus.
- Erst bei erfolgreichen Lint/Template-Checks und erfolgreichem Chart-Push gilt der Helm-Release als freigabebereit.
- Managementsicht und API fuer Release-Status:
  - UI: `/helm`
  - API: `/api/v1/helm/status?runChecks=true&release=dns-management-service&namespace=dns-management`

## OTel-Modi

- `local`
  - fuer Entwicklungs-, Test- und Offline-Phasen
  - Telemetrie wird lokal gepuffert
  - bei Zielausfall bleiben Daten spaeter nachlieferbar
- `clickhouse`
  - fuer den produktiven Zielbetrieb
  - Telemetrie wird zentral gespeichert und ausgewertet

## Backup

- Repository sichern
- lokale Daten sichern, falls sie verwendet werden
- Release-Artefakte und Doku-Exporte mitfuehren

## Typische Probleme

- App antwortet nicht: Konfiguration und Prozess pruefen
- OTel ist leer: Zielmodus und Netzweg pruefen
- Import schlug fehl: Release-Projekt, Konfigurationsprojekt und Argo CD pruefen

## Weiter lesen

- [Betriebsdokumentation](../operations.md)
- [Offline-Installation](../offline-install.md)
- [Argo CD](../argocd.md)
