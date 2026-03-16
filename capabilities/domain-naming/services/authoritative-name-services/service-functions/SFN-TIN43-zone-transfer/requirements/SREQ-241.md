# SREQ-241: Zonen-Updates via Zone Transfer unterstützen

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-241 |
| **Typ** | Funktional |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN43 – DNS Zone Transfer |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 22 |
| **Kapitel** | 5.1.3 (TIN-43) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Domain Name Service must support zone updates via zone transfers.

## Anforderungstext (Deutsch)

Der Domain Name Service muss Zonen-Updates via Zone Transfers unterstützen. Zone Transfers ermöglichen die Synchronisation von Zone-Daten zwischen primären und sekundären Nameservern (AXFR für vollständige Transfers, IXFR für inkrementelle Transfers).

---

## Kontext

Zone Transfers sind der Standardmechanismus in DNS zur Synchronisation von Zone-Daten zwischen Primary- und Secondary-Nameservern. AXFR (Full Transfer) überträgt die gesamte Zone, IXFR (Incremental Transfer) nur Änderungen. Beide müssen unterstützt werden, um Konsistenz zwischen den Nameservern sicherzustellen.

---

## Akzeptanzkriterien

1. AXFR-Zone-Transfers zwischen primärem und sekundärem Nameserver funktionieren fehlerfrei.
2. IXFR-Zone-Transfers für inkrementelle Updates werden unterstützt.
3. Nach einem Zone Transfer ist der sekundäre Nameserver mit dem primären synchronisiert (SOA-Serial gleich).

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-529 | Folgend | Zone Transfers müssen mit TSIG gesichert sein |
| SREQ-1313 | Verwandt | Datenkonsistenz als Ziel des Zone Transfers |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-241-001](../tests/auto/TEST-SREQ-241-001.md) | Automatisch (pytest) |
| [TEST-SREQ-241-001-manual](../tests/manual/TEST-SREQ-241-001-manual.md) | Manuell |
