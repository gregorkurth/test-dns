---
category: UI
---

# TEST-SREQ-611-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-611-001-manual
> **Requirement:** [SREQ-611](../../requirements/SREQ-611.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. BIND9-Konfiguration: query-source address pruefen
2. Network-Capture beim Zone-Notify beobachten
3. Source-IP der ausgehenden Query verifizieren

## Erwartetes Ergebnis

Die Anforderung SREQ-611 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
