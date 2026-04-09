---
category: UI
---

# TEST-SREQ-382-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-382-001-manual
> **Requirement:** [SREQ-382](../../requirements/SREQ-382.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. dig +dnssec @ns1 core.ndp.che A ausfuehren
2. RRSIG-Records in Antwort pruefen
3. DNSKEY-Record abfragen

## Erwartetes Ergebnis

Die Anforderung SREQ-382 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
