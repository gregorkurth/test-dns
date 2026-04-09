# RDTS-311: OTel-Betriebsmodus local mit persistenter Zwischenspeicherung

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-311 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-OBS-001 - Metrics Export |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> Die OTel-Pipeline MUSS einen lokalen Betriebsmodus (`local`) bereitstellen, in dem Logs, Metriken und Traces ohne externen Zielspeicher persistent zwischengespeichert werden.

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-311-001](../tests/auto/TEST-RDTS-311-001.md) | Automatisch |
| [TEST-RDTS-311-001-manual](../tests/manual/TEST-RDTS-311-001-manual.md) | Manuell |
