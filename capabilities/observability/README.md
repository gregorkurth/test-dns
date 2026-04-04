# Capability: Observability

> **Capability ID:** CAP-003
> **NATO C3 Taxonomie:** Communication and Information Services > Platform Services > Monitoring
> **FMN-Referenz:** App-Template-Anweisung (intern)
> **Maturität:** L0 – Idea (Stand: 2026-04-03)

---

## Beschreibung

Die Observability-Capability stellt sicher, dass die DNS-Konfigurations-App und der Kubernetes Operator vollständig überwachbar sind. Monitoring, Logging und Tracing werden nativ mit OpenTelemetry umgesetzt und sind in Standard-Backends (Prometheus, Loki, Jaeger) exportierbar. Betriebsrelevante Zustände sind jederzeit sichtbar.

---

## Services

| ID | Service | Beschreibung | Spec |
|----|---------|-------------|------|
| SVC-OBS-MON | Monitoring & Tracing | OTel-native Metriken, Logs und Traces | [README](services/monitoring-tracing/README.md) |

---

## Service Functions

| SFN-ID | Service Function | Service | Quelle |
|--------|-----------------|---------|--------|
| SFN-OBS-001 | Metrics Export | SVC-OBS-MON | [ARCH] |
| SFN-OBS-002 | Structured Logging | SVC-OBS-MON | [ARCH] |
| SFN-OBS-003 | Distributed Tracing | SVC-OBS-MON | [ARCH] |

---

## Abhängigkeiten

| DPD-ID | Abhängigkeit | Typ | Beschreibung |
|--------|-------------|-----|-------------|
| DPD-OBS-001 | CAP-002 Kubernetes Platform | Voraussetzung | App muss im Cluster laufen für Monitoring |
| DPD-OBS-002 | OBJ-8 REST API | Voraussetzung | API-Metriken und Traces setzen API voraus |

---

## Links

- [Maturity Status](maturity.md)
- [Products & Licenses](products.md)
- [App-Template-Anweisung](../../req-init/app-template.md)
