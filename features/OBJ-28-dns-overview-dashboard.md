# OBJ-28: DNS Overview Dashboard

## Status
Planned

## Summary
Terminal-style web dashboard that gives Mission Network Operators a live overview of the DNS infrastructure: forward DNS servers with IP and operational status, hosted zones/domains with record overview and health, DNS hierarchy topology diagram, and global statistics. Design follows the dark terminal aesthetic established in `req-init/Idee-mockup.html` (NTP Mockup).

## Route
`/dns-dashboard`

## Auth
Viewer role required (minimum).

## Dependencies
- Requires: OBJ-3 (REST API) — existing endpoints `/api/v1/participants`, `/api/v1/capabilities`, `/api/v1/zones/generate`
- Requires: OBJ-12 (Security & Auth) — viewer-role session check

---

## User Stories

### US-1: Forward DNS Server Overview
Als MNO möchte ich auf einen Blick sehen, welche Forward-DNS-Server konfiguriert sind, inklusive IP-Adresse und Betriebsstatus (Online / Degraded / Offline), damit ich schnell erkenne, welche Server verfügbar sind.

### US-2: Hosted Zones / Domain Overview
Als MNO möchte ich sehen, welche DNS-Zonen/Domains im System konfiguriert sind, wie viele Records jede Zone enthält und ob die Zone als valide gilt, damit ich den Zustand der DNS-Konfiguration beurteilen kann.

### US-3: DNS Topology Diagram
Als MNO möchte ich ein Topologie-Diagramm der DNS-Hierarchie sehen (Forwarder → Authoritative → Clients), damit ich die Abhängigkeiten zwischen den Servern verstehe.

### US-4: Global Statistics
Als MNO möchte ich auf einen Blick globale Kennzahlen sehen (Zonen total, Records total, aktive Server, Systemstatus), damit ich den Gesamtzustand des DNS-Systems einschätzen kann.

### US-5: UTC Clock und Auto-Refresh
Als MNO möchte ich eine laufende UTC-Uhr im Dashboard sehen und ein automatisches Polling (alle 15 Sekunden), damit ich weiss, wie aktuell die angezeigten Daten sind.

### US-6: Terminal-Design
Als MNO möchte ich ein dunkles Terminal-Theme (schwarz/grün, Monospace-Font, pulsierende Status-Dots, Panel-Layout mit Corner-Brackets wie im NTP-Mockup), damit das Dashboard visuell zum DTS-Dashboard passt und eine professionelle Anmutung hat.

### US-7: Zugriff ohne Admin-Rechte
Als Viewer möchte ich das Dashboard lesen können, ohne Admin- oder Operator-Rechte zu benötigen, damit alle beteiligten MNOs den Systemstatus einsehen können.

---

## Acceptance Criteria

### AC-1: DNS Server Panel
- [ ] Jeder in `/api/v1/participants` vorhandene Teilnehmer mit DNS-Capability wird als Server-Card angezeigt
- [ ] Jede Card zeigt: Hostname/FQDN, IP-Adresse(n), Betriebsstatus-Badge (Online / Degraded / Offline)
- [ ] Status-Badge enthält pulsierenden Dot (grün = Online, gelb = Degraded, rot = Offline)
- [ ] Status wird aus den vorhandenen Participant-Daten abgeleitet (z. B. forwardServers-Feld)

### AC-2: Zone / Domain Panel
- [ ] Alle Zonen aus `/api/v1/capabilities` oder abgeleitet aus Participant-Daten werden aufgelistet
- [ ] Pro Zone wird angezeigt: Zonenname, Record-Anzahl (A, NS, MX, etc.), Zustand (Valid / Warning / Error)
- [ ] Zonenliste ist scrollbar bei > 5 Einträgen

### AC-3: Topology Diagram
- [ ] SVG-Diagramm zeigt die Hierarchie: Forwarder-Server → Authoritative-Server → Client-Gruppen
- [ ] Verbindungslinien mit Pfeilspitzen (gestrichelt, grün)
- [ ] Pulsierende Animationen auf aktiven Nodes
- [ ] Diagramm passt sich der Panel-Breite an (100% width)

### AC-4: Global Stats Bar
- [ ] Zeigt mindestens: Zonen gesamt, Records gesamt, aktive Server-Anzahl, Gesamt-Systemstatus
- [ ] Zahlen in grüner Akzentfarbe hervorgehoben
- [ ] Stats-Karten im gleichen Panel-Design wie NTP-Mockup

