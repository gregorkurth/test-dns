# SFN-OBS-001: Metrics Export

> **Service Function ID:** SFN-OBS-001
> **Quelle:** App-Template-Anweisung, Abschnitt 5, Monitoring / OpenTelemetry
> **Service:** Monitoring & Tracing (SVC-OBS-MON)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Metrics Export stellt sicher, dass die App und der Operator Metriken im Prometheus-Format unter `/metrics` exportieren. Betriebsrelevante Kennzahlen (HTTP-Requests, Latenz, Zone-File-Generierungen, Fehler) sind als Custom-Metriken definiert. Zusaetzlich wird der standardisierte Export aller Telemetrie nach ClickHouse sowie eine versionierte DNS-Grafana-Dashboard-Vorlage sichergestellt.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [RDTS-301](requirements/RDTS-301.md) | [ARCH] | App-Template | Prometheus-Metriken-Endpoint unter /metrics | 🟥 MUSS |
| [RDTS-302](requirements/RDTS-302.md) | [ARCH] | App-Template | App-spezifische Metriken (HTTP, Zone-Gen, Participants) | 🟥 MUSS |
| [RDTS-303](requirements/RDTS-303.md) | [ARCH] | App-Template | Operator-Metriken (Reconcile-Count, Fehler, Latenz) | 🟧 SOLLTE |
| [RDTS-309](requirements/RDTS-309.md) | [ARCH] | App-Template | Logs, Metriken und Traces werden nach ClickHouse uebergeben | 🟥 MUSS |
| [RDTS-310](requirements/RDTS-310.md) | [ARCH] | App-Template | Versionierte DNS-Grafana-Dashboard-Vorlage fuer ClickHouse | 🟥 MUSS |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-OBS-001 | OBJ-3 REST API | Voraussetzung (API muss existieren fuer HTTP-Metriken) |
