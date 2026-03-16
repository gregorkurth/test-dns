# Service: Recursive Resolving Services

> **Service ID:** SVC-RESOLV
> **Capability:** Domain Naming (CAP-001)
> **Quelldokument:** FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023

---

## Beschreibung

Die Recursive Resolving Services führen iterative DNS-Auflösungen im Namen von DNS-Clients durch. Resolver beginnen bei Root-Servern und folgen der Delegation bis zur autoritativen Antwort. Optional validieren sie DNSSEC-Signaturen.

CHE CC-517 betreibt zwei Resolver (rs1.core.ndp.che, rs2.core.ndp.che).

---

## Service Functions

| ID | Service Function | Beschreibung | Requirements | Tests |
|----|-----------------|-------------|-------------|-------|
| SFN-RESOLV-QUERY | Recursive DNS Resolution | Iterative DNS-Auflösung für MN-Clients | [Requirements](service-functions/SFN-RESOLV-query/README.md) | 3 Auto, 3 Manuell |
| SFN-RESOLV-DNSSEC | DNSSEC Validation | Validierung von DNSSEC-signierten Antworten | [Requirements](service-functions/SFN-RESOLV-dnssec/README.md) | 1 Auto, 1 Manuell |

---

## Produkte

| Produkt | Version | Lizenz |
|---------|---------|--------|
| Unbound | 1.19.x | BSD 3-Clause |

---

## Abhängigkeiten

| Von | Nach | Typ | Beschreibung |
|-----|------|-----|-------------|
| SVC-RESOLV | SFN-TIN370 | Voraussetzung | Resolver benötigt Root-Zone für rekursive Auflösung |
| SVC-RESOLV | Service Instructions for Distributed Time | Voraussetzung | Zeitstempel-Validierung bei DNSSEC |

---

## Quelldokumente

- FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023
- CWIX26 CHE CC517 FMNCS Configuration Form for Domain Naming
