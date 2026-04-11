# SFN-K8S-005: Scheduled Test Execution

> **Service Function ID:** SFN-K8S-005
> **Quelle:** App-Template-Anweisung, Abschnitt 4 (Kubernetes Operator) und Abschnitt 8 (Testing)
> **Service:** Kubernetes Operator (SVC-K8S-OPERATOR)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Der Operator fuehrt alle konfigurierten Tests periodisch und automatisch **auf der Zielplattform** aus – d. h. im laufenden Kubernetes-Cluster gegen die tatsaechlich deployete Instanz, nicht in CI und nicht lokal. Das Ausfuehrungsintervall ist konfigurierbar (Standard: 15 Minuten). Testergebnisse werden als strukturierte OTel-Metriken und/oder Logs exportiert – entweder an ClickHouse (produktiver Betrieb) oder lokal (Offline-/Dev-Betrieb). Bei fehlgeschlagenen Tests wird ein OTel-Event ausgeloest und der CR-Status aktualisiert. Ueberlappende Laeufe werden uebersprungen.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [RDTS-217](requirements/RDTS-217.md) | [ARCH] | App-Template | Operator fuehrt alle Tests periodisch auf der Zielplattform aus (Standard 15 Minuten, Intervall konfigurierbar) | 🟥 MUSS |
| [RDTS-218](requirements/RDTS-218.md) | [ARCH] | App-Template | Testoperator ist dediziert in Go umgesetzt und als separates Objekt planbar/trackbar | 🟥 MUSS |
| [RDTS-219](requirements/RDTS-219.md) | [ARCH] | App-Template | Testergebnisse werden via OTel an `clickhouse` oder `local` exportiert | 🟥 MUSS |
| [RDTS-220](requirements/RDTS-220.md) | [ARCH] | App-Template | Bei fehlgeschlagenen Tests: OTel-Event ausloesen und CR-Status aktualisieren | 🟥 MUSS |
| [RDTS-221](requirements/RDTS-221.md) | [ARCH] | App-Template | Ueberlappende Testlaeufe sind ausgeschlossen (kein paralleler Lauf) | 🟧 SOLL |
| [RDTS-222](requirements/RDTS-222.md) | [ARCH] | App-Template | Bei OTel-Zielausfall: lokal puffern und spaeter nachliefern | 🟧 SOLL |

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-RDTS-217-001](tests/auto/TEST-RDTS-217-001.md) | Automatisch | RDTS-217 |
| [TEST-RDTS-218-001](tests/auto/TEST-RDTS-218-001.md) | Automatisch | RDTS-218 |
| [TEST-RDTS-219-001](tests/auto/TEST-RDTS-219-001.md) | Automatisch | RDTS-219 |
| [TEST-RDTS-220-001](tests/auto/TEST-RDTS-220-001.md) | Automatisch | RDTS-220 |
| [TEST-RDTS-221-001](tests/auto/TEST-RDTS-221-001.md) | Automatisch | RDTS-221 |
| [TEST-RDTS-222-001](tests/auto/TEST-RDTS-222-001.md) | Automatisch | RDTS-222 |
| [TEST-RDTS-217-001-manual](tests/manual/TEST-RDTS-217-001-manual.md) | Manuell | RDTS-217 |
| [TEST-RDTS-218-001-manual](tests/manual/TEST-RDTS-218-001-manual.md) | Manuell | RDTS-218 |
| [TEST-RDTS-219-001-manual](tests/manual/TEST-RDTS-219-001-manual.md) | Manuell | RDTS-219 |
| [TEST-RDTS-220-001-manual](tests/manual/TEST-RDTS-220-001-manual.md) | Manuell | RDTS-220 |
| [TEST-RDTS-221-001-manual](tests/manual/TEST-RDTS-221-001-manual.md) | Manuell | RDTS-221 |
| [TEST-RDTS-222-001-manual](tests/manual/TEST-RDTS-222-001-manual.md) | Manuell | RDTS-222 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-K8S-005 | SFN-K8S-004 | Voraussetzung (Reconcile Loop muss laufen) |
| SFN-K8S-005 | OBJ-11 OTel | Voraussetzung (OTel-Export muss konfiguriert sein) |
| SFN-K8S-005 | OBJ-23 Test Execution Dashboard | Konsument (Dashboard zeigt periodische Testergebnisse) |
| SFN-K8S-005 | OBJ-26 Test Operator | Feature-Umsetzung (dedizierter Testoperator-Baustein) |
