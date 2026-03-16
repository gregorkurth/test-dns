# SREQ-616: Keine rekursiven DNS-Queries unterstützen

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-616 |
| **Typ** | Sicherheit / Funktional |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN26 – DNS Query (Authoritative) |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 16 |
| **Kapitel** | 5.1.1 (TIN-26) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Authoritative Name Services shall not support Recursive DNS Queries.

## Anforderungstext (Deutsch)

Die Authoritative Name Services dürfen keine rekursiven DNS-Queries unterstützen. Autoritative Nameserver antworten nur auf Anfragen für Zonen, für die sie autoritativ sind, und leiten keine Anfragen für fremde Zonen iterativ auf.

---

## Kontext

Rekursion auf autoritativen Servern stellt ein Sicherheitsrisiko dar (DNS-Amplification-Angriffe) und widerspricht dem Prinzip der Trennung von autoritativem und rekursivem DNS. Im FMN-Design sind autoritative Nameserver und rekursive Resolver klar getrennt. BIND9 muss mit `recursion no;` konfiguriert sein.

---

## Akzeptanzkriterien

1. Der autoritative Nameserver ist mit `recursion no;` konfiguriert.
2. Rekursive Queries (RD-Flag gesetzt) werden mit REFUSED beantwortet oder ignoriert.
3. Der Nameserver antwortet nicht als Resolver für externe Zonen.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-615 | Verwandt | Keine Forwarder; autoritative Server lösen nicht iterativ auf |
| SFN-RESOLV-QUERY | Gegensatz | Rekursive Resolver sind separat betrieben (Unbound) |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-616-001](../tests/auto/TEST-SREQ-616-001.md) | Automatisch (pytest) |
| [TEST-SREQ-616-001-manual](../tests/manual/TEST-SREQ-616-001-manual.md) | Manuell |
