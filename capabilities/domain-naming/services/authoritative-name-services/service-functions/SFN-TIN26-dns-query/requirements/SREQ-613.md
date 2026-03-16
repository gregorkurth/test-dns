# SREQ-613: Zwei unabhängige Nameserver pro delegierter Zone

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-613 |
| **Typ** | Verfügbarkeit / Redundanz |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN26 – DNS Query (Authoritative) |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 16 |
| **Kapitel** | 5.1.1 (TIN-26) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Authoritative Name Services shall support the provision of two independent name servers for each delegated zone.

## Anforderungstext (Deutsch)

Die Authoritative Name Services müssen für jede delegierte Zone mindestens zwei unabhängige Nameserver bereitstellen. Die Nameserver müssen physisch und logisch voneinander unabhängig sein, um Single Points of Failure zu vermeiden.

---

## Kontext

Zwei unabhängige Nameserver pro Zone sind eine grundlegende Anforderung für Ausfallsicherheit im DNS. RFC 1035 empfiehlt mindestens zwei NS-Server; FMN macht dies zur Pflicht. Im CHE CC-517-Kontext sind dies ns1.core.ndp.che und ns2.core.ndp.che, die auf separater Hardware oder in separaten Verfügbarkeitszonen betrieben werden müssen.

---

## Akzeptanzkriterien

1. Für jede delegierte Zone sind mindestens zwei NS-Records konfiguriert.
2. Die beiden Nameserver sind auf unterschiedlichen Hosts (unterschiedliche IP-Adressen) erreichbar.
3. Bei Ausfall eines Nameservers beantwortet der zweite weiterhin alle DNS-Queries korrekt.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-1314 | Verwandt | Beide NS müssen gleichen NS-Record-Set liefern |
| SREQ-1315 | Verwandt | Beide NS müssen gleichen SOA-Record liefern |
| CREQ-002 | Verwandt | CHE-spezifisch: ns1.core.ndp.che und ns2.core.ndp.che |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-613-001](../tests/auto/TEST-SREQ-613-001.md) | Automatisch (pytest) |
| [TEST-SREQ-613-001-manual](../tests/manual/TEST-SREQ-613-001-manual.md) | Manuell |
