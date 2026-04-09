# RDTS-314: SIEM-geeignete OTel-Weiterleitung fuer Security-Events (`clickhouse`/`local`)

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-314 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-OBS-002 - Structured Logging |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> Security-Events MUESSEN ueber die OTel-Pipeline SIEM-geeignet weitergeleitet werden. Der Standardmodus ist `clickhouse`; `local` ist nur als degradierter Modus zulaessig und muss als Sicherheitsereignis markiert werden.

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-314-001](../tests/auto/TEST-RDTS-314-001.md) | Automatisch |
| [TEST-RDTS-314-001-manual](../tests/manual/TEST-RDTS-314-001-manual.md) | Manuell |
