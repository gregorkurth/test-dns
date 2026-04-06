# SFN-DEV-002: Image Build

> **Service Function ID:** SFN-DEV-002
> **Quelle:** App-Template-Anweisung
> **Service:** CI/CD Pipeline (SVC-DEV-CICD)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Image Build - Bestandteil der DevOps Capability.

---

## Requirements

| [RDTS-503](requirements/RDTS-503.md) | [ARCH] | App-Template | Multi-Stage Build mit gehaertetem Minimal-Runtime-Image | MUSS |
| [RDTS-504](requirements/RDTS-504.md) | [ARCH] | App-Template | Image-Tagging mit Git-SHA und Tag | MUSS |
| [RDTS-505](requirements/RDTS-505.md) | [ARCH] | App-Template | SBOM bei Release-Builds | MUSS |

---

## Tests

| [TEST-RDTS-503-001](tests/auto/TEST-RDTS-503-001.md) | Automatisch | RDTS-503 |
| [TEST-RDTS-503-001-manual](tests/manual/TEST-RDTS-503-001-manual.md) | Manuell | RDTS-503 |
| [TEST-RDTS-504-001](tests/auto/TEST-RDTS-504-001.md) | Automatisch | RDTS-504 |
| [TEST-RDTS-504-001-manual](tests/manual/TEST-RDTS-504-001-manual.md) | Manuell | RDTS-504 |
| [TEST-RDTS-505-001](tests/auto/TEST-RDTS-505-001.md) | Automatisch | RDTS-505 |
| [TEST-RDTS-505-001-manual](tests/manual/TEST-RDTS-505-001-manual.md) | Manuell | RDTS-505 |
