# OBJ-10: Kubernetes Deployment

## Status: In Review
**Created:** 2026-04-03
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-3: REST API (API muss vorhanden sein, bevor das Deployment vollständig getestet werden kann)
- OBJ-1: CI/CD Pipeline (Pipeline baut und pusht das Container-Image)
- OBJ-12: Security & Authentifizierung (Zero-Trust-Netzwerkregeln und Runtime-Schutz)
- OBJ-21: GitOps / Argo CD / App-of-Apps (Zielpfad fuer deklaratives Rollout; die Manifest-Struktur bleibt bereits kompatibel)

## User Stories
- Als Platform Engineer möchte ich die DNS-Konfigurations-App mit einem einzigen `kubectl apply` in einem Kubernetes-Cluster deployen, damit ich keine manuelle Installation durchführen muss.
- Als Mission Network Operator möchte ich, dass die App in einer airgapped Umgebung ohne externen Registry-Zugriff läuft, damit der Betrieb auch ohne Internetverbindung möglich ist.
- Als Platform Engineer möchte ich alle K8s-Ressourcen deklarativ und versioniert im Repository vorfinden, damit der Deploymentstand jederzeit nachvollziehbar ist.
- Als Platform Engineer möchte ich die App in einen definierten Namespace deployen können, damit sie sauber von anderen Workloads getrennt ist.
- Als Operator möchte ich, dass die App nach einem Pod-Neustart automatisch wieder verfügbar ist, damit kein manueller Eingriff nötig ist.
- Als Security-Verantwortlicher möchte ich Pod-zu-Pod-Kommunikation strikt regeln (Zero Trust), damit nur explizit erlaubte Verbindungen möglich sind.
- Als Platform Engineer möchte ich ein gehärtetes Minimal-Image mit festem Image-Digest verwenden, damit die Angriffsfläche klein und der Build reproduzierbar bleibt.
- Als DevOps-Verantwortlicher möchte ich die Manifest-Struktur direkt für GitOps/App-of-Apps nutzen können, damit Releases später ohne Medienbruch ausgerollt werden.
- Als Engineer möchte ich eine lokale Kubernetes-Variante für Docker Desktop oder einen vergleichbaren Entwicklungscluster haben, damit ich das Deployment ohne grosses Cluster-Setup prüfen kann.
- Als Security- und Observability-Verantwortlicher möchte ich OPA-, Tetragon- und Hubble-Hinweise an den relevanten Stellen sehen, damit Policies und Laufzeitereignisse nachvollziehbar bleiben.

## Acceptance Criteria
- [ ] K8s-Manifest für Deployment (mind. 2 Replicas, Liveness/Readiness Probes) vorhanden
- [ ] K8s-Manifest für Service (ClusterIP, ggf. NodePort für lokalen Betrieb) vorhanden
- [ ] K8s-Manifest für Ingress (mit konfigurierbarem Hostname) vorhanden
- [ ] K8s-Manifest für ConfigMap (App-Konfiguration ohne Secrets) vorhanden
- [ ] K8s-Manifest für Namespace vorhanden und der Namespace ist konfigurierbar
- [ ] K8s-Manifest für Secret/Runtime-Zugriff ist nur dort vorhanden, wo es technisch zwingend benötigt wird
- [ ] Container-Image enthält alle Assets; kein Pull aus externen Registries zur Laufzeit
- [ ] Container-Image basiert auf gehärtetem Minimal-Base-Image; Runtime enthält nur benötigte Komponenten
- [ ] Container-Image ist OCI-konform (Image/Manifest/Media Types gemäss Open Container Initiative)
- [ ] Falls Workload nur BIND9 bereitstellt: BIND9-spezifisches Minimal-Image wird verwendet
- [ ] Ressourcenlimits (CPU/Memory requests und limits) definiert
- [ ] Cilium Network Policies (oder CiliumClusterwideNetworkPolicies) sind vorhanden: Default-Deny fuer Ingress und Egress sowie explizite Allow-Regeln
- [ ] Pod-zu-Pod-Verkehr ist TLS-verschlüsselt (mTLS) und die Zertifikats-/Trust-Strategie ist dokumentiert
- [ ] OPA-Policy-Prüfungen sind für die Deployment-Manifeste beschrieben und blockieren nicht-konforme Konfigurationen
- [ ] Tetragon- und Hubble-Hinweise sind für Laufzeit- und Netzwerkereignisse vorgesehen
- [ ] Die Manifest-Struktur ist für GitOps/App-of-Apps geeignet und kann als Ziel für spätere Argo-CD-Imports verwendet werden
- [ ] Die App ist nach `kubectl apply -k k8s/` in einem lokalen oder internen Kubernetes-Cluster betriebsbereit
- [ ] Ein lokales Overlay für Docker Desktop oder einen vergleichbaren Entwickler-Cluster ist vorgesehen
- [ ] Pod-Neustart führt zu keiner Funktionsunterbrechung und benötigt keinen manuellen Wiederanlauf
- [ ] Alle Manifeste sind mit `kubectl --dry-run=client` validierbar
- [ ] Der Betrieb benötigt keine externen Dienste zur Laufzeit
- [ ] Die eingesetzte Image-Quelle ist für den Zielbetrieb dokumentiert (z. B. Registry-Import oder lokales Laden)

