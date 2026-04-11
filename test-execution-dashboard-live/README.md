# OBJ-23 Live Dashboard

Diese Variante ist fuer "Open with Live Server" in VS Code gebaut.
Sie eignet sich auch fuer Nicht-Entwickler, weil keine Next.js-Umgebung gestartet werden muss.

## Schnellstart (ohne grosse Installation)

1. In VS Code `test-execution-dashboard-live/index.html` oeffnen.
2. Rechtsklick auf die Datei.
3. `Open with Live Server` waehlen.

Danach laeuft das Test-Execution-Dashboard direkt im Browser.
Im Dashboard stehen die Sichten "Aktueller Stand", "Pro OBJ", "Pro Release" und "Pro Run" zur Verfuegung.
Fehlerhafte oder zeitlich nicht auswertbare Nachweise werden als Hinweis sichtbar gehalten,
zaehlen aber nicht als gueltiger letzter Nachweis.

## Datenquelle

Das Dashboard liest:
- `test-execution-dashboard-live/data/test-execution-dashboard.json`

## Daten neu erzeugen (optional)

Wenn sich Tests, Nachweise oder Capabilities geaendert haben:

```bash
npm run build:obj23-live-data
```

## Spaeterer Betrieb als Webserver

Diese Live-Variante kann spaeter unveraendert ueber einen einfachen Webserver
(z. B. Nginx/Apache oder internes Static Hosting) bereitgestellt werden.
