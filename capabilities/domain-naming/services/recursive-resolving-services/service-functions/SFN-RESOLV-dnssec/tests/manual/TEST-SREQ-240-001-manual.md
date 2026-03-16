# TEST-SREQ-240-001-manual: Manueller Test

> **Testfall-ID:** TEST-SREQ-240-001-manual
> **Requirement:** [SREQ-240](../../requirements/SREQ-240.md)
> **Typ:** Manuell
> **Status:** Offen
> **Geschaetzte Dauer:** 20–30 Minuten

## Testvorbereitung

- Unbound-Resolver ist gestartet
- DNSSEC-Validierung ist in Unbound aktiviert
- Trust Anchor fuer Root-Zone ist konfiguriert

## Testschritte

1. Unbound-Konfiguration auf `trust-anchor` Direktive pruefen
2. `dig +dnssec @rs1.core.ndp.che core.ndp.che A` ausfuehren
3. AD-Flag (Authenticated Data) in DNS-Antwort pruefen
4. DNSSEC-Validierungsfehler in Unbound-Log pruefen (keine Fehler erwartet)

## Erwartetes Ergebnis

Trust Anchor ist konfiguriert; DNSSEC-Validierung ist aktiv; AD-Flag ist gesetzt.

## Testergebnis

| Schritt | Status | Beobachtung |
|---------|--------|-------------|
| 1 | [ ] Offen | – |
| 2 | [ ] Offen | – |
| 3 | [ ] Offen | – |
| 4 | [ ] Offen | – |

## Gesamtbewertung

- [ ] Bestanden
- [ ] Nicht bestanden
- [ ] Nicht anwendbar

**Getestet von:** _________________  **Datum:** _________________
