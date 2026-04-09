# App-Template-Anweisung

## Ziel

Jede Applikation wird nach einem einheitlichen Standard geplant, umgesetzt, getestet, dokumentiert, paketiert, transportiert und betrieben.
Die App muss so aufgebaut sein, dass sie als vollständiges, betreibbares Produkt in Kubernetes lauffähig ist und
alle wesentlichen Plattform-, Sicherheits-, Qualitäts-, Supply-Chain- und Betriebsanforderungen erfüllt.

Die Applikation endet nicht beim erfolgreichen Build oder beim lokalen Deployment. Sie gilt erst dann als template-konform,
wenn sie reproduzierbar gebaut, sicher bewertet, als eigenständiges Paket offline weitergegeben und in einer Zielumgebung
kontrolliert installiert werden kann.

## Verbindliche Grundsätze

1. **Git als Single Source of Truth**
   - Jede Applikation besitzt ein eigenes Git-Repository.
   - In der Entwicklungs- und Produktionsquelle wird dafuer standardmaessig GitLab verwendet.
   - In der Offline-Zielumgebung wird Gitea als lokale Git-Plattform verwendet.
   - Fuer den Zielbetrieb werden zwei getrennte Gitea-Projekte gefuehrt:
     - ein Release-Projekt (deploybare Artefakte aus dem Zarf-Release)
     - ein Konfigurationsprojekt (Parameter, Helm Values, Overlays, Environment-Werte)
   - Alle Spezifikationen, Architekturdokumente, Deployments, Pipelines, Tests, Releases und Paketdefinitionen werden versioniert im Repository verwaltet.
   - Git ist die führende Quelle für Anforderungen, Implementierungsstand und Änderungsverlauf.

2. **Kubernetes als Zielplattform**
   - Die Applikation muss für den Betrieb auf Kubernetes vorgesehen sein.
   - Deployment-Artefakte müssen deklarativ und versioniert vorliegen.
   - Die App muss in eine standardisierte Plattform-/Namespace-Struktur integrierbar sein.

3. **GitOps und deklarative Installation**
   - Die Installation soll GitOps-fähig sein.
   - Für den Zielbetrieb ist Argo CD als bevorzugter GitOps-Mechanismus zu berücksichtigen.
   - Die Applikation muss eine Installation im **App-of-Apps**-Modell unterstützen.
   - Die für Argo CD benötigten Application-, Project- und gegebenenfalls ApplicationSet-Ressourcen müssen deklarativ bereitgestellt werden.
   - Die App-of-Apps-Root-Application muss mindestens das Release-Projekt und das separate Konfigurationsprojekt als Quellen beruecksichtigen.

4. **Offline- und Transferfähigkeit**
   - Jede Applikation muss nach dem Build und der Freigabe offline weitergegeben werden können.
   - Die Weitergabe erfolgt über ein **Zarf-Paket / Zarf-File**.
   - Das Paket muss so aufgebaut sein, dass es in einer getrennten Zielumgebung reproduzierbar importiert und installiert werden kann.
   - Der Transport in die Zielumgebung kann per Datentraeger (z. B. USB) erfolgen; nach dem Transport muessen Import und Deployment reproduzierbar sein.

5. **Pflicht-Bausteine jeder Applikation**
   Jede Applikation muss mindestens folgende Bestandteile enthalten:
   - Git Repository (GitLab als Quelle, Gitea in der Zielumgebung)
   - Kubernetes Deployment
   - Web GUI
   - API
   - Kubernetes Operator
   - Monitoring und Observability mit OpenTelemetry
   - Security und Authentifizierung
   - Zero-Trust-Netzwerksegmentierung (Cilium)
   - Policy Enforcement mit Open Policy Agent (OPA)
   - Runtime Threat Detection mit Tetragon
   - Netzwerkbeobachtbarkeit mit Cilium Hubble
   - Feature-Flag-Standard mit OpenFeature
   - Rollen- und Rechtemodell
   - Keycloak-Anbindbarkeit
   - Testing-Konzept
   - CI/CD Pipeline
   - Release Management
   - SBOM und Security-Scanning
   - Zarf-Paket für Offline-Weitergabe
   - App-of-Apps-fähige Installation mit Argo CD
   - Dokumentation
   - Dokumentationsportal als MkDocs-Website mit Versionsumschaltung
   - E-Book-Export der Dokumentation (pro Release-Version)
   - Benutzerhandbuch mit drei getrennten Themenbereichen
   - allgemeine Produkt-/Projekt-Website
   - Grafana-Dashboard-Vorlage fuer Service-Observability
   - Maturitätsstatus / Reifegradübersicht

