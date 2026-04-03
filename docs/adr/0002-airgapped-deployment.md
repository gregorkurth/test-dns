# 2. Airgapped Deployment ohne externe Abhängigkeiten

Datum: 2026-04-03

## Status

Akzeptiert

## Kontext

Mission Network Operators (MNOs) arbeiten bei CWIX und in Feldübungen in Netzwerken ohne Internetzugang. Das Tool muss vollständig ohne externe APIs, CDNs oder Cloud-Dienste betreibbar sein.

## Entscheid

- **Next.js Static Generation**: Alle Daten werden zur Build-Zeit geladen (`generateStaticParams`, `fs`-Modul). Keine Client-seitigen API-Calls zu externen Diensten.
- **Keine Cloud-Datenbank**: Kein Supabase, kein Firebase. Daten leben in Markdown-Dateien im Repository.
- **Lokale Assets**: Keine Google Fonts, kein CDN für CSS/JS. Alle Assets werden mit der App gebündelt.
- **OFT als JAR**: OpenFastTrace-JAR liegt im Repository unter `tools/`. Kein Download zur Laufzeit.
- **Deployment**: Next.js `npm run build` + `npm run start` auf einem internen Server (oder `npm run export` für statische Files).

## Konsequenzen

- Build-Zeit steigt leicht (Markdown-Parsing aller Capability-Dateien)
- Alle Capability-Daten müssen im Repository gepflegt werden
- Neue Requirements können offline angelegt werden (nur Git erforderlich)
