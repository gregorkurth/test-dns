# RDTS-511: Security-/FMN-Policy-Gate fuer `prod` und externe Flows

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-511 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-DEV-001 - PR Checks |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> Die CI/CD-Pipeline MUSS einen verpflichtenden Policy-Gate-Schritt enthalten, der fuer `prod` und fuer externe FMN-/North-South-Flows die Security-Parameter (`security-profile=strict`, `secrets-mode=openbao`, `siem-mode=clickhouse`) sowie die Cilium-/Kommunikationsmatrix-Konformitaet prueft und bei Verstoessen den Lauf blockiert.

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-511-001](../tests/auto/TEST-RDTS-511-001.md) | Automatisch |
| [TEST-RDTS-511-001-manual](../tests/manual/TEST-RDTS-511-001-manual.md) | Manuell |
