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
| [RDTS-213](requirements/RDTS-213.md) | [ARCH] | App-Template | Operator fuehrt alle Tests periodisch auf der Zielplattform aus, im Cluster gegen die deployete Instanz (Standard: 15 min, Intervall konfigurierbar) | 🟥 MUSS |
| [RDTS-214](requirements/RDTS-214.md) | [ARCH] | App-Template | Testergebnisse werden als OTel-Metriken/Logs exportiert (Ziel: `clickhouse` oder `local`) | 🟥 MUSS |
| [RDTS-215](requirements/RDTS-215.md) | [ARCH] | App-Template | Bei fehlgeschlagenen Tests: OTel-Event ausloesen und CR-Status aktualisieren | 🟥 MUSS |
| [RDTS-216](requirements/RDTS-216.md) | [ARCH] | App-Template | Ueberlappende Testlaeufe werden uebersprungen | 🟧 SOLL |
| [RDTS-217](requirements/RDTS-217.md) | [ARCH] | App-Template | Bei OTel-Zielausfall: Ergebnisse lokal puffern und nachliefern | 🟧 SOLL |

---

## Tests

_Noch keine Testfaelle angelegt. Werden in einer spaeteren Iteration hinzugefuegt._

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-K8S-005 | SFN-K8S-004 | Voraussetzung (Reconcile Loop muss laufen) |
| SFN-K8S-005 | OBJ-11 OTel | Voraussetzung (OTel-Export muss konfiguriert sein) |
| SFN-K8S-005 | OBJ-23 Test Execution Dashboard | Konsument (Dashboard zeigt periodische Testergebnisse) |
