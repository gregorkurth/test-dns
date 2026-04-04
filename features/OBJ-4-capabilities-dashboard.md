# OBJ-4: Capabilities Dashboard

## Status: In Review
**Created:** 2026-03-17
**Last Updated:** 2026-04-04

## Dependencies
- OBJ-3: REST API (liefert Capability-Daten vertraglich und versioniert)
- OBJ-2: Dokumentation (sichert Begriffe, Maturitaetsdefinitionen und Nachvollziehbarkeit)

## User Stories
- Als Mission Network Operator möchte ich die vollständige Capabilities-Hierarchie (CAP → Services → Service Functions → Requirements) auf einen Blick sehen, damit ich verstehe, welche DNS-Fähigkeiten zu implementieren sind.
- Als Operator möchte ich zu einem Requirement navigieren und dessen Originaltext sowie Akzeptanzkriterien lesen, damit ich weiss, was konkret umzusetzen ist.
- Als Operator möchte ich den Maturitätsstatus einer Capability sehen (L0–L5), damit ich den Implementierungsfortschritt beurteilen kann.
- Als Operator möchte ich Requirements nach Typ filtern ([NATO] / [ARCH] / [CUST] / [INT]), damit ich schnell die relevanten Vorgaben finde.
- Als Operator möchte ich Requirements nach Priorität filtern (🟥 MUSS / 🟧 SOLLTE / 🟨 KANN), damit ich mich auf die Pflichtanforderungen konzentrieren kann.

## Acceptance Criteria
- [ ] Capabilities-Hierarchie wird als navigierbare Baumstruktur dargestellt: CAP-001 → Services → Service Functions → Requirements
- [ ] Jede Ebene (Capability, Service, SFN, Requirement) ist anklickbar und zeigt eine Detailansicht
- [ ] Requirement-Detailansicht zeigt: ID, Originaltext (EN), deutsche Übersetzung, Priorität, Quellentyp, Akzeptanzkriterien
- [ ] Filter nach Quellentyp ([NATO] / [ARCH] / [CUST] / [INT]) funktioniert
- [ ] Filter nach Priorität (MUSS / SOLLTE / KANN) funktioniert
- [ ] Maturitätsstatus (L0–L5) ist pro Capability sichtbar
- [ ] App funktioniert vollständig offline (keine externen Requests)
- [ ] Daten werden aus den lokalen Markdown-Dateien unter `capabilities/` geladen (build-time)
- [ ] Dashboard ist in VS Code per Rechtsklick auf `capability-dashboard-live/index.html` mit "Open with Live Server" startbar (ohne `npm run dev`)

## Edge Cases
- Was passiert, wenn eine Service Function keine Requirements hat? → Leerer Zustand mit Hinweis "Keine Requirements definiert"
- Was passiert bei einem Requirement ohne Übersetzung? → Nur Originaltext wird angezeigt
- Was wenn `capabilities/INDEX.md` fehlt? → Fehlermeldung "Capabilities-Daten nicht gefunden"
- Sehr lange Requirement-Texte? → Truncated mit "Mehr anzeigen"-Toggle

## Technical Requirements
- Build-time Datenaufbereitung aus `capabilities/**/*.md` via `scripts/build-obj4-live-data.mjs`
- Statische Laufzeit fuer v1 unter `capability-dashboard-live/index.html` (VS Code Live Server, ohne npm-Startpflicht)
- Kein Client-seitiger API-Call zu externen Diensten
- Browser-Support: Chrome, Firefox (aktuelle Version)
- Responsive für Desktop (1024px+)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Scope**

OBJ-4 ist die zentrale Lesesicht fuer Mission Network Operators.
Das Dashboard macht Capabilities, Services, Service Functions und Requirements transparent, filterbar und offline nutzbar.

**Komponentenstruktur (Visual Tree)**

```
Capabilities Dashboard Page
+-- Header / Kontextbereich
|   +-- Zielbild und Datenstand
+-- Filterleiste
|   +-- Filter Quellentyp
|   +-- Filter Prioritaet
|   +-- Reset
+-- Hauptbereich
|   +-- Hierarchiebaum (CAP -> Service -> SFN -> Requirement)
|   +-- Detailpanel zur Auswahl
|       +-- Requirement-Text (Original + Uebersetzung)
|       +-- Prioritaet / Typ
|       +-- Akzeptanzkriterien
+-- Maturitaetsanzeige
|   +-- L0-L5 pro Capability
+-- Leer- und Fehlerzustaende
    +-- Keine Daten
    +-- Keine Treffer nach Filter
    +-- Fehlende Teilinformationen
```

