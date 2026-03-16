# SREQ-380: Signierung von Subdomains delegieren können

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-380 |
| **Typ** | Funktional / DNSSEC |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN26 – DNS Query (Authoritative) |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 16 |
| **Kapitel** | 5.1.1 (TIN-26) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Domain Name Service shall be able to delegate the signing of subdomains.

## Anforderungstext (Deutsch)

Der Domain Name Service muss in der Lage sein, die Signierung von Subdomains zu delegieren. Das bedeutet, dass ein DS-Record für eine signierte Subdelegation in der übergeordneten Zone platziert werden kann, um die DNSSEC-Vertrauenskette weiterzuführen.

---

## Kontext

DNSSEC-Delegation erfolgt über DS-Records (Delegation Signer) in der Parent-Zone, die auf den DNSKEY der Child-Zone verweisen. Ohne diese Möglichkeit kann keine End-to-End-DNSSEC-Vertrauenskette aufgebaut werden. Die autoritative Zone muss DS-Records für delegierte Subzonen unterstützen.

---

## Akzeptanzkriterien

1. Die übergeordnete Zone kann DS-Records für signierte Subdelegationen enthalten.
2. DS-Records werden korrekt in der Zone-Datei konfiguriert und zurückgegeben.
3. Die DNSSEC-Vertrauenskette von der Root-Zone bis zur delegierten Zone ist valide.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-379 | Verwandt | Unsignierte Subzonen delegieren ist das Gegenstück |
| SREQ-1318 | Verwandt | DS-Records müssen vollständig bereitgestellt werden |
| SREQ-1319 | Verwandt | DNSKEY muss zu DS-Record passen |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-380-001](../tests/auto/TEST-SREQ-380-001.md) | Automatisch (pytest) |
| [TEST-SREQ-380-001-manual](../tests/manual/TEST-SREQ-380-001-manual.md) | Manuell |
