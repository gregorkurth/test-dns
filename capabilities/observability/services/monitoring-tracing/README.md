# Service: Monitoring & Tracing

> **Service ID:** SVC-OBS-MON
> **Capability:** Observability (CAP-003)
> **Quelldokument:** App-Template-Anweisung, Abschnitt 5 (Monitoring / OpenTelemetry)

---

## Beschreibung

Der Monitoring & Tracing Service umfasst die vollstaendige Instrumentierung der App und des Operators mit OpenTelemetry. Metriken werden im Prometheus-Format exportiert, Logs sind strukturiert (JSON) und Traces werden via OTLP an konfigurierbare Backends gesendet. Die Zielarchitektur fuehrt alle drei Signaltypen nach ClickHouse und nutzt Grafana (ClickHouse-Data-Source) fuer die Auswertung. Fuer Entwicklungs- und Offline-Phasen steht zusaetzlich ein lokaler OTel-Modus mit persistenter Zwischenspeicherung und spaeterer Nachlieferung zur Verfuegung. Security-/Policy-Verstoesse werden ueber standardisierte Event-Felder fuer SIEM-Auswertung bereitgestellt.

---

## Service Functions

| ID | Service Function | Beschreibung | Requirements | Tests |
|----|-----------------|-------------|-------------|-------|
| SFN-OBS-001 | Metrics Export | Prometheus-Metriken unter /metrics, ClickHouse-Weitergabe, lokaler OTel-Modus, DNS-Dashboard-Vorlage | [Requirements](service-functions/SFN-OBS-001-metrics-export/README.md) | 7 Auto, 7 Manuell |
| SFN-OBS-002 | Structured Logging | JSON-Logs mit traceId, level, service, Security-Event-Feldern fuer SIEM | [Requirements](service-functions/SFN-OBS-002-structured-logging/README.md) | 4 Auto, 4 Manuell |
| SFN-OBS-003 | Distributed Tracing | OTLP Traces für API-Requests | [Requirements](service-functions/SFN-OBS-003-distributed-tracing/README.md) | 3 Auto, 3 Manuell |

---

## Quelldokumente

- App-Template-Anweisung (req-init/app-template.md), Abschnitt 5: Monitoring / OpenTelemetry
- Feature-Spec OBJ-11: Monitoring & Observability
