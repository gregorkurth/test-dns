# OBJ-12: Security & Authentifizierung

## Status: In Review
**Created:** 2026-04-03
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-10: Kubernetes Deployment (Secrets-Management via K8s Secrets)
- OBJ-3: REST API (API-Endpunkte müssen geschützt werden)
- OBJ-17: SBOM & Security-Scanning (Security-Scans sind Teil der Security-Strategie)
- OBJ-1: CI/CD Pipeline (Security-Scans laufen in der Pipeline)
- OBJ-11: Monitoring & Observability (OpenTelemetry) (Security-Events und Audit-Logs werden ueber OTel weitergegeben)

## User Stories
- Als Mission Network Operator möchte ich mich mit meinen bestehenden Unternehmens-Credentials (Keycloak/OIDC) anmelden, damit ich kein separates Passwort verwalten muss.
- Als Administrator möchte ich Benutzern Rollen zuweisen (Viewer / Operator / Admin), damit ich den Zugriff auf sensible Funktionen steuern kann.
- Als Viewer möchte ich Capabilities und Zone-Konfigurationen lesen können, ohne schreibende Aktionen ausführen zu dürfen.
- Als Operator möchte ich Participant-Konfigurationen erfassen und Zone-Files generieren können.
- Als Administrator möchte ich alle Funktionen inkl. Benutzerverwaltung und Konfigurationsexport nutzen können.
- Als Platform Engineer möchte ich sicherstellen, dass Secrets (TSIG-Keys, API-Credentials) niemals im Git-Repository landen.
- Als Security-Verantwortlicher möchte ich eine SBOM für jede releasefähige Version vorliegen haben, damit ich die Abhängigkeiten des Systems vollständig kenne.
- Als Security-Verantwortlicher möchte ich, dass automatisch Security-Scans auf Code-, Dependency-, Container- und Konfigurations-Ebene durchgeführt werden, damit Schwachstellen frühzeitig erkannt werden.
- Als Security-Verantwortlicher möchte ich, dass kritische Security-Findings vor einer Freigabe bewertet und dokumentiert werden, damit keine ungeklärten Risiken in Produktion gelangen.
- Als Auditor möchte ich Security-Ergebnisse versionsbezogen archiviert finden, damit ich für jedes Release nachvollziehen kann, welche Scans durchgeführt wurden und was ihre Ergebnisse waren.
- Als Security-Verantwortlicher moechte ich Zero-Trust-Netzwerkregeln auf Pod-Ebene erzwingen, damit seitliche Bewegungen zwischen Pods verhindert werden.
- Als Security-Verantwortlicher moechte ich Runtime-Anomalien mit Tetragon erkennen, damit sicherheitskritische Ereignisse in Echtzeit sichtbar sind.
- Als Security-Verantwortlicher moechte ich Policy-as-Code mit OPA erzwingen, damit Sicherheits- und Compliance-Regeln zentral durchgesetzt werden.
- Als Platform Engineer moechte ich Pod-zu-Pod-Kommunikation TLS-verschluesselt (mTLS) betreiben, damit seitliche Angriffe erschwert werden.
- Als Platform Engineer moechte ich Netzwerkfluesse mit Hubble einsehen koennen, damit ich Regeln und Verkehrswege nachvollziehen kann.
- Als Produktverantwortlicher moechte ich Feature-Flags standardisiert ueber OpenFeature integrieren, damit Releases sicher gesteuert werden koennen.
- Als Security-Verantwortlicher moechte ich Secrets bevorzugt ueber OpenBao verwalten, damit Zugangsdaten zentral, verschluesselt und nachvollziehbar bleiben.
- Als Plattform-Verantwortlicher moechte ich fuer Umgebungen ohne OpenBao eine lokale Fallback-Variante mit klarer Risiko-Markierung haben, damit der Betrieb auch ohne Secret-Service moeglich bleibt.
- Als Security-Verantwortlicher moechte ich Agenten- und Service-Credentials streng rotieren, damit kompromittierte Zugangsdaten nur kurz nutzbar sind.

