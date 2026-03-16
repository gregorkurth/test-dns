# SFN-TIN114: Anycast DNS Advertising

> **Service Function ID:** SFN-TIN114
> **Quelle:** FMN SP5 SI Domain Naming, Kapitel 5.1.4 (TIN-114), Seite 24–26
> **Service:** Authoritative Name Services (SVC-AUTH)
> **Quelle-Typ:** [NATO]

---

## Beschreibung

Anycast ist ein Verfahren, bei dem dieselbe IP-Adresse von mehreren Servern genutzt wird, die denselben Service bereitstellen. Anycast DNS muss von DNS-Providern unterstützt werden, die die Root-Zone bedienen (Root-Server). Die Anycast-Adresse wird via BGP-Routing bekanntgemacht und bei Ausfall zurückgezogen.

CHE CC-517: Anycast Root DNS aktiv, root-ns.core.ndp.che.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [SREQ-609](requirements/SREQ-609.md) | [NATO] | FMN SP5, S.26 | Anycast mit konfigurierbarer Adresse unterstützen | MUSS |
| [SREQ-610](requirements/SREQ-610.md) | [NATO] | FMN SP5, S.26 | Anycast-Anfragen über dieselbe Anycast-Adresse beantworten | MUSS |
| [CREQ-005](requirements/CREQ-005.md) | [CUST] | CHE Config Form | Anycast Services aktiviert; root-ns.core.ndp.che als Anycast FQDN | MUSS |

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-SREQ-609-001](tests/auto/TEST-SREQ-609-001.md) | Automatisch (pytest) | SREQ-609 |
| [TEST-SREQ-609-001-manual](tests/manual/TEST-SREQ-609-001-manual.md) | Manuell | SREQ-609 |
| [TEST-SREQ-610-001](tests/auto/TEST-SREQ-610-001.md) | Automatisch (pytest) | SREQ-610 |
| [TEST-SREQ-610-001-manual](tests/manual/TEST-SREQ-610-001-manual.md) | Manuell | SREQ-610 |
| [TEST-CREQ-005-001](tests/auto/TEST-CREQ-005-001.md) | Automatisch (pytest) | CREQ-005 |
| [TEST-CREQ-005-001-manual](tests/manual/TEST-CREQ-005-001-manual.md) | Manuell | CREQ-005 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-TIN114 | SFN-TIN43 | Voraussetzung (Zone Transfer für Synchronisation) |
| SFN-TIN114 | IDP-151 Communications | Voraussetzung (BGP-Routing) |