## Zielbild der Delivery-Kette

Die Standard-Delivery-Kette einer App ist wie folgt:

1. Entwicklung und Versionierung im GitLab-Repository (Quellumgebung)
2. Automatischer Build, Test und Qualitätssicherung in der CI/CD-Pipeline
3. Erzeugung und Veröffentlichung der Build-Artefakte
4. Ablage von Container-Images und weiteren Artefakten in Registry-/Artifact-Systemen wie Harbor und/oder Nexus
5. Erzeugung von SBOM und Durchführung von Security-Scans
6. Versionierte Freigabe eines Releases in GitLab
7. Erzeugung eines Zarf-Pakets für die Offline-Weitergabe
8. Transfer des Zarf-Pakets in eine Zielumgebung, z. B. via Datenträger oder kontrollierte Übergabe
9. Import der benoetigten Artefakte in die Zielumgebung, inklusive Import des Release-Projekts nach Gitea
10. Bereitstellung oder Aktualisierung des separaten Konfigurationsprojekts in Gitea (Parameter, Helm Values, Overlays)
11. Installation der Applikation in Kubernetes ueber Argo CD im App-of-Apps-Modell, mit beiden Gitea-Projekten als Quellen
12. Aktivierung von Zero-Trust-Richtlinien (Cilium + mTLS), Runtime-Ueberwachung (Tetragon) und Policy Enforcement (OPA)

## Verbindliche Anforderungen je Baustein

### 1. Repository / Git / GitLab / Gitea
- Das Repository enthält Quellcode, Deployments, Dokumentation, Tests, Release-Informationen und Paketdefinitionen.
- Feature-Spezifikationen werden in Markdown gepflegt.
- Änderungen müssen über nachvollziehbare Commits, Merge Requests und Releases dokumentiert sein.
- Die Repository-Struktur muss klar zwischen Source Code, Deployments, Docs, Tests, CI/CD und Packaging unterscheiden.
- Das produktive Quell-Repository liegt in GitLab; fuer Zielumgebungen wird ein lokales Gitea-Repository verwendet.
- Release-Inhalte (deploybare Artefakte) und Zielkonfiguration (Parameter/Helm-Values) muessen als getrennte Git-Projekte fuehrbar sein.

### 2. API
- Jede Applikation stellt eine klar definierte API bereit.
- Die API dient als stabile Schnittstelle für Web GUI, Operator und externe Systeme.
- Schnittstellen müssen dokumentiert, versionierbar und testbar sein.
- Die API muss maschinenlesbar als OpenAPI bereitgestellt werden (z. B. `/api/v1/openapi.json`).
- Zusätzlich muss eine lesbare Swagger-Webseite als Doku-Hilfsmittel bereitstehen (z. B. `/api/v1/swagger`).
- Swagger dient der besseren Lesbarkeit, ist aber nicht die Primärquelle; die führende Quelle bleibt die versionierte Doku im Git-Repository.

### 3. Web GUI
- Jede Applikation besitzt ein Web GUI.
- Das Web GUI dient mindestens für Statusanzeige, Konfiguration, Betriebsübersicht und gegebenenfalls Test-/Admin-Funktionen.
- Das Web GUI darf keine hardcodierten Betriebsdaten enthalten; Daten müssen über API bzw. Backend-Schnittstellen geladen werden.

### 4. Kubernetes Operator
- Jede Applikation besitzt einen Operator oder ein gleichwertiges Kubernetes-natives Steuerungskonzept.
- Der Operator verwaltet die Applikationskonfiguration über CRDs.
- Der Operator soll Status, Konfiguration, Automatisierungen und betrieblich relevante Aktionen steuern können.

