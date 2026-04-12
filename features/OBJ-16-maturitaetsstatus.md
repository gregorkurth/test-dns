# OBJ-16: Maturitätsstatus / Reifegradübersicht

## Status: Completed
**Created:** 2026-04-03
**Last Updated:** 2026-04-12

## Dependencies
- OBJ-4: Capabilities Dashboard (Maturitätsstufen L0–L5 pro Capability)
- OBJ-7: Requirements Traceability View (Anforderungsabdeckung als Grundlage)
- OBJ-9: Manual Test Runner (manuelle Testausfuehrung als Eingangsdaten)
- OBJ-23: Test Execution Dashboard (Passed/Failed/Never pro Run/Release)
- OBJ-2: Dokumentation (arc42/Handbuch/Betriebsdoku als Reifegradkriterium)
- OBJ-14: Release Management (Release-Kanaele, Update-Hinweise, Export-Status)
- OBJ-17: SBOM & Security-Scanning (Security-Status und SBOM-Verfuegbarkeit als Reifegradindikatoren)
- OBJ-19: Zarf-Paket (Offline-/Zarf-Bereitschaft als Maturitätsindikator)
- OBJ-21: GitOps / Argo CD (App-of-Apps-Bereitschaft als Maturitätsindikator)

## User Stories
- Als Mission Network Operator moechte ich den aktuellen Reifegrad des Services auf einen Blick sehen, damit ich die Einsatzfaehigkeit fuer Uebung/Betrieb bewerten kann.
- Als Product Owner moechte ich je Feature sehen, was Released, Beta oder Preview ist, damit ich Freigaben und Kommunikation steuern kann.
- Als QA-Verantwortlicher moechte ich den kombinierten Teststatus (manual + automated + never executed) pro Objekt und Release sehen, damit Risiken transparent sind.
- Als Security-Verantwortlicher moechte ich den Security-Reifegrad (SBOM, Scan-Status, offene Critical/High Findings) sehen, damit Sicherheitsfreigaben nachvollziehbar sind.
- Als Dokumentationsverantwortlicher moechte ich erkennen, ob arc42, Benutzerhandbuch und Betriebsdoku fuer den aktuellen Stand nachgefuehrt sind.
- Als Platform Engineer moechte ich Offline-Bereitschaft (Zarf, Export-Log, App-of-Apps) sehen, damit der Airgap-Transport planbar bleibt.
- Als Stakeholder moechte ich offene Gaps und naechste Meilensteine sehen, damit ich Prioritaeten und Entscheidungen zeitnah treffen kann.

## Acceptance Criteria
- [ ] Eine Maturitaetsansicht ist im GUI erreichbar und fuer Nicht-Entwickler verstaendlich benannt.
- [ ] Der Gesamt-Reifegrad wird auf einer L0-L5-Skala dargestellt; die Bewertungslogik ist im UI erklaert.
- [ ] Pro Feature werden mindestens angezeigt: ID, Name, Phase, Status, Release-Kanal (Released/Beta/Preview), Teststatus.
- [ ] Der Teststatus wird aus vorhandenen Quellen konsolidiert und zeigt klar: Passed, Failed, Never Executed.
- [ ] Die Anforderungsabdeckung wird als Kennzahl gezeigt (z. B. abgedeckte Requirements / total).
- [ ] Security-Indikator zeigt mindestens: SBOM vorhanden, letzter Scan-Status, offene Critical/High Findings.
- [ ] Doku-Indikator zeigt mindestens: arc42 aktuell, Benutzerhandbuch aktuell, Betriebsdoku aktuell.
- [ ] Offline-Indikator zeigt mindestens: Zarf-Verfuegbarkeit, letzter Export-Status, App-of-Apps-Bereitschaft.
- [ ] Offene Punkte werden priorisiert sichtbar gemacht (Blocker, hohes Risiko, normal).
- [ ] Nächste Meilensteine sind konfigurierbar und in der Ansicht sichtbar.
- [ ] Die komplette Ansicht bleibt ohne externe Online-Abhaengigkeit nutzbar (airgapped/offline).
- [ ] Die gleiche Kanal-Semantik (Released/Beta/Preview) wird in dieser Ansicht und in bestehenden UIs konsistent verwendet.
- [ ] Eine druck-/exportfreundliche Darstellung ist vorhanden, damit Management-Reviews ohne Spezialtool moeglich sind.

