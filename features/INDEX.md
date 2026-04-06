# Feature Index

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Planned** - Requirements written, ready for development
- **In Progress** - Currently being built
- **In Review** - QA testing in progress
- **Completed** - Merged to main, implementation and QA finished
- **Deployed** - Live in production

## Features

| ID | Feature | Phase | Status | Spec | Created |
|----|---------|-------|--------|------|---------|
| OBJ-1 | CI/CD Pipeline | 1 – Infrastruktur | In Progress | [OBJ-1-cicd-pipeline.md](OBJ-1-cicd-pipeline.md) | 2026-04-03 |
| OBJ-2 | Dokumentation | 1 – Infrastruktur | In Progress | [OBJ-2-dokumentation.md](OBJ-2-dokumentation.md) | 2026-04-03 |
| OBJ-3 | REST API | 2 – API-Fundament | In Progress | [OBJ-3-rest-api.md](OBJ-3-rest-api.md) | 2026-04-03 |
| OBJ-4 | Capabilities Dashboard | 3 – P0 MVP | In Review | [OBJ-4-capabilities-dashboard.md](OBJ-4-capabilities-dashboard.md) | 2026-03-17 |
| OBJ-5 | Participant Configuration Form | 3 – P0 MVP | Planned | [OBJ-5-participant-configuration-form.md](OBJ-5-participant-configuration-form.md) | 2026-03-17 |
| OBJ-6 | DNS Zone File Generator | 3 – P0 MVP | Planned | [OBJ-6-dns-zone-file-generator.md](OBJ-6-dns-zone-file-generator.md) | 2026-03-17 |
| OBJ-7 | Requirements Traceability View | 4 – P1 DNS | Planned | [OBJ-7-requirements-traceability-view.md](OBJ-7-requirements-traceability-view.md) | 2026-03-17 |
| OBJ-8 | Export & Download | 4 – P1 DNS | Planned | [OBJ-8-export-download.md](OBJ-8-export-download.md) | 2026-03-17 |
| OBJ-9 | Manual Test Runner | 4 – P1 DNS | Planned | [OBJ-9-manual-test-runner.md](OBJ-9-manual-test-runner.md) | 2026-04-03 |
| OBJ-23 | Test Execution Dashboard | 4 – P1 DNS | Completed | [OBJ-23-test-execution-dashboard.md](OBJ-23-test-execution-dashboard.md) | 2026-04-04 |
| OBJ-10 | Kubernetes Deployment | 5 – Plattform | Planned | [OBJ-10-kubernetes-deployment.md](OBJ-10-kubernetes-deployment.md) | 2026-04-03 |
| OBJ-11 | Monitoring & Observability (OpenTelemetry) | 5 – Plattform | Planned | [OBJ-11-monitoring-observability.md](OBJ-11-monitoring-observability.md) | 2026-04-03 |
| OBJ-12 | Security & Authentifizierung | 5 – Plattform | Planned | [OBJ-12-security-authentifizierung.md](OBJ-12-security-authentifizierung.md) | 2026-04-03 |
| OBJ-13 | Kubernetes Operator | 5 – Plattform | Planned | [OBJ-13-kubernetes-operator.md](OBJ-13-kubernetes-operator.md) | 2026-04-03 |
| OBJ-14 | Release Management | 6 – Produktabschluss | Planned | [OBJ-14-release-management.md](OBJ-14-release-management.md) | 2026-04-03 |
| OBJ-15 | Produkt-Website | 6 – Produktabschluss | Planned | [OBJ-15-produkt-website.md](OBJ-15-produkt-website.md) | 2026-04-03 |
| OBJ-16 | Maturitätsstatus / Reifegradübersicht | 6 – Produktabschluss | Planned | [OBJ-16-maturitaetsstatus.md](OBJ-16-maturitaetsstatus.md) | 2026-04-03 |
| OBJ-17 | SBOM & Security-Scanning | 6 – Produktabschluss | Planned | [OBJ-17-sbom-security-scanning.md](OBJ-17-sbom-security-scanning.md) | 2026-04-03 |
| OBJ-22 | Release-Artefaktprüfung / Publish-Gate | 6 – Produktabschluss | Planned | [OBJ-22-release-artefaktpruefung-publish-gate.md](OBJ-22-release-artefaktpruefung-publish-gate.md) | 2026-04-04 |
| OBJ-18 | Artefakt-Registry (Harbor / Nexus) | 6 – Produktabschluss | Planned | [OBJ-18-artefakt-registry.md](OBJ-18-artefakt-registry.md) | 2026-04-03 |
| OBJ-19 | Zarf-Paket / Offline-Weitergabe | 6 – Produktabschluss | Planned | [OBJ-19-zarf-paket-offline-weitergabe.md](OBJ-19-zarf-paket-offline-weitergabe.md) | 2026-04-03 |
| OBJ-20 | Zielumgebung / Import / Rehydrierung | 6 – Produktabschluss | Planned | [OBJ-20-zielumgebung-import-rehydrierung.md](OBJ-20-zielumgebung-import-rehydrierung.md) | 2026-04-03 |
| OBJ-21 | GitOps / Argo CD / App-of-Apps | 6 – Produktabschluss | Planned | [OBJ-21-gitops-argocd.md](OBJ-21-gitops-argocd.md) | 2026-04-03 |

