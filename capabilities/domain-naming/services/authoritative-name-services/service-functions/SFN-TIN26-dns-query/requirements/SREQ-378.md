# SREQ-378: Eigene Zone-Datei pro signierter Zone

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-378 |
| **Typ** | Funktional / DNSSEC |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN26 – DNS Query (Authoritative) |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 16 |
| **Kapitel** | 5.1.1 (TIN-26) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> A distinct zone file shall be created for each signed zone.

## Anforderungstext (Deutsch)

Für jede signierte Zone muss eine separate Zone-Datei erstellt werden. Mehrere Zonen dürfen nicht in einer gemeinsamen Zone-Datei zusammengefasst werden.

---

## Kontext

Die Trennung der Zone-Dateien ist wichtig für DNSSEC-Signing, da jede Zone separat signiert wird und eigene DNSKEY-, RRSIG- und NSEC-Records enthält. Eine gemeinsame Zone-Datei für mehrere Zonen würde das Signing-Verfahren verkomplizieren und fehleranfällig machen.

---

## Akzeptanzkriterien

1. Für jede konfigurierte Zone existiert eine separate Zone-Datei im Dateisystem.
2. Die BIND9-Konfiguration referenziert für jede Zone eine eigene `file`-Direktive.
3. Zone-Dateien für signierte Zonen enthalten DNSSEC-spezifische Records (DNSKEY, RRSIG).

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-382 | Voraussetzung | Signierte Zonen müssen bedient werden können |
| SREQ-525 | Verwandt | Root-Zone muss ebenfalls signiert sein |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-378-001](../tests/auto/TEST-SREQ-378-001.md) | Automatisch (pytest) |
| [TEST-SREQ-378-001-manual](../tests/manual/TEST-SREQ-378-001-manual.md) | Manuell |
