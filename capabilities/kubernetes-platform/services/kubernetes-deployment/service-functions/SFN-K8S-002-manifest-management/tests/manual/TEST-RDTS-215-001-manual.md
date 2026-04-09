# TEST-RDTS-215-001-manual: FMN/NATO Kommunikationsmatrix als versionierte Policy-Quelle

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-215-001-manual |
| **Typ** | Manuell |
| **Requirement** | [RDTS-215](../../requirements/RDTS-215.md) |
| **Service Function** | SFN-K8S-002 - Manifest Management |
| **Geschaetzte Testdauer** | 10 Minuten |
| **Status** | Noch nicht durchgefuehrt |

## Testschritte

| Schritt | Aktion | Erwartetes Ergebnis | Bestanden? |
|---------|--------|--------------------|-----------:|
| 1 | `docs/security/fmn-communication-matrix.md` pruefen | Aktive Flows mit Owner, Freigabe-ID, Ports und Protokollen vorhanden | ☐ |
| 2 | Cilium-Regeln gegen Matrix pruefen | Freigaben sind auf Matrix-Eintraege rueckfuehrbar | ☐ |

## Testergebnis

| Feld | Wert |
|------|------|
| **Durchgefuehrt von** | - |
| **Datum** | - |
| **Ergebnis** | ☐ Bestanden ☐ Fehlgeschlagen ☐ Blockiert |
