# SFN-SEC-004: Audit Logging

> **Service Function ID:** SFN-SEC-004
> **Quelle:** App-Template-Anweisung
> **Service:** Secrets Management (SVC-SEC-SECRETS)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Audit Logging - Bestandteil der Security & Access Control Capability.

---

## Requirements

| [RDTS-408](requirements/RDTS-408.md) | [ARCH] | App-Template | Sicherheitsrelevante Ereignisse protokolliert | MUSS |
| [RDTS-409](requirements/RDTS-409.md) | [ARCH] | App-Template | Audit-Log in OTel integriert | MUSS |
| [RDTS-410](requirements/RDTS-410.md) | [ARCH] | App-Template | Audit-Log nicht manipulierbar | MUSS |
| [RDTS-411](requirements/RDTS-411.md) | [ARCH] | App-Template | Tetragon Runtime-Events werden als Security-Auditquelle eingebunden | MUSS |

---

## Tests

| [TEST-RDTS-408-001](tests/auto/TEST-RDTS-408-001.md) | Automatisch | RDTS-408 |
| [TEST-RDTS-408-001-manual](tests/manual/TEST-RDTS-408-001-manual.md) | Manuell | RDTS-408 |
| [TEST-RDTS-409-001](tests/auto/TEST-RDTS-409-001.md) | Automatisch | RDTS-409 |
| [TEST-RDTS-409-001-manual](tests/manual/TEST-RDTS-409-001-manual.md) | Manuell | RDTS-409 |
| [TEST-RDTS-410-001](tests/auto/TEST-RDTS-410-001.md) | Automatisch | RDTS-410 |
| [TEST-RDTS-410-001-manual](tests/manual/TEST-RDTS-410-001-manual.md) | Manuell | RDTS-410 |
