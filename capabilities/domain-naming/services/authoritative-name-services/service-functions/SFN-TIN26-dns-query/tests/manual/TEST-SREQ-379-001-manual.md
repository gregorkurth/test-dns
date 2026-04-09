---
category: UI
---

# TEST-SREQ-379-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-379-001-manual
> **Requirement:** [SREQ-379](../../requirements/SREQ-379.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. Delegation einer unsignierten Zone testen
2. Verify: kein DS-Record in Parent fuer unsignierte Subdelegation
3. DNSSEC-Validierung ohne Fehler verifizieren

## Erwartetes Ergebnis

Die Anforderung SREQ-379 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
