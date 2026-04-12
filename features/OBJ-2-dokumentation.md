# OBJ-2: Dokumentation

## Status: In Progress
**Created:** 2026-04-03
**Last Updated:** 2026-04-11

## Dependencies
- OBJ-1 bis OBJ-21: Alle Features (Dokumentation beschreibt das Gesamtsystem)
- OBJ-3: REST API (API muss dokumentiert sein, inkl. OpenAPI-Spec)
- OBJ-19: Zarf-Paket (Offline-Installations- und Export-/Import-Beschreibung)
- OBJ-21: GitOps/Argo CD (App-of-Apps-Installationsablauf dokumentieren)
- OBJ-14: Release Management (Doku-Versionen folgen den Release-Versionen)

## User Stories
- Als neuer Mission Network Operator möchte ich einen Quickstart-Guide lesen, damit ich die App in unter 15 Minuten in Betrieb nehmen kann.
- Als Platform Engineer möchte ich eine vollständige Betriebsdokumentation finden, damit ich die App im Alltagsbetrieb warten und diagnostizieren kann.
- Als Entwickler möchte ich eine Architekturübersicht (Blackbox und Whitebox) lesen, damit ich die App verstehe und erweitern kann.
- Als Sicherheitsverantwortlicher möchte ich die Konfigurationsbeschreibung inklusive Secrets-Verwaltung lesen, damit ich die App sicher konfigurieren kann.
- Als Stakeholder möchte ich Architekturentscheide (ADRs) nachvollziehen können, damit ich verstehe, warum bestimmte technische Entscheidungen getroffen wurden.
- Als Platform Engineer in einer Zielumgebung möchte ich eine Schritt-für-Schritt-Anleitung für den Offline-Import und die Installation via Zarf finden, damit ich ohne Rückfragen ans Entwicklerteam installieren kann.
- Als Platform Engineer möchte ich die Argo-CD-/App-of-Apps-Installationsdokumentation lesen, damit ich die App korrekt in meiner GitOps-Umgebung einrichten kann.
- Als Übergabe-Verantwortlicher möchte ich einen dokumentierten Release- und Übergabeprozess finden, damit ich weiss welche Artefakte mit welchem Release mitgeliefert werden müssen.
- Als Platform Engineer moechte ich den Ablauf GitLab-Release -> Zarf-Transfer -> Gitea-Import (Release-Projekt + Konfigurationsprojekt) dokumentiert haben.
- Als Manager moechte ich die komplette Doku als Website, E-Book und Benutzerhandbuch nutzen koennen, damit ich ohne Entwicklerzugriff arbeiten kann.
- Als Nutzer moechte ich zwischen Doku-Versionen (z. B. v1, v2) umschalten koennen, damit ich zur passenden Release-Version lesen kann.
- Als Architekt moechte ich Diagramme einheitlich mit draw.io pflegen, damit Aenderungen reproduzierbar und releasefaehig dokumentiert sind.
- Als Operator moechte ich die OTel-Betriebsvarianten (`local`/`clickhouse`) in der Betriebsdoku klar beschrieben haben, damit ich den passenden Modus sicher betreiben kann.
- Als Nutzer moechte ich erklaerte Update-Hinweise in der Doku finden, damit ich GUI-Hinweise und Release-Notizen korrekt einordnen kann.

## Acceptance Criteria
- [ ] `README.md` im Repository-Root vorhanden: Quickstart, Links zu weiterführender Doku, Build-Badges
- [ ] `docs/quickstart.md`: Schritte vom Klonen bis zur laufenden App (≤ 15 Minuten)
- [ ] `docs/operations.md`: Betriebsdokumentation (Start, Stop, Update, Backup, Troubleshooting)
- [ ] `docs/architecture.md`: Architekturübersicht mit Blackbox-Sicht (Schnittstellen nach aussen) und Whitebox-Sicht (interne Komponenten)
- [ ] `docs/configuration.md`: Vollständige Beschreibung aller Konfigurationsparameter (ENV-Variablen, ConfigMap-Felder)
- [ ] `docs/adr/` Verzeichnis vorhanden mit mindestens ADR-0001 (Auswahl Framework), ADR-0002 (Airgapped-Strategie)
- [ ] OpenAPI-Spezifikation der REST API ist abrufbar und aktuell (OBJ-3)
- [ ] `docs/offline-install.md`: Schritt-für-Schritt-Anleitung für Zarf-Export, Transfer und Import in Zielumgebung inkl. Gitea-Import (Release-Projekt + Konfigurationsprojekt)
- [ ] `docs/zarf.md`: Beschreibung der zarf.yaml-Struktur, welche Artefakte enthalten sind, wie das Paket gebaut und importiert wird
- [ ] `docs/argocd.md`: Argo-CD-Installationsablauf im App-of-Apps-Modell; Beschreibung der Root-Application und der zwei Gitea-Quellen (Release + Konfiguration)
- [ ] Security-Doku beschreibt Zero-Trust-Richtlinien mit Cilium (inkl. mTLS), OPA-Policies, Hubble-Sicht und Runtime-Erkennung mit Tetragon
- [ ] `docs/release-process.md`: Dokumentierter Release- und Übergabeprozess inkl. Pflichtartefakte (SBOM, Zarf-Paket, Security-Bericht)
- [ ] MkDocs-Doku-Website ist im Repository konfiguriert und erzeugbar (`mkdocs.yml` + Build-Anleitung)
- [ ] Die Doku-Website bietet Versionsumschaltung pro Release (mindestens aktuelle und vorherige Version)
- [ ] Die Doku ist pro Release als E-Book exportierbar (z. B. PDF) und versioniert abgelegt
- [ ] Ein Benutzerhandbuch ist vorhanden und in drei Themenbereiche gegliedert: Management, Betrieb, Umsetzung
- [ ] Website und E-Book enthalten ein klar strukturiertes Inhaltsverzeichnis
- [ ] Pro Release ist eine nachvollziehbare Doku-Aenderungssicht vorhanden (Changes, Bugfixes, Version)
- [ ] Diagrammstandard ist dokumentiert: draw.io als Quelle plus Export nach SVG/PNG (`docs/diagrams/source` und `docs/diagrams/export`)
- [ ] Markdown- und E-Book-Quellen referenzieren Diagramm-Exporte (SVG/PNG), nicht die draw.io-Quelldateien
- [ ] `docs/operations.md` beschreibt OTel-Betriebsvarianten `local` und `clickhouse` inkl. Umschaltlogik, Pufferung und Nachlieferung
- [ ] Dokumentation der GUI-Update-Hinweise ist vorhanden (global/modulbezogen, Kritikalitaet, Quittierung, Verknuepfung zu Release-Notizen)
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
- Was wenn fuer eine alte Release-Version keine Doku-Version vorhanden ist? → Release gilt als unvollstaendig dokumentiert; Version wird nachgezogen
- Was wenn E-Book-Export fehlschlaegt? → Release-Checkliste blockiert Abschluss bis Export oder dokumentierte Ausnahme vorliegt
- Was wenn ein Diagramm nur als `.drawio` ohne Export vorliegt? → Doku gilt als unvollstaendig; SVG/PNG-Export muss vor Release nachgezogen werden
- Was wenn GUI-Update-Hinweise von den Release-Notizen abweichen? → Release wird blockiert bis Hinweisquelle und Release-Notiz konsistent sind

