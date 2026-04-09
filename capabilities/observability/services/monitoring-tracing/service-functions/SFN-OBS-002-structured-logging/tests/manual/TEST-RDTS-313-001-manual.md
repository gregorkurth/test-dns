# TEST-RDTS-313-001-manual: Security-Events mit standardisierten Netzwerk-/Policy-Feldern

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-313-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-313](../../requirements/RDTS-313.md) |
| **Service Function** | SFN-OBS-002 - Structured Logging |
| **Status** | Noch nicht durchgefuehrt |

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Policy-Verstoss oder Deny-Event ausloesen | Event wird im OTel-Output erzeugt | ☐ |
| 2 | Event-Felder pruefen | `security.policy.id`, `network.direction`, `network.port`, `security.profile` sind befuellt | ☐ |
| 3 | Degraded-Fall simulieren | `security.exception.id` ist gesetzt oder leer mit klarer Kennzeichnung | ☐ |
