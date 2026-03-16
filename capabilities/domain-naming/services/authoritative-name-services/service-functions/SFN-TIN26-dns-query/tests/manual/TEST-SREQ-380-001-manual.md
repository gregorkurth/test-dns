# TEST-SREQ-380-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-380-001-manual
> **Requirement:** [SREQ-380](../../requirements/SREQ-380.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. DS-Record fuer signierte Subdelegation pruefen
2. dig @ns1 core.ndp.che DS abfragen
3. Validierungskette pruefen

## Erwartetes Ergebnis

Die Anforderung SREQ-380 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
