# RDTS-215: FMN/NATO Kommunikationsmatrix als versionierte Policy-Quelle

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-215 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟥 MUSS (SHALL) |
| **Service Function** | SFN-K8S-002 – Manifest Management |
| **Quelldokument** | App-Template-Anweisung |
| **Kapitel** | 6. Security / Authentifizierung |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Fuer FMN/NATO-Exposition MUSS eine versionierte Kommunikationsmatrix gepflegt werden (Quelle, Ziel, Port, Protokoll, Zweck, Owner, Freigabe-ID).

## Anforderungstext (Erläuterung)

Die Kommunikationsmatrix (z. B. `docs/security/fmn-communication-matrix.md`) ist die bindende Quelle fuer North-South-Freigaben. Cilium-Regeln muessen nachweisbar mit dieser Matrix uebereinstimmen.

---

## Akzeptanzkriterien

1. Versionierte Kommunikationsmatrix ist im Repository vorhanden
2. Jeder aktive externe Flow hat Freigabe-ID und Owner
3. Cilium-Allow-Regeln sind auf Matrix-Eintraege rueckfuehrbar
4. Nicht dokumentierte Flows sind nicht freigegeben

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-215-001](../tests/auto/TEST-RDTS-215-001.md) | Automatisch (pytest) |
| [TEST-RDTS-215-001-manual](../tests/manual/TEST-RDTS-215-001-manual.md) | Manuell |
