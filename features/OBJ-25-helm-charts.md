# OBJ-25: Helm Charts fuer Kubernetes Deployment

## Status: In Review
**Created:** 2026-04-09
**Last Updated:** 2026-04-10

## Dependencies
- OBJ-10: Kubernetes Deployment (Basis-Manifeste vorhanden)
- OBJ-11: Monitoring & Observability (OTel-Konfiguration als Chart-Werte einbindbar)
- OBJ-19: Zarf-Paket / Offline-Weitergabe (Chart muss offline transportierbar sein)
- OBJ-21: GitOps / Argo CD / App-of-Apps (Chart als GitOps-Quelle nutzbar)

## User Stories
- Als Platform Engineer moechte ich die App per Helm installieren und aktualisieren, damit Deployments standardisiert und reproduzierbar sind.
- Als Release Manager moechte ich eine versionierte Chart-Version pro Release haben, damit Rollout und Rollback nachvollziehbar bleiben.
- Als Security-Verantwortlicher moechte ich sichere Default-Werte im Chart erzwingen, damit unsichere Deployments frueh verhindert werden.
- Als Operator moechte ich lokale, interne und produktive Werteprofile nutzen, damit dieselbe Chart-Struktur in allen Umgebungen funktioniert.
- Als Dokumentationsverantwortlicher moechte ich arc42 und Benutzerhandbuch zusammen mit der Chart-Pflege nachziehen, damit Betrieb und Architektur konsistent bleiben.

## Acceptance Criteria
- [ ] Helm-Chart liegt versioniert unter `helm/dns-management-service/`
- [ ] Chart enthaelt mindestens `Chart.yaml`, `values.yaml`, `templates/` und `README.md`
- [ ] Image-Quelle ist ueber Werte steuerbar (`repository`, `tag` oder `digest`)
- [ ] Deployment, Service und Ingress sind ueber Chart-Werte steuerbar
- [ ] Security Defaults sind als sichere Voreinstellung gesetzt (kein privileged Pod, readOnlyRootFilesystem, non-root)
- [ ] OTel-Modus (`local`/`clickhouse`) ist per Chart-Wert konfigurierbar
- [ ] `helm lint` und `helm template` laufen ohne Internetabhaengigkeit erfolgreich
- [ ] Install-/Upgrade-/Rollback-Commands sind in der Betriebsdoku dokumentiert
- [ ] arc42-Kapitel 5, 7 und 8 sind fuer Helm-Auswirkungen nachgezogen
- [ ] Benutzerhandbuch (`docs/user-manual/operations.md`) ist fuer Helm-Betrieb nachgezogen
- [ ] QA-Nachweis beinhaltet Helm-Smoke-Test (Install, Upgrade, Rollback, Render-Check)
- [ ] Feature-Abschluss ist erst gueltig, wenn `docs/DEFINITION-OF-DONE-FEATURE.md` vollstaendig abgehakt ist
- [ ] `values-prod.yaml` Profil existiert mit produktiven Sicherheitseinschraenkungen; es unterscheidet sich nachweislich von `values-local.yaml` (z.B. kein Debug-Modus, TLS-Pflicht, ressourcenlimitierte Pods)
- [ ] Das Chart ist als OCI-Artefakt in eine Harbor-kompatible Registry pushbar (`helm push`); der Chart-Push ist Bestandteil der Release-Pipeline und ermoeglicht den Zarf-Import ohne lokale Chart-Dateien

## Edge Cases
- Was wenn Chart-Werte widerspruechlich sind (z. B. Ingress aktiv ohne Hostname)? -> Validierung mit klarer Fehlermeldung.
- Was wenn der Cluster keine IngressClass bereitstellt? -> Chart erlaubt Deaktivierung oder alternative Service-Exposition.
- Was wenn Image-Digest fehlt oder ungültig ist? -> Deployment wird geblockt oder mit Warnstatus markiert.
- Was wenn Upgrade fehlschlaegt? -> Rollback-Pfad muss dokumentiert und testbar sein.
- Was wenn lokale und produktive Sicherheitsprofile verwechselt werden? -> Profile sind klar getrennt und im Chart dokumentiert.
- Was wenn Helm-Schema-Validierung fuer ein benutzerdefiniertes Values-File fehlschlaegt? -> `helm lint` meldet den Fehler mit Zeilenangabe; kein Install/Upgrade wird ohne valide Werte gestartet.
- Was wenn der OCI-Chart-Push zu Harbor waehrend der Release-Pipeline fehlschlaegt? -> Pipeline-Schritt schlaegt fehl; kein Zarf-Paket wird ohne nachgewiesenen Chart in der Registry erzeugt.

