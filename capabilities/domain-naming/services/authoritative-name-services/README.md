# Service: Authoritative Name Services

> **Service ID:** SVC-AUTH
> **Capability:** Domain Naming (CAP-001)
> **Quelldokument:** FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023

---

## Beschreibung

Die Authoritative Name Services stellen Zone-Daten für alle konfigurierten DNS-Zonen bereit. Jeder MN Provider betreibt autoritative Nameserver für seine delegierten Zonen sowie für die Root-Zone (Anycast). Der Service umfasst DNS-Query-Beantwortung, Root-Zone-Hosting, Zone-Transfer und Anycast-DNS-Betrieb.

CHE CC-517 betreibt zwei autoritative Nameserver (ns1.core.ndp.che, ns2.core.ndp.che) für die Zone core.ndp.che sowie einen Anycast Root DNS Server (root-ns.core.ndp.che).

---

## Service Functions

| ID | Service Function | Beschreibung | Requirements | Tests |
|----|-----------------|-------------|-------------|-------|
| SFN-TIN26 | DNS Query (Authoritative) | DNS-Query-Beantwortung durch autoritative Nameserver | [Requirements](service-functions/SFN-TIN26-dns-query/README.md) | 23 Auto, 23 Manuell |
| SFN-TIN370 | DNS Root Zone Hosting | Hosting und Signierung der Root-Zone | [Requirements](service-functions/SFN-TIN370-dns-root/README.md) | 6 Auto, 6 Manuell |
| SFN-TIN43 | DNS Zone Transfer | Zone-Synchronisation via AXFR/TSIG | [Requirements](service-functions/SFN-TIN43-zone-transfer/README.md) | 3 Auto, 3 Manuell |
| SFN-TIN114 | Anycast DNS Advertising | Anycast-basierte DNS-Verfügbarkeit | [Requirements](service-functions/SFN-TIN114-anycast-dns/README.md) | 3 Auto, 3 Manuell |

---

## Produkte

| Produkt | Version | Lizenz |
|---------|---------|--------|
| BIND9 | 9.18.x | Mozilla Public License 2.0 |
| Bird2 | 2.0.x | GNU GPL v2 |

---

## Abhängigkeiten

| Von | Nach | Typ | Beschreibung |
|-----|------|-----|-------------|
| SVC-AUTH | Service Instructions for Communications | Voraussetzung | TCP/UDP:53 Kommunikation |
| SVC-AUTH | Service Instructions for Distributed Time | Voraussetzung | Zeitsynchronisation für DNSSEC |
| SFN-TIN26 | SFN-TIN370 | Voraussetzung | DNS Query benötigt Root-Zone |
| SFN-TIN114 | SFN-TIN43 | Voraussetzung | Anycast synchronisiert via Zone Transfer |

---

## Quelldokumente

- FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023
- CWIX26 CHE CC517 FMNCS Configuration Form for Domain Naming
