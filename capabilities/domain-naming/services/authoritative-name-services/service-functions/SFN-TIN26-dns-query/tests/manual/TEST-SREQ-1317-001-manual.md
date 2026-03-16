# TEST-SREQ-1317-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-1317-001-manual
> **Requirement:** [SREQ-1317](../../requirements/SREQ-1317.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. Nicht-Anycast-Query senden
2. Source-IP in Antwort pruefen
3. Source-IP == Original-Destination-IP bestaetigen

## Erwartetes Ergebnis

Die Anforderung SREQ-1317 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
