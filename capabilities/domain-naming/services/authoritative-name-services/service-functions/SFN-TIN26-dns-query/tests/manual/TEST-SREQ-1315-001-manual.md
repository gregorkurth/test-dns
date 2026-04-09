---
category: UI
---

# TEST-SREQ-1315-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-1315-001-manual
> **Requirement:** [SREQ-1315](../../requirements/SREQ-1315.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. SOA-Query an ns1 und ns2 senden
2. SOA-Records vergleichen: alle Felder identisch
3. Serial-Nummer nach Zone-Transfer pruefen

## Erwartetes Ergebnis

Die Anforderung SREQ-1315 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
