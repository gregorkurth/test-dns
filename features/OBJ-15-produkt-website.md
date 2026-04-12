# OBJ-15: Produkt-Website

## Status: In Review
**Created:** 2026-04-03
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-4: Capabilities Dashboard (Navigation und konsistente Einstiegspunkte)
- OBJ-14: Release Management (versionierte Release-Hinweise als Source of Truth)
- OBJ-16: Maturitaetsstatus (Statusanzeige fuer Management und Betrieb)
- OBJ-2: Dokumentation (Verlinkung auf arc42, Benutzerhandbuch, Export-Log)

## User Stories
- Als neuer Besucher möchte ich auf der Startseite sofort verstehen, was diese App macht und für wen sie ist.
- Als Mission Network Operator möchte ich von der Startseite direkt zur Dokumentation und zur Applikation navigieren können.
- Als Stakeholder möchte ich den aktuellen Release-Stand und den Maturitätsstatus sehen.
- Als Platform Engineer möchte ich Links zu Dokumentation, Repository und Releases auf einer Seite finden.
- Als Operator in einer airgapped Umgebung möchte ich die Produkt-Website lokal aufrufen können.
- Als Nutzer moechte ich klar sehen, welche Funktionen oder Bereiche Preview, Beta oder GA sind, damit ich Risiken einschaetzen kann.
- Als Nutzer moechte ich bei neuen Releases klar sichtbare Update-Hinweise bekommen, damit ich weiss, was sich geaendert hat und ob eine Aktion noetig ist.
- Als Manager moechte ich erkennen, dass Git die Primaerquelle fuer Release-Informationen ist und externe Kopien nur abgeleitet sind.

## Acceptance Criteria
- [ ] Produkt-Website ist als erster Einstiegspunkt des Web GUI erreichbar und ohne Login lesbar.
- [ ] Startseite zeigt Service-Namen, Kurzbeschreibung (was, fuer wen, warum) und den Betriebskontext.
- [ ] Startseite zeigt Versionsnummer, Release-Datum und klaren Release-Kanal (GA, Beta, Preview).
- [ ] Statuswerte werden durchgaengig mit derselben Legende dargestellt; die Legende ist auf der Seite sichtbar.
- [ ] Beta- und Preview-Bereiche sind visuell markiert und enthalten einen kurzen Risiko-Hinweis.
- [ ] Release-Hinweise werden aus einer versionierten Repository-Quelle geladen, nicht aus manuell gepflegtem GUI-Text.
- [ ] Es gibt einen globalen Update-Hinweisbereich auf der Startseite mit Priorisierung (kritisch, wichtig, info).
- [ ] Kritische Hinweise koennen nicht dauerhaft ausgeblendet werden, solange sie fuer die aktuelle Version gelten.
- [ ] Nicht-kritische Hinweise koennen lokal quittiert werden; bei neuer Version werden sie erneut angezeigt.
- [ ] Startseite zeigt den Maturitaetsstatus oder einen klaren Fallback-Hinweis, falls kein Status verfuegbar ist.
- [ ] Navigation enthaelt App, Dokumentation, Release-Informationen und optional externes Repository (airgap-faehig schaltbar).
- [ ] Die Seite ist offline nutzbar und benoetigt keine externen Schriften, Skripte, Bilder oder CDNs.
- [ ] Responsive Darstellung ist fuer 375px, 768px und 1440px nutzbar und inhaltlich vollstaendig.
- [ ] Ladezeit bleibt im lokalen Betrieb kurz genug fuer einen Management-Einstieg (Ziel: unter 1 Sekunde bei normaler Lokallast).
- [ ] Die Produkt-Website macht sichtbar, dass Git die Primaerquelle ist und Exportziele nur Kopien sind.

