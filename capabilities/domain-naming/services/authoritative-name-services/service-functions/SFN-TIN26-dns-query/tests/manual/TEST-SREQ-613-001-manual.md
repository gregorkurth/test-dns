---
category: UI
---

# TEST-SREQ-613-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-613-001-manual
> **Requirement:** [SREQ-613](../../requirements/SREQ-613.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. NS-Records fuer core.ndp.che abfragen
2. Beide NS-Server einzeln kontaktieren
3. Ausfall eines NS simulieren und Verfuegbarkeit pruefen

## Erwartetes Ergebnis

Die Anforderung SREQ-613 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
