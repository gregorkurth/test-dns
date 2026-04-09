---
category: UI
---

# TEST-RDTS-511-001-manual: Security-/FMN-Policy-Gate fuer `prod` und externe Flows

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-511-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-511](../../requirements/RDTS-511.md) |
| **Service Function** | SFN-DEV-001 - DevOps |
| **Status** | Noch nicht durchgefuehrt |

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Pipeline fuer `prod`-Konfiguration ausfuehren | Lauf prueft Security-Profile (`strict`/OpenBao/ClickHouse) als Gate | ☐ |
| 2 | Unerlaubten North-South-Flow oder fehlende Matrix simulieren | Gate blockiert Lauf mit eindeutiger Fehlermeldung | ☐ |
| 3 | Gueltige Kommunikationsmatrix + Cilium-Policies bereitstellen | Gate besteht, keine Blockierung | ☐ |
