# OBJ-21: GitOps / Argo CD / App-of-Apps

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-07

## Dependencies
- OBJ-10: Kubernetes Deployment (K8s-Manifeste, auf denen GitOps aufbaut)
- OBJ-2: Dokumentation (Argo-CD-Installationsablauf und App-of-Apps-Modell dokumentiert)
- OBJ-19: Zarf-Paket / Offline-Weitergabe (liefert deploybaren Release-Stand)
- OBJ-20: Zielumgebung / Import / Rehydrierung (stellt Ziel-Gitea-Projekte bereit)

## User Stories
- Als Platform Engineer möchte ich die App via Argo CD im App-of-Apps-Modell installieren können, damit alle Komponenten deklarativ und reproduzierbar bereitgestellt werden.
- Als Platform Engineer möchte ich eine Root-Application oder einen gleichwertigen Einstiegspunkt haben, der alle Teilkomponenten als Argo-CD-Applications verwaltet.
- Als Entwickler möchte ich Argo-CD-Ressourcen (Application, Project, ApplicationSet) deklarativ im Repository verwalten, damit der Zustand der Zielumgebung nachvollziehbar ist.
- Als Platform Engineer möchte ich mehrere Teilkomponenten als logisch getrennte Argo-CD-Applications strukturieren können, damit ich einzelne Teile unabhängig synchronisieren kann.
- Als Platform Engineer möchte ich Projekte, Ziel-Namespaces, Quellen und Synchronisationslogik klar definiert haben, damit ich den Argo-CD-Betrieb ohne Rückfragen ans Entwicklerteam einrichten kann.
- Als Mission Network Operator möchte ich die App nach einer Konfigurationsänderung im GitOps-Repository automatisch oder manuell synchronisiert sehen, damit Änderungen kontrolliert in die Zielumgebung einfliessen.
- Als Platform Engineer moechte ich im App-of-Apps-Modell getrennte Quellen fuer Release-Artefakte und Zielkonfiguration nutzen (zwei Gitea-Projekte), damit ich Deploy-Stand und Parameter unabhaengig steuern kann.

## Acceptance Criteria
- [ ] Argo-CD-Ressourcen (Application, AppProject, ApplicationSet) liegen deklarativ im Repository (z.B. `gitops/` oder `argocd/`)
- [ ] Root-Application oder AppSet als Einstiegspunkt für das App-of-Apps-Modell ist definiert
- [ ] Alle App-Komponenten sind als separate Argo-CD-Applications strukturierbar (z.B. App-Core, Monitoring, Ingress)
- [ ] Projekte, Ziel-Namespaces, Quellen (Git-Repository-URLs) und Sync-Policy sind nachvollziehbar in den Manifesten definiert
- [ ] App-of-Apps nutzt mindestens zwei Git-Quellen in Gitea: Release-Projekt und Konfigurationsprojekt
- [ ] Automated Sync ist konfigurierbar (auto-sync + self-heal oder manueller Sync; Standard: manuell für Zielumgebungen)
- [ ] Argo-CD-Definitionen sind Bestandteil des Zarf-Pakets (OBJ-19) und werden beim Import bereitgestellt (OBJ-20)
- [ ] Argo-CD-Installationsablauf ist dokumentiert (`docs/argocd.md`, OBJ-2): Root-Application anlegen, Sync auslösen, Status prüfen
- [ ] Argo-CD-Bereitschaft ist als Indikator im Maturitätsstatus sichtbar (OBJ-16)
- [ ] Sync-Status nach Import (Smoke-Test) ist Bestandteil des Deployability-Testfalls (OBJ-9)
- [ ] Parameterisierung ziel-spezifischer Werte (Registry-URLs, Namespaces, Hostnames) ist über Argo-CD-Parameters oder Kustomize-Overlays möglich
- [ ] Revisionsbindung zwischen Release-Projekt und Konfigurationsprojekt ist definiert (z. B. Tag/Branch-Matrix)

## Edge Cases
- Was wenn Argo-CD in der Zielumgebung fehlt? → Klare Fehlermeldung; `docs/argocd.md` beschreibt Argo-CD-Voraussetzungen und Installationsweg
- Was wenn das Git-Repository in der Zielumgebung nicht erreichbar ist? → Argo-CD mit lokalem Repository-Mirror konfigurieren; in Zarf-Paket einschliessen
- Was wenn ein Sync fehlschlägt (z.B. Ressourcenkonflikt)? → Argo-CD zeigt detaillierte Fehlermeldung; Troubleshooting in `docs/argocd.md`
- Was wenn Argo-CD-Versionen zwischen Entwicklungs- und Zielumgebung abweichen? → Kompatibilitätsmatrix und Mindestversion in `docs/argocd.md` dokumentiert
- Was wenn ApplicationSet-Generatoren nicht unterstützt werden (ältere Argo-CD-Version)? → Fallback auf einzelne Application-Ressourcen dokumentiert
- Was wenn Argo-CD Self-Heal ungewollte Rollbacks auslöst? → Self-Heal standardmässig deaktiviert; nur auf expliziten Wunsch aktivierbar
- Was wenn Release- und Konfigurationsprojekt nicht zusammenpassen? → Sync wird blockiert; Version-Matrix muss angepasst werden

## Technical Requirements
- GitOps-Tool: Argo CD (aktuelle stabile Version; Mindestversion in `docs/argocd.md` dokumentiert)
- Manifeste: `gitops/argocd/` im Repository; enthält Root-Application, AppProject, ApplicationSets und App-spezifische Applications
- App-of-Apps-Struktur: Root-Application verwaltet alle Teilkomponenten; logische Trennung via separate Application-Ressourcen
- Zielquellen: Lokale Gitea-Repositories fuer Release-Stand und Konfigurationsstand
- Parametrisierung: Argo-CD-Parameters (in Application-Spec) oder Kustomize-Overlays für ziel-spezifische Werte
- Sync-Policy: Standard: manueller Sync; auto-sync + self-heal optional konfigurierbar
- Zarf-Integration: Argo-CD-Manifeste werden als Zarf-Komponente ins Paket aufgenommen (OBJ-19)
- Dokumentation: `docs/argocd.md` mit vollständigem App-of-Apps-Installationsablauf (OBJ-2)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
