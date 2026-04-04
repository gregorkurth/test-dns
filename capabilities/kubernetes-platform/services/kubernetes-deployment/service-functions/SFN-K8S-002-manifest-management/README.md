# SFN-K8S-002: Manifest Management

> **Service Function ID:** SFN-K8S-002
> **Quelle:** App-Template-Anweisung, Abschnitt 2, Kubernetes als Zielplattform
> **Service:** Kubernetes Deployment (SVC-K8S-DEPLOY)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Manifest Management umfasst alle Kubernetes-Manifeste (Deployment, Service, Ingress, ConfigMap, Namespace), die für den Betrieb der App benötigt werden. Alle Manifeste sind deklarativ, versioniert und können mit `kubectl apply` angewendet werden.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [RDTS-204](requirements/RDTS-204.md) | [ARCH] | App-Template | Deployment-Manifest mit Replicas, Probes, Ressourcenlimits | 🟥 MUSS |
| [RDTS-205](requirements/RDTS-205.md) | [ARCH] | App-Template | Service- und Ingress-Manifest | 🟥 MUSS |
| [RDTS-206](requirements/RDTS-206.md) | [ARCH] | App-Template | ConfigMap für App-Konfiguration (keine Secrets) | 🟥 MUSS |

> **Quelle-Typen:** `[NATO]` FMN/NATO-Spec · `[ARCH]` Architektur · `[CUST]` Kunde · `[INT]` Intern
> **Priorität:** 🟥 MUSS · 🟧 SOLLTE · 🟨 KANN · ℹ️ INFO

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-RDTS-204-001](tests/auto/TEST-RDTS-204-001.md) | Automatisch | RDTS-204 |
| [TEST-RDTS-204-001-manual](tests/manual/TEST-RDTS-204-001-manual.md) | Manuell | RDTS-204 |
| [TEST-RDTS-205-001](tests/auto/TEST-RDTS-205-001.md) | Automatisch | RDTS-205 |
| [TEST-RDTS-205-001-manual](tests/manual/TEST-RDTS-205-001-manual.md) | Manuell | RDTS-205 |
| [TEST-RDTS-206-001](tests/auto/TEST-RDTS-206-001.md) | Automatisch | RDTS-206 |
| [TEST-RDTS-206-001-manual](tests/manual/TEST-RDTS-206-001-manual.md) | Manuell | RDTS-206 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-K8S-002 | SFN-K8S-001 | Voraussetzung (Container-Image muss existieren) |
