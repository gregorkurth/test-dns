# OBJ-14: Release Management

## Status: In Review
**Created:** 2026-04-03
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-1: CI/CD Pipeline (Pipeline erstellt Release-Artefakte bei Tags)
- OBJ-17: SBOM & Security-Scanning (SBOM ist Pflichtbestandteil jedes Releases)
- OBJ-22: Release-Artefaktprüfung / Publish-Gate (finaler Artefaktinhalt muss freigegeben sein)
- OBJ-18: Artefakt-Registry (Harbor/Nexus-Ablage als Release-Schritt)
- OBJ-19: Zarf-Paket (Zarf-Paket als Release-Artefakt)
- OBJ-2: Dokumentation (arc42, Benutzerhandbuch, Export-Log und DoD-Nachweise)

## User Stories
- Als Entwickler möchte ich ein Release durch das Setzen eines Git-Tags (`v1.2.3`) auslösen können, damit der Release-Prozess reproduzierbar und einfach ist.
- Als Mission Network Operator möchte ich im GitLab-Release-Bereich alle Versionen mit Changelog und Download-Links finden.
- Als Platform Engineer möchte ich wissen, welche Änderungen in einem Release enthalten sind, damit ich entscheide, ob ein Update nötig ist.
- Als Entwickler möchte ich, dass der CHANGELOG automatisch aus Commit-Messages generiert wird.
- Als Platform Engineer möchte ich Release-Artefakte als signierte Artefakte herunterladen können, damit ich deren Integrität verifizieren kann.
- Als Security-Verantwortlicher möchte ich, dass jedes Release eine SBOM enthält, damit ich die Abhängigkeiten vollständig kenne.
- Als Platform Engineer möchte ich, dass Container-Images bei jedem Release in Harbor veröffentlicht werden, damit ich sie in der Zielumgebung verfügbar habe.
- Als Platform Engineer in einer Zielumgebung möchte ich ein Zarf-Paket als Bestandteil des Releases erhalten, damit ich die App ohne Internetzugang installieren kann.
- Als Nutzer moechte ich pro Release eine versionierte Update-Hinweisquelle haben, damit GUI-Hinweise und Release-Notizen konsistent sind.
- Als Dokumentationsverantwortlicher moechte ich pro Release einen exportierbaren arc42-/Handbuch-Stand fuer Confluence-Kopie erhalten, damit Offline-Zielumgebungen dieselbe Doku-Version nutzen.

