# SREQ-617: Bedienung der Root-Zone durch jeden MNP für eigene Resolver

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-617 |
| **Typ** | Funktional / Verfügbarkeit |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN370 – DNS Root Zone Hosting |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 19 |
| **Kapitel** | 5.1.2 (TIN-370) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Authoritative Name Services shall support the serving of the root zone by each MNP to its own resolvers.

## Anforderungstext (Deutsch)

Die Authoritative Name Services müssen es jedem MNP ermöglichen, die Root-Zone für seine eigenen Resolver bereitzustellen. Jeder MNP betreibt eine lokale Kopie der Root-Zone, die seinen Resolvern als Startpunkt für iterative DNS-Auflösung dient.

---

## Kontext

Im föderativen Mission Network ist jeder MNP für die Verfügbarkeit seiner eigenen DNS-Infrastruktur verantwortlich. Die lokale Root-Zone stellt sicher, dass DNS-Auflösung auch dann funktioniert, wenn die Verbindung zu anderen MNPs unterbrochen ist. Dies erhöht die Resilienz des gesamten Mission Networks.

---

## Akzeptanzkriterien

1. Die Root-Zone ist auf dem lokalen Nameserver konfiguriert und für eigene Resolver erreichbar.
2. Die eigenen Resolver (rs1/rs2.core.ndp.che) verwenden den lokalen Root-Nameserver als Root-Hint.
3. DNS-Auflösung funktioniert autonom ohne Verbindung zu anderen MNP-Root-Servern.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-242 | Voraussetzung | Root-Zone muss bereitstellbar sein |
| SFN-RESOLV-QUERY | Verwandt | Resolver nutzen die Root-Zone für iterative Auflösung |
| CREQ-004 | Verwandt | Anycast für Root-Zone (CHE-spezifisch) |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-617-001](../tests/auto/TEST-SREQ-617-001.md) | Automatisch (pytest) |
| [TEST-SREQ-617-001-manual](../tests/manual/TEST-SREQ-617-001-manual.md) | Manuell |
