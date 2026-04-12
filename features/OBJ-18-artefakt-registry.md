# OBJ-18: Artefakt-Registry (Harbor / Nexus)

## Status: In Review
**Created:** 2026-04-03
**Last Updated:** 2026-04-10

## Dependencies
- OBJ-1: CI/CD Pipeline (Pipeline pusht Images und Artefakte in die Registry)
- OBJ-17: SBOM & Security-Scanning (Security-Ergebnisse werden in der Registry archiviert)
- OBJ-22: Release-Artefaktprüfung / Publish-Gate (nur freigegebene Artefakte werden veröffentlicht)
- OBJ-19: Zarf-Paket (Zarf liest Artefakte aus der Registry für den Offline-Export)
- OBJ-25: Helm Charts (Chart-Versionen werden als Release-Artefakte geführt)

## User Stories
- Als Platform Engineer möchte ich Container-Images in Harbor verwalten, damit ich eine klare, versionierte Übersicht aller bereitgestellten Images habe.
- Als Platform Engineer möchte ich weitere Artefakte (Helm Charts, K8s-Manifeste, SBOMs, Security-Reports) in Nexus oder Harbor ablegen, damit alle Release-Bestandteile zentral verfügbar sind.
- Als Operator in einer Zielumgebung möchte ich aus dem Zarf-Paket definierte Artefaktlisten entnehmen können, damit ich genau weiss, welche Images ins Paket einfliessen.
- Als Entwickler möchte ich sicherstellen, dass Container-Images erst nach bestandenen Security-Scans in Harbor veröffentlicht werden, damit keine unsicheren Images in die Registry gelangen.
- Als Platform Engineer möchte ich Artefakten eindeutige Versionen und Herkunftsangaben zuordnen, damit ich jederzeit nachvollziehen kann, aus welchem Build ein Artefakt stammt.
- Als Security-Verantwortlicher möchte ich je Release eine prüfbare Verbindung zwischen Image-Digest, SBOM und Security-Gate sehen, damit Freigaben auditierbar sind.
- Als Release Manager möchte ich zwischen Primär-Registry (intern) und optionalem Spiegelziel unterscheiden können, damit der Airgap-Transport planbar bleibt.

## Acceptance Criteria
- [ ] Harbor ist die einzige zulässige produktive Primär-Registry; andere Registries (z.B. GHCR) dürfen als Build-Staging-Target verwendet werden, gelten aber nicht als erfüllte Harbor-Anforderung
- [ ] Container-Images werden in Harbor nach jedem erfolgreichen Build auf `main` oder bei Release-Tags gespeichert; der Push-Nachweis (Digest, Timestamp) ist im Release-Protokoll festgehalten
- [ ] Images werden mit Git-SHA und Git-Tag getaggt (z.B. `image:sha-abc123`, `image:v1.2.0`, `image:latest`)
- [ ] Container-Images und Push/Distribution sind OCI-konform (Open Container Initiative)
- [ ] Container-Images werden erst nach bestandenen Security-Scans (OBJ-17) in Harbor veröffentlicht; Artefakte mit `publishState = pending` zählen nicht als "published after gate" — die Kennzahl umfasst ausschliesslich Artefakte mit echtem Publish-Nachweis
- [ ] Weitere Release-Artefakte (Helm Charts, K8s-Manifest-Bundles, SBOMs, Security-Reports) werden in Nexus oder Harbor abgelegt; lokale `docs/`- oder `artifacts/`-Pfade gelten nicht als Registry-Ablage
- [ ] Publishbare Artefakte werden nur nach erfolgreicher Artefaktprüfung veröffentlicht; der Prüfbericht ist mit Artefakt oder Release verknüpft (OBJ-22)
- [ ] Jedes Container-Image-Artefakt trägt einen nicht-null SHA256-Digest sowie: Versionsnummer, Build-Datum, Git-SHA, Build-Pipeline-Link
- [ ] Zugangsdaten für Harbor und Nexus werden als CI/CD-Secrets verwaltet (nie im Repository)
- [ ] Artefakt-Liste für Zarf-Export ist definiert und gepflegt: welche Images und Dateien ins Zarf-Paket einfliessen (OBJ-19)
- [ ] Alte Artefakte werden nach einer konfigurierbaren Retention-Policy bereinigt; die Policy ist in Harbor/Nexus konfiguriert (nicht nur beschrieben) und der aktive Zustand ist in `docs/` nachvollziehbar
- [ ] Harbor/Nexus-Konfiguration (Projects, Policies, Repositories) ist als Infrastructure-as-Code oder als verifizierbares Runbook dokumentiert; ein neuer Operator kann die Registry damit ohne Vorkenntnisse aufsetzen
- [ ] Release-Tags sind immutable; nur `latest` oder definierte Rolling-Tags dürfen überschrieben werden
- [ ] Security-Artefakte (SBOM, Scan-Reports, Gate-Entscheid) sind als OCI-/Repository-Artefakte referenzierbar und mit dem Image-Digest verknüpft; die Verknüpfung ist maschinell verifizierbar
- [ ] Für jedes tatsächlich veröffentlichte Artefakt ist der Nachweis `published only after gate` im Release-Protokoll nachvollziehbar; Pending-Artefakte dürfen diese Kennzahl nicht erhöhen
- [ ] Die Registry-API und -Lesesicht geben keine internen Dateisystempfade (`docs/`, `artifacts/`) als Registry-Einträge aus; Artefakte ausserhalb der Registry werden eindeutig als "lokaler Nachweis" oder "ausstehend" gekennzeichnet

