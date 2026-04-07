# OBJ-19: Zarf-Paket / Offline-Weitergabe

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-07

## Dependencies
- OBJ-1: CI/CD Pipeline (Zarf-Paket-Build ist Bestandteil der Release-Pipeline)
- OBJ-18: Artefakt-Registry (Zarf liest Container-Images aus Harbor)
- OBJ-20: Zielumgebung / Import (Zarf-Paket wird in der Zielumgebung importiert)
- OBJ-21: GitOps / Argo CD (Argo-CD-Definitionen sind Bestandteil des Zarf-Pakets)
- OBJ-10: Kubernetes Deployment (K8s-Manifeste und Helm Charts im Zarf-Paket)

## User Stories
- Als Platform Engineer in einer getrennten Zielumgebung möchte ich die App aus einem Zarf-Paket installieren können, ohne Zugriff auf die Ursprungsumgebung oder das Internet zu benötigen.
- Als Release-Verantwortlicher möchte ich ein Zarf-Paket als Bestandteil jedes Releases erhalten, damit die Übergabe an Zielumgebungen standardisiert und vollständig ist.
- Als Platform Engineer möchte ich sicherstellen, dass das Zarf-Paket alle notwendigen Bestandteile enthält, damit keine manuelle Nacharbeit in der Zielumgebung nötig ist.
- Als Entwickler möchte ich die Zarf-Paketdefinition (`zarf.yaml`) im Repository versionieren, damit der Paket-Build reproduzierbar ist.
- Als Platform Engineer möchte ich das Zarf-Paket in eine Ziel-Registry (Harbor) laden können, ohne externe Quellen zu kontaktieren.
- Als Platform Engineer moechte ich den Release-Stand als importierbares Ziel-Gitea-Projekt aus dem Zarf-Prozess bereitstellen koennen, damit Argo CD lokal ohne Quellzugriff arbeiten kann.

## Acceptance Criteria
- [ ] `zarf.yaml` (Paketdefinition) liegt im Repository-Root und ist versioniert
- [ ] Zarf-Paket enthält: Container-Images (alle App-Komponenten), Helm Charts / K8s-Manifeste, Argo-CD-Application-Definitionen, Konfigurationsdateien, Migrations-/Initialisierungslogik
- [ ] Zarf-Paket enthält optional: trivy-Offline-Datenbank für Security-Scans in der Zielumgebung (OBJ-17)
- [ ] Zarf-Paket-Build ist Bestandteil der Release-Pipeline (OBJ-1) und wird als Pipeline-Artefakt gespeichert
- [ ] Zarf-Paket wird als Release-Artefakt dem Release zugeordnet (OBJ-14)
- [ ] Zarf-Release enthaelt den deploybaren Release-Stand fuer den Import in ein lokales Gitea-Release-Projekt
- [ ] Das separate Gitea-Konfigurationsprojekt (Helm Values, Parameter, Overlays) ist als Pflichtquelle fuer das spaetere App-of-Apps-Deployment dokumentiert und versioniert
- [ ] Das tatsächlich erzeugte Zarf-Paket liefert einen prüfbaren finalen Paketinhalt für die nachgelagerte Artefaktprüfung vor Publish oder Übergabe (OBJ-22)
- [ ] Paket-Import in einer getrennten Zielumgebung ist vollständig dokumentiert (`docs/offline-install.md`, OBJ-2)
- [ ] Paket ist in einer Zielumgebung ohne Internetzugang reproduzierbar importierbar (OBJ-20)
- [ ] `zarf.yaml` enthält exakte Image-Referenzen mit SHA-Digest (kein `latest`)
- [ ] Zarf-Paket-Build schlägt fehl, wenn ein referenziertes Image nicht in Harbor verfügbar ist

## Edge Cases
- Was wenn der Zarf-Build fehlschlägt weil ein Image nicht in Harbor verfügbar ist? → Klarer Build-Fehler; Release-Pipeline bricht ab; kein unvollständiges Paket wird veröffentlicht
- Was wenn die `zarf.yaml` nicht mit den tatsächlichen Manifesten übereinstimmt? → Zarf-Paket-Validierung als CI-Schritt; Inkonsistenz wird als Build-Fehler gemeldet
- Was wenn das Paket zu gross wird (viele Images)? → Image-Optimierung (Multi-Stage-Builds, Alpine-Basis); Grössen-Check als CI-Schritt
- Was wenn das Zarf-Paket vollständig ist, aber eine unerlaubte Datei enthält? → Nachgelagerte Artefaktprüfung blockiert Publish und Offline-Weitergabe bis das Paket bereinigt ist
- Was wenn Argo-CD-Versionen zwischen Entwicklungs- und Zielumgebung abweichen? → Kompatibilitätshinweise in `docs/zarf.md` und `docs/argocd.md`
- Was wenn das Zarf-Paket in der Zielumgebung nicht importiert werden kann? → Detaillierte Fehlermeldung von Zarf; Troubleshooting-Abschnitt in `docs/offline-install.md`

## Technical Requirements
- Tool: Zarf CLI (aktuelle stabile Version)
- Paketdefinition: `zarf.yaml` im Repository-Root
- Image-Referenzen: Mit SHA-Digest (nicht `latest`) für Reproduzierbarkeit
- Paket-Build: `zarf package create` in der CI-Pipeline (OBJ-1)
- Paket-Inhalt: Container-Images (aus Harbor, OBJ-18), Helm Charts / K8s-Manifeste (OBJ-10), Argo-CD-Definitionen (OBJ-21)
- Git-Zielmodell: Release-Projekt (aus Zarf-Release importierbar) und separates Konfigurationsprojekt in Gitea
- Dokumentation: `docs/zarf.md` (Paketstruktur, Build, Import) und `docs/offline-install.md` (Schritt-für-Schritt-Anleitung, OBJ-2)
- Offline-DB: trivy-Datenbankdump als optionaler Bestandteil für Security-Scans in Zielumgebung

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
