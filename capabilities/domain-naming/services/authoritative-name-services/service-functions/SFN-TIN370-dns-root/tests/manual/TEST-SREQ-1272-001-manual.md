---
category: UI
---

# TEST-SREQ-1272-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-1272-001-manual
> **Requirement:** [SREQ-1272](../../requirements/SREQ-1272.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- DNS-Server ist gestartet und erreichbar unter `root-ns.core.ndp.che`
- Tools: `dig`, `drill` verfuegbar

## Testschritte

1. dig @root-ns.core.ndp.che . DNSKEY ausfuehren
2. Algorithmus-Feld in DNSKEY pruefen (8, 10, 13 oder 14)
3. RRSIG-Algorithmus mit erlaubten Werten vergleichen

## Erwartetes Ergebnis

Die Anforderung SREQ-1272 ist erfuellt.

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
