# OBJ-11: Monitoring & Observability (OpenTelemetry)

## Status: In Review
**Created:** 2026-04-03
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-10: Kubernetes Deployment (App läuft im Cluster)
- OBJ-3: REST API (API-Metriken und Traces)
- OBJ-13: Kubernetes Operator (Operator-Metriken)
- OBJ-14: Release Management (versionierte Dashboards und Export-Bundles)
- OBJ-19: Zarf-Paket / Offline-Weitergabe (airgapped Transport)

## User Stories
- Als Platform Engineer möchte ich Metriken der DNS-Konfigurations-App standardisiert erfassen können, damit ich Betrieb und Qualität zentral überwachen kann.
- Als Platform Engineer möchte ich Logs, Metriken und Traces gemeinsam im OTel-Format sehen, damit ich Ursachen schneller korrelieren kann.
- Als Entwickler möchte ich API-Traces und Latenzen einsehen können, damit ich Engpässe und Regressionen erkenne.
- Als Mission Network Operator möchte ich betriebsrelevante Ereignisse wie fehlerhafte Zone-Generierungen, Validierungsfehler oder Sicherheitsverstösse als Telemetrie sehen, damit ich reagieren kann.
- Als Platform Engineer möchte ich zwischen einem lokalen und einem ClickHouse-basierten Betriebsmodus umschalten können, damit Entwicklung, Offline-Betrieb und Produktion denselben Observability-Ansatz nutzen.
- Als Platform Engineer möchte ich bei Zielsystem-Ausfall Telemetrie zuerst puffern und später nachliefern können, damit keine Daten durch kurze Unterbrüche verloren gehen.
- Als Operator möchte ich Grafana mit ClickHouse als Datenquelle verwenden können, damit Dashboards ohne direkte Abhängigkeit von externen SaaS-Diensten funktionieren.
- Als DNS-Verantwortlicher möchte ich eine versionierte Grafana-Dashboard-Vorlage im Repository haben, damit jede Release-Version die passende Sicht auf Telemetrie und Betrieb dokumentiert.
- Als Security-Verantwortlicher möchte ich OTel-basierte Security-Events an ein SIEM oder einen SIEM-nahen Speicher weiterreichen können, damit Policy-Verstösse und ungewöhnliche Aktivitäten nachvollziehbar sind.
- Als Plattform-Verantwortlicher möchte ich den Monitoring-Stack airgapped betreiben können, damit die Lösung auch ohne Internet oder SaaS lauffähig bleibt.

## Acceptance Criteria
- [ ] OpenTelemetry ist für App und Operator beschrieben und die erfassten Signale sind klar benannt: Metriken, Logs, Traces und Security-Events
- [ ] Die App stellt eine standardisierte Telemetrie-Sicht bereit, die lokale Entwicklung und produktiven Betrieb mit denselben Begriffen abdeckt
- [ ] Ein `local`-Modus ist dokumentiert und testbar: Telemetrie wird lokal zwischengespeichert, auch ohne Zielsystem oder Internet
- [ ] Ein `clickhouse`-Modus ist dokumentiert und testbar: Telemetrie wird an ClickHouse geliefert und kann dort für Auswertung und Dashboards genutzt werden
- [ ] Bei Zielsystem-Ausfall bleibt die App funktionsfähig; Telemetrie wird gepuffert, automatisch erneut versucht und später nachlieferbar gehalten
- [ ] Buffering, Retry und Replay sind als Betriebsverhalten beschrieben und mit klaren Grenzen versehen, damit Datenverluste nachvollziehbar minimiert werden
- [ ] Grafana nutzt ClickHouse als primäre Datenquelle für Observability-Dashboards
- [ ] Die DNS-Grafana-Dashboard-Vorlage ist versioniert im Repository abgelegt und an Release-/Versionsstand gekoppelt
- [ ] Ein exportierbares Dashboard-Paket für airgapped Betrieb ist dokumentiert, damit die Vorlage ohne Online-Abhängigkeit verteilt werden kann
- [ ] Metriken decken mindestens API-Nutzung, Latenz, Fehler, Zone-Generierung, Operator-Zustand und Telemetrie-Exportstatus ab
- [ ] Logs sind strukturiert und enthalten mindestens Zeitstempel, Schweregrad, Service, Korrelation und Nachricht
- [ ] Security-Events aus OTel können an ein SIEM oder einen SIEM-nahen Speicher weitergegeben werden
- [ ] Der OTel-Betriebsmodus ist über versionierte Konfiguration umschaltbar, ohne Codeänderung
- [ ] Airgapped-Betrieb ist als Zielzustand dokumentiert und ohne externe SaaS-Dienste möglich
- [ ] Die Lösung beschreibt nachvollziehbar, wie ClickHouse als Speicher, Grafana als Sicht und OTel als Transport zusammenspielen
- [ ] Die Dokumentation enthält klare Hinweise, welche Telemetrie lokal, welche in ClickHouse und welche im SIEM landen soll
- [ ] Es gibt definierte Grenzen für Speicherverbrauch, Retention und Datenrückstau im lokalen Modus
- [ ] Ein erfolgreicher Betrieb kann mit einem einfachen Smoke-Test gegen lokale und ClickHouse-Konfiguration validiert werden