**Datenmodell (in einfachen Worten)**

Ein Dashboard-Eintrag besteht aus:
- Capability mit Name, ID und Maturitaetslevel
- zugehoerigen Services
- zugehoerigen Service Functions
- Requirements mit Prioritaet, Typ und Textfeldern

Die Filter arbeiten auf Requirement-Ebene, beeinflussen aber die sichtbare Baumansicht.

**Backend-Bedarf (angepasst fuer Live-Server-MVP)**

- Phase 1 (jetzt): frontend-only Laufzeit mit statisch generierter JSON-Datei aus den lokalen Markdown-Quellen.
- Phase 2 (optional): Integration mit OBJ-3 fuer versionierte API-Lieferung bei produktiver Betriebsintegration.
- Offline-Anforderung bleibt in beiden Phasen erhalten.

**Technische Leitentscheidungen (fuer PM)**

- Baum plus Detailpanel ist fuer Nicht-Entwickler schneller erfassbar als reine Tabellen.
- Filter auf Typ/Prioritaet helfen bei operativer Priorisierung.
- Maturitaetslevel in derselben Sicht reduziert Medienbruch.
- Offline-Design ist Pflicht, weil Zielumgebungen ohne Internet arbeiten.

**Requirements Engineer Input**

- Alle sichtbaren Felder muessen auf vorhandene Requirement-Quellen zurueckfuehrbar sein.
- Fehlende Uebersetzungen oder unvollstaendige Eintraege werden als eigene Qualitaetsfaelle dokumentiert.
- Filterlogik (Typ/Prioritaet) gilt als fachliche Muss-Anforderung und wird explizit nachgewiesen.

**QA Engineer Input (Readiness)**

- AC-basierte Tests fuer Baum-Navigation, Filter und Detailansicht.
- Edge-Case-Tests: fehlende Uebersetzung, leere SFN, lange Texte, fehlende Daten.
- Regression-Schutz: OBJ-4 muss bei API-Aenderungen von OBJ-3 weiterhin dieselben Kerninformationen liefern.
- Abnahmeregel fuer Go-Live von OBJ-4: keine kritischen Datenluecken in der Operator-Sicht.

**Abhaengigkeiten / Bausteine**

- Bestehende UI-Bausteine aus `src/components/ui/*`
- API-Vertrag aus OBJ-3
- Maturitaets- und Begriffsdefinitionen aus Dokumentationsbasis (OBJ-2)

## QA Test Results

**Tested:** 2026-04-04
**App URL:** `capability-dashboard-live/index.html` (Live Server, z. B. `http://127.0.0.1:5500/capability-dashboard-live/index.html`)
**Tester:** QA Engineer (AI)

### Re-Test nach Fix 1 und Fix 2 (2026-04-04)
- [x] Fix 1 verifiziert: Build-Skript bricht ohne `capabilities/INDEX.md` deterministisch ab und schreibt `sourceIndex` in das exportierte JSON.
- [x] Fix 2 verifiziert: `npm run lint` nutzt ESLint Flat-Config (`eslint . --max-warnings=0`) und laeuft fehlerfrei durch.
- [x] Regressionslauf nach den Fixes erfolgreich: `npm run build`, `npm run build:obj4-live-data`, `node --check` fuer Skript und Dashboard.
- [x] Smoke-Test verifiziert: `npm run test:run` erfolgreich (`1` Testdatei, `1` Test bestanden).

### Acceptance Criteria Status

#### AC-1: Capabilities-Hierarchie als Baumstruktur
- [x] CAP -> Service -> SFN -> Requirement wird aus den generierten Daten gerendert.

#### AC-2: Jede Ebene anklickbar mit Detailansicht
- [x] Capability-, Service-, SFN- und Requirement-Knoten sind anklickbar.
- [x] Detailpanel aktualisiert sich je Auswahl.

#### AC-3: Requirement-Detail mit geforderten Feldern
- [x] ID, Originaltext, deutsche Uebersetzung, Prioritaet, Quellentyp und Akzeptanzkriterien sind im Detail sichtbar.

#### AC-4: Filter nach Quellentyp
- [x] Filter `[NATO]/[ARCH]/[CUST]/[INT]` ist implementiert und wirkt auf Requirement-Ebene.

#### AC-5: Filter nach Prioritaet
- [x] Filter `MUSS/SOLLTE/KANN` ist implementiert und funktioniert.

