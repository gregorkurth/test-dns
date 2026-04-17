# Web Dashboard Design Template

> Wiederverwendbares Terminal-Style-Design-System für operative Web-Dashboards in FMN Mission Network Services.
> Basiert auf dem DTS NTP-Mockup (`req-init/Idee-mockup.html`), angewendet in OBJ-28 (DNS Overview Dashboard) und OBJ-29 (Capabilities Overview Page).

---

## Design-Philosophie

- **Terminal-Ästhetik:** Dunkel, monospace, grüne Akzente — angelehnt an klassische Operator-Terminals
- **Information-Dense:** Maximale Informationsdichte ohne visuelle Unruhe
- **Status-First:** Betriebszustand sofort erkennbar (grün/gelb/rot, pulsierende Dots)
- **Airgapped-tauglich:** Kein CDN, keine externen Fonts (Fallback-Stack), keine Webfonts-Anfragen
- **Responsive:** Funktioniert ab 768px Breite; mobil: vertikales Stacking

---

## Design Tokens (CSS Custom Properties)

```css
:root {
  /* Hintergründe */
  --bg-base:         #070b0f;   /* Seiten-Hintergrund */
  --bg-surface:      #0d1117;   /* Sidebar, Topbar */
  --bg-panel:        #111820;   /* Panel-Hintergrund */
  --bg-panel-2:      #161e28;   /* Sekundäre Panel-Ebene */

  /* Rahmen */
  --border:          #1e2a38;   /* Standard-Rahmenfarbe */
  --border-accent:   #1a4a2e;   /* Grüner Akzentrahmen */

  /* Text */
  --text-primary:    #c9d1d9;   /* Haupttext */
  --text-bright:     #e6edf3;   /* Hervorgehobener Text, Zahlen */
  --text-muted:      #6e7681;   /* Sekundärtext, Labels */
  --text-dim:        #30363d;   /* Gedimmter Text, Trennlinien */

  /* Akzentfarben */
  --accent:          #00ff41;   /* Primäre Akzentfarbe (Matrix-Grün) */
  --accent-dim:      #00cc33;   /* Gedimmter Akzent */
  --accent-glow:     rgba(0, 255, 65, 0.10);   /* Akzent-Glow-Hintergrund */
  --accent-glow-strong: rgba(0, 255, 65, 0.22); /* Stärkerer Glow */

  /* Status-Farben */
  --online:          #3fb950;   /* Grün – Online / Operational */
  --degraded:        #d29922;   /* Gelb – Degraded / Warning */
  --offline:         #da3633;   /* Rot – Offline / Error */
  --warn:            #d29922;
  --warn-bg:         rgba(210, 153, 34, 0.08);
  --error:           #da3633;
  --error-bg:        rgba(218, 54, 51, 0.08);

  /* Layout */
  --sidebar-w:       210px;
  --topbar-h:        54px;

  /* Typografie */
  --font: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
}
```

---

## Typografie-Skala

| Klasse / Verwendung | Grösse | Gewicht | Farbe | Buchstabenabstand |
|---------------------|--------|---------|-------|-------------------|
| Topbar Clock | 24px | 700 | `--accent` | 0.04em |
| Server-Name / Hauptwert | 15–17px | 700 | `--text-bright` | 0.03em |
| Stat-Card Zahl | 30px | 700 | `--accent` oder `--text-bright` | — |
| Panel-Label | 9px | 400 | `--accent-dim` | 0.24em |
| Nav-Item | 11px | 400 | `--text-muted` | 0.08em |
| Metric-Label | 8px | 400 | `--text-dim` | 0.18em |
| Badge / Status-Text | 9px | 400 | Status-Farbe | 0.14em |
| Body-Text | 13px | 400 | `--text-primary` | — |

**Regel:** Alle sichtbaren Texte in `text-transform: uppercase` für Labels, Badges und Nav-Items. Body-Text bleibt normal-case.

---

## Layout-Struktur

