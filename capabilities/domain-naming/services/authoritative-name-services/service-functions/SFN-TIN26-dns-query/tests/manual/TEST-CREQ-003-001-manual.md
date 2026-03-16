# TEST-CREQ-003-001-manual: Manueller Test

> **Testfall-ID:** TEST-CREQ-003-001-manual
> **Requirement:** [CREQ-003](../../requirements/CREQ-003.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. dig rs1.core.ndp.che A ausfuehren
2. dig rs2.core.ndp.che A ausfuehren
3. DNS-Resolver-Funktion von rs1 und rs2 testen

## Erwartetes Ergebnis

Die Anforderung CREQ-003 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