## Technical Requirements
- Dokumentationsformat: Markdown (GitHub-kompatibel)
- ADR-Format: MADR (Markdown Any Decision Records) oder leichtes Eigenformat
- Doku-Publishing: MkDocs als Website-Generator, Versionierung ueber releasebezogene Doku-Staende (z. B. mit `mike`)
- E-Book-Export je Release (z. B. PDF) inkl. Inhaltsverzeichnis und Versionslabel
- Benutzerhandbuch-Struktur als eigener Doku-Bereich mit drei Zielgruppenpfaden
- Diagramm-Standard: draw.io-Quellen plus SVG/PNG-Exporte, gemeinsam versioniert
- Betriebsdoku muss OTel-Modi (`local`/`clickhouse`) und Fallback-Verhalten explizit dokumentieren

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Scope**

OBJ-2 bildet das Dokumentations-Backbone des Projekts:
- klare Trennung fuer Management-Sicht und technische Sicht
- verbindliche Architektur- und Entscheidungsdokumentation
- nachvollziehbarer Release- und Exportprozess
- ein zentraler Source-of-Truth-Ansatz ohne Wiki-Drift

**Dokustruktur (Visual Tree)**

```
Repository Documentation
+-- Service- und Roadmap-Sicht
|   +-- SVC
|   +-- Feature Index
+-- Feature- und Requirement-Sicht
|   +-- Feature-Specs (OBJ)
|   +-- Capability-/Requirement-Struktur
+-- Architektur-Sicht
|   +-- ADRs
|   +-- arc42 Kapitel 1-12
+-- Betriebs- und Release-Sicht
|   +-- Operations / Security / Performance
|   +-- Release- und Uebergabeprozess
+-- Export-Sicht
    +-- Confluence Export Guide
    +-- Zentrales Export-Log
```

**Datenmodell (in einfachen Worten)**

Jede Doku-Einheit hat:
- einen klaren Zweck
- einen festen Ort im Repo
- einen Verantwortungsbezug (wer pflegt)
- einen Aktualisierungsanlass (wann nachziehen)

**Technische Leitentscheidungen (fuer PM)**

- Markdown im Repo bleibt langfristig wartbar und offline nutzbar.
- arc42 als Kapitelstruktur macht Architektur exportierbar und auditsicher.
- Ein zentrales Export-Log vermeidet widerspruechliche Confluence-Staende.
- Definition of Done fuer Features verhindert, dass Doku erst spaet nachgezogen wird.

**Requirements Engineer Input**

- Neues Feature oder neues Requirement ist erst vollstaendig, wenn die zugehoerige Doku referenziert ist.
- IDs und Benennung muessen einheitlich bleiben, damit Traceability funktioniert.
- Anforderungen an Dokumentation (z. B. Release-Nachweise) werden wie andere Requirements behandelt.

**QA Engineer Input (Readiness)**

- QA prueft Dokumentationsvollstaendigkeit als Teil der Abnahme.
- Pflichtpruefung: Sind AC, Edge Cases, Nachweise, ADR-Bezug und arc42-Updates konsistent?
- Bei fehlenden Nachweisen bleibt ein Feature in Review, auch wenn UI/API technisch laeuft.

**Abhaengigkeiten / Werkzeuge**

- Keine zusaetzlichen Runtime-Abhaengigkeiten erforderlich.
- Optional fuer Qualitaetssicherung: Markdown-Link-Check in CI.

## QA Test Results
_To be added by /qa_

## Deployment
### Deployment-Status (Stand: 2026-04-11)
- Auslieferung erfolgt Git-first ueber Branch/PR/Merge nach `main`.
- Release- und Export-Nachweise werden in `docs/releases/` und `docs/exports/EXPORT-LOG.md` dokumentiert.
- Confluence bleibt Sekundaerziel: Export erst nach gepflegter Git-Dokumentation.
- Falls **Production Ready: NO** gilt, bleibt das Deployment als vorbereitet markiert und wird erst nach Freigabe produktiv ausgerollt.
