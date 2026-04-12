# OBJ-21: GitOps / Argo CD / App-of-Apps

## Status: In Review
**Created:** 2026-04-03
**Last Updated:** 2026-04-10

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
- [ ] Nach dem initialen Sync ist der Argo-CD-Health-Status aller verwalteten Applications maschinell abfragbar und zeigt einen der Werte: Healthy, Degraded, Progressing oder Missing — kein Status gilt als "deployed" ohne Healthy-Nachweis
- [ ] Ein Bootstrap-Skript oder eine schrittweise dokumentierte Prozedur existiert für die Erstinstallation der Root-Application in einer leeren Zielumgebung; sie muss ohne Internetzugang ausführbar sein

## Edge Cases
- Was wenn Argo-CD in der Zielumgebung fehlt? → Klare Fehlermeldung; `docs/argocd.md` beschreibt Argo-CD-Voraussetzungen und Installationsweg
- Was wenn das Git-Repository in der Zielumgebung nicht erreichbar ist? → Argo-CD mit lokalem Repository-Mirror konfigurieren; in Zarf-Paket einschliessen
- Was wenn ein Sync fehlschlägt (z.B. Ressourcenkonflikt)? → Argo-CD zeigt detaillierte Fehlermeldung; Troubleshooting in `docs/argocd.md`
- Was wenn Argo-CD-Versionen zwischen Entwicklungs- und Zielumgebung abweichen? → Kompatibilitätsmatrix und Mindestversion in `docs/argocd.md` dokumentiert
- Was wenn ApplicationSet-Generatoren nicht unterstützt werden (ältere Argo-CD-Version)? → Fallback auf einzelne Application-Ressourcen dokumentiert
- Was wenn Argo-CD Self-Heal ungewollte Rollbacks auslöst? → Self-Heal standardmässig deaktiviert; nur auf expliziten Wunsch aktivierbar
- Was wenn Release- und Konfigurationsprojekt nicht zusammenpassen? → Sync wird blockiert; Version-Matrix muss angepasst werden
- Was wenn der initiale Sync länger als erwartet dauert? → Timeout-Wert ist konfigurierbar; nach Ablauf wird Sync als Degraded markiert und im Smoke-Test (OBJ-9) als blockierend gewertet
- Was wenn die Bootstrap-Prozedur teilweise durchgeführt wurde und abbricht? → Zustand ist idempotent neu startbar; halbfertige Ressourcen werden erkannt und bereinigt

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

### Komponenten-Struktur

```
gitops/
+-- argocd/
|   +-- root-application.yaml         (Root-App, verwaltet alle Teilkomponenten)
|   +-- appproject.yaml               (AppProject mit Quellen und Ziel-Namespaces)
|   +-- applications/
|       +-- app-core.yaml             (Kernapplikation: Deployment, Service, Ingress)
|       +-- app-monitoring.yaml       (OTel Collector, ClickHouse-Verbindung)
|       +-- app-ingress.yaml          (Ingress-Controller-Konfiguration)
+-- bootstrap/
    +-- bootstrap.sh                  (Erstinstallation Root-Application, airgapped)
    +-- README.md                     (Schritt-fuer-Schritt-Prozedur)
```

**App-of-Apps-Modell:**
```
Root-Application (Gitea: Release-Projekt, Tag/Branch)
+-- app-core        <- DNS-Service-Deployment (Helm Chart aus OBJ-25)
+-- app-monitoring  <- OTel-Stack
+-- app-ingress     <- Ingress-Konfiguration
    Alle Zielwerte (Registry-URLs, Hostnames) aus: Gitea Konfigurationsprojekt
```

### Datenmodell (Ressourcen)

```
AppProject:
- Name: dns-management
- Quellen: Gitea Release-URL, Gitea Konfigurations-URL
- Ziel-Namespaces: dns-management, monitoring
- Zulässige Ressourcen: Deployment, Service, Ingress, ConfigMap, Secret

Application (pro Teilkomponente):
- Name: z.B. dns-core, dns-monitoring
- Source: Gitea Release-Projekt + Pfad + Revision (Tag)
- Values-Overlay: Gitea Konfigurationsprojekt + Pfad (umgebungsspezifisch)
- Sync-Policy: manuell (Standard), auto-sync optional konfigurierbar
- Health-Check: Healthy / Degraded / Progressing / Missing

Revisionsbindung:
- Release-Projekt: semantischer Tag (z.B. v1.0.0)
- Konfigurations-Projekt: Branch oder separater Tag
- Bindungs-Matrix: dokumentiert in docs/argocd.md
```

### Technische Entscheidungen

