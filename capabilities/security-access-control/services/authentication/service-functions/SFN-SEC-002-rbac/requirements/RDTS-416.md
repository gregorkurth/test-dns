# RDTS-416: MCP-/Agent-Zugriffe nur ueber freigegebene Tool- und API-Whitelist

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-416 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-SEC-002 - RBAC |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> MCP-/Agent-Zugriffe duerfen nur freigegebene Tools und API-Endpunkte verwenden; nicht freigegebene Operationen muessen blockiert und als Security-Event protokolliert werden.

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-416-001](../tests/auto/TEST-RDTS-416-001.md) | Automatisch |
| [TEST-RDTS-416-001-manual](../tests/manual/TEST-RDTS-416-001-manual.md) | Manuell |
