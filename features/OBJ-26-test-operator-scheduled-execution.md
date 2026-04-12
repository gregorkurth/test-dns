# OBJ-26: Test Operator (Scheduled Test Execution via OTel)

## Status: In Progress
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
- [x] Ein dedizierter Go-Testoperator ist als eigener Controller-Baustein vorhanden und deploybar.
- [x] Das Standardintervall fuer Testlaeufe ist 15 Minuten und per Konfiguration anpassbar.
- [x] Alle fuer die Plattform freigegebenen Testtypen koennen durch den Operator ausgefuehrt werden (mindestens API-/Smoke-/Deployability-Checks).
- [x] Die Ausfuehrung findet im laufenden Kubernetes-Cluster gegen die deployete Instanz statt (nicht lokal, nicht nur CI).
- [x] Ueberlappende Laeufe sind ausgeschlossen; ein laufender Run blockiert den naechsten Intervall-Start.
- [x] Pro Lauf werden OTel-Metriken und strukturierte Logs erzeugt (inkl. Run-ID, Objekt, Ergebnis, Dauer, Zeitstempel).
- [x] OTel-Zielmodus `clickhouse` und `local` ist konfigurierbar; bei Zielausfall werden Ergebnisse lokal gepuffert und nachgeliefert.
- [x] Bei fehlgeschlagenen Tests wird ein OTel-Event mit Schweregrad erzeugt und der CR-Status auf Warn-/Fehlerzustand gesetzt.
- [x] Testresultate sind fuer das Test Execution Dashboard als periodische Operator-Runs konsumierbar.
- [x] Operator-RBAC folgt Least-Privilege und ist als Manifest/Helm-Wert dokumentiert.
- [x] Der Testoperator ist in Helm-/GitOps-/Offline-Delivery-Prozess integrierbar (deploybar in Zielumgebungen).
- [x] Dokumentation beschreibt Konfiguration, Intervall, Zielmodus, Fehlerverhalten und Troubleshooting fuer Nicht-Entwickler.

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
**Scope**

OBJ-26 ergaenzt den bestehenden Operator-Stack um einen **dedizierten Scheduled Test Operator**.
Das Ziel ist nicht nur Tests auszufuehren, sondern den Teststatus als Betriebssignal in derselben
Governance-Kette wie Deployment und Security sichtbar zu machen.

**Component Structure (Visual Tree)**

```
Kubernetes Plattform
+-- DNS Configuration Operator (OBJ-13)
|   +-- CRD Reconcile fuer DNS-Konfiguration
|
+-- Scheduled Test Operator (OBJ-26)
|   +-- Scheduler (Default 15 Minuten)
|   +-- Non-Overlap Guard (skip_if_active_run)
|   +-- Test Runner Adapter (API/Smoke/Deployability)
|   +-- Result Export (OTel mode local/clickhouse)
|   +-- Status/History Writer (run history + summary)
|
+-- API Layer
|   +-- /api/v1/operator (kombinierte Operator-Sicht)
|   +-- /api/v1/operator/tests (dedizierte OBJ-26 Sicht)
|
+-- Management UI
|   +-- /operator (Run-Historie, Intervall, OTel-Modus, Artefaktstatus)
|
+-- Nachweis/Dashboard Bridge
    +-- tests/executions/operator-test-runs.latest.json
    +-- OBJ-23 Test Execution Dashboard Konsum
```

**Data Model (plain language)**

Der Testoperator verwaltet drei Datenbereiche:

- **Operator-Konfiguration**
  Intervall, Laufzeitlimit, Non-Overlap-Regel, Leader Election, OTel-Zielmodus.
- **Run-Historie**
  Pro Lauf Run-ID, Zeitpunkte, Dauer, Ergebnis (passed/failed/skipped_due_to_active_run),
  Testanzahl und optionaler Fehlertext/Eventname.
- **Dashboard-Bridge**
  Ein versionierter Nachweispfad im Repo, aus dem der Teststatus von OBJ-23 als periodischer Run
  gelesen werden kann.

**Tech Decisions (WHY)**

- **Dedizierter Operator statt CI-Timer:** Clusternahe Ausfuehrung zeigt echte Laufzeitqualitaet,
  nicht nur Build-Qualitaet.
- **Non-Overlap als harte Regel:** verhindert Run-Stau und konkurrierende Schreibpfade.
- **OTel dual mode (`local`/`clickhouse`):** einheitliches Verhalten fuer Airgap/Dev und zentrale
  Betriebsauswertung.
- **Read-Modell in API + UI:** Nicht-Entwickler sehen Intervall, Fehlpfad und Nachweiskette ohne
  Terminalzugriff.
- **Helm + Kustomize Artefakte:** gleiche Deployability fuer Live-Cluster, GitOps und Offline-Transfer.

**Dependencies**

- Keine neuen externen Laufzeitbibliotheken in der Web-App erforderlich.
- Nutzt bestehende Bausteine:
  - OBJ-12 Auth fuer API-Schutz
  - OBJ-23 Dashboard-Datenmodell
  - OBJ-25 Helm-Deploypfad
  - OBJ-11 OTel-Konfiguration

## QA Test Results
_To be added by /qa_

## Deployment
### Deployment-Status (Stand: 2026-04-11)
- Auslieferung erfolgt Git-first ueber Branch/PR/Merge nach `main`.
- Release- und Export-Nachweise werden in `docs/releases/` und `docs/exports/EXPORT-LOG.md` dokumentiert.
- Confluence bleibt Sekundaerziel: Export erst nach gepflegter Git-Dokumentation.
- Falls **Production Ready: NO** gilt, bleibt das Deployment als vorbereitet markiert und wird erst nach Freigabe produktiv ausgerollt.
