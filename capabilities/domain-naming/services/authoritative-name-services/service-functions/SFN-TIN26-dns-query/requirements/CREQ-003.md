# CREQ-003: Resolver rs1.core.ndp.che und rs2.core.ndp.che

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | CREQ-003 |
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

> Resolvers: rs1.core.ndp.che and rs2.core.ndp.che

## Anforderungstext (Deutsch)

Die rekursiven Resolver des CHE NDP CORE müssen unter den FQDNs `rs1.core.ndp.che` und `rs2.core.ndp.che` erreichbar sein. Beide Resolver müssen als DNS-Resolver für MN-Clients konfiguriert und operativ sein.

---

## Kontext

Dies ist die CHE-spezifische Konfiguration für die zwei rekursiven Resolver, die MN-Clients für die DNS-Auflösung verwenden. Die FQDNs sind im CWIX 2026 Configuration Form festgelegt. Die Resolver (Unbound) sind getrennt von den autoritativen Nameservern (BIND9) betrieben.

---

## Akzeptanzkriterien

1. DNS-Resolver-Anfragen an `rs1.core.ndp.che` werden erfolgreich beantwortet.
2. DNS-Resolver-Anfragen an `rs2.core.ndp.che` werden erfolgreich beantwortet.
3. A-Records für beide Resolver sind in der Zone `core.ndp.che` konfiguriert.
4. Die Resolver sind als separate Unbound-Instanzen von den autoritativen BIND9-Servern betrieben.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SFN-RESOLV-QUERY | Verwandt | Resolver-Service-Function für rekursive Auflösung |
| CREQ-001 | Voraussetzung | Zone core.ndp.che muss konfiguriert sein für A-Records der Resolver |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-CREQ-003-001](../tests/auto/TEST-CREQ-003-001.md) | Automatisch (pytest) |
| [TEST-CREQ-003-001-manual](../tests/manual/TEST-CREQ-003-001-manual.md) | Manuell |
