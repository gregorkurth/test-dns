# Capability: DevOps

> **Capability ID:** CAP-005
> **NATO C3 Taxonomie:** Communication and Information Services > Platform Services > DevOps
> **FMN-Referenz:** App-Template-Anweisung v3 (intern)
> **Maturität:** L0 – Idea (Stand: 2026-04-03)

---

## Beschreibung

Die DevOps-Capability stellt sicher, dass die DNS-Konfigurations-App über automatisierte CI/CD Pipelines gebaut, getestet und deployt wird. Sie umfasst GitHub Actions oder GitLab CI Workflows, Container-Image-Build, Release Management mit SemVer-Versionierung, automatisierter CHANGELOG-Generierung und kontrollierter Freigabe von Release-Artefakten.

---

## Services

| ID | Service | Beschreibung | Spec |
|----|---------|-------------|------|
| SVC-DEV-CICD | CI/CD Pipeline | GitHub Actions für Build, Test, Deployment | [README](services/cicd-pipeline/README.md) |
| SVC-DEV-RELEASE | Release Management | SemVer, CHANGELOG, Artefakt-Signing | [README](services/release-management/README.md) |

---

## Service Functions

| SFN-ID | Service Function | Service | Quelle |
|--------|-----------------|---------|--------|
| SFN-DEV-001 | PR Checks | SVC-DEV-CICD | [ARCH] |
| SFN-DEV-002 | Image Build | SVC-DEV-CICD | [ARCH] |
| SFN-DEV-003 | Semantic Versioning | SVC-DEV-RELEASE | [ARCH] |
| SFN-DEV-004 | Release Automation | SVC-DEV-RELEASE | [ARCH] |

---

## Abhängigkeiten

| DPD-ID | Abhängigkeit | Typ | Beschreibung |
|--------|-------------|-----|-------------|
| DPD-DEV-001 | CAP-002 Kubernetes Platform | Nutzer | Pipeline deployt K8s-Manifeste |
| DPD-DEV-002 | OBJ-3 REST API | Voraussetzung | API-Tests laufen in der Pipeline |

---

## Links

- [Maturity Status](maturity.md)
- [Products & Licenses](products.md)
- [App-Template-Anweisung v3](../../req-init/app-template-3.md)
