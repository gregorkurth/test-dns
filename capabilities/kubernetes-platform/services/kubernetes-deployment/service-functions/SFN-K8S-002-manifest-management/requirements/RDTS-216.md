# RDTS-216: Nachweis fuer Allow-/Deny-Wirkung externer Cilium-Flows

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-216 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟥 MUSS (SHALL) |
| **Service Function** | SFN-K8S-002 – Manifest Management |
| **Quelldokument** | App-Template-Anweisung |
| **Kapitel** | 6. Security / Authentifizierung |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Cilium Allow-/Deny-Regeln fuer externe Flows muessen testbar und nachvollziehbar nachgewiesen werden.

## Anforderungstext (Erläuterung)

Fuer aktive North-South-Freigaben existieren reproduzierbare Allow-/Deny-Tests. Hubble-/OTel-Ausgaben enthalten nachvollziehbare Belege fuer blockierte nicht-freigegebene Flows.

---

## Akzeptanzkriterien

1. Pro aktivem externem Flow existiert ein Allow-Test
2. Es existiert mindestens ein Deny-Test fuer nicht freigegebenen externen Traffic
3. Testnachweise sind versioniert und releasebezogen verlinkt
4. Hubble-/OTel-Daten zeigen die erwarteten Entscheidungen

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-216-001](../tests/auto/TEST-RDTS-216-001.md) | Automatisch (pytest) |
| [TEST-RDTS-216-001-manual](../tests/manual/TEST-RDTS-216-001-manual.md) | Manuell |
