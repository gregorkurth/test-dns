# Service: Monitoring & Tracing

> **Service ID:** SVC-OBS-MON
> **Capability:** Observability (CAP-003)
> **Quelldokument:** App-Template-Anweisung, Abschnitt 5 (Monitoring / OpenTelemetry)

---

## Beschreibung

Der Monitoring & Tracing Service umfasst die vollständige Instrumentierung der App und des Operators mit OpenTelemetry. Metriken werden im Prometheus-Format exportiert, Logs sind strukturiert (JSON) und Traces werden via OTLP an konfigurierbare Backends gesendet.

---

## Service Functions

| ID | Service Function | Beschreibung | Requirements | Tests |
|----|-----------------|-------------|-------------|-------|
| SFN-OBS-001 | Metrics Export | Prometheus-Metriken unter /metrics | [Requirements](service-functions/SFN-OBS-001-metrics-export/README.md) | 3 Auto, 3 Manuell |
| SFN-OBS-002 | Structured Logging | JSON-Logs mit traceId, level, service | [Requirements](service-functions/SFN-OBS-002-structured-logging/README.md) | 2 Auto, 2 Manuell |
| SFN-OBS-003 | Distributed Tracing | OTLP Traces für API-Requests | [Requirements](service-functions/SFN-OBS-003-distributed-tracing/README.md) | 3 Auto, 3 Manuell |

---

## Quelldokumente

- App-Template-Anweisung (req-init/app-template.md), Abschnitt 5: Monitoring / OpenTelemetry
- Feature-Spec OBJ-10: Monitoring & Observability
