# SREQ-238: Mindest-Record-Typen unterstützen (SOA, NS, A)

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-238 |
| **Typ** | Funktional |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN26 – DNS Query (Authoritative) |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 16 |
| **Kapitel** | 5.1.1 (TIN-26) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Domain Name Service must support, at a minimum, the SOA-record, NS-record and A-record matching to the NS-records.

## Anforderungstext (Deutsch)

Der Domain Name Service muss mindestens folgende DNS-Record-Typen unterstützen: SOA-Record (Start of Authority), NS-Record (Name Server) sowie A-Record (IPv4-Adresse), wobei der A-Record mit den NS-Records übereinstimmen muss.

---

## Kontext

SOA-, NS- und A-Records sind die grundlegenden Bausteine jeder DNS-Zone. Ohne SOA ist eine Zone ungültig; ohne NS-Records ist keine Delegation möglich; ohne A-Records für Nameserver können Resolver die Nameserver nicht kontaktieren (Glue Records). Diese Anforderung stellt die minimale Interoperabilität zwischen allen MNPs sicher.

---

## Akzeptanzkriterien

1. Der Nameserver liefert korrekte SOA-Records für alle konfigurierten Zonen.
2. NS-Records sind für alle Zonen konfiguriert und werden korrekt zurückgegeben.
3. Für jeden NS-Record existiert ein korrespondierender A-Record (Glue Record, falls im Parent-Domain).

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-1311 | Verwandt | Glue-IP-Adressen müssen mit autoritativen A-Records übereinstimmen |
| SREQ-239 | Verwandt | Reverse-Zonen mit PTR-Records ergänzen die A-Records |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-238-001](../tests/auto/TEST-SREQ-238-001.md) | Automatisch (pytest) |
| [TEST-SREQ-238-001-manual](../tests/manual/TEST-SREQ-238-001-manual.md) | Manuell |