## Acceptance Criteria
- [ ] Authentifizierung via OIDC/OAuth2 (Keycloak-kompatibel) ist implementiert
- [ ] Fallback: Lokale Benutzerverwaltung (Username/Passwort) für Umgebungen ohne Keycloak
- [ ] RBAC-Rollen definiert: `viewer` (lesend), `operator` (lesen + schreiben), `admin` (voll)
- [ ] API-Endpunkte (OBJ-3) sind durch Authentifizierungs-Middleware geschützt
- [ ] Nicht authentifizierte Anfragen an geschützte Endpunkte erhalten HTTP 401
- [ ] Unberechtigte Aktionen (falsche Rolle) erhalten HTTP 403
- [ ] Secrets (TSIG-Keys, OIDC-Client-Secret) werden als K8s Secrets verwaltet, nie als ConfigMap oder in Code
- [ ] Sicherheitsrelevante Ereignisse (Login, Logout, Fehlanmeldung, Rollenänderung) werden im Audit-Log protokolliert
- [ ] Pod-zu-Pod-Kommunikation ist durch Cilium-Richtlinien als Default-Deny mit explizitem Allowlisting umgesetzt
- [ ] Pod-zu-Pod-Kommunikation ist TLS-verschluesselt (mTLS), inkl. Nachweis der Zertifikats-/Trust-Strategie
- [ ] OPA ist mit verbindlichen Security-/Compliance-Policies aktiv (z. B. deny-by-default fuer unerlaubte Workload- und Netzwerkmuster)
- [ ] Tetragon ist mit verbindlichen Runtime-Regeln aktiv (mindestens Privilege-Escalation, unautorisierte Shell-Execs, verdaechtige Namespace-/Network-Aktivitaet)
- [ ] Tetragon-Events werden in die Audit-/Observability-Kette integriert
- [ ] Hubble ist aktiviert und stellt nachvollziehbare Pod-Kommunikationsfluesse bereit
- [ ] OpenFeature ist als Feature-Flag-Standard integriert oder als verbindliche Integrationsschnittstelle vorbereitet
- [ ] Secrets werden bevorzugt ueber OpenBao bereitgestellt; Zugriff ist rollenbasiert und revisionssicher dokumentiert
- [ ] Fallback ohne OpenBao ist dokumentiert und als reduzierter Sicherheitsmodus klar markiert (inkl. Management-Hinweis)
- [ ] Credential Rotation ist fuer Agenten- und Service-Identitaeten verbindlich (Zyklus 30 bis 90 Tage)
- [ ] SIEM-Weitergabe von Security-Ereignissen ist ueber OTel in den Zielpfad (ClickHouse oder lokaler Modus) dokumentiert und pruefbar
- [ ] Session-Tokens haben eine konfigurierbare Gültigkeitsdauer (default: 8h)
- [ ] HTTPS ist im K8s-Ingress erzwungen (HTTP → HTTPS-Redirect)
- [ ] SBOM wird für jede releasefähige Version erzeugt (via `syft`) und dem Release zugeordnet (OBJ-17)
- [ ] Security-Scan auf Code-Ebene (SAST via `semgrep`) läuft bei jedem Build
- [ ] Security-Scan auf Dependency-Ebene (SCA) läuft bei jedem Build
- [ ] Security-Scan auf Container-Image-Ebene (CVE via `trivy`) läuft bei Release-Builds
- [ ] Security-Scan auf Konfigurations-Ebene (Misconfiguration via `trivy config`) läuft bei Release-Builds
- [ ] Security-Ergebnisse werden versionsbezogen archiviert (als Release-Anhang oder im Artefakt-Repository OBJ-18)
- [ ] Kritische Findings (CVSS ≥ 9.0) blockieren das Release bis zur dokumentierten Bewertung
- [ ] SBOM und Security-Ergebnisse sind Bestandteil der Übergabe- und Freigabeunterlagen

