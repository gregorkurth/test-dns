# OBJ-20: Zielumgebung / Import / Rehydrierung

## Status: In Review
**Created:** 2026-04-03
**Last Updated:** 2026-04-10

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
- Als Security-Verantwortlicher möchte ich vor und nach dem Import einen klaren Kontrollpunkt sehen, damit nur freigegebene Pakete in Zielumgebungen landen.
- Als Betriebsteam möchte ich einen definierten Rückweg auf die letzte stabile Version haben, damit Importfehler nicht zu langem Ausfall führen.

## Acceptance Criteria
- [ ] Import des Zarf-Pakets ist vollständig dokumentiert (`docs/offline-install.md`, OBJ-2)
- [ ] Container-Images werden aus dem Zarf-Paket in die Ziel-Registry (Harbor) geladen: `zarf package deploy`
- [ ] K8s-Deployments, Helm Charts und Manifeste werden in der Zielumgebung eingerichtet
- [ ] Argo-CD-GitOps-Definitionen (Application, Project, ApplicationSet) werden nach Import bereitgestellt (OBJ-21)
- [ ] Ein lokales Gitea-Release-Projekt wird aus dem importierten Release-Stand bereitgestellt
- [ ] Ein separates Gitea-Konfigurationsprojekt fuer Parameter/Helm Values/Overlays ist vorhanden und mit Zielwerten befuellt
- [ ] Ziel-spezifische Parameter sind konfigurierbar via Zarf-Variables (in `zarf.yaml` definiert) oder Kustomize-Overlays
- [ ] `zarf.yaml` definiert explizit alle Pflicht-Variablen als named Variables: `TARGET_REGISTRY_URL`, `TARGET_INGRESS_HOSTNAME`, `TARGET_OIDC_ENDPOINT`, `TARGET_NAMESPACE`; fehlende Werte beim Deploy erzeugen einen Build-Fehler mit klarer Variablenangabe
- [ ] Nach dem Import führt ein definierter Smoke-Test (Deployability-Test, OBJ-9) nach, dass die App erreichbar und funktionsfähig ist
- [ ] Import schlägt mit klarer Fehlermeldung fehl, wenn Voraussetzungen fehlen (Kubernetes nicht erreichbar, Namespace fehlt, etc.)
- [ ] Import ist idempotent: wiederholtes Ausführen auf einer bestehenden Installation führt zu keinen ungewollten Nebeneffekten
- [ ] Argo-CD App-of-Apps kann beide Gitea-Projekte (Release + Konfiguration) als Quellen referenzieren; die Quellenbindung ist als deployierbares Artefakt (Application-Manifest) nachgewiesen, nicht nur dokumentiert
- [ ] Import startet mit einem Preflight-Check (Cluster erreichbar, Argo CD erreichbar, Registry erreichbar, Pflicht-Namespaces vorhanden)
- [ ] Nach Import ist ein strukturierter Rehydrierungsnachweis vorhanden (welche Ressourcen, welche Version, welcher Zustand)
- [ ] Für Fehlschläge ist ein definierter Rollback-/Recover-Run dokumentiert und in der Zielumgebung nachvollziehbar
- [ ] Dry-Run-Warnungen (Re-Run, Recovery-Modus, identische Revisionsnamen) werden in der Benutzeroberfläche für den Operator sichtbar angezeigt; sie dürfen nicht stillschweigend verworfen werden
- [ ] Feldbezogene Validierungsfehler der API werden in der Benutzeroberfläche mit konkretem Feldbezug dargestellt; eine generische Fehlermeldung ohne Feldreferenz ist nicht ausreichend
- [ ] Die Import-API (`GET/POST /api/v1/target-import`) ist ausschliesslich für authentifizierte Nutzer mit Operator-Rolle zugänglich (konsistent mit OBJ-12); Zielcluster-, Registry- und OIDC-Daten dürfen nicht ohne Zugriffskontrolle ausgegeben werden