## Edge Cases
- Was passiert, wenn kein Zielsystem konfiguriert ist? → Die App bleibt nutzbar; Telemetrie wird lokal gesammelt und mit Warnhinweis markiert
- Was passiert, wenn ClickHouse nicht erreichbar ist? → Der Export läuft in Retry-/Replay-Logik weiter; bei Überlauf greift ein dokumentierter Speichergrenzwert
- Was passiert, wenn der lokale Puffer voll läuft? → Es gibt einen klaren Warnzustand und dokumentierte Retention-Regeln statt stiller Datenverluste
- Was passiert, wenn Dashboard-Version und ClickHouse-Schema nicht zusammenpassen? → Die Version gilt als nicht kompatibel und muss gemeinsam mit dem Release angepasst werden
- Was passiert, wenn Security-Events zu viele Signale erzeugen? → Es gelten Filter- und Priorisierungsregeln, damit nur relevante Ereignisse an das SIEM gehen
- Was passiert, wenn Telemetrie versehentlich sensible Inhalte enthält? → Sensible Werte werden vor der Weitergabe als schützenswert markiert und nicht ungefiltert exportiert
- Was passiert, wenn sowohl `local` als auch `clickhouse` gleichzeitig aktiv wären? → Die Konfiguration ist ungültig und wird vor dem Start abgelehnt
- Was passiert im airgapped Betrieb ohne Internetzugang? → Die Lösung bleibt vollständig lauffähig; nur externe Integrationen sind deaktiviert oder lokal ersetzt

## Technical Requirements
- OpenTelemetry als gemeinsame Observability-Schicht für App, Operator und Security-Events
- Ein lokaler Persistenz- und Puffermechanismus für Telemetrie mit Retry- und Replay-Verhalten
- ClickHouse als zentrale Auswertungs- und Speicherkomponente für produktive Observability
- Grafana als Visualisierungsschicht auf Basis von ClickHouse
- Versionierte Dashboard-Artefakte im Repository für reproduzierbare Releases
- Airgapped-kompatible Betriebsdokumentation ohne externe SaaS-Abhängigkeiten
- Konfigurierbare Betriebsprofile für `local` und `clickhouse`
- Klare Grenzen für Retention, Speicherverbrauch und Nachlieferung
- Dokumentierte Weitergabe von Security-Events an ein SIEM oder SIEM-nahen Zielspeicher

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
### Scope
OBJ-11 legt die Observability-Grundlage für die DNS-App fest. Dazu gehören Telemetrie für App und Operator, ein lokaler und ein produktiver Betriebsmodus, die Verbindung zu ClickHouse und Grafana sowie ein reproduzierbarer Weg für versionierte Dashboards und airgapped Betrieb.

### Visual Tree
Monitoring & Observability
+-- App Telemetry
|   +-- HTTP-Metriken
|   +-- Fehler- und Latenzsignale
|   +-- Strukturierte Logs
|   +-- Traces
+-- Operator Telemetry
|   +-- Reconcile-Zustand
|   +-- Fehler- und Latenzsignale
+-- Telemetry Router
|   +-- Local Mode
|   |   +-- Lokale Pufferung
|   |   +-- Retry und Replay
|   +-- ClickHouse Mode
|       +-- Zentrale Speicherung
|       +-- Abfrage fuer Grafana
+-- Visualization
|   +-- Versionierte DNS-Dashboard-Vorlage
|   +-- Release-gekoppelte Ansicht
+-- Security Signal Path
    +-- OTel Security Events
    +-- SIEM-Weitergabe oder SIEM-naher Speicher

