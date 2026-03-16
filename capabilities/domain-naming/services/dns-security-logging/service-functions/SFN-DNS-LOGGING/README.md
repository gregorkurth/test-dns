# SFN-DNS-LOGGING: DNS Security & Event Logging

> **Service Function ID:** SFN-DNS-LOGGING
> **Quelle:** FMN SP5 SI Domain Naming, Annex B Enterprise-level Requirements, Seite 36
> **Service:** DNS Security & Logging (SVC-LOG)
> **Quelle-Typ:** [NATO]

---

## Beschreibung

DNS-Server und Resolver müssen Ereignisse protokollieren. Das Logging ist eine Sicherheitsanforderung auf Enterprise-Level und gilt für alle DNS-Komponenten. Protokolliert werden müssen: Zone Transfers, fehlgeschlagene Anfragen, Zonenmodifikationen und DNSSEC-Validierungsfehler.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [SREQ-53](requirements/SREQ-53.md) | [NATO] | FMN SP5, S.36 | DNS-Server und Resolver müssen Ereignisse protokollieren | MUSS |
| [SREQ-54](requirements/SREQ-54.md) | [NATO] | FMN SP5, S.36 | Logs müssen mindestens Zone Transfers, fehlgeschlagene Anfragen und Zonenmodifikationen enthalten | MUSS |
| [SREQ-309](requirements/SREQ-309.md) | [NATO] | FMN SP5, S.36 | Logs müssen Details zu fehlgeschlagenen Anfragen enthalten | MUSS |
| [SREQ-310](requirements/SREQ-310.md) | [NATO] | FMN SP5, S.36 | Logs müssen Details zu DNSSEC-Validierungsfehlern enthalten | MUSS |

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-SREQ-53-001](tests/auto/TEST-SREQ-53-001.md) | Automatisch (pytest) | SREQ-53 |
| [TEST-SREQ-53-001-manual](tests/manual/TEST-SREQ-53-001-manual.md) | Manuell | SREQ-53 |
| [TEST-SREQ-54-001](tests/auto/TEST-SREQ-54-001.md) | Automatisch (pytest) | SREQ-54 |
| [TEST-SREQ-54-001-manual](tests/manual/TEST-SREQ-54-001-manual.md) | Manuell | SREQ-54 |
| [TEST-SREQ-309-001](tests/auto/TEST-SREQ-309-001.md) | Automatisch (pytest) | SREQ-309 |
| [TEST-SREQ-309-001-manual](tests/manual/TEST-SREQ-309-001-manual.md) | Manuell | SREQ-309 |
| [TEST-SREQ-310-001](tests/auto/TEST-SREQ-310-001.md) | Automatisch (pytest) | SREQ-310 |
| [TEST-SREQ-310-001-manual](tests/manual/TEST-SREQ-310-001-manual.md) | Manuell | SREQ-310 |
