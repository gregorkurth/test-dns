# OBJ-17: SBOM & Security-Scanning

## Status: In Review
**Created:** 2026-04-03
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-1: CI/CD Pipeline (Pipeline erzeugt SBOM und fuehrt Security-Scans durch)
- OBJ-14: Release Management (Release enthaelt Security-Nachweise als Pflichtbestandteil)
- OBJ-22: Release-Artefaktpruefung / Publish-Gate (Security-Gate entscheidet ueber Freigabe)
- OBJ-18: Artefakt-Registry (Security-Artefakte werden in GHCR/Harbor/Nexus archiviert)
- OBJ-19: Zarf-Paket / Offline-Weitergabe (Offline-Scanner-Datenbank wird transportiert)
- OBJ-16: Maturitaetsstatus / Reifegraduebersicht (Security-Status wird sichtbar gemacht)

## User Stories
- Als Security-Verantwortlicher moechte ich pro releasefaehiger Version eine vollstaendige SBOM sehen, damit Abhaengigkeiten transparent und revisionssicher nachvollziehbar sind.
- Als Security-Verantwortlicher moechte ich, dass SAST-, SCA-, Container- und Konfigurations-Scans standardisiert pro Build/Release laufen, damit Risiken frueh erkannt werden.
- Als Release Manager moechte ich einen klaren Security-Gate-Entscheid (pass/fail/accepted-risk), damit Releases nur mit dokumentierter Risikolage freigegeben werden.
- Als Auditor moechte ich versionsbezogene Security-Nachweise inklusive Scan-Metadaten und Entscheidungsprotokoll einsehen, damit Compliance-Pruefungen ohne Medienbruch moeglich sind.
- Als Plattform-Team moechte ich dieselbe Security-Pruefung online und offline fahren koennen, damit airgapped Releases gleichwertig abgesichert sind.
- Als Betreiber moechte ich Security-Artefakte in einer OCI-faehigen Registry (GHCR oder internes Pendant) finden, damit Betrieb und Incident-Analyse konsistent bleiben.
- Als Produktverantwortlicher moechte ich den Security-Reifegrad im Dashboard sehen, damit der Auslieferungsstatus fuer Nicht-Entwickler transparent bleibt.

## Acceptance Criteria
- [ ] Pro Release Candidate und finalem Release wird eine SBOM erstellt und versioniert abgelegt.
- [ ] Die SBOM umfasst direkte und transitive Abhaengigkeiten aus Application-Layern und Runtime-Base-Image.
- [ ] Die SBOM wird in mindestens einem Standardformat (CycloneDX oder SPDX) bereitgestellt.
- [ ] SAST-Scans sind fuer Build-Pipelines verpflichtend und liefern maschinenlesbare Ergebnisse.
- [ ] SCA-Scans sind fuer Build-Pipelines verpflichtend und erfassen bekannte Paket-Schwachstellen.
- [ ] Container-Scans pruefen das finale OCI-Image auf Digest-Basis vor Release-Freigabe.
- [ ] Konfigurationsscans pruefen Kubernetes-Manifeste und Helm Charts vor Release-Freigabe.
- [ ] Kritische Findings blockieren den Publish-Gate (OBJ-22), bis eine dokumentierte Fix- oder Accept-Entscheidung vorliegt.
- [ ] High-Findings erfordern eine dokumentierte Risikoentscheidung mit Verfallsdatum und Owner.
- [ ] Security-Artefakte werden pro Version als Release-Anhang und in einer OCI-faehigen Registry archiviert (GHCR oder internes Pendant).
- [ ] Offline-Betrieb ist moeglich: Ein Offline-Scanner-DB-Snapshot ist fuer airgapped Releases verfuegbar.
- [ ] Der Gate-Entscheid enthaelt den DB-Stand (Zeitpunkt/Version), damit die Aussagekraft der Scans nachvollziehbar bleibt.
- [ ] Security-Ergebnisse sind im Maturitaetsstatus (OBJ-16) sichtbar: SBOM vorhanden, Scan-Status, offene kritische Findings, Gate-Status.
- [ ] Fuer jedes Release gibt es eine eindeutige Verknuepfung zwischen Version, Scan-Bundle und Freigabeentscheid.

