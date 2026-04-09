# SFN-OBS-001: Metrics Export

> **Service Function ID:** SFN-OBS-001
> **Quelle:** App-Template-Anweisung, Abschnitt 5, Monitoring / OpenTelemetry
> **Service:** Monitoring & Tracing (SVC-OBS-MON)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Metrics Export stellt sicher, dass die App und der Operator Metriken im Prometheus-Format unter `/metrics` exportieren. Betriebsrelevante Kennzahlen (HTTP-Requests, Latenz, Zone-File-Generierungen, Fehler) sind als Custom-Metriken definiert. Zusaetzlich wird der standardisierte Export aller Telemetrie nach ClickHouse sowie eine versionierte DNS-Grafana-Dashboard-Vorlage sichergestellt. Fuer Umgebungen ohne verfuegbaren Zielspeicher wird ein lokaler OTel-Modus mit persistenter Pufferung und spaeterer Nachlieferung unterstuetzt.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [RDTS-301](requirements/RDTS-301.md) | [ARCH] | App-Template | Prometheus-Metriken-Endpoint unter /metrics | 🟥 MUSS |
| [RDTS-302](requirements/RDTS-302.md) | [ARCH] | App-Template | App-spezifische Metriken (HTTP, Zone-Gen, Participants) | 🟥 MUSS |
| [RDTS-303](requirements/RDTS-303.md) | [ARCH] | App-Template | Operator-Metriken (Reconcile-Count, Fehler, Latenz) | 🟧 SOLLTE |
| [RDTS-309](requirements/RDTS-309.md) | [ARCH] | App-Template | Logs, Metriken und Traces werden nach ClickHouse uebergeben | 🟥 MUSS |
| [RDTS-310](requirements/RDTS-310.md) | [ARCH] | App-Template | Versionierte DNS-Grafana-Dashboard-Vorlage fuer ClickHouse | 🟥 MUSS |
| [RDTS-311](requirements/RDTS-311.md) | [ARCH] | App-Template | OTel-Betriebsmodus `local` mit persistenter Zwischenspeicherung | 🟥 MUSS |
| [RDTS-312](requirements/RDTS-312.md) | [ARCH] | App-Template | Konfigurierbare Umschaltung `local`/`clickhouse` inkl. Retry/Replay | 🟥 MUSS |

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-RDTS-301-001](tests/auto/TEST-RDTS-301-001.md) | Automatisch | RDTS-301 |
| [TEST-RDTS-301-001-manual](tests/manual/TEST-RDTS-301-001-manual.md) | Manuell | RDTS-301 |
| [TEST-RDTS-302-001](tests/auto/TEST-RDTS-302-001.md) | Automatisch | RDTS-302 |
| [TEST-RDTS-302-001-manual](tests/manual/TEST-RDTS-302-001-manual.md) | Manuell | RDTS-302 |
| [TEST-RDTS-303-001](tests/auto/TEST-RDTS-303-001.md) | Automatisch | RDTS-303 |
| [TEST-RDTS-303-001-manual](tests/manual/TEST-RDTS-303-001-manual.md) | Manuell | RDTS-303 |
| [TEST-RDTS-309-001](tests/auto/TEST-RDTS-309-001.md) | Automatisch | RDTS-309 |
| [TEST-RDTS-309-001-manual](tests/manual/TEST-RDTS-309-001-manual.md) | Manuell | RDTS-309 |
| [TEST-RDTS-310-001](tests/auto/TEST-RDTS-310-001.md) | Automatisch | RDTS-310 |
| [TEST-RDTS-310-001-manual](tests/manual/TEST-RDTS-310-001-manual.md) | Manuell | RDTS-310 |
| [TEST-RDTS-311-001](tests/auto/TEST-RDTS-311-001.md) | Automatisch | RDTS-311 |
| [TEST-RDTS-311-001-manual](tests/manual/TEST-RDTS-311-001-manual.md) | Manuell | RDTS-311 |
| [TEST-RDTS-312-001](tests/auto/TEST-RDTS-312-001.md) | Automatisch | RDTS-312 |
| [TEST-RDTS-312-001-manual](tests/manual/TEST-RDTS-312-001-manual.md) | Manuell | RDTS-312 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-OBS-001 | OBJ-3 REST API | Voraussetzung (API muss existieren fuer HTTP-Metriken) |
