# arc42 Kapitel 3: Kontextabgrenzung

## Zweck

Dieses Kapitel zeigt die Blackbox-Sicht der Service-Plattform:
- welche externen Rollen und Systeme beteiligt sind
- welche Hauptschnittstellen es gibt
- wie die Plattform nach aussen abgegrenzt ist

## Blackbox-Uebersicht (draw.io)

![Blackbox-Uebersicht der Service-Plattform](diagrams/blackbox-overview.svg)

Quelle (editierbar):
- `docs/arc42/diagrams/blackbox-overview.drawio`

## Externe Akteure und Systeme (kurz)

| Externes Element | Beziehung zur Plattform | Hauptzweck |
|---|---|---|
| Benutzer (Operator/Manager) | nutzt Web GUI und Betriebsfunktionen | Bedienung, Freigabe, Uebersicht |
| OIDC / Keycloak | stellt Identitaet und Zugriffspruefung bereit | Authentifizierung und Rollen |
| GitLab (Source of Truth) | fuehrt Quellstand, Pipeline, Releases | Entwicklung und Release-Steuerung |
| Gitea (Zielumgebung) | enthaelt Release- und Konfigurationsprojekte | Offline-Zielbetrieb |
| Argo CD | synchronisiert deklarative Deployments | GitOps-Installation |
| Kubernetes Cluster | fuehrt die Plattformlaufzeit aus | Betrieb der Applikation |
| Harbor / Nexus | speichert Container/Artefakte | Lieferkette und Zielimport |
| ClickHouse + Grafana | nimmt Telemetrie auf und visualisiert sie | Observability und Reporting |

## Wann pflegen?

- bei neuen externen Rollen oder Umsystemen
- bei geaenderten Schnittstellen oder Datenfluessen
- bei Aenderungen an Delivery-/Deploy-Pfaden

## Quelle im Repo

- `features/OBJ-3-rest-api.md`
- `features/OBJ-12-security-authentifizierung.md`
- `features/OBJ-20-zielumgebung-import-rehydrierung.md`
- `docs/arc42/diagrams/blackbox-overview.drawio`
