# Capability: DevOps

> **Capability ID:** CAP-005
> **NATO C3 Taxonomie:** Communication and Information Services > Platform Services > DevOps
> **FMN-Referenz:** App-Template-Anweisung (intern)
> **Maturität:** L0 – Idea (Stand: 2026-04-03)

---

## Beschreibung

Die DevOps-Capability stellt sicher, dass die DNS-Konfigurations-App ueber automatisierte CI/CD Pipelines gebaut, getestet und deployt wird. Sie umfasst GitLab CI als fuehrenden Workflow (optional GitHub Actions fuer Spiegelbetrieb), Container-Image-Build, Release Management mit SemVer-Versionierung, automatisierter CHANGELOG-Generierung und kontrollierter Freigabe von Release-Artefakten. Zusaetzlich erzwingt sie Sicherheitsprofile und Policy-Gates fuer `prod` (u. a. `strict`/OpenBao/ClickHouse und FMN-Kommunikationsmatrix-Pruefung).

---

## Services

| ID | Service | Beschreibung | Spec |
|----|---------|-------------|------|
| SVC-DEV-CICD | CI/CD Pipeline | GitLab CI (fuehrend), optional GitHub Actions fuer Spiegelbetrieb | [README](services/cicd-pipeline/README.md) |
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
- [App-Template-Anweisung](../../req-init/app-template.md)
