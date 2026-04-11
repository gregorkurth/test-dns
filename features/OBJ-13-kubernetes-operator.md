# OBJ-13: Kubernetes Operator

## Status: In Review
**Created:** 2026-04-03
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-10: Kubernetes Deployment (App muss im Cluster laufen)
- OBJ-3: REST API (Operator kommuniziert mit der App-API)
- OBJ-12: Security & Authentifizierung (Operator benötigt Auth-Konzept)
- OBJ-24: DNS Baseline Config Repository & Change History (Baseline laden, Aenderungen protokollieren, Rollback)
- OBJ-11: Monitoring & Observability (OpenTelemetry) (Operator-Events und Metriken)

## User Stories
- Als Platform Engineer möchte ich DNS-Konfigurationen als Kubernetes Custom Resources definieren, damit ich sie deklarativ und versioniert verwalten kann.
- Als Platform Engineer möchte ich, dass der Operator den aktuellen Zustand einer DNS-Konfiguration im Status-Feld der CR widerspiegelt, damit ich den Betriebsstatus auf einen Blick sehe.
- Als Mission Network Operator möchte ich eine Konfigurationsänderung durch ein `kubectl apply` auslösen können, ohne manuell in die Web GUI einzugreifen.
- Als Platform Engineer möchte ich, dass der Operator bei einem Fehler in der Konfiguration eine klare Fehlermeldung im CR-Status hinterlässt.
- Als Platform Engineer möchte ich, dass der Operator idempotent ist, damit mehrfaches Anwenden desselben Manifests keinen ungewollten Effekt hat.
- Als Platform Engineer moechte ich eine DNS-Baseline aus einem separaten Git-Repository laden koennen, damit Konfigurationsstartpunkte standardisiert bleiben.
- Als Auditor moechte ich jede durch den Operator uebernommene Aenderung nachvollziehen koennen, damit klar ist, wer wann was geaendert hat.
- Als Operator moechte ich einzelne Aenderungen gezielt auf eine fruehere Revision zuruecksetzen koennen, damit fehlerhafte Updates schnell korrigiert werden.
- Als Integrationsverantwortlicher moechte ich optional eine abgesicherte MCP-CRUD-Schnittstelle fuer KI-Agenten vorsehen, damit spaetere Automatisierung kontrolliert moeglich ist.
- Als Platform Engineer moechte ich, dass der Operator alle Tests periodisch automatisch auf der Zielplattform ausfuehrt (konfigurierbares Intervall, Standard 15 Minuten), damit Regressionen im laufenden Cluster ohne manuellen Eingriff erkannt werden.
- Als Beobachter moechte ich, dass Testergebnisse ueber OTel an ClickHouse oder lokal gemeldet werden, damit der Teststatus nahtlos in die Observability-Kette integriert ist.

## Acceptance Criteria
- [ ] CRD `DNSConfiguration` (Gruppe: `dns.fmn.mil`, Version: `v1alpha1`) ist definiert und im Cluster installierbar
- [ ] Operator reagiert auf Create/Update/Delete von `DNSConfiguration`-Ressourcen
- [ ] Status-Subressource zeigt: `phase` (Pending / Applied / Error), `message`, `lastUpdated`
- [ ] Operator ruft beim Reconcile die App-API auf (OBJ-3) und überträgt die Konfiguration
- [ ] Bei Fehler: Status `phase: Error` mit Fehlermeldung gesetzt; kein Crash-Loop
- [ ] Operator ist idempotent: mehrfaches Reconcile ohne Seiteneffekte
- [ ] RBAC-Manifest für den Operator-ServiceAccount liegt im Repository
- [ ] Operator-Image ist airgapped ladbar (kein Pull zur Laufzeit)
- [ ] Operator läuft als eigener Deployment im Namespace `dns-config-system`
- [ ] Falls ein eigener Operator benoetigt ist, ist er in Go (controller-runtime/kubebuilder) implementiert
- [ ] CR-Spezifikation unterstuetzt Baseline-Quelle (Repository, Revision, Pfad) fuer reproduzierbare Konfigurationsstarts
- [ ] Baseline-Quelle kann aus einem separaten Gitea/Git-Projekt gelesen werden (ohne Internetannahme)
- [ ] Jede erfolgreiche und fehlgeschlagene Reconcile-Aenderung wird als nachvollziehbarer Change-Eintrag festgehalten
- [ ] Gezieltes Rollback auf eine vorherige Revision ist als kontrollierter Operator-Workflow verfuegbar
- [ ] Operator-Events und Metriken sind ueber OTel in die Observability-Kette integrierbar
- [ ] Optionaler MCP-Zugang ist nur als abgesicherte, rollenbasierte Integrationsschnittstelle vorgesehen
- [ ] Operator fuehrt alle konfigurierten Tests periodisch automatisch auf der Zielplattform aus (Scheduled Test Execution – laeuft im Cluster gegen die deployete Instanz, nicht in CI)
- [ ] Test-Intervall ist ueber CRD-Spec oder Operator-Konfiguration einstellbar (Standardwert: 15 Minuten)
- [ ] Testergebnisse werden als OTel-Metriken und/oder strukturierte Logs exportiert (Ziel: `clickhouse` oder `local`)
- [ ] Bei fehlgeschlagenen Tests wird ein OTel-Event ausgeloest und der CR-Status entsprechend aktualisiert
- [ ] Ueberlappende Testlaeufe werden uebersprungen (laufender Lauf blockiert den naechsten Intervall-Start)

