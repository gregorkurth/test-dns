# OBJ-23: Test Execution Dashboard

## Status: In Progress
**Created:** 2026-04-04
**Last Updated:** 2026-04-04

## Dependencies
- OBJ-9: Manual Test Runner (liefert manuelle Testausfuehrungen)
- OBJ-1: CI/CD Pipeline (liefert automatische Testausfuehrungen)
- OBJ-14: Release Management (liefert Release-Bezug fuer Teststaende)
- OBJ-2: Dokumentation (DoD, Export und Nachvollziehbarkeit)
- OBJ-7: Requirements Traceability View (Verknuepfung Requirement <-> Teststatus)
- OBJ-4: Capabilities Dashboard (fachliche Struktur fuer Capability/SFN-Kontext)

## User Stories
- Als QA-Verantwortlicher moechte ich ein Dashboard sehen, das fuer alle Tests den Status **Passed / Failed / Never Executed** zeigt, damit ich sofort den Testzustand erkenne.
- Als Release-Manager moechte ich den Teststand pro Release sehen, damit ich Freigaben faktenbasiert treffen kann.
- Als Tester moechte ich pro Testfall die Ausfuehrungshistorie sehen, damit ich nachvollziehen kann, wann und mit welchem Ergebnis getestet wurde.
- Als Projektleiter moechte ich manuelle und automatische Tests in einer gemeinsamen Sicht sehen, damit kein Medienbruch zwischen Testarten entsteht.
- Als Auditor moechte ich fuer ein Requirement den letzten Teststatus und den zugehoerigen Nachweis sehen, damit die Traceability pruefbar ist.
- Als Teamleiter moechte ich explizit sehen, welche Tests noch nie ausgefuehrt wurden, damit Testluecken geschlossen werden.
- Als Delivery-Manager moechte ich den Teststatus pro OBJ sehen, damit ich den Umsetzungsstand je Feature steuern kann.

## Acceptance Criteria
- [ ] `feat~obj-23-ac-1~1` Dashboard-Ansicht zeigt aggregierte Kennzahlen: Anzahl Passed, Failed, Never Executed
- [ ] `feat~obj-23-ac-2~1` Dashboard kombiniert **manuelle** und **automatische** Tests in einer gemeinsamen Sicht
- [ ] `feat~obj-23-ac-3~1` Jeder Testfall zeigt den letzten bekannten Status, Zeitpunkt und Testtyp (manual/auto)
- [ ] `feat~obj-23-ac-4~1` Filter funktionieren nach OBJ, Capability, Service Function, Requirement-ID, Testtyp und Status
- [ ] `feat~obj-23-ac-5~1` Eine Release-Sicht zeigt den Teststand je Release (Snapshot pro Release)
- [ ] `feat~obj-23-ac-6~1` Eine Run-Sicht zeigt den Stand je Test-Execution (Snapshot pro Testlauf)
- [ ] `feat~obj-23-ac-7~1` Tests ohne Ausfuehrungsnachweis werden als **Never Executed** markiert
- [ ] `feat~obj-23-ac-8~1` Bei Failed-Tests sind Fehlerhinweis und Verweis auf den Testnachweis sichtbar
- [ ] `feat~obj-23-ac-9~1` Die Sicht funktioniert offline ohne externe Requests
- [ ] `feat~obj-23-ac-10~1` Dokumentation beschreibt Datenquellen, Statusregeln und Interpretation fuer Nicht-Entwickler
- [ ] `feat~obj-23-ac-11~1` Capability-Mapping ist aktualisiert, sodass OBJ-23 in CAP-006 (Documentation & Quality) nachvollziehbar verankert ist
- [ ] `feat~obj-23-ac-12~1` Dashboard ist in VS Code per Rechtsklick auf `test-execution-dashboard-live/index.html` mit "Open with Live Server" startbar (ohne `npm run dev`)
- [ ] `feat~obj-23-ac-13~1` Eine OBJ-Sicht zeigt den Teststand je OBJ-ID (Passed/Failed/Never Executed/Gesamt) fuer Management-Reporting

