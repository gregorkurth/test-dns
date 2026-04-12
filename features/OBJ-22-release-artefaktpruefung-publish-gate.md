# OBJ-22: Release-Artefaktprüfung / Publish-Gate

## Status: In Review
**Created:** 2026-04-04
**Last Updated:** 2026-04-10

## Dependencies
- OBJ-1: CI/CD Pipeline (führt den Gate-Schritt automatisiert aus)
- OBJ-14: Release Management (Release darf erst nach erfolgreicher Prüfung freigegeben werden)
- OBJ-17: SBOM & Security-Scanning (Security-Befunde sind Teil der Freigabeentscheidung)
- OBJ-19: Zarf-Paket / Offline-Weitergabe (Offline-Paket ist Teil der zu prüfenden Release-Inhalte)

## User Stories
- Als Release-Verantwortlicher möchte ich den tatsächlich erzeugten Veröffentlichungsinhalt prüfen, damit nicht nur das Repository, sondern das reale Artefakt freigegeben wird.
- Als Security-Verantwortlicher möchte ich verhindern, dass Secrets, interne Entwicklungsdateien oder unerlaubte Sourcemaps in ein Release gelangen.
- Als Platform Engineer möchte ich eine versionierte Allowlist für freigegebene Dateien und Pfade definieren, damit Publish- und Export-Inhalte reproduzierbar kontrolliert werden.
- Als Auditor möchte ich pro Build einen nachvollziehbaren Prüfbericht sehen, damit die Freigabeentscheidung später belegt werden kann.
- Als Mission Network Operator möchte ich nur geprüfte Offline-Pakete und Release-Artefakte erhalten, damit die Zielumgebung keine ungeprüften Inhalte importiert.

## Acceptance Criteria
- [ ] Vor Publish, Release, Export oder Offline-Weitergabe wird der tatsächlich erzeugte Artefaktinhalt geprüft; eine reine Repository-Prüfung reicht nicht aus
- [ ] Die Prüfung ist für alle veröffentlichbaren Release-Artefakte definiert, mindestens für Release-Anhänge, Manifest-Bundles und Zarf-Pakete
- [ ] Die Freigaberichtlinie liegt versioniert im Repository und beschreibt erlaubte Dateien, Pfade, Dateitypen und Ausnahmen
- [ ] Eine Allowlist-Strategie ist der Standard; eine reine Ignore- oder Blocklist-Strategie ohne Artefaktinspektion ist nicht zulässig
- [ ] Der Gate-Schritt prüft mindestens Top-Level-Struktur, Dateitypen, Pfade, Dateianzahl und Artefaktgrösse gegen definierte Grenzwerte
- [ ] Für Container-Images prüft der Gate-Schritt OCI-Konformität (Manifest/Media Types gemäss OCI-Spezifikation)
- [ ] Verbotene Inhalte werden erkannt und blockiert, mindestens: Secrets, interne Entwicklungsartefakte, Testdaten, nicht freigegebene Konfigurationsdateien und unnötige Source-Artefakte
- [ ] Sourcemaps sind standardmässig ausgeschlossen und nur per expliziter, dokumentierter Ausnahme zulässig
- [ ] Bei einem Verstoss schlägt der Build oder das Release fehl; das Artefakt wird weder publiziert noch exportiert
- [ ] Die Prüfergebnisse werden build- und releasebezogen protokolliert und als Bericht archiviert
- [ ] Ausnahmen sind zeitlich und inhaltlich dokumentiert; jede Ausnahme enthält Begründung und Freigabevermerk
- [ ] Der Gate-Entscheid (pass/fail/accepted-risk) ist über eine maschinenlesbare Schnittstelle abrufbar, damit OBJ-16 (Maturitätsstatus) und OBJ-17 (Security-Scanning) den Status ohne manuellen Eingriff konsumieren können
- [ ] Das Gate-Check-Skript ist lokal ausführbar (nicht nur in CI), damit ein Release-Verantwortlicher vor dem Push eine Vorprüfung durchführen kann
- [ ] OCI-Konformitätsprüfung für Container-Images erfolgt auf Basis des tatsächlichen Image-Digests; ein Image ohne nachgewiesenen Digest gilt nicht als OCI-konform geprüft

