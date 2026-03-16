# TEST-SREQ-1318-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-1318-001-manual
> **Requirement:** [SREQ-1318](../../requirements/SREQ-1318.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. DS-Record fuer delegierte Zone abfragen
2. Alle 4 Felder (Key Tag, Algorithmus, Digest-Typ, Digest) pruefen
3. Vollstaendigkeit des DS-Records bestaetigen

## Erwartetes Ergebnis

Die Anforderung SREQ-1318 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