**Zwei Gitea-Quellen (Release + Konfiguration):**
Zielkonfiguration (Registry-URLs, Hostnames, Umgebungsparameter) ist von der Releaseversion entkoppelt. Dasselbe Release-Artefakt kann in mehreren Umgebungen mit unterschiedlichen Konfigurationsprojekten deployt werden.

**Manueller Sync als Standard:**
In airgapped Mission-Network-Umgebungen sind unerwartete automatische Reconcile-Zyklen ein Sicherheitsrisiko. Self-Heal ist standardmässig deaktiviert und nur explizit aktivierbar.

**Bootstrap-Skript (idempotent):**
Erstinstallation der Root-Application muss ohne Internetzugang und bei teilweise abgebrochenem Vorgang wiederholbar sein. Halbfertige Ressourcen werden erkannt und sauber überschrieben.

**Helm Chart als Quelle (OBJ-25):**
Die Argo-CD-Applications referenzieren den Helm Chart aus OBJ-25, der als OCI-Artefakt in Harbor liegt. Damit entfällt lokales Chart-File-Management in der Zielumgebung.

**Health-Status maschinenlesbar:**
Argo-CD-API liefert Health-Status nach Sync. OBJ-16 (Maturitätsstatus) konsumiert diesen Status ohne manuellen Eingriff — "deployed" ist erst gültig bei `Healthy`.

### Abhängigkeiten

- OBJ-10: Kubernetes-Manifeste als Basis
- OBJ-19: Zarf-Paket beinhaltet Argo-CD-Manifeste für Offline-Import
- OBJ-20: Gitea-Projekte (Release + Konfiguration) werden durch Import bereitgestellt
- OBJ-25: Helm Chart als primäre Applikationsquelle in Argo-CD-Applications

## QA Test Results
**Tested:** 2026-04-10
**App URL:** http://localhost:3000/gitops (Live-Browserlauf in dieser QA-Session nicht stabil verfuegbar)
**Tester:** QA Engineer (AI)

### Test Scope and Evidence
- Geprueft wurden Spec, GitOps-Manifeste, Bootstrap-Doku und die Implementierung in `gitops/argocd/`, `gitops/bootstrap/`, `docs/argocd.md`, `src/lib/obj21-gitops.ts`, `src/app/api/v1/gitops/route.ts` und `src/app/gitops/gitops-dashboard.tsx`.
- Erfolgreich ausgefuehrt: `npm run test:run -- src/lib/obj21-gitops.test.ts src/app/api/v1/gitops/route.test.ts` (6/6 Tests gruen) und `npm run build` (gruen, `/gitops` und `/api/v1/gitops` wurden gebaut).
- Nicht praktisch validierbar in dieser Session: echter Argo-CD-Clusterlauf, Cross-Browser-Matrix und Responsive-Pruefung im realen Browser.

### Acceptance Criteria Status
- [x] AC-1: Argo-CD-Ressourcen liegen deklarativ im Repository unter `gitops/argocd/`.
- [x] AC-2: Root-Application und ApplicationSet als Einstiegspunkt sind definiert.
- [x] AC-3: Teilkomponenten sind als separate Applications strukturierbar (`app-core`, `app-monitoring`, `app-ingress`, `app-security`).
- [x] AC-4: Projekte, Ziel-Namespaces, Quellen und Sync-Policy sind in Manifesten nachvollziehbar beschrieben.
- [x] AC-5: Zwei getrennte Gitea-Quellen fuer Release und Konfiguration sind definiert.
- [x] AC-6: Manueller Sync ist Standard; automatisierter Sync ist fuer ausgewaehlte Komponenten konfigurierbar.
- [ ] BUG AC-7: Die Argo-CD-Definitionen sind nicht als echte GitOps-Manifeste im Zarf-Paket enthalten; aktuell werden nur Handover-Metadaten referenziert.
- [x] AC-8: Der Argo-CD-Installationsablauf ist in `docs/argocd.md` und `gitops/bootstrap/README.md` dokumentiert.
- [x] AC-9: App-of-Apps-Bereitschaft ist im Maturitaetskontext sichtbar.
- [x] AC-10: Argo-CD-Sync und Smoke-Test sind im Deployability-Kontext dokumentiert.
- [x] AC-11: Ziel-spezifische Werte sind ueber Values-Dateien aus dem Konfigurationsprojekt parameterisierbar.
- [x] AC-12: Die Revisionsbindung zwischen Release- und Konfigurationsprojekt ist definiert.
- [ ] BUG AC-13: Der maschinell abfragbare Health-Status ist nur statisch modelliert und nicht an den realen Argo-CD-Zustand gebunden; zudem zeigen die Manifeste auf einen nicht vorhandenen Helm-Pfad.
- [x] AC-14: Eine offline-faehige Bootstrap-Prozedur fuer leere Zielumgebungen ist beschrieben und als Skript vorhanden.

