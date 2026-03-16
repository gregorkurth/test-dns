# SREQ-240: Statisch konfigurierte Zonen unterstützen (DNSSEC)

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-240 |
| **Typ** | Funktional / DNSSEC |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-RESOLV-DNSSEC – DNSSEC Validation |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, Annex B, 23 November 2023 |
| **Seite** | 36 |
| **Kapitel** | Annex B |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Authoritative Name Services must support statically configured zones.

## Anforderungstext (Deutsch)

Der DNS-Service muss statisch konfigurierte Zonen unterstützen. Im DNSSEC-Kontext bedeutet dies, dass Trust Anchors für Zonen statisch konfiguriert werden können, um DNSSEC-Validierung auch ohne vollständige Vertrauenskette von der Root zu ermöglichen.

---

## Kontext

Statisch konfigurierte Trust Anchors (z. B. via `trust-anchor` in Unbound) erlauben es, DNSSEC-Validierung für bestimmte Zonen zu erzwingen, auch wenn die Vertrauenskette zur Root nicht vollständig aufgebaut ist. Im MN-Kontext mit eigener Root-Zone ist dies der primäre Mechanismus für DNSSEC-Trust. Dies entspricht dem Konzept eines "Island of Security" in DNSSEC.

---

## Akzeptanzkriterien

1. Unbound unterstützt statisch konfigurierte Trust Anchors (`trust-anchor` Direktive).
2. DNSSEC-Validierung ist für Zonen mit konfiguriertem Trust Anchor aktiv.
3. Zonen ohne Trust Anchor werden nicht validiert (kein SERVFAIL bei fehlender DNSSEC-Signatur).

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-525 | Verwandt | Root-Zone ist signiert und dient als primärer Trust Anchor |
| SREQ-1318 | Verwandt | Trust Anchors als vollständige DS-Records |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-240-001](../tests/auto/TEST-SREQ-240-001.md) | Automatisch (pytest) |
| [TEST-SREQ-240-001-manual](../tests/manual/TEST-SREQ-240-001-manual.md) | Manuell |
