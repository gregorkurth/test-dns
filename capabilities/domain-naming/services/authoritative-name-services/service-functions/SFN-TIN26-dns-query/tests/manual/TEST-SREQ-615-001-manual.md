---
category: UI
---

# TEST-SREQ-615-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-615-001-manual
> **Requirement:** [SREQ-615](../../requirements/SREQ-615.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. BIND9-Konfiguration auf Forwarder pruefen
2. Unbound-Konfiguration auf forward-zone pruefen
3. Iterative Aufloesung einer MNP-Zone testen

## Erwartetes Ergebnis

Die Anforderung SREQ-615 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