## Technical Requirements
- Helm 3.x kompatibel
- Chart-Struktur bleibt airgapped-faehig und GitOps-freundlich
- Werteprofile fuer mindestens `local`, `internal`, `prod`
- Security- und OTel-Konfigurationswerte im Chart ohne Codeaenderung umschaltbar
- Dokumentationspflicht fuer arc42, Benutzerhandbuch, DoD und QA-Nachweis

---
<!-- Sections below are added by subsequent skills -->

## Implementation Update
**Stand:** 2026-04-10

Erster Chart-Stand ist umgesetzt unter `helm/dns-management-service/`:
- `Chart.yaml`, `values.yaml`, `values-local.yaml`, `values-internal.yaml`
- Templates fuer Namespace, ConfigMap, Deployment, Service, Ingress
- Templates fuer Cilium Default-Deny und Allow-Required-Traffic
- Chart-README mit Install-/Upgrade-/Rollback-Schnellstart

Noch offen:
- Helm-QA-Nachweis in Feature-Abschnitt eintragen
- finale Werteabstimmung fuer produktive Zielumgebung
- Release-Versionsbindung fuer Chart (`version`/`appVersion`) im Release-Prozess verankern

### Update 2026-04-10 (Backend + Frontend)

Umsetzung ist end-to-end erweitert:

- Chart vervollstaendigt:
- `values-prod.yaml` angelegt (TLS-Pflicht, kein Debug, produktive Ressourcenlimits).
- `values.schema.json` angelegt (Schema-Validierung inkl. Ingress/NodePort/Otel-Regeln).
- `templates/validation.yaml` hinzugefuegt (fruehe Fehlermeldung bei widerspruechlichen Werten).
- `templates/ingress.yaml` auf `ingress.hostname` + optionales TLS aktualisiert.
- `templates/configmap.yaml` nutzt explizite `otel.*` und `debug.enabled` Werte.
- API/Backend fuer Managementstatus:
- `src/lib/obj25-helm-status.ts` erstellt (Chart-Metadaten, Pflichtdateien, Offline-Checks, OCI-Readiness).
- `GET /api/v1/helm/status` unter `src/app/api/v1/helm/status/route.ts` erstellt (viewer-auth, optional `runChecks`, `release`, `namespace`).
- Helm-Release-Status (offline-first mit Fallback) ist Bestandteil der API-Antwort.
- Frontend-Managementsicht:
- `/helm` Seite unter `src/app/helm/page.tsx` erstellt.
- Zeigt Check-Status fuer local/internal/prod, Dateivollstaendigkeit, Helm-Release-Status und OCI Push Readiness.
- Betrieb/Architektur-Doku nachgezogen:
- `docs/user-manual/operations.md` (Helm Install/Upgrade/Rollback + OCI Push Ablauf).
- arc42 Kapitel 5/7/8 fuer Helm-Baustein, Deploymentfluss und Querschnittsstandards nachgefuehrt.
- Helm-README erweitert um prod-Profil, Schema, Offline-Checks und OCI Push Ablauf.

### Verifikation 2026-04-10

- `npm run test:run -- src/lib/obj25-helm-status.test.ts src/app/api/v1/helm/status/route.test.ts` erfolgreich.
- `npx eslint src/lib/obj25-helm-status.ts src/lib/obj25-helm-status.test.ts src/app/api/v1/helm/status/route.ts src/app/api/v1/helm/status/route.test.ts src/app/helm/page.tsx` erfolgreich.
- `npm run build` erfolgreich.
- `npm run typecheck` erfolgreich (nach Build, da `.next/types` benoetigt wird).
- Lokale Helm-Checks (`helm lint`, `helm template`) koennen in dieser Umgebung nicht ausgefuehrt werden, da `helm` nicht installiert ist.

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
helm/dns-management-service/
+-- Chart.yaml                    (Name, Version, AppVersion, Beschreibung)
+-- values.yaml                   (Default-Werte, alle Optionen kommentiert)
+-- values-local.yaml             (Lokales Entwicklungsprofil: kein TLS, Debug-Modus)
+-- values-internal.yaml          (Internes Testprofil: TLS optional, moderate Limits)
+-- values-prod.yaml              (Produktivprofil: TLS-Pflicht, kein Debug, enge Limits)
+-- values.schema.json            (JSON-Schema fuer Helm-Validierung)
+-- README.md                     (Install, Upgrade, Rollback Schnellstart)
+-- templates/
    +-- namespace.yaml
    +-- configmap.yaml            (OTel-Modus, Umgebungswerte)
    +-- deployment.yaml           (Image, Security Context, Ressourcen)
    +-- service.yaml
    +-- ingress.yaml              (optional, via values.ingress.enabled)
    +-- networkpolicy-default-deny.yaml   (Cilium: Default Deny)
    +-- networkpolicy-allow-required.yaml (Cilium: DNS, Metrics, Health)
    +-- _helpers.tpl              (Name-Hilfsfunktionen)
