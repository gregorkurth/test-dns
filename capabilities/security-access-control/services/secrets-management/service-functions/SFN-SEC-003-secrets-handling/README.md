# SFN-SEC-003: Secrets Handling

> **Service Function ID:** SFN-SEC-003
> **Quelle:** App-Template-Anweisung
> **Service:** Secrets Management (SVC-SEC-SECRETS)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Secrets Handling - Bestandteil der Security & Access Control Capability.

---

## Requirements

| [RDTS-406](requirements/RDTS-406.md) | [ARCH] | App-Template | Secrets als K8s Secrets | MUSS |
| [RDTS-407](requirements/RDTS-407.md) | [ARCH] | App-Template | HTTPS erzwungen | MUSS |
| [RDTS-412](requirements/RDTS-412.md) | [ARCH] | App-Template | OpenBao als Standard, `local` nur als degradierter Modus mit Ausnahmehinweis | MUSS |
| [RDTS-413](requirements/RDTS-413.md) | [ARCH] | App-Template | Strikte Credential-Rotation fuer Agenten-Identitaeten (30-90 Tage) | MUSS |

---

## Tests

| [TEST-RDTS-406-001](tests/auto/TEST-RDTS-406-001.md) | Automatisch | RDTS-406 |
| [TEST-RDTS-406-001-manual](tests/manual/TEST-RDTS-406-001-manual.md) | Manuell | RDTS-406 |
| [TEST-RDTS-407-001](tests/auto/TEST-RDTS-407-001.md) | Automatisch | RDTS-407 |
| [TEST-RDTS-407-001-manual](tests/manual/TEST-RDTS-407-001-manual.md) | Manuell | RDTS-407 |
| [TEST-RDTS-412-001](tests/auto/TEST-RDTS-412-001.md) | Automatisch | RDTS-412 |
| [TEST-RDTS-412-001-manual](tests/manual/TEST-RDTS-412-001-manual.md) | Manuell | RDTS-412 |
| [TEST-RDTS-413-001](tests/auto/TEST-RDTS-413-001.md) | Automatisch | RDTS-413 |
| [TEST-RDTS-413-001-manual](tests/manual/TEST-RDTS-413-001-manual.md) | Manuell | RDTS-413 |
