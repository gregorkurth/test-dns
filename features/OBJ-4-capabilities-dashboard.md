# OBJ-4: Capabilities Dashboard

## Status: Planned
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

## Edge Cases
- Was passiert, wenn eine Service Function keine Requirements hat? → Leerer Zustand mit Hinweis "Keine Requirements definiert"
- Was passiert bei einem Requirement ohne Übersetzung? → Nur Originaltext wird angezeigt
- Was wenn `capabilities/INDEX.md` fehlt? → Fehlermeldung "Capabilities-Daten nicht gefunden"
- Sehr lange Requirement-Texte? → Truncated mit "Mehr anzeigen"-Toggle

## Technical Requirements
- Build-time Datenladung aus `capabilities/**/*.md` via Next.js Static Generation
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

**Backend-Bedarf**

- OBJ-4 ist nicht frontend-only.
- Fuer stabile Weiterentwicklung wird die Datenversorgung ueber OBJ-3 genutzt.
- Offline-Anforderung bleibt erhalten, weil API und Daten lokal bereitgestellt werden.

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
_To be added by /qa_

## Deployment
_To be added by /deploy_
