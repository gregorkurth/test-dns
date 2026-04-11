---
category: Deployability
---

# TEST-RDTS-217-001-manual: Periodische Testausfuehrung auf der Zielplattform (15 Minuten)

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-217-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-217](../../requirements/RDTS-217.md) |
| **Service Function** | SFN-K8S-005 - Scheduled Test Execution |
| **Geschaetzte Testdauer** | 20 Minuten |
| **Status** | Noch nicht durchgefuehrt |

## Testschritte

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Intervall auf 15 Minuten setzen und Operator starten | Scheduler laeuft mit 15-Minuten-Takt | ☐ |
| 2 | Ersten Testlauf beobachten | Lauf startet im Cluster gegen deployete Instanz | ☐ |
| 3 | Zweiten Lauf nach Intervall pruefen | Neuer Lauf startet automatisch nach Intervall | ☐ |

## Testergebnis

| Feld | Wert |
|------|------|
| **Durchgefuehrt von** | - |
| **Datum** | - |
| **Ergebnis** | ☐ Bestanden ☐ Fehlgeschlagen ☐ Blockiert |

