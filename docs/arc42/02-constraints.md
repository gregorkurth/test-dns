# arc42 Kapitel 2: Randbedingungen

## 2.1 Ziel

Dieses Kapitel dokumentiert alle verbindlichen Leitplanken, die Architektur- und
Implementierungsentscheidungen begrenzen. Es gilt fuer Produkt, Betrieb, Security,
Dokumentation und Release-Prozess.

## 2.2 Fachliche Randbedingungen

| ID | Randbedingung | Auswirkung auf Architektur |
|---|---|---|
| C-BIZ-01 | FMN-/NATO-orientierte DNS-Anforderungen | starke Traceability und Requirement-Referenzen notwendig |
| C-BIZ-02 | Nutzung durch technische und nicht-technische Rollen | duale Doku: Management-Guide + technische Details |
| C-BIZ-03 | Hohe Nachvollziehbarkeit im Freigabeprozess | strukturierte Nachweisartefakte und eindeutige IDs |

## 2.3 Technische Randbedingungen

| ID | Randbedingung | Verbindliche Auspraegung |
|---|---|---|
| C-TEC-01 | Frontend-/Backend-Stack | Next.js + TypeScript im Monorepo |
| C-TEC-02 | Zielplattform | Kubernetes on-prem als Primarziel |
| C-TEC-03 | Lokale Entwicklungsumgebung | Docker Desktop Kubernetes fuer Test/Integration erlaubt |
| C-TEC-04 | Deployment-Standard | Helm Charts + GitOps (Argo CD App-of-Apps) |
| C-TEC-05 | Container-Standard | OCI-konforme Images und Artefakte |
| C-TEC-06 | Dokumentationsformat | Markdown als Source, Export pro Kapitel moeglich |

## 2.4 Sicherheits- und Compliance-Randbedingungen

| ID | Randbedingung | Verbindliche Auspraegung |
|---|---|---|
| C-SEC-01 | Zero-Trust | Cilium Network Policies, mTLS Pod-zu-Pod |
| C-SEC-02 | Policy Enforcement | OPA-basiertes Policy-Modell fuer Labels/Deploy-Regeln |
| C-SEC-03 | Runtime Detection | Tetragon fuer Runtime-Signale |
| C-SEC-04 | Secrets Management | OpenBao als bevorzugter Vault-Service, lokale Fallback-Variante dokumentiert |
| C-SEC-05 | Credential Hygiene | keine Secrets in Prompts, Logs oder statischen Dateien |
| C-SEC-06 | Security Telemetrie | OTel -> ClickHouse/Grafana oder lokaler Modus |
| C-SEC-07 | Supply Chain | SBOM + Security Scans als Release-Voraussetzung |

## 2.5 Betriebs- und Delivery-Randbedingungen

| ID | Randbedingung | Verbindliche Auspraegung |
|---|---|---|
| C-OPS-01 | Airgap-Faehigkeit | keine externen Laufzeitabhaengigkeiten |
| C-OPS-02 | Offline Transfer | Release als Zarf-Paket transportierbar |
| C-OPS-03 | Git Modell | Produktion: GitLab; Zielumgebung: Gitea |
| C-OPS-04 | Konfigurationsmodell | Runtime-Artefakte und Zielparameter in getrennten Repos |
| C-OPS-05 | Versionierung | Release-Schema `YYYY.MM.N` |
| C-OPS-06 | Exportprozess | Git zuerst, danach Confluence-/USB-Kopie |

## 2.6 Dokumentations- und Governance-Randbedingungen

| ID | Randbedingung | Verbindliche Auspraegung |
|---|---|---|
| C-DOC-01 | Source of Truth | nur Git ist Primaerquelle |
| C-DOC-02 | arc42 Vollstaendigkeit | alle Kapitel pro Release/Feature nachziehen |
| C-DOC-03 | Export-Nachweis | zentrales Export-Log (`docs/exports/EXPORT-LOG.md`) |
| C-DOC-04 | DoD-Pflicht | Feature-Fertigstellung erst bei Doku-/QA-/ADR-/Export-Checkliste |
| C-DOC-05 | Entscheidungsnachweis | ADR mit Gremium/Decision Owner dokumentieren |

## 2.7 Konsequenzen dieser Randbedingungen

- Architektur bevorzugt lokale, robuste Ablaeufe statt Cloud-Magic.
- Sicherheitsmassnahmen muessen von Anfang an in Build und Runtime integriert sein.
- Dokumentation ist Teil des Produktes und nicht optionales Nebenartefakt.
- Feature-Tempo ohne Nachweisqualitaet ist nicht akzeptiert.

## 2.8 Pflege-Trigger

Dieses Kapitel muss aktualisiert werden bei:

- neuen Compliance- oder Security-Vorgaben
- geaendertem Deploymentziel (z. B. Cluster-Topologie)
- geaendertem Release-/Export-Prozess
- neuen verbindlichen Toolstandards

## 2.9 Verbindliche Quellen

- `docs/SVC.md`
- `req-init/app-template.md`
- `req-init/security-baseline.md`
- `docs/DEFINITION-OF-DONE-FEATURE.md`
- `features/OBJ-14-release-management.md`
- `features/OBJ-19-zarf-paket-offline-weitergabe.md`
- `features/OBJ-21-gitops-argocd.md`
- `features/OBJ-22-release-artefaktpruefung-publish-gate.md`
