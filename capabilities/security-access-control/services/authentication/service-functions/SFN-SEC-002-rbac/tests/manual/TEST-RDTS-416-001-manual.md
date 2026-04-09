# TEST-RDTS-416-001-manual: MCP-/Agent-Zugriffe nur ueber freigegebene Tool- und API-Whitelist

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-416-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-416](../../requirements/RDTS-416.md) |
| **Service Function** | SFN-SEC-002 - Security |
| **Status** | Noch nicht durchgefuehrt |

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Freigegebenes MCP-Tool gegen freigegebenen API-Endpunkt ausfuehren | Aufruf ist erlaubt | ☐ |
| 2 | Nicht freigegebenes Tool oder Endpunkt ausfuehren | Aufruf wird blockiert und als Security-Event protokolliert | ☐ |