## Edge Cases
- Was passiert bei kritischem Finding kurz vor Release? -> Release bleibt gesperrt, bis Fix oder formale Risikoakzeptanz dokumentiert ist.
- Was passiert, wenn die SBOM unvollstaendig wirkt? -> Gate bewertet den Nachweis als nicht bestanden und fordert erneute Erzeugung.
- Was passiert in airgapped Umgebungen ohne aktuelle Online-Feeds? -> Offline-DB-Snapshot wird genutzt und im Report als Datenbasis ausgewiesen.
- Was passiert bei veraltetem Offline-DB-Snapshot? -> Gate markiert Ergebnis als eingeschraenkt oder fail gemaess Security-Policy.
- Was passiert bei wiederkehrenden False Positives? -> Begruendete Ausnahme wird versionsbezogen dokumentiert und periodisch erneut geprueft.
- Was passiert bei Registry-Ausfall? -> Release darf nicht als vollstaendig markiert werden, solange Security-Artefakte nicht archiviert sind.
- Was passiert bei mehreren Ziel-Registries (GHCR + intern)? -> Ein primarer Nachweis reicht fuer Gate-Pass, Spiegelung wird separat nachverfolgt.
- Was passiert bei Nicht-Release-Builds? -> Ergebnisse werden als Vorab-Feedback angezeigt, blockieren aber keinen offiziellen Release ohne Gate-Lauf.

## Technical Requirements
- Die Loesung arbeitet mit OCI-konformen Images und Digest-basierter Nachweisfuehrung.
- SBOM-Nachweise werden standardisiert als CycloneDX oder SPDX pro Version bereitgestellt.
- Security-Scans decken Code, Dependencies, Container und Deployment-Konfiguration ab.
- Security-Ergebnisse sind maschinenlesbar und revisionssicher archivierbar.
- Release-Freigabe ist an einen formalen Security-Gate gekoppelt (OBJ-22).
- Security-Artefakte werden in Release-Unterlagen und in OCI-Registry-Storage (GHCR/Harbor/Nexus) abgelegt.
- Offline-Scanning wird ueber einen versionierten Trivy-DB-Snapshot unterstuetzt, der mit dem Release transportiert werden kann.
- Ausnahmeentscheidungen (Accept Risk) benoetigen Owner, Begruendung und Verfallsdatum.
- Security-Status wird in der Reifegradsicht (OBJ-16) sichtbar und fuer Management auswertbar.

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
### Scope
**In Scope**
- Einheitlicher Security-Nachweis pro Release: SBOM, Scan-Ergebnisse, Gate-Entscheid.
- Verbindlicher Security-Gate fuer Release-Freigabe in Zusammenspiel mit OBJ-14 und OBJ-22.
- Online- und Offline-faehiger Scan-Prozess inklusive Trivy-DB-Snapshot fuer airgapped Nutzung.
- Registry-Ablage der Security-Artefakte (GHCR oder interne OCI-Registry).
- Management-sichtbarer Security-Status fuer OBJ-16.

**Out of Scope**
- Laufzeit-Policy-Enforcement im Cluster (separate Features fuer OPA/Cilium/Tetragon).
- Vollstaendige Incident-Response-Automation.
- Ersatz des gesamten CI/CD-Frameworks.

### Visual Tree
```text
Release Security Flow (OBJ-17)
+-- Input Layer
|   +-- Source Snapshot (Version/Commit)
|   +-- Container Image (OCI Digest)
|   +-- Deployment Config (Helm/K8s)
|   +-- Scan Policy Profile (Severity/Gate Rules)
+-- Analysis Layer
|   +-- SBOM Generation
|   +-- SAST Scan
|   +-- Dependency Scan
|   +-- Container Scan
|   +-- Config Scan
+-- Decision Layer
|   +-- Findings Aggregation
|   +-- Exception Validation (Accept Risk)
|   +-- Release Gate Decision (Pass/Fail/Conditional)
+-- Evidence Layer
|   +-- Release Attachments (Scan Bundle)
|   +-- OCI Registry Archive (GHCR/Internal)
|   +-- Export/Trace Link for Audit
+-- Visibility Layer
    +-- Maturitaetsstatus (OBJ-16)
    +-- Release View (OBJ-14)
```