## Edge Cases
- Was wenn Versionsdaten fehlen oder unvollstaendig sind? -> Fallback auf "Version unbekannt" und Hinweis "Metadaten unvollstaendig".
- Was wenn der externe Repository-Link in airgapped Umgebungen ungueltig ist? -> Externer Link wird ausgeblendet, lokale Links bleiben.
- Was wenn kein Maturitaetsstatus geliefert wird? -> Anzeige "Status nicht verfuegbar" ohne Seitenfehler.
- Was wenn ein Hinweis als Beta markiert ist, der Kanal aber GA sagt? -> Konflikt-Hinweis fuer QA; Anzeige bleibt konservativ auf "Beta/Pruefung noetig".
- Was wenn keine Hinweise zur aktuellen Version existieren? -> Bereich zeigt "Keine neuen Hinweise" mit Zeitstempel der letzten Pruefung.
- Was wenn ein kritischer Hinweis quittiert wurde? -> Kritische Hinweise werden nach Reload erneut angezeigt, bis sie nicht mehr gueltig sind.
- Was wenn lokale Quittierungsdaten defekt sind? -> Daten werden verworfen und Hinweise wieder vollstaendig angezeigt.
- Was wenn Offline-Modus aktiv ist und nur Teilinformationen verfuegbar sind? -> Seite bleibt lesbar, fehlende Bereiche zeigen klare Fallback-Texte.

## Technical Requirements
- Die Produkt-Website wird als feste Einstiegskomponente im bestehenden Web GUI gefuehrt.
- Release-Kanaele sind auf einen festen Wertebereich begrenzt: GA, Beta, Preview.
- Release-Hinweise, Kanalstatus und Versionsmetadaten stammen aus versionierten Repository-Quellen.
- Die Anzeige muss den Source-of-Truth-Grundsatz transportieren: erst Git, danach Export/Kopie.
- Offline-Betrieb ist Pflicht: keine externen Abhaengigkeiten fuer Kerninhalte.
- Hinweis-Quittierung ist lokal zulaessig und darf keine serverseitige Abhaengigkeit erzwingen.
- Inhalte muessen fuer Nicht-Entwickler lesbar und in maximal zwei Klicks zu Doku-/Release-Nachweisen fuehren.
- Darstellung folgt dem bestehenden UI-Standard des Projekts fuer konsistente Bedienung.

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
### Scope
In Scope:
- Management-taugliche Einstiegsseite mit Service-Kontext, Version, Kanal, Maturitaet und Update-Hinweisen.
- Einheitliche Sicht auf GA/Beta/Preview inkl. Legende und Risiko-Hinweisen.
- Offline-faehige Darstellung mit lokalen Fallbacks und klarer Navigation zu Doku und Releases.

Out of Scope:
- Kein neuer fachlicher Feature-Workflow (nur Sichtbarkeit und Orientierung).
- Keine automatische Confluence-Synchronisation als Primaerprozess.
- Kein separates Rollen-/Rechtesystem nur fuer die Produkt-Website.

### Visual Tree
```text
Produkt-Website (Startseite)
+-- Hero-Bereich
|   +-- Service-Name und Kurzbeschreibung
|   +-- Zielgruppe und Nutzenversprechen
+-- Status-Panel
|   +-- Aktuelle Version und Release-Datum
|   +-- Release-Kanal (GA/Beta/Preview)
|   +-- Maturitaetsstatus
+-- Update-Hinweise
|   +-- Kritische Hinweise
|   +-- Wichtige Hinweise
|   +-- Info-Hinweise
|   +-- Hinweis-Aktionen (Ansehen, lokal ausblenden)
+-- Status-Legende
|   +-- Bedeutung GA
|   +-- Bedeutung Beta
|   +-- Bedeutung Preview
+-- Quick Navigation
    +-- Zur App
    +-- Zur Dokumentation
    +-- Zu Release-Informationen
    +-- Externes Repository (optional, airgap-abhaengig)
```

