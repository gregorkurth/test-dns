---
category: UI
---

# TEST-RDTS-412-001-manual: OpenBao als Standard, `local` nur als degradierter Modus mit Ausnahmehinweis

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-412-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-412](../../requirements/RDTS-412.md) |
| **Service Function** | SFN-SEC-003 - Security |
| **Status** | Noch nicht durchgefuehrt |

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Secrets-Mode in `prod` pruefen | `openbao` ist aktiv | ☐ |
| 2 | `local`-Modus simulieren | Ausnahme-ID + sichtbarer Warnhinweis vorhanden | ☐ |
