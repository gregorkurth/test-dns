---
category: UI
---

# TEST-SREQ-616-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-616-001-manual
> **Requirement:** [SREQ-616](../../requirements/SREQ-616.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. Rekursive Query mit RD-Flag senden
2. REFUSED oder keine rekursive Antwort verifizieren
3. BIND9 recursion no; in Konfiguration pruefen

## Erwartetes Ergebnis

Die Anforderung SREQ-616 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