### Data Model (plain language)
- **Release Security Profile:** Definiert, welche Scans fuer einen Release-Typ verpflichtend sind.
- **SBOM Artifact:** Enthaltene Abhaengigkeiten, Erstellungszeitpunkt, Quelle, zugeordnete Version.
- **Scan Run:** Einzelner Prueflauf mit Typ (SAST/SCA/Container/Config), Ergebnisstatus und Zeitstempel.
- **Finding Summary:** Aggregierte Anzahl Findings pro Severity und Scan-Typ.
- **Exception Record:** Dokumentierte Risikoakzeptanz mit Begruendung, Owner und Ablaufdatum.
- **Gate Decision Record:** Finale Freigabeentscheidung inkl. Verweis auf alle Nachweise.
- **Offline DB Snapshot Record:** Herkunft, Versionsstand und Alter der verwendeten Offline-Datenbank.

### Technical Decisions
- **Ein Security-Bundle pro Release:** Erhoeht Auditierbarkeit und vereinfacht Release-Freigaben fuer Fach- und Betriebsrollen.
- **Digest-basierte Container-Pruefung:** Verhindert, dass ein anderes Image als das gepruefte Image ausgerollt wird.
- **Gate nach Severity und Ausnahmeprozess:** Schafft klare, wiederholbare Regeln statt Ad-hoc-Entscheidungen.
- **Duale Ablage (Release + OCI-Registry):** Reduziert Risiko von Nachweisverlust und unterstuetzt Offline-Importwege.
- **Offline-First-Unterstuetzung:** Airgapped Betriebsmodell bleibt ohne Sicherheitsluecke nutzbar.
- **Management-Transparenz in OBJ-16:** Security-Status wird nicht nur technisch, sondern auch steuerbar sichtbar.

### Dependencies
- **Prozessabhaengigkeiten:** OBJ-1 (CI), OBJ-14 (Release-Steuerung), OBJ-22 (Publish-Gate), OBJ-18 (Registry), OBJ-19 (Offline-Transport), OBJ-16 (Statussicht).
- **Werkzeugabhaengigkeiten:** Syft (SBOM), Trivy (SCA/Container/Config), Semgrep (SAST), npm audit (Node-Dependency-Pruefung).
- **Ablageabhaengigkeiten:** Git Release-Artefakte und OCI-Registry (GHCR oder internes Pendant wie Harbor/Nexus).

### QA Readiness
- **Abnahmekriterium 1:** Fuer ein Test-Release liegen SBOM und alle verpflichtenden Scan-Reports vor.
- **Abnahmekriterium 2:** Ein absichtlich provoziertes kritisches Finding blockiert den Gate nachweisbar.
- **Abnahmekriterium 3:** Ein dokumentierter Accept-Risk-Fall wird mit Ablaufdatum und Owner korrekt dargestellt.
- **Abnahmekriterium 4:** Offline-Scan mit bereitgestelltem DB-Snapshot liefert reproduzierbares Ergebnis.
- **Abnahmekriterium 5:** Security-Status erscheint in der Maturitaetssicht inklusive Gate-Status.
- **Abnahmekriterium 6:** Audit-Trace von Release-Version zu Security-Bundle ist ohne Medienbruch nachvollziehbar.

