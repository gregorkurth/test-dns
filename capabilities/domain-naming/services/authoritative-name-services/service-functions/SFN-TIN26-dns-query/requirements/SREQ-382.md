# SREQ-382: Signierte Zonen bedienen können

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-382 |
| **Typ** | Funktional / DNSSEC |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN26 – DNS Query (Authoritative) |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 17 |
| **Kapitel** | 5.1.1 (TIN-26) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Domain Name Service shall be able to serve signed zones.

## Anforderungstext (Deutsch)

Der Domain Name Service muss in der Lage sein, DNSSEC-signierte Zonen zu bedienen. Das bedeutet, dass RRSIG-, DNSKEY- und NSEC/NSEC3-Records in Antworten enthalten sein müssen, wenn der Anfragende DNSSEC-Daten anfordert (DO-Bit gesetzt).

---

## Kontext

DNSSEC-fähige Zonen enthalten zusätzliche Resource Records (RRSIG für Signatur, DNSKEY für Public Key, NSEC/NSEC3 für authenticated denial of existence). Der autoritative Nameserver muss diese Records korrekt zurückgeben, wenn Clients das DNSSEC OK (DO)-Bit in ihrer Anfrage setzen.

---

## Akzeptanzkriterien

1. DNSSEC-signierte Zonen werden korrekt mit RRSIG-Records ausgeliefert (bei gesetztem DO-Bit).
2. DNSKEY-Records sind in der Zone vorhanden und werden zurückgegeben.
3. NSEC- oder NSEC3-Records werden für authenticated denial of existence zurückgegeben.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-378 | Voraussetzung | Eigene Zone-Datei pro signierter Zone |
| SREQ-525 | Verwandt | Root-Zone muss ebenfalls signiert sein |
| SREQ-1272 | Verwandt | Erlaubte Signaturalgorithmen |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-382-001](../tests/auto/TEST-SREQ-382-001.md) | Automatisch (pytest) |
| [TEST-SREQ-382-001-manual](../tests/manual/TEST-SREQ-382-001-manual.md) | Manuell |