## Edge Cases
- Was passiert bei einem Namespace-Konflikt? → Namespace-Manifest ist idempotent
- Was wenn kein Ingress-Controller vorhanden ist? → Service kann alternativ als NodePort betrieben werden
- Was wenn das lokale Container-Image nicht gefunden wird? → Klare Fehlermeldung mit Anleitung zum lokalen Image-Load
- Was wenn Ressourcenlimits zu knapp gesetzt sind? → OOM-Kill führt zu Pod-Neustart; Richtwerte sind dokumentiert und anpassbar
- Was wenn der Cluster keine Ingress-Klasse hat? → Ingress-Klasse ist konfigurierbar; Fallback auf NodePort dokumentiert
- Was wenn eine Zero-Trust-Policy legitimen Traffic blockiert? → Runbook mit erlaubten Kommunikationspfaden und gezielter Policy-Anpassung
- Was wenn mTLS-Zertifikate für Pod-zu-Pod-Verkehr ablaufen? → Zertifikatsrotation als Betriebsprozess dokumentieren und prüfbar machen
- Was wenn Cilium oder OPA im Zielcluster nicht verfügbar ist? → Das Deployment weist klar auf die fehlende Sicherheitsbasis hin und kann erst nach Aktivierung freigegeben werden
- Was wenn GitOps/App-of-Apps noch nicht angeschlossen ist? → Die Manifeste bleiben dennoch direkt nutzbar und können später ohne Umbau übernommen werden
- Was wenn das lokale Overlay auf Docker Desktop keine Ingress-Klasse bereitstellt? → Ein dokumentierter Service-Fallback bleibt möglich
- Was wenn ein Policy-Check ein harmloses Update blockiert? → Die Policy-Fehlermeldung muss eindeutig machen, welche Regel angepasst werden muss
- Was wenn Observability nur teilweise vorhanden ist? → Mindestens ein klarer Hinweis auf die fehlende Telemetrie muss im Betriebsleitfaden stehen

## Technical Requirements
- Kubernetes-Version: >= 1.28
- Manifest-Struktur unter `k8s/` mit klar getrennten Basis- und Umgebungsvarianten
- Airgapped-fähiger Betrieb ohne externe Calls beim Start der Anwendung
- Hardened Minimal-Image mit dokumentiertem, festem Digest
- OCI-konforme Container-Images (Open Container Initiative)
- GitOps-kompatible Ressourcengestaltung fuer spätere App-of-Apps-Nutzung
- Cilium für Netzwerksegmentierung und explizite Ingress-/Egress-Kontrolle
- Pod-zu-Pod-Kommunikation mit mTLS und nachvollziehbarer Trust-Strategie
- OPA als Policy-Prüfung fuer Sicherheits- und Konfigurationsregeln
- Tetragon und Hubble als Quellen für Laufzeit- und Netzwerksicht
- Lokales Entwickler-Overlay für Docker Desktop oder einen vergleichbaren Cluster
- Keine Laufzeit-Abhängigkeit von CDN, externen Registries oder Internetdiensten

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
### Scope
OBJ-10 liefert den Kubernetes-Betriebsrahmen fuer die DNS-Konfigurations-App. Die Funktion baut keine Fachlogik neu, sondern macht das bestehende Produkt als deklarative, gehaertete und airgapped-faehige Kubernetes-Anwendung bereit.

Der Schwerpunkt liegt auf drei Betriebswegen:
- lokales Testen auf Docker Desktop oder einem vergleichbaren Entwicklungs-Cluster
- interner Clusterbetrieb mit klaren Netzwerk- und Sicherheitsgrenzen
- spaetere GitOps/App-of-Apps-Nutzung ohne strukturellen Umbau

