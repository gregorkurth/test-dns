# TEST-SREQ-525-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-525-001-manual
> **Requirement:** [SREQ-525](../../requirements/SREQ-525.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- DNS-Server ist gestartet und erreichbar unter `root-ns.core.ndp.che`
- Tools: `dig`, `drill` verfuegbar

## Testschritte

1. dig +dnssec @root-ns.core.ndp.che . DNSKEY ausfuehren
2. RRSIG-Records in Antwort pruefen
3. Signatur-Gueltigkeit pruefen

## Erwartetes Ergebnis

Die Anforderung SREQ-525 ist erfuellt.

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
