---
category: UI
---

# TEST-SREQ-612-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-612-001-manual
> **Requirement:** [SREQ-612](../../requirements/SREQ-612.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- DNS-Server ist gestartet und erreichbar unter `ns1.core.ndp.che`
- Tools: `dig`, `drill` verfuegbar

## Testschritte

1. NS-Records der Zone abfragen
2. Pruefen: Hidden Master nicht in NS-Records
3. Zone Transfer vom Hidden Master zu Secondary testen

## Erwartetes Ergebnis

Die Anforderung SREQ-612 ist erfuellt.

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
