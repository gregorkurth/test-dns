# Quickstart

Ziel: In kurzer Zeit von `git clone` zu einer laufenden lokalen App.
Wenn die Standard-Umgebung schon eingerichtet ist, klappt das in unter 15 Minuten.

## Voraussetzungen

- Git
- Node.js in einer passenden LTS-Version
- npm
- Ein Browser

Optional:
- Supabase, wenn du die Backend-Anbindung testen willst
- Zugriff auf die Dokumentation, falls du parallel mitlesen willst

## Schritte

1. Repository klonen.
   ```bash
   git clone <repo-url>
   cd test-dns
   ```
2. Abhaengigkeiten installieren.
   ```bash
   npm install
   ```
3. Lokale Konfiguration anlegen.
   ```bash
   cp .env.local.example .env.local
   ```
4. Falls du Supabase aktiv nutzt, beide Werte in `.env.local` setzen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Lokalen Entwicklungsserver starten.
   ```bash
   npm run dev
   ```
6. App im Browser oeffnen.
   - `http://localhost:3000`
7. Wenn du die technische Basis pruefen willst, laufe danach noch:
   ```bash
   npm run lint
   npm run build
   ```

## Was du danach sehen solltest

- Die Startseite der App
- Den Feature- und Dokumentationszugang
- Keine Fehlermeldung wegen fehlender lokaler Dateien

## Wenn es nicht startet

- Pruefe, ob Node und npm installiert sind.
- Pruefe, ob `npm install` ohne Fehler durchgelaufen ist.
- Pruefe, ob die Datei `.env.local` vorhanden ist.
- Pruefe, ob Port `3000` frei ist.

## Weiter lesen

- [Betriebsdokumentation](operations.md)
- [Konfiguration](configuration.md)
- [Architektur](architecture.md)
- [Benutzerhandbuch](user-manual/README.md)
