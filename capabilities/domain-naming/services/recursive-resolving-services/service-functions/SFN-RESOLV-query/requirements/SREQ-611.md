# SREQ-611: Konfigurierte Unicast-IP für ausgehende Queries (Resolver)

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-611 |
| **Typ** | Funktional / Netzwerk |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-RESOLV-QUERY – Recursive DNS Resolution |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 17 |
| **Kapitel** | 5.1.1 (TIN-26) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Domain Name Service shall use a configured unicast IP-address when queries are made to other servers.

## Anforderungstext (Deutsch)

Der rekursive Resolver muss eine konfigurierte Unicast-IP-Adresse verwenden, wenn Anfragen an autoritative Nameserver gestellt werden. Die ausgehende Source-IP des Resolvers muss konfigurierbar und stabil sein.

---

## Kontext

Analog zur autoritativen Seite (SFN-TIN26) gilt diese Anforderung auch für den Resolver. Der Resolver (Unbound) sendet iterative Anfragen an autoritative Nameserver. Diese Anfragen müssen von einer bekannten, konfigurierten Unicast-Adresse stammen, damit die autoritativen Nameserver ACLs und Sicherheitsregeln korrekt anwenden können.

---

## Akzeptanzkriterien

1. Unbound ist mit einer spezifischen Unicast-IP als ausgehende Adresse konfiguriert (`outgoing-interface`).
2. Iterative Anfragen an autoritative Nameserver verwenden die konfigurierte Unicast-Adresse.
3. Die konfigurierte Adresse ist nicht die Anycast-Adresse des Root-Servers.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-609 | Verwandt | Anycast-Adresse ist explizit ausgenommen für ausgehende Queries |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-611-RESOLV-001](../tests/auto/TEST-SREQ-611-RESOLV-001.md) | Automatisch (pytest) |
| [TEST-SREQ-611-RESOLV-001-manual](../tests/manual/TEST-SREQ-611-RESOLV-001-manual.md) | Manuell |
