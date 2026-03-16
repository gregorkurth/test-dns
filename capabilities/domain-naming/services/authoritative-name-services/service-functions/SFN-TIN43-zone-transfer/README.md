# SFN-TIN43: DNS Zone Transfer

> **Service Function ID:** SFN-TIN43
> **Quelle:** FMN SP5 SI Domain Naming, Kapitel 5.1.3 (TIN-43), Seite 21–23
> **Service:** Authoritative Name Services (SVC-AUTH)
> **Quelle-Typ:** [NATO]

---

## Beschreibung

Ein DNS Zone Transfer ist ein Synchronisierungsmechanismus für autoritative DNS-Server, bei dem DNS-Zonen von einem primären Nameserver auf sekundäre Server übertragen werden. Zone Transfers müssen mit TSIG (Secret Key Transaction Authentication) gesichert werden. Pflichtmässiger Message-Digest-Algorithmus: hmac-sha384.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [SREQ-241](requirements/SREQ-241.md) | [NATO] | FMN SP5, S.22 | Zonen-Updates via Zone Transfer unterstützen | MUSS |
| [SREQ-529](requirements/SREQ-529.md) | [NATO] | FMN SP5, S.22 | DNS Zone Transfers mit TSIG sichern | MUSS |
| [SREQ-612](requirements/SREQ-612.md) | [NATO] | FMN SP5, S.22 | Hidden-Betrieb unterstützen (nicht erreichbar für normale DNS-Queries) | MUSS |

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-SREQ-241-001](tests/auto/TEST-SREQ-241-001.md) | Automatisch (pytest) | SREQ-241 |
| [TEST-SREQ-241-001-manual](tests/manual/TEST-SREQ-241-001-manual.md) | Manuell | SREQ-241 |
| [TEST-SREQ-529-001](tests/auto/TEST-SREQ-529-001.md) | Automatisch (pytest) | SREQ-529 |
| [TEST-SREQ-529-001-manual](tests/manual/TEST-SREQ-529-001-manual.md) | Manuell | SREQ-529 |
| [TEST-SREQ-612-001](tests/auto/TEST-SREQ-612-001.md) | Automatisch (pytest) | SREQ-612 |
| [TEST-SREQ-612-001-manual](tests/manual/TEST-SREQ-612-001-manual.md) | Manuell | SREQ-612 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-TIN43 | IDP-220 Communications | Voraussetzung (TCP:53) |