## Implementation Update (Backend + Frontend)
- **Datum:** 2026-04-10
- **Backend/API:** OBJ-17 Loader in `src/lib/obj17-security-scanning.ts` umgesetzt und als API unter `/api/v1/security/scans` bereitgestellt (Auth-Schutz `viewer+`, Filter `version/channel/limit`).
- **Artefaktstruktur:** Versionierte Security-Bundles als Source-of-Truth in `docs/releases/SECURITY-SCAN-BUNDLES.json` eingefuehrt.
- **Frontend/GUI:** Management-Lesesicht unter `/security-posture` umgesetzt (`src/app/security-posture/page.tsx`, `src/components/obj17-security-overview.tsx`) mit SBOM-, Scan-, Gate- und Offline-Status.
- **Legacy-Cleanup:** Legacy-Pfad (`/security`, `/api/v1/security`, `security-artifacts/INDEX.json`) wurde entfernt; Primaerpfad ist ausschliesslich `/security-posture` und `/api/v1/security/scans`.
- **Checks:** Repro-Check `npm run check:obj17` in `scripts/check-obj17-security-scanning.mjs` erstellt.
- **CI:** `check:obj17` in `.github/workflows/ci.yml` in Quality- und Release-Gate-Lauf integriert.
- **Integration OBJ-16:** Security-Kennzahlen werden in der Maturity-Sicht aus dem OBJ-17 Loader referenziert.

## QA Test Results (Re-Test 2026-04-10)

**Tested:** 2026-04-10
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Executed Checks
- `npm run check:obj17` -> bestanden (2 Bundles validiert, Policy-Checks bestanden)
- `npm run test:run -- src/lib/obj17-security-scanning.test.ts src/app/api/v1/api-v1.test.ts` -> bestanden
- `npm run test:run -- src/lib/obj16-maturity.test.ts` -> bestanden
- `npm run build` -> bestanden; Routen `/security-posture` und `/api/v1/security/scans` generiert
- `npm run lint` -> bestanden
- `npm run typecheck` -> bestanden
- Dateisystem-Checks: `artifacts/security/` existiert mit Bundles fuer v1.0.0-beta.1 und v0.9.0

### Acceptance Criteria Status

#### AC-1: SBOM pro Release versioniert abgelegt
- [x] PASS - FIXED seit letzter QA. SBOM-Dateien existieren jetzt unter `artifacts/security/v1.0.0-beta.1/sbom.spdx.json` und `artifacts/security/v0.9.0/sbom.spdx.json`. `check:obj17` validiert Pfad-Existenz.

#### AC-2: SBOM umfasst direkte und transitive Abhaengigkeiten
- [ ] BUG: Die SBOM-Datei (327 Bytes) enthaelt nur den SPDX-Header und `creationInfo`, aber kein `packages`-Array. Es handelt sich um einen Stub, nicht um eine reale Abhaengigkeitsliste. Weder Application-Layer- noch Base-Image-Abhaengigkeiten sind enthalten.

#### AC-3: SBOM in Standardformat (CycloneDX oder SPDX)
- [x] PASS (teilweise) - Dateiformat ist SPDX-2.3 JSON mit korrektem Header. Inhaltlich ist die SBOM aber ein Stub (siehe AC-2).

#### AC-4: SAST-Scans verpflichtend in Pipeline
- [x] PASS - FIXED seit letzter QA. `release-gate` Job enthaelt "SAST Scan (Semgrep)" Schritt mit SARIF-Output. Lokaler Nachweis `semgrep.sarif` existiert (209 Bytes, leeres Ergebnis-Array).

#### AC-5: SCA-Scans verpflichtend in Pipeline
- [x] PASS - FIXED seit letzter QA. `release-gate` Job enthaelt "SCA Scan (npm audit)" Schritt mit JSON-Output. Lokaler Nachweis `npm-audit.json` existiert.

#### AC-6: Container-Scan auf Digest-Basis
- [x] PASS - FIXED seit letzter QA. `release-gate` Job enthaelt "Container Scan by Digest (Trivy)" mit `image-ref: ghcr.io/.../...@${{ needs.image-build.outputs.image-digest }}`. Lokaler Nachweis `trivy-image.json` existiert.

#### AC-7: Konfigurationsscans fuer K8s-Manifeste und Helm Charts
- [x] PASS - FIXED seit letzter QA. `release-gate` Job enthaelt "Config Scan (Trivy)" mit `scan-type: config`. Lokaler Nachweis `trivy-config.json` existiert.

#### AC-8: Kritische Findings blockieren Publish-Gate
- [x] PASS - `check:obj17` erzwingt bei `criticalOpen > 0` einen `fail`-Gate-Status.