### 5. Monitoring / OpenTelemetry
- Monitoring und Observability müssen mit OpenTelemetry umgesetzt werden.
- Metriken, Logs und, falls sinnvoll, Traces müssen exportierbar sein.
- Die Lösung darf nicht optional "irgendwie Monitoring" haben, sondern muss OpenTelemetry nativ einplanen.
- Betriebsrelevante Zustände müssen im Monitoring sichtbar sein.
- Es muessen zwei Betriebsvarianten unterstuetzt werden:
  - `local`: lokale, persistente Zwischenspeicherung ohne externen Zielspeicher
  - `clickhouse`: zentrale Speicherung und Auswertung ueber ClickHouse
- Logs, Metriken und Traces muessen in der Zielarchitektur an ClickHouse uebergeben werden.
- Grafana soll die Auswertung ueber ClickHouse als Datenquelle durchfuehren.
- Bei Ausfall oder Nichtverfuegbarkeit des Zielspeichers muessen Telemetriedaten lokal gepuffert und spaeter nachlieferbar gehalten werden.
- Das Umschalten zwischen `local` und `clickhouse` muss ueber versionierte Konfigurationen (z. B. Helm Values oder Config-Profile) nachvollziehbar gesteuert werden.
- Eine versionierte Grafana-Dashboard-Vorlage (JSON) muss im Repository bereitgestellt und pflegbar sein.

### 6. Security / Authentifizierung
- Security ist Pflichtbestandteil jeder App.
- Authentifizierung und Autorisierung müssen eingeplant werden.
- Secrets dürfen niemals im Git-Repository gespeichert werden.
- Sicherheitsrelevante Ereignisse müssen protokolliert werden.
- Die App muss so aufgebaut sein, dass Sicherheitsprüfungen sowohl im verbundenen Entwicklungsumfeld als auch für die Offline-Weitergabe nachvollziehbar sind.
- Fuer Zero Trust muessen Pod-zu-Pod-Kommunikationsregeln explizit definiert werden (Default-Deny, explizites Allowlisting), bevorzugt mit Cilium-Richtlinien.
- Pod-zu-Pod-Kommunikation muss TLS-verschluesselt sein (mTLS) und darf nur fuer freigegebene Kommunikationspfade erlaubt werden.
- Runtime-Sicherheitsereignisse muessen ueber Tetragon-Regeln erkannt und in die Audit-/Observability-Kette uebernommen werden.
- Sicherheits- und Compliance-Regeln muessen als Policy-as-Code ueber OPA (Open Policy Agent) durchsetzbar sein.
- Fuer Netzwerktransparenz und Fehleranalyse soll Cilium Hubble eingesetzt werden.
- Feature-Flags muessen ueber den OpenFeature-Standard integrierbar und dokumentiert sein.

### 7. Rollenmodell und Authentifizierung
- Jede App benötigt ein definiertes Rollen- und Rechtemodell.
- Das Rollenmodell beschreibt mindestens Benutzerrollen, Administrationsrollen und gegebenenfalls technische Service-/Operator-Rollen.
- Die Applikation muss so gebaut sein, dass eine Anbindung an Keycloak möglich ist.
- Authentifizierung und Autorisierung müssen sauber integrierbar sein.
- Single Sign-On ist möglich, aber nicht für jede Applikation zwingend erforderlich.
- Rechte und Sichtbarkeiten im Web GUI und in der API müssen rollenbasiert steuerbar sein.

### 8. Testing
- Für jede App muss ein vollständiges Testkonzept existieren.
- Automatisierte Tests müssen vorgesehen sein.
- Zusätzlich müssen manuelle Testfälle dokumentiert werden, falls erforderlich.
- Tests müssen Anforderungen und Akzeptanzkriterien nachvollziehbar abdecken.
- Der Teststatus muss fuer Nicht-Entwickler mindestens pro Feature/OBJ, pro Run und pro Release sichtbar sein.
- Ein Testergebnis muss reproduzierbar und dokumentierbar sein.
- Die Tests müssen mindestens Build-, Unit-, Integrations-, API-, UI- und Deployability-Aspekte berücksichtigen, soweit fachlich relevant.