### Data Flow / Data Model
Die App erzeugt Telemetrie in drei Hauptgruppen: Betriebsmetriken, Diagnosedaten und Security-Events. Diese Signale laufen durch einen zentralen Telemetriepfad, der je nach Modus entweder lokal puffert oder an ClickHouse weitergibt.

Im lokalen Modus bleibt die Telemetrie innerhalb der Zielumgebung und wird für Entwicklung, Offline-Phasen oder eingeschränkte Netze gesichert. Im ClickHouse-Modus werden die Daten zentral gespeichert, damit Grafana daraus Dashboards erzeugen kann. Sicherheitsrelevante Ereignisse werden zusätzlich so aufbereitet, dass sie in ein SIEM eingespeist oder dort nachvollzogen werden können.

Wichtige Datenobjekte in diesem Design sind:
- Telemetrieereignis mit Zeit, Quelle, Typ und Korrelation
- Pufferzustand mit Warteschlange, Retry-Status und Nachlieferungsgrenze
- Dashboard-Version mit Zuordnung zu Release und Dokumentationsstand
- Sicherheitsereignis mit Priorität und Weitergabeziel

### Technical Decisions
- OpenTelemetry wird als gemeinsamer Standard genutzt, weil damit App, Operator und Security-Events in einem einheitlichen Modell zusammengeführt werden können.
- Ein lokaler Modus ist nötig, weil Entwicklung, Offline-Betrieb und airgapped Umgebungen nicht von einem externen Zielsystem abhängen dürfen.
- ClickHouse ist als produktiver Speicher sinnvoll, weil Telemetrie dort zentral auswertbar bleibt und Grafana direkt darauf aufsetzen kann.
- Buffering mit Retry und Replay ist wichtiger als ein einfacher Direktversand, weil kurze Zielsystem-Ausfälle sonst sofort zu Datenverlust führen würden.
- Versionierte Dashboard-Artefakte gehören ins Repository, weil Betrieb und Release nachvollziehbar zusammengehören müssen.
- Security-Events werden über OTel mitgeführt, weil Observability und SIEM-Nachvollziehbarkeit nicht getrennt gedacht werden sollten.

### Dependencies
- OpenTelemetry für App, Collector und Operator
- ClickHouse für zentrale Speicherung und Abfragen
- Grafana für Visualisierung und Dashboard-Nutzung
- Versionierte Repository-Struktur für Dashboards und Export-Artefakte
- Airgapped-Transportpfad für offlinefähige Verteilung

### Requirements Input
Diese Architektur basiert direkt auf den Anforderungen für:
- lokalen und produktiven OTel-Betrieb
- Buffering, Retry und Replay
- ClickHouse als zentrale Datenbasis
- Grafana-Templates mit Versionierung
- airgapped Betrieb ohne SaaS
- SIEM-Anbindung über OTel-Signale

### QA Readiness
Vor der Umsetzung sollte OBJ-11 über folgende Fragen prüfbar sein:
- Kann die App mit `local`-Profil ohne Zielsystem starten und Telemetrie behalten?
- Kann der Wechsel auf `clickhouse` ohne Codeänderung erfolgen?
- Werden neue Telemetriesignale in Grafana sichtbar?
- Ist die Dashboard-Vorlage versioniert und releasebezogen nachvollziehbar?
- Werden Zielsystem-Ausfälle gepuffert statt still ignoriert?
- Sind Security-Events im vorgesehenen Pfad nachvollziehbar?
- Ist der Betrieb ohne Internet oder externe SaaS-Dienste möglich?

## Implementation Update (2026-04-09)
Der erste konkrete Artefakt-Satz für OBJ-11 ist jetzt im Repository abgelegt. Der Fokus dieser Umsetzung liegt auf versionierbaren Betriebs- und Exportartefakten sowie einem live testbaren Telemetry-Probe-Pfad fuer die App.

Erstellt bzw. aktualisiert wurden:
- `monitoring/otel/collector-local.yaml`
- `monitoring/otel/collector-clickhouse.yaml`
- `monitoring/otel/README.md`
- `monitoring/grafana/dashboards/dns-observability-v1.json`
- `monitoring/grafana/provisioning/datasources/clickhouse.yaml`
- `monitoring/examples/app-telemetry.env.example`
- `monitoring/examples/security-event.json`
- `monitoring/examples/airgap-bundle-manifest.md`
- `src/lib/observability.ts`
- `src/app/api/v1/telemetry/route.ts`
- `src/app/api/v1/api-v1.test.ts`
- `k8s/observability/kustomization.yaml`
- `k8s/observability/collector-deployment.yaml`
- `k8s/observability/clickhouse-statefulset.yaml`
- `k8s/observability/grafana-deployment.yaml`