## Acceptance Criteria
- [ ] Versionierung folgt SemVer (MAJOR.MINOR.PATCH)
- [ ] Git-Tags folgen dem Format `v<MAJOR>.<MINOR>.<PATCH>` (z. B. `v1.0.0`)
- [ ] `CHANGELOG.md` im Repository-Root vorhanden und aktuell
- [ ] CHANGELOG wird automatisch aus Conventional Commits generiert
- [ ] GitLab Release wird automatisch via CI/CD Pipeline (OBJ-1) bei Tag-Push erstellt
- [ ] GitLab Release enthält: Release Notes (aus CHANGELOG), Container-Image-Referenz, K8s-Manifest-Bundle als ZIP-Anhang
- [ ] Container-Image wird mit dem Release-Tag und `latest` getaggt
- [ ] Release-Artefakte werden mit cosign signiert
- [ ] Container-Image und Manifest sind OCI-konform nachweisbar (Media Types / Artifact-Inspection dokumentiert)
- [ ] Pre-Release-Versionen folgen dem Format `v1.0.0-rc.1` oder `v1.0.0-beta.1`
- [ ] SBOM wird bei jedem Release erzeugt (via `syft`) und als Release-Anhang beigefügt (OBJ-17)
- [ ] Release wird nur veröffentlicht, wenn die Prüfung des finalen Artefaktinhalts erfolgreich war und ein Prüfbericht vorliegt (OBJ-22)
- [ ] Container-Image wird nach erfolgreichen Security-Scans in Harbor veröffentlicht (OBJ-18)
- [ ] Weitere Build-Artefakte (Helm Charts, K8s-Manifeste) werden in Nexus oder Harbor abgelegt (OBJ-18)
- [ ] Zarf-Paket wird als Release-Artefakt erzeugt und dem Release zugeordnet (OBJ-19)
- [ ] Release enthaelt ein importierbares Artefakt fuer das Ziel-Gitea-Release-Projekt (Deployment-Stand)
- [ ] Das zugehoerige Konfigurationsprojekt fuer Helm-Values und Parameter ist als separates Gitea-Projekt referenziert
- [ ] Release erzeugt oder aktualisiert eine versionierte Update-Hinweisquelle im Repository (z. B. `docs/releases/UPDATE-NOTICES.json`)
- [ ] Release Notes und Update-Hinweise sind inhaltlich konsistent (Version, Kritikalitaet, Kernaenderungen)
- [ ] Release-Checkliste enthält: SBOM vorhanden, Security-Scans bestanden, Zarf-Paket verfügbar, Dokumentation aktuell
- [ ] Release-Artefakte sind vollständig dokumentiert: Versionsnummer, SHA-256-Prüfsummen, Artefakt-URLs
- [ ] Release enthaelt ein Doku-Exportpaket (arc42-Kapitel, Benutzerhandbuch, Change-Log) fuer Confluence-Kopie ohne API-Schnittstelle
- [ ] `docs/exports/EXPORT-LOG.md` wird pro Release um den Exportnachweis aktualisiert (Version, Datum, Ziel, Verantwortliche Stelle)
- [ ] Definition of Done pro Feature wird als Release-Voraussetzung geprueft (Feature fertig, Tests, QA-Nachweis, ADR/arc42, Export)

## Edge Cases
- Was passiert wenn ein Tag ohne Conventional-Commit-History gesetzt wird? → CHANGELOG zeigt "No changes documented"; Release wird trotzdem erstellt
- Was wenn ein Release rückgängig gemacht werden muss? → Patch-Version inkrementieren; keine Löschung veröffentlichter Tags
- Was wenn das Signing-Schlüsselpaar abläuft? → Schlüsselrotation-Prozess in Betriebsdoku beschrieben
- Was wenn der Zarf-Build fehlschlägt? → Release-Pipeline bricht ab; kein unvollständiges Release wird veröffentlicht
- Was wenn Harbor nicht erreichbar ist? → Pipeline-Schritt schlägt fehl; kein Release wird abgeschlossen
- Was wenn die SBOM nicht generiert werden kann? → Release wird geblockt; SBOM ist Pflichtbestandteil
- Was wenn die Artefaktprüfung interne Dateien oder Sourcemaps im Release findet? → Release wird blockiert bis das Paket bereinigt oder die Ausnahme dokumentiert ist
- Was wenn Update-Hinweise fuer ein Release fehlen? → Release gilt als unvollstaendig und wird nicht freigegeben
- Was wenn OCI-Nachweis fuer das Release-Image fehlt? → Publish-Gate blockiert bis der Nachweis nachgezogen ist
- Was wenn der Confluence-Kopienschritt (USB/Manuell) nicht bestaetigt wird? → Release bleibt im Zustand "technisch bereit, Doku-Export offen"

## Technical Requirements
- Commit-Konvention: Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- CHANGELOG-Generator: `release-please` (Google) oder `conventional-changelog-cli`
- Artefakt-Signing: cosign (Keyless oder Key-basiert)
- Primaere Git-Plattform: GitLab (Releases via GitLab Releases API); Zielumgebungs-Git: Gitea (Import des Release-Projekts + separates Konfigurationsprojekt)
- Image-Registry: Harbor (primär), Nexus für weitere Artefakte (OBJ-18)
- Offline-Paket: Zarf-CLI in Pipeline-Umgebung verfügbar; `zarf.yaml` im Repository (OBJ-19)
- SBOM-Tool: syft; Format: CycloneDX oder SPDX (OBJ-17)
- Update-Hinweisquelle: versionierte Datei im Repository, releasebezogen erzeugt/geprueft
- OCI-Compliance-Check: Nachweis fuer Manifest- und Media-Type-Konformitaet vor Publish
- Doku-Export: releasebezogene Exportpakete fuer arc42/Handbuch mit manueller Confluence-Kopie ohne direkte Schnittstelle
- Export-Nachweis: zentrales Protokoll in `docs/exports/EXPORT-LOG.md`

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
### Scope
OBJ-14 beschreibt den verbindlichen Release-Rahmen vom Tag bis zur verteilbaren Auslieferung. Der Fokus liegt auf Nachvollziehbarkeit, Sicherheitsnachweis und Offline-Transportfaehigkeit statt nur auf technischem Build-Erfolg.

