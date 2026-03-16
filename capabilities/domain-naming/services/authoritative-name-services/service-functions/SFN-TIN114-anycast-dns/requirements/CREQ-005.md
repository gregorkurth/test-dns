# CREQ-005: Anycast Root DNS aktiviert – root-ns.core.ndp.che

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | CREQ-005 |
| **Typ** | Konfiguration |
| **Quelle** | [CUST] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN114 – Anycast DNS Advertising |
| **Quelldokument** | CWIX26 CHE CC517 FMNCS Configuration Form for Domain Naming |
| **Seite** | – |
| **Kapitel** | – |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Anycast Root DNS Services activated. Unicast IP for Anycast Server assigned. FQDN: root-ns.core.ndp.che

## Anforderungstext (Deutsch)

Der Anycast Root DNS Service des CHE NDP CORE ist aktiviert. Eine dedizierte Unicast-IP-Adresse ist dem Anycast-Server zugewiesen. Der Anycast-Server ist unter dem FQDN `root-ns.core.ndp.che` erreichbar und betreibt den Root-DNS-Service über Anycast.

---

## Kontext

Dies ist die CHE-spezifische Konfigurationsanforderung für den Anycast Root DNS. Bird2 kündigt die Anycast-Adresse via BGP im MN-Routing an. BIND9 lauscht auf der Anycast-Adresse. Der FQDN `root-ns.core.ndp.che` ist in der Root-Zone eingetragen. Eine separate Unicast-Adresse dient für Management und ausgehende Verbindungen (gemäss SREQ-611).

---

## Akzeptanzkriterien

1. Anycast Root DNS Service ist aktiv und erreichbar über die Anycast-Adresse.
2. Bird2 kündigt die Anycast-Adresse via BGP korrekt an.
3. Der FQDN `root-ns.core.ndp.che` löst auf die Anycast-IP auf.
4. Bei Ausfall des Nameservers wird die Anycast-Route via BGP zurückgezogen.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-609 | Voraussetzung | Anycast mit konfigurierbarer Adresse |
| SREQ-610 | Voraussetzung | Antworten über Anycast-Adresse |
| CREQ-004 | Verwandt | Root-Zone mit Anycast-Server in SFN-TIN370 |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-CREQ-005-001](../tests/auto/TEST-CREQ-005-001.md) | Automatisch (pytest) |
| [TEST-CREQ-005-001-manual](../tests/manual/TEST-CREQ-005-001-manual.md) | Manuell |
