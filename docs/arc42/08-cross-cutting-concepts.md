# arc42 Kapitel 8: Querschnittliche Konzepte

## 8.1 Ziel

Dieses Kapitel dokumentiert Architekturregeln, die ueber mehrere Bausteine hinweg
gelten. Es ist die verbindliche Sammelstelle fuer Standards in Security,
Observability, Qualitaet, Dokumentation und Delivery Governance.

## 8.2 Security-by-Design

### Kernprinzipien

- least privilege auf Benutzer-, Service- und Cluster-Ebene
- deny-by-default fuer Netzwerk und Policies
- keine unkontrollierte Secret-Verteilung
- Nachvollziehbarkeit aller sicherheitsrelevanten Aktionen

### Umsetzungsbausteine

| Bereich | Standard |
|---|---|
| Pod Security | restricted Profil, non-root, seccomp RuntimeDefault |
| Netzwerk | Cilium Policies fuer Ingress/Egress |
| Pod-zu-Pod Schutz | mTLS |
| Policy Enforcement | OPA Regeln fuer Labels, Images, Konfiguration |
| Runtime Detection | Tetragon + Hubble Beobachtbarkeit |
| Supply Chain | SBOM + Scan-Reports + Release-Gates |
| Credential Management | OpenBao bevorzugt, lokale Fallback-Variante dokumentiert |

## 8.3 Observability-Konzept

| Dimension | Standard |
|---|---|
| Signaltypen | Logs, Metriken, Traces, Security Events |
| Transport | OTel (OTLP) |
| Betriebsmodi | `local` (Zwischenspeicherung) und `clickhouse` (zentral) |
| Auswertung | Grafana Dashboards |
| Mindestnachweise | pro Release belastbare Test- und Telemetriespuren |

## 8.4 Teststrategie (manuell + automatisiert + Operator)

| Ebene | Ziel | Nachweisort |
|---|---|---|
| Unit/Integration | technische Stabilitaet und Regression | `vitest` + `tests/executions` |
| Feature QA | AC-Validierung und Security Checks | `features/OBJ-*.md` QA-Abschnitte |
| Manual Test Runner | reproduzierbare manuelle Schritte | UI + `capabilities/**/tests/manual` |
| Test Operator | periodische Clusternahe Tests | OTel/ClickHouse + Dashboard |

Regel:

- kein Release ohne klaren Status `Passed`, `Failed` oder `Never`
- offene High/Critical Findings blockieren Freigabe

## 8.5 Dokumentations- und DoD-Konzept

### Verbindliche Grundregel

- Confluence nie als Primarquelle pflegen
- immer zuerst Git aktualisieren, dann Export/Kopie

### Pflichtartefakte pro abgeschlossenem Feature

- Feature-Spezifikation inkl. QA-Resultat
- Testnachweis (automatisch/manuell)
- Doku-Update in arc42 und Benutzer-/Betriebsdoku
- ADR-Pruefung (neue Entscheidung ja/nein)
- Export-/Release-Nachweis

## 8.6 Release- und Change-Management

| Regel | Umsetzung |
|---|---|
| Versionierung | `YYYY.MM.N` |
| Update-Hinweise | GUI- und Release-Notizen mit Prioritaet (kritisch/wichtig/info) |
| Kanalmodell | Released/GA, Beta, Preview |
| Change-Nachvollzug | baseline history + rollback + export log |
| Artefakt-Gates | SBOM/Scan/Policy/Validation Matrix verpflichtend |

## 8.7 Feature-Flags und Beta-Kennzeichnung

- Funktionen im Status Beta/Preview muessen visuell markiert werden
- kanalbezogene Legende ist in Management-Sichten verpflichtend
- OpenFeature ist vorgesehen, um Flags standardisiert auszusteuern

## 8.8 Helm- und Deploy-Standards

| Thema | Standard |
|---|---|
| Values Validierung | `values.schema.json` |
| Konfliktregeln | `templates/validation.yaml` |
| Profile | local, internal, prod |
| OCI Readiness | Chart und Images als OCI veroeffentlichbar |
| Security Defaults | non-root, readonly FS, no privilege escalation |
| Transparenz | Deploy-/Helm-Status via API/UI sichtbar |

## 8.9 Pflege-Trigger

Kapitel 8 wird aktualisiert bei:

- neuen Security-/Compliance-Vorgaben
- neuen Test- oder Nachweisregeln
- geaenderten Release-/DoD-Prozessen
- neuen Querschnittsstandards fuer Build/Deploy/Observability

## 8.10 Verbindliche Quellen

- `docs/DOCUMENTATION-GUIDE.md`
- `docs/DEFINITION-OF-DONE-FEATURE.md`
- `docs/QUICK-GUIDE-FEATURE-UND-REQUIREMENT.md`
- `req-init/security-baseline.md`
- `features/OBJ-11-monitoring-observability.md`
- `features/OBJ-12-security-authentifizierung.md`
- `features/OBJ-17-sbom-security-scanning.md`
- `features/OBJ-25-helm-charts.md`
- `features/OBJ-26-test-operator-scheduled-execution.md`
