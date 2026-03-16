# SREQ-525: Die Root-Zone muss signiert sein

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-525 |
| **Typ** | DNSSEC / Sicherheit |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN370 – DNS Root Zone Hosting |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 19 |
| **Kapitel** | 5.1.2 (TIN-370) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The root zone shall be signed.

## Anforderungstext (Deutsch)

Die Root-Zone muss mit DNSSEC signiert sein. Die Signierung der Root-Zone ist die Grundlage der gesamten DNSSEC-Vertrauenskette im Mission Network.

---

## Kontext

Die DNSSEC-Vertrauenskette beginnt bei der Root-Zone. Wenn die Root-Zone nicht signiert ist, kann keine Zone unterhalb der Root DNSSEC-validiert werden. Im Mission Network gibt es keine Verbindung zum öffentlichen Internet-Root (mit IANA Trust Anchor), daher muss ein eigener Root-Trust-Anchor für das MN etabliert werden.

---

## Akzeptanzkriterien

1. Die Root-Zone (`.`) enthält DNSKEY-, RRSIG- und NSEC/NSEC3-Records.
2. Die Root-Zone ist mit einem der erlaubten Algorithmen (gemäss SREQ-1272) signiert.
3. Ein DNSSEC-validierender Resolver kann die Root-Zone-Signatur verifizieren.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-242 | Voraussetzung | Root-Zone muss zunächst bereitgestellt werden |
| SREQ-1272 | Verwandt | Erlaubte Signaturalgorithmen für Root-Zone |
| SREQ-378 | Voraussetzung | Eigene Zone-Datei für signierte Zone |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-525-001](../tests/auto/TEST-SREQ-525-001.md) | Automatisch (pytest) |
| [TEST-SREQ-525-001-manual](../tests/manual/TEST-SREQ-525-001-manual.md) | Manuell |