## Statusregeln (fachlich verbindlich)
- **Never Executed:** Es existiert kein gueltiger Ausfuehrungsnachweis fuer den Testfall im betrachteten Kontext (global, Release oder Run).
- **Passed:** Der letzte gueltige Nachweis ist erfolgreich.
- **Failed:** Der letzte gueltige Nachweis ist fehlgeschlagen oder als fehlerhaft markiert.
- Bei widerspruechlicher Historie gilt immer: **Letzter gueltiger Nachweis entscheidet den aktuellen Status**; Historie bleibt sichtbar.

## Edge Cases
- Testfall existiert, aber es gibt keinen Ausfuehrungsnachweis -> Status = Never Executed
- Derselbe Test wurde mehrfach ausgefuehrt und liefert widerspruechliche Resultate -> Historie sichtbar, letzter Lauf klar markiert
- Es liegt nur ein manueller oder nur ein automatischer Nachweis vor -> Dashboard zeigt vorhandenen Typ und kennzeichnet fehlenden Typ
- Release wurde erstellt, aber kein zugehoeriger Test-Snapshot vorhanden -> Release wird als "Teststand unvollstaendig" markiert
- Testnachweis ist unvollstaendig oder nicht parsebar -> Test wird als "Nachweis fehlerhaft" ausgewiesen
- Duplikate mit gleicher Test-ID in unterschiedlichen Kontexten -> Kontext (Capability/SFN) wird zur eindeutigen Unterscheidung angezeigt
- Ein Testfall ist mehreren OBJs zugeordnet -> Test wird in jeder betroffenen OBJ-Sicht mitgezaehlt
- Zeitstempel fehlen oder sind ungueltig -> Eintrag wird als "zeitlich nicht auswertbar" markiert und zaehlt nicht als gueltiger letzter Nachweis

## Technical Requirements
- Einheitliches Ausfuehrungsmodell fuer manuelle und automatische Testresultate (run-basiert)
- Statuslogik ist klar definiert und dokumentiert: Passed, Failed, Never Executed
- Persistente Historie je Testlauf und je Release-Snapshot
- Verlinkung zu Requirement-IDs und Testnachweisen muss erhalten bleiben
- Datenquellen bleiben repo-basiert und offline-faehig
- OBJ-Zuordnung basiert auf `capabilities/INDEX.md` (Capability -> OBJ Mapping) und bleibt versioniert nachvollziehbar
- Source of Truth bleibt Git: zuerst Repo-Update, danach ggf. Export in Confluence
- Statische Laufzeit fuer Live-Server-Betrieb unter `test-execution-dashboard-live/` mit build-time JSON aus `scripts/build-obj23-live-data.mjs`

## Abgrenzung (Out of Scope fuer OBJ-23)
- Keine automatische Testausfuehrung selbst (nur Sicht und Auswertung vorhandener Nachweise)
- Kein Build-/CI-Orchestrator (liegt bei OBJ-1)
- Kein Release-Workflow-Management (liegt bei OBJ-14)

## Capability Impact (Schaerfung)
- CAP-006 Documentation & Quality wird um OBJ-23 erweitert
- SFN-DOC-004 (Testing Concept) wird um "Execution- und Release-Teststatussicht" fachlich erweitert
- Zusaetzliche ARCH-Requirements sind im CAP-006-Kontext angelegt: RDTS-610 (Statuslogik), RDTS-611 (Run/Release-Snapshots + OFT-Traceability), RDTS-612 (Pro-OBJ-Sicht)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Scope**

OBJ-23 schafft eine zentrale, fuer Management und QA verstaendliche Sicht auf den Testzustand.
Die Sicht beantwortet drei Kernfragen: Was ist aktuell gruen/rot, was wurde nie getestet, und wie ist der Status pro OBJ, Release und Testlauf.

**Komponentenstruktur (Visual Tree)**

