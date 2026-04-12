# arc42 Kapitel 10: Qualitaetsanforderungen

## 10.1 Ziel

Dieses Kapitel definiert die nicht-funktionalen Qualitaetsziele inklusive messbarer
Szenarien und verbindlicher Gates.

## 10.2 Qualitaetsbaum (Prioritaet)

| Prioritaet | Qualitaetsmerkmal | Zielbild |
|---|---|---|
| 1 | Sicherheit | keine unkontrollierten Zugriffe, policy-gesteuerte Laufzeit |
| 2 | Nachvollziehbarkeit | lueckenlose Referenzen von Requirement bis Release |
| 3 | Zuverlaessigkeit | stabile Kernflows auch bei Teilausfaellen |
| 4 | Deploybarkeit | reproduzierbarer on-prem Rollout inkl. Rollback |
| 5 | Wartbarkeit | klare Struktur und dokumentierte Entscheidungen |
| 6 | Bedienbarkeit | Management- und Operator-Sichten sind selbsterklaerend |
| 7 | Performance | akzeptable Reaktionszeiten in lokalen Zielumgebungen |

## 10.3 Qualitaetsszenarien (messbar)

| ID | Attribut | Stimulus | Erwartete Reaktion |
|---|---|---|---|
| Q-SEC-01 | Sicherheit | unautorisierter API-Zugriff | 401/403, auditierbares Security-Signal |
| Q-SEC-02 | Sicherheit | Policy-Verstoss bei Deployment | Blockierung vor Runtime, klarer Befund |
| Q-TRC-01 | Nachvollziehbarkeit | Feature wird freigegeben | Requirement/Test/QA/DoD/Export verlinkt |
| Q-OFF-01 | Offline-Faehigkeit | Betrieb ohne Internet | Kernfunktionen und Doku bleiben nutzbar |
| Q-DEP-01 | Deploybarkeit | Release in Zielcluster | Helm/GitOps-Deployment reproduzierbar |
| Q-REL-01 | Zuverlaessigkeit | Teilausfall OTel Backend | lokales Spooling statt stiller Datenverlust |
| Q-USE-01 | Bedienbarkeit | Manager oeffnet Startseite | in <= 2 Klicks zu Doku, Reifegrad, Releaseinfo |
| Q-PERF-01 | Performance | lokale Standardanfrage | Antwort im erwarteten Interaktionsfenster |

## 10.4 Qualitaetsgates pro Release

| Gate | Muss-Ergebnis |
|---|---|
| Lint/Typecheck/Tests | gruen |
| Feature-Status-Sync | gruen |
| Validation Matrix | erzeugt und konsistent |
| Security-Scanning/SBOM | vorhanden, keine offenen Critical ohne Ausnahmeprozess |
| Doku-Gate | arc42 + Handbuch + Betriebsdoku nachgezogen |
| Export-Gate | Export-Protokoll aktualisiert |
| Deployment-Gate | Helm/K8s/GitOps Checks erfolgreich |

## 10.5 SLO-/KPI-Rahmen (orientierend)

| KPI | Zielbereich | Quelle |
|---|---|---|
| Build-Stabilitaet | hoher Anteil gruener Main-Laeufe | CI Workflow Historie |
| Testabdeckung kritischer Flows | fortlaufend steigend | `vitest` + QA Reports |
| offene High-Risiken | kontrolliert und terminiert | Kapitel 11 Risiko-Register |
| Doku-Aktualitaet je Release | 100% Pflichtkapitel aktualisiert | DoD/Release Check |

## 10.6 Qualitaetsrisiken

- hohe Anzahl manueller Nachweise kann Release verlangsamen
- Drift zwischen Feature-Status und Spec-Status erzeugt Governance-Risiko
- fehlende Security-Hardening-Parameter blockieren Cluster-Runtime

Diese Risiken sind in Kapitel 11 mit Massnahmen und Ownern konkretisiert.

## 10.7 Pflege-Trigger

Kapitel 10 wird aktualisiert bei:

- neuen Qualitaetszielen oder Audit-Anforderungen
- geaenderten Release-/Freigabegates
- neuen Messkriterien fuer Security, Test oder Betrieb

## 10.8 Verbindliche Quellen

- `docs/SVC.md`
- `docs/DEFINITION-OF-DONE-FEATURE.md`
- `features/OBJ-17-sbom-security-scanning.md`
- `features/OBJ-22-release-artefaktpruefung-publish-gate.md`
- `docs/testing/VALIDATION-MATRIX.md`
