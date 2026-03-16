# TEST-SREQ-1314-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-1314-001-manual
> **Requirement:** [SREQ-1314](../../requirements/SREQ-1314.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. NS-Query an ns1 und ns2 senden
2. Antworten vergleichen: identische NS-Record-Sets
3. SOA-Serial-Nummern vergleichen

## Erwartetes Ergebnis

Die Anforderung SREQ-1314 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
