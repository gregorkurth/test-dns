# SREQ-234: Mission Top-Level-Domains unterstützen

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-234 |
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

> The Domain Name Service shall support mission top level domains.

## Anforderungstext (Deutsch)

Der Domain Name Service muss Mission Top-Level-Domains unterstützen. Dazu zählt die TLD `.mission.` sowie weitere missionsspezifische Top-Level-Domains gemäss FMN-Konfiguration.

---

## Kontext

Im FMN-Kontext werden dedizierte Mission Top-Level-Domains (z. B. `.mission.`) eingesetzt, die nicht im öffentlichen DNS existieren. Jeder MNP muss diese TLDs in seiner autoritativen DNS-Infrastruktur unterstützen und korrekt delegieren können. Ohne diese Unterstützung sind MN-spezifische FQDNs nicht auflösbar.

---

## Akzeptanzkriterien

1. Der autoritative Nameserver ist für mindestens eine Mission-TLD konfiguriert und beantwortet Queries korrekt.
2. Delegation von Subzonen unterhalb der Mission-TLD ist möglich.
3. NS-Records für die Mission-TLD sind korrekt konfiguriert und stimmig mit dem Parent.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-613 | Verwandt | Zwei unabhängige NS pro delegierter Zone erforderlich |
| SREQ-234 | Selbst | – |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-234-001](../tests/auto/TEST-SREQ-234-001.md) | Automatisch (pytest) |
| [TEST-SREQ-234-001-manual](../tests/manual/TEST-SREQ-234-001-manual.md) | Manuell |
