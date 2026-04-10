# OBJ-16: Maturitätsstatus / Reifegradübersicht

## Status: In Review
**Created:** 2026-04-03
**Last Updated:** 2026-04-09

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

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

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