### 9. CI/CD Pipeline
- Jede App benötigt eine Pipeline für Build, Test, Security-Prüfung, Paketierung und Deployment.
- Die Pipeline muss bei Änderungen automatisiert laufen.
- Artefakte müssen versioniert erzeugt und für Deployments bereitgestellt werden.
- Die Pipeline ist Bestandteil des Repositories und nicht nur extern konfiguriert.
- Die Pipeline muss den Übergang von Quellcode zu Release-Artefakten und Zarf-Paket nachvollziehbar abbilden.
- Container-Images muessen aus einem gehaerteten, minimalen Runtime-Image gebaut werden.
- Die Runtime-Stage darf nur die zur Ausfuehrung benoetigten Binaries, Libraries, Konfigurationen und Assets enthalten.
- Build-Tools, Package-Manager, Compiler und nicht benoetigte Shell-Tools duerfen im finalen Runtime-Image nicht enthalten sein, sofern keine dokumentierte Ausnahme vorliegt.
- Falls die Applikation funktional nur einen einzelnen Dienstprozess bereitstellt, ist ein dienstspezifisches Minimal-Image zu verwenden, das nur den benoetigten Prozess und die benoetigten Laufzeitbestandteile enthaelt.

### 10. Release Management
- Jede App benötigt ein geregeltes Release Management.
- Releases folgen einer Versionierungslogik, idealerweise SemVer.
- Ein CHANGELOG muss gepflegt werden.
- Release-Artefakte, Tags und Versionsstände müssen nachvollziehbar sein.
- Ein Release ist erst vollständig, wenn die zugehörigen Sicherheits- und Paketierungsartefakte mitgeführt werden.
- Publish- und Release-Konfigurationen sind als security-relevanter Bestandteil der Supply Chain zu behandeln.
- Update-Hinweise fuer Nutzer muessen pro Release geplant und versioniert bereitgestellt werden (z. B. als Release-Notiz-Quelle im Repository).

### 10a. Definition of Done für Build und Release
- Ein Build oder Release gilt nur dann als freigabefähig, wenn das tatsächlich erzeugte Veröffentlichungsartefakt geprüft wurde.
- Ignore-Files allein sind keine ausreichende Sicherheitsmassnahme; geprüft werden muss immer das reale Paket, Bundle oder Artefakt.
- Für publishbare Pakettypen ist eine Allowlist-Strategie zu bevorzugen, zum Beispiel über explizite Dateien- oder Pfadfreigaben.
- Eine reine Blocklist- oder Ignore-Strategie ist nicht ausreichend, wenn das Zielartefakt nicht zusätzlich inspiziert wird.
- Die Pipeline muss einen verbindlichen Gate-Schritt enthalten, der den Release- oder Publish-Inhalt gegen definierte Regeln prüft.
- Der Gate-Schritt muss den finalen Paketinhalt prüfen, nicht nur den Repository-Inhalt.
- Verbotene Dateien, interne Entwicklungsartefakte, Testdaten, Secrets, nicht freigegebene Konfigurationsdateien, unnötige Source-Artefakte und unerlaubte Sourcemaps dürfen nicht Bestandteil des Release-Artefakts sein.
- Sourcemaps sind standardmässig zu blockieren und dürfen nur per expliziter Ausnahme freigegeben werden.
- Die Pipeline muss Dateitypen, Pfade, Top-Level-Struktur, Dateianzahl und Artefaktgrösse gegen definierte Grenzwerte prüfen.
- Wird ein unerlaubter Inhalt erkannt, muss der Build oder Release fehlschlagen.
- Ein Release darf erst publiziert, exportiert oder weitergegeben werden, wenn die Paketprüfung erfolgreich abgeschlossen wurde.
- Die Ergebnisse der Paketprüfung müssen nachvollziehbar protokolliert und dem Build oder Release zuordenbar sein.

