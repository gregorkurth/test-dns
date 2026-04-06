# RDTS-503: Multi-Stage Docker Build

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-503 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-DEV-002 - Image Build |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> Container-Image wird bei Merge auf main gebaut und gepusht. Das Runtime-Image basiert auf einem freigegebenen gehaerteten Minimal-Base-Image und enthaelt nur die benoetigten Laufzeitkomponenten. Falls der Service ausschliesslich BIND9 bereitstellt, ist ein BIND9-spezifisches Minimal-Image zu verwenden, das nur `named` und die notwendigen Laufzeitdateien beinhaltet.

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-503-001](../tests/auto/TEST-RDTS-503-001.md) | Automatisch |
| [TEST-RDTS-503-001-manual](../tests/manual/TEST-RDTS-503-001-manual.md) | Manuell |