## Edge Cases
- Was passiert wenn der Keycloak-Server nicht erreichbar ist? → Fallback auf lokale Auth; Keycloak-Fehler im Log
- Was wenn ein Benutzer seine Session nicht beendet? → Token läuft nach konfigurierbarer Zeit ab; automatischer Logout
- Was wenn ein ungültiges Token übergeben wird? → HTTP 401; Token wird nicht gecacht
- Was wenn jemand versucht, eine niedrigere Rolle zu einer höheren Rolle zu eskalieren? → Server-seitige Rollenvalidierung
- Was wenn ein Security-Scan ein kritisches Finding meldet? → Release wird geblockt; Finding muss mit Risikoakzeptanz oder Fix dokumentiert werden
- Was wenn die SBOM unvollständig ist (z.B. Transitiv-Abhängigkeiten fehlen)? → syft-Konfiguration prüfen; SBOM-Vollständigkeit ist Teil des Review-Kriteriums
- Was wenn trivy-Datenbanken in einer airgapped Umgebung nicht aktualisierbar sind? → Offline-Datenbankupdate via Zarf-Paket dokumentieren
- Was wenn Cilium-Policies legitimen Traffic blockieren? → Policy-Troubleshooting mit dokumentierter Kommunikationsmatrix und abgestuften Freigaben
- Was wenn mTLS-Handshakes zwischen Pods fehlschlagen? → Zertifikatskette/Trust-Domain pruefen; Fallback-Runbook fuer kontrollierte Wiederherstellung
- Was wenn OPA legitime Deployments blockiert? → Policy-Ausnahmeprozess mit Review und versionierter Begruendung
- Was wenn Tetragon zu viele False Positives meldet? → Regel-Tuning versioniert dokumentieren; kritische Kernregeln bleiben verpflichtend aktiv
- Was wenn OpenFeature-Provider in der Zielumgebung nicht erreichbar ist? → deterministische Default-Flag-Werte und dokumentierter Degradationsmodus
- Was wenn OpenBao nicht erreichbar ist? → definierter Fallback-Modus mit begrenzter Laufzeit und Pflicht-Hinweis im Betriebshandbuch
- Was wenn Credential-Rotation ueberfaellig ist? → automatischer Compliance-Alarm und Blockierung neuer privilegierter Tokens
- Was wenn der SIEM-Zielpfad stoert? → OTel-Pufferung aktivieren und Nachlieferung dokumentiert pruefen

## Technical Requirements
- OIDC-Library: `next-auth` (NextAuth.js) mit Keycloak-Provider
- Lokale Auth: bcrypt-gehashte Passwörter in K8s Secret
- Middleware: Next.js Middleware für API-Route-Schutz
- Audit-Log: strukturierte JSON-Logs, ins OTel-Logging-System integriert (OBJ-11)
- Keine Passwörter oder Secrets in Environment-Variablen-Dateien (`.env`) im Repository
- SBOM-Format: CycloneDX oder SPDX (via `syft`)
- Security-Scanning-Tools: `trivy` (Container, Filesystem, Konfiguration), `semgrep` (SAST), `npm audit` / `pip audit` (SCA)
- Security-Ergebnisse: Archivierung als Release-Anhang im SARIF- oder JSON-Format
- Kritische Findings-Bewertung: Dokumentierter Review-Prozess mit Accept/Fix-Entscheid
- Zero Trust Networking: Cilium (CiliumNetworkPolicy / CiliumClusterwideNetworkPolicy) inkl. mTLS fuer Pod-zu-Pod-Traffic
- Network Visibility: Cilium Hubble fuer Flow-Analyse und Policy-Diagnose
- Policy as Code: Open Policy Agent (OPA) mit versionierten Rego-Regeln
- Runtime Detection: Tetragon mit regelbasierter Event-Erkennung und Weiterleitung in zentrales Logging
- Feature Flags: OpenFeature API als standardisierte Integrationsschicht
- Secret Store: OpenBao als Zielstandard; dokumentierter lokaler Fallback nur fuer eingeschraenkte Umgebungen
- Credential Lifecycle: verbindliche Rotation fuer technische Identitaeten (30 bis 90 Tage), inkl. Nachweis
- Security Telemetry: OTel-basierte Weitergabe von Security-Events in ClickHouse oder lokalen Betriebsmodus

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
### Scope
OBJ-12 etabliert die Sicherheits- und Identitaetsbasis fuer den Servicebetrieb. Abgedeckt werden Anmeldung, Rollenmodell, Secret-Management, Zero-Trust-Durchsetzung und der Nachweis sicherheitsrelevanter Ereignisse.

