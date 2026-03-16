# SREQ-239: Reverse-Zonen mit PTR-Records unterstützen

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-239 |
| **Typ** | Funktional |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN26 – DNS Query (Authoritative) |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 16 |
| **Kapitel** | 5.1.1 (TIN-26) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Domain Name Service must support the reverse zone containing the matching PTR-records.

## Anforderungstext (Deutsch)

Der Domain Name Service muss Reverse-Zonen (in-addr.arpa) mit korrespondierenden PTR-Records unterstützen. Die PTR-Records müssen mit den Forward-A-Records übereinstimmen.

---

## Kontext

Reverse-DNS-Auflösung (IP-Adresse zu Hostname) wird für viele Netzwerkdienste benötigt, darunter Logging, Authentifizierung und Sicherheitsüberprüfungen. Im Mission Network müssen alle zugewiesenen IP-Adressen rückwärts auflösbar sein. CHE CC-517 betreibt die Reverse-Zone 109.x.x.in-addr.arpa.

---

## Akzeptanzkriterien

1. Die Reverse-Zone (in-addr.arpa) ist konfiguriert und wird autoritativ bedient.
2. PTR-Records für alle konfigurierten Hosts sind vorhanden.
3. Jeder PTR-Record korrespondiert mit einem gültigen A-Record in der Forward-Zone.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-614 | Verwandt | Delegation von Reverse-Lookup-Zonen auf 8-Bit-Grenzen |
| CREQ-001 | Verwandt | CHE-spezifische Reverse-Zone: 109.x.x.in-addr.arpa |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-239-001](../tests/auto/TEST-SREQ-239-001.md) | Automatisch (pytest) |
| [TEST-SREQ-239-001-manual](../tests/manual/TEST-SREQ-239-001-manual.md) | Manuell |
