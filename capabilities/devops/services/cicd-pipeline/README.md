# Service: CI/CD Pipeline

> **Service ID:** SVC-DEV-CICD
> **Capability:** DevOps (CAP-005)
> **Quelldokument:** App-Template-Anweisung, Abschnitt 9

---

## Beschreibung

Die CI/CD Pipeline automatisiert Build, Test und Deployment der App via GitLab CI (fuehrend) und optional GitHub Actions fuer Spiegelbetrieb. PR-/MR-Checks laufen bei jedem Push, Container-Images werden bei Merge auf `main` gebaut, Releases werden bei Tag-Push erstellt und finale Artefakte werden vor Publish gegen eine Freigaberichtlinie geprueft. Policy-Gates pruefen zusaetzlich Sicherheitsprofile und FMN-relevante Netzwerkfreigaben.

---

## Service Functions

| ID | Service Function | Beschreibung |
|----|-----------------|-------------|
| SFN-DEV-001 | PR Checks | Lint, Type-Check, Tests, Build-Check bei Pull Requests |
| SFN-DEV-002 | Image Build | Container-Image-Build und Push bei main-Branch |

---

## Quelldokumente

- App-Template-Anweisung, Abschnitt 9: CI/CD Pipeline
- Feature-Spec OBJ-1: CI/CD Pipeline
