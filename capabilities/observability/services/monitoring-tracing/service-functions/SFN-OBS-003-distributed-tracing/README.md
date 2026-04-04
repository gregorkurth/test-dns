# SFN-OBS-003: Distributed Tracing

> **Service Function ID:** SFN-OBS-003
> **Quelle:** App-Template-Anweisung, Abschnitt 5, Monitoring / OpenTelemetry
> **Service:** Monitoring & Tracing (SVC-OBS-MON)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Distributed Tracing ermöglicht die End-to-End-Nachverfolgung von API-Anfragen durch die App. Traces werden via OTLP an einen konfigurierbaren Collector-Endpoint exportiert. Sensitive Daten werden vor dem Export maskiert.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [RDTS-306](requirements/RDTS-306.md) | [ARCH] | App-Template | OTLP Trace-Export an konfigurierbaren Endpoint | 🟥 MUSS |
| [RDTS-307](requirements/RDTS-307.md) | [ARCH] | App-Template | Konfigurierbarkeit OTel-Collector-Endpoint via ENV/ConfigMap | 🟥 MUSS |
| [RDTS-308](requirements/RDTS-308.md) | [ARCH] | App-Template | Maskierung sensitiver Daten in Traces | 🟧 SOLLTE |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-OBS-003 | OBJ-8 REST API | Voraussetzung (API-Instrumentation) |
