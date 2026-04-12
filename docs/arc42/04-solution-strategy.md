# arc42 Kapitel 4: Loesungsstrategie

## 4.1 Ziel

Dieses Kapitel beschreibt die strategischen Architekturprinzipien und erklaert,
warum die Loesung bewusst auf Nachvollziehbarkeit, Offline-Faehigkeit und
Governance-first ausgelegt ist.

## 4.2 Strategische Leitprinzipien

| Prinzip | Bedeutung | Konkrete Auspraegung |
|---|---|---|
| Git First | Git ist verbindliche Primaerquelle | Doku, ADRs, Requirements, Testnachweise im Repo |
| Offline First | Betrieb ohne Internet ist Kernanforderung | lokale Quellen, Zarf-Transport, keine CDN-Pflicht |
| Security by Default | Sicherheitsmassnahmen sind Standard, nicht Add-on | PodSecurity, RBAC, OPA, Cilium, mTLS |
| Traceability End-to-End | Entscheidung und Umsetzung muessen nachvollziehbar sein | Requirement -> Test -> Evidence -> Release |
| Declarative Delivery | Deployments sind reproduzierbar und auditierbar | Helm + GitOps + App-of-Apps |
| Operability for Non-Developers | Management und Betrieb sollen sofort verstehen koennen | Dashboards, Quick Guides, klare Statuslegenden |

## 4.3 Zielbild der Loesung

Die Loesung kombiniert drei Perspektiven in einem konsistenten System:

- Fachperspektive: DNS-Konfigurations- und Traceability-Flows
- Betriebs-/Plattformperspektive: Kubernetes, Helm, GitOps, Offline-Import
- Governanceperspektive: Doku, DoD, QA, ADR, Export- und Release-Nachweise

## 4.4 Strategische Architekturbausteine

| Bereich | Strategie |
|---|---|
| Applikationskern | Next.js als einheitliche Plattform fuer GUI + API |
| Teststrategie | Kombination aus automatischen Tests, manuellen Tests und Test Operator |
| Observability | OTel als einheitliches Signalformat mit local/clickhouse Modus |
| Security | Zero-Trust-Prinzip, zentral definierte Policies, Runtime-Detection |
| Deployment | OCI-Artefakte, Helm-basierte Pakete, GitOps-Synchronisation |
| Dokumentation | arc42 + Benutzerhandbuch + Betriebsdoku als Release-Pflicht |

## 4.5 Strategie nach Lieferstufen

| Stufe | Fokus | Ergebnis |
|---|---|---|
| Foundation | API, Grund-GUI, Doku-Backbone | lauffaehiger MVP-Kern |
| Platform Hardening | Security, OTel, Helm, Operator, Registry | betriebssichere Plattformfaehigkeit |
| Delivery & Governance | Release-Gates, Export, Maturitaet, Offline-Import | reproduzierbarer End-to-End-Prozess |
| Scale & Automation | mehr automatisierte Nachweise, erweiterte Policies | sinkendes Release-Risiko |

## 4.6 Bewusste Trade-offs

| Entscheidung | Vorteil | Nachteil |
|---|---|---|
| Monorepo mit zentraler Doku | hohe Konsistenz und einfache Nachverfolgung | groessere Repo-Komplexitaet |
| Offline-First statt Cloud-First | einsatzfaehig in abgeschotteten Netzen | weniger out-of-the-box Managed Services |
| Dokumentationspflicht in DoD | hohe Auditierbarkeit | erhoehter Prozessaufwand |
| Strenge Security Defaults | geringeres Sicherheitsrisiko | mehr Integrationsarbeit pro Feature |

## 4.7 Weiterentwicklung der Strategie

Die Strategie wird angepasst, wenn mindestens einer dieser Punkte eintritt:

- neue Compliance-Vorgaben oder Einsatzszenarien
- deutliche Aenderungen bei Betriebsplattform oder Tooling
- neue ADRs mit hoher Architekturwirkung
- wiederkehrende QA-/Release-Blocker, die strukturell geloest werden muessen

## 4.8 Verbindliche Quellen

- `docs/adr/INDEX.md`
- `features/INDEX.md`
- `req-init/app-template.md`
- `docs/DEFINITION-OF-DONE-FEATURE.md`
