# OBJ-8: Export & Download

## Status: In Review
**Created:** 2026-03-17
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-5 (Participant Configuration Form) – Konfigurationsdaten
- OBJ-6 (DNS Zone File Generator) – Generierte Zone-Files

## User Stories
- Als Mission Network Operator möchte ich alle generierten Konfigurationsdateien (Zone-Files, TSIG-Key-Vorlage, named.conf-Snippet) als ZIP-Paket herunterladen, damit ich sie direkt auf mein System übertragen kann.
- Als Operator möchte ich die aktuelle Konfiguration als JSON exportieren, damit ich sie auf einem anderen Gerät importieren kann.
- Als Operator möchte ich eine ausgefüllte FMN DNS Configuration Form als PDF exportieren, damit ich sie für die Mission-Koordination verwenden kann.
- Als Operator möchte ich eine TSIG-Key-Vorlage herunterladen, damit ich die Zone-Transfer-Sicherheit (SREQ-529) konfigurieren kann.

## Acceptance Criteria
- [ ] `feat~obj-8-ac-1~1` "Alles herunterladen"-Button generiert ZIP-Archiv mit Forward Zone-File(s), Reverse Zone-File(s), named.conf-Snippet und TSIG-Key-Vorlage (Shell-Kommandobeispiel)
- [ ] `feat~obj-8-ac-2~1` Dateinamen im ZIP sind sprechend: `{zone-name}.zone`, `{zone-name}.reverse.zone`, `named.conf.local.snippet`, `tsig-keygen.sh`
- [ ] `feat~obj-8-ac-3~1` Einzeln-Download fuer jede Datei ist ebenfalls moeglich
- [ ] `feat~obj-8-ac-4~1` Konfiguration ist als JSON exportierbar (`{cc-number}-dns-config.json`)
- [ ] `feat~obj-8-ac-5~1` JSON-Konfiguration kann wieder importiert werden (Formular wird befuellt)
- [ ] `feat~obj-8-ac-6~1` Export funktioniert vollstaendig offline (kein Server)
- [ ] `feat~obj-8-ac-7~1` Wenn Konfiguration unvollstaendig ist, bleibt der Exportbutton deaktiviert mit Tooltip "Bitte zuerst alle Pflichtfelder ausfuellen"

## Edge Cases
- ZIP-Generierung bei sehr vielen Zonen → Fortschritts-Indikator oder asynchrone Generierung
- Browser blockiert Download (z.B. Popup-Blocker) → Fallback: Direktlink anzeigen
- JSON-Import mit veralteter Schema-Version → Warnung "Format veraltet, einige Felder wurden nicht importiert"
- Dateiname enthält Sonderzeichen (z.B. Punkte in Zone-Namen) → Sanitierung des Dateinamens

## Technical Requirements
- ZIP-Generierung via `jszip` (lokal gebundelt für Offline)
- PDF-Export via `@react-pdf/renderer` oder `html2pdf.js` (lokal gebundelt)
- Exportfunktionen arbeiten ohne externe Dienste und ohne Cloud-Abhaengigkeit
- Exportmanifest (Dateiname, Zeitstempel, Quelle, Version) wird mit dem Paket gespeichert
- Importvalidierung fuer JSON muss Schema-Version und Pflichtfelder pruefen

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Scope**

OBJ-8 stellt sicher, dass Operatoren aus einem fertigen Konfigurationsstand sofort transportfaehige Artefakte erzeugen koennen: einzeln oder als Gesamtpaket.
Die Funktion ist voll offlinefaehig und unterstuetzt sowohl technische Uebergabe als auch Abstimmung mit Fachstellen.

**Komponentenstruktur (Visual Tree)**

```
Export & Download Page
+-- Header / Kontext
|   +-- Aktiver Participant + Stand
+-- Export-Aktionen
|   +-- "Alles herunterladen" (ZIP)
|   +-- Einzel-Download je Datei
|   +-- JSON Export
|   +-- JSON Import
|   +-- FMN-Formular PDF Export
+-- Ergebnis / Validierung
|   +-- Export-Status
|   +-- Fehlermeldungen bei unvollstaendiger Konfiguration
+-- Manifest-Vorschau
    +-- enthaltene Dateien
    +-- Versions- und Zeitstempel
```

