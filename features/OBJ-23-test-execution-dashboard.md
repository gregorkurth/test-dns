# OBJ-23: Test Execution Dashboard

## Status: Planned
**Created:** 2026-04-04
**Last Updated:** 2026-04-04

## Dependencies
- OBJ-9: Manual Test Runner (liefert manuelle Testausfuehrungen)
- OBJ-1: CI/CD Pipeline (liefert automatische Testausfuehrungen)
- OBJ-14: Release Management (liefert Release-Bezug fuer Teststaende)
- OBJ-2: Dokumentation (DoD, Export und Nachvollziehbarkeit)
- OBJ-7: Requirements Traceability View (Verknuepfung Requirement <-> Teststatus)

## User Stories
- Als QA-Verantwortlicher moechte ich ein Dashboard sehen, das fuer alle Tests den Status **Passed / Failed / Never Executed** zeigt, damit ich sofort den Testzustand erkenne.
- Als Release-Manager moechte ich den Teststand pro Release sehen, damit ich Freigaben faktenbasiert treffen kann.
- Als Tester moechte ich pro Testfall die Ausfuehrungshistorie sehen, damit ich nachvollziehen kann, wann und mit welchem Ergebnis getestet wurde.
- Als Projektleiter moechte ich manuelle und automatische Tests in einer gemeinsamen Sicht sehen, damit kein Medienbruch zwischen Testarten entsteht.
- Als Auditor moechte ich fuer ein Requirement den letzten Teststatus und den zugehoerigen Nachweis sehen, damit die Traceability pruefbar ist.
- Als Teamleiter moechte ich explizit sehen, welche Tests noch nie ausgefuehrt wurden, damit Testluecken geschlossen werden.

## Acceptance Criteria
- [ ] `feat~obj-23-ac-1~1` Dashboard-Ansicht zeigt aggregierte Kennzahlen: Anzahl Passed, Failed, Never Executed
- [ ] `feat~obj-23-ac-2~1` Dashboard kombiniert **manuelle** und **automatische** Tests in einer gemeinsamen Sicht
- [ ] `feat~obj-23-ac-3~1` Jeder Testfall zeigt den letzten bekannten Status, Zeitpunkt und Testtyp (manual/auto)
- [ ] `feat~obj-23-ac-4~1` Filter funktionieren nach Capability, Service Function, Requirement-ID, Testtyp und Status
- [ ] `feat~obj-23-ac-5~1` Eine Release-Sicht zeigt den Teststand je Release (Snapshot pro Release)
- [ ] `feat~obj-23-ac-6~1` Eine Run-Sicht zeigt den Stand je Test-Execution (Snapshot pro Testlauf)
- [ ] `feat~obj-23-ac-7~1` Tests ohne Ausfuehrungsnachweis werden als **Never Executed** markiert
- [ ] `feat~obj-23-ac-8~1` Bei Failed-Tests sind Fehlerhinweis und Verweis auf den Testnachweis sichtbar
- [ ] `feat~obj-23-ac-9~1` Die Sicht funktioniert offline ohne externe Requests
- [ ] `feat~obj-23-ac-10~1` Dokumentation beschreibt Datenquellen, Statusregeln und Interpretation fuer Nicht-Entwickler
- [ ] Capability-Mapping ist aktualisiert, sodass OBJ-23 in CAP-006 (Documentation & Quality) nachvollziehbar verankert ist

## Edge Cases
- Testfall existiert, aber es gibt keinen Ausfuehrungsnachweis -> Status = Never Executed
- Derselbe Test wurde mehrfach ausgefuehrt und liefert widerspruechliche Resultate -> Historie sichtbar, letzter Lauf klar markiert
- Es liegt nur ein manueller oder nur ein automatischer Nachweis vor -> Dashboard zeigt vorhandenen Typ und kennzeichnet fehlenden Typ
- Release wurde erstellt, aber kein zugehoeriger Test-Snapshot vorhanden -> Release wird als "Teststand unvollstaendig" markiert
- Testnachweis ist unvollstaendig oder nicht parsebar -> Test wird als "Nachweis fehlerhaft" ausgewiesen
- Duplikate mit gleicher Test-ID in unterschiedlichen Kontexten -> Kontext (Capability/SFN) wird zur eindeutigen Unterscheidung angezeigt

## Technical Requirements
- Einheitliches Ausfuehrungsmodell fuer manuelle und automatische Testresultate (run-basiert)
- Statuslogik ist klar definiert und dokumentiert: Passed, Failed, Never Executed
- Persistente Historie je Testlauf und je Release-Snapshot
- Verlinkung zu Requirement-IDs und Testnachweisen muss erhalten bleiben
- Datenquellen bleiben repo-basiert und offline-faehig

## Capability Impact (Schaerfung)
- CAP-006 Documentation & Quality wird um OBJ-23 erweitert
- SFN-DOC-004 (Testing Concept) wird um "Execution- und Release-Teststatussicht" fachlich erweitert
- Fuer die Umsetzung werden zusaetzliche ARCH-Requirements im CAP-006-Kontext benoetigt (nachgelagert)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
