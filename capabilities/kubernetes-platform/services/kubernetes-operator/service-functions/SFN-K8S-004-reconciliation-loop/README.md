# SFN-K8S-004: Reconciliation Loop

> **Service Function ID:** SFN-K8S-004
> **Quelle:** App-Template-Anweisung, Abschnitt 4, Kubernetes Operator
> **Service:** Kubernetes Operator (SVC-K8S-OPERATOR)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Der Reconciliation Loop ist die zentrale Controller-Logik des Operators. Er überwacht DNSConfiguration-Ressourcen, synchronisiert deren gewünschten Zustand mit der App-API und aktualisiert den Status der Custom Resources. Der Loop ist idempotent und fehlertolerant.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [RDTS-210](requirements/RDTS-210.md) | [ARCH] | App-Template | Idempotenter Reconcile bei Create/Update/Delete | 🟥 MUSS |
| [RDTS-211](requirements/RDTS-211.md) | [ARCH] | App-Template | Exponentielles Retry-Backoff bei API-Fehlern | 🟥 MUSS |
| [RDTS-212](requirements/RDTS-212.md) | [ARCH] | App-Template | RBAC für Operator-ServiceAccount | 🟥 MUSS |

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-RDTS-210-001](tests/auto/TEST-RDTS-210-001.md) | Automatisch | RDTS-210 |
| [TEST-RDTS-210-001-manual](tests/manual/TEST-RDTS-210-001-manual.md) | Manuell | RDTS-210 |
| [TEST-RDTS-211-001](tests/auto/TEST-RDTS-211-001.md) | Automatisch | RDTS-211 |
| [TEST-RDTS-211-001-manual](tests/manual/TEST-RDTS-211-001-manual.md) | Manuell | RDTS-211 |
| [TEST-RDTS-212-001](tests/auto/TEST-RDTS-212-001.md) | Automatisch | RDTS-212 |
| [TEST-RDTS-212-001-manual](tests/manual/TEST-RDTS-212-001-manual.md) | Manuell | RDTS-212 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-K8S-004 | SFN-K8S-003 | Voraussetzung (CRD muss installiert sein) |
| SFN-K8S-004 | OBJ-8 REST API | Voraussetzung (API muss erreichbar sein) |