QA-Fix-Hinweis:
- Die Beispielartefakte und Dashboard-Queries verwenden jetzt konsistent `dns-management-service` als `service.name`, damit Korrelation und Sichtbarkeit in Grafana stabil bleiben.
- Eine lauffähige Telemetry-Probe ist jetzt als API-Route vorhanden; sie liefert den aktuellen OTel-Modus, Exportpfad und die Signalarten und schreibt ein strukturiertes Log-Event.

Aktueller Reifegrad:
- Betriebsprofile `local` und `clickhouse` sind als versionierte Collector-Artefakte beschrieben
- Buffering, Retry und Replay sind dokumentiert und über persistente Spool-/Queue-Pfade modelliert
- Grafana konsumiert ClickHouse als Leseschicht über versioniertes Dashboard und Datasource-Stub
- SIEM-Ausrichtung ist über OTel-Security-Events beschrieben
- Die API liefert einen live testbaren Telemetry-Probe-Pfad für lokale und automatisierte QA
- Das Observability-Deployment ist als Kustomize-Overlay (`k8s/observability`) verdrahtet und renderbar
- Airgapped Transport ist als Bundle-Inhalt und Replay-Ablauf dokumentiert

Noch offen für die vollständige Fertigstellung von OBJ-11:
- Live-Instrumentierung der Operator-Komponenten
- End-to-End-Smoke-Test mit laufendem Collector + ClickHouse + Grafana im Ziel-Cluster
- Runtime-Nachweis unter Last/Fehlerbedingungen in der Zielumgebung

## QA Test Results
**Tested:** 2026-04-09
**App URL:** N/A (Observability Artefakte und Konfiguration)
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status
- [x] `local`- und `clickhouse`-Collector-Profile vorhanden und YAML-valide
- [x] Buffering/Retry/Replay im OTel-Konzept dokumentiert
- [x] Grafana-Dashboard und ClickHouse-Datasource-Artefakte vorhanden und valide
- [x] Security-Event-Pfad und SIEM-Ausrichtung dokumentiert
- [x] Service-Namen in Beispielen und Dashboard-Queries konsistent (`dns-management-service`)
- [x] Airgapped Export-/Replay-Artefakte dokumentiert
- [x] Live-Telemetry-Probe der App ist als API-Route und Testfall umgesetzt
- [x] Strukturiertes Probe-Log fuer OTel-/SIEM-Pfad vorhanden
- [x] Lokaler Smoke-Test (App -> Collector Endpoint) ist automatisiert und erfolgreich (`npm run check:obj11`)
- [x] Deployment-Verdrahtung der Observability-Komponenten ist als Kustomize-Overlay vorhanden und renderbar (`kubectl kustomize --load-restrictor=LoadRestrictionsNone k8s/observability`)
- [ ] BLOCKED: End-to-End Smoke-Test gegen laufenden Collector + ClickHouse + Grafana im Ziel-Cluster ist noch offen

### Edge Cases Status
- [x] Edge Cases fuer Zielsystem-Ausfall, Pufferueberlauf und Mode-Konflikt dokumentiert
- [ ] BLOCKED: Edge-Case-Verhalten unter Last/Fehlern in laufender Zielumgebung nicht praktisch getestet

### Security Audit Results
- [x] Keine Hardcoded-Secrets in Monitoring-Beispielen (nur Platzhalterwerte)
- [x] Security-Events enthalten strukturierte Felder fuer SIEM-Korrelation
- [x] Probe-Smoke-Test (App -> OTLP Collector Endpoint) ist erfolgreich nachgewiesen
- [ ] BLOCKED: Laufende Security-Event-Pipeline (Erzeugung -> Transport -> Speicherung) nicht end-to-end verifiziert

### Bugs Found
Keine offenen funktionalen Bugs im Repo-Stand gefunden.

### Summary
- **Acceptance Criteria:** 10 passed, 0 failed, 1 blocked
- **Bugs Found:** 0 total
- **Security:** Requirements satisfied at repository level; runtime verification still pending cluster
- **Production Ready:** NO
- **Recommendation:** End-to-End-Cluster-Smoke-Test abschliessen, danach `/qa` erneut ausführen

## Deployment
_To be added by /deploy_