### Visual Tree
```text
Kubernetes Cluster
+-- Namespace
|   +-- App Workloads
|   |   +-- Deployment
|   |   |   +-- DNS App Pods
|   |   +-- Service
|   |   +-- Ingress
|   +-- Config / Runtime Inputs
|   |   +-- ConfigMap
|   |   +-- Secret only if strictly needed
|   +-- Security Layer
|   |   +-- Cilium Default-Deny Policies
|   |   +-- Explicit Pod-to-Pod Allow Rules
|   |   +-- mTLS Trust Boundary
|   |   +-- OPA Policy Checks
|   +-- Observability Layer
|       +-- Tetragon Hooks
|       +-- Hubble Visibility
|   +-- GitOps Compatibility
|       +-- App-of-Apps ready manifest structure
```

### Data / Config Model
Es werden keine Fachdaten verwaltet, sondern nur Betriebsinformationen fuer den Cluster:
- Namespace-Name und Umgebungsname
- Image-Referenz inklusive festem Digest
- Ressourcengrenzen und Laufzeitparameter
- Konfigurationswerte fuer App, Service und Ingress
- Sicherheitsvorgaben fuer erlaubte Kommunikation
- Hinweise, welche Telemetrie-Quellen im Cluster erwartet werden

Die Anwendung selbst bleibt stateless. Persistenter Zustand gehoert nicht in diesen Feature-Scope.

### Technical Decisions
- **Deklarative Manifeste statt manueller Cluster-Schritte**, weil das die einzige vernuenftige Grundlage fuer nachvollziehbaren Betrieb, GitOps und Offline-Import ist.
- **Klar getrennte Basis- und Umgebungsvarianten**, weil sich damit lokale Tests, interne Cluster und spaetere Zielsysteme ohne doppelte Pflege abbilden lassen.
- **Hardened Minimal-Image**, weil die Angriffsoberflaeche so klein wie moeglich bleiben soll und ein fest gepinnter Digest Reproduzierbarkeit schafft.
- **Cilium fuer Network Policy**, weil Zero-Trust nicht nur dokumentiert, sondern auch technisch durchgesetzt werden soll.
- **OPA fuer Policy-Pruefung**, weil Sicherheitsregeln frueh greifen muessen, bevor unsaubere Manifeste in den Cluster gelangen.
- **mTLS fuer Pod-zu-Pod-Verkehr**, weil Verschluesselung auf Transportebene ein Kernbestandteil der Zielarchitektur ist.
- **Tetragon und Hubble als Sichtbarkeitsbausteine**, weil Security und Betrieb nicht nur blockieren, sondern auch erklaeren muessen, was im Cluster passiert.
- **GitOps-App-of-Apps-Kompatibilitaet**, weil die Deployment-Struktur spaeter ohne Neuschreibung von einer zentralen Steuerung uebernommen werden soll.

### Dependencies
- Kubernetes 1.28+ als Ausfuehrungsumgebung
- Cilium fuer Netzwerk- und Policy-Durchsetzung
- OPA fuer Admission- und Konfigurationspruefungen
- Tetragon fuer Laufzeitereignisse
- Hubble fuer Netzwerksicht
- Argo CD als Ziel fuer App-of-Apps-Verbrauch
- Registrierungs- oder Importpfad fuer das Container-Image

### Requirements Input
Dieses Design basiert auf den aktuellen Anforderungen fuer:
- airgapped Betrieb
- gehärtetes Minimal-Image
- GitOps/App-of-Apps-Zielbild
- Cilium-Ingress-/Egress-Kontrolle
- Pod-to-Pod-mTLS
- OPA-Validierung
- Tetragon/Hubble-Observability
- lokales Testen ohne grosses Cluster-Setup

### QA Readiness
Vor der Uebergabe an die Implementierung sollte mit der Umsetzung mindestens Folgendes pruefbar sein:
- Manifeste lassen sich lokal validieren
- Ein lokales Cluster kann die App ohne externe Abhaengigkeiten starten
- Sicherheitsregeln blockieren unerwuenschte Verbindungen nachvollziehbar
- Beobachtbarkeit ist im Cluster sichtbar oder die fehlende Telemetrie ist klar dokumentiert
- Ein Pod-Neustart fuehrt nicht zu einem manuellen Wiederanlauf
- Die Struktur ist fuer spaetere GitOps-Uebernahme schon vorbereitet

## Implementation Update
**Stand:** 2026-04-09

Die konkrete Kubernetes-Struktur fuer OBJ-10 ist jetzt unter `k8s/` angelegt und folgt einem Kustomize-Aufbau mit gemeinsamer Basis sowie getrennten Overlays fuer `local` und `internal`.