## Edge Cases
- Keine Testdaten vorhanden: Status wird als "Never Executed" markiert, nicht als Passed/Failed.
- Feature ist deployed, aber Tests sind failed: Feature bleibt als Risiko markiert, Gesamtlevel darf nicht auf GA-Reife springen.
- Feature hat keinen Release-Kanal gepflegt: Eintrag wird als "Unknown" mit Warnhinweis markiert.
- Security-Artefakte fehlen (keine SBOM/kein Scanreport): Security-Indikator faellt auf "Unvollstaendig".
- Doku fehlt oder ist veraltet: Doku-Indikator faellt auf "Nachziehen notwendig".
- Offline-Artefakte fehlen (kein Zarf/kein Export-Eintrag): Offline-Indikator faellt auf "Nicht freigegeben".
- Datenquellen sind widerspruechlich (z. B. INDEX sagt Completed, QA zeigt offene High Findings): Ansicht zeigt "Konflikt" statt stillschweigende Priorisierung.
- Einzelne Quellen sind nicht lesbar: Teilbereich wird als "Unbekannt" markiert; Gesamtsicht bleibt verfuegbar.
- Sehr viele Features vorhanden: Ansicht bleibt filterbar nach Phase, Status, Kanal, Risiko.
- Nur lokale Umgebung vorhanden: Alle Kennzahlen muessen dennoch aus Repository-Daten generierbar sein.

## Technical Requirements
- Source of truth ist das Repository; keine manuelle Primardatenpflege in externen Tools.
- Eingangsquellen umfassen mindestens Feature-Index, Feature-Spezifikationen inkl. QA-Abschnitten, Release-Notices und Security-/SBOM-Metadaten.
- Reifegrad basiert auf einem nachvollziehbaren Modell mit gewichteten Bausteinen: Delivery, Qualität, Security, Dokumentation, Offline-Readiness.
- Release-Kanaele werden normiert auf Released, Beta, Preview und zentral gepflegt.
- Sicherheitsbewertung nutzt mindestens SBOM-Status, Scan-Ergebnisstatus und offene Critical/High Findings.
- Testbewertung unterscheidet verpflichtend zwischen Passed, Failed und Never Executed.
- Offline-Betrieb ist Pflicht: keine Laufzeitabhaengigkeit zu Internet, Cloud oder externen APIs.
- Export-/Drucksicht ist vorgesehen fuer Management-Review und Audit-Nachweis.
- Datenqualitaet wird abgesichert durch Pflichtfelder und sichtbare Kennzeichnung unvollstaendiger Daten.
- Architektur bleibt erweiterbar fuer spaetere Integrationen (z. B. zusaetzliche Compliance-Kennzahlen), ohne das Bewertungsmodell zu brechen.

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
### Scope
- Dieses Objekt liefert eine zentrale Management-Sicht auf den Reifegrad des Services.
- Im Scope sind Darstellung, Bewertung und Nachvollziehbarkeit aus bestehenden Repository-Daten.
- Nicht im Scope sind neue fachliche Datenquellen ausserhalb des Repositories oder ein eigenes Reporting-System.

### Component Structure (Visual Tree)
```text
Maturitaetsstatus-Seite
+-- Kopfbereich
|   +-- Gesamtlevel (L0-L5)
|   +-- Letztes Update
|   +-- Filter (Phase, Status, Release-Kanal, Risiko)
+-- KPI-Bereich
|   +-- Delivery-KPI (Feature-Fortschritt)
|   +-- Test-KPI (Passed/Failed/Never)
|   +-- Security-KPI (SBOM/Scan/Findings)
|   +-- Doku-KPI (arc42/Handbuch/Betrieb)
|   +-- Offline-KPI (Zarf/Export/App-of-Apps)
+-- Feature-Tabelle
|   +-- Feature-Zeile
|       +-- ID + Name
|       +-- Status + Release-Kanal
|       +-- Teststatus
|       +-- Security-/Doku-/Offline-Hinweise
+-- Risikobereich
|   +-- Blocker
|   +-- High-Risk Punkte
|   +-- Empfohlene naechste Schritte
+-- Exportbereich
    +-- Druck-/PDF-Sicht
    +-- Hinweis auf Export-Nachweis
```

