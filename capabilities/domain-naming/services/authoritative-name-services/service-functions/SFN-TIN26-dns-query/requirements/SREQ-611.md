# SREQ-611: Konfigurierte Unicast-IP für ausgehende Queries verwenden

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-611 |
| **Typ** | Funktional / Netzwerk |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN26 – DNS Query (Authoritative) |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 17 |
| **Kapitel** | 5.1.1 (TIN-26) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Domain Name Service shall use a configured unicast IP-address when queries are made to other servers.

## Anforderungstext (Deutsch)

Der Domain Name Service muss eine konfigurierte Unicast-IP-Adresse verwenden, wenn Anfragen an andere Server gestellt werden. Dies stellt sicher, dass ausgehende DNS-Queries immer von einer bekannten, konfigurierten Adresse stammen und nicht von einer Anycast-Adresse.

---

## Kontext

Im Anycast-Umfeld können mehrere IP-Adressen auf einem Server konfiguriert sein. Ausgehende Queries an andere autoritative Server (z. B. für Delegation) müssen von einer stabilen Unicast-Adresse stammen, damit Antworten korrekt zugestellt werden können und ACLs auf der Gegenseite greifen. Diese Anforderung verhindert, dass Anycast-Adressen für ausgehende Verbindungen verwendet werden.

---

## Akzeptanzkriterien

1. In der BIND9-Konfiguration ist eine spezifische Unicast-IP als Query-Source konfiguriert (`query-source address`).
2. Ausgehende DNS-Queries (z. B. NOTIFY, Zone-Transfer) verwenden die konfigurierte Unicast-Adresse als Source-IP.
3. Die Anycast-Adresse wird nicht für ausgehende Verbindungen zu anderen Servern verwendet.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-609 | Verwandt | Anycast-Adresse muss konfigurierbar sein (separates Interface) |
| SREQ-1317 | Verwandt | Source-IP bei Nicht-Anycast-Antworten |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-611-001](../tests/auto/TEST-SREQ-611-001.md) | Automatisch (pytest) |
| [TEST-SREQ-611-001-manual](../tests/manual/TEST-SREQ-611-001-manual.md) | Manuell |
