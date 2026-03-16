# CREQ-002: Nameserver ns1.core.ndp.che und ns2.core.ndp.che

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | CREQ-002 |
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

> Name servers: ns1.core.ndp.che and ns2.core.ndp.che

## Anforderungstext (Deutsch)

Die autoritativen Nameserver für die Zonen des CHE NDP CORE müssen unter den FQDNs `ns1.core.ndp.che` und `ns2.core.ndp.che` erreichbar sein. Beide Nameserver müssen konfiguriert und operativ sein.

---

## Kontext

Dies ist die CHE-spezifische Namensgebung für die zwei obligatorischen Nameserver gemäss SREQ-613. Die FQDNs sind im CWIX 2026 Configuration Form festgelegt und müssen in der FMN-Root-Zone als NS-Records für die Zone `core.ndp.che` delegiert werden.

---

## Akzeptanzkriterien

1. DNS-Queries an `ns1.core.ndp.che` werden erfolgreich beantwortet.
2. DNS-Queries an `ns2.core.ndp.che` werden erfolgreich beantwortet.
3. NS-Records für `core.ndp.che` zeigen auf `ns1.core.ndp.che` und `ns2.core.ndp.che`.
4. A-Records für beide Nameserver sind in der Zone konfiguriert.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-613 | Voraussetzung | Zwei unabhängige NS pro delegierter Zone |
| CREQ-001 | Verwandt | Zonen, die von diesen NS bedient werden |
| SREQ-1311 | Verwandt | Glue-IPs müssen mit autoritativen A-Records übereinstimmen |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-CREQ-002-001](../tests/auto/TEST-CREQ-002-001.md) | Automatisch (pytest) |
| [TEST-CREQ-002-001-manual](../tests/manual/TEST-CREQ-002-001-manual.md) | Manuell |
