# SFN-K8S-003: CRD Definition

> **Service Function ID:** SFN-K8S-003
> **Quelle:** App-Template-Anweisung, Abschnitt 4, Kubernetes Operator
> **Service:** Kubernetes Operator (SVC-K8S-OPERATOR)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Definition der Custom Resource Definition (CRD) `DNSConfiguration` (API-Gruppe `dns.fmn.mil`, Version `v1alpha1`). Die CRD definiert das Schema für DNS-Konfigurationen als Kubernetes-native Ressourcen mit Spec- und Status-Subresource.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [RDTS-207](requirements/RDTS-207.md) | [ARCH] | App-Template | CRD DNSConfiguration definiert und installierbar | 🟥 MUSS |
| [RDTS-208](requirements/RDTS-208.md) | [ARCH] | App-Template | Status-Subresource mit Phase, Message, LastUpdated | 🟥 MUSS |
| [RDTS-209](requirements/RDTS-209.md) | [ARCH] | App-Template | OpenAPI-Validierung im CRD-Schema | 🟧 SOLLTE |

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-RDTS-207-001](tests/auto/TEST-RDTS-207-001.md) | Automatisch | RDTS-207 |
| [TEST-RDTS-207-001-manual](tests/manual/TEST-RDTS-207-001-manual.md) | Manuell | RDTS-207 |
| [TEST-RDTS-208-001](tests/auto/TEST-RDTS-208-001.md) | Automatisch | RDTS-208 |
| [TEST-RDTS-208-001-manual](tests/manual/TEST-RDTS-208-001-manual.md) | Manuell | RDTS-208 |
| [TEST-RDTS-209-001](tests/auto/TEST-RDTS-209-001.md) | Automatisch | RDTS-209 |
| [TEST-RDTS-209-001-manual](tests/manual/TEST-RDTS-209-001-manual.md) | Manuell | RDTS-209 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-K8S-003 | SFN-K8S-004 | Nutzer (Reconciliation benötigt CRD) |