<!-- Add features above this line -->

## Empfohlene Build-Reihenfolge

```
Phase 1 – Infrastruktur (vor dem ersten Code)
  OBJ-1  CI/CD Pipeline            ← GitHub Actions aufsetzen
  OBJ-2  Dokumentation             ← Struktur anlegen, wächst mit

Phase 2 – API-Fundament
  OBJ-3  REST API                  ← Datenlayer für alle GUI-Features

Phase 3 – P0 MVP (DNS Kernfunktionen)
  OBJ-4  Capabilities Dashboard    ← liest GET /api/v1/capabilities
  OBJ-5  Participant Config Form   ← schreibt POST/PUT /api/v1/participants
  OBJ-6  DNS Zone File Generator   ← POST /api/v1/zones/generate

Phase 4 – P1 (Erweiterte DNS-Features)
  OBJ-7  Requirements Traceability View
  OBJ-8  Export & Download
  OBJ-9  Manual Test Runner
  OBJ-23 Test Execution Dashboard   ← Teststatus (Passed/Failed/Never) je OBJ/Run/Release

Phase 5 – Plattform & Betrieb
  OBJ-10 Kubernetes Deployment     ← App containerisieren
  OBJ-11 Monitoring & Observability ← OTel hinzufügen
  OBJ-12 Security & Authentifizierung ← Auth + RBAC
  OBJ-13 Kubernetes Operator       ← braucht OBJ-10 + OBJ-3 + OBJ-12

Phase 6 – Produktabschluss
  OBJ-14 Release Management        ← SemVer, CHANGELOG, Freigabeprozess
  OBJ-15 Produkt-Website           ← Landing-Page
  OBJ-16 Maturitätsstatus          ← braucht OBJ-7, OBJ-9, OBJ-23, OBJ-2
  OBJ-17 SBOM & Security-Scanning  ← braucht OBJ-1 (Pipeline), OBJ-14 (Release)
  OBJ-18 Artefakt-Registry         ← braucht OBJ-1 (Pipeline), OBJ-17 (Scans), OBJ-22 (Gate)
  OBJ-21 GitOps / Argo CD          ← baut Argo-CD-Basis für OBJ-19 und OBJ-20
  OBJ-19 Zarf-Paket                ← braucht OBJ-18 (Images), OBJ-10 (Manifeste), OBJ-21 (Argo)
  OBJ-22 Release-Artefaktprüfung   ← braucht OBJ-1, OBJ-14, OBJ-17, OBJ-19
  OBJ-20 Zielumgebung / Import     ← braucht OBJ-19 (Paket), OBJ-21 (Argo)
```

## Next Available ID: OBJ-24
