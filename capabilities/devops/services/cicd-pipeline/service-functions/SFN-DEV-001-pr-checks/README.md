# SFN-DEV-001: PR Checks

> **Service Function ID:** SFN-DEV-001
> **Quelle:** App-Template-Anweisung
> **Service:** CI/CD Pipeline (SVC-DEV-CICD)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

PR Checks - Bestandteil der DevOps Capability.

---

## Requirements

| [RDTS-501](requirements/RDTS-501.md) | [ARCH] | App-Template | PR-Check Workflow | MUSS |
| [RDTS-502](requirements/RDTS-502.md) | [ARCH] | App-Template | Pipeline-Laufzeit unter 5min | MUSS |
| [RDTS-511](requirements/RDTS-511.md) | [ARCH] | App-Template | Security-/FMN-Policy-Gate fuer `prod` und externe Flows | MUSS |

---

## Tests

| [TEST-RDTS-501-001](tests/auto/TEST-RDTS-501-001.md) | Automatisch | RDTS-501 |
| [TEST-RDTS-501-001-manual](tests/manual/TEST-RDTS-501-001-manual.md) | Manuell | RDTS-501 |
| [TEST-RDTS-502-001](tests/auto/TEST-RDTS-502-001.md) | Automatisch | RDTS-502 |
| [TEST-RDTS-502-001-manual](tests/manual/TEST-RDTS-502-001-manual.md) | Manuell | RDTS-502 |
| [TEST-RDTS-511-001](tests/auto/TEST-RDTS-511-001.md) | Automatisch | RDTS-511 |
| [TEST-RDTS-511-001-manual](tests/manual/TEST-RDTS-511-001-manual.md) | Manuell | RDTS-511 |
