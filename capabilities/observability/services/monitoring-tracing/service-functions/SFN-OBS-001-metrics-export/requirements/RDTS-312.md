# RDTS-312: Umschaltung local/clickhouse mit Retry und Nachlieferung

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-312 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-OBS-001 - Metrics Export |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> Die OTel-Pipeline MUSS zwischen den Betriebsmodi `local` und `clickhouse` ueber versionierte Konfigurationen umschaltbar sein; bei Zielausfall sind Retry-Mechanismus und spaetere Nachlieferung (Replay) sicherzustellen.

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-312-001](../tests/auto/TEST-RDTS-312-001.md) | Automatisch |
| [TEST-RDTS-312-001-manual](../tests/manual/TEST-RDTS-312-001-manual.md) | Manuell |
