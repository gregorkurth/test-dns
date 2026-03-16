# TEST-SREQ-1313-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-1313-001-manual
> **Requirement:** [SREQ-1313](../../requirements/SREQ-1313.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. SOA-Serial auf ns1 und ns2 vergleichen
2. Zone Transfer starten und Konsistenz pruefen
3. Zufaelligen Record auf beiden NS abfragen

## Erwartetes Ergebnis

Die Anforderung SREQ-1313 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
