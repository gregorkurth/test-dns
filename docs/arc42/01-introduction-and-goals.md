# arc42 Kapitel 1: Einfuehrung und Ziele

## 1.1 Ziel dieses Dokuments

Dieses Kapitel beschreibt den Zweck des Services, die wichtigsten Stakeholder und die
konkreten Ziele, an denen Architektur, Umsetzung, QA und Release gemessen werden.
Es ist die zentrale Einstiegsseite fuer Entscheider, Product Owner, Betreiber und
Nicht-Entwickler.

## 1.2 Servicebeschreibung

Der Service ist eine airgapped-faehige DNS-Management-Plattform fuer FMN-/NATO-nahe
Mission Network Umgebungen. Er bietet:

- webbasierte Verwaltung von DNS-relevanten Konfigurationen
- Erzeugung BIND9-kompatibler Zone-Files
- Traceability von Requirement -> Test -> Nachweis
- versioniertes Release-/Change-/Export-Management
- on-prem Kubernetes-Betrieb mit GitOps und Offline-Transfer

Der Service ist explizit auf nachvollziehbare Governance ausgelegt:
Git ist immer Primaerquelle (Source of Truth), externe Systeme sind abgeleitete Kopien.

## 1.3 Stakeholder und Anliegen

| Stakeholder | Rolle | Hauptanliegen | Erfolgskriterium |
|---|---|---|---|
| Mission Network Operator | Fachanwender | schnelle, korrekte DNS-Konfiguration | lauffaehige Zone-Files ohne Nacharbeit |
| QA Lead | Qualitaet | transparente Testabdeckung und Nachweise | pro Release klarer Status Passed/Failed/Never |
| Security Lead | Sicherheit | Zero-Trust, Policy Enforcement, Scan-Nachweise | keine offenen Critical Findings vor Freigabe |
| Platform Engineer | Betrieb | reproduzierbare Deployments on-prem | Helm/GitOps/Zarf-Pfade sind stabil |
| Release Manager | Lieferung | planbarer Freigabeprozess mit Artefakt-Gates | Version, Export, Doku und Nachweise konsistent |
| Manager / Product Owner | Steuerung | schneller Ueberblick ueber Reifegrad und Risiken | klare Maturitaets- und Risikoansicht |
| Auditor / Compliance | Nachvollziehbarkeit | revisionssichere Dokumentationskette | Entscheidungen und Nachweise verlinkt |

## 1.4 Fachliche und technische Hauptziele

### Geschaeftsziele

| ID | Ziel | Messbar durch |
|---|---|---|
| G-01 | DNS-Konfiguration fuer neue Teilnehmer in kurzer Zeit bereitstellen | Erstkonfiguration in < 10 Minuten |
| G-02 | Fehler bei manueller DNS-Pflege reduzieren | weniger manuelle Nacharbeit an Zone-Files |
| G-03 | FMN-Anforderungen transparent abdecken | sichtbare Traceability-Matrix |
| G-04 | Governance fuer Nicht-Entwickler nutzbar machen | Quick Guides + Management-Dashboards |
| G-05 | Offline-Betrieb und Offline-Transfer sicherstellen | erfolgreiche Zarf- und Export-Laeufe |

### Qualitaetsziele (Top-Prioritaet)

| Prioritaet | Ziel |
|---|---|
| 1 | Sicherheit (Policy, RBAC, mTLS, Supply Chain) |
| 2 | Nachvollziehbarkeit (Requirement -> Test -> Nachweis -> Release) |
| 3 | Deploybarkeit (on-prem Kubernetes, Helm, GitOps, Offline) |
| 4 | Bedienbarkeit fuer Nicht-Entwickler |
| 5 | Wartbarkeit und klare Dokumentationsstruktur |

## 1.5 Scope und Nicht-Ziele

### In Scope

- DNS-bezogene Konfigurations- und Export-Flows
- Test- und Nachweisprozesse (manuell und automatisiert)
- Observability- und Security-Dokumentation inkl. Betriebsnachweise
- Release-/Export-/Offline-Pfade

### Nicht in Scope

- Betrieb eines produktiven DNS-Resolvers/Authoritative Servers durch die App selbst
- Cloud-abhaengige Standardpfade als Primar-Betriebsmodell
- manuelle Confluence-Pflege als Primaerquelle

## 1.6 Abnahmekriterien auf Service-Ebene

Der Service gilt als zielkonform, wenn folgende Punkte in Kombination erfuellt sind:

- alle verpflichtenden DoD-Checks pro abgeschlossenem Feature sind dokumentiert
- arc42, Benutzerhandbuch, Betriebsdoku und Export-Log sind fuer Release-Stand aktualisiert
- Security-, Test- und Release-Gates sind ohne offene Blocker
- Deployments sind reproduzierbar in lokaler Kubernetes-Testumgebung und Zielprofil

## 1.7 Verbindliche Quellen

- `docs/SVC.md`
- `features/INDEX.md`
- `docs/DEFINITION-OF-DONE-FEATURE.md`
- `docs/DOCUMENTATION-GUIDE.md`