### Edge Cases Status
- [x] Fehlende Argo-CD-Voraussetzungen werden im Bootstrap-Skript ueber fehlende Kommandos/Dateien bzw. fehlende Kubernetes-Rechte frueh abgebrochen.
- [x] Aeltere Argo-CD-Versionen ohne `ApplicationSet` sind ueber dokumentierte Fallback-Applications beruecksichtigt.
- [x] Manueller Sync als Default reduziert das Risiko unbeabsichtigter Self-Heal-Rollbacks.
- [ ] BUG: Der reale Sync in einer Zielumgebung kann aktuell nicht erfolgreich werden, weil die Applications auf `helm/dns-service` statt auf den vorhandenen Chart-Pfad zeigen.
- [ ] BLOCKED: Cross-Browser-Test (Chrome, Firefox, Safari) und Responsive-Test (375px, 768px, 1440px) konnten ohne stabilen Live-Browserlauf nicht praktisch durchgefuehrt werden.
- [ ] BLOCKED: Ein echter Offline-Bootstrap mit Argo CD, Gitea und Zielcluster konnte in dieser Session nicht End-to-End validiert werden.

### Security Audit Results
- [ ] BUG: `GET /api/v1/gitops` ist ohne erkennbare Authentifizierungs- oder Rollenpruefung lesbar und gibt interne Betriebsdaten wie Repo-URLs, Revisionen, Namespaces und Blocker preis.
- [ ] BUG: Das AppProject ist mit `clusterResourceWhitelist: */*` und `namespaceResourceWhitelist: */*` sehr weit offen und verletzt Least-Privilege fuer einen GitOps-Betriebspfad.
- [x] Query-Parameter der API werden sauber validiert; ungueltige Filter liefern kontrollierte `422`-Antworten.
- [x] Rate-Limiting ist fuer die Route aktiviert.
- [x] Im geprueften OBJ-21-Pfad wurden keine hart codierten Secrets gefunden.