Erstellt wurden:
- eine gemeinsame Basis mit Namespace, ConfigMap, Deployment, Service, Ingress und Cilium Default-Deny plus expliziter Allow-Policy
- ein lokales Overlay fuer Docker Desktop oder vergleichbare Entwickler-Cluster mit lokalem Image, NodePort-Fallback und localhost-freundlichem Hostnamen
- ein internes Overlay fuer produktionsnahen Clusterbetrieb mit ClusterIP- und Ingress-Ausrichtung
- Sicherheitsmarkierungen und Hinweise fuer OPA-Policy-Pruefung, Cilium-mTLS-Durchsetzung sowie Hubble- und Tetragon-Sichtbarkeit
- ein reproduzierbares Prüfskript `scripts/check-obj10-k8s.mjs`, das Rendern, Digest-Hygiene, mTLS-Policy und optionalen OCI-Artifact-Check abdeckt

Aktueller Status:
- Manifest-Struktur ist vorhanden und fuer lokale Validierung bereit
- Laufzeit-Secrets wurden bewusst nicht angelegt, weil fuer den aktuellen App-Stand keine zwingenden geheimen Werte im Deployment benoetigt werden
- Das Default-Image ist digest-pinned; das lokale Overlay bleibt als explizite Dev-Ausnahme tag-basiert und ohne `latest`
- Die produktive mTLS-/OPA-Durchsetzung ist in den Manifests verankert; ein echter Cluster-Smoke-Test bleibt als Rest-Risiko bestehen

QA-Fix-Hinweis:
- Der zuvor ungueltige `:latest`-Default wurde durch eine digest-pinned Referenz ersetzt.
- Die Cilium-Policy erzwingt jetzt `authentication.mode: required` fuer pod-to-pod-nahe Allow-Regeln.
- Der OCI-Nachweis ist als objektiver Check im Repo vorhanden; ein externer Artifact-Ref kann bei Verfuegbarkeit zusaetzlich geprueft werden.

## QA Test Results
**Tested:** 2026-04-09
**App URL:** N/A (Kubernetes Deployment Artefakte)
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status
- [x] Deployment, Service, Ingress, ConfigMap und Namespace-Manifeste vorhanden
- [x] Ressourcenlimits sowie Liveness/Readiness-Probes vorhanden
- [x] Cilium Default-Deny und explizite Allow-Policy vorhanden
- [x] Pod-to-pod-mTLS ist durch `authentication.mode: required` in den Allow-Regeln technisch verankert
- [x] Lokales und internes Overlay vorhanden und per Kustomize renderbar
- [x] OPA-, Tetragon- und Hubble-Hinweise in Manifesten vorhanden
- [x] Keine zwingend benoetigten Laufzeit-Secrets im aktuellen Scope erforderlich
- [x] Digest-Pinning fuer das Default-Deployment ist umgesetzt
- [x] OCI-Pruefpfad fuer Manifest- und optionales Artifact-Review ist im Repo vorhanden
- [x] `scripts/check-obj10-k8s.mjs` verifiziert Rendern, Digest-Hygiene und Policy-Anforderungen
- [ ] BLOCKED: `kubectl apply --dry-run=client` auf einem echten API-Server sowie Pod-Neustart-/mTLS-Smoke-Test brauchen einen erreichbaren Cluster
- [ ] BLOCKED: Ein produktiver OCI-Artifact-Ref fuer den optionalen Mediennachweis ist aktuell nicht im Repo abgelegt

### Edge Cases Status
- [x] Fallback fuer fehlende Ingress-Class ueber `local`-Overlay vorbereitet
- [x] Namespace-Konfiguration ueber Overlays anpassbar
- [x] Mutable `:latest`-Referenzen sind ausgeschlossen
- [ ] BLOCKED: Laufzeitverhalten bei Policy-Blockaden und Pod-Restarts nicht praktisch getestet (kein Cluster)

### Security Audit Results
- [x] Pod/Container Hardening gesetzt (`runAsNonRoot`, `readOnlyRootFilesystem`, `allowPrivilegeEscalation: false`, `capabilities.drop: ALL`)
- [x] Netzwerksegmentierung mit Default-Deny + Allowlisting vorhanden
- [x] mTLS ist jetzt als `authentication.mode: required` in den Allow-Regeln verankert
- [ ] BLOCKED: Effektive Durchsetzung im Zielcluster muss noch live gegen einen erreichbaren Cluster bestaetigt werden

### Bugs Found
Keine offenen funktionalen Bugs im Repo-Stand gefunden.

### Summary
- **Acceptance Criteria:** 10 passed, 0 failed, 2 blocked
- **Bugs Found:** 0 total
- **Security:** Requirements satisfied at repository level; runtime verification still pending cluster
- **Production Ready:** NO
- **Recommendation:** Cluster-Smoke-Test und optionalen OCI-Artifact-Ref nachreichen, dann `/qa` erneut ausfuehren

## Deployment
_To be added by /deploy_
