# CREQ-001: Delegierte Zone core.ndp.che und Reverse-Zone

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | CREQ-001 |
| **Typ** | Konfiguration |
| **Quelle** | [CUST] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN26 – DNS Query (Authoritative) |
| **Quelldokument** | CWIX26 CHE CC517 FMNCS Configuration Form for Domain Naming |
| **Seite** | – |
| **Kapitel** | – |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Delegated Zone: core.ndp.che and 109.<che>.<che>.in-addr.arpa

## Anforderungstext (Deutsch)

Der DNS-Service des CHE NDP CORE (CC-517) muss für die delegierten Zonen `core.ndp.che` und die zugehörige Reverse-Zone `109.x.x.in-addr.arpa` autoritativ betrieben werden.

---

## Kontext

Dies ist die CHE-spezifische Konfigurationsanforderung aus dem CWIX 2026 Configuration Form. Die Zone `core.ndp.che` ist die primäre Forward-Zone des CHE NDP CORE. Die Reverse-Zone entspricht dem zugewiesenen IPv4-Adressbereich (109.x.x.x). Beide Zonen müssen konfiguriert und autoritativ bedient werden.

---

## Akzeptanzkriterien

1. Die Zone `core.ndp.che` ist in BIND9 konfiguriert und wird autoritativ bedient.
2. Die Reverse-Zone `109.x.x.in-addr.arpa` ist konfiguriert und wird autoritativ bedient.
3. SOA-, NS- und A-Records für beide Zonen sind korrekt konfiguriert.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-235 | Voraussetzung | ccTLD-Unterstützung (.che) |
| SREQ-239 | Voraussetzung | Reverse-Zonen-Unterstützung |
| CREQ-002 | Verwandt | Nameserver für diese Zonen |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-CREQ-001-001](../tests/auto/TEST-CREQ-001-001.md) | Automatisch (pytest) |
| [TEST-CREQ-001-001-manual](../tests/manual/TEST-CREQ-001-001-manual.md) | Manuell |
