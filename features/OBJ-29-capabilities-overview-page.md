# OBJ-29: Capabilities Overview Page

## Status
In Review

## Implementation Notes
- Route `/capabilities` als Client Component implementiert (`src/app/capabilities/page.tsx` + `capabilities-overview-client.tsx`).
- Verwendet das gemeinsame Terminal-Shell-System (`src/components/terminal/*`) und die Tokens in `src/app/globals.css` unter dem Namespace `.terminal`.
- Vier Stat-Cards (Capabilities / Services / Service Functions / Requirements) oben; Systemstatus-Badge im Topbar wird aus dem Anteil operationaler Capabilities berechnet.
- Capability-Cards zeigen ID, Name, Maturity-Badge (abgeleitet aus `maturity`-String via classifyMaturity), Metrics-Boxen (Services/Functions/Requirements) und Participant-Zuordnung.
- Participant-Zuordnung ueber `metadata.capabilityId/capabilityIds` oder `metadata.obj5.capabilities/capabilityIds`; Fallback: Participants mit DNS-Payload werden einer Capability mit Namen "Domain Naming" zugeordnet. Falls keine Zuordnung moeglich ist, zeigt die Card "Keine Participants zugeordnet".
- Auto-Refresh 30s, Poll-Countdown-Bar mit Animation; Error-Handling mit rotem Alert-Banner (inklusive Hinweis auf abgelaufene Session bei 401).
- Auth: `AuthGuard minimumRole="viewer"` + Bearer-Token aus `useObj12Auth`.

## Summary
Terminal-style Seite unter `/capabilities` analog zum DNS Overview Dashboard (OBJ-28). Zeigt alle FMN-Capabilities aus `/api/v1/capabilities` als Panel-Cards mit Maturity-Status, Anzahl Services/Functions/Requirements und Participant-Zuordnung. Globale Stat-Cards oben, Auto-Refresh alle 30 Sekunden, Dark-Terminal-Design. Viewer-Rolle erforderlich.

## Route
`/capabilities`

## Auth
Viewer-Rolle erforderlich (minimum).

## Dependencies
- Requires: OBJ-3 (REST API) — `GET /api/v1/capabilities`, `GET /api/v1/participants`
- Requires: OBJ-12 (Security & Auth) — viewer-role session check
- Related: OBJ-28 (DNS Overview Dashboard) — gleicher Design-Token-Satz

---

## User Stories

### US-1: Capabilities-Übersicht auf einen Blick
Als MNO möchte ich alle konfigurierten FMN-Capabilities als strukturierte Panel-Cards sehen (ID, Name, Maturity, Services, Functions, Requirements), damit ich den Zustand der DNS-Capability-Hierarchie sofort beurteilen kann.

### US-2: Maturity-Status pro Capability
Als MNO möchte ich den Maturity-Status jeder Capability als farbigen Badge sehen (Operational = grün, In Development = gelb, unbekannt = grau), damit ich erkennen kann, welche Capabilities produktiv betriebsbereit sind.

### US-3: Participant-Zuordnung
Als MNO möchte ich pro Capability sehen, welche Participants diese Capability bereitstellen, damit ich nachvollziehen kann, wer die Capability im Netzwerk betreibt.

### US-4: Globale Statistiken
Als MNO möchte ich oben auf der Seite vier Stat-Cards sehen (Capabilities gesamt, Services gesamt, Service Functions gesamt, Requirements gesamt), damit ich mit einem Blick den Gesamtumfang der Konfiguration erfasse.

### US-5: Auto-Refresh
Als MNO möchte ich, dass die Daten automatisch alle 30 Sekunden neu geladen werden und einen Countdown-Balken sowie einen "Last updated"-Zeitstempel sehe, damit ich weiss, wie aktuell die angezeigten Informationen sind.

### US-6: Terminal-Design
Als MNO möchte ich das gleiche dunkle Terminal-Theme wie beim DNS Overview Dashboard (OBJ-28), damit beide Seiten visuell konsistent wirken und die professionelle Anmutung erhalten bleibt.

