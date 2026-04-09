# OBJ-11: Monitoring & Observability (OpenTelemetry)

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-10: Kubernetes Deployment (App läuft im Cluster)
- OBJ-3: REST API (API-Metriken und Traces)
- OBJ-13: Kubernetes Operator (Operator-Metriken)

## User Stories
- Als Platform Engineer möchte ich Metriken der DNS-Konfigurations-App in Prometheus abrufen können, damit ich betriebliche Kennzahlen überwachen kann.
- Als Platform Engineer möchte ich strukturierte Logs der App und des Operators in einem zentralen Log-System (z. B. Loki) sehen, damit ich Probleme effizient diagnostizieren kann.
- Als Entwickler möchte ich Traces für API-Anfragen einsehen können, damit ich Performance-Engpässe identifizieren kann.
- Als Mission Network Operator möchte ich betriebsrelevante Zustände (z. B. fehlerhafte Zone-File-Generierung) als Metriken oder Alerts sehen, damit ich schnell reagieren kann.
- Als Platform Engineer möchte ich das OTel-Collector-Ziel (Endpoint) konfigurieren können, damit ich die App in verschiedene Monitoring-Stacks integrieren kann.
- Als Platform Engineer moechte ich Logs, Metriken und Traces in ClickHouse speichern, damit alle Telemetrie zentral auswertbar ist.
- Als Operator moechte ich Grafana ueber ClickHouse als Datenquelle verwenden, damit Dashboards ohne direkte Abhaengigkeit von Einzelsystemen funktionieren.
- Als DNS-Verantwortlicher moechte ich eine versionierte DNS-Grafana-Dashboard-Vorlage im Repository haben, damit ich die gleiche Sicht reproduzierbar ausrollen kann.
- Als Platform Engineer moechte ich auch ohne verfuegbaren Zielspeicher einen lokalen OTel-Modus nutzen, damit Telemetrie in Entwicklungs- und Offline-Phasen nicht verloren geht.
- Als Platform Engineer moechte ich zwischen `local` und `clickhouse` per Konfiguration umschalten koennen, damit kein Codewechsel fuer Betriebsmodi noetig ist.

## Acceptance Criteria
- [ ] OpenTelemetry SDK ist in die Next.js-App integriert (Metrics + Traces + Logs)
- [ ] Metriken werden unter `/metrics` im Prometheus-Format exportiert
- [ ] Folgende App-Metriken vorhanden: HTTP-Request-Count, HTTP-Latenz, Zone-File-Generierungen (Erfolg/Fehler), aktive Participants
- [ ] Traces werden an einen konfigurierbaren OTel-Collector-Endpoint exportiert (OTLP über HTTP oder gRPC)
- [ ] Logs sind strukturiert (JSON) mit Feldern: timestamp, level, service, traceId, message
- [ ] Operator exportiert eigene Metriken (Reconcile-Count, Fehler-Count, Latenz)
- [ ] OTel-Collector-Endpoint ist via Umgebungsvariable/ConfigMap konfigurierbar
- [ ] Monitoring funktioniert ohne externe SaaS-Dienste (airgapped-kompatibel)
- [ ] Logs, Metriken und Traces werden in ClickHouse persistiert (inkl. dokumentiertem Schema/Tabellenkonzept)
- [ ] Grafana verwendet ClickHouse als primaere Datenquelle fuer Observability-Dashboards
- [ ] Eine versionierte DNS-Grafana-Dashboard-Vorlage (JSON) liegt im Repository unter `monitoring/grafana/dashboards/`
- [ ] Beispiel-Prometheus-Scrape-Config und Grafana-/ClickHouse-Konfiguration liegen im Repository unter `monitoring/`
- [ ] OTel-Betriebsmodus `local` ist verfuegbar: Telemetrie wird lokal persistent zwischengespeichert (ohne externes Zielsystem)
- [ ] OTel-Betriebsmodus `clickhouse` ist verfuegbar und fuer produktive Zielarchitektur dokumentiert
- [ ] Umschaltung zwischen `local` und `clickhouse` erfolgt ueber versionierte Konfiguration (z. B. Helm Values oder Collector-Profil), ohne Codeaenderung
- [ ] Bei nicht verfuegbarem ClickHouse werden Daten lokal gepuffert und spaeter nachlieferbar gehalten (Queue/Retry-Strategie dokumentiert)

## Edge Cases
- Was passiert wenn kein OTel-Collector konfiguriert ist? → App startet trotzdem; Traces werden verworfen; Warnung im Log
- Was wenn der OTel-Collector nicht erreichbar ist? → Keine Auswirkung auf App-Funktionalität; Exportfehler im Log protokolliert
- Was wenn Traces sensitiven Inhalt (z. B. TSIG-Key-Fragmente) enthalten könnten? → Sensitive Felder werden vor dem Export maskiert
- Was wenn ClickHouse nicht erreichbar ist? → Telemetrie-Export wird gepuffert oder verworfen nach definierter Strategie; App-Funktion bleibt stabil
- Was wenn ClickHouse-Schema und Dashboard-Queries nicht zueinander passen? → Versionierte Migrations-/Schema-Regeln und Dashboard-Versionen muessen gemeinsam gepflegt werden
- Was wenn lokaler Puffer voll laeuft? → Rotations-/Retention-Regeln greifen; Warnung wird im Monitoring sichtbar
- Was wenn versehentlich beide Modi gleichzeitig aktiviert werden? → Validierung blockiert ungueltige Konfiguration, App startet mit klarer Fehlermeldung

## Technical Requirements
- OpenTelemetry SDK (JS/TS): `@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`
- Prometheus-Export: `@opentelemetry/exporter-prometheus`
- OTLP-Export: `@opentelemetry/exporter-trace-otlp-http`
- Operator (Go): `go.opentelemetry.io/otel`
- Telemetrie-Storage: ClickHouse (Logs, Metriken, Traces) via OTel-Collector-Pipeline
- OTel-Collector mit zwei Betriebsprofilen (`local`, `clickhouse`) und versionierter Umschaltkonfiguration
- Lokaler Persistenzspeicher fuer Telemetrie-Queue (Buffer + Retry + Replay)
- Dashboarding: Grafana mit ClickHouse-Data-Source
- Keine Abhängigkeit zu externen Monitoring-SaaS-Diensten

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
