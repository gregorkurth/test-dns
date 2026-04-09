# TEST-RDTS-411-001-manual: Tetragon Runtime-Events als Security-Auditquelle

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-411-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-411](../../requirements/RDTS-411.md) |
| **Service Function** | SFN-SEC-004 - Security |
| **Status** | Noch nicht durchgefuehrt |

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Tetragon-Regel fuer verdaechtige Runtime-Aktion ausloesen | Runtime-Event wird erkannt | ☐ |
| 2 | Audit-/OTel-Pipeline pruefen | Event erscheint mit Workload-/Namespace-Bezug | ☐ |
| 3 | Security-Dashboard kontrollieren | Ereignis ist als Security-Auditfall nachvollziehbar | ☐ |