### 11. SBOM und Security-Scanning
- Für jede releasefähige Version muss eine **SBOM** erzeugt werden.
- Die SBOM muss dem Release eindeutig zugeordnet sein.
- Vor der Freigabe müssen Security-Scans auf Code-, Dependency-, Container- und Konfigurations-Ebene durchgeführt werden, soweit anwendbar.
- Security-Ergebnisse müssen dokumentiert, nachvollziehbar und versionsbezogen archiviert werden.
- Kritische Findings müssen vor der Freigabe bewertet und behandelt werden.
- Die SBOM und die Security-Ergebnisse müssen Bestandteil der Übergabe- und Freigabeunterlagen sein.

### 12. Artefakte / Registry / Harbor / Nexus
- Build-Artefakte und Container-Images müssen in den dafür vorgesehenen Systemen veröffentlicht werden.
- Standardmässig sind Harbor für Container-Images und Nexus und/oder Harbor für weitere Artefakte zu berücksichtigen.
- Das Template muss die Zuordnung von Artefakten, Versionen und Herkunft eindeutig machen.
- Für die Offline-Weitergabe muss definiert sein, welche Artefakte aus welcher Quelle in das Zarf-Paket übernommen werden.
- Fuer Container-Images muss die Basis-Image-Herkunft nachvollziehbar dokumentiert sein (Image-Name, Digest, Hardening-Stand).
- Es duerfen nur freigegebene gehaertete Basis-Images verwendet werden; generische Full-OS-Images ohne Hardening-Freigabe sind nicht zulaessig.

### 13. Zarf-Paket / Offline-Weitergabe
- Jede App muss als **Zarf-Paket** exportierbar sein.
- Das Zarf-Paket muss alle für die Zielinstallation notwendigen Bestandteile referenzieren oder enthalten.
- Dazu gehören je nach App insbesondere:
  - Container-Images
  - Helm Charts, Kustomize-Basen oder Kubernetes-Manifeste
  - Argo-CD-Applications und AppProject-Definitionen
  - Konfigurationsdateien
  - Migrations- oder Initialisierungslogik
  - Dokumentations- und Übergabeinformationen
- Das Zarf-Paket muss so strukturiert sein, dass es in einer getrennten Umgebung importiert werden kann.
- Der Export für die Offline-Weitergabe muss Bestandteil der standardisierten Release-Pipeline sein.

### 14. Zielumgebung / Import / Rehydrierung
- Das Template muss berücksichtigen, dass eine Zielumgebung eigenes Git, eigene Registry- und eigene Cluster-Zugänge haben kann.
- Beim Import in die Zielumgebung müssen die Inhalte des Zarf-Pakets an den richtigen Zielorten bereitgestellt werden.
- Dazu gehören insbesondere:
  - Bereitstellung der Container-Images in der Ziel-Registry, z. B. Harbor
  - Bereitstellung der Deployments, Charts oder Manifeste an der vorgesehenen Stelle
  - Bereitstellung der GitOps-Definitionen fuer Argo CD in einem lokalen Gitea-Release-Projekt
  - Bereitstellung bzw. Aktualisierung eines separaten Gitea-Konfigurationsprojekts fuer Parameter, Helm Values und Umgebungswerte
  - Nachvollziehbare Anpassung oder Parametrisierung von Ziel-URLs, Zugangsdaten und Umgebungswerten
- Die Zielinstallation darf nicht auf Artefakte aus der Ursprungsumgebung angewiesen sein.

### 15. GitOps-Installation / Argo CD / App of Apps
- Die Installation muss mit Argo CD kompatibel sein.
- Die Applikation muss im **App-of-Apps**-Modell installierbar sein.
- Es muss eine Root-Application oder ein gleichwertiger Einstiegspunkt vorhanden sein, über den alle untergeordneten Anwendungen kontrolliert ausgerollt werden können.
- Falls mehrere Teilkomponenten vorhanden sind, müssen diese als logisch getrennte Argo-CD-Applications strukturierbar sein.
- Die App-of-Apps-Struktur muss deklarativ im Repository beschrieben sein.
- Projekte, Ziel-Namespaces, Quellen und Synchronisationslogik müssen nachvollziehbar definiert sein.
- Das App-of-Apps-Modell muss mindestens zwei Git-Quellen unterstuetzen: Release-Projekt (Artefakte) und separates Konfigurationsprojekt (parameterisierte Zielkonfiguration).