### Bugs Found
#### BUG-1: GitOps-Applications referenzieren einen nicht vorhandenen Helm-Chart-Pfad
- **Severity:** High
- **Steps to Reproduce:**
  1. Pruefe die Argo-CD-Manifeste unter [applicationset.yaml](/Users/gregorkurth/Documents/Dev/test-dns/gitops/argocd/bootstrap-resources/applicationset.yaml#L49) und [app-core.yaml](/Users/gregorkurth/Documents/Dev/test-dns/gitops/argocd/applications/app-core.yaml#L14).
  2. Vergleiche den dort referenzierten Pfad `helm/dns-service` mit dem real vorhandenen Chart unter [Chart.yaml](/Users/gregorkurth/Documents/Dev/test-dns/helm/dns-management-service/Chart.yaml#L1).
  3. Expected: Die GitOps-Applications zeigen auf einen im Release-Repo vorhandenen Helm-Chart-Pfad.
  4. Actual: Alle GitOps-Applications referenzieren `helm/dns-service`, dieses Verzeichnis existiert im Repository nicht.
- **Priority:** Fix before deployment

#### BUG-2: GitOps-Status ist statisch modelliert statt aus Argo CD oder echten Artefakten abgeleitet
- **Severity:** High
- **Steps to Reproduce:**
  1. Oeffne [obj21-gitops.ts](/Users/gregorkurth/Documents/Dev/test-dns/src/lib/obj21-gitops.ts#L106).
  2. Pruefe, wie [route.ts](/Users/gregorkurth/Documents/Dev/test-dns/src/app/api/v1/gitops/route.ts#L73) die Daten fuer `/api/v1/gitops` laedt.
  3. Expected: Der Health-/Sync-Status wird aus realen Argo-CD-Nachweisen, Import-Artefakten oder einer belastbaren Statusquelle gelesen.
  4. Actual: Die API liefert ein hart codiertes Dokument mit festen Statuswerten (`Healthy`, `Progressing`, `Degraded`, `Missing`) unabhaengig vom realen Zielzustand.
- **Priority:** Fix before deployment

#### BUG-3: Zarf-Paket enthaelt die GitOps-Definitionen nicht als deployierbare Inhalte
- **Severity:** High
- **Steps to Reproduce:**
  1. Oeffne [zarf.yaml](/Users/gregorkurth/Documents/Dev/test-dns/zarf.yaml#L44) und [zarf.yaml](/Users/gregorkurth/Documents/Dev/test-dns/zarf.yaml#L59).
  2. Vergleiche die eingebundenen Dateien mit den fuer OBJ-21 benoetigten Manifests unter [root-application.yaml](/Users/gregorkurth/Documents/Dev/test-dns/gitops/argocd/root-application.yaml#L1) und [appproject.yaml](/Users/gregorkurth/Documents/Dev/test-dns/gitops/argocd/bootstrap-resources/appproject.yaml#L1).
  3. Expected: Root-Application, AppProject, ApplicationSet und Bootstrap-Artefakte sind als Teil des Offline-Pakets enthalten.
  4. Actual: Das Paket fuehrt nur Helm/K8s-Assets, Doku und Handover-JSONs mit; die GitOps-Manifeste selbst werden nicht ausgeliefert.
- **Priority:** Fix before deployment

#### BUG-4: GitOps-API ist ohne sichtbare Zugriffskontrolle lesbar
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Oeffne [route.ts](/Users/gregorkurth/Documents/Dev/test-dns/src/app/api/v1/gitops/route.ts#L36).
  2. Pruefe die Route auf Session-, Rollen- oder Auth-Checks.
  3. Expected: Betriebsdaten sind mindestens auf authentifizierte Operator-/Viewer-Rollen begrenzt.
  4. Actual: Die Route nutzt nur Parametervalidierung und Rate-Limit; eine erkennbare Zugriffskontrolle fehlt.
- **Priority:** Fix before deployment

#### BUG-5: AppProject erlaubt beliebige Cluster- und Namespace-Ressourcen
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Oeffne [appproject.yaml](/Users/gregorkurth/Documents/Dev/test-dns/gitops/argocd/bootstrap-resources/appproject.yaml#L23).
  2. Vergleiche die Resource-Whitelist mit der in der Tech-Design-Beschreibung erwarteten kontrollierten Freigabe.
  3. Expected: Nur benoetigte Ressourcentypen und Zielbereiche sind erlaubt.
  4. Actual: `clusterResourceWhitelist` und `namespaceResourceWhitelist` sind mit `*/*` voll offen.
- **Priority:** Fix before deployment

### Summary
- **Acceptance Criteria:** 12 passed, 2 failed, 0 blocked
- **Bugs Found:** 5 total (0 critical, 3 high, 2 medium, 0 low)
- **Security:** Issues found
- **Production Ready:** NO
- **Recommendation:** Zuerst den falschen Helm-Pfad, die statische Statusquelle und die fehlende Zarf-Einbettung beheben; danach API-Zugriff und AppProject-Rechte haerten und `/qa` fuer OBJ-21 erneut ausfuehren.

## Deployment
### Deployment-Status (Stand: 2026-04-11)
- Auslieferung erfolgt Git-first ueber Branch/PR/Merge nach `main`.
- Release- und Export-Nachweise werden in `docs/releases/` und `docs/exports/EXPORT-LOG.md` dokumentiert.
- Confluence bleibt Sekundaerziel: Export erst nach gepflegter Git-Dokumentation.
- Falls **Production Ready: NO** gilt, bleibt das Deployment als vorbereitet markiert und wird erst nach Freigabe produktiv ausgerollt.

## Implementation Update
- GitOps-Struktur unter `gitops/` angelegt mit:
  - `gitops/argocd/root-application.yaml`
  - `gitops/argocd/bootstrap-resources/appproject.yaml`
  - `gitops/argocd/bootstrap-resources/applicationset.yaml`
  - Fallback-Applications unter `gitops/argocd/applications/`
  - Offline-Bootstrap in `gitops/bootstrap/bootstrap.sh` und `gitops/bootstrap/README.md`
- Backend-Datenmodell fuer Root-Application, Quellenbindung, Revisionsmatrix, Child-Applications und Bootstrap-Schritte in `src/lib/obj21-gitops.ts` umgesetzt.
- API `GET /api/v1/gitops` bereitgestellt fuer App-of-Apps-Status, Quellen, Revisionsbindung und Bootstrap-Nachweis.
- Management-Sicht unter `src/app/gitops/` umgesetzt:
  - KPI-Karten fuer Healthy, Progressing, Degraded und Missing
  - Filterbare Child-Application-Tabelle
  - Sicht auf Root-Application, Release-/Config-Quelle und Revisionsmatrix
  - Offline-Bootstrap-Ablauf mit Health-Nachweis
- `docs/argocd.md` um OBJ-21-spezifische Betriebsregeln, Zwei-Quellen-Modell und Bootstrap-Prozedur erweitert.
- Gezielte Tests fuer Datenmodell und API-Route angelegt.
