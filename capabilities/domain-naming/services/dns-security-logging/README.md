# Service: DNS Security & Logging

> **Service ID:** SVC-LOG
> **Capability:** Domain Naming (CAP-001)
> **Quelldokument:** FMN Spiral 5 Service Instructions for Domain Naming, Annex B, 23 November 2023

---

## Beschreibung

Der DNS Security & Logging Service stellt sicher, dass alle sicherheitsrelevanten DNS-Ereignisse protokolliert und auditierbar sind. Dies umfasst Zone Transfers, fehlgeschlagene Anfragen, Zonenmodifikationen und DNSSEC-Validierungsfehler.

---

## Service Functions

| ID | Service Function | Beschreibung | Requirements | Tests |
|----|-----------------|-------------|-------------|-------|
| SFN-DNS-LOGGING | DNS Security & Event Logging | Logging aller sicherheitsrelevanten DNS-Ereignisse | [Requirements](service-functions/SFN-DNS-LOGGING/README.md) | 4 Auto, 4 Manuell |

---

## Produkte

| Produkt | Version | Lizenz |
|---------|---------|--------|
| BIND9 | 9.18.x | Mozilla Public License 2.0 |
| Unbound | 1.19.x | BSD 3-Clause |

---

## Quelldokumente

- FMN Spiral 5 Service Instructions for Domain Naming, Annex B (Enterprise-level Requirements)
