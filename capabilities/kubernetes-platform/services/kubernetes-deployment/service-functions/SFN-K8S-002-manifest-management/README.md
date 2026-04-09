# SFN-K8S-002: Manifest Management

> **Service Function ID:** SFN-K8S-002
> **Quelle:** App-Template-Anweisung, Abschnitt 2, Kubernetes als Zielplattform
> **Service:** Kubernetes Deployment (SVC-K8S-DEPLOY)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Manifest Management umfasst alle Kubernetes-Manifeste (Deployment, Service, Ingress, ConfigMap, Namespace), die für den Betrieb der App benötigt werden. Fuer externen DNS-Betrieb umfasst es zusaetzlich Cilium-basierte North-South-Ingress-/Egress-Regeln nach FMN/NATO sowie die zugehoerige Kommunikationsmatrix. Alle Manifeste sind deklarativ, versioniert und können mit `kubectl apply` angewendet werden.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [RDTS-204](requirements/RDTS-204.md) | [ARCH] | App-Template | Deployment-Manifest mit Replicas, Probes, Ressourcenlimits | 🟥 MUSS |
| [RDTS-205](requirements/RDTS-205.md) | [ARCH] | App-Template | Service- und Ingress-Manifest | 🟥 MUSS |
| [RDTS-206](requirements/RDTS-206.md) | [ARCH] | App-Template | ConfigMap für App-Konfiguration (keine Secrets) | 🟥 MUSS |
| [RDTS-213](requirements/RDTS-213.md) | [ARCH] | App-Template | Zero-Trust Pod-zu-Pod-Richtlinien mit Cilium und mTLS | 🟥 MUSS |
| [RDTS-214](requirements/RDTS-214.md) | [ARCH] | App-Template | Cilium North-South Ingress/Egress Default-Deny mit explizitem Allowlisting | 🟥 MUSS |
| [RDTS-215](requirements/RDTS-215.md) | [ARCH] | App-Template | FMN/NATO Kommunikationsmatrix als versionierte Policy-Quelle | 🟥 MUSS |
| [RDTS-216](requirements/RDTS-216.md) | [ARCH] | App-Template | Nachweis fuer Allow-/Deny-Wirkung externer Cilium-Flows | 🟥 MUSS |

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
| [TEST-RDTS-213-001](tests/auto/TEST-RDTS-213-001.md) | Automatisch | RDTS-213 |
| [TEST-RDTS-213-001-manual](tests/manual/TEST-RDTS-213-001-manual.md) | Manuell | RDTS-213 |
| [TEST-RDTS-214-001](tests/auto/TEST-RDTS-214-001.md) | Automatisch | RDTS-214 |
| [TEST-RDTS-214-001-manual](tests/manual/TEST-RDTS-214-001-manual.md) | Manuell | RDTS-214 |
| [TEST-RDTS-215-001](tests/auto/TEST-RDTS-215-001.md) | Automatisch | RDTS-215 |
| [TEST-RDTS-215-001-manual](tests/manual/TEST-RDTS-215-001-manual.md) | Manuell | RDTS-215 |
| [TEST-RDTS-216-001](tests/auto/TEST-RDTS-216-001.md) | Automatisch | RDTS-216 |
| [TEST-RDTS-216-001-manual](tests/manual/TEST-RDTS-216-001-manual.md) | Manuell | RDTS-216 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-K8S-002 | SFN-K8S-001 | Voraussetzung (Container-Image muss existieren) |