### Data Model (plain language)
- Es gibt einen Datensatz fuer den Gesamtstatus mit aktuellem Level, Zeitstempel und Kurzbegruendung.
- Es gibt pro Feature einen Eintrag mit Identitaet, Fortschritt, Kanalstatus, Testlage und Risikoindikatoren.
- Es gibt pro Bewertungsdimension (Delivery, Test, Security, Doku, Offline) eine eigene Kennzahl mit Ampelstatus.
- Es gibt eine offene Punkte-Liste mit Prioritaet, Bezug (Feature/Dimension) und empfohlenem naechsten Schritt.
- Es gibt Metadaten fuer Nachweis und Export (z. B. letzte Aktualisierung, letzte Freigabe, Nachweisstatus).

### Technical Decisions
- Eine zentrale Management-Sicht ist noetig, damit technische und nicht-technische Stakeholder denselben Reifegrad sehen.
- Die Bewertung bleibt repository-basiert, damit die Historie versioniert, auditierbar und offline verfuegbar ist.
- Release-Kanaele werden vereinheitlicht, um Missverstaendnisse zwischen "Beta", "Preview" und "Released" zu vermeiden.
- Teststatus mit "Never Executed" bleibt explizit sichtbar, damit fehlende Testabdeckung nicht als gruen interpretiert wird.
- Security und SBOM werden als eigene Dimension gefuehrt, damit Freigaben nicht nur auf Funktionsstatus beruhen.
- Eine druckfreundliche Sicht wird vorgesehen, weil Management- und Offline-Prozesse haeufig medienbruchbehaftet sind.

### Dependencies and Interfaces
- Abhaengig von OBJ-7 fuer Requirements-Abdeckung.
- Abhaengig von OBJ-9 und OBJ-23 fuer Teststatus und Testhistorie.
- Abhaengig von OBJ-14 fuer Release-Kanaele und Update-Kontext.
- Abhaengig von OBJ-17 fuer Security-/SBOM-Kennzahlen.
- Abhaengig von OBJ-19 und OBJ-21 fuer Offline- und GitOps-Bereitschaft.
- Abhaengig von OBJ-2 fuer Doku-Vollstaendigkeit (arc42, Handbuch, Betriebsdoku).

### QA Readiness
- Bewertungsregeln sind vorab als testbare Soll-Kriterien dokumentiert.
- Jede Kennzahl hat klare gueltige Werte und ein definiertes Verhalten bei fehlenden Daten.
- Die Ansicht ist auf Desktop/Tablet/Mobile sowie in Drucksicht pruefbar.
- Konsistenztests sichern, dass Release-Kanaele und Statusbezeichnungen im gesamten GUI gleich verwendet werden.
- Negative Tests decken Konflikte zwischen Datenquellen, fehlende Security-Artefakte und fehlende Testlaeufe ab.
- Offline-Tests bestaetigen, dass die Sicht ohne externe Abhaengigkeiten vollstaendig lesbar bleibt.

## QA Test Results (Re-Test 2026-04-10)

**Tested:** 2026-04-10
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Executed Checks
- `npm run typecheck` -> bestanden
- `npm run lint` -> bestanden
- `npm run test:run -- src/lib/obj16-maturity.test.ts src/app/api/v1/api-v1.test.ts` -> bestanden (alle Tests)
- `npm run build` -> bestanden; Routen `/maturity` und `/api/v1/maturity` erfolgreich generiert

### Acceptance Criteria Status

#### AC-1: Maturitaetsansicht im GUI erreichbar und verstaendlich benannt
- [x] PASS - Route `/maturity` mit Ueberschrift "Maturity Status (L0-L5)" vorhanden.