### US-7: Hauptnavigation
Als MNO möchte ich `/capabilities` direkt über die Hauptnavigation erreichen, ohne zuerst auf eine andere Seite navigieren zu müssen.

---

## Acceptance Criteria

### AC-1: Stat-Cards
- [ ] Vier Stat-Cards werden oben auf der Seite angezeigt: Capabilities gesamt, Services gesamt, Service Functions gesamt, Requirements gesamt
- [ ] Zahlen sind in grüner Akzentfarbe (`#00ff41`) hervorgehoben
- [ ] Stat-Cards im Panel-Design mit Corner-Bracket-Akzenten wie im NTP-Mockup

### AC-2: Capability-Cards
- [ ] Pro Capability aus `/api/v1/capabilities` wird eine Panel-Card angezeigt
- [ ] Jede Card zeigt: Capability-ID, Name, Maturity-Badge, serviceCount, serviceFunctionCount, requirementCount
- [ ] Cards sind in einem Grid-Layout angeordnet (2-spaltig ab 768px)

### AC-3: Maturity-Badge
- [ ] `maturity === "Operational"` → grüner Badge mit pulsierendem Dot (`online`-Stil)
- [ ] `maturity` enthält "Development" oder ähnlich → gelber Badge (`degraded`-Stil)
- [ ] `maturity === null` oder unbekannt → grauer Badge ohne Dot, Text "Unknown"
- [ ] Maturity-Wert wird als Text im Badge angezeigt (nicht nur Farbe)

### AC-4: Participant-Zuordnung
- [ ] Unterhalb der Metriken jeder Capability-Card werden beteiligte Participants angezeigt
- [ ] Participants stammen aus `GET /api/v1/participants` und werden der Capability zugeordnet (falls Felder im Participant-Objekt eine Capability-ID referenzieren)
- [ ] Falls keine Zuordnung möglich: Hinweis "Keine Participants zugeordnet" in gedimmter Farbe

### AC-5: Empty-State
- [ ] Falls `/api/v1/capabilities` eine leere Liste zurückgibt: grauer Panel mit Text "Keine Capabilities konfiguriert" und Info-Icon
- [ ] Falls der API-Call fehlschlägt: roter Fehler-Banner mit Fehlermeldung (differenziert vom Empty-State)
- [ ] Beide Zustände verhindern einen Crash der Seite

### AC-6: Auto-Refresh
- [ ] Capabilities-Daten werden alle 30 Sekunden automatisch neu geladen
- [ ] Countdown-Balken (poll-bar) zeigt Zeit bis zum nächsten Refresh
- [ ] "Last updated: HH:MM:SS UTC" Zeitstempel wird nach jedem Reload aktualisiert
- [ ] Countdown und Zeitstempel laufen im Hintergrund weiter, auch wenn die Seite nicht aktiv gescrollt wird

### AC-7: Topbar
- [ ] UTC-Uhr läuft live (aktualisiert jede Sekunde), blinkende Doppelpunkte
- [ ] Seitentitel "Capabilities" im Topbar
- [ ] Globaler Systemstatus-Badge (OPERATIONAL wenn alle Capabilities `Operational`, sonst DEGRADED)

### AC-8: Design-Konsistenz mit OBJ-28
- [ ] Identische Design-Token: `--bg-base: #070b0f`, `--accent: #00ff41`, Monospace-Font
- [ ] Panel-Ecken mit Bracket-Akzenten via CSS `::before`/`::after`
- [ ] Scanline-Overlay-Effekt (subtil, `pointer-events: none`)
- [ ] `sdot`, `sbadge`, `panel`, `stat-card`-Stilklassen konsistent mit OBJ-28

### AC-9: Navigation
- [ ] `/capabilities` ist über die Hauptnavigation (Sidebar oder Menu) erreichbar
- [ ] Nav-Item ist in der gleichen Sektion wie das DNS Dashboard sichtbar
- [ ] Aktiver Zustand (active-Stil) wird beim Besuch der Seite korrekt gesetzt

