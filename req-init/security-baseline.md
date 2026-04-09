# Security-Baseline-Konzept (Max Security)

## Ziel

Dieses Dokument definiert verbindliche Security-Vorgaben fuer den Service-Lebenszyklus:

- Build und Image
- Kubernetes-Objekte (Namespace, Workload, Pod)
- Netzwerkschnittstellen und API-Zugriffe
- Runtime und Incident-Nachvollziehbarkeit

Ziel ist ein Zero-Trust-Ansatz mit harter Policy-Durchsetzung ueber Open Policy Agent (OPA) und zentralem Verstoss-Reporting ueber OpenTelemetry (OTel).

---

## 1. Sicherheitsprinzipien (MUSS)

1. Default Deny fuer Netzwerk, Rechte und Zugriffe.
2. Least Privilege fuer Service Accounts, Container-Rechte und API-Tokens.
3. Immutable und reproduzierbare Artefakte (signiert, ueber Digest referenziert).
4. Policy as Code: Regeln versioniert im Git, geprueft in CI, erzwungen im Cluster.
5. Kein manueller Bypass produktiver Policies ohne dokumentierte Ausnahme (zeitlich begrenzt, genehmigt, auditierbar).

---

## 2. Verbindliche Security-Labels

Alle Namespace-, Workload- und Pod-Objekte MUESSEN Security-Labels tragen.

### 2.1 Pflicht-Labels (Namespace)

| Label | Beispiel | Zweck |
|---|---|---|
| `security.fmn/zone` | `dmz` `internal` `restricted` | Segmentierung und Policy-Mapping |
| `security.fmn/ai-zone` | `z0` bis `z8` | Zuordnung zum 9-Zonen-AI-Modell |
| `security.fmn/data-classification` | `public` `internal` `confidential` | Datenklassifizierung |
| `security.fmn/owner` | `team-dns` | Verantwortlichkeit |
| `security.fmn/environment` | `dev` `test` `prod` | Umgebungsabhaengige Regeln |
| `security.fmn/secrets-mode` | `openbao` `local` | Betriebsmodus fuer Credential-Management |
| `security.fmn/siem-mode` | `clickhouse` `local` | Betriebsmodus fuer SIEM/OTel-Security-Events |
| `security.fmn/security-profile` | `strict` `degraded-local` | Sicherheitsniveau und Ausnahmegrad |

### 2.2 Pflicht-Labels (Workload/Pod)

| Label | Beispiel | Zweck |
|---|---|---|
| `security.fmn/workload-tier` | `frontend` `backend` `control-plane` | Policy-Tiering |
| `security.fmn/exposure` | `internal` `ingress` `egress-only` | Schnittstellen-Freigaben |
| `security.fmn/north-south` | `enabled` `disabled` | Externe Erreichbarkeit je Workload |
| `security.fmn/risk-level` | `low` `medium` `high` | Schwellwerte fuer Kontrollen |
| `security.fmn/criticality` | `mission-critical` `standard` | Priorisierung im Incident-Fall |
| `security.fmn/agent-skill-profile` | `core-only` `extended-reviewed` | Whitelist-Profil fuer Agent-Skills |
| `security.fmn/agent-siem` | `required` | SIEM-Weiterleitung ist Pflicht |
| `security.fmn/exception-id` | `EXC-2026-001` | Nur falls genehmigte Ausnahme existiert |

Hinweis: Ohne Pflicht-Labels darf ein Objekt nicht in den Cluster gelangen.

---

## 3. OPA-Durchsetzung (Admission + CI)

OPA wird auf zwei Ebenen genutzt:

- CI Policy Check (z. B. Conftest gegen Helm/Kustomize/Manifeste)
- Admission Control im Cluster (OPA Gatekeeper)

### 3.1 Pflicht-Policy-Pakete

1. Label Enforcement
- Required Labels vorhanden
- Werte nur aus erlaubten Enum-Listen

