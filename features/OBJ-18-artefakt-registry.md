# OBJ-18: Artefakt-Registry (Harbor / Nexus)

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-04

## Dependencies
- OBJ-1: CI/CD Pipeline (Pipeline pusht Images und Artefakte in die Registry)
- OBJ-17: SBOM & Security-Scanning (Security-Ergebnisse werden in der Registry archiviert)
- OBJ-22: Release-Artefaktprüfung / Publish-Gate (nur freigegebene Artefakte werden veröffentlicht)
- OBJ-19: Zarf-Paket (Zarf liest Artefakte aus der Registry für den Offline-Export)

## User Stories
- Als Platform Engineer möchte ich Container-Images in Harbor verwalten, damit ich eine klare, versionierte Übersicht aller bereitgestellten Images habe.
- Als Platform Engineer möchte ich weitere Artefakte (Helm Charts, K8s-Manifeste, SBOMs, Security-Reports) in Nexus oder Harbor ablegen, damit alle Release-Bestandteile zentral verfügbar sind.
- Als Operator in einer Zielumgebung möchte ich aus dem Zarf-Paket definierte Artefaktlisten entnehmen können, damit ich genau weiss, welche Images ins Paket einfliessen.
- Als Entwickler möchte ich sicherstellen, dass Container-Images erst nach bestandenen Security-Scans in Harbor veröffentlicht werden, damit keine unsicheren Images in die Registry gelangen.
- Als Platform Engineer möchte ich Artefakten eindeutige Versionen und Herkunftsangaben zuordnen, damit ich jederzeit nachvollziehen kann, aus welchem Build ein Artefakt stammt.

## Acceptance Criteria
- [ ] Container-Images werden in Harbor (primär) nach jedem erfolgreichen Build auf `main` oder bei Release-Tags gespeichert
- [ ] Images werden mit Git-SHA und Git-Tag getaggt (z.B. `image:sha-abc123`, `image:v1.2.0`, `image:latest`)
- [ ] Container-Images werden erst nach bestandenen Security-Scans (OBJ-17) in Harbor veröffentlicht
- [ ] Weitere Release-Artefakte (Helm Charts, K8s-Manifest-Bundles, SBOMs, Security-Reports) werden in Nexus oder Harbor abgelegt
- [ ] Publishbare Artefakte werden nur nach erfolgreicher Artefaktprüfung veröffentlicht; der Prüfbericht ist mit Artefakt oder Release verknüpft (OBJ-22)
- [ ] Jedes Artefakt trägt Metadaten: Versionsnummer, Build-Datum, Git-SHA, Build-Pipeline-Link
- [ ] Zugangsdaten für Harbor und Nexus werden als CI/CD-Secrets verwaltet (nie im Repository)
- [ ] Artefakt-Liste für Zarf-Export ist definiert und gepflegt: welche Images und Dateien ins Zarf-Paket einfliessen (OBJ-19)
- [ ] Alte Artefakte werden nach einer konfigurierbaren Retention-Policy bereinigt (konfigurierbar in Harbor/Nexus)
- [ ] Harbor/Nexus-Konfiguration (Projects, Policies, Repositories) ist als Code beschrieben oder dokumentiert

## Edge Cases
- Was wenn Harbor nicht erreichbar ist? → Pipeline-Schritt schlägt fehl; kein Image wird deployt; Fehler klar gemeldet
- Was wenn ein Image-Push fehlschlägt (Speicherplatz, Netzwerk)? → Pipeline schlägt fehl; kein Release wird abgeschlossen
- Was wenn ein Artefakt mit demselben Tag bereits existiert? → Überschreiben nur für `latest` erlaubt; versionierte Tags sind immutable
- Was wenn Zugangsdaten abgelaufen sind? → Pipeline schlägt mit klarem Authentifizierungsfehler fehl; Alert an Betreiber
- Was wenn ein Artefakt die Security-Scans besteht, aber an der Artefaktprüfung scheitert? → Kein Publish; Artefakt bleibt unveröffentlicht bis der Paketinhalt bereinigt ist
- Was wenn Harbor in der Zielumgebung eine andere Version hat? → Kompatibilitätshinweise in `docs/operations.md`

## Technical Requirements
- Container-Registry: Harbor (primär, OCI-kompatibel)
- Artefakt-Repository: Nexus Repository Manager (für Helm Charts, NPM-Pakete, Maven-Artefakte etc.) oder Harbor OCI-Artefakte
- Image-Tagging: Git-SHA (immer) + Git-Tag (bei Release) + `latest` (bei `main`-Merge)
- Zugangsdaten: CI/CD-Secrets (GitLab CI Variables / GitHub Actions Secrets)
- Retention Policy: Konfigurierbar (z.B. letzte 10 Tags pro Repository behalten, `latest` immer)
- Zarf-Artefaktliste: In `zarf.yaml` definiert; muss mit tatsächlichen Registry-Pfaden übereinstimmen (OBJ-19)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