Der Entwurf ist bewusst zweistufig: Zielbetrieb mit OIDC und OpenBao sowie ein klar begrenzter Offline-Fallback fuer Umgebungen ohne zentralen Secret-Service.

### Visual Tree
```text
Security Control Plane
+-- Identity Layer
|   +-- OIDC / Keycloak Login
|   +-- Optional Local Auth Fallback
|   +-- Session / Token Rules
+-- Authorization Layer
|   +-- RBAC Roles (viewer, operator, admin)
|   +-- API Access Policies
+-- Secrets Layer
|   +-- OpenBao (preferred)
|   +-- Local fallback mode (reduced security)
|   +-- Rotation / Expiry Rules
+-- Workload Security Layer
|   +-- Cilium default-deny + allowlist
|   +-- Pod-to-Pod mTLS
|   +-- OPA policy checks
|   +-- Tetragon runtime detection
|   +-- Hubble flow visibility
+-- Audit & Evidence Layer
    +-- Security event log stream
    +-- OTel forwarding (SIEM path)
    +-- Release evidence bundle (SBOM + scans + findings review)
```

### Data / Policy Model
Die Sicherheitssteuerung basiert auf vier Kernobjekten:
- Identitaet: Benutzer oder technischer Service mit Rolle und Gueltigkeit.
- Zugriff: role-to-action Zuordnung fuer API- und Betriebsfunktionen.
- Secret-Referenz: Verweis auf Secret-Quelle (OpenBao oder lokaler Fallback), nie Klartext im Repository.
- Security-Ereignis: Login, Fehlversuch, Rollenwechsel, Policy-Verstoss oder Runtime-Anomalie mit Zeit und Schweregrad.

### Technical Decisions
- OIDC als Primarweg, weil bestehende Identitaetsinfrastruktur genutzt werden soll.
- Drei RBAC-Rollen, weil die Trennung zwischen Lesen, Betrieb und Administration nachvollziehbar auditierbar bleibt.
- OpenBao als bevorzugte Secret-Quelle, weil Rotation, Zugriff und Historie zentral steuerbar sind.
- Lokaler Fallback bleibt erlaubt, aber nur mit klarer Risiko-Kennzeichnung und begrenzter Betriebsdauer.
- Zero-Trust ueber Cilium/mTLS/OPA/Tetragon/Hubble, weil Netzwerk-, Policy- und Runtime-Schutz zusammenwirken muessen.
- OTel-basierte Security-Telemetrie, weil Betrieb und Security denselben Ereignispfad fuer Nachweis und Korrelation nutzen.

### Dependencies
- OBJ-3 fuer geschuetzte API-Endpunkte
- OBJ-10 fuer Kubernetes-Laufzeit und Policy-Durchsetzung
- OBJ-11 fuer OTel-Transport und Ereigniskorrelation
- OBJ-17 fuer SBOM- und Scan-Nachweise pro Release
- OBJ-1 fuer automatisierte Security-Gates in der Pipeline

### QA Readiness
Vor Implementierungsabnahme sollte pruefbar sein:
- Rollenmodell greift konsistent (401/403-Verhalten eindeutig).
- Secret-Fluss ist nachvollziehbar (OpenBao aktiv oder Fallback klar markiert).
- Credential-Rotation ist dokumentiert und terminiert.
- Security-Events laufen in den definierten OTel-/SIEM-Pfad.
- Zero-Trust-Regeln verhindern unerlaubten Ost-West-Traffic.

## QA Test Results
**Tested:** 2026-04-09
**App URL:** http://localhost:3000 + automatisierte Route-Tests
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status
- [x] Authentifizierung via OIDC/OAuth2 ist als API-Flow umgesetzt (`local` / `oidc` / `hybrid`).
- [x] Fallback lokale Benutzerverwaltung ist verfuegbar.
- [x] RBAC `viewer` / `operator` / `admin` wird serverseitig erzwungen.
- [x] Geschuetzte OBJ-3-Endpunkte liefern korrekt `401` (ohne Token) und `403` (falsche Rolle).
- [x] Session-TTL ist konfigurierbar (Default 8h).
- [x] Logout invalidiert Session-Tokens (Revocation-Pruefung aktiv).
- [x] Security-/Audit-Events fuer Login/Logout/Token/Rollenverletzung werden emittiert.
- [x] Produktions-Fail-Closed bei fehlendem Session-Secret (`503` statt stiller Unsicherheit).
- [x] OIDC-Signaturpruefpfad ueber JWKS (`RS256`) ist vorhanden; unsignierter Modus nur per expliziter Konfiguration.
- [ ] Plattform-Security-Nachweise (OpenBao, OPA, Tetragon, Hubble, mTLS, Ingress-HTTPS, Rotation) sind in diesem lokalen QA-Lauf nicht end-to-end validiert.
- [ ] SBOM-/Scan-/Release-Gates sind in diesem Lauf nicht end-to-end nachgewiesen.