## Edge Cases
- Was wenn Harbor nicht erreichbar ist? → Pipeline-Schritt schlägt fehl; kein Image wird deployt; Fehler klar gemeldet
- Was wenn ein Image-Push fehlschlägt (Speicherplatz, Netzwerk)? → Pipeline schlägt fehl; kein Release wird abgeschlossen
- Was wenn ein Artefakt mit demselben Tag bereits existiert? → Überschreiben nur für `latest` erlaubt; versionierte Tags sind immutable
- Was wenn Zugangsdaten abgelaufen sind? → Pipeline schlägt mit klarem Authentifizierungsfehler fehl; Alert an Betreiber
- Was wenn ein Artefakt die Security-Scans besteht, aber an der Artefaktprüfung scheitert? → Kein Publish; Artefakt bleibt unveröffentlicht bis der Paketinhalt bereinigt ist
- Was wenn Harbor in der Zielumgebung eine andere Version hat? → Kompatibilitätshinweise in `docs/operations.md`
- Was wenn mehrere Registries unterschiedliche Inhalte zeigen? → Primärquelle ist fest definiert; Spiegelung hat eigenen Status und beeinflusst den Primär-Gate nicht rückwirkend
- Was wenn Digest und Tag nicht zusammenpassen? → Publish wird blockiert; Artefakt gilt als inkonsistent und nicht release-fähig
- Was wenn ein Artefakt als `published` angezeigt wird, aber der Digest in der Registry fehlt? → Lesesicht muss diesen Zustand als "Metadaten unvollständig" ausweisen; das Artefakt gilt nicht als korrekt nachgewiesen

## Technical Requirements
- Container-Registry: Harbor (primär, OCI-kompatibel)
- Artefakt-Repository: Nexus Repository Manager (für Helm Charts, NPM-Pakete, Maven-Artefakte etc.) oder Harbor OCI-Artefakte
- Image-Tagging: Git-SHA (immer) + Git-Tag (bei Release) + `latest` (bei `main`-Merge)
- OCI-Spezifikation: Image-Manifeste und Media Types muessen OCI-Spec-konform sein
- Zugangsdaten: CI/CD-Secrets (GitLab CI Variables / GitHub Actions Secrets)
- Retention Policy: Konfigurierbar (z.B. letzte 10 Tags pro Repository behalten, `latest` immer)
- Zarf-Artefaktliste: In `zarf.yaml` definiert; muss mit tatsächlichen Registry-Pfaden übereinstimmen (OBJ-19)
- Auditierbarkeit: Pro Artefakt sind Pipeline-Lauf, Digest, Security-Gate-Referenz und Release-Referenz verknüpft
- Betriebsmodell: Primär intern (Harbor/Nexus), optionales Spiegelziel für vorgelagerte Entwicklungs- oder Testflüsse

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
### Scope
In Scope:
- Einheitliche Registry-Architektur für Images und Release-Artefakte (Harbor primär, Nexus/Harbor ergänzend).
- Nachvollziehbarer Publish-Flow: Build -> Security/Gate -> Publish -> Retention.
- Verknüpfung von Artefakten mit Release- und Compliance-Nachweisen.

