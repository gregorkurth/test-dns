# TEST-RDTS-314-001-manual: SIEM-geeignete OTel-Weiterleitung fuer Security-Events (`clickhouse`/`local`)

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-314-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-314](../../requirements/RDTS-314.md) |
| **Service Function** | SFN-OBS-002 - Structured Logging |
| **Status** | Noch nicht durchgefuehrt |

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | OTel-Modus `clickhouse` aktivieren | Security-Events werden an zentrale Pipeline weitergeleitet | ☐ |
| 2 | OTel-Modus `local` aktivieren | Events werden lokal gepuffert und als `degraded` markiert | ☐ |
| 3 | Dashboard/Logs pruefen | Modus und Zielpfad sind nachvollziehbar dokumentiert | ☐ |
