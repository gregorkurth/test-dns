# RDTS-210: Idempotenter Reconcile bei Create/Update/Delete

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-210 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟥 MUSS (SHALL) |
| **Service Function** | SFN-K8S-004 – Reconciliation Loop |
| **Quelldokument** | App-Template-Anweisung |
| **Seite** | – |
| **Kapitel** | 4. Kubernetes Operator |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Der Operator muss bei Create, Update und Delete von DNSConfiguration-Ressourcen reagieren. Jeder Reconcile-Aufruf muss idempotent sein: Mehrfaches Ausführen desselben Reconcile darf keinen unerwünschten Seiteneffekt haben.

---

## Akzeptanzkriterien

1. Operator erkennt Create/Update/Delete-Events für DNSConfiguration
2. Mehrfaches Reconcile führt zum identischen Endzustand
3. Status wird nach jedem Reconcile korrekt aktualisiert
4. Delete entfernt die zugehörige Konfiguration in der App

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-210-001](../tests/auto/TEST-RDTS-210-001.md) | Automatisch (pytest) |
| [TEST-RDTS-210-001-manual](../tests/manual/TEST-RDTS-210-001-manual.md) | Manuell |
