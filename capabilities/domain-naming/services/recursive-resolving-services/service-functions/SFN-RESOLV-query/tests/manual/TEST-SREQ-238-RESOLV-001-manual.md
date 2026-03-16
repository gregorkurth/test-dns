# TEST-SREQ-238-RESOLV-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-238-RESOLV-001-manual
> **Requirement:** [SREQ-238](../../requirements/SREQ-238.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- Unbound-Resolver ist gestartet und erreichbar unter `rs1.core.ndp.che`
- Tools: `dig`, `drill` verfuegbar

## Testschritte

1. DNS-Aufloesung einer externen MNP-Zone testen
2. Pruefen: SOA-Record der aufgeloesten Zone erhalten
3. NS-Records fuer Delegation korrekt verarbeitet

## Erwartetes Ergebnis

Die Anforderung SREQ-238 ist erfuellt (Resolver-Seite).

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
