# RDTS-211: Exponentielles Retry-Backoff bei API-Fehlern

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-211 |
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

> Bei Fehlern in der Kommunikation mit der App-API muss der Operator ein exponentielles Retry-Backoff verwenden und den Status auf `Error` setzen. Es darf kein Crash-Loop entstehen.

---

## Akzeptanzkriterien

1. Bei API-Fehler: Status wird auf `phase: Error` gesetzt mit Fehlermeldung
2. Retry-Intervall steigt exponentiell (z. B. 1s, 2s, 4s, 8s, max 5min)
3. Operator-Pod crasht nicht bei wiederholten Fehlern
4. Nach Behebung des Fehlers: Reconcile erfolgreich, Status wechselt zu `Applied`

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-211-001](../tests/auto/TEST-RDTS-211-001.md) | Automatisch (pytest) |
| [TEST-RDTS-211-001-manual](../tests/manual/TEST-RDTS-211-001-manual.md) | Manuell |