## Edge Cases
- Was passiert wenn die App-API nicht erreichbar ist? → Operator setzt Status `Error`, exponentielles Retry-Backoff, kein Crash
- Was wenn eine CR mit einer ungültigen DNS-Konfiguration angelegt wird? → Validierung via Admission Webhook oder in Reconcile
- Was wenn der Operator während eines Reconcile-Zyklus neu gestartet wird? → Idempotentes Reconcile stellt korrekten Endzustand wieder her
- Was wenn zwei CRs dieselbe Zone definieren? → Konflikt im Status beider CRs vermerkt; erste CR bleibt aktiv
- Was wenn das Baseline-Repository nicht erreichbar ist? → letzter gueltiger Stand bleibt aktiv; Status und Alarm werden gesetzt
- Was wenn Baseline-Revision und Zielkonfiguration divergenz zeigen? → geordneter Konfliktstatus statt stiller Ueberschreibung
- Was wenn ein Rollback auf ungueltige historische Daten zeigt? → Rollback wird abgelehnt und mit klarer Ursache protokolliert
- Was wenn MCP-Client unzulaessige Schreiboperationen versucht? → Zugriff wird per RBAC/Policy blockiert und als Security-Ereignis geloggt
- Was wenn ein Testlauf laenger als das konfigurierte Intervall dauert? → Ueberlappender Lauf wird uebersprungen; naechster Lauf startet zum naechsten Intervall-Zeitpunkt
- Was wenn das OTel-Ziel (ClickHouse) nicht erreichbar ist? → Testergebnisse werden lokal gepuffert und spaeter nachgeliefert (analog zu OBJ-11)
- Was wenn einzelne Tests innerhalb des periodischen Laufs fehlschlagen? → Fehlgeschlagene Tests werden einzeln als OTel-Events gemeldet; der Lauf gilt als teilweise fehlgeschlagen

## Technical Requirements
- Implementierungssprache: Go ist verpflichtend, wenn ein eigener Operator umgesetzt wird (controller-runtime / kubebuilder)
- CRD-Schemadefinition mittels kubebuilder-Markers, generierter OpenAPI-Validierung
- Operator-Manifest unter `operator/` im Repository (Deployment, RBAC, CRD)
- Unit-Tests für Reconcile-Logik vorhanden
- Kubernetes-Version: ≥ 1.28
- Baseline-Integration: lesender Zugriff auf separates Git/Gitea-Repository mit revisionsbasierter Aufloesung
- Change-History: strukturierte, revisionsbezogene Aenderungsnachweise fuer Apply, Fehler und Rollback
- Observability: OTel-kompatible Operator-Metriken und Ereignisse fuer OBJ-11
- MCP-Optionalitaet: nur als abgesicherte, rollenbasierte CRUD-Integrationsschicht ohne Umgehung des Reconcile-Modells
- Scheduled Test Execution: konfigurierbares Intervall-basiertes Testausfuehrungsmodell im Operator (Standard: 15 Minuten); Intervall ist per CRD-Annotation oder Operator-ConfigMap setzbar; Tests laufen im Cluster gegen die tatsaechlich deployete Instanz (nicht in CI oder lokal)
- Test-Reporting via OTel: Testergebnisse werden als strukturierte OTel-Metriken/Logs exportiert; Ziel `clickhouse` (produktiv) oder `local` (Offline/Dev), analog zu OBJ-11

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
### Scope
OBJ-13 fuehrt einen deklarativen Steuerpfad fuer DNS-Konfigurationen ein. Der Operator wird zur verbindlichen Uebersetzung zwischen gewuenschtem Zustand (Custom Resource) und technischem Zielzustand (App-API/Deployment-Status).

