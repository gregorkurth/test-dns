# OBJ-24: DNS Baseline Config Repository & Change History

## Status: In Review
**Created:** 2026-04-09
**Last Updated:** 2026-04-10

## Dependencies
- OBJ-5 (Participant Configuration Form) - liefert die zu versionierenden DNS-Konfigurationsdaten
- OBJ-8 (Export & Download) - stellt Import/Export-Artefakte bereit, die ins Config-Repo ueberfuehrt werden koennen
- OBJ-3 (REST API) - stellt technische Schnittstellen fuer Laden, Speichern und Verlauf bereit

## User Stories
- Als Mission Network Operator moechte ich eine DNS-Grundkonfiguration aus einem separaten Git-Repository laden, damit alle Missionen mit einem einheitlichen, freigegebenen Startzustand beginnen.
- Als Operator moechte ich jede Konfigurationsaenderung automatisch protokolliert sehen, damit ich jederzeit nachvollziehen kann, was geaendert wurde.
- Als Reviewer moechte ich pro Aenderung einen klaren Vorher/Nachher-Vergleich sehen, damit ich Aenderungen fachlich bewerten kann.
- Als Operator moechte ich eine einzelne Aenderung gezielt rueckgaengig machen koennen, ohne den gesamten Stand zurueckzusetzen.
- Als Compliance-Verantwortlicher moechte ich eine manipulationsarme, revisionsfaehige Aenderungshistorie haben, damit Audits bestehen werden.

## Acceptance Criteria
- [ ] `feat~obj-24-ac-1~1` Die App kann eine DNS-Grundkonfiguration aus einem separaten Git-Repository laden (konfigurierbar: Repo-URL/Pfad, Branch oder Tag).
- [ ] `feat~obj-24-ac-2~1` Nach dem Laden wird der exakte Quellenstand angezeigt (Commit-SHA, Branch/Tag, Ladezeitpunkt).
- [ ] `feat~obj-24-ac-3~1` Jede gespeicherte DNS-Aenderung erzeugt einen neuen protokollierten Verlaufseintrag mit mindestens: Aenderungs-ID, Zeitstempel, Akteur, betroffene Bereiche, Kurzbeschreibung.
- [ ] `feat~obj-24-ac-4~1` Pro Verlaufseintrag ist ein nachvollziehbarer Vorher/Nachher-Vergleich sichtbar (mindestens feldbasierter Diff, optional Text-Diff).
- [ ] `feat~obj-24-ac-5~1` Verlaufseintraege sind filterbar (z. B. nach Datum, Akteur, Objekt/Participant, Aenderungstyp).
- [ ] `feat~obj-24-ac-6~1` Eine einzelne Aenderung kann gezielt rueckgaengig gemacht werden (Rollback auf Eintragsebene).
- [ ] `feat~obj-24-ac-7~1` Rollback erzeugt selbst einen neuen Verlaufseintrag inkl. Verweis auf den rueckgaengig gemachten Eintrag.
- [ ] `feat~obj-24-ac-8~1` Historie bleibt append-only nachvollziehbar; es gibt kein stilles Ueberschreiben ohne Verlauf.
- [ ] `feat~obj-24-ac-9~1` Bei Rollback-/Merge-Konflikten wird keine stille Aenderung geschrieben; stattdessen klare Fehlermeldung mit Handlungsanweisung.
- [ ] `feat~obj-24-ac-10~1` Der gesamte Ablauf funktioniert airgapped mit internen Git-Systemen (z. B. Gitea/GitLab), ohne externe Cloud-Abhaengigkeit.
- [ ] `feat~obj-24-ac-11~1` Die Aenderungshistorie ist als strukturierter Export (mindestens JSON oder CSV) fuer Audit- und Compliancezwecke herunterladbar; der Export enthaelt alle Pflichtfelder (Aenderungs-ID, Zeitstempel, Akteur, betroffene Bereiche, Ergebnis).
- [ ] `feat~obj-24-ac-12~1` Wurde noch keine Baseline geladen, zeigt die App einen klar unterscheidbaren Initialzustand ("Keine Baseline geladen") statt eines leeren Konfigurationsstands ohne Hinweis; der Operator wird zur Baseline-Konfiguration geleitet.

