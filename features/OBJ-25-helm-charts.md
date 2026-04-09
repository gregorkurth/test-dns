# OBJ-25: Helm Charts fuer Kubernetes Deployment

## Status: In Progress
**Created:** 2026-04-09
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-10: Kubernetes Deployment (Basis-Manifeste vorhanden)
- OBJ-11: Monitoring & Observability (OTel-Konfiguration als Chart-Werte einbindbar)
- OBJ-19: Zarf-Paket / Offline-Weitergabe (Chart muss offline transportierbar sein)
- OBJ-21: GitOps / Argo CD / App-of-Apps (Chart als GitOps-Quelle nutzbar)

## User Stories
- Als Platform Engineer moechte ich die App per Helm installieren und aktualisieren, damit Deployments standardisiert und reproduzierbar sind.
- Als Release Manager moechte ich eine versionierte Chart-Version pro Release haben, damit Rollout und Rollback nachvollziehbar bleiben.
- Als Security-Verantwortlicher moechte ich sichere Default-Werte im Chart erzwingen, damit unsichere Deployments frueh verhindert werden.
- Als Operator moechte ich lokale, interne und produktive Werteprofile nutzen, damit dieselbe Chart-Struktur in allen Umgebungen funktioniert.
- Als Dokumentationsverantwortlicher moechte ich arc42 und Benutzerhandbuch zusammen mit der Chart-Pflege nachziehen, damit Betrieb und Architektur konsistent bleiben.

## Acceptance Criteria
- [ ] Helm-Chart liegt versioniert unter `helm/dns-management-service/`
- [ ] Chart enthaelt mindestens `Chart.yaml`, `values.yaml`, `templates/` und `README.md`
- [ ] Image-Quelle ist ueber Werte steuerbar (`repository`, `tag` oder `digest`)
- [ ] Deployment, Service und Ingress sind ueber Chart-Werte steuerbar
- [ ] Security Defaults sind als sichere Voreinstellung gesetzt (kein privileged Pod, readOnlyRootFilesystem, non-root)
- [ ] OTel-Modus (`local`/`clickhouse`) ist per Chart-Wert konfigurierbar
- [ ] `helm lint` und `helm template` laufen ohne Internetabhaengigkeit erfolgreich
- [ ] Install-/Upgrade-/Rollback-Commands sind in der Betriebsdoku dokumentiert
- [ ] arc42-Kapitel 5, 7 und 8 sind fuer Helm-Auswirkungen nachgezogen
- [ ] Benutzerhandbuch (`docs/user-manual/operations.md`) ist fuer Helm-Betrieb nachgezogen
- [ ] QA-Nachweis beinhaltet Helm-Smoke-Test (Install, Upgrade, Rollback, Render-Check)
- [ ] Feature-Abschluss ist erst gueltig, wenn `docs/DEFINITION-OF-DONE-FEATURE.md` vollstaendig abgehakt ist

## Edge Cases
- Was wenn Chart-Werte widerspruechlich sind (z. B. Ingress aktiv ohne Hostname)? -> Validierung mit klarer Fehlermeldung.
- Was wenn der Cluster keine IngressClass bereitstellt? -> Chart erlaubt Deaktivierung oder alternative Service-Exposition.
- Was wenn Image-Digest fehlt oder ungültig ist? -> Deployment wird geblockt oder mit Warnstatus markiert.
- Was wenn Upgrade fehlschlaegt? -> Rollback-Pfad muss dokumentiert und testbar sein.
- Was wenn lokale und produktive Sicherheitsprofile verwechselt werden? -> Profile sind klar getrennt und im Chart dokumentiert.

## Technical Requirements
- Helm 3.x kompatibel
- Chart-Struktur bleibt airgapped-faehig und GitOps-freundlich
- Werteprofile fuer mindestens `local`, `internal`, `prod`
- Security- und OTel-Konfigurationswerte im Chart ohne Codeaenderung umschaltbar
- Dokumentationspflicht fuer arc42, Benutzerhandbuch, DoD und QA-Nachweis

---
<!-- Sections below are added by subsequent skills -->

## Implementation Update
**Stand:** 2026-04-09

Erster Chart-Stand ist umgesetzt unter `helm/dns-management-service/`:
- `Chart.yaml`, `values.yaml`, `values-local.yaml`, `values-internal.yaml`
- Templates fuer Namespace, ConfigMap, Deployment, Service, Ingress
- Templates fuer Cilium Default-Deny und Allow-Required-Traffic
- Chart-README mit Install-/Upgrade-/Rollback-Schnellstart

Noch offen:
- Helm-QA-Nachweis in Feature-Abschnitt eintragen
- finale Werteabstimmung fuer produktive Zielumgebung
- Release-Versionsbindung fuer Chart (`version`/`appVersion`) im Release-Prozess verankern

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