### 16. Dokumentation
- Jede App benötigt vollständige Dokumentation im Repository.
- Die Dokumentation umfasst mindestens:
  - Quickstart / Inbetriebnahme
  - Betriebsdokumentation
  - Architekturübersicht
  - Blackbox-Sicht
  - Whitebox-Sicht
  - Konfigurationsbeschreibung
  - ADRs / Architekturentscheide
  - ADR-Uebersicht als eigenes Register `docs/adr/INDEX.md` (analog zu anderen INDEX-Dateien)
  - Release- und Übergabeprozess
  - versionierte Release-/Bugfix-/Change-Uebersicht je Version
  - Offline-Installationsanleitung
  - Zarf-Export- und Importbeschreibung
  - Argo-CD- / App-of-Apps-Installationsablauf
- Die Dokumentation muss in drei Darstellungsformen verfuegbar sein:
  - als Markdown-Quelle im Repository
  - als MkDocs-basierte Website
  - als E-Book (z. B. PDF) pro freigegebener Version
- Architektur- und Prozessdiagramme muessen mit `draw.io` erstellt werden.
- Diagramm-Dateien muessen in einer festen Struktur gepflegt werden:
  - Quellen: `docs/diagrams/source/*.drawio`
  - Exporte: `docs/diagrams/export/*.svg` und `docs/diagrams/export/*.png` (PNG als E-Book-/Fallback-Format)
- In Markdown und E-Book-Quellen sollen nur Exportdateien (`.svg`/`.png`) referenziert werden, nicht die `.drawio`-Quelldateien.
- Bei jeder Diagramm-Aenderung muessen Quelle und Export gemeinsam versioniert und committed werden.
- Die MkDocs-Website muss eine Versionsumschaltung pro Release (z. B. v1, v2) unterstuetzen.
- Website und E-Book muessen ein klar sichtbares Inhaltsverzeichnis enthalten.
- Ein Benutzerhandbuch muss vorhanden sein und drei getrennte Themenbereiche enthalten:
  - Management / Ueberblick
  - Betrieb / Operations
  - Umsetzung / Engineering
- Dokumentation muss mit der Implementierung mitwachsen.

### 17. Allgemeine Website
- Jede App besitzt eine allgemeine Website bzw. eine zentrale Informationsseite.
- Diese dient als Einstiegsseite für Produktbeschreibung, Dokumentation, Status, Releases und Links zu weiterführenden Artefakten.
- Der Reife-/Release-Status von Features muss fuer Nutzer klar sichtbar sein (mindestens Released/GA, Beta, Preview/Experimental).
- Beta- oder Preview-Funktionen muessen im GUI eindeutig gekennzeichnet und kurz erklaert sein.
- Die Statuswerte muessen im gesamten GUI einheitlich benannt werden und aus versionierten Repository-Metadaten stammen (Git als Primaerquelle).
- Das GUI muss Update-Hinweise anzeigen koennen (mindestens globaler Hinweis im Dashboard und optional modulbezogene Hinweise).
- Kritische Updates muessen als hervorgehobener Hinweis mit Handlungsoptionen darstellbar sein (z. B. jetzt ausfuehren oder spaeter planen).
- Die Quelle fuer Update-Hinweise muss versioniert im Repository gepflegt werden; lokale Quittierung/ausblenden je Nutzer ist zulaessig.

### 18. Maturitätsstatus
- Jede App muss einen Maturitätsstatus / Reifegrad ausweisen.
- Der Maturitätsstatus soll transparent zeigen:
  - aktueller Reifegrad
  - erfüllte Anforderungen
  - Teststatus
  - Security-Status
  - SBOM-Verfügbarkeit
  - Offline-/Zarf-Bereitschaft
  - Argo-CD-/App-of-Apps-Bereitschaft
  - offene Punkte
  - nächste Meilensteine
- Der Maturitätsstatus soll idealerweise automatisch aus Test-, Security- und Projektstatus ableitbar sein.

## Erwartete Spezifikationsstruktur pro Feature / Baustein

Jeder relevante Baustein oder jedes Feature wird als Markdown-Spezifikation beschrieben mit:
- Metadaten
- Beschreibung
- User Stories
- Akzeptanzkriterien
- Edge Cases
- Abhängigkeiten
- Definition of Done
- Tech Design
- QA Test Results
- Security Results
- Packaging / Zarf Notes
- Deployment Status

