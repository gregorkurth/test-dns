---
category: UI
---

# TEST-CREQ-001-001-manual: Manueller Test

> **Testfall-ID:** TEST-CREQ-001-001-manual
> **Requirement:** [CREQ-001](../../requirements/CREQ-001.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. Zone core.ndp.che SOA abfragen
2. Reverse-Zone 109.x.x.in-addr.arpa SOA abfragen
3. Beide Zonen korrekt konfiguriert bestaetigen

## Erwartetes Ergebnis

Die Anforderung CREQ-001 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

## Testergebnis

| Schritt | Status | Beobachtung |
|---------|--------|-------------|
| 1 | [ ] Offen | – |
| 2 | [ ] Offen | – |
| 3 | [ ] Offen | – |

## Gesamtbewertung

- [ ] Bestanden
- [ ] Nicht bestanden
- [ ] Nicht anwendbar

**Getestet von:** _________________  **Datum:** _________________