## Edge Cases
- Was wenn das Kubernetes-Cluster in der Zielumgebung nicht erreichbar ist? → Zarf-CLI gibt klare Fehlermeldung; kein partieller Import
- Was wenn die Ziel-Registry (Harbor) nicht konfiguriert ist? → Import-Schritt für Images schlägt fehl; Anleitung verweist auf Harbor-Setup-Doku
- Was wenn ein Namespace bereits existiert und Ressourcen enthält? → Zarf behandelt Update idempotent; Warnung wird ausgegeben
- Was wenn Argo-CD in der Zielumgebung fehlt? → Klare Fehlermeldung; Dokumentation verweist auf Argo-CD-Installationsanleitung
- Was wenn die Smoke-Tests nach dem Import fehlschlagen? → Fehler-Checkliste in `docs/offline-install.md` mit häufigen Ursachen und Lösungen
- Was wenn Zarf-Paket und Ziel-Kubernetes-Version inkompatibel sind? → Kompatibilitätsmatrix in `docs/zarf.md` dokumentiert
- Was wenn Release-Projekt und Konfigurationsprojekt unterschiedliche Revisionen nutzen? → Abgleichregel und freigegebene Versionsmatrix in der Import-Doku
- Was wenn Argo CD synchronisiert, aber einzelne Apps bleiben degraded? → Import gilt als nicht abgeschlossen; Betrieb bleibt im Controlled-Failure-Status
- Was wenn ein erneuter Import parallel gestartet wird? → Zweiter Lauf wird blockiert oder als kontrolliertes Re-Run-Fenster behandelt
- Was wenn `TARGET_INGRESS_HOSTNAME` oder `TARGET_OIDC_ENDPOINT` beim Deploy fehlen? → Zarf-CLI bricht mit expliziter Fehlermeldung ab; kein partieller Import ohne Pflichtparameter
- Was wenn die API ohne Token aufgerufen wird? → HTTP 401 mit klarer Fehlermeldung; keine Zielumgebungsdaten werden ausgegeben
- Was wenn ein Dry-Run im Modus `recovery` gestartet wird? → UI zeigt explizite Warnung "Recovery-Modus aktiv – vorherige Installation wird überschrieben"

## Technical Requirements
- Tool: Zarf CLI (`zarf package deploy`) in der Zielumgebung
- Ziel-Registry: Harbor (lokal in Zielumgebung, OCI-kompatibel)
- Ziel-Git: Gitea (lokal), mit getrenntem Release-Projekt und Konfigurationsprojekt
- Konfiguration: Zarf-Variables für ziel-spezifische Parameter; alternativ Kustomize-Overlays
- Smoke-Test: Definierter Deployability-Testfall (OBJ-9) der nach dem Import ausgeführt wird
- Idempotenz: Zarf-Deployments müssen mehrfach ausführbar sein ohne Datenverlust
- Dokumentation: `docs/offline-install.md` mit vollständigem Schritt-für-Schritt-Guide (OBJ-2)
- Preflight/Recovery: Vorbedingungen und Rollback-Prozess sind als standardisierte Betriebsprozedur dokumentiert
- Rehydrierungsnachweis: Importlauf erzeugt einen nachvollziehbaren Zustandseintrag pro Zielumgebung

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
### Scope
In Scope:
- Standardisierte Import- und Rehydrierungsstrecke in der Zielumgebung ohne Internetzugriff.
- Zusammenspiel aus Zarf-Import, Gitea-Projekten und Argo CD App-of-Apps.
- Betriebsfähige Nachweise für Preflight, Import, Smoke und Recovery.

Out of Scope:
- Entwicklung neuer Fachfeatures.
- Ersatz des zentralen Release-Prozesses.
- Vollautomatische Incident-Response außerhalb des Importprozesses.

