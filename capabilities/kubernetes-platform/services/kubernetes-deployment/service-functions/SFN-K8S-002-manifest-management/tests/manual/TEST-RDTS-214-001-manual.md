---
category: Deployability
---

# TEST-RDTS-214-001-manual: Cilium North-South Ingress/Egress Default-Deny mit explizitem Allowlisting

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-214-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-214](../../requirements/RDTS-214.md) |
| **Service Function** | SFN-K8S-002 - Manifest Management |
| **Geschaetzte Testdauer** | 15 Minuten |
| **Status** | Noch nicht durchgefuehrt |

## Testschritte

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Externen Zugriff aus freigegebenem CIDR auf freigegebenen Port pruefen | Zugriff wird erlaubt | ☐ |
| 2 | Externen Zugriff aus nicht freigegebenem CIDR oder Port pruefen | Zugriff wird blockiert | ☐ |

## Testergebnis

| Feld | Wert |
|------|------|
| **Durchgefuehrt von** | - |
| **Datum** | - |
| **Ergebnis** | ☐ Bestanden ☐ Fehlgeschlagen ☐ Blockiert |