Out of Scope:
- Laufzeit-Deployment auf Zielcluster (OBJ-20/OBJ-21).
- Fachliche Änderungen an DNS-Funktionen.
- Ersatz aller bestehenden CI-Systeme.

### Component Structure (Visual Tree)
```text
Registry Supply Chain (OBJ-18)
+-- Build Sources
|   +-- Container Image Output
|   +-- Helm/K8s Bundle Output
|   +-- SBOM + Security Reports
+-- Gate Layer
|   +-- OBJ-17 Security Gate
|   +-- OBJ-22 Artifact Gate
+-- Publish Layer
|   +-- Harbor Project (Primary OCI)
|   +-- Nexus/Harbor Artifact Repository
|   +-- Optional Mirror Registry
+-- Governance Layer
|   +-- Tag/Immutability Rules
|   +-- Retention Policies
|   +-- Access Control + Secrets
+-- Consumers
    +-- OBJ-19 Zarf Packaging
    +-- OBJ-20 Target Import
    +-- Operations/Audit Views
```

### Data Model (plain language)
- **Artifact Record:** Typ (Image/Chart/Bundle), Version, Digest, Registry-Pfad.
- **Provenance Record:** Build-Zeitpunkt, Pipeline-Lauf, Git-SHA, Release-Referenz.
- **Security Linkage:** SBOM-Referenz, Scan-Ergebnis-Referenz, Gate-Entscheid.
- **Lifecycle Record:** Veröffentlichungsstatus, Retention-Klasse, Ablaufdatum.

### Technical Decisions
- Harbor ist primär, weil OCI-konforme Images und Artefakte einheitlich geführt werden können.
- Publish erfolgt erst nach Gate, damit Sicherheits- und Compliance-Entscheide verbindlich sind.
- Immutable Release-Tags reduzieren Risiko stiller Überschreibungen.
- Retention wird regelbasiert statt manuell geführt, um Storage und Risiko kontrollierbar zu halten.
- Ein klares Primär-/Spiegelmodell verhindert widersprüchliche "Source of Truth"-Situationen.

### Dependencies and Interfaces
- OBJ-1 liefert die Pipeline-Orchestrierung.
- OBJ-17 liefert Security-Nachweise und Gate-Signale.
- OBJ-22 bestätigt den finalen Publish-Gate.
- OBJ-19 konsumiert veröffentlichte Artefaktlisten für Zarf.
- OBJ-25 liefert Chart-Artefakte in den Registry-Flow.

### QA Readiness
- Testbar ist, dass ohne Gate-OK kein Publish stattfindet.
- Testbar ist, dass pro Release alle Pflichtartefakte mit konsistenten Metadaten vorhanden sind.
- Testbar ist, dass immutability-Regeln für Release-Tags greifen.
- Testbar ist, dass Retention-Regeln reproduzierbar anwenden und protokolliert werden.

## Implementation Update
- Eine serverseitige Lesesicht unter `/registry` zeigt den Registry-Katalog fuer Nicht-Entwickler mit Publish-Status, Security-Gate, Metadata-Reife, Retention und Zarf-Relevanz.
- Eine API unter `/api/v1/registry` liefert denselben Katalog maschinenlesbar und unterstuetzt Filter fuer Version, Channel, Artefakt-Typ, Publish-Status und Zarf-Relevanz.
- Der Datenlayer fuehrt bestehende Git-Quellen zusammen: `docs/releases/UPDATE-NOTICES.json` fuer Release-Artefakte und `docs/releases/SECURITY-SCAN-BUNDLES.json` fuer SBOM-/Scan-/Gate-Nachweise.
- Die Registry-Darstellung kennzeichnet bewusst, ob Metadaten vollstaendig eingebettet, nur abgeleitet oder noch fehlend sind. Damit bleibt sichtbar, wo spaeter echte Harbor-/Nexus-Metadaten oder OCI-Attachments nachgezogen werden muessen.
- Die CI wurde fuer OBJ-18 ergaenzt: Runtime-Smoke prueft die Registry-Seite und die API, ein `registry-catalog` Artifact dokumentiert Digest/Tag/Immutability, und das `release-gate` blockiert Tags ohne Registry-Metadaten oder ohne Nachweis `passed-before-publish`.
- Nicht Bestandteil dieser Umsetzung sind echte Harbor-/Nexus-Provisionierung als Code, eine Mirror-Registry und die Root-Discovery/OpenAPI-Verlinkung ausserhalb des erlaubten Ownership-Bereichs.

