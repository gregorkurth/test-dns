---
category: UI
---

# TEST-RDTS-311-001-manual: OTel-Betriebsmodus local mit persistenter Zwischenspeicherung

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-311-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-311](../../requirements/RDTS-311.md) |
| **Service Function** | SFN-OBS-001 - Metrics Export |
| **Status** | Noch nicht durchgefuehrt |

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | OTel-Modus auf `local` setzen und Telemetrie erzeugen | Logs, Metriken und Traces werden lokal persistent abgelegt | ☐ |
| 2 | Neustart des Collectors simulieren | Lokaler Puffer bleibt erhalten und Daten sind weiter verfuegbar | ☐ |
