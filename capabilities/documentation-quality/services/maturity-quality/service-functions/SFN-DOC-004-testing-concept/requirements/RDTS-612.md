# RDTS-612: Pro-OBJ-Teststatussicht fuer Management

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-612 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-DOC-004 - Testing Concept |
| **Quelldokument** | Feature-Spec OBJ-23 |
| **Status** | Offen |

## Anforderungstext

> Das Test-Execution-Dashboard muss den Teststatus je OBJ-ID (Passed, Failed, Never Executed, Gesamt) ausweisen. Die Sicht muss fuer Nicht-Entwickler lesbar sein und eine Filterung nach OBJ erlauben. Die OBJ-Zuordnung wird versioniert aus dem Capability-zu-Feature-Mapping im Repository abgeleitet.

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-612-001](../tests/auto/TEST-RDTS-612-001.md) | Automatisch |
| [TEST-RDTS-612-001-manual](../tests/manual/TEST-RDTS-612-001-manual.md) | Manuell |
