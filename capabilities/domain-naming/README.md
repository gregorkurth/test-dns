# Capability: Domain Naming

> **Capability ID:** CAP-001
> **NATO C3 Taxonomie:** Communication and Information Services > Domain Naming Services
> **FMN-Referenz:** FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023
> **Maturität:** L0 – Idea (Stand: 2026-03-16)

---

## Beschreibung

Die Domain Naming Capability stellt DNS-Dienste für föderierte Mission Networks bereit. Sie umfasst autoritative Namensauflösung, rekursive Resolving-Services, DNSSEC-gesicherte Zonen und Anycast-basierte Root-Zone-Verfügbarkeit gemäss FMN Spiral 5.

Die Capability ermöglicht es FMN-Affiliates, eine unabhängige und robuste DNS-Infrastruktur zu betreiben, die interoperabel mit allen Mission Network Participants (MNPs) ist. Das CHE NDP CORE (CC-517) betreibt die Capability als Provider im Rahmen von CWIX 2026.

---

## Services

| ID | Service | Beschreibung | Spec |
|----|---------|-------------|------|
| SVC-AUTH | Authoritative Name Services | Betrieb autoritativer DNS-Server mit Zonen-Management | [README](services/authoritative-name-services/README.md) |
| SVC-RESOLV | Recursive Resolving Services | Rekursive DNS-Auflösung für MN-Teilnehmer | [README](services/recursive-resolving-services/README.md) |
| SVC-LOG | DNS Security & Logging | Sicherheitslogging und Auditierung | [README](services/dns-security-logging/README.md) |

---

## Service Functions

| SFN-ID | Service Function | Service | Quelle |
|--------|-----------------|---------|--------|
| SFN-TIN26 | DNS Query (Authoritative) | SVC-AUTH | FMN SP5 SI Domain Naming, TIN-26 |
| SFN-TIN370 | DNS Root Zone Hosting | SVC-AUTH | FMN SP5 SI Domain Naming, TIN-370 |
| SFN-TIN43 | DNS Zone Transfer | SVC-AUTH | FMN SP5 SI Domain Naming, TIN-43 |
| SFN-TIN114 | Anycast DNS Advertising | SVC-AUTH | FMN SP5 SI Domain Naming, TIN-114 |
| SFN-RESOLV-QUERY | Recursive DNS Resolution | SVC-RESOLV | FMN SP5 SI Domain Naming, TIN-26 (Consumer) |
| SFN-RESOLV-DNSSEC | DNSSEC Validation | SVC-RESOLV | FMN SP5 SI Domain Naming, Annex B |
| SFN-DNS-LOGGING | DNS Security & Event Logging | SVC-LOG | FMN SP5 SI Domain Naming, Annex B |

---

## Abhängigkeiten

| DPD-ID | Abhängigkeit | Typ | Beschreibung |
|--------|-------------|-----|-------------|
| DPD-DNS-001 | OBJ-4 Capabilities Dashboard | Nutzer | CAP-001 wird im Dashboard als navigierbare Capability-Hierarchie fuer Operatoren sichtbar gemacht |
| IDP-191 | Service Instructions for Communications (TIN-112) | Voraussetzung | DNS benötigt Kommunikationsdienste für Queries (TCP/UDP:53) |
| IDP-194 | Service Instructions for Distributed Time (TIN-20) | Voraussetzung | DNSSEC benötigt Zeitsynchronisation für Zeitstempel in signierten Zonen |
| IDP-1118 | DNS Root (TIN-370) | Voraussetzung | DNS Query benötigt DNS Root für rekursive Auflösung |
| IDP-222 | Anycast DNS Advertising (TIN-114) | Voraussetzung | Authoritative NS können Anycast für robusteres Design verwenden |
| IDP-223 | DNS Root Zone Transfer (TIN-43) | Voraussetzung | Anycast DNS nutzt Zone Transfer zur Synchronisation |

> **Typ:** `Voraussetzung` = Diese Capability braucht die andere | `Nutzer` = Andere nutzen diese Capability

---

## Konfiguration (CHE CC-517)

| Parameter | Wert | Quelle |
|-----------|------|--------|
| Participant | CHE NDP CORE 2026 1.0 (CC-517) | [CUST] |
| Delegated Zones | core.ndp.che, 109.x.x.in-addr.arpa | [CUST] |
| NS1 FQDN | ns1.core.ndp.che | [CUST] |
| NS2 FQDN | ns2.core.ndp.che | [CUST] |
| Resolver 1 | rs1.core.ndp.che | [CUST] |
| Resolver 2 | rs2.core.ndp.che | [CUST] |
| Anycast Root DNS | root-ns.core.ndp.che | [CUST] |
| FMN Spiral | SP4 | [CUST] |

---

## Links

- [Maturity Status](maturity.md)
- [Products & Licenses](products.md)
- [FMN SP5 SI Domain Naming](../../req-init/Final_FMN_Spiral_5_Service_Instructions_for_Domain_Naming.pdf)
- [CHE CC-517 Configuration Form](../../req-init/CWIX26_CHE_CC517_FMNCS_Configuration_Form_for_Domain_Naming.docx)
- [Platform Architecture Model](../../req-init/Platform_Architecture_to_Engineering_Delivery_Model.docx)