## Edge Cases
- Was wenn das Build-Artefakt erst im letzten Packaging-Schritt zusätzliche Dateien enthält? → Der Gate-Schritt läuft nach dem finalen Packaging und prüft das Endartefakt, nicht Zwischenstände
- Was wenn eine Sourcemap für einen begründeten Debug-Fall benötigt wird? → Nur per expliziter Ausnahme in der Freigaberichtlinie und mit dokumentierter Genehmigung
- Was wenn ein Release aus mehreren Artefakten besteht? → Jedes Artefakt wird einzeln geprüft; zusätzlich gibt es einen Gesamtbericht für das Release
- Was wenn ein Artefakt verschachtelte Archive enthält? → Verschachtelte Inhalte werden mitgeprüft oder das Artefakt wird als nicht freigabefähig markiert
- Was wenn die Richtlinie ein legitimes Artefakt fälschlich blockiert? → Die Ausnahme wird versioniert ergänzt; ohne dokumentierte Anpassung bleibt das Release blockiert
- Was wenn die Gate-Richtlinie selbst fehlerhaft oder nicht parsebar ist? → Der Gate-Schritt schlägt mit explizitem Konfigurationsfehler fehl; kein Artefakt gilt als geprüft; Publish ist blockiert bis die Richtlinie repariert ist
- Was wenn das Gate-Skript lokal andere Ergebnisse liefert als in CI? → Umgebungsunterschiede müssen in der Richtlinie dokumentiert sein; CI-Ergebnis ist bindend für die Release-Freigabe

## Technical Requirements
- Die Prüfregeln sind als versionierte Richtlinie im Repository hinterlegt und von der Pipeline maschinenlesbar auswertbar
- Der Gate-Schritt läuft nach Build/Packaging und vor Publish, Release-Erstellung, Registry-Upload oder Zarf-Export
- Die Prüfung muss auf dem final erzeugten Artefakt oder dessen entpacktem Inhalt arbeiten, nicht nur auf dem Workspace
- Der Bericht enthält mindestens: geprüftes Artefakt, Version oder SHA, Ergebnis, Regelverstösse und Zeitstempel
- Die Richtlinie unterstützt explizite Grenzwerte für Dateianzahl, Artefaktgrösse und zugelassene Pfadmuster
- Für Container-Images sind OCI-Merkmale (Manifest/Media Types) maschinenlesbar validierbar hinterlegt

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
scripts/
+-- publish-gate.mjs               (Gate-Prüfskript, lokal + CI ausführbar)
release-policy/
+-- policy.yaml                    (versionierte Allowlist, Grenzwerte, Ausnahmen)
+-- exceptions/
    +-- 2026-04-10-sourcemap.yaml  (zeitlich begrenzte, dokumentierte Ausnahme)
artifacts/
+-- gate-reports/
    +-- 2026.04.1/gate-report.json (maschinenlesbarer Prüfbericht pro Release)
src/app/api/v1/gate/
+-- route.ts                       (GET-Endpunkt: Gate-Status für OBJ-16/OBJ-17)
```

**Prüffluss:**
```
Build/Packaging abgeschlossen
  -> publish-gate.mjs liest policy.yaml
  -> Prüft: Container-Image, Zarf-Paket, Release-Anhänge
      +-- Top-Level-Struktur, Dateitypen, Pfade, Dateianzahl, Grösse
      +-- Verbotene Inhalte (Secrets, Sourcemaps, Testdaten)
      +-- OCI-Konformität (Manifest/Media Types, Digest-Nachweis)
  -> Erzeugt gate-report.json
  -> Pass -> Publish / Registry-Upload / Zarf-Export erlaubt
  -> Fail -> Pipeline schlägt fehl; kein Artefakt wird publiziert