### Data Model (Plain Language)
Die Seite nutzt ein einfaches Anzeige-Modell aus fachlichen Informationsbausteinen:
- Service-Profil: Name, Kurzbeschreibung, Zielgruppe, Zweck.
- Release-Snapshot: Version, Datum, Kanal, Exportstatus.
- Hinweis-Eintrag: Prioritaet, Titel, Kurztext, Gueltigkeitsbereich, Aktionsempfehlung.
- Maturitaets-Snapshot: Level, Aussage, Zeitpunkt der letzten Aktualisierung.
- Navigationspunkte: interne Ziele (App, Doku, Releases) plus optional externe Ziele.
- Lokale Nutzerpraeferenz: welche nicht-kritischen Hinweise fuer die aktuelle Version bereits quittiert wurden.

### Technical Decisions
- Ein zentraler Einstiegspunkt reduziert Suchaufwand fuer Management und Betrieb.
- Einheitliche Kanal-Logik (GA/Beta/Preview) verhindert widerspruechliche Kommunikation.
- Versionierte Hinweisquellen im Repository sichern Nachvollziehbarkeit und Audit-Faehigkeit.
- Offline-First fuer Kerninformationen ist notwendig fuer airgapped Betriebsmodelle.
- Kritische Hinweise bleiben sichtbar, damit Sicherheits- und Betriebsrisiken nicht versehentlich verborgen werden.
- Lokale Quittierung fuer nicht-kritische Hinweise verbessert Nutzbarkeit ohne zentrale Abhaengigkeit.

### Dependencies
- OBJ-4 liefert den Dashboard-Kontext und Navigationsanschluss.
- OBJ-14 liefert die strukturierte Release-Hinweisquelle.
- OBJ-16 liefert Maturitaetsinformationen fuer die Statussicht.
- OBJ-2 stellt Dokumentationsziele und den Source-of-Truth-Rahmen bereit.

### QA Readiness
Folgende Punkte muessen vor Abnahme klar testbar sein:
- Kanalanzeige ist korrekt fuer GA, Beta und Preview.
- Kritische und nicht-kritische Hinweise verhalten sich wie spezifiziert.
- Fallback-Texte greifen bei fehlenden oder unvollstaendigen Daten.
- Offline-Nutzung bleibt funktional ohne externe Aufrufe.
- Navigation zu App, Doku und Releases funktioniert in Online- und Airgap-Betrieb.
- Lesbarkeit fuer Nicht-Entwickler ist gegeben und Kerninformationen sind sofort auffindbar.

## QA Test Results (Re-Test 2026-04-10)

**Tested:** 2026-04-10
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Executed Checks
- `npm run typecheck` -> bestanden
- `npm run lint` -> bestanden
- `npm run test:run -- src/lib/obj15-product-website.test.ts` -> bestanden (3/3 Tests)
- `npm run build` -> bestanden (Route `/` als Static Page generiert)

### Acceptance Criteria Status

#### AC-1: Produkt-Website als erster Einstiegspunkt ohne Login lesbar
- [x] PASS - Root-Page `/` wird als oeffentliche Seite ohne Auth gerendert. API `GET /api/v1/product-website` hat ebenfalls keinen Auth-Guard, nur Rate Limiting.

#### AC-2: Startseite zeigt Service-Name, Kurzbeschreibung, Zielgruppe, Betriebskontext
- [x] PASS - Hero-Bereich zeigt Name, shortDescription, audience, purpose und operatingContext.

#### AC-3: Versionsnummer, Release-Datum, Release-Kanal
- [x] PASS - Status-Panel rendert Version, Release-Datum und Kanal-Badge (GA/Beta/Preview).

#### AC-4: Statuswerte mit einheitlicher Legende
- [x] PASS - Status-Legende mit drei Karten (Released/Beta/Preview) inkl. riskHint ist vorhanden.

#### AC-5: Beta/Preview visuell markiert mit Risiko-Hinweis
- [x] PASS - channelBadge mit farblicher Markierung und channelRiskHint ist implementiert.

#### AC-6: Release-Hinweise aus versionierter Quelle
- [x] PASS - Hinweise stammen aus `docs/releases/UPDATE-NOTICES.json` via `getReleaseNotices()`.