```

### Datenmodell (Values-Struktur)

```
image:
  repository: harbor.internal/dns-management/dns-service
  tag: ""          (leer = AppVersion aus Chart.yaml)
  digest: ""       (wenn gesetzt, hat Vorrang vor tag)
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 3000

ingress:
  enabled: false
  className: ""
  hostname: ""     (Pflicht wenn enabled = true, sonst Lint-Fehler)
  tls: false

otel:
  mode: local      (oder: clickhouse)
  endpoint: ""

resources:
  limits:    { cpu: 500m, memory: 256Mi }
  requests:  { cpu: 100m, memory: 128Mi }

securityContext:    (Pod-Ebene)
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000

containerSecurityContext:
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities: { drop: [ALL] }

debug: false       (values-prod.yaml: explizit false)
```

**Profil-Unterschiede (nachweislich):**

| Wert | values-local.yaml | values-prod.yaml |
|------|-------------------|------------------|
| debug | true | false |
| ingress.tls | false | true |
| resources.limits.cpu | 2000m | 500m |
| otel.mode | local | clickhouse |

### Technische Entscheidungen

**OCI Chart-Push zu Harbor:**
Helm 3.x unterstuetzt `helm push` zu OCI-Registries nativ. Der Chart wird als OCI-Artefakt in Harbor unter `oci://harbor.internal/dns-management/charts/dns-management-service` abgelegt. Damit entfaellt lokales Chart-File-Management in Zarf und Argo-CD.

**JSON-Schema-Validierung (`values.schema.json`):**
`helm lint` prueft Werte gegen das Schema und liefert Fehlermeldungen mit Zeilenangabe. Widersprüchliche Werte (z.B. `ingress.enabled: true` ohne `ingress.hostname`) werden vor dem Install/Upgrade erkannt.

**Separate Werteprofile (nicht Overlays):**
Profile sind eigenstaendige Dateien statt gestapelter Overlays. Dadurch ist für jeden Operator sofort lesbar, welche Werte in welcher Umgebung gelten — kein implizites Merging, das zu Verwechslungen fuehrt.

**Security-Defaults erzwungen im Default-`values.yaml`:**
`runAsNonRoot`, `readOnlyRootFilesystem`, `allowPrivilegeEscalation: false` und `capabilities drop ALL` sind in den Default-Werten gesetzt. Ein Operator muss aktiv davon abweichen — nicht umgekehrt.

**Airgapped-Betrieb ohne Internetabhaengigkeit:**
Alle Templates verweisen nur auf interne Registry-URLs (via `image.repository`). `helm lint` und `helm template` benoenigen keinen Internetzugang. Der Chart-Inhalt ist vollstaendig aus dem Repository reproduzierbar.

### Abhängigkeiten

- OBJ-10: Kubernetes-Basis-Manifeste, die der Chart substituiert und erweitert
- OBJ-11: OTel-Konfigurationswerte fliessen als Chart-Values ein
- OBJ-18: Harbor-Registry als Ziel fuer OCI Chart-Push
- OBJ-19: Chart als Zarf-Komponente oder via OCI-Referenz im Zarf-Paket
- OBJ-21: Argo-CD-Applications referenzieren den Chart aus Harbor

## QA Test Results

**Tested:** 2026-04-10
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Helm-Chart liegt versioniert unter `helm/dns-management-service/`
- [x] Erfuellt. Chart liegt unter `helm/dns-management-service/`.

#### AC-2: Chart enthaelt mindestens `Chart.yaml`, `values.yaml`, `templates/` und `README.md`
- [x] Erfuellt. Pflichtdateien und Templates sind vorhanden.

#### AC-3: Image-Quelle ist ueber Werte steuerbar (`repository`, `tag` oder `digest`)
- [x] Erfuellt. Image-Quelle ist ueber `values*.yaml` und Template-Helper steuerbar.