## QA Test Results

**Tested:** 2026-04-10
**App URL:** http://localhost:3001/registry
**Tester:** QA Engineer (AI)

**Test Setup Notes**
- Reproduzierbare Checks ueber `npm run build` sowie `npm run test:run -- src/lib/obj18-artifact-registry.test.ts src/app/api/v1/registry/route.test.ts`.
- Zusaetzliche QA-Proben fuer Rate-Limit, `limit`-Validation und Summary-Abgleich wurden lokal per temporaerem Vitest-Test gegen die echte Route-/Datenlogik ausgefuehrt und danach wieder entfernt.
- Live-Browser sowie direkte API-HTTP-Checks waren in dieser Session nur eingeschraenkt moeglich; die UI-Pruefung erfolgte deshalb ueber das gebaute Seitenartefakt `.next/server/app/registry.html` und einen erfolgreichen HTTP-Head-Check auf `/registry`.

### Acceptance Criteria Status

#### AC-1: Container-Images werden in Harbor (primaer) nach erfolgreichem Build auf `main` oder bei Release-Tags gespeichert
- [ ] BUG: Aktuelle Umsetzung nutzt `ghcr.io` als primaere Registry statt Harbor. Das ist im Datenmodell und in der CI fest verdrahtet und erfuellt die Anforderung "Harbor primaer" nicht.

#### AC-2: Images werden mit Git-SHA und Git-Tag getaggt (`sha-*`, Release-Tag, `latest`)
- [x] Die CI erzeugt SHA-, Tag- und `latest`-Tags ueber `docker/metadata-action`.

#### AC-3: Container-Images und Push/Distribution sind OCI-konform
- [x] OCI-Build/Push ist in der Pipeline abgebildet; der Registry-Katalog kennzeichnet OCI-Artefakte.

#### AC-4: Container-Images werden erst nach bestandenen Security-Scans (OBJ-17) veroeffentlicht
- [ ] BUG: Der Nachweis ist fachlich falsch modelliert. Auch nicht veroeffentlichte Artefakte werden als `publishedOnlyAfterGate = true` gewertet, wodurch die zentrale Freigabeaussage unzuverlaessig wird.

#### AC-5: Weitere Release-Artefakte (Helm Charts, K8s-Bundles, SBOMs, Security-Reports) werden in Nexus oder Harbor abgelegt
- [ ] BUG: Die Lesesicht zeigt mehrere Artefakte weiterhin als lokale `docs/`- bzw. `artifacts/`-Pfade. Ein echter Ablage-Nachweis in Harbor/Nexus ist fuer diese Artefakte nicht vorhanden.

#### AC-6: Publishbare Artefakte werden nur nach erfolgreicher Artefaktpruefung veroeffentlicht; der Pruefbericht ist verknuepft
- [x] Die `release-gate`-Stufe prueft Registry-Metadaten und den Status `passed-before-publish`.

#### AC-7: Jedes Artefakt traegt Metadaten: Versionsnummer, Build-Datum, Git-SHA, Build-Pipeline-Link
- [ ] BUG: `gitSha` ist fuer viele Artefakte nicht eingebettet, und die Registry-Records setzen `digest` immer auf `null`. Damit ist die geforderte Audit-Metadatenkette unvollstaendig.

#### AC-8: Zugangsdaten fuer Harbor und Nexus werden als CI/CD-Secrets verwaltet
- [x] Fuer den aktuell implementierten GHCR-Pfad wird ein Secret-basierter Login genutzt; keine Zugangsdaten liegen im Repository.

#### AC-9: Artefakt-Liste fuer Zarf-Export ist definiert und gepflegt
- [x] Zarf-Relevanz ist im Katalog markiert; die OBJ-19-Abhaengigkeit ist fachlich vorbereitet.