**Datenmodell (in einfachen Worten)**

Ein Exportlauf erzeugt:
- `files[]`: Liste aller zu exportierenden Inhalte (Zone, Reverse, TSIG, Snippet, JSON, optional PDF)
- `manifest`: Metadaten mit Participant-ID, Version, Erstellzeit, Schema-Version
- `validation`: Ergebnis vor Export (`ok`/`error` + Hinweise)

**Technische Leitentscheidungen (fuer PM)**

- ZIP als Standard reduziert Fehler bei manueller Datei-Zusammenstellung.
- JSON Export/Import ermoeglicht kontrollierten Geraetewechsel ohne Datenverlust.
- PDF-Export deckt Abstimmungs- und Freigabeprozesse ausserhalb der Entwicklungswerkzeuge ab.
- Dateinamenstandard und Manifest verbessern Nachvollziehbarkeit in Audits.

**Dependencies (Packages)**

- `jszip` fuer ZIP-Buendelung im Browser.
- `@react-pdf/renderer` (oder `html2pdf.js`) fuer den lokalen PDF-Export.

**Requirements Engineer Input**

- Jeder Exporttyp benoetigt klare Pflichtfelder und eine definierte Fehlermeldung bei Luecken.
- Import ist nur gueltig, wenn Schema-Version und Mindestdaten kompatibel sind.
- Dateinamensregeln muessen fest beschrieben sein, damit automatisierte Pruefungen moeglich sind.

**QA Engineer Input (Readiness)**

- Pflichttests: ZIP-Inhalt, Dateinamensschema, Offline-Export, JSON Roundtrip (Export -> Import).
- Edge-Case-Tests: alte Schema-Version, Sonderzeichen in Zonenamen, unvollstaendige Konfiguration.
- Abnahmekriterium: ein Operator kann ohne Entwicklerhilfe ein korrektes Exportpaket erzeugen und wieder einlesen.

## QA Test Results
**Tested:** 2026-04-09
**App URL:** http://localhost:3000/export-download
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: ZIP mit Forward/Reverse/named.conf/TSIG
- [x] Export-Draft erzeugt Forward- und Reverse-Zones, `named.conf.local.snippet`, `tsig-keygen.sh` sowie JSON.
- [x] ZIP-Archiv wird lokal erzeugt und enthaelt zusaetzlich `export-manifest.json`.

#### AC-2: Sprechende Dateinamen
- [x] Dateinamensregeln sind umgesetzt (`{zone}.zone`, `{zone}.reverse.zone`, `named.conf.local.snippet`, `tsig-keygen.sh`).
- [x] Sonderzeichen werden ueber `sanitizeObj8FileNameSegment` bereinigt.

#### AC-3: Einzel-Download je Datei
- [x] Einzel-Buttons fuer Forward, Reverse, named.conf, TSIG und JSON sind vorhanden.
- [x] Paketinhalt zeigt jede Datei zusaetzlich mit eigenem Download-Button.

#### AC-4: JSON Export (`{cc-number}-dns-config.json`)
- [x] JSON-Exportdatei wird im Draft erstellt.
- [x] Dateiname folgt dem Schema `${ccNumber}-dns-config.json` (normalisiert).

#### AC-5: JSON Import befuellt Formular wieder
- [ ] BUG: JSON-Import setzt aktuell nur den Export-Kontext in OBJ-8; das OBJ-5 Formular wird nicht wiederbefuellt.

#### AC-6: Vollstaendig offline (kein externer Server)
- [x] ZIP/JSON/Manifest-Erzeugung laeuft lokal im Browser ohne externe Services.
- [x] Hinweis: Participant-Auswahl nutzt die interne API; fuer "nur lokal ohne API" ist JSON-Import als Fallback nutzbar.

#### AC-7: Export-Buttons bei unvollstaendiger Konfiguration deaktiviert + Tooltip
- [x] Aktionen sind bei `ready=false` deaktiviert.
- [x] Tooltip `Bitte zuerst alle Pflichtfelder ausfuellen` ist auf den Buttons gesetzt.

### Edge Cases Status

