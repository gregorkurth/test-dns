# TEST-RDTS-312-001-manual: Umschaltung local/clickhouse mit Retry und Nachlieferung

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-312-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-312](../../requirements/RDTS-312.md) |
| **Service Function** | SFN-OBS-001 - Metrics Export |
| **Status** | Noch nicht durchgefuehrt |

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Modus `clickhouse` aktivieren und Ziel kurzzeitig unerreichbar machen | Telemetrie wird gepuffert, App bleibt stabil | ☐ |
| 2 | Ziel wieder erreichbar machen | Gepufferte Daten werden automatisiert nachgeliefert (Replay) | ☐ |
| 3 | Konfiguration auf `local` umstellen | Umschaltung erfolgt ohne Codeaenderung, nur per Konfiguration | ☐ |
