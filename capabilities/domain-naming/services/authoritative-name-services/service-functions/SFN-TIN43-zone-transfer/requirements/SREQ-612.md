# SREQ-612: Hidden-Betrieb unterstützen (nicht erreichbar für normale DNS-Queries)

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-612 |
| **Typ** | Sicherheit / Verfügbarkeit |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN43 – DNS Zone Transfer |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 22 |
| **Kapitel** | 5.1.3 (TIN-43) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Authoritative Name Services shall support being hidden (not accessible for normal DNS queries) when operating as a root server.

## Anforderungstext (Deutsch)

Die Authoritative Name Services müssen den Hidden-Master-Betrieb unterstützen: Der primäre Nameserver ist für normale DNS-Queries von aussen nicht erreichbar und erscheint nicht in den NS-Records der Zone. Er ist ausschliesslich für Zone Transfers an die sekundären Nameserver zugänglich.

---

## Kontext

Ein Hidden Master ist ein Sicherheitsmuster im DNS, bei dem der primäre (schreibfähige) Nameserver nicht öffentlich sichtbar ist. Nur sekundäre Nameserver sind in den NS-Records der Zone aufgeführt und beantworten öffentliche Queries. Der Hidden Master ist nur für Zone Transfers zugänglich, was die Angriffsfläche reduziert. Besonders wichtig für Root-Server.

---

## Akzeptanzkriterien

1. Der primäre Nameserver ist nicht in den NS-Records der Zone aufgeführt.
2. Normale DNS-Queries an den Hidden Master werden abgewiesen oder nicht beantwortet.
3. Zone Transfers vom Hidden Master an sekundäre Nameserver funktionieren korrekt.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-241 | Voraussetzung | Zone Transfer vom Hidden Master muss funktionieren |
| SREQ-529 | Verwandt | Zone Transfers müssen mit TSIG gesichert sein |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-612-001](../tests/auto/TEST-SREQ-612-001.md) | Automatisch (pytest) |
| [TEST-SREQ-612-001-manual](../tests/manual/TEST-SREQ-612-001-manual.md) | Manuell |
