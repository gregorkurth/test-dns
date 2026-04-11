# arc42 Kapitel 5: Bausteinsicht

## Zweck

Hier zeigen wir, aus welchen grossen Teilen die Applikation besteht.

## Was hier hinein gehoert

- Web GUI
- API
- Test Runner
- Doku-Bausteine
- GitOps- und Release-Bausteine
- Helm-Chart-Baustein fuer standardisierte Installation
- Capability-Struktur

## Helm-Baustein (OBJ-25)

- Ein dedizierter Deployment-Baustein `helm/dns-management-service/` kapselt:
- Runtime-Objekte (Deployment, Service, Ingress)
- Sicherheits-/Netzwerk-Bausteine (Cilium Default-Deny + Allow)
- Umgebungsprofile (`values-local.yaml`, `values-internal.yaml`, `values-prod.yaml`)
- Konfigurationsvalidierung (`values.schema.json`, `templates/validation.yaml`)
- Der Baustein wird zusaetzlich ueber API/UI sichtbar gemacht:
- API: `GET /api/v1/helm/status`
- Management-Sicht: `/helm`
- Die API/UI umfassen neben Check-Ergebnissen auch den Helm-Release-Status (`helm status` mit Offline-Fallback).

## Wann pflegen?

- wenn neue Komponenten hinzukommen
- wenn grosse Bausteine aufgeteilt oder zusammengelegt werden

## Quelle im Repo

- `src/`
- `features/OBJ-3-rest-api.md`
- `features/OBJ-9-manual-test-runner.md`
- `features/OBJ-25-helm-charts.md`
- `capabilities/INDEX.md`
