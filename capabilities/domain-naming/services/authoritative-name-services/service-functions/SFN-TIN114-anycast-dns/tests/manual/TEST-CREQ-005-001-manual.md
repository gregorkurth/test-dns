---
category: UI
---

# TEST-CREQ-005-001-manual: Manueller Test

> **Testfall-ID:** TEST-CREQ-005-001-manual
> **Requirement:** [CREQ-005](../../requirements/CREQ-005.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- DNS-Server ist gestartet und erreichbar unter `root-ns.core.ndp.che`
- Tools: `dig`, `drill` verfuegbar

## Testschritte

1. dig root-ns.core.ndp.che A ausfuehren
2. BGP-Route mit birdc show route pruefen
3. Anycast-DNS-Query an root-ns.core.ndp.che stellen

## Erwartetes Ergebnis

Die Anforderung CREQ-005 ist erfuellt.

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
