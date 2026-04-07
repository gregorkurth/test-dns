# RDTS-309: ClickHouse-Weitergabe fuer Logs, Metriken und Traces

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-309 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-OBS-001 - Metrics Export |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> Logs, Metriken und Traces muessen ueber die OTel-Pipeline in ClickHouse uebergeben und dort auswertbar abgelegt werden.

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-309-001](../tests/auto/TEST-RDTS-309-001.md) | Automatisch |
| [TEST-RDTS-309-001-manual](../tests/manual/TEST-RDTS-309-001-manual.md) | Manuell |
