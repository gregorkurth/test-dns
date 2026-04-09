# OBJ-14: Release Management

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-1: CI/CD Pipeline (Pipeline erstellt Release-Artefakte bei Tags)
- OBJ-17: SBOM & Security-Scanning (SBOM ist Pflichtbestandteil jedes Releases)
- OBJ-22: Release-Artefaktprüfung / Publish-Gate (finaler Artefaktinhalt muss freigegeben sein)
- OBJ-18: Artefakt-Registry (Harbor/Nexus-Ablage als Release-Schritt)
- OBJ-19: Zarf-Paket (Zarf-Paket als Release-Artefakt)

## User Stories
- Als Entwickler möchte ich ein Release durch das Setzen eines Git-Tags (`v1.2.3`) auslösen können, damit der Release-Prozess reproduzierbar und einfach ist.
- Als Mission Network Operator möchte ich im GitLab-Release-Bereich alle Versionen mit Changelog und Download-Links finden.
- Als Platform Engineer möchte ich wissen, welche Änderungen in einem Release enthalten sind, damit ich entscheide, ob ein Update nötig ist.
- Als Entwickler möchte ich, dass der CHANGELOG automatisch aus Commit-Messages generiert wird.
- Als Platform Engineer möchte ich Release-Artefakte als signierte Artefakte herunterladen können, damit ich deren Integrität verifizieren kann.
- Als Security-Verantwortlicher möchte ich, dass jedes Release eine SBOM enthält, damit ich die Abhängigkeiten vollständig kenne.
- Als Platform Engineer möchte ich, dass Container-Images bei jedem Release in Harbor veröffentlicht werden, damit ich sie in der Zielumgebung verfügbar habe.
- Als Platform Engineer in einer Zielumgebung möchte ich ein Zarf-Paket als Bestandteil des Releases erhalten, damit ich die App ohne Internetzugang installieren kann.
- Als Nutzer moechte ich pro Release eine versionierte Update-Hinweisquelle haben, damit GUI-Hinweise und Release-Notizen konsistent sind.

## Acceptance Criteria
- [ ] Versionierung folgt SemVer (MAJOR.MINOR.PATCH)
- [ ] Git-Tags folgen dem Format `v<MAJOR>.<MINOR>.<PATCH>` (z. B. `v1.0.0`)
- [ ] `CHANGELOG.md` im Repository-Root vorhanden und aktuell
- [ ] CHANGELOG wird automatisch aus Conventional Commits generiert
- [ ] GitLab Release wird automatisch via CI/CD Pipeline (OBJ-1) bei Tag-Push erstellt
- [ ] GitLab Release enthält: Release Notes (aus CHANGELOG), Container-Image-Referenz, K8s-Manifest-Bundle als ZIP-Anhang
- [ ] Container-Image wird mit dem Release-Tag und `latest` getaggt
- [ ] Release-Artefakte werden mit cosign signiert
- [ ] Pre-Release-Versionen folgen dem Format `v1.0.0-rc.1` oder `v1.0.0-beta.1`
- [ ] SBOM wird bei jedem Release erzeugt (via `syft`) und als Release-Anhang beigefügt (OBJ-17)
- [ ] Release wird nur veröffentlicht, wenn die Prüfung des finalen Artefaktinhalts erfolgreich war und ein Prüfbericht vorliegt (OBJ-22)
- [ ] Container-Image wird nach erfolgreichen Security-Scans in Harbor veröffentlicht (OBJ-18)
- [ ] Weitere Build-Artefakte (Helm Charts, K8s-Manifeste) werden in Nexus oder Harbor abgelegt (OBJ-18)
- [ ] Zarf-Paket wird als Release-Artefakt erzeugt und dem Release zugeordnet (OBJ-19)
- [ ] Release enthaelt ein importierbares Artefakt fuer das Ziel-Gitea-Release-Projekt (Deployment-Stand)
- [ ] Das zugehoerige Konfigurationsprojekt fuer Helm-Values und Parameter ist als separates Gitea-Projekt referenziert
- [ ] Release erzeugt oder aktualisiert eine versionierte Update-Hinweisquelle im Repository (z. B. `docs/releases/UPDATE-NOTICES.json`)
- [ ] Release Notes und Update-Hinweise sind inhaltlich konsistent (Version, Kritikalitaet, Kernaenderungen)
- [ ] Release-Checkliste enthält: SBOM vorhanden, Security-Scans bestanden, Zarf-Paket verfügbar, Dokumentation aktuell
- [ ] Release-Artefakte sind vollständig dokumentiert: Versionsnummer, SHA-256-Prüfsummen, Artefakt-URLs

## Edge Cases
- Was passiert wenn ein Tag ohne Conventional-Commit-History gesetzt wird? → CHANGELOG zeigt "No changes documented"; Release wird trotzdem erstellt
- Was wenn ein Release rückgängig gemacht werden muss? → Patch-Version inkrementieren; keine Löschung veröffentlichter Tags
- Was wenn das Signing-Schlüsselpaar abläuft? → Schlüsselrotation-Prozess in Betriebsdoku beschrieben
- Was wenn der Zarf-Build fehlschlägt? → Release-Pipeline bricht ab; kein unvollständiges Release wird veröffentlicht
- Was wenn Harbor nicht erreichbar ist? → Pipeline-Schritt schlägt fehl; kein Release wird abgeschlossen
- Was wenn die SBOM nicht generiert werden kann? → Release wird geblockt; SBOM ist Pflichtbestandteil
- Was wenn die Artefaktprüfung interne Dateien oder Sourcemaps im Release findet? → Release wird blockiert bis das Paket bereinigt oder die Ausnahme dokumentiert ist
- Was wenn Update-Hinweise fuer ein Release fehlen? → Release gilt als unvollstaendig und wird nicht freigegeben

## Technical Requirements
- Commit-Konvention: Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- CHANGELOG-Generator: `release-please` (Google) oder `conventional-changelog-cli`
- Artefakt-Signing: cosign (Keyless oder Key-basiert)
- Primaere Git-Plattform: GitLab (Releases via GitLab Releases API); Zielumgebungs-Git: Gitea (Import des Release-Projekts + separates Konfigurationsprojekt)
- Image-Registry: Harbor (primär), Nexus für weitere Artefakte (OBJ-18)
- Offline-Paket: Zarf-CLI in Pipeline-Umgebung verfügbar; `zarf.yaml` im Repository (OBJ-19)
- SBOM-Tool: syft; Format: CycloneDX oder SPDX (OBJ-17)
- Update-Hinweisquelle: versionierte Datei im Repository, releasebezogen erzeugt/geprueft

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
