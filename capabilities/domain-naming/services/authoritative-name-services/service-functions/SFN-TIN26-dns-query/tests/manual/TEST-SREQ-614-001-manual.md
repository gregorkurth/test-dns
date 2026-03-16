# TEST-SREQ-614-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-614-001-manual
> **Requirement:** [SREQ-614](../../requirements/SREQ-614.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. Reverse-Delegation auf /24-Grenze pruefen
2. dig @ns1 x.x.109.in-addr.arpa NS ausfuehren
3. PTR-Query fuer IP im delegierten Bereich testen

## Erwartetes Ergebnis

Die Anforderung SREQ-614 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