#### AC-6: Maturitaetsstatus sichtbar
- [x] Maturitaetsstatus wird pro Capability angezeigt (z. B. `L0 – Idea`).

#### AC-7: Vollstaendig offline-faehig
- [x] Keine externen API-Calls; Daten werden lokal aus `./data/capabilities-dashboard.json` geladen.

#### AC-8: Build-time Datenladung aus `capabilities/`
- [x] Build-Skript `npm run build:obj4-live-data` erzeugt Daten erfolgreich (`9` Capabilities, `124` Requirements).

#### AC-9: Start via VS Code Live Server ohne `npm run dev`
- [x] Statische Struktur mit `index.html`, `app.js`, `styles.css` und Datenfile vorhanden; fuer Live Server geeignet.

### Edge Cases Status

#### EC-1: Service Function ohne Requirements
- [x] Codepfad vorhanden: Anzeige "Keine Requirements definiert".
- [x] Hinweis: In den aktuellen Daten existieren keine SFNs ohne Requirements (`0` Treffer), daher nicht datengetrieben reproduziert.

#### EC-2: Requirement ohne Uebersetzung
- [x] Fallback-Text vorhanden ("Keine deutsche Uebersetzung vorhanden.").
- [x] Datenseitig validiert: `78` Requirements ohne deutsche Uebersetzung vorhanden.

#### EC-3: Fehlende Capabilities-Daten
- [x] Fehlerzustand vorhanden: "Capabilities-Daten nicht gefunden."
- [x] Build-Skript prueft `capabilities/INDEX.md` als Pflichtquelle und bricht mit klarer Fehlermeldung ab, falls die Datei fehlt.

#### EC-4: Sehr lange Requirement-Texte mit Toggle
- [x] "Mehr anzeigen/Weniger anzeigen" ist implementiert.
- [x] Hinweis: Aktuelle Daten enthalten keine Texte > 360 Zeichen (`0` Treffer), daher nur codebasiert verifiziert.

### Security Audit Results
- [x] Authentifizierung: Nicht anwendbar (read-only Dashboard ohne Login).
- [x] Autorisierung: Nicht anwendbar (keine benutzerspezifischen Datenpfade).
- [x] Input/XSS: Kein `innerHTML`, kein `eval`, keine dynamische Codeausfuehrung.
- [x] Externe Requests/Secrets: Keine externen Endpunkte und keine Secret-Ausgabe im Dashboard-Code.
- [x] Rate Limiting: Nicht anwendbar (statische, lokale Datenquelle).

### Regression Status
- [x] `npm run build:obj4-live-data` erfolgreich.
- [x] `node --check capability-dashboard-live/app.js` erfolgreich.
- [x] `node --check scripts/build-obj4-live-data.mjs` erfolgreich.
- [x] `npm run build` erfolgreich.
- [x] `npm run lint` erfolgreich (ESLint-Setup auf Flat-Config migriert).
- [x] `npm run test:run` erfolgreich (`1` Testdatei, `1` Test bestanden).

### Bugs Found
- Keine offenen Critical/High/Medium-Bugs fuer OBJ-4.
- Hinweis: Testabdeckung ist minimal (Smoke-Test vorhanden); weitere fachliche Tests sind als naechster Schritt sinnvoll.

### Summary
- **Acceptance Criteria:** 9/9 passed
- **Bugs Found:** 0 offene Bugs (0 critical, 0 high, 0 medium, 0 low)
- **Security:** Pass (keine kritischen Findings)
- **Production Ready:** YES
- **Recommendation:** OBJ-4 ist QA-seitig abgeschlossen und bereit fuer den naechsten Schritt.

## Deployment

**Deploy Date:** 2026-04-04
**Git Branch:** `main`
**Git Commit (main):** `016e736`
**Deployment Trigger:** Push auf `origin/main` erfolgt.
**Production URL:** Ausstehend (Vercel-URL noch nicht verifiziert)
**Status:** Deploy angestossen, Verifikation der produktiven URL noch offen.

### Deploy Checklist (aktuell)
- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm run test:run` (Smoke-Test)
- [x] `npm run build:obj4-live-data`
- [x] QA-Freigabe ohne Critical/High-Bugs
- [x] Code nach `main` gepusht
- [ ] Direkter `npx vercel --prod --yes` Lauf (in dieser Session wegen verweigerter Netz-Freigabe nicht ausgefuehrt)
- [ ] Produktions-URL + Laufzeitchecks (Browser/Logs) final bestaetigt