## Zusätzliche Mindestanforderungen für die Übergabe

Eine Applikation gilt nicht als vollständig übergabefähig, solange nicht alle folgenden Punkte erfüllt sind:

- [ ] Service ist eigenständig aus dem Repository heraus deploybar
- [ ] alle Kernfunktionen sind erfolgreich getestet
- [ ] Release-Version ist festgelegt und dokumentiert
- [ ] finales Release-Artefakt wurde tatsächlich erzeugt und geprüft
- [ ] Paket-/Publish-Audit des finalen Artefakts ist erfolgreich durchlaufen
- [ ] Allowlist- bzw. Inhaltsfreigabe für veröffentlichte Artefakte ist definiert
- [ ] verbotene Inhalte wie interne Source-Dateien, Testdaten, Secrets oder unerlaubte Sourcemaps sind ausgeschlossen
- [ ] Runtime-Container-Image basiert auf gehaertetem Minimal-Base-Image (inkl. dokumentiertem Digest)
- [ ] Runtime-Container enthaelt nur benoetigte Laufzeitkomponenten; keine Build-Toolchain im finalen Image
- [ ] Fuer Single-Service-Workloads ist ein dienstspezifisches Minimal-Image nachgewiesen
- [ ] SBOM ist erzeugt und dem Release zugeordnet
- [ ] Security-Scans sind durchgeführt und bewertet
- [ ] benötigte Images und Artefakte liegen nachvollziehbar in Harbor, Nexus oder den vorgesehenen Registries
- [ ] Zarf-Paket ist erzeugt
- [ ] Zarf-Paket ist in einer Zielumgebung testweise importierbar
- [ ] Release-Projekt ist in Gitea in der Zielumgebung importiert und versioniert
- [ ] Separates Konfigurationsprojekt ist in Gitea vorhanden und fuer die Zielumgebung gepflegt
- [ ] Installation in der Zielumgebung funktioniert ohne Zugriff auf die Ursprungsumgebung
- [ ] Argo-CD-Installation im App-of-Apps-Modell ist möglich
- [ ] Argo-CD Root-Application referenziert Release-Projekt und Konfigurationsprojekt
- [ ] Cilium-Richtlinien fuer Pod-zu-Pod-Verkehr sind aktiv (Default-Deny + explizite Freigaben)
- [ ] Pod-zu-Pod-Kommunikation ist TLS-verschluesselt (mTLS)
- [ ] OPA-Policies fuer Sicherheits- und Compliance-Regeln sind aktiv
- [ ] Tetragon-Regeln fuer Runtime-Erkennung sind aktiv und liefern Ereignisse
- [ ] Cilium-Hubble-Sicht auf Netzwerkfluesse ist verfuegbar
- [ ] OpenFeature-Integration fuer Feature-Flags ist dokumentiert und nutzbar
- [ ] OTel-Betriebsvarianten `local` und `clickhouse` sind dokumentiert und pruefbar
- [ ] Lokale Telemetrie-Pufferung bei nicht verfuegbarem Zielspeicher ist nachgewiesen
- [ ] Offline-Installationsdokumentation ist vollständig
- [ ] MkDocs-Dokumentationswebsite ist gebaut und fuer die aktuelle Release-Version vorhanden
- [ ] Versionsumschaltung fuer Doku-Releases ist gepflegt (mindestens aktuelle + vorherige Version)
- [ ] E-Book-Dokumentation fuer die Release-Version ist erzeugt und ablegbar
- [ ] Benutzerhandbuch mit drei Themenbereichen ist vollstaendig
- [ ] Diagramme sind mit `draw.io` gepflegt und als `SVG`/`PNG` exportiert
- [ ] Diagramm-Quellen und Diagramm-Exporte sind gemeinsam versioniert
- [ ] Update-Hinweise fuer die aktuelle Release-Version sind im GUI sichtbar und mit Release-Notizen verknuepft
- [ ] Grafana-Dashboard-Vorlage ist vorhanden und auf das ClickHouse-Datenmodell abgestimmt

