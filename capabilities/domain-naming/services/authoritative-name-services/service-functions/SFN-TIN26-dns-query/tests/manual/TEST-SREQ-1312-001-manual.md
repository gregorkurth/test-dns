# TEST-SREQ-1312-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-1312-001-manual
> **Requirement:** [SREQ-1312](../../requirements/SREQ-1312.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. NS-Records in Child-Zone abfragen
2. NS-Records in Parent-Zone abfragen
3. Vergleich beider NS-Record-Sets

## Erwartetes Ergebnis

Die Anforderung SREQ-1312 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