Zusatznutzen dieses Objekts ist die kontrollierte Baseline-Nutzung aus einem separaten Repository inklusive Change-History und gezieltem Rollback.

### Visual Tree
```text
Kubernetes Operator Plane
+-- API Extension Layer
|   +-- DNSConfiguration CRD
|   +-- Validation Rules
+-- Reconcile Layer
|   +-- Create / Update / Delete Handling
|   +-- Idempotency Guard
|   +-- Retry / Backoff
+-- Baseline Layer
|   +-- External Baseline Repository (Gitea/Git)
|   +-- Revision Resolver
|   +-- Merge/Conflict Decision
+-- Delivery Layer
|   +-- App API Sync (OBJ-3)
|   +-- Status Subresource Updates
+-- Governance Layer
|   +-- Change History / Audit Trail
|   +-- Rollback Workflow
|   +-- RBAC + Policy Guardrails
+-- Observability Layer
    +-- Operator Metrics
    +-- Operator Events
    +-- OTel Forwarding (OBJ-11)
```

### Data / Control Model
Zentrale Fachobjekte:
- DNSConfiguration (Soll-Zustand): gewuenschte DNS-Definition plus optionale Baseline-Referenz.
- OperatorStatus (Ist-Zustand): phase, message, lastUpdated, letzte verarbeitete Revision.
- ChangeRecord: nachvollziehbarer Nachweis fuer angewandte, fehlgeschlagene oder rueckgaengig gemachte Aenderungen.
- RollbackIntent: kontrollierter Ruecksetzauftrag auf eine vorherige, gueltige Revision.

### Technical Decisions
- Go/controller-runtime als Zielstandard, weil das Kubernetes-Betriebsmodell damit nativ, robust und testbar bleibt.
- Idempotentes Reconcile ist Pflicht, damit Neustarts oder wiederholte Events keine unbeabsichtigten Seiteneffekte erzeugen.
- Baseline aus separatem Repository, weil Trennung von Betriebslogik und Konfigurationsinhalten Governance und Wiederverwendung verbessert.
- Explizite Change-History und Rollback, weil Betreiber reproduzierbar und auditierbar korrigieren muessen.
- MCP nur als optionale, kontrollierte Integrationsschicht, damit spaetere KI-Automation das gleiche Regelwerk nutzt wie alle anderen Clients.
- OTel-Einbindung, damit Operator-Verhalten mit Security- und Plattformereignissen korrelierbar bleibt.

### Dependencies
- OBJ-10 fuer lauffaehige Kubernetes-Umgebung
- OBJ-3 fuer den operativen API-Zielpfad
- OBJ-12 fuer Auth/RBAC/Policy-Basis
- OBJ-24 fuer Baseline-Repository und Nachverfolgbarkeit
- OBJ-11 fuer Observability und Telemetrie-Nachweise

### QA Readiness
Vor Freigabe sollte pruefbar sein:
- Create/Update/Delete inkl. Status-Subresource funktionieren stabil.
- Idempotenz und Restart-Verhalten sind nachgewiesen.
- Baseline-Laden, Konflikterkennung und Rollback sind nachvollziehbar testbar.
- Change-History ist fuer Auditoren eindeutig.
- OTel-Metriken und Ereignisse des Operators sind sichtbar.

