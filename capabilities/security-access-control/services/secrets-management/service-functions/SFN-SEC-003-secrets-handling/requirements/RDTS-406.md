# RDTS-406: Secrets als K8s Secrets

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-406 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-SEC-003 - Secrets Handling |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> TSIG-Keys, OIDC-Secrets als K8s Secrets, nie in ConfigMap oder Code

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-406-001](../tests/auto/TEST-RDTS-406-001.md) | Automatisch |
| [TEST-RDTS-406-001-manual](../tests/manual/TEST-RDTS-406-001-manual.md) | Manuell |
