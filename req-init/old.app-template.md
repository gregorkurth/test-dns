# App-Template-Anweisung

## Ziel

Jede Applikation wird nach einem einheitlichen Standard geplant, umgesetzt, getestet, dokumentiert und betrieben.
Die App muss so aufgebaut sein, dass sie als vollständiges, betreibbares Produkt in Kubernetes lauffähig ist und
alle wesentlichen Plattform-, Sicherheits-, Qualitäts- und Betriebsanforderungen erfüllt.

## Verbindliche Grundsätze

1. **GitHub als Single Source of Truth**
   - Jede Applikation besitzt ein eigenes GitHub-Repository.
   - Alle Spezifikationen, Architekturdokumente, Deployments, Pipelines, Tests und Releases werden versioniert im Repository verwaltet.
   - Git ist die führende Quelle für Anforderungen, Implementierungsstand und Änderungsverlauf.

2. **Kubernetes als Zielplattform**
   - Die Applikation muss für den Betrieb auf Kubernetes vorgesehen sein.
   - Deployment-Artefakte müssen deklarativ und versioniert vorliegen.
   - Die App muss in eine standardisierte Plattform-/Namespace-Struktur integrierbar sein.

3. **Pflicht-Bausteine jeder Applikation**
   Jede Applikation muss mindestens folgende Bestandteile enthalten:
   - GitHub Repository
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
   - Dokumentation
   - allgemeine Produkt-/Projekt-Website
   - Maturitätsstatus / Reifegradübersicht

## Verbindliche Anforderungen je Baustein

### 1. Repository / GitHub
- Das Repository enthält Quellcode, Deployments, Dokumentation, Tests und Release-Informationen.
- Feature-Spezifikationen werden in Markdown gepflegt.
- Änderungen müssen über nachvollziehbare Commits, Pull Requests und Releases dokumentiert sein.

### 2. API
- Jede Applikation stellt eine klar definierte API bereit.
- Die API dient als stabile Schnittstelle für Web GUI, Operator und externe Systeme.
- Schnittstellen müssen dokumentiert, versionierbar und testbar sein.

### 3. Web GUI
- Jede Applikation besitzt ein Web GUI.
- Das Web GUI dient mindestens für Statusanzeige, Konfiguration, Betriebsübersicht und ggf. Test-/Admin-Funktionen.
- Das Web GUI darf keine hardcodierten Betriebsdaten enthalten; Daten müssen über API bzw. Backend-Schnittstellen geladen werden.

### 4. Kubernetes Operator
- Jede Applikation besitzt einen Operator oder ein gleichwertiges Kubernetes-natives Steuerungskonzept.
- Der Operator verwaltet die Applikationskonfiguration über CRDs.
- Der Operator soll Status, Konfiguration, Automatisierungen und betrieblich relevante Aktionen steuern können.

### 5. Monitoring / OpenTelemetry
- Monitoring und Observability müssen mit OpenTelemetry umgesetzt werden.
- Metriken, Logs und – falls sinnvoll – Traces müssen exportierbar sein.
- Die Lösung darf nicht optional „irgendwie Monitoring“ haben, sondern muss OTel nativ einplanen.
- Betriebsrelevante Zustände müssen im Monitoring sichtbar sein.

### 6. Security / Authentifizierung
- Security ist Pflichtbestandteil jeder App.
- Authentifizierung und Autorisierung müssen eingeplant werden.
- Secrets dürfen niemals im Git-Repository gespeichert werden.
- Sicherheitsrelevante Ereignisse müssen protokolliert werden.

### 7. Rollenmodell und Authentifizierung
- Jede App benötigt ein definiertes Rollen- und Rechtemodell.
- Das Rollenmodell beschreibt mindestens Benutzerrollen, Administrationsrollen und ggf. technische Service-/Operator-Rollen.
- Die Applikation muss so gebaut sein, dass eine Anbindung an Keycloak möglich ist.
- Authentifizierung und Autorisierung müssen sauber integrierbar sein.
- Single Sign-On ist möglich, aber nicht für jede Applikation zwingend erforderlich.
- Rechte und Sichtbarkeiten im Web GUI und in der API müssen rollenbasiert steuerbar sein.

### 8. Testing
- Für jede App muss ein vollständiges Testkonzept existieren.
- Automatisierte Tests müssen vorgesehen sein.
- Zusätzlich müssen manuelle Testfälle dokumentiert werden, falls erforderlich.
- Tests müssen Anforderungen und Akzeptanzkriterien nachvollziehbar abdecken.
- Ein Testergebnis muss reproduzierbar und dokumentierbar sein.

### 9. CI/CD Pipeline
- Jede App benötigt eine Pipeline für Build, Test und Deployment.
- Die Pipeline muss bei Änderungen automatisiert laufen.
- Artefakte müssen versioniert erzeugt und für Deployments bereitgestellt werden.
- Die Pipeline ist Bestandteil des Repositories und nicht nur extern konfiguriert.

### 10. Release Management
- Jede App benötigt ein geregeltes Release Management.
- Releases folgen einer Versionierungslogik, idealerweise SemVer.
- Ein CHANGELOG muss gepflegt werden.
- Release-Artefakte, Tags und Versionsstände müssen nachvollziehbar sein.

### 11. Dokumentation
- Jede App benötigt vollständige Dokumentation im Repository.
- Die Dokumentation umfasst mindestens:
  - Quickstart / Inbetriebnahme
  - Betriebsdokumentation
  - Architekturübersicht
  - Blackbox-Sicht
  - Whitebox-Sicht
  - Konfigurationsbeschreibung
  - ADRs / Architekturentscheide
- Dokumentation muss mit der Implementierung mitwachsen.

### 12. Allgemeine Website
- Jede App besitzt eine allgemeine Website bzw. eine zentrale Informationsseite.
- Diese dient als Einstiegsseite für Produktbeschreibung, Dokumentation, Status, Releases und Links zu weiterführenden Artefakten.

### 13. Maturitätsstatus
- Jede App muss einen Maturitätsstatus / Reifegrad ausweisen.
- Der Maturitätsstatus soll transparent zeigen:
  - aktueller Reifegrad
  - erfüllte Anforderungen
  - Teststatus
  - offene Punkte
  - nächste Meilensteine
- Der Maturitätsstatus soll idealerweise automatisch aus Test- und Projektstatus ableitbar sein.

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
- Deployment Status

## Mindest-Definition of Done für jede App

Eine App gilt erst dann als vollständig template-konform, wenn:

- [ ] GitHub-Repository vorhanden und strukturiert ist
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
- auditierbar
sind.

Ziel ist nicht nur ein lauffähiger Prototyp, sondern eine standardisierte, nachvollziehbare und betreibbare Applikation.