#### AC-4: Deployment, Service und Ingress sind ueber Chart-Werte steuerbar
- [x] Erfuellt. Werte und Templates fuer Deployment, Service und Ingress sind vorhanden.

#### AC-5: Security Defaults sind als sichere Voreinstellung gesetzt
- [x] Erfuellt. `runAsNonRoot`, `readOnlyRootFilesystem`, `allowPrivilegeEscalation: false` und `capabilities.drop: [ALL]` sind als Defaults gesetzt.

#### AC-6: OTel-Modus (`local`/`clickhouse`) ist per Chart-Wert konfigurierbar
- [x] Erfuellt. `otel.mode` ist in den Profilen konfigurierbar.

#### AC-7: `helm lint` und `helm template` laufen ohne Internetabhaengigkeit erfolgreich
- [ ] BUG: In dieser QA-Session konnte der Nachweis nicht erbracht werden, weil lokal kein `helm`-Binary vorhanden ist.
- [ ] BUG: In der CI-Pipeline existiert aktuell kein Helm-Lint-/Template-Job als automatisierter Nachweis.

#### AC-8: Install-/Upgrade-/Rollback-Commands sind in der Betriebsdoku dokumentiert
- [x] Erfuellt. Kommandos sind in `docs/user-manual/operations.md` und im Chart-README dokumentiert.

#### AC-9: arc42-Kapitel 5, 7 und 8 sind fuer Helm-Auswirkungen nachgezogen
- [x] Erfuellt. Die Kapitel wurden fuer Helm aktualisiert.

#### AC-10: Benutzerhandbuch (`docs/user-manual/operations.md`) ist fuer Helm-Betrieb nachgezogen
- [x] Erfuellt. Helm-Betrieb ist im Benutzerhandbuch dokumentiert.

#### AC-11: QA-Nachweis beinhaltet Helm-Smoke-Test (Install, Upgrade, Rollback, Render-Check)
- [ ] BUG: Es gibt aktuell keinen ausgefuehrten Helm-Smoke-Nachweis fuer Install, Upgrade und Rollback; vorhanden sind nur Code-/API-Tests und Dokumentationskommandos.

#### AC-12: Feature-Abschluss ist erst gueltig, wenn `docs/DEFINITION-OF-DONE-FEATURE.md` vollstaendig abgehakt ist
- [ ] BLOCKED: Finale DoD-Abnahme kann nicht erteilt werden, solange die offenen Helm-QA-Blocker bestehen.

#### AC-13: `values-prod.yaml` Profil existiert mit produktiven Sicherheitseinschraenkungen und unterscheidet sich von `values-local.yaml`
- [x] Erfuellt. `values-prod.yaml` ist vorhanden und unterscheidet sich sichtbar von `values-local.yaml` bei TLS, Debug und Ressourcen.

#### AC-14: Das Chart ist als OCI-Artefakt in eine Harbor-kompatible Registry pushbar; der Chart-Push ist Bestandteil der Release-Pipeline
- [ ] BUG: Harbor-kompatible Push-Kommandos sind dokumentiert, aber in der aktuellen GitHub Actions Pipeline gibt es keinen Schritt fuer `helm package`/`helm push`.

### Edge Cases Status

#### EC-1: Ingress aktiv ohne Hostname
- [x] Handled correctly. Schema-Validierung und `templates/validation.yaml` blockieren diesen Fall.

#### EC-2: Kein IngressClass vorhanden
- [x] Handled correctly. `ingress.className` wird bei aktiviertem Ingress erzwungen.

#### EC-3: Image-Digest fehlt oder ist ungueltig
- [ ] BUG: Ungueltige Digests werden per Schema erkannt, aber fehlende Digests werden nicht als Warnung oder Blocker sichtbar gemacht. Damit ist der Edge Case nur teilweise abgedeckt.

#### EC-4: Upgrade schlaegt fehl
- [ ] BLOCKED: Rollback-Kommandos sind dokumentiert, konnten ohne lokales `helm`-Binary und ohne Test-Cluster jedoch nicht praktisch verifiziert werden.

#### EC-5: Lokale und produktive Sicherheitsprofile werden verwechselt
- [x] Handled correctly. `values-local.yaml` und `values-prod.yaml` sind klar getrennt und in Doku/Chart nachvollziehbar.

#### EC-6: Schema-Validierung fuer benutzerdefinierte Values schlaegt fehl
- [ ] BLOCKED: Schema und Template-Validierung sind vorhanden, aber die reale `helm lint`-Ausfuehrung war in dieser Session wegen fehlendem `helm` blockiert.