```
┌─────────────────────────────────────────────────────┐
│ TOPBAR (--topbar-h: 54px)                           │
│  Mission-ID  /  Seitentitel  [Status-Badge] [Clock] │
├────────────┬────────────────────────────────────────┤
│  SIDEBAR   │  CONTENT (scrollable)                  │
│  (210px)   │                                        │
│            │  [Stat-Cards Row]                      │
│  Logo      │                                        │
│  Nav       │  [Panel Grid]                          │
│            │                                        │
│  Footer    │  [Update-Bar]                          │
│  Health    │                                        │
└────────────┴────────────────────────────────────────┘
```

---

## Komponenten-Bibliothek

### 1. Panel

```css
.panel {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  padding: 16px 18px;
  position: relative;
}

/* Corner-Bracket oben links */
.panel::before {
  content: '';
  position: absolute;
  top: -1px; left: -1px;
  width: 12px; height: 12px;
  border-top: 2px solid var(--accent-dim);
  border-left: 2px solid var(--accent-dim);
  opacity: 0.6;
}

/* Corner-Bracket unten rechts */
.panel::after {
  content: '';
  position: absolute;
  bottom: -1px; right: -1px;
  width: 12px; height: 12px;
  border-bottom: 2px solid var(--accent-dim);
  border-right: 2px solid var(--accent-dim);
  opacity: 0.6;
}
```

### 2. Panel-Label

```css
.panel-label {
  font-size: 9px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--accent-dim);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Trennlinie nach dem Label */
.panel-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, var(--border), transparent);
}
```

### 3. Status-Dot (pulsierend)

```css
.sdot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}
.sdot.online   { background: var(--online);   animation: pulse 2s ease-in-out infinite; }
.sdot.degraded { background: var(--degraded); animation: pulse-warn 1.4s ease-in-out infinite; }
.sdot.offline  { background: var(--offline); }

@keyframes pulse {
  0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(63,185,80,0.5); }
  50%     { opacity:.7; box-shadow: 0 0 0 5px rgba(63,185,80,0); }
}
@keyframes pulse-warn {
  0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(210,153,34,0.5); }
  50%     { opacity:.7; box-shadow: 0 0 0 5px rgba(210,153,34,0); }
}
```

### 4. Status-Badge

```css
.sbadge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border: 1px solid;
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.sbadge.online   { color: var(--online);   border-color: rgba(63,185,80,0.35);  background: rgba(63,185,80,0.07); }
.sbadge.degraded { color: var(--degraded); border-color: rgba(210,153,34,0.35); background: rgba(210,153,34,0.07); }
.sbadge.offline  { color: var(--error);    border-color: rgba(218,54,51,0.35);  background: rgba(218,54,51,0.07); }
```

### 5. Stat-Card

```css
.stat-card { padding: 14px 16px; text-align: center; }
.stat-lbl  { font-size: 8px; letter-spacing: 0.2em; color: var(--text-dim); text-transform: uppercase; margin-bottom: 8px; }
.stat-val  { font-size: 30px; font-weight: 700; color: var(--text-bright); line-height: 1; }
.stat-val.g { color: var(--accent); text-shadow: 0 0 20px var(--accent-glow-strong); }
.stat-sub  { font-size: 9px; color: var(--text-dim); margin-top: 5px; }
```

Verwendung:
```html
<div class="panel stat-card">
  <div class="stat-lbl">Zonen gesamt</div>
  <div class="stat-val g">12</div>
  <div class="stat-sub">Konfiguriert</div>
</div>
```

### 6. Metric-Box (innerhalb von Panel-Cards)

```css
.metric {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 8px 10px;
}
.metric-lbl {
  font-size: 8px; color: var(--text-dim);
  letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 4px;
}
.metric-val { font-size: 17px; font-weight: 700; color: var(--text-bright); line-height: 1; }
.metric-val.g { color: var(--accent); text-shadow: 0 0 10px var(--accent-glow); }
.metric-val.y { color: var(--warn); }
.metric-val.r { color: var(--error); }
.metric-unit  { font-size: 9px; color: var(--text-dim); margin-left: 1px; font-weight: 400; }
```

