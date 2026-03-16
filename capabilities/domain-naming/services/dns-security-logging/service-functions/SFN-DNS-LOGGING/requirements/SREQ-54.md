# SREQ-54: Event-Logs müssen Mindest-Ereignistypen enthalten

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-54 |
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

> Event logs must register at least: zone transfers; failed requests; and zone modifications.

## Anforderungstext (Deutsch)

Event-Logs müssen mindestens folgende Ereignistypen registrieren: Zone Transfers (erfolgreich und fehlgeschlagen), fehlgeschlagene Anfragen (SERVFAIL, REFUSED, NXDOMAIN), sowie Zonenmodifikationen (Zone-Reload, nsupdate).

---

## Kontext

Diese drei Ereignistypen sind die wichtigsten aus Sicherheits- und Betriebssicht: Zone Transfers zeigen, wer wann Zonendaten abgerufen hat; fehlgeschlagene Anfragen können auf Angriffe oder Konfigurationsprobleme hinweisen; Zonenmodifikationen sind sicherheitsrelevant, da sie DNS-Antworten verändern.

---

## Akzeptanzkriterien

1. Zone Transfer-Ereignisse (AXFR/IXFR, erfolgreich und fehlgeschlagen) werden geloggt.
2. Fehlgeschlagene DNS-Anfragen (SERVFAIL, REFUSED, NXDOMAIN) werden geloggt.
3. Zonenmodifikationen (Zone-Reload, dynamische Updates) werden geloggt.
4. Log-Einträge enthalten Zeitstempel, Quell-IP, Query-Typ und Ergebnis.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-53 | Voraussetzung | Grundlegendes Logging muss aktiviert sein |
| SREQ-309 | Ergänzend | Detaillierte Informationen zu fehlgeschlagenen Anfragen |
| SREQ-529 | Verwandt | Zone Transfers sind TSIG-gesichert; beide Seiten werden geloggt |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-54-001](../tests/auto/TEST-SREQ-54-001.md) | Automatisch (pytest) |
| [TEST-SREQ-54-001-manual](../tests/manual/TEST-SREQ-54-001-manual.md) | Manuell |
