---
category: Deployability
---

# TEST-RDTS-213-001-manual: Zero-Trust Pod-zu-Pod-Richtlinien mit Cilium und mTLS

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-213-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-213](../../requirements/RDTS-213.md) |
| **Service Function** | SFN-K8S-002 - Manifest Management |
| **Geschaetzte Testdauer** | 15 Minuten |
| **Status** | Noch nicht durchgefuehrt |

## Testschritte

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Nicht freigegebenen Pod-zu-Pod-Traffic ausfuehren | Traffic wird blockiert (Default-Deny) | ☐ |
| 2 | Freigegebenen Pod-zu-Pod-Traffic ausfuehren | Traffic wird erlaubt und mTLS-gesichert uebertragen | ☐ |

## Testergebnis

| Feld | Wert |
|------|------|
| **Durchgefuehrt von** | - |
| **Datum** | - |
| **Ergebnis** | ☐ Bestanden ☐ Fehlgeschlagen ☐ Blockiert |
