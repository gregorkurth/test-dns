# OBJ-4 Live Dashboard

Diese Variante ist fuer "Open with Live Server" in VS Code gebaut.

## Schnellstart (ohne grosse Installation)

1. In VS Code die Datei `capability-dashboard-live/index.html` oeffnen.
2. Rechtsklick auf die Datei.
3. `Open with Live Server` waehlen.

Danach laeuft das Capabilities Dashboard direkt im Browser.

## Datenquelle

Das Dashboard liest:
- `capability-dashboard-live/data/capabilities-dashboard.json`

Diese Datei wird build-time aus `capabilities/**/*.md` erzeugt.

## Daten neu erzeugen (optional)

Wenn sich Requirements/Struktur in `capabilities/` aendern:

```bash
npm run build:obj4-live-data
```

Alternativ:

```bash
node scripts/build-obj4-live-data.mjs
```

Danach die Browserseite neu laden.