#### EC-1: Viele Zonen (asynchron/Progress)
- [ ] BUG: Kein expliziter Fortschrittsindikator fuer grosse Exportmengen vorhanden.

#### EC-2: Browser blockiert Download
- [ ] BUG: Kein dedizierter Fallback-Flow (z. B. Direktlink/Retry-Hinweis) fuer blockierte Downloads implementiert.

#### EC-3: JSON-Import mit veralteter Schema-Version
- [x] Ungueltiges/inkompatibles JSON wird mit klarer Fehlermeldung abgelehnt.

#### EC-4: Sonderzeichen in Dateinamen
- [x] Dateinamen werden sanitisiert und sind ZIP-sicher.

### Security Audit Results
- [x] Input Validation: JSON-Import hat Schema- und CC-Number-Validierung.
- [x] Injection Surface: Keine unsichere HTML-Ausgabe fuer importierte Daten erkannt.
- [x] Secrets: In geprueften Export-Artefakten keine offensichtlichen Credentials-Hardcodes gefunden.
- [x] Hinweis: APIs sind ohne Auth erreichbar (aktueller v1-Scope).

### Regression Testing
- [x] `npm run lint` erfolgreich.
- [x] `npm run build` erfolgreich.
- [x] `npm run test:run` erfolgreich (`8` Dateien, `33` Tests).
- [x] Gezielte OBJ-8 Tests erfolgreich (`src/lib/obj8-export.test.ts`).

### Bugs Found

#### BUG-1: JSON-Import repopuliert OBJ-5 Formular nicht
- **Severity:** High
- **Steps to Reproduce:**
  1. JSON in `/export-download` importieren.
  2. Zu `/participant-config` wechseln.
  3. Erwartet: Formular ist mit importierten Werten befuellt.
  4. Ist: Import wirkt nur in OBJ-8, Formular bleibt unveraendert.
- **Priority:** Fix before deployment

#### BUG-2: Kein Fortschrittsindikator fuer grosse Exportmengen
- **Severity:** Low
- **Steps to Reproduce:**
  1. Konfiguration mit vielen Zonen/Records laden.
  2. ZIP-Export starten.
  3. Erwartet: Sichtbarer Fortschritt/Busy-Zustand fuer den Lauf.
  4. Ist: Kein dedizierter Progress-Status.
- **Priority:** Fix in next sprint

#### BUG-3: Kein Fallback bei browserseitig blockiertem Download
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Browser so konfigurieren, dass Download blockiert wird.
  2. Einzel- oder ZIP-Download ausloesen.
  3. Erwartet: Klarer Fallback-Hinweis/Direktlink.
  4. Ist: Kein eigener Fallback-Flow sichtbar.
- **Priority:** Fix in next sprint

### Summary
- **Acceptance Criteria:** 6/7 passed
- **Bugs Found:** 3 total (0 Critical, 1 High, 1 Medium, 1 Low)
- **Security:** Pass
- **Production Ready:** NO
- **Recommendation:** BUG-1 vor Deployment beheben; BUG-2/3 zeitnah nachziehen.

### QA Limitations
- Echte Browser-Downloadblocker- und Cross-Browser-Pruefung wurden in dieser CLI-Session nicht vollumfaenglich interaktiv verifiziert.
- UI-Verhalten wurde ueber Build-Artefakte, Codepfad-Review und automatisierte Tests abgesichert.

### Re-Test nach Bugfixes (2026-04-09)
- [x] AC-5 geschlossen: JSON-Import schreibt jetzt den OBJ-5-Draft in LocalStorage (`obj5.participant-form.draft.v1`) und kann in `/participant-config` direkt weiterbearbeitet werden.
- [x] EC-1 geschlossen: ZIP-Export zeigt jetzt einen expliziten Busy-/Progress-Zustand (`ZIP wird erstellt...`).
- [x] EC-2 geschlossen: Manueller Fallback-Download-Link wird nach jeder Download-Ausloesung angezeigt.
- [x] Regression: `npm run lint`, `npm run test:run`, `npm run build` erfolgreich.

### Re-Test Summary
- **Acceptance Criteria:** 7/7 passed
- **Bugs Found:** 0 open
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** Deployment-freigabe moeglich.

## Deployment
_To be added by /deploy_
