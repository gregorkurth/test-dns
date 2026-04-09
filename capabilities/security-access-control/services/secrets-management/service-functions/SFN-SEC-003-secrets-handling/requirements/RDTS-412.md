# RDTS-412: OpenBao als Standard, `local` nur als degradierter Modus mit Ausnahmehinweis

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-412 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-SEC-003 - Secrets Handling |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> Secrets-Management MUSS standardmaessig ueber OpenBao erfolgen. `local` ist nur als degradierter Modus mit gueltiger Ausnahme-ID und sichtbarem Sicherheitshinweis zulaessig.

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-412-001](../tests/auto/TEST-RDTS-412-001.md) | Automatisch |
| [TEST-RDTS-412-001-manual](../tests/manual/TEST-RDTS-412-001-manual.md) | Manuell |
