# CREQ-004: Anycast Root DNS – root-ns.core.ndp.che

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | CREQ-004 |
| **Typ** | Konfiguration |
| **Quelle** | [CUST] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN370 – DNS Root Zone Hosting |
| **Quelldokument** | CWIX26 CHE CC517 FMNCS Configuration Form for Domain Naming |
| **Seite** | – |
| **Kapitel** | – |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Anycast Root DNS Services: Yes. Anycast Server FQDN: root-ns.core.ndp.che

## Anforderungstext (Deutsch)

Der CHE NDP CORE (CC-517) betreibt Anycast Root DNS Services. Der Anycast Root DNS Server ist unter dem FQDN `root-ns.core.ndp.che` erreichbar. Der Anycast-Service muss konfiguriert und operativ sein.

---

## Kontext

Dies ist die CHE-spezifische Konfigurationsanforderung aus dem CWIX 2026 Configuration Form. Der Anycast Root DNS Server dient als robuste, hochverfügbare Anlaufstelle für die Root-Zone. Die Anycast-Adresse wird via BGP bekanntgemacht (Bird2) und der FQDN `root-ns.core.ndp.che` ist in der Root-Zone konfiguriert.

---

## Akzeptanzkriterien

1. Der FQDN `root-ns.core.ndp.che` ist in der Root-Zone als NS-Record konfiguriert.
2. Der Anycast-Server beantwortet DNS-Queries für die Root-Zone über die Anycast-Adresse.
3. Die Anycast-Adresse wird via BGP (Bird2) korrekt bekanntgemacht.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-242 | Voraussetzung | Root-Zone muss bereitgestellt werden |
| CREQ-005 | Verwandt | Anycast-Konfiguration in SFN-TIN114 |
| SFN-TIN114 | Verwandt | Anycast DNS Advertising Service Function |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-CREQ-004-001](../tests/auto/TEST-CREQ-004-001.md) | Automatisch (pytest) |
| [TEST-CREQ-004-001-manual](../tests/manual/TEST-CREQ-004-001-manual.md) | Manuell |