### AC-5: Topbar
- [ ] UTC-Uhr läuft live (aktualisiert jede Sekunde)
- [ ] Systemstatus-Badge (OPERATIONAL / DEGRADED) im Topbar
- [ ] Seitentitel "DNS Overview" im Topbar sichtbar

### AC-6: Auto-Refresh
- [ ] Daten werden alle 15 Sekunden automatisch neu geladen (client-seitig)
- [ ] Countdown-Balken oder Timer zeigt Zeit bis zum nächsten Poll
- [ ] "Last updated" Zeitstempel sichtbar

### AC-7: Design
- [ ] Hintergrundfarbe `#070b0f`, Panels `#111820`, Akzentfarbe `#00ff41`
- [ ] Monospace-Font (JetBrains Mono / Fira Code / Cascadia Code / Courier New)
- [ ] Panel-Ecken mit Bracket-Akzenten (wie im NTP-Mockup)
- [ ] Scanline-Overlay-Effekt (subtil, pointer-events: none)
- [ ] Responsive: funktioniert ab 768px Breite

### AC-8: Auth
- [ ] Route `/dns-dashboard` ist ohne Login nicht erreichbar (redirect zur Login-Seite)
- [ ] Viewer-Rolle reicht aus (kein Operator/Admin erforderlich)
- [ ] 401/403 führt zu Login-Redirect, nicht zu Raw-JSON-Fehler

### AC-9: Navigation
- [ ] Dashboard ist über die App-Navigation erreichbar
- [ ] Link erscheint in der Sidebar oder im Hauptmenü

---

## Data Sources

| Daten | Endpoint | Feld |
|-------|----------|------|
| Participants / DNS-Server | `GET /api/v1/participants` | `forwardServers`, `ip`, `hostname` |
| Capabilities / Zonen | `GET /api/v1/capabilities` | DNS-Capability-Einträge |
| Zone-Inhalte / Records | `POST /api/v1/zones/generate` | generierte Zone-Files parsen |

**Fallback:** Falls ein Endpoint leer antwortet, zeigt das Dashboard leere Panels mit einem Hinweis-Text (kein Crash).

---

## Edge Cases

### EC-1: Keine Participants konfiguriert
- Server-Panel zeigt leeren Zustand mit Text "Keine DNS-Server konfiguriert."
- Stats zeigen 0 Server

### EC-2: API-Fehler / Timeout
- Panel zeigt Fehler-State mit rotem Rahmen und Fehlermeldung
- Andere Panels sind nicht betroffen (graceful degradation)
- Retry beim nächsten Auto-Refresh-Zyklus

### EC-3: Zone ohne Records
- Zone wird angezeigt mit "0 Records" und Status "Warning"

### EC-4: Mehr als 10 Zonen
- Liste ist scrollbar, kein Overflow-Clip
- Performance: Keine Pagination nötig für MVP (< 100 Zonen realistisch)

### EC-5: Unbekannter Status
- Wenn Status-Feld fehlt oder nicht auswertbar: Badge "Unknown" in grauer Farbe, kein pulsierender Dot

### EC-6: Topologie ohne Daten
- Diagramm zeigt Placeholder-Nodes mit gepunkteten Rahmen und Text "No data"

### EC-7: Mobil / Schmales Viewport
- Unterhalb 768px: Panels stapeln sich vertikal, kein horizontal scroll
- Topbar kollabiert auf essenzielle Elemente (Clock + Status)

---

## Out of Scope (MVP)
- Kein Live-DNS-Query (nslookup/dig über die App)
- Kein Editieren von Konfigurationen aus dem Dashboard heraus
- Kein Export / Download aus dem Dashboard
- Keine Echtzeit-Metriken (Latenz, Queries/s) — statisch aus Konfigurationsdaten

---

## Design Reference
`req-init/Idee-mockup.html` — NTP Dashboard Mockup (DTS // CC291)
- Design Tokens: `--bg-base: #070b0f`, `--accent: #00ff41`, `--font: 'JetBrains Mono'`
- Panel-Stil: Corner Brackets via CSS `::before`/`::after`
- Status-Dots: `pulse` / `pulse-warn` Keyframe-Animationen
- Topbar mit UTC-Clock: `blink` Colon-Animation

---

## Notes
- Datenbasis ist vollständig read-only aus bestehenden API-Endpoints
- Kein neuer Backend-Code erforderlich — alle benötigten Endpoints existieren bereits
- Implementierung als Client Component (für Auto-Refresh / useState)
- Route `/dns-dashboard` als neue Next.js App Router Page
