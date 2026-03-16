# SREQ-614: Delegation von Reverse-Lookup-Zonen für IPv4-Präfixe auf 8-Bit-Grenzen

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-614 |
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

> The Authoritative Name Services shall allow delegation of reverse lookup zones of IPv4 prefixes that align on full 8 bits.

## Anforderungstext (Deutsch)

Die Authoritative Name Services müssen die Delegation von Reverse-Lookup-Zonen für IPv4-Präfixe erlauben, die auf vollen 8-Bit-Grenzen ausgerichtet sind. Das bedeutet, Delegationen auf /8-, /16- und /24-Grenzen (entsprechend x.in-addr.arpa, x.y.in-addr.arpa, x.y.z.in-addr.arpa).

---

## Kontext

Im Mission Network werden IPv4-Adressbereiche auf Klassen-Grenzen (/8, /16, /24) an einzelne MNPs delegiert. Die Reverse-Delegation muss dieser Aufteilung folgen. Eine Delegation auf halben Oktetten (z. B. /20) ist nicht gefordert. CHE CC-517 betreibt 109.x.x.in-addr.arpa als /16- oder /24-Zone.

---

## Akzeptanzkriterien

1. Reverse-Zonen können auf /8-, /16- und /24-Präfixgrenzen delegiert werden.
2. Delegations-NS-Records für die Reverse-Zone sind korrekt konfiguriert.
3. PTR-Queries für die delegierten IP-Bereiche werden korrekt an den zuständigen NS weitergeleitet.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-239 | Voraussetzung | Reverse-Zonen müssen grundsätzlich unterstützt werden |
| CREQ-001 | Verwandt | CHE-Reverse-Zone: 109.x.x.in-addr.arpa |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-614-001](../tests/auto/TEST-SREQ-614-001.md) | Automatisch (pytest) |
| [TEST-SREQ-614-001-manual](../tests/manual/TEST-SREQ-614-001-manual.md) | Manuell |
