# SREQ-609: Anycast mit konfigurierbarer Adresse unterstützen

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-609 |
| **Typ** | Funktional / Verfügbarkeit |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN114 – Anycast DNS Advertising |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 26 |
| **Kapitel** | 5.1.4 (TIN-114) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Domain Name Service shall support anycast with a configurable address.

## Anforderungstext (Deutsch)

Der Domain Name Service muss Anycast mit einer konfigurierbaren IP-Adresse unterstützen. Die Anycast-Adresse muss frei konfigurierbar sein und darf nicht fest im System verankert sein.

---

## Kontext

Anycast ermöglicht es, dieselbe IP-Adresse von mehreren physischen Servern anzubieten. Clients verbinden sich immer mit dem nächstgelegenen Server (gemäss BGP-Routing). Im FMN-Kontext wird Anycast für Root-DNS-Server eingesetzt, um höhere Verfügbarkeit und geringere Latenz zu erreichen. Die Anycast-Adresse wird via BGP bekanntgemacht (Bird2).

---

## Akzeptanzkriterien

1. Eine Anycast-IP-Adresse ist auf dem Loopback-Interface des Nameservers konfiguriert.
2. BIND9 lauscht auf der konfigurierten Anycast-IP-Adresse.
3. Die Anycast-Adresse kann in der Konfiguration geändert werden, ohne den Service neu zu kompilieren.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-610 | Folgend | Anycast-Anfragen über Anycast-Adresse beantworten |
| SREQ-611 | Verwandt | Ausgehende Queries über Unicast-Adresse (nicht Anycast) |
| CREQ-005 | Verwandt | CHE-spezifische Anycast-Konfiguration |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-609-001](../tests/auto/TEST-SREQ-609-001.md) | Automatisch (pytest) |
| [TEST-SREQ-609-001-manual](../tests/manual/TEST-SREQ-609-001-manual.md) | Manuell |