2. Image Security
- Nur freigegebene Registries (z. B. Harbor)
- Kein `:latest`
- Nur Digest-Pinning (`image@sha256:...`)
- Signaturnachweis Pflicht (Cosign/Notary)

3. Pod Security Hardening
- `runAsNonRoot: true`
- `allowPrivilegeEscalation: false`
- `readOnlyRootFilesystem: true`
- `capabilities.drop: [ALL]`
- `seccompProfile: RuntimeDefault`
- Keine `hostNetwork`, `hostPID`, `hostIPC`
- Keine privilegierten Container
- Kein unkontrolliertes `hostPath`

4. Secrets und Konfiguration
- Keine Secrets in Env Klartext aus Manifesten
- Nur referenzierte Secret-Objekte (oder External Secret Mechanismus)
- Kein Hardcoding von Schluesseln/Tokens

5. Netzwerkpflichten
- Pro Namespace mindestens eine Default-Deny Policy
- Explizite Allow-Policies pro Kommunikationspfad
- Pod-to-Pod nur mTLS
- North-South-Ingress/Egress nur ueber explizite Cilium-Regeln und freigegebene Netze
- DNS-Workloads: externe Freigaben nur fuer fachlich notwendige DNS-Ports/Protokolle
- Egress-Allowlist fuer DNS-Workloads (kein offener Default-Egress)

6. KI-Agenten Hardening
- Agent-Workloads nur in dedizierten Namespaces/VLAN-Segmenten
- Skill-Whitelisting verpflichtend (nur freigegebene Skill-IDs/Integrationen)
- Keine Klartext-Credentials in Env, Prompt, Logs oder Artefakten
- SIEM-Export fuer alle Agent-Aktionen und Policy-Entscheidungen verpflichtend
- Credential-Maximalalter erzwingen (30-90 Tage, je nach Kritikalitaet)

7. Security-Profil und Betriebsmodi
- In `prod` ist `security.fmn/security-profile=strict` verpflichtend
- In `prod` ist `security.fmn/secrets-mode=openbao` verpflichtend
- In `prod` ist `security.fmn/siem-mode=clickhouse` verpflichtend
- `local`-Modi sind nur fuer `dev`/`test` zulaessig und erfordern eine sichtbare Sicherheitswarnung
- Bei `degraded-local` muss eine freigegebene Ausnahme-ID (`security.fmn/exception-id`) vorhanden sein

8. FMN/NATO externe Service-Nutzbarkeit
- Externe Service-Freigaben MUESSEN als Kommunikationsmatrix dokumentiert sein (z. B. `docs/security/fmn-communication-matrix.md`, Felder: Quelle, Ziel, Port, Protokoll, Zweck, Owner, Freigabe-ID).
- CiliumPolicy/CiliumClusterwidePolicy MUSS North-South-Ingress und Egress gemass Kommunikationsmatrix erzwingen.
- Nicht dokumentierte externe Flows sind per Default zu blockieren.
- Alle Deny-Entscheidungen fuer North-South-Traffic sind in Hubble/OTel nachvollziehbar zu protokollieren.

9. MCP/API-Agentenzugriff
- MCP-Tools duerfen nur freigegebene API-Endpunkte und Operationen exponieren (explizite Tool-Whitelist).
- MCP-Serveridentitaet muss als eigener Workload mit eigenen Labels, ServiceAccount und NetworkPolicies betrieben werden.
- MCP-Aufrufe und API-Operationen muessen als auditierbare Security-Events in OTel/SIEM erscheinen.
- Schreiboperationen (CRUD) muessen Rate-Limiting, Validierung und Fehlerklassifikation erzwingen.

### 3.2 Policy-Verstoss-Verhalten

- CI: Verstoss blockiert Merge/Release.
- Admission: Verstoss fuehrt zu `deny`.
- Nur definierte `warn`-Policies in Nicht-Prod erlaubt.

---

## 4. OTel-Reporting fuer Policy-Verstoesse

Jeder Verstoss MUSS als Sicherheitsereignis in OTel erfasst werden.

### 4.1 Event-Mindestinhalt