## Edge Cases
- Baseline-Repo ist nicht erreichbar -> App zeigt klaren Fehlerzustand und arbeitet mit letztem gueltigen lokalen Stand weiter.
- Baseline-Repo enthaelt ungueltige DNS-Konfiguration -> Import wird blockiert mit Validierungsbericht.
- Gleichzeitig eingehende Aenderungen im Config-Repo -> Konfliktstatus statt implizitem Ueberschreiben.
- Rollback auf sehr alten Eintrag -> App prueft Abhaengigkeiten und warnt bei Folgekonflikten.
- Akteur ist nicht authentifiziert (v1 ohne Login) -> Verlaufseintrag markiert Quelle als "system/anonymous" und bleibt nachvollziehbar.
- Baseline wurde noch nie geladen -> App zeigt Initialzustand-Hinweis; kein leerer Stand wird als gueltige Baseline interpretiert.
- Historien-Export schlaegt fehl (z.B. Dateisystem voll) -> Fehlermeldung mit Ursache; kein teilweise erzeugter Export wird ausgeliefert.

## Technical Requirements
- DNS-Grundkonfiguration liegt in einem separaten, versionierten Git-Repository (nicht im App-Hauptrepo).
- Jede persistierte Aenderung muss auf Git-Commit-Ebene rueckverfolgbar sein (Commit-ID als Referenz im Verlauf).
- Rollback erfolgt als fachlich nachvollziehbarer Revert-Mechanismus (neuer Aenderungseintrag), nicht als History-Rewrite.
- Verlaufseintraege muessen exportierbar sein (z. B. fuer Audit/Testnachweise).
- Schnittstellen und Datenmodell muessen so gestaltet sein, dass spaeter eine Rechte-/Freigabelogik (4-Augen-Prinzip) erweiterbar ist.

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Komponenten-Struktur

```
UI (Next.js)
+-- /baseline                          (Seite: Baseline laden & Status)
|   +-- BaselineStatusBanner           (Commit-SHA, Branch/Tag, Ladezeitpunkt; oder "Keine Baseline geladen")
|   +-- BaselineLoadForm               (Repo-URL, Branch/Tag konfigurieren, Laden auslösen)
+-- /history                           (Seite: Aenderungshistorie)
    +-- HistoryFilterBar               (Filter: Datum, Akteur, Objekt, Typ)
    +-- HistoryTable                   (Verlaufsliste: ID, Zeitstempel, Akteur, Kurzbeschreibung)
    +-- HistoryEntryDetail             (Vorher/Nachher-Diff, Rollback-Button)
    +-- ExportButton                   (Download: JSON oder CSV)

API (Next.js Route Handlers)
+-- GET  /api/v1/baseline              (aktueller Baseline-Status)
+-- POST /api/v1/baseline/load         (Baseline aus Git laden)
+-- GET  /api/v1/history               (Verlaufsliste, filterbar)
+-- GET  /api/v1/history/:id           (Einzeleintrag mit Diff)
+-- POST /api/v1/history/:id/rollback  (gezielter Rollback-Eintrag)
+-- GET  /api/v1/history/export        (Bulk-Export JSON/CSV)
```

### Datenmodell

```
BaselineState (im Dateisystem, kein DBMS):
- repoUrl: Git-URL (intern, Gitea-kompatibel)
- ref: Branch oder Tag
- commitSha: exakte Commit-ID beim Ladevorgang
- loadedAt: ISO-8601-Zeitstempel
- status: "loaded" | "never_loaded" | "error"

HistoryEntry (append-only JSON-Log):
- id: eindeutige Aenderungs-ID (UUID oder fortlaufend)
- timestamp: ISO-8601
- actor: Benutzername oder "system/anonymous" (v1 ohne Login)
- affectedScope: betroffene Bereiche (z.B. Participant-IDs, Zone-Names)
- summary: Kurzbeschreibung
- before: Snapshot des Zustands vor der Aenderung
- after: Snapshot des Zustands nach der Aenderung
- rollbackOf: (optional) ID des zugehoerigen Eintrags bei Rollback
- sourceCommit: Git-Commit-SHA der Baseline-Quelle zum Zeitpunkt der Aenderung

Export-Datei:
- Format: JSON-Array oder CSV
- Pflichtfelder pro Eintrag: id, timestamp, actor, affectedScope, summary, result
- Kein teilweiser Export: Datei wird erst nach vollstaendigem Schreiben ausgeliefert
```

### Technische Entscheidungen

**Append-only JSON-Log (kein DBMS):**
Konsistent mit dem bestehenden stateless, file-based Designprinzip (kein externes DBMS in v1). Verlaufseintraege werden nie geaendert oder geloescht — nur neue Eintraege angehaengt. Rollback erzeugt einen neuen Eintrag statt History-Rewrite.