## Mindest-Definition of Done für jede App

Eine App gilt erst dann als vollständig template-konform, wenn:

- [ ] Git-Repository vorhanden und strukturiert ist
- [ ] GitLab-Quellprojekt und Ziel-Gitea-Struktur festgelegt sind
- [ ] Release- und Konfigurationsprojekt als getrennte Git-Projekte modelliert sind
- [ ] Kubernetes-Deployment vorhanden ist
- [ ] API implementiert und dokumentiert ist
- [ ] Web GUI vorhanden ist
- [ ] Operator / CRD-Konzept vorhanden ist
- [ ] OpenTelemetry-Monitoring integriert ist
- [ ] Security-Konzept umgesetzt ist
- [ ] Rollen- und Rechtemodell umgesetzt ist
- [ ] Keycloak-Anbindbarkeit vorgesehen ist
- [ ] automatisierte Tests vorhanden sind
- [ ] manuelle Testfälle dokumentiert sind, sofern nötig
- [ ] CI/CD Pipeline produktiv nutzbar ist
- [ ] Release Management eingerichtet ist
- [ ] Definition of Done für Build-/Release-Artefakte umgesetzt ist
- [ ] finales Release-Artefakt wird in der Pipeline geprüft
- [ ] gehaertetes Minimal-Container-Image ist als Runtime-Standard umgesetzt
- [ ] bei Single-Service-Umfang ist ein dienstspezifisches Minimal-Image umgesetzt
- [ ] SBOM und Security-Scanning eingebunden sind
- [ ] Harbor-/Nexus-/Artifact-Ablage definiert ist
- [ ] Zarf-Paket erzeugbar ist
- [ ] Zielumgebungs-Import beschrieben ist
- [ ] Argo-CD-App-of-Apps-Installation unterstützt wird
- [ ] Cilium-basierte Zero-Trust-Richtlinien fuer Pod-zu-Pod-Traffic umgesetzt sind
- [ ] Pod-zu-Pod-mTLS im Cluster durchgaengig umgesetzt ist
- [ ] OPA-basierte Policy-Durchsetzung umgesetzt ist
- [ ] Tetragon-basierte Runtime-Detektion mit Audit-Anbindung umgesetzt ist
- [ ] Cilium-Hubble fuer Netzwerkbeobachtbarkeit eingebunden ist
- [ ] OpenFeature-basierte Feature-Flag-Anbindung vorgesehen oder umgesetzt ist
- [ ] OTel-Modusumschaltung (`local`/`clickhouse`) ueber versionierte Konfiguration vorhanden ist
- [ ] lokale Telemetrie-Zwischenspeicherung mit spaeterer Nachlieferung vorgesehen oder umgesetzt ist
- [ ] Dokumentation vollständig ist
- [ ] Dokumentation als MkDocs-Website und E-Book releasefaehig bereitgestellt ist
- [ ] Doku-Versionsumschaltung pro Release gepflegt ist
- [ ] Benutzerhandbuch mit drei Themenbereichen vorhanden ist
- [ ] Diagramm-Standard mit `draw.io` sowie `source`/`export`-Ablage umgesetzt ist
- [ ] Markdown-/E-Book-Referenzen auf Diagramm-Exportdateien (`SVG`/`PNG`) zeigen
- [ ] allgemeine Website vorhanden ist
- [ ] GUI-Mechanismus fuer globale und modulbezogene Update-Hinweise vorhanden ist
- [ ] Update-Hinweis-Quelle versioniert im Repository gepflegt wird
- [ ] Grafana-Dashboard-Vorlage im Repository vorhanden ist
- [ ] Maturitätsstatus sichtbar ist

## Qualitätsanspruch

Alle Anforderungen müssen so beschrieben werden, dass sie:
- konkret
- testbar
- versionierbar
- dokumentierbar
- betreibbar
- paketierbar
- transportierbar
- reproduzierbar installierbar
- auditierbar
sind.

Ziel ist nicht nur ein lauffähiger Prototyp, sondern eine standardisierte, nachvollziehbare, sicher bewertete,
offline übergabefähige und betreibbare Applikation.