| Feld | Beschreibung |
|---|---|
| `event.name` | `policy.violation` |
| `security.policy.id` | Eindeutige Policy-ID |
| `security.policy.engine` | `opa-gatekeeper` oder `conftest` |
| `security.severity` | `low` `medium` `high` `critical` |
| `k8s.namespace.name` | Betroffener Namespace |
| `k8s.workload.name` | Betroffene Workload |
| `k8s.pod.name` | Betroffener Pod (falls vorhanden) |
| `service.name` | Service/Komponente |
| `network.direction` | `ingress` oder `egress` |
| `network.peer.cidr` | Quelle oder Zielnetz |
| `network.transport` | `tcp` `udp` |
| `network.port` | Betroffener Port |
| `security.profile` | `strict` oder `degraded-local` |
| `security.exception.id` | Ausnahme-ID bei degradiertem Betrieb |
| `ai.agent.id` | Eindeutige Agent-Identitaet |
| `ai.skill.id` | Genutzte Skill-/Integrations-ID |
| `ai.skill.profile` | Freigabeprofil (Whitelist-Stufe) |
| `deployment.environment` | `dev` `test` `prod` |
| `git.commit.id` | Commit zur Aenderung |
| `release.version` | Release-Referenz |

### 4.2 Pipeline

1. OPA/Gatekeeper/CI erzeugt Entscheidung und Verstossdaten.
2. OTel Collector nimmt Daten als Logs/Events entgegen.
3. Weitergabe je nach Betriebsmodus:
- `local`: persistente lokale Zwischenspeicherung
- `clickhouse`: zentrale Auswertung
4. Grafana zeigt Security-Dashboard (Verstoesse pro Policy, Severity, Team, Release).

### 4.3 Alarmierung

- `critical`: sofortiger Alarm (On-Call)
- `high`: Alarm innerhalb definierter Reaktionszeit
- Wiederholte Verstosse gleicher Policy werden als Trend markiert

### 4.4 SIEM-Integration (Pflicht)

1. OTel Security-Events MUESSEN an das zentrale SIEM weitergeleitet werden.
2. Mindestfaelle: Policy-Deny, Auth-Failures, ungeplante Egress-Versuche, Skill-Whitelist-Verletzungen, Secret-Zugriffsfehler.
3. Alle Agent-Aktionen muessen in SIEM korrelierbar sein (Agent-ID, Skill-ID, Namespace, Release, Zeitfenster).
4. SIEM-Weiterleitung darf in `prod` nicht deaktivierbar sein.
5. Zulässige Betriebsvarianten:
- `clickhouse` (Standard/strict): OTel -> ClickHouse -> SIEM-Auswertung
- `local` (degraded-local): OTel lokal gepuffert, nur fuer `dev`/`test` oder klar dokumentierte Offline-Phasen
6. Bei `siem-mode=local` MUSS ein deutlich sichtbarer Hinweis erzeugt werden (Dashboard + Deployment-Log + Security-Event `security.posture.degraded`).

---

## 5. Image-Security-Baseline (MUSS)

1. Gehaertete Minimal-Base-Images verwenden (distroless/alpine nur wenn freigegeben).
2. Multi-Stage Builds; keine Build-Tools im Runtime-Image.
3. Image-Scan vor Push und vor Release (Vuln + Misconfig + License, je nach Vorgabe).
4. SBOM pro Release verpflichtend.
5. Nur signierte Images deploybar.
6. Registry Allowlist und Pull ueber Digest.

---

## 6. Pod- und Workload-Security-Baseline (MUSS)

1. Pod Security Context hart setzen (Non-Root, Read-Only FS, Seccomp).
2. Ressourcenlimits verpflichtend (CPU/Memory Requests und Limits).
3. Liveness/Readiness/Startup Probes verpflichtend.
4. ServiceAccount pro Workload, keine shared Admin-Accounts.
5. RBAC fein granular, keine Cluster-Admin-Rechte fuer Applikationspods.
6. Schreibrechte nur fuer explizit benoetigte Volumes.

