# RDTS-219: OTel-Reporting der Testlaeufe nach ClickHouse oder local

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-219 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟥 MUSS (SHALL) |
| **Service Function** | SFN-K8S-005 – Scheduled Test Execution |
| **Quelldokument** | App-Template-Anweisung |
| **Kapitel** | 5. Monitoring / OpenTelemetry / 8. Testing |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Testergebnisse werden als OTel-Metriken und strukturierte Logs exportiert. Das Ziel ist `clickhouse` (produktiv) oder `local` (Offline-/Dev-Betrieb).

## Akzeptanzkriterien

1. Jeder Lauf erzeugt OTel-Metriken mit Run-ID, Ergebnis und Dauer
2. Jeder Lauf erzeugt strukturierte Logs mit Objekt- und Zeitbezug
3. Zielmodus `clickhouse` ist konfigurierbar und nachweisbar
4. Zielmodus `local` ist konfigurierbar und nachweisbar

## Verknüpfte Features

- OBJ-11: Monitoring & Observability
- OBJ-23: Test Execution Dashboard
- OBJ-26: Test Operator (Scheduled Test Execution via OTel)

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-219-001](../tests/auto/TEST-RDTS-219-001.md) | Automatisch (pytest) |
| [TEST-RDTS-219-001-manual](../tests/manual/TEST-RDTS-219-001-manual.md) | Manuell |