```
Test Execution Dashboard Page
+-- Kopfbereich
|   +-- Zweck, Datenstand, letzter Aktualisierungszeitpunkt
+-- KPI-Bereich
|   +-- Passed
|   +-- Failed
|   +-- Never Executed
+-- Filterleiste
|   +-- OBJ
|   +-- Capability
|   +-- Service Function
|   +-- Requirement-ID
|   +-- Testtyp (manual/auto)
|   +-- Status
|   +-- Reset
+-- Hauptliste "Aktueller Teststand"
|   +-- Testfallzeile mit letztem Status, Zeitpunkt, Typ, Nachweis-Link
+-- Sicht "Pro OBJ"
|   +-- Snapshot je OBJ-ID mit Passed/Failed/Never/Gesamt
+-- Sicht "Pro Release"
|   +-- Snapshot je Release mit Summen und Lueckenhinweisen
+-- Sicht "Pro Run"
|   +-- Chronologische Testlaeufe mit Ergebnisverteilung
+-- Detailpanel
|   +-- Historie eines Testfalls
|   +-- Zugeordnetes Requirement
|   +-- Verweis auf Nachweis
+-- Leer- und Fehlerzustaende
    +-- Keine Daten
    +-- Keine Treffer nach Filter
    +-- Nachweise fehlerhaft/unvollstaendig
```

**Datenmodell (in einfachen Worten)**

Das Dashboard arbeitet mit vier fachlichen Objekten:
- **Testfall-Stammdaten:** Test-ID, Requirement-Bezug, Capability/SFN-Kontext, Testtyp.
- **Ausfuehrungsnachweis:** Zeitpunkt, Ergebnis (passed/failed), Quelle, kurzer Hinweis, Nachweis-Link.
- **OBJ-Zuordnung:** Verknuepfung Capability -> OBJ-ID aus `capabilities/INDEX.md`.
- **Snapshot:** Zusammenfassung fuer einen Release-Stand oder einen konkreten Testlauf.

Der sichtbare "aktuelle Status" entsteht aus dem letzten gueltigen Nachweis pro Testfall.

**Backend-Bedarf**

- Phase 1 (MVP): Kein serverseitiger Zwang. Offline-faehige Lesesicht aus lokalen/repo-basierten Quellen.
- Phase 2 (optional): Konsolidierung ueber OBJ-3 fuer standardisierte Auslieferung in groesseren Betriebsumgebungen.
- Entscheid fuer jetzt: **frontend-first mit repo-basierter Datenhaltung**, damit airgapped Einsatz sofort moeglich ist.

**Technische Leitentscheidungen (fuer PM)**

- Gemeinsame Sicht fuer manual + auto reduziert Medienbruch und Fehlinterpretationen.
- Explizite "Never Executed"-Anzeige macht Testluecken steuerbar und auditierbar.
- Release- und Run-Sicht trennt strategische Freigabeentscheidung (Release) von operativer Fehlersuche (Run).
- Offline-Design sichert Nutzbarkeit in Zielumgebungen ohne Internet.

**Dependencies (Pakete)**

- Fuer die Planungsbasis sind keine zusaetzlichen Pflichtpakete erforderlich.
- Bestehende UI-Bausteine aus `src/components/ui/*` reichen fuer MVP-Struktur aus.

**Requirements Engineer Input**

- Statusregeln muessen im Repo als verbindliche Fachregel dokumentiert sein (keine impliziten Annahmen).
- Jede Kennzahl im Dashboard muss auf konkrete Nachweise zurueckfuehrbar sein.
- Nicht-Entwickler-Dokumentation muss Interpretation und Grenzen der Kennzahlen klar erklaeren.

**QA Engineer Input (Readiness)**

- AC-basierte Tests fuer KPI-Berechnung, Filter, Release-Sicht, Run-Sicht und Detailhistorie.
- Pflicht-Edge-Cases: Never Executed, widerspruechliche Historie, fehlerhafte Nachweise.
- Abnahmekriterium fuer Inbetriebnahme: Keine unklaren Statusuebergaenge und keine verdeckten Testluecken.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
