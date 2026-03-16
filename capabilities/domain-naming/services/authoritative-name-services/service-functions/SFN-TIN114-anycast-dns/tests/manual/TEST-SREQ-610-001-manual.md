# TEST-SREQ-610-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-610-001-manual
> **Requirement:** [SREQ-610](../../requirements/SREQ-610.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- DNS-Server ist gestartet und erreichbar unter `root-ns.core.ndp.che`
- Tools: `dig`, `drill` verfuegbar

## Testschritte

1. DNS-Query an Anycast-Adresse senden
2. Source-IP in Antwort via tcpdump pruefen
3. Source-IP == Anycast-IP bestaetigen

## Erwartetes Ergebnis

Die Anforderung SREQ-610 ist erfuellt.

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
