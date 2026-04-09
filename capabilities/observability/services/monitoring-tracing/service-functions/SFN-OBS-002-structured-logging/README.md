# SFN-OBS-002: Structured Logging

> **Service Function ID:** SFN-OBS-002
> **Quelle:** App-Template-Anweisung, Abschnitt 5, Monitoring / OpenTelemetry
> **Service:** Monitoring & Tracing (SVC-OBS-MON)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Structured Logging stellt sicher, dass alle Logs der App und des Operators im JSON-Format mit standardisierten Feldern (timestamp, level, service, traceId, message) ausgegeben werden. Fuer Security-/Policy-Events werden zusaetzliche Felder fuer Netzwerkfluss, Sicherheitsprofil und SIEM-Korrelation bereitgestellt.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [RDTS-304](requirements/RDTS-304.md) | [ARCH] | App-Template | JSON-strukturierte Logs mit Standardfeldern | 🟥 MUSS |
| [RDTS-305](requirements/RDTS-305.md) | [ARCH] | App-Template | TraceId-Korrelation zwischen Logs und Traces | 🟧 SOLLTE |
| [RDTS-313](requirements/RDTS-313.md) | [ARCH] | App-Template | Security-Events mit standardisierten Netzwerk-/Policy-Feldern | 🟥 MUSS |
| [RDTS-314](requirements/RDTS-314.md) | [ARCH] | App-Template | SIEM-geeignete OTel-Weiterleitung fuer Security-Events (`clickhouse`/`local`) | 🟥 MUSS |

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-RDTS-304-001](tests/auto/TEST-RDTS-304-001.md) | Automatisch | RDTS-304 |
| [TEST-RDTS-304-001-manual](tests/manual/TEST-RDTS-304-001-manual.md) | Manuell | RDTS-304 |
| [TEST-RDTS-305-001](tests/auto/TEST-RDTS-305-001.md) | Automatisch | RDTS-305 |
| [TEST-RDTS-305-001-manual](tests/manual/TEST-RDTS-305-001-manual.md) | Manuell | RDTS-305 |
| [TEST-RDTS-313-001](tests/auto/TEST-RDTS-313-001.md) | Automatisch | RDTS-313 |
| [TEST-RDTS-313-001-manual](tests/manual/TEST-RDTS-313-001-manual.md) | Manuell | RDTS-313 |
| [TEST-RDTS-314-001](tests/auto/TEST-RDTS-314-001.md) | Automatisch | RDTS-314 |
| [TEST-RDTS-314-001-manual](tests/manual/TEST-RDTS-314-001-manual.md) | Manuell | RDTS-314 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-OBS-002 | SFN-OBS-003 | Optional (TraceId-Korrelation) |
