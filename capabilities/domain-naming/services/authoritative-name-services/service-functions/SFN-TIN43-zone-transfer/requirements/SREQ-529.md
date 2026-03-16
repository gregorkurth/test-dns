# SREQ-529: DNS Zone Transfers mit TSIG sichern

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-529 |
| **Typ** | Sicherheit |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN43 – DNS Zone Transfer |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 22 |
| **Kapitel** | 5.1.3 (TIN-43) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Authoritative Name Services shall secure DNS Zone Transfers with Secret Key Transaction Authentication for DNS (TSIG).

## Anforderungstext (Deutsch)

Die Authoritative Name Services müssen DNS Zone Transfers mit TSIG (Transaction Signature, RFC 2845) absichern. Pflichtmässiger HMAC-Algorithmus ist hmac-sha384. Unsignierte Zone Transfers dürfen nicht akzeptiert werden.

---

## Kontext

TSIG sichert DNS-Transaktionen (insbesondere Zone Transfers) durch HMAC-basierte Authentifizierung. Ohne TSIG könnten unbefugte Parteien Zone Transfers durchführen und Zonendaten stehlen oder manipulieren. Im FMN-Kontext ist hmac-sha384 als Pflichtalgoritmus vorgeschrieben. Ältere HMAC-MD5-Schlüssel sind nicht zulässig.

---

## Akzeptanzkriterien

1. Zone Transfers sind mit TSIG-Schlüsseln konfiguriert (hmac-sha384).
2. Zone Transfer-Anfragen ohne gültigen TSIG-Schlüssel werden abgewiesen (REFUSED).
3. TSIG-Schlüssel werden sicher ausgetauscht und nicht im Klartext in Konfigurationsdateien gespeichert.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-241 | Voraussetzung | Zone Transfer muss grundsätzlich unterstützt werden |
| SREQ-53 | Verwandt | Zone Transfers müssen geloggt werden |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-529-001](../tests/auto/TEST-SREQ-529-001.md) | Automatisch (pytest) |
| [TEST-SREQ-529-001-manual](../tests/manual/TEST-SREQ-529-001-manual.md) | Manuell |
