# TEST-SREQ-378-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-378-001-manual
> **Requirement:** [SREQ-378](../../requirements/SREQ-378.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 15–30 Minuten

## Testvorbereitung

- BIND9-Server ist gestartet und erreichbar
- Zone `core.ndp.che` ist geladen
- Testsystem hat Netzwerkzugang zum DNS-Server
- Tools: `dig`, `drill`, `nslookup` verfuegbar

## Testschritte

1. Dateisystem-Check: separate Zone-Dateien vorhanden
2. BIND9-Konfiguration: file-Direktive je Zone pruefen
3. named-checkzone fuer jede signierte Zone ausfuehren

## Erwartetes Ergebnis

Die Anforderung SREQ-378 ist erfuellt. DNS-Antworten entsprechen den spezifizierten Akzeptanzkriterien.

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
