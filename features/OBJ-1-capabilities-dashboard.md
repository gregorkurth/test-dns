# OBJ-1: Capabilities Dashboard

## Status: Planned
**Created:** 2026-03-17
**Last Updated:** 2026-03-17

## Dependencies
- None

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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
