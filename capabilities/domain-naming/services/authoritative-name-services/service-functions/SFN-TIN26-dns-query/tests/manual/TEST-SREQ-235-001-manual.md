---
category: UI
---

# TEST-SREQ-235-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-235-001-manual
> **Requirement:** [SREQ-235](../../requirements/SREQ-235.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. ccTLD .che in Root-Zone pruefen
2. dig @ns1.core.ndp.che che. NS ausfuehren
3. NS-Records fuer .che pruefen

## Erwartetes Ergebnis

Die Anforderung SREQ-235 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
