---
category: UI
---

# TEST-SREQ-53-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-53-001-manual
> **Requirement:** [SREQ-53](../../requirements/SREQ-53.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 20–30 Minuten

## Testvorbereitung

- BIND9 und Unbound laufen mit aktiviertem Logging
- Zugriff auf Log-Dateien vorhanden
- Tools: `dig`, `tail`, `grep` verfuegbar

## Testschritte

1. BIND9-Logging-Konfiguration pruefen (logging { ... })
2. Unbound-Logging-Konfiguration pruefen (verbosity)
3. Log-Dateien auf Vorhandensein und Schreibbarkeit pruefen
4. DNS-Query ausfuehren und Log-Eintrag beobachten

## Erwartetes Ergebnis

Die Anforderung SREQ-53 ist erfuellt: BIND9 und Unbound haben Logging aktiviert

## Testergebnis

| Schritt | Status | Beobachtung |
|---------|--------|-------------|
| 1 | [ ] Offen | – |
| 2 | [ ] Offen | – |
| 3 | [ ] Offen | – |
| 4 | [ ] Offen | – |

## Gesamtbewertung

- [ ] Bestanden
- [ ] Nicht bestanden
- [ ] Nicht anwendbar

**Getestet von:** _________________  **Datum:** _________________