**Git-native Baseline (Gitea-intern):**
Baseline-Repo liegt in der internen Gitea-Instanz, nicht in einem externen Cloud-Dienst. Damit ist der airgapped-Betrieb sichergestellt. Commit-SHA als unveraenderbarer Ankerpunkt garantiert Reproduzierbarkeit.

**Feldbasierter Diff (kein freier Textvergleich):**
DNS-Konfigurationsdaten sind strukturiert (Participants, Zones, Records). Ein feldbasierter Diff ist für Operator-Reviews verstaendlicher als ein Text-Diff und ermoeglicht spaetere Erweiterung um 4-Augen-Freigabe (OBJ-3-Schnittstelle).

**"Keine Baseline geladen"-Initialzustand explizit:**
Die App unterscheidet aktiv zwischen "noch nie geladen" und "geladener Konfiguration". Kein leerer Zustand wird als gueltige Baseline interpretiert. Der Operator wird zur Basiskonfiguration geleitet.

**Export-Atomizitaet:**
Die Export-Datei wird erst nach vollstaendigem Schreiben ausgeliefert. Ein fehlgeschlagener Export liefert eine Fehlermeldung — kein teilweise erzeugter Download.

### Abhängigkeiten

- OBJ-3: REST-API-Schnittstellen fuer Laden, Speichern und Verlauf
- OBJ-5: Participant-Konfigurationsdaten sind die versionierten DNS-Konfigurationsdaten
- OBJ-8: Export-Mechanismus (Dateidownload) kann wiederverwendet werden

## QA Test Results
**Tested:** 2026-04-10
**App URL:** http://localhost:3100/baseline and http://localhost:3100/history (Live-Browserpfad in dieser QA-Session nur eingeschraenkt nutzbar)
**Tester:** QA Engineer (AI)

### Test Scope and Evidence
- Geprueft wurden Spec, Implementierung und Nachweise in `src/lib/obj24-baseline-history.ts`, `src/lib/obj24-baseline-history.test.ts`, `src/app/api/v1/baseline/route.ts`, `src/app/api/v1/baseline/load/route.ts`, `src/app/api/v1/history/route.ts`, `src/app/api/v1/history/[id]/route.ts`, `src/app/api/v1/history/[id]/rollback/route.ts`, `src/app/api/v1/history/export/route.ts`, `src/app/baseline/baseline-client.tsx` und `src/app/history/history-client.tsx`.
- Erfolgreich ausgefuehrt: `npm run test:run -- src/lib/obj24-baseline-history.test.ts src/app/api/v1/baseline/route.test.ts src/app/api/v1/history/route.test.ts` (8/8 Tests gruen), `npm run lint`, `npm run typecheck`, `npm run build`.
- Zusaetzliche Laufzeitproben wurden direkt gegen `src/lib/obj24-baseline-history.ts` ausgefuehrt, um Randfaelle fuer Rollback und ungueltige Historien-Schreibzugriffe zu verifizieren.
- Nicht stabil testbar in dieser Session: echter Browserlauf fuer Cross-Browser-Matrix (Chrome, Firefox, Safari) sowie Responsive-Checks auf 375px, 768px und 1440px.

### Acceptance Criteria Status
- [x] AC-1: Baseline kann aus separatem Git-Repository ueber Repo-Pfad und Ref geladen werden.
- [x] AC-2: Commit-SHA, Ref und Ladezeitpunkt werden angezeigt.
- [x] AC-3: Gespeicherte Aenderungen erzeugen Verlaufseintraege mit ID, Zeitstempel, Akteur, Scope und Summary.
- [x] AC-4: Pro Eintrag ist ein feldbasierter Vorher/Nachher-Diff sichtbar.
- [x] AC-5: Historie ist nach Akteur, Typ, Scope und Zeitraum filterbar.
- [ ] BUG AC-6: Rollback eines einzelnen Eintrags ist im Grenzfall `baseline_load` nicht konsistent; nach dem Rollback bleibt der Status `loaded`, obwohl der Snapshot inhaltlich `null` ist.
- [x] AC-7: Rollback erzeugt einen neuen Verlaufseintrag mit `rollbackOf`.
- [x] AC-8: Historie bleibt append-only; Eintraege werden angehaengt statt ueberschrieben.
- [x] AC-9: Nicht-neuester Rollback wird mit `ROLLBACK_CONFLICT` sauber blockiert.
- [x] AC-10: Airgapped-faehiger Git-Zugriff ist fuer lokale/interne Repositories modelliert und praktisch mit lokalem Git-Repo validiert.
- [x] AC-11: JSON- und CSV-Export funktionieren und enthalten die Pflichtfelder.
- [x] AC-12: Der Initialzustand "Keine Baseline geladen" ist vor erstem Load klar sichtbar.

