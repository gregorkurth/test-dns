# TEST-SREQ-54-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-54-001-manual
> **Requirement:** [SREQ-54](../../requirements/SREQ-54.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 20–30 Minuten

## Testvorbereitung

- BIND9 und Unbound laufen mit aktiviertem Logging
- Zugriff auf Log-Dateien vorhanden
- Tools: `dig`, `tail`, `grep` verfuegbar

## Testschritte

1. Zone Transfer ausfuehren und Log pruefen
2. Fehlgeschlagene Anfrage (NXDOMAIN) erzeugen und Log pruefen
3. Zone-Reload ausfuehren und Log pruefen

## Erwartetes Ergebnis

Die Anforderung SREQ-54 ist erfuellt: Zone Transfer, fehlgeschlagene Anfragen und Zonenmodifikationen werden geloggt

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
