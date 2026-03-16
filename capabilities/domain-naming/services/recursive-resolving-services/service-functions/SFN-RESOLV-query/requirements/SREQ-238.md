# SREQ-238: Mindest-Record-Typen unterstützen (SOA, NS, A) – Consumer-Seite

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-238 |
| **Typ** | Funktional |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-RESOLV-QUERY – Recursive DNS Resolution |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 17 |
| **Kapitel** | 5.1.1 (TIN-26, Consumer-Seite) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Domain Name Service must support, at a minimum, the SOA-record, NS-record and A-record matching to the NS-records.

## Anforderungstext (Deutsch)

Der rekursive Resolver muss mindestens SOA-, NS- und A-Records verarbeiten und in Antworten an Clients zurückgeben können. Dies gilt für die Consumer-Seite des DNS-Query-Austauschs.

---

## Kontext

Diese Anforderung gilt auch für den Resolver (Consumer-Seite des TIN-26). Der Resolver muss diese Record-Typen korrekt verarbeiten, cachen und an Clients weitergeben. Ohne korrekte Verarbeitung von NS-Records kann keine iterative Auflösung stattfinden.

---

## Akzeptanzkriterien

1. Der Resolver verarbeitet SOA-Records korrekt und cacht sie entsprechend der TTL.
2. NS-Records werden für die iterative Auflösung verwendet.
3. A-Records für Nameserver werden korrekt aufgelöst und gecacht.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-615 | Verwandt | Keine Forwarder – iterative Auflösung via NS-Records |
| SFN-TIN370 | Voraussetzung | Root-Zone liefert initiale NS-Records |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-238-RESOLV-001](../tests/auto/TEST-SREQ-238-RESOLV-001.md) | Automatisch (pytest) |
| [TEST-SREQ-238-RESOLV-001-manual](../tests/manual/TEST-SREQ-238-RESOLV-001-manual.md) | Manuell |
