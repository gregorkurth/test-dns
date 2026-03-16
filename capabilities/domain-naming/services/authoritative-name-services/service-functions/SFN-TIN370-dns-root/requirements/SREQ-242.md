# SREQ-242: Fähigkeit zur Bereitstellung der Root-Zone

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-242 |
| **Typ** | Funktional |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN370 – DNS Root Zone Hosting |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 19 |
| **Kapitel** | 5.1.2 (TIN-370) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Authoritative Name Services must support the ability to provide the root zone.

## Anforderungstext (Deutsch)

Die Authoritative Name Services müssen die Fähigkeit unterstützen, die Root-Zone bereitzustellen. Der Nameserver muss so konfiguriert werden können, dass er als autoritativer Server für die Root-Zone (`.`) agiert.

---

## Kontext

Im Mission Network gibt es keine Verbindung zum öffentlichen Internet-DNS. Daher muss jeder MNP seine eigene Root-Zone hosten. Die Root-Zone enthält die Top-Level-Domain-Delegationen für alle im Mission Network verwendeten TLDs (Mission-TLDs, ccTLDs). Ohne lokale Root-Zone können Resolver externe Domains nicht auflösen.

---

## Akzeptanzkriterien

1. BIND9 ist als autoritativer Server für die Root-Zone (`.`) konfiguriert.
2. Queries für die Root-Zone werden korrekt beantwortet (NS-Records für TLDs).
3. Die Root-Zone enthält Delegationen für alle im MN verwendeten TLDs.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-525 | Folgend | Die Root-Zone muss signiert sein |
| SREQ-617 | Folgend | Jeder MNP bedient Root-Zone für eigene Resolver |
| SFN-TIN114 | Verwandt | Anycast für robustere Root-Zone-Verfügbarkeit |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-242-001](../tests/auto/TEST-SREQ-242-001.md) | Automatisch (pytest) |
| [TEST-SREQ-242-001-manual](../tests/manual/TEST-SREQ-242-001-manual.md) | Manuell |