#### AC-10: Alte Artefakte werden per konfigurierbarer Retention-Policy bereinigt
- [ ] BUG: Es gibt nur eine beschreibende UI-/Datenmodell-Aussage zur Retention, aber keinen nachweisbaren bereinigenden Mechanismus oder konfigurierbaren Registry-Job.

#### AC-11: Harbor/Nexus-Konfiguration ist als Code beschrieben oder dokumentiert
- [ ] BUG: Die aktuelle Umsetzung liefert keine Harbor-/Nexus-Provisionierung als Code und keinen belastbaren Konfigurationsnachweis fuer Projects, Policies oder Repositories.

#### AC-12: Release-Tags sind immutable; nur Rolling-Tags wie `latest` duerfen ueberschrieben werden
- [x] Immutability ist in CI-Metadaten und in der Lesesicht modelliert.

#### AC-13: Security-Artefakte sind referenzierbar und mit dem Image-Digest verknuepft
- [ ] BUG: Security-Artefakte sind referenzierbar, aber der Image-Digest fehlt in den Records vollstaendig. Die geforderte kryptografische Verknuepfung ist damit nicht nachweisbar.

#### AC-14: Fuer jedes veroeffentlichte Artefakt ist "`published only after gate`" im Release-Protokoll nachvollziehbar
- [ ] BUG: Die zusammenfassende Kennzahl ist falsch und zaehlt auch Pending-Artefakte als Gate-konform. Das Release-Protokoll ist damit fuer genau diesen Nachweis nicht belastbar.

### Edge Cases Status

#### EC-1: Harbor/Registry nicht erreichbar
- [x] In der Pipeline existiert ein klarer Fehlerpfad: fehlende Registry-Metadaten oder fehlender Digest brechen das Release-Gate.

#### EC-2: Ungueltige Filterparameter an der API
- [x] API validiert ungueltige `publishState`-, `artifactType`-, `channel`-, `zarfIncluded`- und `limit`-Werte mit `422`.

#### EC-3: Zu viele API-Anfragen in kurzer Zeit
- [x] Die Route greift nach 60 Requests pro Minute pro Client mit `429`.

#### EC-4: Nicht veroeffentlichte Beta-Artefakte im Katalog
- [ ] BUG: Pending-Artefakte werden beim Gate-Nachweis fachlich zu positiv dargestellt (`published after gate = yes`), obwohl noch gar kein Publish stattgefunden hat.

#### EC-5: Lokale statt echter Registry-Referenzen
- [ ] BUG: Lokale Evidence-Pfade werden in der Registry-Sicht mit `primaryRegistry = ghcr.io` kombiniert und wirken dadurch wie echte Registry-Eintraege.

### Security Audit Results
- [x] Input validation: Ungueltige Query-Parameter werden mit kontrollierten `422`-Fehlern abgewiesen.
- [x] Rate limiting: Wiederholte Requests werden begrenzt (`429` nach 60 Requests pro Minute pro Client).
- [x] Secrets exposure: Im geprueften OBJ-18-Pfad wurden keine hart codierten Zugangsdaten gefunden.
- [ ] BUG: Die API/Lesesicht gibt interne Repository-Pfade (`docs/...`, `artifacts/...`) als Teil des Registry-Katalogs weiter. Das ist kein direkter Secret-Leak, aber eine unnötige interne Struktur-Offenlegung und fachlich irrefuehrend.

### Bugs Found

