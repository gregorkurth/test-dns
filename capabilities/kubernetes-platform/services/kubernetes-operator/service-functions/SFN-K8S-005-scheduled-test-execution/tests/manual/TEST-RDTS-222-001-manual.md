---
category: Resilience
---

# TEST-RDTS-222-001-manual: Lokale Pufferung und Nachlieferung bei OTel-Zielausfall

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-222-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-222](../../requirements/RDTS-222.md) |
| **Service Function** | SFN-K8S-005 - Scheduled Test Execution |
| **Geschaetzte Testdauer** | 25 Minuten |
| **Status** | Noch nicht durchgefuehrt |

## Testschritte

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | OTel-Ziel (ClickHouse) temporaer unterbrechen | Operator wechselt in Puffer-/Retry-Verhalten | ☐ |
| 2 | Testlauf waehrend Ausfall ausfuehren | Ergebnisse werden lokal gespeichert | ☐ |
| 3 | Ziel wiederherstellen | Gepufferte Ergebnisse werden nachgeliefert | ☐ |

## Testergebnis

| Feld | Wert |
|------|------|
| **Durchgefuehrt von** | - |
| **Datum** | - |
| **Ergebnis** | ☐ Bestanden ☐ Fehlgeschlagen ☐ Blockiert |