---

## 7. Schnittstellen- und API-Security (MUSS)

1. Alle externen und internen Schnittstellen ueber TLS.
2. Pod-to-Pod-Verkehr via mTLS (Cilium Service Mesh oder gleichwertig).
3. API AuthN/AuthZ ueber zentralen IdP (z. B. Keycloak), rollenbasiert.
4. API-Schutz: Rate Limiting, Request-Validierung, Eingabe-Sanitizing, Audit Logs.
5. Ingress/Egress strikt auf erlaubte Endpunkte begrenzen.
6. Keine ungeschuetzten Admin-Endpunkte.
7. Externe Schnittstellen (North-South) nur mit Cilium-Policies, dokumentierter Kommunikationsmatrix und nachvollziehbarer Freigabe (FMN/NATO-konform).
8. DNS-Exposition nach aussen nur ueber freigegebene DNS-Endpunkte; ungenutzte Ports und Protokolle sind zu sperren.
9. Ein Kubernetes `Ingress`-Objekt allein ist nicht ausreichend; die effektive Freigabe muss zusaetzlich durch Cilium Ingress/Egress Policies erzwungen werden.

---

## 8. Runtime-Security und Forensik

1. Laufzeitdetektion mit Tetragon (Prozess-, Syscall-, Netzwerkanomalien).
2. Netzwerkbeobachtbarkeit mit Hubble.
3. Security-Ereignisse in OTel normalisieren und korrelieren.
4. Forensik-Minimum: Zeitstempel, betroffener Pod, Image-Digest, Namespace, Policy-ID, Actor.

---

## 9. KI-Agenten Security-Vorgaben (MUSS)

1. Netzwerk-Isolation
- KI-Agenten nur in isolierten Umgebungen betreiben (dedizierte VLANs oder getrennte Kubernetes-Namespaces).
- Zwischen AI-Namespaces gilt Default-Deny; nur explizite Kommunikationspfade sind erlaubt.

2. Zentrales Credential Management
- Zugangsdaten duerfen nicht in Prompts, Arbeitsspeicher-Dumps, Logs oder Tickets auftauchen.
- Standard ist ein zentraler Secrets Manager als eigener Service (OpenBao).
- Wenn OpenBao nicht genutzt wird, ist `secrets-mode=local` nur als degradierte Variante zulaessig (reduziertes Sicherheitsniveau).
- Bei `secrets-mode=local` ist ein verpflichtender Sicherheitshinweis in GUI/Runbook/Deployment-Ausgabe erforderlich.
- Kurzlebige Credentials/Tokens mit automatischer Erneuerung bevorzugen.

3. Skill-Whitelisting
- Jede neue Skill-/Tool-/Integrationsfaehigkeit braucht formale Freigabe und Code-Review.
- Nicht freigegebene Skills duerfen nicht installiert oder ausgefuehrt werden.

4. SIEM-Pflicht
- Saemtliche Agent-Aktionen (Prompt-Aufruf, Tool-Invocation, Datenzugriff, Policy-Entscheidungen) muessen ans SIEM gemeldet werden.
- Ziel: Erkennung von Abrufspitzen, Datenabfluss und atypischen Zugriffspfaden.

5. Strikte Credential-Rotation
- Agenten-Identitaeten muessen ein verkuerztes Rotationsintervall haben (30-90 Tage).
- Fuer hochkritische Workloads ist <=30 Tage vorzusehen.

6. 9-Zonen-AI-Modell (Z0-Z8)
- Das Sicherheitsmodell deckt den End-to-End-Fluss von Nutzeranfrage bis Antwort ab.
- Jede Zone hat eigene Controls (Zugriff, Datenklassifikation, Logging, Egress, Policy-Gates).
- Zonenuebergaenge sind nur ueber explizite, auditable Schnittstellen zulaessig.

---

## 10. Kubernetes-Only Umsetzung (ohne Zusatzplattform)

