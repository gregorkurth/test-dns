# RDTS-217: Periodische Testausfuehrung auf der Zielplattform (Standard 15 Minuten)

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-217 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟥 MUSS (SHALL) |
| **Service Function** | SFN-K8S-005 – Scheduled Test Execution |
| **Quelldokument** | App-Template-Anweisung |
| **Kapitel** | 4. Kubernetes Operator / 8. Testing |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Der Operator fuehrt alle konfigurierten Tests periodisch und automatisch auf der Zielplattform aus. Das Intervall ist konfigurierbar; der Standardwert betraegt 15 Minuten.

## Akzeptanzkriterien

1. Standardintervall ist auf 15 Minuten gesetzt
2. Intervall kann konfiguriert werden
3. Testlaeufe laufen im Cluster gegen die deployete Instanz
4. Reiner CI- oder lokaler Lauf gilt nicht als Erfuellung

## Verknüpfte Features

- OBJ-13: Kubernetes Operator
- OBJ-26: Test Operator (Scheduled Test Execution via OTel)

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-217-001](../tests/auto/TEST-RDTS-217-001.md) | Automatisch (pytest) |
| [TEST-RDTS-217-001-manual](../tests/manual/TEST-RDTS-217-001-manual.md) | Manuell |

