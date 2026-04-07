# OBJ-12: Security & Authentifizierung

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-07

## Dependencies
- OBJ-10: Kubernetes Deployment (Secrets-Management via K8s Secrets)
- OBJ-3: REST API (API-Endpunkte müssen geschützt werden)
- OBJ-17: SBOM & Security-Scanning (Security-Scans sind Teil der Security-Strategie)
- OBJ-1: CI/CD Pipeline (Security-Scans laufen in der Pipeline)

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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