### Edge Cases Status
- [x] Unerreichbares oder fehlendes lokales Repository fuehrt zu kontrolliertem Fehlerzustand.
- [x] Ungueltige Baseline-Dateipfade (`../`, absolute Pfade innerhalb `baselineFile`) werden blockiert.
- [x] Rollback auf nicht-neuesten Eintrag liefert klaren Konflikt statt stiller Aenderung.
- [ ] BUG: Ungueltige manuelle Aenderungen werden nicht als ungueltige DNS-Konfiguration abgewiesen, sondern als `manual_update` gespeichert.
- [ ] BUG: Rollback des initialen `baseline_load` fuehrt nicht zur expliziten "Keine Baseline geladen"-Rueckkehr, sondern zu einem inkonsistenten leeren Snapshot im Status `loaded`.
- [ ] BLOCKED: Echte Gitea/GitLab-End-to-End-Proben, Browser-Checks und Responsive-Matrix konnten in dieser Session nicht praktisch abgeschlossen werden.

### Security Audit Results
- [x] Baseline-Datei wird gegen Pfad-Traversal innerhalb des Repositories abgesichert.
- [x] Offensichtliche Stacktraces oder Secrets wurden in den geprueften Fehlerpfaden nicht gefunden.
- [x] Rate-Limiting ist fuer Baseline-, History- und Export-Routen eingebaut.
- [ ] BUG: Die OBJ-24-API besitzt keine erkennbare Authentifizierungs- oder Autorisierungspruefung; Lesen und Schreiben werden nur per Rate-Limit begrenzt.

### Bugs Found
#### BUG-1: Rollback des ersten `baseline_load` hinterlaesst einen inkonsistenten "loaded"-Zustand
- **Severity:** High
- **Steps to Reproduce:**
  1. Lege ein temp. Git-Repository mit `baseline/dns-config.json` an.
  2. Lade die Baseline ueber `loadObj24BaselineFromRepository(...)`.
  3. Fuehre sofort `rollbackObj24HistoryEntry(loaded.historyEntry.id, {})` aus.
  4. Rufe danach `getObj24BaselineStatusView()` auf.
  5. Expected: Entweder wird der Rollback fuer den initialen Baseline-Load blockiert oder der Zustand geht sichtbar auf "Keine Baseline geladen" ohne gueltigen Snapshot zurueck.
  6. Actual: `baseline.status` bleibt `loaded`, `initialStateMessage` bleibt `Baseline geladen`, `currentSnapshotAvailable` ist `true`, obwohl der Snapshot inhaltlich `null` ist; danach lassen sich neue Updates auf dem leeren Zustand speichern.
- **Evidence:** `src/lib/obj24-baseline-history.ts:820`, `src/lib/obj24-baseline-history.ts:842`, `src/lib/obj24-baseline-history.ts:592`
- **Priority:** Fix before deployment

#### BUG-2: Manuelle Historien-Aenderungen akzeptieren beliebige Nicht-DNS-Payloads
- **Severity:** High
- **Steps to Reproduce:**
  1. Lade eine gueltige Baseline.
  2. Fuehre `appendObj24HistoryChange({ summary: 'invalid state write', after: 'totally-not-dns-json-structure' })` aus.
  3. Expected: Die Aenderung wird mit Validierungsfehler abgelehnt, weil sie keine gueltige DNS-Konfiguration darstellt.
  4. Actual: Die Aenderung wird als `manual_update` mit `result = applied` gespeichert.
- **Evidence:** `src/lib/obj24-baseline-history.ts:82`, `src/lib/obj24-baseline-history.ts:712`
- **Priority:** Fix before deployment

#### BUG-3: Persistierte Aenderungen sind nicht auf Git-Commit-Ebene rueckverfolgbar
- **Severity:** High
- **Steps to Reproduce:**
  1. Lade eine Baseline aus einem Git-Repository.
  2. Fuehre eine manuelle Aenderung ueber `appendObj24HistoryChange(...)` aus.
  3. Vergleiche den neuen Verlaufseintrag mit dem geladenen Baseline-Commit.
  4. Expected: Jede persistierte Aenderung ist an einen neuen Commit im Config-Repository oder einen gleichwertigen Commit-Nachweis gebunden.
  5. Actual: `manual_update` und `rollback` uebernehmen nur `baselineState.commitSha`; ein neuer Git-Commit fuer die Aenderung wird nirgends erzeugt oder referenziert.
- **Evidence:** `src/lib/obj24-baseline-history.ts:739`, `src/lib/obj24-baseline-history.ts:837`
- **Priority:** Fix before deployment