#### BUG-1: Primaere Registry entspricht nicht der Anforderung
- **Severity:** High
- **Steps to Reproduce:**
  1. Lies [src/lib/obj18-artifact-registry.ts](/Users/gregorkurth/Documents/Dev/test-dns/src/lib/obj18-artifact-registry.ts#L100) und [features/OBJ-18-artefakt-registry.md](/Users/gregorkurth/Documents/Dev/test-dns/features/OBJ-18-artefakt-registry.md).
  2. Oeffne den Build-Stand unter [registry.html](/Users/gregorkurth/Documents/Dev/test-dns/.next/server/app/registry.html).
  3. Erwartet: Harbor ist primaere Registry gemaess Requirement.
  4. Tatsaechlich: Katalog und Logik sind auf `ghcr.io` festgelegt.
- **Priority:** Fix before deployment

#### BUG-2: Gate-Nachweis zaehlt Pending-Artefakte als "published after gate"
- **Severity:** High
- **Steps to Reproduce:**
  1. Fuehre `npm run build` aus.
  2. Oeffne [registry.html](/Users/gregorkurth/Documents/Dev/test-dns/.next/server/app/registry.html) und vergleiche die Kennzahlen `Published` und `Published after gate`.
  3. Erwartet: `Published after gate` darf hoechstens die Anzahl wirklich veroeffentlichter Artefakte abbilden.
  4. Tatsaechlich: Die Seite zeigt `Published = 4`, aber `Published after gate = 9`.
- **Priority:** Fix before deployment

#### BUG-3: Nicht-Registry-Artefakte werden als GHCR-Eintraege dargestellt
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Oeffne [registry.html](/Users/gregorkurth/Documents/Dev/test-dns/.next/server/app/registry.html).
  2. Suche Eintraege wie `SBOM`, `Security Scan Pack` oder `Dokumentationsstand OBJ-4/OBJ-23`.
  3. Erwartet: Diese Artefakte sind klar als lokale Evidence oder als echte Nexus/Harbor-Artefakte ausgewiesen.
  4. Tatsaechlich: Die Tabelle kombiniert `primaryRegistry = ghcr.io` mit Referenzen wie `artifacts/security/...` oder `docs/exports/...`.
- **Priority:** Fix before deployment

#### BUG-4: Pflichtmetadaten fuer Audit-Kette sind unvollstaendig
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Lies [src/lib/obj18-artifact-registry.ts](/Users/gregorkurth/Documents/Dev/test-dns/src/lib/obj18-artifact-registry.ts#L331) sowie den Metadatenblock ab [src/lib/obj18-artifact-registry.ts](/Users/gregorkurth/Documents/Dev/test-dns/src/lib/obj18-artifact-registry.ts#L304).
  2. Erwartet: Jeder Record besitzt belastbare Werte fuer Digest, Git-SHA, Build-Datum und Pipeline-Link.
  3. Tatsaechlich: `digest` ist immer `null`, und mehrere Artefakte haben nur abgeleitete oder fehlende Metadaten.
- **Priority:** Fix before deployment

#### BUG-5: Retention und Registry-Konfiguration sind nur beschrieben, nicht nachweisbar umgesetzt
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Pruefe [features/OBJ-18-artefakt-registry.md](/Users/gregorkurth/Documents/Dev/test-dns/features/OBJ-18-artefakt-registry.md) gegen CI und Code.
  2. Erwartet: Konfigurierbare Retention sowie Harbor/Nexus-Konfiguration sind als Code oder belastbare Doku vorhanden.
  3. Tatsaechlich: Die Umsetzung beschreibt Policies, liefert aber keinen beweisbaren Mechanismus oder Provisionierungsstand.
- **Priority:** Fix before deployment

### Regression Check
- [x] `npm run build` bleibt grün; OBJ-18 fuegt die Seite `/registry` und die Route `/api/v1/registry` ohne Build-Bruch hinzu.
- [x] Bestehende Datenquellen aus OBJ-14 und OBJ-17 werden weiterhin erfolgreich gelesen.
- [ ] Cross-browser und echtes responsives Browser-Testing konnten in dieser Session mangels interaktivem Browser nicht vollstaendig ausgefuehrt werden.

### Summary
- **Acceptance Criteria:** 6/14 passed
- **Bugs Found:** 5 total (2 high, 3 medium, 0 low)
- **Security:** Issues found
- **Production Ready:** NO
- **Recommendation:** Fix bugs first

## Deployment
### Deployment-Status (Stand: 2026-04-11)
- Auslieferung erfolgt Git-first ueber Branch/PR/Merge nach `main`.
- Release- und Export-Nachweise werden in `docs/releases/` und `docs/exports/EXPORT-LOG.md` dokumentiert.
- Confluence bleibt Sekundaerziel: Export erst nach gepflegter Git-Dokumentation.
- Falls **Production Ready: NO** gilt, bleibt das Deployment als vorbereitet markiert und wird erst nach Freigabe produktiv ausgerollt.