#### AC-2: Gesamt-Reifegrad L0-L5 mit erklaerter Bewertungslogik
- [x] PASS - Overall Level Card zeigt Score/100 und Formel wird im UI erklaert.

#### AC-3: Feature-Tabelle mit ID, Name, Phase, Status, Release-Kanal, Teststatus
- [x] PASS - Feature Table rendert alle geforderten Spalten.

#### AC-4: Teststatus konsolidiert: Passed, Failed, Never Executed
- [x] PASS - Teststatus-Badge und Zaehler (T/P/F/N) pro Feature sichtbar.

#### AC-5: Anforderungsabdeckung als Kennzahl
- [x] PASS - "Req Coverage" Spalte zeigt Prozent oder "n/a".

#### AC-6: Security-Indikator mit SBOM, Scan-Status, Critical/High Findings
- [x] PASS - FIXED seit letzter QA. Neue "Security Indicator" Card zeigt SBOM vorhanden (Ja/Nein), Letzter Scan-Status, Gate-Status und Open Critical/High Findings.

#### AC-7: Doku-Indikator mit arc42, Benutzerhandbuch, Betriebsdoku
- [x] PASS - FIXED seit letzter QA. Neue "Documentation Indicator" Card zeigt arc42 aktuell, Benutzerhandbuch aktuell, Betriebsdoku aktuell (jeweils Ja/Nein).

#### AC-8: Offline-Indikator mit Zarf, Export-Status, App-of-Apps
- [x] PASS - FIXED seit letzter QA. Neue "Offline Indicator" Card zeigt Zarf verfuegbar, Export-Status und App-of-Apps bereit (jeweils Badge mit Status).

#### AC-9: Offene Punkte priorisiert sichtbar
- [x] PASS - "Open Points (prioritized)" mit Blocker/High/Normal Badges.

#### AC-10: Naechste Meilensteine konfigurierbar und sichtbar
- [x] PASS - "Milestones (configurable)" mit Target Level, Owner und Due Date. Konfigurierbar via `OBJ16_MILESTONES_JSON`.

#### AC-11: Komplett offline nutzbar
- [x] PASS - Alle Datenquellen sind repository-basiert. Kein externer Online-Zugriff im OBJ-16-Codepfad.

#### AC-12: Konsistente Kanal-Semantik Released/Beta/Preview
- [x] PASS - "Release Channel Legend" mit vier Eintraegen (Released, Beta, Preview, Unknown) inkl. Bedeutung und Risikohinweis.

#### AC-13: Druck-/exportfreundliche Darstellung
- [x] PASS - "Druckansicht" Button ruft `window.print()`. Print-Styles vorhanden (`print:bg-white`, `print:hidden` fuer Filter, `print:max-w-none`).

### Edge Cases Status

#### EC-1: Keine Testdaten vorhanden
- [x] Handled - `resolveTestStatus` gibt "never_executed" zurueck bei leerem Aggregat.

#### EC-2: Feature deployed aber Tests failed
- [x] Handled - Feature wird als Blocker markiert durch `determineRiskPriority`.

#### EC-3: Feature ohne Release-Kanal
- [x] Handled - Fallback auf "Unknown" via `channelFromFeatureStatus`.

#### EC-4: Security-Artefakte fehlen
- [x] Handled - `computeSecurityScore` gibt 0 Punkte fuer fehlende SBOM/Scans.

#### EC-5: Doku fehlt oder veraltet
- [x] Handled - `computeDocumentationSignals` prueft Existenz und Alter (120 Tage Frische).

#### EC-6: Offline-Artefakte fehlen
- [x] Handled - `computeOfflineSignals` faellt auf Score 0 zurueck.

#### EC-7: Widerspruechliche Datenquellen
- [x] Partially handled - Risiko-Prioritaet wird konservativ bestimmt; ein expliziter "Konflikt"-Hinweis wird allerdings nicht als eigenes UI-Element angezeigt.

#### EC-8: Einzelne Quellen nicht lesbar
- [x] Handled - Robuste try/catch Blocks in allen Datenladequellen.

#### EC-9: Viele Features vorhanden
- [x] Handled - Filter nach Phase, Status, Kanal, Risiko, Teststatus und Freitextsuche.