Diese Vorgaben sind auch in einem reinen Kubernetes-Setup umsetzbar:

1. Isolation
- Dedizierte Namespaces pro Zone (z. B. `ai-z1-ingress`, `ai-z3-orchestrator`, `ai-z6-tools`).
- `NetworkPolicy` mit Default-Deny fuer Ingress und Egress in jedem Namespace.
- Cilium Policies sind verpflichtend fuer externe (North-South) Flows sowie fuer L7-/mTLS-Regeln.

2. Policy Enforcement
- OPA Gatekeeper als Admission Controller.
- Conftest in CI fuer Helm/Kustomize vor Deployment.
- Blockierregeln fuer Labels, Images, Pod-Context, Skill-Whitelist, Egress.

3. Credential-Schutz
- Kubernetes Secrets nur als Transportschicht; Quelle bleibt OpenBao im `strict`-Profil.
- Variante `local`: lokale Kubernetes-Secret-Verwaltung ist erlaubt, aber nur mit `security-profile=degraded-local`, Ausnahme-ID und Warnhinweis.
- Secret-Synchronisierung via External Secrets Operator oder CSI Driver.
- OPA blockiert Workloads mit statischen Secrets in Env/ConfigMaps.

4. SIEM/OTel
- OTel Collector als DaemonSet/Deployment.
- Exporter zu SIEM-Bridge und Observability-Store.
- Pflicht-Attribute fuer Agent-ID, Skill-ID, Zone und Policy-ID.

5. Rotation
- ServiceAccount Tokens auf kurze Laufzeit begrenzen.
- OpenBao-Leases und App-Rollen mit hartem TTL- und Renewal-Policy-Set.
- Bei `secrets-mode=local` sind alternative Rotationsjobs verpflichtend und auditierbar nachzuweisen.

---

## 11. Definition of Done (Security Gate)

Ein Feature/Release ist nur security-freigabefaehig, wenn:

- alle Pflicht-Labels gesetzt sind,
- alle OPA Pflicht-Policies in CI und Admission bestehen,
- keine offenen `critical`/`high` Findings ohne dokumentierte Ausnahme bestehen,
- OTel-Verstoss-Reporting aktiv ist und Dashboard-Daten liefert,
- SIEM-Weiterleitung fuer Agent-Aktionen aktiv ist,
- Skill-Whitelist-Regeln aktiv und auditiert sind,
- Credential-Rotation nach Policy nachweisbar ist,
- bei `degraded-local` ein sichtbarer Sicherheits-Hinweis und eine gueltige Ausnahme-ID vorhanden sind,
- bei `north-south=enabled` eine gueltige FMN-Kommunikationsmatrix inkl. Cilium Allow-/Deny-Testnachweisen vorliegt,
- Image-Signatur, SBOM und Scan-Nachweise vorliegen.

---

## 12. Empfohlene Repo-Struktur fuer Umsetzung

```text
policies/
  opa/
    gatekeeper/
      templates/
      constraints/
    conftest/
      kubernetes/
      helm/
  ai/
    skill-whitelist.rego
    zone-segmentation.rego
monitoring/
  otel/
    policy-violations-pipeline.yaml
    siem-export-pipeline.yaml
  grafana/
    dashboards/
      security-policy-violations.json
docs/
  security/
    fmn-communication-matrix.md
    policy-exceptions.md
    incident-response.md
    ai-zones-z0-z8.md
```

---

## 13. Priorisierte Einfuehrung (kurz)

1. Pflicht-Labels + OPA Label-Enforcement aktivieren.
2. Pod/Image Policies im `deny`-Modus aktivieren.
3. OTel-Verstoss-Reporting und Grafana-Sicherheitsdashboard einschalten.
4. SIEM-Export fuer Agent-Aktionen aktivieren und alarmieren.
5. mTLS und Default-Deny-Netzwerkregeln fuer alle Namespaces durchsetzen.
6. Skill-Whitelist und Credential-Rotation verbindlich machen.
7. Exception-Prozess und Audit-Trail verbindlich machen.
