---
category: Deployability
---

# TEST-RDTS-216-001-manual: Nachweis fuer Allow-/Deny-Wirkung externer Cilium-Flows

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-216-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-216](../../requirements/RDTS-216.md) |
| **Service Function** | SFN-K8S-002 - Manifest Management |
| **Geschaetzte Testdauer** | 15 Minuten |
| **Status** | Noch nicht durchgefuehrt |

## Testschritte

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | Allow-Flow aus Kommunikationsmatrix testen | Zugriff wird erlaubt und protokolliert | ☐ |
| 2 | Nicht freigegebenen Flow testen | Zugriff wird geblockt und als Deny sichtbar | ☐ |
| 3 | Hubble/OTel-Ausgabe pruefen | Nachweisdaten enthalten Richtung, Peer-CIDR, Port und Entscheidung | ☐ |

## Testergebnis

| Feld | Wert |
|------|------|
| **Durchgefuehrt von** | - |
| **Datum** | - |
| **Ergebnis** | ☐ Bestanden ☐ Fehlgeschlagen ☐ Blockiert |