### Component Structure (Visual Tree)
```text
Target Import and Rehydration (OBJ-20)
+-- Preflight Layer
|   +-- Cluster/Namespace Check
|   +-- Registry Reachability Check
|   +-- Argo CD Availability Check
|   +-- Package Integrity Check
+-- Import Layer
|   +-- Zarf Package Deploy
|   +-- Local Harbor Image Load
|   +-- Release Gitea Project Provision
|   +-- Config Gitea Project Binding
+-- GitOps Activation Layer
|   +-- Argo CD App-of-Apps Source Binding
|   +-- Initial Sync + Health Evaluation
+-- Validation Layer
|   +-- Smoke Test Run
|   +-- Rehydration Evidence Record
|   +-- Rollback/Recover Runbook Trigger
```

### Data Model (plain language)
- **Environment Profile:** Zielcluster, Namespace-Set, Registry-URL, Argo-Endpunkt.
- **Import Run Record:** Paketversion, Start/Ende, Ergebnisstatus, Fehlermeldungen.
- **Source Binding Record:** Release-Repo-Revision, Config-Repo-Revision, App-of-Apps-Referenz.
- **Validation Record:** Smoke-Test-Status, degradierte Komponenten, Freigabeentscheidung.
- **Recovery Record:** Vorversion, Auslöser, Rücksetzstatus.

### Technical Decisions
- Preflight vor Import reduziert teure Halbfertig-Zustände in Zielumgebungen.
- Zwei getrennte Gitea-Projekte (Release/Konfiguration) halten Änderungen kontrollierbar.
- Argo CD App-of-Apps schafft konsistente Reconciliation statt manueller Einzel-Deployments.
- Rehydrierungsnachweise sind Pflicht, damit Betrieb und Audit denselben Zustand sehen.
- Ein definierter Recovery-Pfad senkt Betriebsrisiko bei Importproblemen.

### Dependencies and Interfaces
- OBJ-19 liefert das transportfähige Zarf-Paket.
- OBJ-18 liefert referenzierbare Artefakte und Registry-Struktur.
- OBJ-21 liefert GitOps-App-of-Apps-Architektur.
- OBJ-2 liefert Betriebsdokumentation und Runbooks.
- OBJ-14 liefert freigegebene Release-Versionen.

### QA Readiness
- Testbar ist, dass Preflight bei fehlenden Voraussetzungen sauber blockiert.
- Testbar ist, dass Import idempotent erneut laufen kann.
- Testbar ist, dass Argo CD beide Gitea-Quellen korrekt bindet.
- Testbar ist, dass Smoke- und Recovery-Nachweise pro Importlauf erzeugt werden.

## QA Test Results
**Tested:** 2026-04-10
**App URL:** http://localhost:3000/target-import (Live-Browserlauf in dieser QA-Session nicht stabil erreichbar)
**Tester:** QA Engineer (AI)

### Test Scope and Evidence
- Geprueft wurden Spec, Implementierung und Nachweise in `docs/offline-install.md`, `docs/argocd.md`, `zarf.yaml`, `src/lib/obj20-target-import.ts`, `src/app/api/v1/target-import/route.ts` und `src/app/target-import/target-import-dashboard.tsx`.
- Erfolgreich ausgefuehrt: `npx vitest run src/lib/obj20-target-import.test.ts src/app/api/v1/target-import/route.test.ts` (10/10 Tests gruen), `npm run lint`, `npm run typecheck`.
- Nicht stabil testbar in dieser Session: echter Browserlauf auf `localhost:3000`, Cross-Browser-Matrix und ein echter Zarf/Harbor/Argo/Kubernetes-End-to-End-Import.

