# OBJ-2: Dokumentation

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-04

## Dependencies
- OBJ-1 bis OBJ-21: Alle Features (Dokumentation beschreibt das Gesamtsystem)
- OBJ-3: REST API (API muss dokumentiert sein, inkl. OpenAPI-Spec)
- OBJ-19: Zarf-Paket (Offline-Installations- und Export-/Import-Beschreibung)
- OBJ-21: GitOps/Argo CD (App-of-Apps-Installationsablauf dokumentieren)

## User Stories
- Als neuer Mission Network Operator möchte ich einen Quickstart-Guide lesen, damit ich die App in unter 15 Minuten in Betrieb nehmen kann.
- Als Platform Engineer möchte ich eine vollständige Betriebsdokumentation finden, damit ich die App im Alltagsbetrieb warten und diagnostizieren kann.
- Als Entwickler möchte ich eine Architekturübersicht (Blackbox und Whitebox) lesen, damit ich die App verstehe und erweitern kann.
- Als Sicherheitsverantwortlicher möchte ich die Konfigurationsbeschreibung inklusive Secrets-Verwaltung lesen, damit ich die App sicher konfigurieren kann.
- Als Stakeholder möchte ich Architekturentscheide (ADRs) nachvollziehen können, damit ich verstehe, warum bestimmte technische Entscheidungen getroffen wurden.
- Als Platform Engineer in einer Zielumgebung möchte ich eine Schritt-für-Schritt-Anleitung für den Offline-Import und die Installation via Zarf finden, damit ich ohne Rückfragen ans Entwicklerteam installieren kann.
- Als Platform Engineer möchte ich die Argo-CD-/App-of-Apps-Installationsdokumentation lesen, damit ich die App korrekt in meiner GitOps-Umgebung einrichten kann.
- Als Übergabe-Verantwortlicher möchte ich einen dokumentierten Release- und Übergabeprozess finden, damit ich weiss welche Artefakte mit welchem Release mitgeliefert werden müssen.

## Acceptance Criteria
- [ ] `README.md` im Repository-Root vorhanden: Quickstart, Links zu weiterführender Doku, Build-Badges
- [ ] `docs/quickstart.md`: Schritte vom Klonen bis zur laufenden App (≤ 15 Minuten)
- [ ] `docs/operations.md`: Betriebsdokumentation (Start, Stop, Update, Backup, Troubleshooting)
- [ ] `docs/architecture.md`: Architekturübersicht mit Blackbox-Sicht (Schnittstellen nach aussen) und Whitebox-Sicht (interne Komponenten)
- [ ] `docs/configuration.md`: Vollständige Beschreibung aller Konfigurationsparameter (ENV-Variablen, ConfigMap-Felder)
- [ ] `docs/adr/` Verzeichnis vorhanden mit mindestens ADR-0001 (Auswahl Framework), ADR-0002 (Airgapped-Strategie)
- [ ] OpenAPI-Spezifikation der REST API ist abrufbar und aktuell (OBJ-3)
- [ ] `docs/offline-install.md`: Schritt-für-Schritt-Anleitung für Zarf-Export, Transfer und Import in Zielumgebung
- [ ] `docs/zarf.md`: Beschreibung der zarf.yaml-Struktur, welche Artefakte enthalten sind, wie das Paket gebaut und importiert wird
- [ ] `docs/argocd.md`: Argo-CD-Installationsablauf im App-of-Apps-Modell; Beschreibung der Root-Application und Teilkomponenten
- [ ] `docs/release-process.md`: Dokumentierter Release- und Übergabeprozess inkl. Pflichtartefakte (SBOM, Zarf-Paket, Security-Bericht)
- [ ] Dokumentation ist auf Deutsch (Schweizer Schreibweise), technische Begriffe können Englisch bleiben
- [ ] Dokumentation liegt vollständig im Repository (kein externes Wiki)
- [ ] Dokumentation wächst mit der Implementierung mit: jedes neue Feature hat einen Doku-Abschnitt

## Edge Cases
- Was passiert wenn eine Funktion sich ändert, die Doku aber nicht aktualisiert wird? → Definition of Done jedes Features enthält Doku-Update als Pflicht
- Was wenn die Doku in einer airgapped Umgebung nicht aufrufbar ist? → Doku ist Markdown im Repo; keine externe Website nötig
- Was wenn ADR-Entscheide sich als falsch herausstellen? → ADR wird nicht gelöscht; neues ADR mit Superseding-Vermerk erstellt
- Was wenn die OpenAPI-Spec nicht mit der Implementierung übereinstimmt? → CI-Test prüft Konsistenz (Contract-Test)
- Was wenn die Offline-Installationsanleitung nicht mehr mit dem aktuellen Zarf-Paket übereinstimmt? → Doku-Update ist Teil der Release-Checkliste (OBJ-14)
- Was wenn Argo-CD-Versionen zwischen Entwicklungs- und Zielumgebung abweichen? → Kompatibilitätshinweise in `docs/argocd.md` dokumentiert

## Technical Requirements
- Dokumentationsformat: Markdown (GitHub-kompatibel)
- ADR-Format: MADR (Markdown Any Decision Records) oder leichtes Eigenformat
- Kein externes Dokumentations-Hosting nötig (Markdown im Repo genügt für v1)
- Optional: MkDocs oder Docusaurus für generierte Doku-Website (v2)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
