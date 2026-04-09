# SFN-SEC-002: RBAC

> **Service Function ID:** SFN-SEC-002
> **Quelle:** App-Template-Anweisung
> **Service:** Authentifizierung (SVC-SEC-AUTH)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

RBAC - Bestandteil der Security & Access Control Capability.

---

## Requirements

| [RDTS-404](requirements/RDTS-404.md) | [ARCH] | App-Template | RBAC-Rollen definiert | MUSS |
| [RDTS-405](requirements/RDTS-405.md) | [ARCH] | App-Template | API-Endpunkte geschuetzt | MUSS |
| [RDTS-416](requirements/RDTS-416.md) | [ARCH] | App-Template | MCP-/Agent-Zugriffe nur ueber freigegebene Tool- und API-Whitelist | MUSS |

---

## Tests

| [TEST-RDTS-404-001](tests/auto/TEST-RDTS-404-001.md) | Automatisch | RDTS-404 |
| [TEST-RDTS-404-001-manual](tests/manual/TEST-RDTS-404-001-manual.md) | Manuell | RDTS-404 |
| [TEST-RDTS-405-001](tests/auto/TEST-RDTS-405-001.md) | Automatisch | RDTS-405 |
| [TEST-RDTS-405-001-manual](tests/manual/TEST-RDTS-405-001-manual.md) | Manuell | RDTS-405 |
| [TEST-RDTS-416-001](tests/auto/TEST-RDTS-416-001.md) | Automatisch | RDTS-416 |
| [TEST-RDTS-416-001-manual](tests/manual/TEST-RDTS-416-001-manual.md) | Manuell | RDTS-416 |
