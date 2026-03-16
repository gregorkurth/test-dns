# TEST-SREQ-309-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-309-001-manual
> **Requirement:** [SREQ-309](../../requirements/SREQ-309.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 20–30 Minuten

## Testvorbereitung

- BIND9 und Unbound laufen mit aktiviertem Logging
- Zugriff auf Log-Dateien vorhanden
- Tools: `dig`, `tail`, `grep` verfuegbar

## Testschritte

1. Absichtlich fehlgeschlagene Anfrage senden (nicht existierende Domain)
2. Log-Eintrag auf vollstaendige Details pruefen
3. Zeitstempel, Quell-IP, Query-Name, Fehlercode in Log vorhanden

## Erwartetes Ergebnis

Die Anforderung SREQ-309 ist erfuellt: Fehlgeschlagene Anfragen enthalten vollstaendige Details im Log

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
