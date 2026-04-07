# OBJ-20: Zielumgebung / Import / Rehydrierung

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-07

## Dependencies
- OBJ-19: Zarf-Paket / Offline-Weitergabe (Zarf-Paket als Grundlage des Imports)
- OBJ-21: GitOps / Argo CD (Argo-CD-Definitionen werden nach Import bereitgestellt)
- OBJ-10: Kubernetes Deployment (Deployments, Manifeste und Helm Charts werden in Zielumgebung eingerichtet)
- OBJ-18: Artefakt-Registry (Container-Images werden in Ziel-Registry Harbor bereitgestellt)
- OBJ-2: Dokumentation (Offline-Installationsanleitung und Schritt-für-Schritt-Guide)
- OBJ-14: Release Management (Release-Stand aus GitLab ist Ausgangspunkt fuer Zielimport)

## User Stories
- Als Platform Engineer in einer getrennten Zielumgebung möchte ich das Zarf-Paket importieren können, ohne Zugriff auf die Ursprungsumgebung zu benötigen.
- Als Platform Engineer möchte ich Container-Images aus dem Zarf-Paket in die Ziel-Registry (Harbor) laden können, damit Kubernetes die Images lokal beziehen kann.
- Als Platform Engineer möchte ich K8s-Deployments, Helm Charts und Manifeste in der Zielumgebung einrichten können.
- Als Platform Engineer möchte ich Argo-CD-GitOps-Definitionen in der Zielumgebung bereitstellen können, damit die App kontinuierlich synchronisiert wird.
- Als Platform Engineer möchte ich Ziel-spezifische Parameter (URLs, Zugangsdaten, Umgebungswerte) konfigurieren können, ohne die Paketdefinition selbst anpassen zu müssen.
- Als Mission Network Operator möchte ich nach dem Import die App ohne weitere Konfiguration aufrufen können (Smoke-Test bestehen).
- Als Platform Engineer moechte ich den Release-Stand in ein lokales Gitea-Release-Projekt importieren und die Zielparameter in einem separaten Gitea-Konfigurationsprojekt pflegen.

## Acceptance Criteria
- [ ] Import des Zarf-Pakets ist vollständig dokumentiert (`docs/offline-install.md`, OBJ-2)
- [ ] Container-Images werden aus dem Zarf-Paket in die Ziel-Registry (Harbor) geladen: `zarf package deploy`
- [ ] K8s-Deployments, Helm Charts und Manifeste werden in der Zielumgebung eingerichtet
- [ ] Argo-CD-GitOps-Definitionen (Application, Project, ApplicationSet) werden nach Import bereitgestellt (OBJ-21)
- [ ] Ein lokales Gitea-Release-Projekt wird aus dem importierten Release-Stand bereitgestellt
- [ ] Ein separates Gitea-Konfigurationsprojekt fuer Parameter/Helm Values/Overlays ist vorhanden und mit Zielwerten befuellt
- [ ] Ziel-spezifische Parameter sind konfigurierbar via Zarf-Variables (in `zarf.yaml` definiert) oder Kustomize-Overlays
- [ ] Parameter umfassen mindestens: Ziel-Registry-URL, Ingress-Hostname, Keycloak/OIDC-Endpunkt, Namespace
- [ ] Nach dem Import führt ein definierter Smoke-Test (Deployability-Test, OBJ-9) nach, dass die App erreichbar und funktionsfähig ist
- [ ] Import schlägt mit klarer Fehlermeldung fehl, wenn Voraussetzungen fehlen (Kubernetes nicht erreichbar, Namespace fehlt, etc.)
- [ ] Import ist idempotent: wiederholtes Ausführen auf einer bestehenden Installation führt zu keinen ungewollten Nebeneffekten
- [ ] Argo-CD App-of-Apps kann beide Gitea-Projekte (Release + Konfiguration) als Quellen referenzieren

## Edge Cases
- Was wenn das Kubernetes-Cluster in der Zielumgebung nicht erreichbar ist? → Zarf-CLI gibt klare Fehlermeldung; kein partieller Import
- Was wenn die Ziel-Registry (Harbor) nicht konfiguriert ist? → Import-Schritt für Images schlägt fehl; Anleitung verweist auf Harbor-Setup-Doku
- Was wenn ein Namespace bereits existiert und Ressourcen enthält? → Zarf behandelt Update idempotent; Warnung wird ausgegeben
- Was wenn Argo-CD in der Zielumgebung fehlt? → Klare Fehlermeldung; Dokumentation verweist auf Argo-CD-Installationsanleitung
- Was wenn die Smoke-Tests nach dem Import fehlschlagen? → Fehler-Checkliste in `docs/offline-install.md` mit häufigen Ursachen und Lösungen
- Was wenn Zarf-Paket und Ziel-Kubernetes-Version inkompatibel sind? → Kompatibilitätsmatrix in `docs/zarf.md` dokumentiert
- Was wenn Release-Projekt und Konfigurationsprojekt unterschiedliche Revisionen nutzen? → Abgleichregel und freigegebene Versionsmatrix in der Import-Doku

## Technical Requirements
- Tool: Zarf CLI (`zarf package deploy`) in der Zielumgebung
- Ziel-Registry: Harbor (lokal in Zielumgebung, OCI-kompatibel)
- Ziel-Git: Gitea (lokal), mit getrenntem Release-Projekt und Konfigurationsprojekt
- Konfiguration: Zarf-Variables für ziel-spezifische Parameter; alternativ Kustomize-Overlays
- Smoke-Test: Definierter Deployability-Testfall (OBJ-9) der nach dem Import ausgeführt wird
- Idempotenz: Zarf-Deployments müssen mehrfach ausführbar sein ohne Datenverlust
- Dokumentation: `docs/offline-install.md` mit vollständigem Schritt-für-Schritt-Guide (OBJ-2)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
