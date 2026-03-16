# SREQ-235: Country Code Top-Level-Domains unterstützen

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-235 |
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

> The Domain Name Service shall support country code top level domains.

## Anforderungstext (Deutsch)

Der Domain Name Service muss Country Code Top-Level-Domains (ccTLDs) unterstützen. Im FMN-Kontext entspricht dies nationalen Kürzeln wie `.che`, `.deu`, `.fra` usw., die als TLDs in der MN-Root-Zone delegiert werden.

---

## Kontext

Im föderativen Mission Network erhält jeder Teilnehmer (MNP) eine eigene Country Code TLD, die der jeweiligen Nation entspricht (ISO 3166-1 Alpha-3 oder NATO-Kürzel). Diese ccTLDs werden in der gemeinsamen Root-Zone delegiert. Der DNS-Service muss in der Lage sein, diese Zonen zu hosten und korrekt zu beantworten.

---

## Akzeptanzkriterien

1. Der autoritative Nameserver ist für mindestens eine ccTLD konfiguriert (z. B. `.che`).
2. Subzonen unterhalb der ccTLD (z. B. `core.ndp.che`) sind delegierbar.
3. Queries für die ccTLD und ihre Subzonen werden korrekt beantwortet.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-234 | Verwandt | Mission-TLDs und ccTLDs sind beide in der Root-Zone zu delegieren |
| CREQ-001 | Verwandt | CHE-spezifische ccTLD-Zone: core.ndp.che |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-235-001](../tests/auto/TEST-SREQ-235-001.md) | Automatisch (pytest) |
| [TEST-SREQ-235-001-manual](../tests/manual/TEST-SREQ-235-001-manual.md) | Manuell |
