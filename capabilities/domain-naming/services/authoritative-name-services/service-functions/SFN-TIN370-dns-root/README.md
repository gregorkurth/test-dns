# SFN-TIN370: DNS Root Zone Hosting

> **Service Function ID:** SFN-TIN370
> **Quelle:** FMN SP5 SI Domain Naming, Kapitel 5.1.2 (TIN-370), Seite 19–20
> **Service:** Authoritative Name Services (SVC-AUTH)
> **Quelle-Typ:** [NATO]

---

## Beschreibung

Das DNS-Root Technology Interaction ist technisch ein DNS-Query, aber mit zusätzlichen Anforderungen an autoritative Nameserver, die die Root-Zone hosten. Jeder MNP muss die Root-Zone für seine eigenen Resolver bedienen können. Die Root-Zone muss signiert sein.

CHE CC-517: root-ns.core.ndp.che ist der Anycast Root DNS Server.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [SREQ-242](requirements/SREQ-242.md) | [NATO] | FMN SP5, S.19 | Muss die Fähigkeit haben, die Root-Zone bereitzustellen | MUSS |
| [SREQ-525](requirements/SREQ-525.md) | [NATO] | FMN SP5, S.19 | Die Root-Zone muss signiert sein | MUSS |
| [SREQ-617](requirements/SREQ-617.md) | [NATO] | FMN SP5, S.19 | Bedienung der Root-Zone durch jeden MNP für eigene Resolver | MUSS |
| [SREQ-1159](requirements/SREQ-1159.md) | [NATO] | FMN SP5, S.32 | Root-Zone darf nur Top-Level-Domains delegieren | MUSS |
| [SREQ-1272](requirements/SREQ-1272.md) | [NATO] | FMN SP5, S.19 | Root-Zone signiert mit RSASHA256, RSASHA512, ECDSAP256SHA256 oder ECDSAP384SHA384 | MUSS |
| [CREQ-004](requirements/CREQ-004.md) | [CUST] | CHE Config Form | Anycast Root DNS: root-ns.core.ndp.che | MUSS |

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-SREQ-242-001](tests/auto/TEST-SREQ-242-001.md) | Automatisch (pytest) | SREQ-242 |
| [TEST-SREQ-242-001-manual](tests/manual/TEST-SREQ-242-001-manual.md) | Manuell | SREQ-242 |
| [TEST-SREQ-525-001](tests/auto/TEST-SREQ-525-001.md) | Automatisch (pytest) | SREQ-525 |
| [TEST-SREQ-525-001-manual](tests/manual/TEST-SREQ-525-001-manual.md) | Manuell | SREQ-525 |
| [TEST-SREQ-617-001](tests/auto/TEST-SREQ-617-001.md) | Automatisch (pytest) | SREQ-617 |
| [TEST-SREQ-617-001-manual](tests/manual/TEST-SREQ-617-001-manual.md) | Manuell | SREQ-617 |
| [TEST-SREQ-1159-001](tests/auto/TEST-SREQ-1159-001.md) | Automatisch (pytest) | SREQ-1159 |
| [TEST-SREQ-1159-001-manual](tests/manual/TEST-SREQ-1159-001-manual.md) | Manuell | SREQ-1159 |
| [TEST-SREQ-1272-001](tests/auto/TEST-SREQ-1272-001.md) | Automatisch (pytest) | SREQ-1272 |
| [TEST-SREQ-1272-001-manual](tests/manual/TEST-SREQ-1272-001-manual.md) | Manuell | SREQ-1272 |
| [TEST-CREQ-004-001](tests/auto/TEST-CREQ-004-001.md) | Automatisch (pytest) | CREQ-004 |
| [TEST-CREQ-004-001-manual](tests/manual/TEST-CREQ-004-001-manual.md) | Manuell | CREQ-004 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-TIN370 | SFN-TIN43 | Voraussetzung (Zone Transfer für Root-Zone) |
| SFN-TIN370 | SFN-TIN114 | Voraussetzung (Anycast für Root-Zone) |
