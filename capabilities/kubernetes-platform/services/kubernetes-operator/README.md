# Service: Kubernetes Operator

> **Service ID:** SVC-K8S-OPERATOR
> **Capability:** Kubernetes Platform (CAP-002)
> **Quelldokument:** App-Template-Anweisung, Abschnitt 4 (Kubernetes Operator)

---

## Beschreibung

Der Kubernetes Operator Service stellt ein CRD-basiertes Steuerungskonzept für DNS-Konfigurationen bereit. Der Operator verwaltet `DNSConfiguration`-Custom-Resources, synchronisiert deren Zustand mit der App-API und ermöglicht deklarative Konfigurationsverwaltung via `kubectl apply`.

---

## Service Functions

| ID | Service Function | Beschreibung | Requirements | Tests |
|----|-----------------|-------------|-------------|-------|
| SFN-K8S-003 | CRD Definition | Custom Resource Definition für DNSConfiguration | [Requirements](service-functions/SFN-K8S-003-crd-definition/README.md) | 3 Auto, 3 Manuell |
| SFN-K8S-004 | Reconciliation Loop | Controller-Logic für CRD-Reconciliation | [Requirements](service-functions/SFN-K8S-004-reconciliation-loop/README.md) | 3 Auto, 3 Manuell |
| SFN-K8S-005 | Scheduled Test Execution | Periodische automatische Testausfuehrung durch den Operator mit konfigurierbarem Intervall und OTel-Reporting | [Requirements](service-functions/SFN-K8S-005-scheduled-test-execution/README.md) | 6 Auto, 6 Manuell |

---

## Produkte

| Produkt | Version | Lizenz |
|---------|---------|--------|
| kubebuilder | ≥ 3.0 | Apache 2.0 |
| controller-runtime (Go) | ≥ 0.16 | Apache 2.0 |

---

## Abhängigkeiten

| Von | Nach | Typ | Beschreibung |
|-----|------|-----|-------------|
| SVC-K8S-OPERATOR | SVC-K8S-DEPLOY | Voraussetzung | App muss im Cluster laufen |
| SVC-K8S-OPERATOR | OBJ-8 REST API | Voraussetzung | Operator kommuniziert mit der App-API |

---

## Quelldokumente

- App-Template-Anweisung (req-init/app-template.md), Abschnitt 4: Kubernetes Operator
- Feature-Spec OBJ-13: Kubernetes Operator
- Feature-Spec OBJ-26: Test Operator (Scheduled Test Execution via OTel)
