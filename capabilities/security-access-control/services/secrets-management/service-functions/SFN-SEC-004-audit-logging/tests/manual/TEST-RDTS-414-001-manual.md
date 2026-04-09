# TEST-RDTS-414-001-manual: SIEM-Weiterleitung ueber OTel mit Modus `clickhouse`/`local`

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-414-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-414](../../requirements/RDTS-414.md) |
| **Service Function** | SFN-SEC-004 - Security |
| **Status** | Noch nicht durchgefuehrt |

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Security-Event im `clickhouse`-Modus erzeugen | Event ist in zentraler SIEM-Weiterleitung sichtbar | ☐ |
| 2 | `local`-Modus simulieren | Event wird lokal gepuffert und als degradierter Modus markiert | ☐ |
| 3 | `prod`-Konfiguration pruefen | `clickhouse` ist verpflichtend und nicht deaktivierbar | ☐ |