### Acceptance Criteria Status
- [x] AC-1: Import des Zarf-Pakets ist in `docs/offline-install.md` dokumentiert.
- [ ] BLOCKED AC-2: Das reale Laden der Container-Images per `zarf package deploy` ist im Zielsystem nicht praktisch nachgewiesen worden.
- [ ] BLOCKED AC-3: Das reale Einrichten von K8s-Deployments, Helm Charts und Manifesten in einer Zielumgebung ist in dieser QA-Session nicht praktisch nachgewiesen worden.
- [ ] BUG AC-4: Die geforderten Argo-CD-GitOps-Definitionen fuer Application, Project und ApplicationSet sind fuer OBJ-20 nicht als echte Deploy-Artefakte nachgewiesen; aktuell gibt es nur Dokumentation und Referenzen.
- [x] AC-5: Ein lokales Gitea-Release-Projekt ist in Modell, Doku und Handover-Referenzen abgebildet.
- [x] AC-6: Ein separates Gitea-Konfigurationsprojekt ist in Modell, Doku und Handover-Referenzen abgebildet.
- [ ] BUG AC-7: Ziel-spezifische Parameter sind nicht vollstaendig ueber `zarf.yaml` oder klar nachweisbare Overlays konfigurierbar.
- [ ] BUG AC-8: Die Mindestparameter `Ingress-Hostname` und `Keycloak/OIDC-Endpunkt` fehlen als explizite Zarf-Variablen in `zarf.yaml`.
- [ ] BLOCKED AC-9: Ein definierter Smoke-Test ist dokumentiert, aber der echte Nachweis nach einem Importlauf konnte ohne Zielumgebung nicht praktisch bestaetigt werden.
- [x] AC-10: Fehlende Voraussetzungen werden im Dry-Run mit klaren Blockern bzw. Validierungsfehlern abgebildet.
- [x] AC-11: Idempotenter Re-Run ist fachlich in Modell, Doku und UI abgebildet.
- [ ] BUG AC-12: Die App-of-Apps-Referenz auf Release- und Konfigurationsprojekt wird angezeigt, aber die echte Argo-CD-Quellenbindung ist nicht als lauffaehige Artefaktkette nachgewiesen.
- [x] AC-13: Der Import startet mit einem nachvollziehbaren Preflight-Check fuer Cluster, Registry, Argo CD, Namespace und Integritaet.
- [x] AC-14: Ein strukturierter Rehydrierungsnachweis ist im Modell und in der UI vorgesehen.
- [x] AC-15: Ein Rollback-/Recover-Run ist dokumentiert und im Modell nachvollziehbar.

### Edge Cases Status
- [x] Ungueltiger `deploymentMode`-Filter wird mit `422 INVALID_TARGET_IMPORT_MODE` abgewiesen.
- [x] Ungueltige Dry-Run-Payloads werden mit `422 TARGET_IMPORT_VALIDATION_ERROR` abgewiesen.
- [x] Fehlende Pflichtvoraussetzungen fuehren zu einem blockierten Dry-Run mit HTTP `409`.
- [ ] BUG: Dry-Run-Warnungen fuer `rerun`, `recovery` oder identische Revisionsnamen werden in der UI nicht sichtbar gemacht.
- [ ] BUG: Feldbezogene Validierungsdetails aus der API werden im UI nicht angezeigt; Nutzer sehen nur eine generische Fehlermeldung.
- [ ] BLOCKED: Cross-Browser-Test (Chrome, Firefox, Safari) und Responsive-Test (375px, 768px, 1440px) konnten mangels stabil erreichbarem lokalen Browserlauf nicht praktisch durchgefuehrt werden.
- [ ] BLOCKED: Edge Cases mit echter Harbor-/Argo-CD-/Gitea-/Cluster-Kommunikation konnten ohne Zielsystem nicht praktisch validiert werden.

### Security Audit Results
- [ ] BUG: `GET/POST /api/v1/target-import` sind ohne erkennbare Authentifizierungs- oder Rollenpruefung erreichbar und liefern interne Zielumgebungsdaten wie Cluster-, Registry-, Hostname- und Recovery-Informationen.
- [x] POST-Input wird per Zod validiert; offensichtliche Schema-Bypasse wurden nicht gefunden.
- [x] API-Rate-Limiting ist im Code fuer GET und POST eingebaut.
- [x] Keine offensichtliche XSS-Senke im Dashboard gefunden; React rendert die Rueckgabewerte escaped.
- [x] Fehlerantworten bleiben strukturiert und geben keine Stacktraces oder Secrets preis.

