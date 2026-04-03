# 5. Next.js mit Static Generation für Capability-Daten

Datum: 2026-04-03

## Status

Akzeptiert

## Kontext

Die Capability-Daten (Requirements, Tests, Service Functions) liegen als Markdown-Dateien im Repository. Die App muss diese Daten anzeigen – offline und ohne externe Datenbank.

## Entscheid

Wir nutzen **Next.js App Router mit Static Generation** (`generateStaticParams` + Server Components). Markdown-Dateien werden zur Build-Zeit mit `fs` gelesen und gerendert. Ergebnis: Vollständig statische HTML-Seiten, die ohne Laufzeit-Server ausgeliefert werden können.

Für Markdown-Parsing: `gray-matter` (Frontmatter) + `remark` (Markdown → HTML).

## Konsequenzen

- `npm run build` muss nach jeder Änderung an Capability-Dateien neu ausgeführt werden
- Keine dynamischen Datenbankabfragen
- Seiten sind nach dem Build komplett offline lauffähig
