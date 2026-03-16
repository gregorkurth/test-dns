# SREQ-310: Logs müssen Details zu DNSSEC-Validierungsfehlern enthalten

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-310 |
| **Typ** | Sicherheit / DNSSEC |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-DNS-LOGGING – DNS Security & Event Logging |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, Annex B, 23 November 2023 |
| **Seite** | 36 |
| **Kapitel** | Annex B (Enterprise-level Requirements) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Event logs shall include details of DNSSEC verification failures.

## Anforderungstext (Deutsch)

Event-Logs müssen Details zu DNSSEC-Validierungsfehlern enthalten. Details umfassen: Zeitstempel, betroffene Zone, DNSSEC-Fehlertyp (Signatur abgelaufen, ungültige Signatur, fehlender DNSKEY, fehlendes DS-Record usw.), und betroffener Resource Record.

---

## Kontext

DNSSEC-Validierungsfehler können auf Angriffe (DNS-Spoofing, Zone-Tampering), abgelaufene Signaturen, oder Konfigurationsfehler (falsche Trust Anchors, Key-Rollover-Probleme) hinweisen. Detaillierte Logs sind essenziell für schnelle Diagnose und Behebung. Im Mission Network können DNSSEC-Fehler zu kompletten DNS-Ausfällen führen.

---

## Akzeptanzkriterien

1. DNSSEC-Validierungsfehler werden in separaten Log-Einträgen mit Fehlertyp dokumentiert.
2. Log-Einträge für DNSSEC-Fehler enthalten: Zeitstempel, betroffene Zone, Fehlertyp, betroffener Record.
3. Unbound-Logging-Level ist so konfiguriert, dass DNSSEC-Fehler sichtbar sind (`val-log-level: 2`).

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-53 | Voraussetzung | Grundlegendes Logging muss aktiviert sein |
| SREQ-54 | Übergeordnet | DNSSEC-Fehler als Teil der Sicherheits-Logs |
| SFN-RESOLV-DNSSEC | Verwandt | DNSSEC-Validierung erfolgt im Resolver |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-310-001](../tests/auto/TEST-SREQ-310-001.md) | Automatisch (pytest) |
| [TEST-SREQ-310-001-manual](../tests/manual/TEST-SREQ-310-001-manual.md) | Manuell |