#### EC-7: OCI-Chart-Push zu Harbor schlaegt in der Release-Pipeline fehl
- [ ] BUG: Dieser Fehlerpfad ist aktuell nicht automatisiert pruefbar, weil der Chart-Push in der Pipeline noch gar nicht integriert ist.

### Security Audit Results
- [x] Authentication: Die API unter `/api/v1/helm/status` verlangt eine Viewer-Session.
- [x] Authorization: Query-Parameter werden validiert und die API ist rate-limitiert.
- [x] Input validation: `runChecks`, `release` und `namespace` werden sauber validiert.
- [ ] BUG: Die UI unter `/helm` ist im Gegensatz zur API ungeschuetzt und zeigt interne Betriebsinformationen ohne Session-Pruefung an.

### Bugs Found

#### BUG-1: Helm-Offline-Checks und OCI-Chart-Push sind nicht in der Release-Pipeline verdrahtet
- **Severity:** High
- **Steps to Reproduce:**
  1. Oeffne `.github/workflows/ci.yml`.
  2. Pruefe die Jobs `quality`, `runtime-smoke` und `image-build`.
  3. Expected: Es gibt Schritte fuer `helm lint`, `helm template`, `helm package` und `helm push` in die Harbor-kompatible Registry.
  4. Actual: Die Pipeline baut Node/Docker-Artefakte, aber es gibt keine Helm-/OCI-Chart-Jobs.
- **Priority:** Fix before deployment

#### BUG-2: Helm-Smoke-Nachweis fuer Install, Upgrade und Rollback fehlt
- **Severity:** High
- **Steps to Reproduce:**
  1. Oeffne `features/OBJ-25-helm-charts.md`.
  2. Pruefe die Acceptance Criteria fuer den geforderten Helm-Smoke-Test.
  3. Suche im Repository nach ausgefuehrten Helm-Install-/Upgrade-/Rollback-Nachweisen.
  4. Expected: Ein echter QA-Nachweis oder automatisierter Report fuer Install, Upgrade, Rollback und Render-Check ist vorhanden.
  5. Actual: Vorhanden sind Dokumentationskommandos und Unit-/API-Tests, aber kein ausgefuehrter Helm-Smoke-Nachweis.
- **Priority:** Fix before deployment

#### BUG-3: Management-Sicht `/helm` ist ohne Authentifizierung aufrufbar
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Oeffne `src/app/helm/page.tsx`.
  2. Vergleiche die Seite mit `src/app/api/v1/helm/status/route.ts`.
  3. Expected: Die UI ist wie die API durch eine Session-/Rollenpruefung geschuetzt oder liefert nur unkritische oeffentliche Daten.
  4. Actual: Die Seite laedt Statusdaten direkt serverseitig, ohne sichtbare Session-Pruefung, waehrend die API explizit `requireSession(request, 'viewer')` nutzt.
- **Priority:** Fix before deployment

#### BUG-4: Fehlender Image-Digest wird nicht als Supply-Chain-Warnung sichtbar
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Oeffne `helm/dns-management-service/values-local.yaml`.
  2. Setze oder belasse `image.digest` leer.
  3. Pruefe `src/lib/obj25-helm-status.ts` auf OCI-/Statusbewertung.
  4. Expected: Fehlende Digests werden mindestens als Warnung oder Policy-Risiko sichtbar gemacht.
  5. Actual: Nur ungueltige Digest-Formate werden ueber das Schema abgefangen; ein leerer Digest erzeugt keinen sichtbaren Warnstatus.
- **Priority:** Fix in next sprint

### Blocked Checks
- Lokale Ausfuehrung von `helm lint`, `helm template`, `helm status`, `helm upgrade` und `helm rollback` war blockiert, weil in dieser Session kein `helm`-Binary installiert ist.
- Interaktive Browser-, Cross-Browser- und Responsive-Pruefung konnte in dieser Session nicht vollstaendig ausgefuehrt werden.
- `npm run build` war waehrend dieser QA-Session durch eine vorhandene `.next/lock`-Datei blockiert; dies wurde als Umgebungsblocker, nicht als fachlicher OBJ-25-Defekt gewertet.

### Summary
- **Acceptance Criteria:** 10/14 passed, 3 failed, 1 blocked
- **Bugs Found:** 4 total (0 critical, 2 high, 2 medium, 0 low)
- **Security:** Issues found
- **Production Ready:** NO
- **Recommendation:** Fix bugs first

## Deployment
_To be added by /deploy_