Das Objekt koppelt Code-, Artefakt- und Dokumentationsstand zu einem gemeinsamen Freigabepunkt.

### Visual Tree
```text
Release Orchestration
+-- Trigger Layer
|   +-- Git Tag (SemVer / Pre-Release)
|   +-- Pipeline Start
+-- Build & Package Layer
|   +-- Container Image
|   +-- Helm / Manifest Bundles
|   +-- Zarf Package
+-- Security & Compliance Layer
|   +-- SBOM Generation
|   +-- SAST / SCA / Container / Config Scans
|   +-- OCI Conformance Check
|   +-- Signature (cosign)
+-- Documentation Layer
|   +-- CHANGELOG / Release Notes
|   +-- Update Notices
|   +-- arc42 + User Manual Export Package
|   +-- Export Log Entry
+-- Distribution Layer
|   +-- GitLab Release
|   +-- Harbor / Nexus Artifacts
|   +-- Gitea Import Package
+-- Publish Gate
    +-- DoD Checklist Complete
    +-- QA / Security Evidence Complete
    +-- Release Approved
```

### Release Data Model
Der Release-Stand wird als Satz aus zusammengehoerigen Nachweisen betrachtet:
- Version (SemVer, Kanal wie GA/Beta/RC).
- Artefakte (Image, Helm, Manifeste, Zarf) inkl. Hashes und Signatur.
- Sicherheitsnachweise (SBOM, Scan-Ergebnisse, Bewertungsentscheid).
- Dokumentationsnachweise (Release Notes, Update-Hinweise, Export-Log).
- Freigabezustand (blocked, ready, published) mit Begruendung.

### Technical Decisions
- Tag-getriebener Release-Start, weil Versionierung so eindeutig und reproduzierbar bleibt.
- Publish-Gate mit Pflichtnachweisen, weil technische Build-Erfolge ohne Security- und Doku-Vollstaendigkeit nicht ausreichen.
- OCI-Nachweis als eigenes Kriterium, weil Registry-Kompatibilitaet und Transportstabilitaet abhaengen.
- Zarf als Offline-Artefakt, weil Zielumgebungen ohne Internet versorgt werden muessen.
- GitLab als Primar-Releasequelle und Gitea-Importpaket als Zielpfad, weil Produktionsaufnahme getrennt erfolgt.
- Confluence-Export als paketierter Kopiervorgang mit Export-Log, weil keine direkte API-Verbindung vorhanden ist.

### Dependencies
- OBJ-1 fuer CI/CD-Orchestrierung
- OBJ-17 fuer SBOM und Scan-Nachweise
- OBJ-22 fuer Artefakt- und Publish-Gate
- OBJ-18 fuer Registry-Ablage
- OBJ-19 fuer Offline-Zarf-Paket
- OBJ-2 fuer arc42-/Handbuch-/Export-Log-Konsistenz

### QA Readiness
Vor Freigabe sollte pruefbar sein:
- Release laesst sich reproduzierbar aus einem Tag erzeugen.
- Pflichtartefakte inkl. Signatur und Hashes sind vollstaendig.
- SBOM/Scans/OCI-Nachweis sind vorhanden und bewertet.
- Update-Hinweise und Release Notes sind konsistent.
- Export-Log fuer Confluence-Kopie ist dokumentiert.