#### BUG-4: Baseline- und History-API sind ohne sichtbare Zugriffskontrolle erreichbar
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Pruefe die OBJ-24-Routen fuer Baseline-Laden und History-Schreiben.
  2. Expected: Mindestens fuer Schreibzugriffe ist eine erkennbare Authentifizierungs- oder Rollenpruefung vorhanden.
  3. Actual: Die Routen pruefen nur Rate-Limits und Payload-Validierung; eine Zugriffskontrolle ist im OBJ-24-Pfad nicht sichtbar.
- **Evidence:** `src/app/api/v1/baseline/load/route.ts:27`, `src/app/api/v1/history/route.ts:114`
- **Priority:** Fix before deployment

### QA Re-Verification (2026-04-10, Batch-Run)
- [x] API- und Lib-Tests ausgefuehrt: `npx vitest run src/lib/obj24-baseline-history.test.ts src/app/api/v1/baseline/route.test.ts src/app/api/v1/history/route.test.ts` -- 7 passed, 1 failed.
- [ ] BUG-5 (NEW): Unit-Test `rollbacks the latest entry and creates a new rollback entry` schlaegt fehl. Der Rollback-Eintrag hat `changeType = manual_update` statt `rollback`. Dies bestaetigt BUG-1 und zeigt, dass der Rollback-Mechanismus nicht korrekt den Typ `rollback` zuweist.
- [ ] Keine UI-Authentifizierung: `/baseline` und `/history` Seiten sind weiterhin ohne Login erreichbar (BUG-4 bestaetigt).
- `npm run build` erfolgreich.

#### BUG-5: Rollback-Eintrag erhaelt falschen changeType `manual_update` statt `rollback`
- **Severity:** High
- **Steps to Reproduce:**
  1. Fuehre `npx vitest run src/lib/obj24-baseline-history.test.ts` aus.
  2. Test `rollbacks the latest entry and creates a new rollback entry` schlaegt fehl.
  3. Expected: `entriesAfterRollback[0].changeType === 'rollback'`
  4. Actual: `entriesAfterRollback[0].changeType === 'manual_update'`
- **Priority:** Fix before deployment

### Summary
- **Acceptance Criteria:** 11 passed, 1 failed, 0 blocked
- **Bugs Found:** 5 total (0 critical, 4 high, 1 medium, 0 low)
- **Security:** Issues found
- **Production Ready:** NO
- **Recommendation:** Zuerst Rollback-changeType-Zuweisung, Rollback-Semantik fuer den initialen Baseline-Load, DNS-Validierung fuer manuelle Aenderungen, echte Git-Commit-Nachvollziehbarkeit und Zugriffskontrolle schliessen; danach `/qa` fuer OBJ-24 erneut ausfuehren.

## Deployment
### Deployment-Status (Stand: 2026-04-11)
- Auslieferung erfolgt Git-first ueber Branch/PR/Merge nach `main`.
- Release- und Export-Nachweise werden in `docs/releases/` und `docs/exports/EXPORT-LOG.md` dokumentiert.
- Confluence bleibt Sekundaerziel: Export erst nach gepflegter Git-Dokumentation.
- Falls **Production Ready: NO** gilt, bleibt das Deployment als vorbereitet markiert und wird erst nach Freigabe produktiv ausgerollt.

## Implementation Update (2026-04-10)
- OBJ-24 ist als Backend+Frontend-Ende-zu-Ende umgesetzt:
- API: `GET /api/v1/baseline`, `POST /api/v1/baseline/load`,
  `GET/POST /api/v1/history`, `GET /api/v1/history/:id`,
  `POST /api/v1/history/:id/rollback`, `GET /api/v1/history/export`.
- Kernlogik liegt in `src/lib/obj24-baseline-history.ts` (Git-Baseline-Load, Source-Ref mit SHA/Ref, append-only Historie, feldbasierter Diff, Rollback als neuer Eintrag, JSON/CSV-Export).
- Frontend-Seiten:
  `src/app/baseline/*` fuer Baseline-Laden und Initialzustand "Keine Baseline geladen",
  `src/app/history/*` fuer Filter, Diff-Ansicht, Rollback und Export.
- Rollback ist konflikt-sicher umgesetzt: nur auf den neuesten Eintrag, ansonsten klarer `ROLLBACK_CONFLICT` mit Handlungsanweisung.
- Export enthaelt die Audit-Pflichtfelder (ID, Zeitstempel, Akteur, Scope, Summary, Ergebnis) und ist als Download fuer JSON/CSV verfuegbar.
