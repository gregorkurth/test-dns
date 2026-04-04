# OBJ-15: Produkt-Website

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-04

## Dependencies
- OBJ-4: Capabilities Dashboard (Teil des Web GUI, Navigation zur Produkt-Website)
- OBJ-16: Maturitätsstatus (Maturitätsstatus wird auf der Produkt-Website angezeigt)

## User Stories
- Als neuer Besucher möchte ich auf der Startseite sofort verstehen, was diese App macht und für wen sie ist.
- Als Mission Network Operator möchte ich von der Startseite direkt zur Dokumentation und zur Applikation navigieren können.
- Als Stakeholder möchte ich den aktuellen Release-Stand und den Maturitätsstatus sehen.
- Als Platform Engineer möchte ich Links zu Dokumentation, Repository und Releases auf einer Seite finden.
- Als Operator in einer airgapped Umgebung möchte ich die Produkt-Website lokal aufrufen können.

## Acceptance Criteria
- [ ] Produkt-Website ist als Teil des Web GUI erreichbar (Route `/`, oder als separate statische Seite)
- [ ] Startseite zeigt: Produktname, Kurzbeschreibung (Was/Für wen/Warum), Technologie-Stack
- [ ] Startseite zeigt: aktuelle Versionsnummer und Datum des letzten Releases
- [ ] Startseite zeigt: Maturitätsstatus (eingebettet oder Link zu OBJ-16)
- [ ] Navigationselemente vorhanden: Zur App, Dokumentation, GitHub-Repository (nur wenn nicht airgapped), Releases
- [ ] Seite ist vollständig ohne Internetverbindung nutzbar (keine externen Ressourcen)
- [ ] Responsive Design (Desktop 1024px+, Tablet 768px+)
- [ ] Seite lädt in < 1 Sekunde (keine externen Ressourcen, kein CDN)

## Edge Cases
- Was wenn die Versionsnummer nicht aus dem Build-Prozess verfügbar ist? → Fallback auf "unbekannt"
- Was wenn der GitHub-Link in einer airgapped Umgebung nicht aufrufbar ist? → Link ist konfigurierbar; in airgapped Modus deaktivierbar via ENV-Variable
- Was wenn kein Maturitätsstatus berechnet werden kann? → Fallback-Anzeige "Status nicht verfügbar" statt Fehler

## Technical Requirements
- Implementierung als Next.js-Seite (Route `/`)
- Versionsnummer wird zur Build-Zeit via ENV-Variable injiziert (`NEXT_PUBLIC_APP_VERSION`)
- Keine externen Schriften, Icons oder Bibliotheken (airgapped)
- Styling: Tailwind CSS + shadcn/ui (konsistent mit dem restlichen Web GUI)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
