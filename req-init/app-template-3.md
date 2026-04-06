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
   - In der Entwicklungsumgebung wird dafür standardmässig GitLab verwendet.
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

4. **Offline- und Transferfähigkeit**
   - Jede Applikation muss nach dem Build und der Freigabe offline weitergegeben werden können.
   - Die Weitergabe erfolgt über ein **Zarf-Paket / Zarf-File**.
   - Das Paket muss so aufgebaut sein, dass es in einer getrennten Zielumgebung reproduzierbar importiert und installiert werden kann.

5. **Pflicht-Bausteine jeder Applikation**
   Jede Applikation muss mindestens folgende Bestandteile enthalten:
   - Git Repository / GitLab Projekt
   - Kubernetes Deployment
   - Web GUI
   - API
   - Kubernetes Operator
   - Monitoring und Observability mit OpenTelemetry
   - Security und Authentifizierung
   - Rollen- und Rechtemodell
   - Keycloak-Anbindbarkeit
   - Testing-Konzept
   - CI/CD Pipeline
   - Release Management
   - SBOM und Security-Scanning
   - Zarf-Paket für Offline-Weitergabe
   - App-of-Apps-fähige Installation mit Argo CD
   - Dokumentation
   - allgemeine Produkt-/Projekt-Website
   - Maturitätsstatus / Reifegradübersicht

## Zielbild der Delivery-Kette

Die Standard-Delivery-Kette einer App ist wie folgt:

1. Entwicklung und Versionierung im GitLab-Repository
2. Automatischer Build, Test und Qualitätssicherung in der CI/CD-Pipeline
3. Erzeugung und Veröffentlichung der Build-Artefakte
4. Ablage von Container-Images und weiteren Artefakten in Registry-/Artifact-Systemen wie Harbor und/oder Nexus
5. Erzeugung von SBOM und Durchführung von Security-Scans
6. Versionierte Freigabe eines Releases
7. Erzeugung eines Zarf-Pakets für die Offline-Weitergabe
8. Transfer des Zarf-Pakets in eine Zielumgebung, z. B. via Datenträger oder kontrollierte Übergabe
9. Import der benötigten Artefakte in die Zielumgebung
10. Installation der Applikation in Kubernetes, bevorzugt über Argo CD im App-of-Apps-Modell

## Verbindliche Anforderungen je Baustein

### 1. Repository / Git / GitLab
- Das Repository enthält Quellcode, Deployments, Dokumentation, Tests, Release-Informationen und Paketdefinitionen.
- Feature-Spezifikationen werden in Markdown gepflegt.
- Änderungen müssen über nachvollziehbare Commits, Merge Requests und Releases dokumentiert sein.
- Die Repository-Struktur muss klar zwischen Source Code, Deployments, Docs, Tests, CI/CD und Packaging unterscheiden.

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

### 6. Security / Authentifizierung
- Security ist Pflichtbestandteil jeder App.
- Authentifizierung und Autorisierung müssen eingeplant werden.
- Secrets dürfen niemals im Git-Repository gespeichert werden.
- Sicherheitsrelevante Ereignisse müssen protokolliert werden.
- Die App muss so aufgebaut sein, dass Sicherheitsprüfungen sowohl im verbundenen Entwicklungsumfeld als auch für die Offline-Weitergabe nachvollziehbar sind.

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

### 10. Release Management
- Jede App benötigt ein geregeltes Release Management.
- Releases folgen einer Versionierungslogik, idealerweise SemVer.
- Ein CHANGELOG muss gepflegt werden.
- Release-Artefakte, Tags und Versionsstände müssen nachvollziehbar sein.
- Ein Release ist erst vollständig, wenn die zugehörigen Sicherheits- und Paketierungsartefakte mitgeführt werden.
- Publish- und Release-Konfigurationen sind als security-relevanter Bestandteil der Supply Chain zu behandeln.

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
  - Bereitstellung der GitOps-Definitionen für Argo CD
  - Nachvollziehbare Anpassung oder Parametrisierung von Ziel-URLs, Zugangsdaten und Umgebungswerten
- Die Zielinstallation darf nicht auf Artefakte aus der Ursprungsumgebung angewiesen sein.

### 15. GitOps-Installation / Argo CD / App of Apps
- Die Installation muss mit Argo CD kompatibel sein.
- Die Applikation muss im **App-of-Apps**-Modell installierbar sein.
- Es muss eine Root-Application oder ein gleichwertiger Einstiegspunkt vorhanden sein, über den alle untergeordneten Anwendungen kontrolliert ausgerollt werden können.
- Falls mehrere Teilkomponenten vorhanden sind, müssen diese als logisch getrennte Argo-CD-Applications strukturierbar sein.
- Die App-of-Apps-Struktur muss deklarativ im Repository beschrieben sein.
- Projekte, Ziel-Namespaces, Quellen und Synchronisationslogik müssen nachvollziehbar definiert sein.

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
  - Offline-Installationsanleitung
  - Zarf-Export- und Importbeschreibung
  - Argo-CD- / App-of-Apps-Installationsablauf
- Dokumentation muss mit der Implementierung mitwachsen.

### 17. Allgemeine Website
- Jede App besitzt eine allgemeine Website bzw. eine zentrale Informationsseite.
- Diese dient als Einstiegsseite für Produktbeschreibung, Dokumentation, Status, Releases und Links zu weiterführenden Artefakten.

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
- [ ] SBOM ist erzeugt und dem Release zugeordnet
- [ ] Security-Scans sind durchgeführt und bewertet
- [ ] benötigte Images und Artefakte liegen nachvollziehbar in Harbor, Nexus oder den vorgesehenen Registries
- [ ] Zarf-Paket ist erzeugt
- [ ] Zarf-Paket ist in einer Zielumgebung testweise importierbar
- [ ] Installation in der Zielumgebung funktioniert ohne Zugriff auf die Ursprungsumgebung
- [ ] Argo-CD-Installation im App-of-Apps-Modell ist möglich
- [ ] Offline-Installationsdokumentation ist vollständig

## Mindest-Definition of Done für jede App

Eine App gilt erst dann als vollständig template-konform, wenn:

- [ ] Git-Repository vorhanden und strukturiert ist
- [ ] GitLab-Projekt bzw. Ziel-Git-Struktur festgelegt ist
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
- [ ] SBOM und Security-Scanning eingebunden sind
- [ ] Harbor-/Nexus-/Artifact-Ablage definiert ist
- [ ] Zarf-Paket erzeugbar ist
- [ ] Zielumgebungs-Import beschrieben ist
- [ ] Argo-CD-App-of-Apps-Installation unterstützt wird
- [ ] Dokumentation vollständig ist
- [ ] allgemeine Website vorhanden ist
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
