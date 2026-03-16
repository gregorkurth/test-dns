# TEST-SREQ-242-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-242-001-manual
> **Requirement:** [SREQ-242](../../requirements/SREQ-242.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- DNS-Server ist gestartet und erreichbar unter `root-ns.core.ndp.che`
- Tools: `dig`, `drill` verfuegbar

## Testschritte

1. dig @root-ns.core.ndp.che . NS ausfuehren
2. SOA der Root-Zone abfragen
3. Authoritative-Flag in Antwort pruefen

## Erwartetes Ergebnis

Die Anforderung SREQ-242 ist erfuellt.

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
