# RDTS-221: Keine ueberlappenden Testlaeufe (Single Active Run)

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-221 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟧 SOLL (SHOULD) |
| **Service Function** | SFN-K8S-005 – Scheduled Test Execution |
| **Quelldokument** | App-Template-Anweisung |
| **Kapitel** | 4. Kubernetes Operator |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Ein bereits laufender Testdurchlauf blockiert den naechsten Intervall-Start; ueberlappende Laeufe werden uebersprungen.

## Akzeptanzkriterien

1. Es existiert zu jedem Zeitpunkt maximal ein aktiver Lauf
2. Bei Kollision wird der Folge-Lauf als `skipped_due_to_active_run` markiert
3. Der Skip wird als Telemetrie-/Audit-Eintrag erfasst
4. Es entstehen keine parallelen Schreibkonflikte auf Ergebnisdaten

## Verknüpfte Features

- OBJ-13: Kubernetes Operator
- OBJ-26: Test Operator (Scheduled Test Execution via OTel)

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-221-001](../tests/auto/TEST-RDTS-221-001.md) | Automatisch (pytest) |
| [TEST-RDTS-221-001-manual](../tests/manual/TEST-RDTS-221-001-manual.md) | Manuell |

