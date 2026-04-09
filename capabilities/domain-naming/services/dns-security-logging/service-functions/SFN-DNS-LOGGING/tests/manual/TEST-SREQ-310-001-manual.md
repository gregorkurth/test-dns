---
category: UI
---

# TEST-SREQ-310-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-310-001-manual
> **Requirement:** [SREQ-310](../../requirements/SREQ-310.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 20–30 Minuten

## Testvorbereitung

- BIND9 und Unbound laufen mit aktiviertem Logging
- Zugriff auf Log-Dateien vorhanden
- Tools: `dig`, `tail`, `grep` verfuegbar

## Testschritte

1. DNSSEC-Validierungsfehler absichtlich erzeugen
2. Unbound-Log auf DNSSEC-Fehler-Eintrag pruefen
3. Fehlertyp und betroffene Zone in Log vorhanden

## Erwartetes Ergebnis

Die Anforderung SREQ-310 ist erfuellt: DNSSEC-Validierungsfehler werden mit Details geloggt

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
