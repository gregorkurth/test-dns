---
category: Incident
---

# TEST-RDTS-220-001-manual: Fehler-Events und CR-Status bei fehlgeschlagenen Testlaeufen

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-220-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-220](../../requirements/RDTS-220.md) |
| **Service Function** | SFN-K8S-005 - Scheduled Test Execution |
| **Geschaetzte Testdauer** | 20 Minuten |
| **Status** | Noch nicht durchgefuehrt |

## Testschritte

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Gezielten Testfehler provozieren | Lauf endet mit `failed` | ☐ |
| 2 | CR-Status pruefen | Status zeigt Warnung/Fehler inkl. Ursache | ☐ |
| 3 | OTel-Events pruefen | Fehler-Event mit Schweregrad ist vorhanden | ☐ |

## Testergebnis

| Feld | Wert |
|------|------|
| **Durchgefuehrt von** | - |
| **Datum** | - |
| **Ergebnis** | ☐ Bestanden ☐ Fehlgeschlagen ☐ Blockiert |

