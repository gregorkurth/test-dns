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
4. Session-Secret generieren und in `.env.local` eintragen.
   ```bash
   echo "OBJ12_SESSION_SECRET=$(openssl rand -base64 48)" >> .env.local
   ```
5. User-Konfiguration anlegen.
   ```bash
   cp config/users.local.json.example config/users.local.json
   ```
   Dann in `config/users.local.json` die Passwörter durch sichere Werte ersetzen.
   Die Datei ist gitignored und wird nie eingecheckt.
7. Lokalen Entwicklungsserver starten.
   ```bash
   npm run dev
   ```
8. App im Browser oeffnen.
   - `http://localhost:3000`
9. Wenn du die technische Basis pruefen willst, laufe danach noch:
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
- Pruefe, ob die Datei `.env.local` vorhanden ist und `OBJ12_SESSION_SECRET` gesetzt ist.
- Pruefe, ob `config/users.local.json` vorhanden ist (aus `.example` kopieren und Passwörter setzen).
- Pruefe, ob Port `3000` frei ist.

## Weiter lesen

- [Betriebsdokumentation](operations.md)
- [Konfiguration](configuration.md)
- [Architektur](architecture.md)
- [Benutzerhandbuch](user-manual/README.md)