### 7. UTC-Clock (Topbar)

```css
.topbar-clock {
  font-size: 24px; font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.04em;
  text-shadow: 0 0 22px var(--accent-glow-strong), 0 0 50px var(--accent-glow);
}
.colon { animation: blink 1s step-end infinite; }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:.15; } }
```

JavaScript:
```js
function tick() {
  const n = new Date();
  const pad = x => String(x).padStart(2, '0');
  document.getElementById('clock').innerHTML =
    `${pad(n.getUTCHours())}<span class="colon">:</span>${pad(n.getUTCMinutes())}<span class="colon">:</span>${pad(n.getUTCSeconds())}`;
}
setInterval(tick, 1000); tick();
```

### 8. Update-Bar (Poll-Status)

```css
.update-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-surface); border: 1px solid var(--border);
  font-size: 10px; color: var(--text-dim); letter-spacing: 0.04em;
  margin-top: 14px;
}
.poll-bar {
  width: 64px; height: 3px;
  background: var(--border); position: relative; overflow: hidden;
  display: inline-block; vertical-align: middle; margin: 0 6px;
}
.poll-fill {
  position: absolute; left: 0; top: 0; height: 100%;
  background: var(--accent);
  animation: poll 30s linear infinite; /* Intervall anpassen */
}
@keyframes poll { 0% { width: 100%; } 100% { width: 0%; } }
```

### 9. Scanline-Overlay (Body-Effekt)

```css
body::after {
  content: '';
  position: fixed; inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px, transparent 3px,
    rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
```

### 10. Sidebar-Nav-Item

```css
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 16px; cursor: pointer;
  color: var(--text-muted); font-size: 11px; letter-spacing: 0.08em;
  border-left: 2px solid transparent;
  transition: all 0.12s; text-transform: uppercase;
}
.nav-item:hover { color: var(--text-primary); background: rgba(255,255,255,0.025); }
.nav-item.active {
  color: var(--accent);
  border-left-color: var(--accent);
  background: var(--accent-glow);
}
```

### 11. Alert-Banner

```css
.alert { display: flex; align-items: flex-start; gap: 8px; padding: 9px 12px; border: 1px solid; font-size: 11px; line-height: 1.5; margin-bottom: 14px; }
.alert-info  { border-color: var(--border-accent); background: var(--accent-glow);  color: var(--accent-dim); }
.alert-warn  { border-color: rgba(210,153,34,0.35); background: var(--warn-bg);      color: var(--warn); }
.alert-err   { border-color: rgba(218,54,51,0.35);  background: var(--error-bg);     color: var(--error); }
```

---

## Grid-System

```css
.grid-2 { display: grid; grid-template-columns: 1fr 1fr;          gap: 14px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr;      gap: 14px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr);   gap: 14px; }
.gap    { margin-bottom: 14px; }
.gap-sm { margin-bottom: 8px; }
```

Responsive (ab 768px):
```css
@media (max-width: 767px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}
```

---

## Status-Logik (Standard-Mapping)

| Wert / Zustand | Klasse | Dot | Badge-Text |
|----------------|--------|-----|------------|
| Online / Operational | `online` | pulsierend grün | ONLINE |
| Degraded / In Development | `degraded` | pulsierend gelb | DEGRADED |
| Offline / Error | `offline` | statisch rot | OFFLINE |
| Unbekannt / null | — | kein Dot | UNKNOWN (grau) |

---

## Topbar-Systemstatus-Berechnung

```
OPERATIONAL = alle Elemente haben Status 'online'
DEGRADED    = mindestens 1 Element hat Status 'degraded' oder 'offline'
```

---

## SVG-Topologie-Diagramm (Vorlage)

Für Hierarchie-Diagramme (Forwarder → Authoritative → Clients):

