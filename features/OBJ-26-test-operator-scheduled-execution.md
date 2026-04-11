# OBJ-26: Test Operator (Scheduled Test Execution via OTel)

## Status: Planned
**Created:** 2026-04-11
**Last Updated:** 2026-04-11

## Dependencies
- OBJ-13: Kubernetes Operator (CRD-/Controller-Basis in Go)
- OBJ-11: Monitoring & Observability (OTel / ClickHouse / local Modus)
- OBJ-23: Test Execution Dashboard (Sicht auf Run-/Release-Teststatus)
- OBJ-12: Security & Authentifizierung (Rollen und API-Zugriff)
- OBJ-25: Helm Charts (Deployment/Config des Operators)

## User Stories
- Als Platform Engineer moechte ich, dass ein Go-Operator alle konfigurierten Tests automatisch im Intervall ausfuehrt, damit der Testzustand im Cluster laufend aktuell ist.
- Als QA-Verantwortlicher moechte ich die periodischen Testlaeufe als eigene Run-Quelle sehen, damit manuelle und automatische Nachweise sauber getrennt und gemeinsam ausgewertet werden.
- Als Operations-Team moechte ich bei fehlgeschlagenen Testlaeufen sofort OTel-Events erhalten, damit Vorfaelle schnell sichtbar und nachverfolgbar sind.
- Als Security-Verantwortlicher moechte ich, dass der Testoperator nicht ueberlappende Laeufe erzwingt und mit minimalen Rechten laeuft, damit Stabilitaet und Least-Privilege eingehalten werden.
- Als Release-Manager moechte ich den Teststatus alle 15 Minuten aktualisiert haben, damit Freigaben auf einem frischen, reproduzierbaren Stand beruhen.

## Acceptance Criteria
- [ ] Ein dedizierter Go-Testoperator ist als eigener Controller-Baustein vorhanden und deploybar.
- [ ] Das Standardintervall fuer Testlaeufe ist 15 Minuten und per Konfiguration anpassbar.
- [ ] Alle fuer die Plattform freigegebenen Testtypen koennen durch den Operator ausgefuehrt werden (mindestens API-/Smoke-/Deployability-Checks).
- [ ] Die Ausfuehrung findet im laufenden Kubernetes-Cluster gegen die deployete Instanz statt (nicht lokal, nicht nur CI).
- [ ] Ueberlappende Laeufe sind ausgeschlossen; ein laufender Run blockiert den naechsten Intervall-Start.
- [ ] Pro Lauf werden OTel-Metriken und strukturierte Logs erzeugt (inkl. Run-ID, Objekt, Ergebnis, Dauer, Zeitstempel).
- [ ] OTel-Zielmodus `clickhouse` und `local` ist konfigurierbar; bei Zielausfall werden Ergebnisse lokal gepuffert und nachgeliefert.
- [ ] Bei fehlgeschlagenen Tests wird ein OTel-Event mit Schweregrad erzeugt und der CR-Status auf Warn-/Fehlerzustand gesetzt.
- [ ] Testresultate sind fuer das Test Execution Dashboard als periodische Operator-Runs konsumierbar.
- [ ] Operator-RBAC folgt Least-Privilege und ist als Manifest/Helm-Wert dokumentiert.
- [ ] Der Testoperator ist in Helm-/GitOps-/Offline-Delivery-Prozess integrierbar (deploybar in Zielumgebungen).
- [ ] Dokumentation beschreibt Konfiguration, Intervall, Zielmodus, Fehlerverhalten und Troubleshooting fuer Nicht-Entwickler.

## Edge Cases
- Der Intervallwert ist ungueltig (0, negativ, nicht parsebar) -> Operator verwendet sicheren Default (15 Minuten) und meldet Warnung.
- Ein Testlauf dauert laenger als ein Intervall -> naechster Lauf wird uebersprungen und als `skipped_due_to_active_run` protokolliert.
- ClickHouse ist nicht erreichbar -> Ergebnisse werden lokal gepuffert und spaeter nachgeliefert.
- Ein Test liefert inkonsistente Struktur -> Lauf wird als `failed` markiert, Parsefehler wird als OTel-Event berichtet.
- API-Ziel ist temporär nicht erreichbar -> Retry-Backoff greift, Lauf endet mit klarer Fehlerursache.
- Mehrere Operator-Instanzen aktiv -> nur Leader duerfen geplante Testlaeufe starten (Leader Election).

## Technical Requirements
- Technologie-Stack: Go (`controller-runtime` / `kubebuilder`) fuer den Operator-Controller.
- Scheduler: konfigurierbares Intervall mit Default `15m`.
- Telemetrie: OpenTelemetry fuer Metriken, Logs, Events (Modi `clickhouse` / `local`).
- Ergebnisdaten: strukturierter Lauf-Nachweis mit Run-ID, Resultat, Dauer, Fehlergrund, Objektbezug.
- Safety: Non-overlap-Mechanismus, Retry-Backoff, idempotente Statusaktualisierung.
- Security: Least-Privilege-RBAC, keine Secrets im Klartext, Konfiguration ueber Kubernetes-Secret/Config.
- Integration: kompatibel mit Helm, GitOps (Argo CD) und Offline-Delivery (Zarf).

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