### Edge Cases Status
- [x] Ungueltiges JSON bei Login oder API-Calls wird sauber abgefangen.
- [x] Fehlendes/ungueltiges/revoked Bearer-Token wird sauber geblockt.
- [x] Viewer kann keine schreibenden Operator-Aktionen ausfuehren.
- [x] Fehlende Produktionskonfiguration blockiert Auth-Funktionen fail-closed.
- [ ] Live-IdP/JWKS-Ausfall wurde nicht gegen reale Keycloak-Instanz verifiziert.

### Security Audit Results
- [x] Authentication: geschuetzte Endpunkte ohne Token nicht nutzbar.
- [x] Authorization: Rollenmodell wird serverseitig erzwungen.
- [x] Input validation: bestehende XSS-/Validierungschecks bleiben gruen.
- [x] Rate limiting: Login besitzt eigenen Rate-Limit-Namespace.
- [ ] Vollstaendige OIDC-Produktionsintegration (realer IdP + Zertifikats-/Trust-Nachweise) bleibt als Betriebsaufgabe.

### Bugs Found
#### BUG-OBJ12-01: Logout liess Token weiterverwenden
- **Severity:** Medium
- **Fix:** Revocation-Cache in `requireSession`/`logoutSession` eingebaut, Testfall vorhanden.
- **Status:** Fixed

#### BUG-OBJ12-02: Fehlende Produktionshaertung fuer Session-Secret
- **Severity:** High
- **Fix:** Produktionsbetrieb ohne gueltiges `OBJ12_SESSION_SECRET` wird fail-closed (`503`).
- **Status:** Fixed

#### BUG-OBJ12-03: OIDC-Signaturpruefung fehlte im produktiven Pfad
- **Severity:** High
- **Fix:** JWKS-basierte RS256-Signaturpruefung ergaenzt; unsignierter Austausch nur explizit konfigurierbar.
- **Status:** Fixed

### Summary
- **Acceptance Criteria (Code-Scope):** 9/9 bestanden.
- **Acceptance Criteria (Gesamtobjekt):** mehrere Plattform-/Betriebskriterien noch offen.
- **Bugs Found:** 3 total (0 Critical, 2 High, 1 Medium, 0 Low) - alle gefixt.
- **Security:** Deutlich gehaertet im API-Scope, Infrastruktur-Nachweise bleiben offen.
- **Production Ready:** NO (gesamt OBJ-12), da nicht-codebasierte AC noch offen sind.
- **Recommendation:** Plattform-Sicherheitskriterien separat schliessen und danach erneut `/qa`.

## Implementation Update
- 2026-04-09: Konfigurierbare Auth-Modi `local`, `oidc`, `hybrid` im Next.js-Service umgesetzt.
- 2026-04-09: Signierte Session-Tokens mit konfigurierbarer TTL (Default 8h) sowie RBAC fuer `viewer`, `operator`, `admin` auf API-Ebene verdrahtet.
- 2026-04-09: Geschuetzte Endpunkte fuer Capabilities, Participants und Zone-Generierung mit korrekten `401`/`403`-Antworten versehen.
- 2026-04-09: Security-Audit-Events fuer Login, Logout, fehlende/ungueltige Tokens und Rollenverletzungen in die bestehende OTel-Observability integriert.
- 2026-04-09: Participant-Config und Zone-Generator koennen Session-Token lokal halten und fuer geschuetzte Requests mitsenden.

## Deployment
_To be added by /deploy_