#### AC-7: Globaler Update-Hinweisbereich mit Priorisierung
- [x] PASS - `Obj15UpdateHints` zeigt Hinweise sortiert nach Prioritaet (critical, important, info).

#### AC-8: Kritische Hinweise nicht dauerhaft ausblendbar
- [x] PASS - `notice.priority === 'critical'` wird in `visibleNotices` immer angezeigt; dismiss-Button zeigt stattdessen "Kritisch: nicht ausblendbar".

#### AC-9: Nicht-kritische Hinweise lokal quittierbar, bei neuer Version erneut angezeigt
- [x] PASS - localStorage-Schluessel ist versionsgebunden (`obj15.dismissed.notices:<version>`). Bei neuer Version greift der Schluessel nicht mehr.

#### AC-10: Maturitaetsstatus oder Fallback-Hinweis
- [x] PASS - `loadMaturityStatus()` liefert echte OBJ-16-Daten oder klaren Fallback "Status nicht verfuegbar".

#### AC-11: Navigation enthaelt App, Dokumentation, Release-Informationen
- [x] PASS - FIXED seit letzter QA. `buildNavigation()` enthaelt jetzt "App starten", "Maturity Dashboard", "Dokumentation" (-> /documentation), "Security Posture", "API Dokumentation (Swagger)", "Release-Informationen" und optional "Externes Repository".

#### AC-12: Offline nutzbar, keine externen Abhaengigkeiten
- [x] PASS - Im gesamten OBJ-15-Codepfad (page.tsx, obj15-product-website.ts, obj15-update-hints.tsx) sind keine externen Fonts, Skripte, Bilder oder CDNs fuer Kerninhalte erkennbar. Hinweis: `/api/v1/swagger` (OBJ-3) laedt CDN-Ressourcen, aber das ist kein OBJ-15-Scope.

#### AC-13: Responsive Darstellung 375px, 768px, 1440px
- [x] PASS (code review) - Layout nutzt responsive Tailwind-Klassen: `md:flex-row`, `md:grid-cols-2`, `md:grid-cols-3`, `lg:grid-cols-[...]`. Tatsaechlicher Browser-Viewport-Test konnte in dieser Umgebung nicht ausgefuehrt werden.

#### AC-14: Ladezeit unter 1 Sekunde
- [ ] NOT VERIFIED - Kein reproduzierbarer Benchmark erhoben. Seite wird als Static Page generiert (Build-Ausgabe: `○ /`), was fuer schnelles Laden spricht.

#### AC-15: Git als Primaerquelle sichtbar
- [x] PASS - Source-of-Truth-Block zeigt "Primaerquelle: Git Repository" und "Confluence oder andere Ziele sind abgeleitete Kopien".

### Edge Cases Status

#### EC-1: Versionsdaten fehlen oder unvollstaendig
- [x] Handled - Fallback "Version unbekannt" und "Nicht veroeffentlicht" im Code vorhanden.

#### EC-2: Externer Repository-Link in airgap ungueltig
- [x] Handled - `OBJ15_AIRGAP_MODE` blendet Link aus; bei ungueltiger URL greift try/catch.

#### EC-3: Kein Maturitaetsstatus
- [x] Handled - catch-Block liefert `available: false` mit Fallback-Text.

#### EC-4: Kanal-Konflikt Beta vs GA
- [x] Handled - `mapReleaseChannelToProductChannel` ist deterministisch; konservative Logik greift.

#### EC-5: Keine Hinweise zur aktuellen Version
- [x] Handled - "Keine neuen Hinweise fuer diese Version" mit Zeitstempel wird angezeigt.

#### EC-6: Kritischer Hinweis quittiert
- [x] Handled - Kritische Hinweise werden nach Reload erneut angezeigt (priority check passiert in `visibleNotices`).

#### EC-7: Lokale Quittierungsdaten defekt
- [x] Handled - `readDismissedNoticeIds` verworfen bei ungueltigem JSON und localStorage-Key geloescht.