#### AC-9: High-Findings erfordern dokumentierte Risikoentscheidung
- [x] PASS - Bundle-Schema und Check erzwingen `acceptedRiskExpiresAt` und `owner` bei `accepted-risk`. Fuer v1.0.0-beta.1 nachgewiesen.

#### AC-10: Security-Artefakte als Release-Anhang und in OCI-Registry
- [x] PASS (strukturell) - FIXED seit letzter QA. `release-gate` Job erzeugt Security-Evidence und laedt sie als GitHub Artifact hoch (`security-evidence-${{ github.ref_name }}`). OCI-Registry-Referenz ist im Bundle dokumentiert. Realer Upload-Nachweis nur via CI-Lauf moeglich.

#### AC-11: Offline-Scanner-DB-Snapshot verfuegbar
- [x] PASS - FIXED seit letzter QA. Offline-Snapshot-Dateien existieren unter `artifacts/security/offline/trivy-db-2026-04-09.tar.zst` und `trivy-db-2026-04-06.tar.zst`. `check:obj17` validiert Pfad-Existenz.

#### AC-12: Gate-Entscheid enthaelt DB-Stand
- [x] PASS - `dbSnapshotVersion` und `dbSnapshotUpdatedAt` in Datenmodell, API und GUI.

#### AC-13: Security-Ergebnisse in OBJ-16 sichtbar
- [x] PASS - OBJ-16 liest `getObj17SecuritySummary()` ein. Die neuen KPI-Cards in OBJ-16 zeigen SBOM, Scan-Status, Gate und Findings.

#### AC-14: Eindeutige Verknuepfung Version/Scan-Bundle/Freigabe
- [x] PASS - `check:obj17` gleicht Versionen zwischen Release-Notices und Security-Bundles ab.

### Edge Cases Status

#### EC-1: Kritisches Finding kurz vor Release
- [x] Handled - Gate wird auf `fail` gesetzt wenn `criticalOpen > 0`.

#### EC-2: SBOM wirkt unvollstaendig
- [ ] BUG: SBOM-Vollstaendigkeitspruefung fehlt. Der Check prueft nur `sbom.available === true` und Pfad-Existenz, validiert aber nicht, ob die SBOM-Datei ein `packages`-Array enthaelt.

#### EC-3: Airgapped Umgebung ohne Online-Feeds
- [x] PASS - FIXED. Offline-DB-Snapshots sind jetzt physisch vorhanden. Staleness-Check implementiert.

#### EC-4: Veralteter Offline-DB-Snapshot
- [x] PASS - FIXED seit letzter QA. `check:obj17` prueft `ageInDaysFromNow(dbSnapshotTimestamp)` gegen `maxOfflineDbAgeDays` (Default: 14). Zu alter Snapshot verursacht Fehler.

#### EC-5: Wiederkehrende False Positives
- [x] Teilweise abgedeckt - `decisionRef`, Owner und Ablaufdatum vorhanden. Periodische Revalidierung nicht automatisiert.

#### EC-6: Registry-Ausfall
- [x] Teilweise abgedeckt - `check:obj17` erzwingt `releaseAttachment === true` und `ociRegistryReference` als Metadatum. Echter Connectivity-Check fehlt.

#### EC-7: Mehrere Ziel-Registries
- [ ] Nicht getestet - Datenmodell hat nur einen `ociRegistryReference`. Fuer Multi-Registry muesse es erweitert werden.

#### EC-8: Nicht-Release-Builds
- [x] Handled - Quality-Checks laufen bei jedem Push; Release-Gate nur bei `refs/tags/v*`.

### Security Audit Results
- [x] Authentication: `GET /api/v1/security/scans` liefert 401 ohne Token (API-Test nachgewiesen).
- [x] Authorization: Viewer-Rolle darf lesen, kein Schreibzugriff.
- [x] Input Validation: Ungueltiger `channel` -> 422 `INVALID_SECURITY_CHANNEL`. Ungueltiger `limit` -> 422 `INVALID_SECURITY_LIMIT`.
- [x] Sensitive Data: Keine Secrets in API-Antworten.
- [x] Rate Limiting: `enforceRateLimit` aktiv.
- [x] XSS: Kein `dangerouslySetInnerHTML` im OBJ-17-UI-Code.

