# OBJ-17: SBOM & Security-Scanning

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-03

## Dependencies
- OBJ-1: CI/CD Pipeline (Pipeline erzeugt SBOM und führt Security-Scans durch)
- OBJ-14: Release Management (Release enthält SBOM als Pflichtbestandteil)
- OBJ-18: Artefakt-Registry (Security-Ergebnisse werden in Harbor/Nexus archiviert)

## User Stories
- Als Security-Verantwortlicher möchte ich für jede releasefähige Version eine SBOM vorliegen haben, damit ich die Softwareabhängigkeiten vollständig kenne und nachvollziehen kann.
- Als Security-Verantwortlicher möchte ich, dass automatisch Security-Scans auf Code-, Dependency-, Container- und Konfigurations-Ebene durchgeführt werden, damit Schwachstellen frühzeitig erkannt werden.
- Als Security-Verantwortlicher möchte ich, dass kritische Security-Findings vor einer Freigabe bewertet und dokumentiert werden, damit keine ungeklärten Risiken in Produktion gelangen.
- Als Auditor möchte ich Security-Ergebnisse versionsbezogen archiviert finden, damit ich für jedes Release nachvollziehen kann, welche Scans durchgeführt wurden und was ihre Ergebnisse waren.
- Als Platform Engineer möchte ich SBOM und Security-Ergebnisse als Bestandteil der Übergabe- und Freigabeunterlagen erhalten, damit ich die App in der Zielumgebung ohne offene Sicherheitsfragen installieren kann.
- Als Entwickler möchte ich bei jedem Build sofortiges Feedback zu bekannten Schwachstellen erhalten, damit ich Probleme noch vor dem Release beheben kann.

## Acceptance Criteria
- [ ] SBOM wird bei jedem Release-Build erzeugt (via `syft`) im Format CycloneDX oder SPDX
- [ ] SBOM umfasst alle direkten und transitiven Abhängigkeiten (Frontend, Backend, Basis-Images)
- [ ] SBOM wird dem Release als Anhang zugeordnet (OBJ-14) und in der Artefakt-Registry archiviert (OBJ-18)
- [ ] SAST-Scan (Code-Ebene via `semgrep`) läuft bei jedem CI-Build; Ergebnisse im SARIF-Format
- [ ] SCA-Scan (Dependency-Ebene via `npm audit` / `trivy fs`) läuft bei jedem CI-Build
- [ ] Container-Image-Scan (CVE via `trivy image`) läuft bei Release-Builds
- [ ] Container-Image-Scan umfasst Runtime-Base-Image (inkl. Digest) und prueft freigegebenes gehaertetes Minimal-Base
- [ ] Konfigurations-Scan (Misconfiguration via `trivy config`) läuft bei Release-Builds auf K8s-Manifesten und Helm Charts
- [ ] Kritische Findings (CVSS ≥ 9.0) blockieren automatisch das Release bis zur dokumentierten Accept/Fix-Entscheidung
- [ ] Security-Ergebnisse werden versionsbezogen archiviert (als Release-Anhang im JSON- oder SARIF-Format)
- [ ] SBOM und Security-Ergebnisse sind Bestandteil der Übergabe- und Freigabeunterlagen für jede Auslieferung
- [ ] Scan-Konfigurationen liegen im Repository (`.trivy.yaml`, `.semgrep.yaml`) und sind versioniert
- [ ] Security-Status ist im Maturitätsstatus (OBJ-16) sichtbar: SBOM vorhanden, Scans bestanden, kritische Findings offen

## Edge Cases
- Was wenn ein Security-Scan ein kritisches Finding meldet? → Release wird geblockt; Finding muss mit Accept/Fix-Entscheid dokumentiert werden bevor Release fortgesetzt werden kann
- Was wenn die SBOM unvollständig ist (Transitiv-Abhängigkeiten fehlen)? → syft-Konfiguration mit vollständigem Scan-Scope prüfen; SBOM-Vollständigkeit ist Teil des Release-Review-Kriteriums
- Was wenn trivy-Datenbanken in einer airgapped Umgebung nicht aktualisierbar sind? → Offline-DB-Update via Zarf-Paket (OBJ-19) – trivy-DB als Bestandteil ins Paket einschliessen
- Was wenn ein bekanntes False-Positive immer wieder gemeldet wird? → Suppression-File (`.trivyignore`) mit dokumentiertem Grund; liegt im Repository
- Was wenn semgrep-Regeln zu viele False-Positives erzeugen? → Regel-Set konfigurieren; eigene `.semgrep-ignore`-Datei mit Begründungen
- Was wenn kein Release-Build gestartet wurde? → SBOM-Status zeigt "Nicht verfügbar"; kein Fehler in der App

## Technical Requirements
- SBOM-Tool: `syft` (Anchore); Format: CycloneDX 1.4+ oder SPDX 2.3+
- SAST: `semgrep` mit Community-Regelset (owasp-top-ten, security-audit)
- SCA: `trivy fs` (Filesystem-Scan) + `npm audit`
- Container-CVE: `trivy image` (gegen finales Container-Image)
- Konfigurationsscan: `trivy config` (Kubernetes-Manifeste, Helm Charts)
- Ergebnisformat: SARIF (für GitHub/GitLab Security-Integration) und JSON (für Archivierung)
- Archivierung: Release-Anhang in GitLab/GitHub Releases + Nexus/Harbor (OBJ-18)
- Scan-Konfigurationen: `.trivy.yaml`, `.trivyignore`, `.semgrep.yaml` im Repository-Root
- Offline-Betrieb: trivy-Offline-Datenbank als Bestandteil des Zarf-Pakets (OBJ-19)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
