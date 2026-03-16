# SREQ-309: Logs müssen Details zu fehlgeschlagenen Anfragen enthalten

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-309 |
| **Typ** | Sicherheit / Betrieb |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-DNS-LOGGING – DNS Security & Event Logging |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, Annex B, 23 November 2023 |
| **Seite** | 36 |
| **Kapitel** | Annex B (Enterprise-level Requirements) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Event logs shall include details of failed requests.

## Anforderungstext (Deutsch)

Event-Logs müssen Details zu fehlgeschlagenen DNS-Anfragen enthalten. Details umfassen: Zeitstempel, Quell-IP und -Port, Ziel-IP und -Port, angefragter FQDN, Query-Typ (A, AAAA, MX usw.), Fehlercode (SERVFAIL, REFUSED, NXDOMAIN usw.).

---

## Kontext

Fehlgeschlagene DNS-Anfragen können auf verschiedene Ursachen hinweisen: falsch konfigurierte Clients, Konfigurationsfehler im DNS, Sicherheitsvorfälle (z. B. DNS-Amplification, DNS-Tunneling), oder Netzwerkprobleme. Detaillierte Logs ermöglichen schnelle Diagnose und forensische Analyse. Im Mission Network sind präzise Logs für Incident Response unerlässlich.

---

## Akzeptanzkriterien

1. Log-Einträge für fehlgeschlagene Anfragen enthalten: Zeitstempel, Quell-IP, Query-Name, Query-Typ, Fehlercode.
2. BIND9-Logging-Kanal `queries` oder äquivalent ist konfiguriert.
3. Logs zeigen unterschiedliche Fehlercodes für SERVFAIL, REFUSED und NXDOMAIN.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-53 | Voraussetzung | Grundlegendes Logging muss aktiviert sein |
| SREQ-54 | Übergeordnet | Fehlgeschlagene Anfragen als Pflicht-Ereignistyp |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-309-001](../tests/auto/TEST-SREQ-309-001.md) | Automatisch (pytest) |
| [TEST-SREQ-309-001-manual](../tests/manual/TEST-SREQ-309-001-manual.md) | Manuell |