#### EC-10: Nur lokale Umgebung
- [x] Handled - Alle Kennzahlen aus Repository-Dateien generierbar.

### Security Audit Results
- [x] Authentication: `GET /api/v1/maturity` ist mit `requireSession(request, 'viewer')` geschuetzt; 401 bei fehlendem Token.
- [x] Input Validation: Ungueltiger Filter-Wert liefert 422 `INVALID_MATURITY_STATUS`.
- [x] Rate Limiting: `enforceRateLimit(...)` aktiv.
- [x] XSS: Kein `dangerouslySetInnerHTML`. Alle Werte als React-Text gerendert.
- [x] Secret Exposure: Keine Secrets im OBJ-16-Codepfad.

### Bugs Found

#### BUG-1: Edge Case "Widerspruechliche Datenquellen" ohne expliziten Konflikt-Hinweis
- **Severity:** Low
- **Steps to Reproduce:**
  1. Setze in INDEX.md einen Feature-Status auf "Completed".
  2. Stelle sicher, dass QA-Abschnitt offene High Findings zeigt.
  3. Expected: Ansicht zeigt "Konflikt" gemaess Edge Case EC-7.
  4. Actual: Feature wird konservativ als "high" Risk eingestuft, aber kein explizites "Konflikt"-Label.
- **Priority:** Nice to have (konservatives Verhalten ist sicher, nur das explizite Label fehlt)

### Regression Check
- PASS: API-Discovery/OpenAPI fuer Maturity-Endpunkt wird durch `api-v1.test.ts` abgedeckt.
- PASS: Build bestaetigt `/maturity` und `/api/v1/maturity` in der generierten App.

### Summary
- **Acceptance Criteria:** 13/13 passed
- **Bugs Found:** 1 total (0 critical, 0 high, 0 medium, 1 low)
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** Deploy. Der Low-Severity-Bug (fehlender expliziter Konflikt-Hinweis) kann im naechsten Sprint adressiert werden. Manueller Browser-Smoketest fuer Responsive und Print-Ansicht als Nachfolgeaufgabe.

## Deployment
### Deployment-Status (Stand: 2026-04-11)
- Auslieferung erfolgt Git-first ueber Branch/PR/Merge nach `main`.
- Release- und Export-Nachweise werden in `docs/releases/` und `docs/exports/EXPORT-LOG.md` dokumentiert.
- Confluence bleibt Sekundaerziel: Export erst nach gepflegter Git-Dokumentation.
- Falls **Production Ready: NO** gilt, bleibt das Deployment als vorbereitet markiert und wird erst nach Freigabe produktiv ausgerollt.

## Implementation Update (2026-04-09)
- Backend-Datenmodell in `src/lib/obj16-maturity.ts` umgesetzt (gewichtete L0-L5-Bewertungslogik fuer Delivery, Quality, Security, Documentation, Offline).
- Repository-basierte Konsolidierung ist aktiv:
- Feature-Status aus `features/INDEX.md`.
- Teststatus Passed/Failed/Never aus `src/lib/test-execution-dashboard.ts`.
- Requirements-Coverage aus `src/lib/obj7-traceability.ts`.
- Security-/SBOM-Signale aus `src/lib/obj17-security-scanning.ts`.
- Offline-/Doku-Indikatoren mit robusten Fallbacks bei fehlenden Quellen.
- API-Endpunkt `GET /api/v1/maturity` implementiert (`src/app/api/v1/maturity/route.ts`) inkl. Auth-Schutz (`viewer+`) und Filterparametern (Phase, Status, Channel, Risk, Teststatus, Query).
- Frontend-Lesesicht `src/app/maturity/page.tsx` + `src/components/obj16-maturity-dashboard.tsx` umgesetzt:
- Filterbare Feature-Tabelle.
- Erklaerte Bewertungslogik und Kanal-Legende (Released/Beta/Preview).
- Priorisierte Open Points.
- Druckfreundliche Ansicht (`window.print` + print styles).
- API-Discovery und OpenAPI sind nachgezogen (`/api/v1`, `/api/v1/openapi.json`) und API-Vertragstests wurden erweitert.
