# TEST-SREQ-239-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-239-001-manual
> **Requirement:** [SREQ-239](../../requirements/SREQ-239.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. Reverse-Zone in BIND9-Konfiguration pruefen
2. dig @ns1 -x [IP] zur PTR-Aufloesung ausfuehren
3. Konsistenz Forward/Reverse verifizieren

## Erwartetes Ergebnis

Die Anforderung SREQ-239 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
