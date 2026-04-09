---
category: UI
---

# TEST-SREQ-241-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-241-001-manual
> **Requirement:** [SREQ-241](../../requirements/SREQ-241.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- DNS-Server ist gestartet und erreichbar unter `ns1.core.ndp.che`
- Tools: `dig`, `drill` verfuegbar

## Testschritte

1. AXFR-Transfer mit dig axfr @ns1 core.ndp.che ausfuehren
2. Zone-Inhalt in Ausgabe pruefen
3. SOA-Serial nach Transfer vergleichen

## Erwartetes Ergebnis

Die Anforderung SREQ-241 ist erfuellt.

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