#### EC-8: Offline-Modus mit Teilinformationen
- [x] Handled - Seite bleibt lesbar; Maturitaets-Fallback zeigt klaren Hinweis.

### Security Audit Results
- [x] XSS: Kein `dangerouslySetInnerHTML` im OBJ-15-Pfad. Alle Inhalte als React-Text gerendert.
- [x] Secret Exposure: Kein Secret-Leak in `GET /api/v1/product-website` oder View-Model.
- [x] Rate Limiting: `enforceRateLimit` am API-Endpunkt vorhanden.
- [x] Airgap-Robustheit: Externer Link wird in Airgap-Mode unterdrueckt.
- [x] localStorage-Manipulation: Defekte localStorage-Daten werden verworfen (robuste Fehlerbehandlung).
- [x] Open Redirect: Navigation-Links sind fest kodiert, nicht nutzerkontrolliert.

### Bugs Found
Keine offenen Bugs. Der Dokumentations-Link-Bug aus der vorherigen QA wurde behoben.

### Regression Check
- Root-Page `/` baut erfolgreich als Static Page.
- `ReleaseUpdateNotice` bleibt eingebunden.
- Build zeigt alle erwarteten Routen: `/`, `/documentation`, `/maturity`, `/security-posture`, `/api/v1/product-website`.

### Summary
- **Acceptance Criteria:** 14/15 passed, 0 failed, 1 not verified (Performance-Benchmark)
- **Bugs Found:** 0
- **Security:** Pass (keine Findings)
- **Production Ready:** YES (mit der Einschraenkung, dass das Performance-Benchmark und echte Browser-Tests in einer separaten manuellen QA-Runde bestaetigt werden sollten)
- **Recommendation:** Deploy. Manueller Browser-Smoketest fuer Responsive und Performance als Nachfolgeaufgabe.

## Deployment
### Deployment-Status (Stand: 2026-04-11)
- Auslieferung erfolgt Git-first ueber Branch/PR/Merge nach `main`.
- Release- und Export-Nachweise werden in `docs/releases/` und `docs/exports/EXPORT-LOG.md` dokumentiert.
- Confluence bleibt Sekundaerziel: Export erst nach gepflegter Git-Dokumentation.
- Falls **Production Ready: NO** gilt, bleibt das Deployment als vorbereitet markiert und wird erst nach Freigabe produktiv ausgerollt.

## Implementation Update (2026-04-09)
- OBJ-15 Datenmodell ist als versionierte View-Quelle in `src/lib/obj15-product-website.ts` umgesetzt und nutzt `docs/releases/UPDATE-NOTICES.json` als Primaerquelle.
- Neuer API-Endpunkt `GET /api/v1/product-website` liefert Service-Kontext, Release-Kanal (Released/Beta/Preview), Legende, Update-Hinweise, Maturitaets-Fallback und Navigation.
- Startseite wurde minimal-invasiv erweitert (kompatibel zu bestehendem `ReleaseUpdateNotice`): Hero, Kanal-Legende, globale Hinweisliste, Source-of-Truth-Block, Maturitaets-Fallback, Schnellnavigation.
- Hinweislogik fuer Nicht-Entwickler ist im Client umgesetzt:
- Kritische Hinweise bleiben dauerhaft sichtbar und sind nicht quittierbar.
- Nicht-kritische Hinweise sind lokal quittierbar und werden versionsgebunden gespeichert.
- Bei neuer Version werden quittierte Hinweise erneut angezeigt.
- Maturitaets-Snapshot wird nun direkt aus OBJ-16 (`src/lib/obj16-maturity.ts`) bezogen; bei Fehler greift ein klarer Fallback-Hinweis.
- Navigation wurde auf Maturity (`/maturity`) und Security Posture (`/security-posture`) erweitert, plus API-Doku und Release-Hinweise.
- API-Discovery/OpenAPI und Tests sind auf OBJ-15 nachgezogen (`/api/v1/product-website`, Mapping/Contract-Tests).