### Bugs Found

#### BUG-1: SBOM-Dateien sind Stubs ohne reale Abhaengigkeitslisten
- **Severity:** High
- **Steps to Reproduce:**
  1. Oeffne `artifacts/security/v1.0.0-beta.1/sbom.spdx.json`.
  2. Expected: SPDX-Dokument mit `packages`-Array, das direkte und transitive Abhaengigkeiten listet.
  3. Actual: Nur SPDX-Header (327 Bytes) ohne `packages`. Selbes Problem bei v0.9.0.
- **Priority:** Fix before deployment. Die SBOM muss mit echtem `syft` oder vergleichbarem Tool erzeugt werden.

#### BUG-2: SBOM-Vollstaendigkeitspruefung fehlt im Check-Script
- **Severity:** Medium
- **Steps to Reproduce:**
  1. `check:obj17` prueft nur `sbom.available === true` und Pfad-Existenz.
  2. Expected: Pruefung, ob SBOM-Datei valides SPDX mit mindestens einem Package enthaelt.
  3. Actual: Leere/Stub-SBOMs werden akzeptiert.
- **Priority:** Fix before deployment.

#### BUG-3: Scan-Report-Dateien sind Stubs mit leeren Ergebnissen
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Oeffne `artifacts/security/v1.0.0-beta.1/semgrep.sarif` (209 Bytes).
  2. Expected: Echter SARIF-Report mit Scan-Ergebnissen oder dokumentierter Clean-Run.
  3. Actual: Stub mit leerem `results`-Array. Selbes Muster fuer npm-audit.json, trivy-config.json, trivy-image.json.
- **Priority:** Fix before deployment. Die Stubs genuegen fuer die Struktur, aber nicht fuer einen echten Sicherheitsnachweis. Muss durch einen realen CI-Lauf ersetzt werden.

#### BUG-4: Offline-DB-Snapshot ist ein Platzhalter
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Pruefe `artifacts/security/offline/trivy-db-2026-04-09.tar.zst` (53 Bytes).
  2. Expected: Trivy-Datenbank-Snapshot fuer Offline-Scanning (>= 1 MB, echtes tar.zst-Archiv).
  3. Actual: 53-Byte-Platzhalter, kein echtes Archiv.
- **Priority:** Fix before deployment.
- **CI-Abhaengigkeit:** Kann nur durch einen echten CI-Release-Gate-Lauf (Git-Tag `v*` pushen) behoben werden. Der Workflow laedt den Trivy-DB-Snapshot automatisch herunter und legt ihn unter `artifacts/security/offline/` ab. Das Check-Script gibt ab sofort eine WARN-Meldung aus, solange die Datei kleiner als 1 MB ist.

### Regression Testing
- [x] OBJ-17 Route- und Datenmodelltests laufen erfolgreich.
- [x] OBJ-16 Reifegradtests laufen ohne Regression.
- [x] Gesamt-Build, Lint und Typecheck bestehen.

### Summary
- **Acceptance Criteria:** 12/14 passed, 1 failed (AC-2: SBOM-Inhalt), 1 partial pass (AC-3: Format korrekt, Inhalt Stub)
- **Bugs Found:** 4 total (0 critical, 1 high, 3 medium)
- **Security:** Pass (API-Schutz korrekt)
- **Production Ready:** NO
- **Recommendation:** Die Strukturen und Workflows sind korrekt aufgebaut und die vorherigen High-Severity-Bugs (fehlende Artefakte, fehlende Pipeline-Schritte, fehlende Staleness-Pruefung) wurden behoben. Das verbleibende Problem ist, dass alle Security-Artefakte Stubs/Platzhalter sind statt echter Scan-Ergebnisse. Ein realer CI-Lauf mit Tag-Release muss ausgefuehrt werden, um echte Artefakte zu erzeugen. Nach dem ersten echten Release-Gate-Lauf sollte `/qa` erneut ausgefuehrt werden.

## Deployment
_To be added by /deploy_
