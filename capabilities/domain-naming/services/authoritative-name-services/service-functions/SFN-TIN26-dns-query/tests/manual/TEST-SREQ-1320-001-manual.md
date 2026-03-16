# TEST-SREQ-1320-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-1320-001-manual
> **Requirement:** [SREQ-1320](../../requirements/SREQ-1320.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. DNSSEC-Validierung mit delv oder dig +dnssec starten
2. Validierungskette von Root bis Zone pruefen
3. Kein SERVFAIL bei DNSSEC-aktivierter Anfrage

## Erwartetes Ergebnis

Die Anforderung SREQ-1320 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
