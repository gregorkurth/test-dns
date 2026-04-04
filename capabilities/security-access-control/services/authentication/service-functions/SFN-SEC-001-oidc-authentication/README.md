# SFN-SEC-001: OIDC Authentication

> **Service Function ID:** SFN-SEC-001
> **Quelle:** App-Template-Anweisung
> **Service:** Authentifizierung (SVC-SEC-AUTH)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

OIDC Authentication - Bestandteil der Security & Access Control Capability.

---

## Requirements

| [RDTS-401](requirements/RDTS-401.md) | [ARCH] | App-Template | OIDC/OAuth2 Authentifizierung | MUSS |
| [RDTS-402](requirements/RDTS-402.md) | [ARCH] | App-Template | Lokale Fallback-Authentifizierung | MUSS |
| [RDTS-403](requirements/RDTS-403.md) | [ARCH] | App-Template | Session-Management | MUSS |

---

## Tests

| [TEST-RDTS-401-001](tests/auto/TEST-RDTS-401-001.md) | Automatisch | RDTS-401 |
| [TEST-RDTS-401-001-manual](tests/manual/TEST-RDTS-401-001-manual.md) | Manuell | RDTS-401 |
| [TEST-RDTS-402-001](tests/auto/TEST-RDTS-402-001.md) | Automatisch | RDTS-402 |
| [TEST-RDTS-402-001-manual](tests/manual/TEST-RDTS-402-001-manual.md) | Manuell | RDTS-402 |
| [TEST-RDTS-403-001](tests/auto/TEST-RDTS-403-001.md) | Automatisch | RDTS-403 |
| [TEST-RDTS-403-001-manual](tests/manual/TEST-RDTS-403-001-manual.md) | Manuell | RDTS-403 |
