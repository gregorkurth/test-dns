# SFN-RESOLV-QUERY: Recursive DNS Resolution

> **Service Function ID:** SFN-RESOLV-QUERY
> **Quelle:** FMN SP5 SI Domain Naming, Kapitel 5.1.1 (TIN-26 Consumer-Seite), Seite 17
> **Service:** Recursive Resolving Services (SVC-RESOLV)
> **Quelle-Typ:** [NATO]

---

## Beschreibung

Der rekursive Resolver löst DNS-Namen im Auftrag von Clients auf. Er beginnt die iterative Auflösung bei Root-Servern und folgt Delegationen bis zur autoritativen Antwort. Der Resolver darf keine Forwarder für Zonen anderer MNPs verwenden.

CHE CC-517: rs1.core.ndp.che, rs2.core.ndp.che als Resolver.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [SREQ-238](requirements/SREQ-238.md) | [NATO] | FMN SP5, S.17 | SOA-, NS- und A-Record mindestens unterstützen (Consumer) | MUSS |
| [SREQ-615](requirements/SREQ-615.md) | [NATO] | FMN SP5, S.17 | Keine Forwarder für Zonen anderer MNPs | MUSS |
| [SREQ-611](requirements/SREQ-611.md) | [NATO] | FMN SP5, S.17 | Konfigurierte Unicast-IP bei Anfragen an andere Server | MUSS |

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-SREQ-238-RESOLV-001](tests/auto/TEST-SREQ-238-RESOLV-001.md) | Automatisch (pytest) | SREQ-238 |
| [TEST-SREQ-238-RESOLV-001-manual](tests/manual/TEST-SREQ-238-RESOLV-001-manual.md) | Manuell | SREQ-238 |
| [TEST-SREQ-615-001](tests/auto/TEST-SREQ-615-001.md) | Automatisch (pytest) | SREQ-615 |
| [TEST-SREQ-615-001-manual](tests/manual/TEST-SREQ-615-001-manual.md) | Manuell | SREQ-615 |
| [TEST-SREQ-611-RESOLV-001](tests/auto/TEST-SREQ-611-RESOLV-001.md) | Automatisch (pytest) | SREQ-611 |
| [TEST-SREQ-611-RESOLV-001-manual](tests/manual/TEST-SREQ-611-RESOLV-001-manual.md) | Manuell | SREQ-611 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-RESOLV-QUERY | SFN-TIN370 | Voraussetzung (Root-Zone für iterative Auflösung) |
