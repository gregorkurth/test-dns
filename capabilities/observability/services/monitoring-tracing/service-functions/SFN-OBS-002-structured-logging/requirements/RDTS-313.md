# RDTS-313: Security-Events mit standardisierten Netzwerk-/Policy-Feldern

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-313 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-OBS-002 - Structured Logging |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> Sicherheits- und Policy-Events MUESSEN strukturierte OTel-Felder fuer Netzwerk- und Durchsetzungsinformationen enthalten (u. a. `security.policy.id`, `network.direction`, `network.peer.cidr`, `network.transport`, `network.port`, `security.profile`, `security.exception.id`).

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-313-001](../tests/auto/TEST-RDTS-313-001.md) | Automatisch |
| [TEST-RDTS-313-001-manual](../tests/manual/TEST-RDTS-313-001-manual.md) | Manuell |
