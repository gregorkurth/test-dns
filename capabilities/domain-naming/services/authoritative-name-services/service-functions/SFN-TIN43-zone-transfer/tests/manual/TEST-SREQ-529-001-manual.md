---
category: UI
---

# TEST-SREQ-529-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-529-001-manual
> **Requirement:** [SREQ-529](../../requirements/SREQ-529.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- DNS-Server ist gestartet und erreichbar unter `ns1.core.ndp.che`
- Tools: `dig`, `drill` verfuegbar

## Testschritte

1. AXFR ohne TSIG versuchen: dig axfr @ns1 core.ndp.che
2. REFUSED-Antwort erwartet
3. AXFR mit korrektem TSIG-Schluessel erneut versuchen

## Erwartetes Ergebnis

Die Anforderung SREQ-529 ist erfuellt.

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