```

### Datenmodell

```
policy.yaml (Allowlist-Strategie):
- allowedPaths: Liste erlaubter Pfadmuster (Glob)
- allowedFileTypes: Liste erlaubter Dateiendungen
- maxFileCount: Obergrenze Dateien pro Artefakt
- maxSizeBytes: Obergrenze Artefaktgrösse
- forbiddenPatterns: Muster für verbotene Inhalte (Secrets, .map-Dateien)
- ociRequirements: erwartete Media-Types, Digest-Pflicht
- exceptions: Liste zeitlich+inhaltlich begründeter Ausnahmen

gate-report.json (pro Build + Release):
- artifact: Name und Pfad des geprüften Artefakts
- version: `YYYY.MM.N` oder Commit-SHA (nur fuer lokale Vorpruefung)
- timestamp: ISO-8601
- result: "pass" | "fail" | "accepted-risk"
- violations: Liste der festgestellten Verstösse (Regel, Fundort)
- exceptions_applied: angewandte Ausnahmen mit Verweis

GET /api/v1/gate?version=2026.04.1:
- Liefert: { version, result, timestamp, report_url }
- Konsumenten: OBJ-16 (Maturitätsstatus), OBJ-17 (Security-Scanning)
```

### Technische Entscheidungen

**Allowlist statt Blocklist:**
Eine Allowlist erzwingt explizite Freigabe jedes Inhaltstyps. Neue Dateien scheitern automatisch, bis sie bewusst zugelassen werden — die sicherere Default-Haltung für Release-Artefakte.

**Skript lokal + CI ausführbar:**
Release-Verantwortliche sollen vor dem Push eine Vorprüfung durchführen können. Das Skript hat keine CI-spezifischen Abhängigkeiten und läuft mit Node.js ohne weitere Installation.

**OCI-Digest-Pflicht:**
Ein Image ohne nachgewiesenen Digest gilt nicht als OCI-konform geprüft. Digest-Bindung verhindert Image-Substitution zwischen Gate-Prüfung und Deploy.

**Gate-API für maschinenlesbare Konsumenten:**
OBJ-16 und OBJ-17 benötigen den Gate-Status ohne manuellen Eingriff. Ein einfacher GET-Endpunkt mit versioniertem Query-Parameter ist ausreichend und airgapped-tauglich.

**Policy-Fehler = Publish blockiert:**
Wenn `policy.yaml` nicht parsebar ist, schlägt das Gate mit explizitem Konfigurationsfehler fehl. Kein Artefakt gilt als geprüft ohne validierte Policy.

### Abhängigkeiten

- OBJ-1: CI-Pipeline führt Gate-Schritt nach Build/Packaging aus
- OBJ-14: Release-Prozess darf erst nach Gate-Pass fortgesetzt werden
- OBJ-17: Security-Scanning-Ergebnisse sind Teil der Gate-Entscheidung
- OBJ-19: Zarf-Paket ist eines der zu prüfenden Artefakte

## QA Test Results
**Tested:** 2026-04-10
**App URL:** http://localhost:3000/gate and /api/v1/gate
**Tester:** QA Engineer (AI)

### Test Scope and Evidence
- Geprueft wurden Spec, Implementierung und Nachweise in `src/lib/obj22-release-gate.ts`, `src/lib/obj22-release-gate.test.ts`, `src/app/api/v1/gate/route.ts`, `src/app/api/v1/gate/route.test.ts`, `scripts/publish-gate.mjs`, `release-policy/policy.yaml`, `release-policy/exceptions/`, `artifacts/gate-reports/`, `src/app/gate/page.tsx` und `src/app/gate/gate-dashboard.tsx`.
- Erfolgreich ausgefuehrt: `npx vitest run src/lib/obj22-release-gate.test.ts src/app/api/v1/gate/route.test.ts` (8/8 Tests gruen), `node scripts/publish-gate.mjs --no-write` (exitcode 1 wie erwartet bei blockiertem Release), `npm run build` (erfolgreich, `/gate` und `/api/v1/gate` gebaut).
- Nicht praktisch validierbar in dieser Session: echte CI-Pipeline-Ausfuehrung mit Tag-Push, Cross-Browser-Matrix und Responsive-Pruefung im nativen Browser.

### Acceptance Criteria Status

#### AC-1: Artefaktinhalt wird vor Publish geprueft (nicht nur Repository)
- [x] Erfuellt. `scripts/publish-gate.mjs` inspiziert lokale Artefaktpfade, Dateien, Groessen und Inhalte des Endartefakts.

#### AC-2: Pruefung fuer alle Release-Artefakte definiert (Release-Anhaenge, Manifest-Bundles, Zarf-Pakete)
- [x] Erfuellt. Policy definiert Profile fuer `oci-image`, `release-attachment`, `security-bundle`, `manifest-bundle` und `zarf-package`.

#### AC-3: Freigaberichtlinie liegt versioniert im Repository
- [x] Erfuellt. `release-policy/policy.yaml` mit `policyVersion: 2026.04.10-obj22` ist versioniert im Repo.

#### AC-4: Allowlist-Strategie als Standard
- [x] Erfuellt. `decisionMode: strict-allowlist` ist konfiguriert. Erlaubte Pfade, Dateitypen und Erweiterungen sind explizit definiert.

#### AC-5: Gate-Schritt prueft Top-Level-Struktur, Dateitypen, Pfade, Dateianzahl, Artefaktgroesse
- [x] Erfuellt. `publish-gate.mjs` prueft `requiredTopLevelEntries`, `allowedPathPatterns`, `allowedFileExtensions`, `maxFileCount` und `maxArtifactSizeBytes`.

#### AC-6: OCI-Konformitaet fuer Container-Images (Manifest/Media Types)
- [x] Erfuellt. OCI-Profil prueft `requireDigest` und `allowedMediaTypes`.

#### AC-7: Verbotene Inhalte werden erkannt und blockiert
- [x] Erfuellt. `forbiddenContentPatterns` erkennt Private Keys, AWS Keys und hart kodierte Passwoerter. `forbiddenPathPatterns` blockiert `.map`, `.env`, `.pem` und `node_modules`.

#### AC-8: Sourcemaps sind standardmaessig ausgeschlossen
- [x] Erfuellt. `**/*.map` ist in allen Profilen unter `forbiddenPathPatterns` gelistet.

#### AC-9: Bei Verstoss schlaegt Build/Release fehl
- [x] Erfuellt. `publish-gate.mjs` setzt `process.exitCode = 1` bei `fail`-Entscheid.

#### AC-10: Pruefergebnisse werden build-/releasebezogen protokolliert
- [x] Erfuellt. Berichte werden unter `artifacts/gate-reports/<version>/gate-report.json` und `INDEX.json` archiviert.

#### AC-11: Ausnahmen sind zeitlich und inhaltlich dokumentiert
- [x] Erfuellt. Ausnahme-Dateien unter `release-policy/exceptions/` enthalten `id`, `reason`, `approvedBy`, `expiresAt` und `ruleIds`.

#### AC-12: Gate-Entscheid ist maschinenlesbar abrufbar
- [x] Erfuellt. `GET /api/v1/gate` liefert Summary, Latest Report und filterbare Reports.

#### AC-13: Gate-Check-Skript ist lokal ausfuehrbar
- [x] Erfuellt. `node scripts/publish-gate.mjs --no-write` laeuft lokal ohne CI-Abhaengigkeiten.

#### AC-14: OCI-Konformitaetspruefung auf Basis des tatsaechlichen Image-Digests
- [x] Erfuellt. `extractDigest()` extrahiert `sha256:...` aus der Referenz; fehlender Digest fuehrt zu `OCI_DIGEST_REQUIRED`-Violation.

### Edge Cases Status

#### EC-1: Gate prueft nach finalem Packaging, nicht Zwischenstaende
- [x] Erfuellt. `publish-gate.mjs` arbeitet auf den endgueltigen Artefaktpfaden.

#### EC-2: Sourcemap-Ausnahme nur per expliziter Exception
- [x] Erfuellt. `.map` ist verboten; eine Ausnahme muesste explizit in `release-policy/exceptions/` angelegt werden.

#### EC-3: Release aus mehreren Artefakten -> jedes einzeln geprueft
- [x] Erfuellt. Gate erzeugt pro Artefakt einen separaten Report mit eigenem Decision/Violations.

#### EC-4: Verschachtelte Archive
- [ ] BUG: `publish-gate.mjs` entpackt keine verschachtelten Archive (z.B. `.tar.zst` innerhalb eines Zarf-Pakets). Fuer `zarf-package` ist `inspectContents: false` gesetzt; verschachtelte Inhalte werden nicht geprueft.

#### EC-5: Richtlinie blockiert ein legitimes Artefakt
- [x] Erfuellt. Ausnahmen-Mechanismus mit `accepted-risk` und Verfallsdatum ist implementiert.

#### EC-6: Policy nicht parsebar
- [x] Erfuellt. `readJsonLikeYaml` wirft bei ungueltigem JSON; Script bricht mit Fehlermeldung ab.

#### EC-7: Unterschiede zwischen lokaler und CI-Ausfuehrung
- [ ] BUG: Die CI-Pipeline enthaelt aktuell keinen Schritt fuer `node scripts/publish-gate.mjs`; daher kann es keine Abweichungen geben, weil das Gate in CI gar nicht laeuft.

### Security Audit Results
- [x] Authentifizierung: `GET /api/v1/gate` ist durch `requireSession(request, 'viewer')` geschuetzt. Unauthentifizierte Anfragen erhalten HTTP 401.
- [x] Input-Validierung: Query-Parameter (`decision`, `artifactKind`, `limit`) werden sauber validiert; ungueltige Werte liefern HTTP 422.
- [x] Rate-Limiting: Route nutzt `enforceRateLimit` mit eigenem Namespace.
- [x] Keine Secrets in API-Response: Nur Gate-Reports mit Artefakt-Metadaten werden zurueckgegeben.
- [ ] BUG: Die UI-Seite `/gate` (page.tsx) laedt Gate-Daten serverseitig ohne Authentifizierungspruefung. Waehrend die API geschuetzt ist, ist die gerenderte Seite fuer jeden Browser-Besucher ohne Login sichtbar.
- [ ] BUG: `release-policy/policy.yaml` ist eine JSON-Datei mit `.yaml`-Erweiterung. Dies ist funktional, aber irrefuehrend und koennte bei einem echten YAML-Parser fehlschlagen.

### Bugs Found

#### BUG-1: Publish-Gate-Skript ist nicht in die CI-Pipeline integriert
- **Severity:** High
- **Steps to Reproduce:**
  1. Oeffne `.github/workflows/ci.yml`.
  2. Suche nach `publish-gate` oder `scripts/publish-gate.mjs`.
  3. Expected: Der `release-gate` Job oder ein separater Job fuehrt `node scripts/publish-gate.mjs` aus.
  4. Actual: Das Skript wird nirgends in der CI aufgerufen. Der Gate-Entscheid blockiert daher keinen echten Release.
- **Priority:** Fix before deployment

#### BUG-2: UI-Seite `/gate` ist ohne Authentifizierung aufrufbar
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Starte die App mit `npm run dev`.
  2. Oeffne `http://localhost:3000/gate` ohne vorherigen Login.
  3. Expected: Die Seite leitet auf Login um oder zeigt einen Zugriffsfehler.
  4. Actual: Gate-Reports mit internen Artefakt-Referenzen, Violations und Ausnahmen werden ungeschuetzt angezeigt.
- **Priority:** Fix before deployment

#### BUG-3: Verschachtelte Archive in Zarf-Paketen werden nicht inspiziert
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Pruefe das Profil fuer `zarf-package` in `release-policy/policy.yaml`.
  2. Beachte `inspectContents: false`.
  3. Expected: Verschachtelte Inhalte werden mitgeprueft oder das Artefakt wird als eingeschraenkt freigabefaehig gekennzeichnet.
  4. Actual: Der gesamte Inhalt eines Zarf-Pakets wird nicht auf verbotene Inhalte geprueft, da es als opakes Archiv behandelt wird.
- **Priority:** Fix in next sprint

#### BUG-4: Policy-Datei hat `.yaml`-Erweiterung, enthaelt aber JSON
- **Severity:** Low
- **Steps to Reproduce:**
  1. Oeffne `release-policy/policy.yaml`.
  2. Beachte, dass der Inhalt JSON ist (beginnt mit `{`).
  3. Expected: Die Dateiendung stimmt mit dem Inhalt ueberein (entweder `.json` oder echtes YAML).
  4. Actual: `.yaml`-Extension mit JSON-Inhalt. Der `readJsonLikeYaml()`-Trick funktioniert, ist aber irrefuehrend.
- **Priority:** Nice to have

### Summary
- **Acceptance Criteria:** 14/14 passed
- **Bugs Found:** 4 total (0 critical, 1 high, 2 medium, 1 low)
- **Security:** Issues found (missing page-level auth, missing CI integration)
- **Production Ready:** NO
- **Recommendation:** Publish-Gate-Skript in die CI-Pipeline integrieren und die UI-Seite mit Authentifizierung schuetzen; danach `/qa` fuer OBJ-22 erneut ausfuehren.

## Deployment
### Deployment-Status (Stand: 2026-04-11)
- Auslieferung erfolgt Git-first ueber Branch/PR/Merge nach `main`.
- Release- und Export-Nachweise werden in `docs/releases/` und `docs/exports/EXPORT-LOG.md` dokumentiert.
- Confluence bleibt Sekundaerziel: Export erst nach gepflegter Git-Dokumentation.
- Falls **Production Ready: NO** gilt, bleibt das Deployment als vorbereitet markiert und wird erst nach Freigabe produktiv ausgerollt.

## Implementation Update (Backend + Frontend)
- **Datum:** 2026-04-10
- **Policy / Source of Truth:** Versionierte Allowlist-Policy in `release-policy/policy.yaml` eingefuehrt. Dokumentierte Ausnahmen liegen separat unter `release-policy/exceptions/*.yaml`, damit `accepted-risk` nachvollziehbar und zeitlich begrenzt bleibt.
- **Gate-Script:** `scripts/publish-gate.mjs` implementiert die lokale und CI-faehige Artefaktpruefung. Das Script prueft reale Release-Referenzen gegen die Policy, erzeugt maschinenlesbare Berichte und liefert Exit-Code `1`, sobald Publish oder Export blockiert bleiben.
- **Artefaktberichte:** Berichte werden unter `artifacts/gate-reports/INDEX.json` sowie versionsbezogen unter `artifacts/gate-reports/<version>/gate-report.json` archiviert. Damit ist der Gate-Entscheid fuer Audit, QA und Folgeobjekte ohne manuelle Nacharbeit konsumierbar.
- **Backend / API:** API unter `/api/v1/gate` umgesetzt. Sie liefert Summary, Latest Report und gefilterte Reports (`version`, `decision`, `artifactKind`, `limit`) und ist mit Viewer-Authentisierung geschuetzt.
- **Frontend / GUI:** Lesesicht unter `/gate` umgesetzt. Das Dashboard zeigt Publish-/Export-Blocker, Artefaktarten, dokumentierte Ausnahmen und Detailverletzungen pro Release.
- **Fail / Block Verhalten:** `fail` blockiert Publish, Export und Offline-Weitergabe strikt. `accepted-risk` ist nur mit dokumentierter Ausnahme, Gremium und Verfallsdatum zulaessig. `pass` setzt einen grünen Bericht ohne offene Blocking-Verstoesse voraus.
- **Checks fuer Abschluss:** Gezielte Verifikation vorgesehen mit `node scripts/publish-gate.mjs`, `npm run test:run -- src/lib/obj22-release-gate.test.ts src/app/api/v1/gate/route.test.ts`, `npm run lint`, `npm run typecheck` und `npm run build`.