```svg
<svg viewBox="0 0 720 230" height="230" style="width:100%">
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#1a4a2e"/>
    </marker>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Obere Ebene (z.B. Root / Forwarder) -->
  <rect x="260" y="8" width="200" height="46" fill="#0d1117" stroke="#1a4a2e" stroke-width="1.5"/>
  <text x="360" y="24" fill="#00cc33" font-size="8" letter-spacing="3" text-anchor="middle" font-family="monospace">EBENE LABEL</text>
  <text x="360" y="44" fill="#00ff41" font-size="16" font-weight="bold" text-anchor="middle" font-family="monospace" filter="url(#glow)">HOSTNAME</text>

  <!-- Verbindungslinie (gestrichelt) -->
  <line x1="360" y1="54" x2="360" y2="94" stroke="#1a4a2e" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>

  <!-- Mittlere Ebene -->
  <rect x="210" y="94" width="300" height="52" fill="#111820" stroke="#00cc33" stroke-width="1.5"/>
  <text x="224" y="112" fill="#00cc33" font-size="8" letter-spacing="3" font-family="monospace">EBENE LABEL</text>
  <text x="360" y="134" fill="#e6edf3" font-size="14" font-weight="bold" text-anchor="middle" font-family="monospace">hostname.domain</text>
  <circle cx="502" cy="120" r="5" fill="#3fb950">
    <animate attributeName="opacity" values="1;0.3;1" dur="2.2s" repeatCount="indefinite"/>
  </circle>
</svg>
```

---

## React / Next.js Implementierungshinweise

### Client Component (Auto-Refresh)
```tsx
'use client'
import { useEffect, useState } from 'react'

const REFRESH_INTERVAL_MS = 30_000

export function TerminalDashboard() {
  const [data, setData] = useState(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function load() {
    const res = await fetch('/api/v1/capabilities')
    if (res.ok) {
      const json = await res.json()
      setData(json.data)
      setLastUpdated(new Date())
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // ...
}
```

### Tailwind-Äquivalente Design-Tokens
Für die Nutzung in Tailwind CSS (bei Next.js Projekten):

```css
/* tailwind.config.ts – extend colors */
colors: {
  terminal: {
    base:    '#070b0f',
    surface: '#0d1117',
    panel:   '#111820',
    border:  '#1e2a38',
    accent:  '#00ff41',
    'accent-dim': '#00cc33',
    online:  '#3fb950',
    degraded: '#d29922',
    offline: '#da3633',
    text: {
      primary: '#c9d1d9',
      bright:  '#e6edf3',
      muted:   '#6e7681',
      dim:     '#30363d',
    }
  }
}
```

---

## Wiederverwendung in anderen Services

Dieses Design-System ist service-agnostisch und kann für beliebige FMN Mission Network Dashboards verwendet werden (NTP, DNS, PKI, Time, IAM, etc.).

### Checkliste für neue Dashboards
- [ ] Design-Tokens aus dieser Datei übernehmen (CSS Custom Properties oder Tailwind-Config)
- [ ] Monospace-Font-Stack konfigurieren (kein CDN; lokaler Font-Fallback)
- [ ] Scanline-Overlay via `body::after` aktivieren
- [ ] Panel-Komponente mit Corner-Brackets via `::before`/`::after`
- [ ] Status-Dots und -Badges gemäss Standard-Mapping verwenden
- [ ] UTC-Clock im Topbar integrieren
- [ ] Update-Bar mit Countdown-Balken und "Last updated"-Zeitstempel
- [ ] Auto-Refresh-Intervall dokumentieren (Standard: 30 Sekunden)
- [ ] Systemstatus-Badge (OPERATIONAL / DEGRADED) im Topbar
- [ ] Empty-State und Error-State für alle Datenpanels
- [ ] Responsive: Grid kollabiert < 768px zu 1 Spalte
- [ ] Auth: Viewer-Rolle oder höher erforderlich

### Referenz-Implementierungen
| Feature | Seite | Spec |
|---------|-------|------|
| OBJ-28 DNS Overview | `/dns-dashboard` | `features/OBJ-28-dns-overview-dashboard.md` |
| OBJ-29 Capabilities Overview | `/capabilities` | `features/OBJ-29-capabilities-overview-page.md` |
| Mockup (HTML-Referenz) | — | `req-init/Idee-mockup.html` |
