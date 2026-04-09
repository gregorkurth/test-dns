# RDTS-414: SIEM-Weiterleitung ueber OTel mit Modus `clickhouse`/`local`

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-414 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-SEC-004 - Audit Logging |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> Security-Events muessen ueber OTel an SIEM weitergeleitet werden. Unterstuetzte Modi sind `clickhouse` und `local`; in `prod` ist `clickhouse` verpflichtend.

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-414-001](../tests/auto/TEST-RDTS-414-001.md) | Automatisch |
| [TEST-RDTS-414-001-manual](../tests/manual/TEST-RDTS-414-001-manual.md) | Manuell |