## QA Test Results
**Tested:** 2026-04-09
**App URL:** http://localhost:3000 (lokale Laufzeit) + Manifest-/Unit-Checks
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status
- [x] CRD `DNSConfiguration` (`dns.fmn.mil/v1alpha1`) ist im Repo definiert und renderbar (`kubectl kustomize`)
- [x] Statusfelder `phase`, `message`, `lastUpdated` sind in CRD/Model sichtbar
- [x] RBAC, Namespace und Operator-Deployment-Artefakte sind vorhanden
- [x] Operator ist als Go-Implementierung (controller-runtime Skeleton) angelegt
- [x] Baseline-/Revision-/Rollback-Struktur ist als CR-Felder und Artefaktmodell angelegt
- [x] Optionaler MCP-Zugang ist als abgesicherte Integrationsoption modelliert
- [ ] Produktiver Reconcile-Transfer zur OBJ-3-API ist noch als Integrationsnaht offen
- [ ] Durable Change-History ausserhalb der Beispielartefakte ist noch offen
- [ ] OTel-Metriken/Events aus echtem Operator-Runtimepfad sind noch nicht final nachgewiesen

### Edge Cases Status
- [x] Idempotenz-Regeln sind im Controller-Skeleton und Datenmodell abgebildet
- [x] Fehlerpfad setzt `Error`-Status statt Crash-Loop (kontrollierter Requeue)
- [x] Baseline-/Rollback-Konflikte sind im Datenmodell explizit vorgesehen
- [ ] Live-Nachweis gegen laufenden Kubernetes-Cluster fehlt in dieser Umgebung

### Security Audit Results
- [x] Operator-API ist jetzt authentifiziert (`viewer` oder hoeher erforderlich)
- [x] RBAC-Manifeste fuer ServiceAccount/ClusterRole/Binding liegen vor
- [ ] Vollstaendige Laufzeit-Security (echter Cluster + reale Token/Secret-Flows) bleibt offen bis Integrationsumgebung

### Bugs Found
#### BUG-OBJ13-01: `/api/v1/operator` war ohne Auth erreichbar
- **Severity:** Medium
- **Steps to Reproduce:**
  1. `GET /api/v1/operator` ohne `Authorization`
  2. Expected: `401 AUTH_REQUIRED`
  3. Actual (vor Fix): `200` mit Operator-Daten
- **Fix:** `requireSession(request, 'viewer')` im Route-Handler eingebaut
- **Priority:** Fix before deployment

#### BUG-OBJ13-02: Operator-Endpunkt fehlte in API-Discovery/OpenAPI
- **Severity:** Low
- **Steps to Reproduce:**
  1. API-Root/OpenAPI lesen
  2. Expected: `/api/v1/operator` dokumentiert
  3. Actual (vor Fix): Endpunkt nicht gelistet
- **Fix:** API-Root-Liste und OpenAPI-Spec um `/operator` ergänzt
- **Priority:** Fix in current review

### Summary
- **Acceptance Criteria:** 6 Kernkriterien im aktuellen Skeleton-Scope bestanden, 3 Runtime-Integrationskriterien offen
- **Bugs Found:** 2 total (0 Critical, 0 High, 1 Medium, 1 Low) - beide behoben
- **Security:** Pass fuer aktuellen Repo-/API-Scope
- **Production Ready:** NO (Integrationsschritte zu API/Baseline/History/OTel noch offen)
- **Recommendation:** Nachziehen der Runtime-Integrationen und erneute `/qa`-Runde in echter K8s-Umgebung

## Implementation Update
- Go-basiertes Operator-Grundgeruest unter `operator/` angelegt (API-Typen, Reconcile-Skeleton, Samples)
- Installierbare Kubernetes-Artefakte fuer CRD, RBAC und Deployment unter `k8s/crd/` und `k8s/operator/`
- Optionale Lesesicht und API-Endpunkt fuer Nicht-Entwickler unter `/operator` und `/api/v1/operator`
- Aktueller Stand ist bewusst als `skeleton` markiert: Git-Fetch, produktiver OBJ-3-Sync und dauerhafte Change-History folgen in spaeteren Schritten

## Deployment
_To be added by /deploy_
