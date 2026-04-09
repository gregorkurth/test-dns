---
category: UI
---

# TEST-SREQ-234-001-manual: Manueller Test

`itest~sreq-234-001~1`
Covers: req~sreq-234~1

> **Testfall-ID:** TEST-SREQ-234-001-manual
> **Requirement:** [SREQ-234](../../requirements/SREQ-234.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. Konfiguration der Mission-TLD in BIND9 pruefen
2. dig @ns1.core.ndp.che . NS ausfuehren und Mission-TLD in Antwort pruefen
3. Delegation der Mission-TLD verifizieren

## Erwartetes Ergebnis

Die Anforderung SREQ-234 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
