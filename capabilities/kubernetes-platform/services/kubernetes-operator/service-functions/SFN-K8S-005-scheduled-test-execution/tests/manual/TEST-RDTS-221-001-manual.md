---
category: Stability
---

# TEST-RDTS-221-001-manual: Keine ueberlappenden Testlaeufe (Single Active Run)

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-221-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-221](../../requirements/RDTS-221.md) |
| **Service Function** | SFN-K8S-005 - Scheduled Test Execution |
| **Geschaetzte Testdauer** | 20 Minuten |
| **Status** | Noch nicht durchgefuehrt |

## Testschritte

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Laufzeitlich langen Test starten | Ein Lauf ist aktiv | ☐ |
| 2 | Naechsten Intervallzeitpunkt abwarten | Kein zweiter paralleler Lauf startet | ☐ |
| 3 | Laufhistorie pruefen | Zweiter Lauf ist als `skipped_due_to_active_run` protokolliert | ☐ |

## Testergebnis

| Feld | Wert |
|------|------|
| **Durchgefuehrt von** | - |
| **Datum** | - |
| **Ergebnis** | ☐ Bestanden ☐ Fehlgeschlagen ☐ Blockiert |