### Bugs Found
#### BUG-1: Fehlende Zielparameter in `zarf.yaml`
- **Severity:** High
- **Steps to Reproduce:**
  1. Oeffne `zarf.yaml`.
  2. Pruefe den Abschnitt `variables`.
  3. Vergleiche ihn mit den OBJ-20-Akzeptanzkriterien fuer `TARGET_REGISTRY_URL`, `Ingress-Hostname`, `Keycloak/OIDC-Endpunkt` und `Namespace`.
  4. Expected: Alle geforderten Zielparameter sind explizit konfigurierbar.
  5. Actual: Nur Namespace, Registry und Repo-Quellen sind als Zarf-Variablen vorhanden; `Ingress-Hostname` und `OIDC-Endpunkt` fehlen.
- **Priority:** Fix before deployment

#### BUG-2: Dry-Run-Warnungen werden im Dashboard nicht angezeigt
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Oeffne `/target-import`.
  2. Fuehre einen Dry-Run im Modus `rerun` oder `recovery` aus, oder verwende identische Release-/Config-Revisionen.
  3. Expected: Die UI zeigt die vom Backend erzeugten Warnungen sichtbar an.
  4. Actual: Die UI zeigt nur Status, Blocker, naechste Schritte und Nachweis, aber keine Warnungen.
- **Priority:** Fix before deployment

#### BUG-3: Feldspezifische Validierungsdetails gehen im UI verloren
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Oeffne `/target-import`.
  2. Gib absichtlich ungueltige Werte ein, z. B. eine nicht-semver-konforme Version oder einen ungueltigen Namespace.
  3. Expected: Die UI zeigt die konkreten Feldfehler aus der API an.
  4. Actual: Die API liefert Detailinformationen, die UI zeigt jedoch nur eine generische Fehlermeldung.
- **Priority:** Fix before deployment

#### BUG-4: Zielimport-API ist ohne sichtbare Zugriffskontrolle lesbar
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Rufe `GET /api/v1/target-import` auf.
  2. Beobachte die Rueckgabe mit Zielcluster, Registry-URL, Hostnamen, OIDC- und Recovery-Hinweisen.
  3. Expected: Die Route ist mindestens fuer authentifizierte Rollen oder einen internen Betriebsmodus begrenzt.
  4. Actual: Im aktuellen Code ist keine erkennbare Authentifizierungs- oder Autorisierungspruefung vorhanden.
- **Priority:** Fix before deployment

### Summary
- **Acceptance Criteria:** 8 passed, 4 failed, 3 blocked
- **Bugs Found:** 4 total (0 critical, 1 high, 3 medium, 0 low)
- **Security:** Issues found
- **Production Ready:** NO
- **Recommendation:** Zuerst Zielparameter in `zarf.yaml`, UI-Warnungen/Validierungsdetails und Zugriffskontrolle fuer die API schliessen; danach `/qa` fuer OBJ-20 erneut ausfuehren.

## Implementation Update
- Backend-Modell fuer Zielumgebungen, Importlaeufe, Preflight, Quellenbindung, Rehydrierungsnachweis und Recovery aufgebaut in `src/lib/obj20-target-import.ts`.
- API fuer OBJ-20 bereitgestellt unter `GET/POST /api/v1/target-import` fuer Laufuebersicht und Dry-Run-Simulation.
- Weboberflaeche unter `src/app/target-import/` umgesetzt mit:
  - Uebersicht ueber Importlaeufe je Zielumgebung
  - Filter fuer Umgebung, Status und Deployment-Modus
  - Detailansicht fuer Preflight, Quellenbindung und Recovery
  - Dry-Run-Form zur kontrollierten Vorpruefung eines Zielimports
- Betriebsdokumentation in `docs/offline-install.md` und `docs/argocd.md` um OBJ-20-Kontrollpunkte, Rehydrierungsnachweis und Recover-Run erweitert.
- Gezielte Tests fuer Datenmodell und API-Route umgesetzt.

## Deployment
_To be added by /deploy_
