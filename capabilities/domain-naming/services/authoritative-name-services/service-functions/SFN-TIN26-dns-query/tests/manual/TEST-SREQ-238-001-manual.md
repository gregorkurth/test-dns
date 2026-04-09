---
category: UI
---

# TEST-SREQ-238-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-238-001-manual
> **Requirement:** [SREQ-238](../../requirements/SREQ-238.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. SOA-Record via dig @ns1 core.ndp.che SOA abfragen
2. NS-Record via dig @ns1 core.ndp.che NS abfragen
3. A-Record fuer Nameserver via dig @ns1 ns1.core.ndp.che A abfragen

## Erwartetes Ergebnis

Die Anforderung SREQ-238 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
