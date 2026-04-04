# OBJ-1: CI/CD Pipeline

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-04

## Dependencies
- OBJ-10: Kubernetes Deployment (Pipeline deployt K8s-Manifeste)
- OBJ-3: REST API (API-Tests laufen in der Pipeline)
- OBJ-14: Release Management (Pipeline erstellt Release-Artefakte bei Tags)
- OBJ-17: SBOM & Security-Scanning (Pipeline-Schritte für SBOM und Scans)
- OBJ-18: Artefakt-Registry (Pipeline pusht Images und Artefakte in Harbor/Nexus)
- OBJ-19: Zarf-Paket (Pipeline baut Zarf-Paket als Release-Schritt)
- OBJ-22: Release-Artefaktprüfung / Publish-Gate (finale Inhaltsprüfung vor Publish oder Export)

## User Stories
- Als Entwickler möchte ich, dass bei jedem Push auf einen Feature-Branch automatisch Lint, Tests und ein Build-Check ausgeführt werden, damit ich Fehler frühzeitig erkenne.
- Als Entwickler möchte ich, dass bei einem Merge auf `main` ein Container-Image gebaut und in Harbor/Nexus gepusht wird, damit ein Deploy-Ready-Artefakt entsteht.
- Als Platform Engineer möchte ich, dass die Pipeline bei einem Git-Tag (z. B. `v1.2.0`) automatisch ein Release erstellt, damit der Deploymentprozess reproduzierbar ist.
- Als Teamleiter möchte ich den Pipeline-Status im Merge-Request (GitLab) oder Pull-Request (GitHub) sehen, damit ich auf einen Blick weiss, ob der Build grün ist.
- Als Entwickler möchte ich, dass die Pipeline-Konfiguration im Repository liegt, damit sie versioniert und nachvollziehbar ist.
- Als Security-Verantwortlicher möchte ich, dass die Pipeline automatisch Security-Scans und eine SBOM erzeugt, damit Schwachstellen frühzeitig erkannt werden.
- Als Platform Engineer möchte ich, dass die Pipeline ein Zarf-Paket für die Offline-Weitergabe erzeugt, damit die App in getrennten Zielumgebungen installiert werden kann.

## Acceptance Criteria
- [ ] CI/CD-Pipeline-Konfiguration liegt vollständig im Repository (`.github/workflows/` für GitHub Actions, `.gitlab-ci.yml` für GitLab CI)
- [ ] Pipeline für Merge/Pull Requests: Lint, Type-Check, Tests, Build-Check
- [ ] Pipeline für `main`-Branch: alle PR-Checks + Docker-Image-Build + Push in Harbor/Nexus
- [ ] Pipeline für Tags (`v*`): alle main-Checks + Release-Erzeugung + SBOM + Security-Scans + Zarf-Paket-Build
- [ ] Container-Image wird mit Multi-Stage-Dockerfile gebaut (Build-Stage + Runtime-Stage)
- [ ] Image wird getaggt mit Git-SHA und Git-Tag (falls vorhanden)
- [ ] Pipeline-Laufzeit für PR/MR-Check < 5 Minuten
- [ ] Secrets (Registry-Credentials, Signing-Keys) werden als CI/CD-Secrets verwaltet (nie im Repo)
- [ ] Pipeline schlägt bei fehlgeschlagenem Test oder Build-Fehler fehl (kein Silent-Fail)
- [ ] SBOM wird bei Release-Builds erzeugt (via `syft`) und dem Release zugeordnet
- [ ] Security-Scan (SAST, SCA, Container-CVE) läuft bei Release-Builds (via `trivy` o. ä.)
- [ ] Ein Gate-Schritt prüft vor Publish oder Release den final erzeugten Artefaktinhalt gegen eine versionierte Freigaberichtlinie (OBJ-22)
- [ ] Container-Images werden nach erfolgreichen Scans in Harbor veröffentlicht
- [ ] Weitere Build-Artefakte (Helm Charts, Manifeste) werden in Nexus oder Harbor abgelegt
- [ ] Zarf-Paket wird bei Release-Builds erzeugt und als Pipeline-Artefakt gespeichert
- [ ] Delivery-Kette ist im Repository dokumentiert: Code → Build → Test → Scan → Registry → Zarf → Release

## Edge Cases
- Was passiert wenn ein Test flaky ist (sporadisch fehlschlägt)? → Kein automatisches Retry; Entwickler muss manuell neu starten
- Was wenn Harbor/Nexus nicht erreichbar sind? → Pipeline-Schritt schlägt fehl; kein Image wird deployt; Fehler klar gemeldet
- Was wenn ein Tag wie `v1.0.0` bereits existiert? → Pipeline schlägt fehl; keine doppelten Releases
- Was wenn der Security-Scan kritische Findings meldet? → Pipeline schlägt fehl; Release wird geblockt bis Findings bewertet sind
- Was wenn die Artefaktprüfung unerlaubte Inhalte erkennt? → Pipeline schlägt fehl; Artefakt wird weder publiziert noch exportiert
- Was wenn der Zarf-Build fehlschlägt? → Release-Pipeline bricht ab; kein unvollständiges Release wird veröffentlicht
- Was wenn GitLab CI und GitHub Actions beide verwendet werden? → Gemeinsame Pipeline-Logik in Scripts; CI-spezifische Trigger-Dateien getrennt

## Technical Requirements
- CI/CD primär: GitLab CI (`.gitlab-ci.yml`); sekundär: GitHub Actions (`.github/workflows/*.yml`)
- Container-Build: Docker (Multi-Stage), Dockerfile im Repository-Root
- Image-Registry: Harbor (primär), Nexus für weitere Artefakte
- Artefakt-Signing: cosign (optional für v1, Pflicht für v2)
- SBOM-Tool: syft (bei Release-Builds)
- Security-Scanning: trivy (Container, Filesystem), semgrep (SAST) – konfigurierbar
- Zarf-CLI: in Pipeline-Umgebung verfügbar; zarf.yaml im Repository

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