### AC-10: Auth
- [ ] Route `/capabilities` ist ohne gültige Session nicht erreichbar → Redirect zur Login-Seite
- [ ] Viewer-Rolle reicht aus; kein Operator oder Admin erforderlich
- [ ] Ein ungültiger Token führt zu Login-Redirect, nicht zu Raw-JSON-Fehler

---

## Data Sources

| Daten | Endpoint | Felder |
|-------|----------|--------|
| Capability-Liste | `GET /api/v1/capabilities` | `id`, `name`, `maturity`, `serviceCount`, `serviceFunctionCount`, `requirementCount` |
| Participants | `GET /api/v1/participants` | Participant-Objekte mit eventueller Capability-Referenz |

**Stat-Card-Berechnung:**
- Capabilities gesamt: `capabilities.length`
- Services gesamt: `sum(capability.serviceCount)`
- Service Functions gesamt: `sum(capability.serviceFunctionCount)`
- Requirements gesamt: `sum(capability.requirementCount)`

**Systemstatus-Logik:**
- OPERATIONAL: alle Capabilities mit `maturity === "Operational"` (oder alle non-null)
- DEGRADED: mindestens eine Capability mit null/nicht-Operational Maturity

---

## Edge Cases

### EC-1: Keine Capabilities konfiguriert
- Stat-Cards zeigen alle `0`
- Capability-Grid zeigt Empty-State Panel: "Keine Capabilities konfiguriert."
- Topbar-Badge zeigt "DEGRADED"

### EC-2: API-Fehler (Netzwerk oder 5xx)
- Roter Fehler-Banner mit Fehlermeldung unter den Stat-Cards
- Letzter bekannter Wert bleibt sichtbar (falls vorhanden) oder leere Seite
- Nächster Auto-Refresh-Zyklus versucht erneut zu laden

### EC-3: Participant-Zuordnung nicht auflösbar
- Falls `/api/v1/participants` keinen erkennbaren Capability-Bezug enthält: jede Capability-Card zeigt "Keine Participants zugeordnet" – kein Crash

### EC-4: Unbekannter Maturity-Wert
- Wert vorhanden, aber nicht "Operational" o. ä. → gelber Badge, Wert wird angezeigt
- `null` oder leer → grauer Badge "Unknown"

### EC-5: Sehr viele Capabilities (> 20)
- Seite bleibt scrollbar, kein Overflow-Clip
- Grid behält 2-Spalten-Layout bei

### EC-6: Mobil / schmales Viewport (< 768px)
- Panels stapeln sich vertikal (1-Spalten-Layout)
- Stat-Cards ebenfalls vertikal
- Topbar zeigt mindestens Clock + Status-Badge; Seitentitel kann gekürzt werden

### EC-7: 401 beim API-Call (Session abgelaufen während Aufenthalt auf Seite)
- Auto-Refresh-Fehler wird als roter Banner angezeigt
- Seite zeigt Hinweis "Session abgelaufen – bitte neu anmelden" mit Login-Link
- Kein automatischer Reload der gesamten Seite

---

## Out of Scope (MVP)
- Kein Drill-down auf Capability-Detail-Seite (kein Accordion, kein Klick-to-Detail)
- Kein Editieren von Capabilities aus der Seite heraus
- Keine Requirements-Abdeckungs-Berechnung (SREQ-Erfüllungsgrad)
- Kein Export / Download

---

## Design Reference
`req-init/Idee-mockup.html` — NTP Dashboard Mockup (DTS // CC291)
Gleiche Design-Tokens und Klassen wie OBJ-28 DNS Overview Dashboard.

---

## Notes
- Vollständig read-only; kein neuer Backend-Code erforderlich
- Client Component (Auto-Refresh / useState)
- Participant-Zuordnung zu Capabilities muss im Frontend aus den vorhandenen Daten abgeleitet werden; falls kein direktes Mapping-Feld vorhanden ist, wird "Keine Participants zugeordnet" angezeigt