## QA Test Results
**Tested:** 2026-04-09
**App URL:** http://localhost:3000 (lokale Laufzeit) + Repo-/CI-Checks
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status
- [x] SemVer-Format mit `v`-Praefix wird fuer Update-Notices validiert
- [x] Versionierte Hinweisquelle `docs/releases/UPDATE-NOTICES.json` ist vorhanden und CI-geprueft
- [x] `docs/exports/EXPORT-LOG.md` ist als zentraler Export-Nachweis eingebunden
- [x] API-Endpunkt `/api/v1/releases` liefert Notice-/Summary-Daten
- [x] Release-Hinweise und GUI-Banner nutzen dieselbe Source of Truth
- [x] `check:obj14` ist lokal und in CI verdrahtet
- [x] `CHANGELOG.md` ist jetzt im Repo vorhanden
- [ ] Vollautomatischer GitLab-Tag->Release-Flow mit realem Publish-Nachweis ist noch nicht durchgaengig nachgewiesen
- [ ] Reale Signierung/OCI-/SBOM-/Security-Gates auf finalem Release-Lauf bleiben als Integrationsschritt offen
- [ ] Finale Confluence-Kopie pro Release ist weiterhin manuell und fuer `v1.0.0-beta.1` noch `pending`

### Edge Cases Status
- [x] Ungueltige oder unsortierte Versionsdaten werden durch `check:obj14` abgefangen
- [x] Fehlende Export-Log-Verknuepfungen fuer `completed`-Eintraege werden abgefangen
- [x] Hinweisquelle bleibt auch bei Beta-/Draft-Staenden konsistent lesbar

### Security Audit Results
- [x] Release-Metadaten kommen aus versionierter Git-Quelle (kein verteilter Copy-Pfad)
- [x] Integritaets-/Artefaktpflichten sind im Check und in den Artefaktfeldern verankert
- [ ] Reale Cosign/SBOM/Scan-Reports sind noch nicht als finaler Release-Nachweis durchlaufen

### Bugs Found
#### BUG-OBJ14-01: `CHANGELOG.md` fehlte als Release-Pflichtartefakt
- **Severity:** Medium
- **Steps to Reproduce:**
  1. OBJ-14 Check/Review gegen ACs laufen lassen
  2. Expected: `CHANGELOG.md` vorhanden
  3. Actual (vor Fix): Datei fehlte
- **Fix:** `CHANGELOG.md` angelegt und mit aktuellen Versionen befuellt
- **Priority:** Fix before deployment

### Summary
- **Acceptance Criteria:** 7 Kernkriterien bestanden, 3 Integrations-/Betriebskriterien offen
- **Bugs Found:** 1 total (0 Critical, 0 High, 1 Medium, 0 Low) - behoben
- **Security:** Pass fuer aktuellen Repo-/Check-Scope
- **Production Ready:** NO (finale Release-Automation und reale Publish-/Export-Nachweise noch offen)
- **Recommendation:** Nach realem Tag/Publish-Lauf inkl. Signierung und Export-Protokoll erneut `/qa` ausfuehren

## Implementation Update
- Versionierte Release-Hinweisquelle unter `docs/releases/UPDATE-NOTICES.json` eingefuehrt.
- Repo-Check `npm run check:obj14` validiert SemVer, Update-Hinweise, OCI-/Doku-Pfad und Export-Log-Verknuepfung.
- API-Endpunkt `/api/v1/releases` und eine kompakte Startseiten-Sicht fuer aktuelle Update-Hinweise ergaenzt.
- CI fuehrt den OBJ-14-Check im Quality Gate und im tag-basierten Release Gate aus.

## Deployment
### Deployment-Status (Stand: 2026-04-11)
- Auslieferung erfolgt Git-first ueber Branch/PR/Merge nach `main`.
- Release- und Export-Nachweise werden in `docs/releases/` und `docs/exports/EXPORT-LOG.md` dokumentiert.
- Confluence bleibt Sekundaerziel: Export erst nach gepflegter Git-Dokumentation.
- Falls **Production Ready: NO** gilt, bleibt das Deployment als vorbereitet markiert und wird erst nach Freigabe produktiv ausgerollt.
