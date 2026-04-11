---
category: Observability
---

# TEST-RDTS-219-001-manual: OTel-Reporting der Testlaeufe nach ClickHouse oder local

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-219-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-219](../../requirements/RDTS-219.md) |
| **Service Function** | SFN-K8S-005 - Scheduled Test Execution |
| **Geschaetzte Testdauer** | 20 Minuten |
| **Status** | Noch nicht durchgefuehrt |

## Testschritte

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Zielmodus `clickhouse` aktivieren und Lauf starten | Metriken/Logs erscheinen in ClickHouse/Grafana-Pipeline | ☐ |
| 2 | Zielmodus `local` aktivieren und Lauf starten | Metriken/Logs werden lokal persistiert | ☐ |
| 3 | Run-Daten im Dashboard prüfen | Run-ID, Ergebnis und Dauer sind sichtbar | ☐ |

## Testergebnis

| Feld | Wert |
|------|------|
| **Durchgefuehrt von** | - |
| **Datum** | - |
| **Ergebnis** | ☐ Bestanden ☐ Fehlgeschlagen ☐ Blockiert |

