# RDTS-220: Fehler-Events und CR-Status bei fehlgeschlagenen Testlaeufen

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-220 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟥 MUSS (SHALL) |
| **Service Function** | SFN-K8S-005 – Scheduled Test Execution |
| **Quelldokument** | App-Template-Anweisung |
| **Kapitel** | 4. Kubernetes Operator / 8. Testing |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Bei einem fehlgeschlagenen Test wird ein OTel-Event ausgeloest und der CR-Status entsprechend aktualisiert.

## Akzeptanzkriterien

1. Fehlerhafte Runs erzeugen OTel-Events mit Schweregrad und Fehlergrund
2. CR-Status wird auf Warnung/Fehler aktualisiert
3. Erfolgreiche Runs setzen den Status wieder auf einen gesunden Zustand
4. Statuswechsel sind zeitlich und fachlich nachvollziehbar protokolliert

## Verknüpfte Features

- OBJ-13: Kubernetes Operator
- OBJ-16: Maturitaetsstatus / Reifegraduebersicht
- OBJ-26: Test Operator (Scheduled Test Execution via OTel)

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-220-001](../tests/auto/TEST-RDTS-220-001.md) | Automatisch (pytest) |
| [TEST-RDTS-220-001-manual](../tests/manual/TEST-RDTS-220-001-manual.md) | Manuell |

