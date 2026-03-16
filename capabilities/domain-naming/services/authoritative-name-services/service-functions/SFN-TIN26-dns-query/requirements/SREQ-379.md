# SREQ-379: Unsignierte Zonen delegieren können

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-379 |
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

> The Authoritative Name Services shall be able to delegate unsigned zones.

## Anforderungstext (Deutsch)

Die Authoritative Name Services müssen in der Lage sein, unsignierte Zonen zu delegieren. Nicht alle MNPs oder Subzonen müssen DNSSEC implementiert haben; die Delegation muss auch ohne DS-Record im Parent möglich sein.

---

## Kontext

Im föderativen Netz befinden sich verschiedene MNPs auf unterschiedlichen Reifegraden bezüglich DNSSEC. Eine signierte übergeordnete Zone muss auch unsignierte Subzonen delegieren können, ohne die eigene DNSSEC-Integrität zu verletzen. In DNSSEC-Terminologie bedeutet dies, dass kein DS-Record für die unsignierte Subdelegation vorhanden ist (Opt-Out).

---

## Akzeptanzkriterien

1. Eine signierte Zone kann Subzonen delegieren, für die kein DS-Record vorhanden ist.
2. Die Delegation unsignierter Subzonen erzeugt keine DNSSEC-Validierungsfehler.
3. Resolver können unsignierte Subdelegationen ohne Validierungsfehler auflösen.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-380 | Verwandt | Signierung von Subdomains delegieren ist das Gegenstück |
| SREQ-382 | Voraussetzung | Signierte Zonen bedienen ist Voraussetzung für Delegation |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-379-001](../tests/auto/TEST-SREQ-379-001.md) | Automatisch (pytest) |
| [TEST-SREQ-379-001-manual](../tests/manual/TEST-SREQ-379-001-manual.md) | Manuell |
