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

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
