---
category: UI
---

# TEST-SREQ-1316-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-1316-001-manual
> **Requirement:** [SREQ-1316](../../requirements/SREQ-1316.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. Referral-Antwort mit tcpdump/Wireshark aufzeichnen
2. Payload-Groesse messen
3. Groesse <= 512 Bytes bestaetigen

## Erwartetes Ergebnis

Die Anforderung SREQ-1316 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
