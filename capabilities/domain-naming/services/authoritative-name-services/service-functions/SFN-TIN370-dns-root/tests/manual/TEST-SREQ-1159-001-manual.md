---
category: UI
---

# TEST-SREQ-1159-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-1159-001-manual
> **Requirement:** [SREQ-1159](../../requirements/SREQ-1159.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- DNS-Server ist gestartet und erreichbar unter `root-ns.core.ndp.che`
- Tools: `dig`, `drill` verfuegbar

## Testschritte

1. Alle NS-Records in Root-Zone auflisten
2. Pruefen: alle Delegationen sind TLDs (1 Label)
3. Keine Second-Level-Domain-Delegationen vorhanden

## Erwartetes Ergebnis

Die Anforderung SREQ-1159 ist erfuellt.

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
