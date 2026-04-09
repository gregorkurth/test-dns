# RDTS-413: Strikte Credential-Rotation fuer Agenten-Identitaeten (30-90 Tage)

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-413 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-SEC-003 - Secrets Handling |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> Zugangsdaten fuer Agenten-Identitaeten muessen mit verkuerztem Zyklus rotiert werden (30 bis 90 Tage; fuer hochkritische Workloads <=30 Tage).

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-413-001](../tests/auto/TEST-RDTS-413-001.md) | Automatisch |
| [TEST-RDTS-413-001-manual](../tests/manual/TEST-RDTS-413-001-manual.md) | Manuell |
