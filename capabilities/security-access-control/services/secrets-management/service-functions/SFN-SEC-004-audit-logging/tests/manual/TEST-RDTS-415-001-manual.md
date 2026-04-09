---
category: UI
---

# TEST-RDTS-415-001-manual: Degradierter `local`-Modus erzeugt sichtbaren Security-Hinweis und Event

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-415-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-415](../../requirements/RDTS-415.md) |
| **Service Function** | SFN-SEC-004 - Security |
| **Status** | Noch nicht durchgefuehrt |

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | `secrets-mode=local` oder `siem-mode=local` setzen | Sichtbarer Sicherheits-Hinweis erscheint in GUI/Runbook/Log | ☐ |
| 2 | Ereignisstrom pruefen | Event `security.posture.degraded` wird erzeugt | ☐ |
| 3 | Ausnahme-ID pruefen | Gueltige Ausnahme-ID ist dokumentiert und referenzierbar | ☐ |
