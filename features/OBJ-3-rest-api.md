# OBJ-3: REST API

## Status: In Progress
**Created:** 2026-04-03
**Last Updated:** 2026-04-04

## Dependencies
- OBJ-4: Capabilities Dashboard (API liefert Capabilities-Daten)
- OBJ-5: Participant Configuration Form (API verwaltet Participant-Konfigurationen)
- OBJ-6: DNS Zone File Generator (API triggert Zone-File-Generierung)

## User Stories
- Als Entwickler möchte ich eine dokumentierte REST API nutzen, damit ich das Web GUI und den Kubernetes Operator an dieselbe Datenbasis anbinden kann.
- Als Mission Network Operator möchte ich Konfigurationsdaten über die API abrufen und speichern können, damit externe Tools (z. B. Skripte) die Daten nutzen können.
- Als Platform Engineer möchte ich die API-Version in der URL sehen (`/api/v1/...`), damit ich Änderungen rückwärtskompatibel einführen kann.
- Als Entwickler möchte ich eine OpenAPI-Spezifikation (Swagger) abrufen können, damit ich die API automatisch testen und dokumentieren kann.
- Als Operator möchte ich, dass die API klare Fehlerresponses (HTTP-Status + Fehlermeldung) zurückgibt, damit ich Probleme schnell diagnostizieren kann.

## Acceptance Criteria
- [ ] API ist unter `/api/v1/` erreichbar
- [ ] Endpunkte für Capabilities (GET /capabilities, GET /capabilities/:id) vorhanden
- [ ] Endpunkte für Participant-Konfiguration (GET/POST/PUT/DELETE /participants) vorhanden
- [ ] Endpunkt für Zone-File-Generierung (POST /zones/generate) vorhanden
- [ ] OpenAPI-Spezifikation unter `/api/v1/openapi.json` abrufbar
- [ ] Alle Responses im JSON-Format mit konsistentem Schema (data, error, meta)
- [ ] HTTP-Statuscodes korrekt gesetzt (200, 201, 400, 404, 422, 500)
- [ ] API läuft vollständig in der Next.js App (keine externe Service-Abhängigkeit)
- [ ] API-Endpunkte sind mit automatisierten Tests (mind. Happy-Path + Fehlerfall) abgedeckt
- [ ] Antwortzeit < 200 ms für Lese-Operationen (ohne Zone-File-Generierung)

## Edge Cases
- Was passiert bei einem ungültigen JSON-Body? → HTTP 400 mit Beschreibung des Fehlers
- Was passiert bei einem nicht existierenden Participant? → HTTP 404 mit Fehlermeldung
- Was wenn die Zone-File-Generierung fehlschlägt? → HTTP 422 mit strukturiertem Validierungsfehler
- Was wenn zwei Requests gleichzeitig denselben Participant modifizieren? → Letzte Schreiboperation gewinnt (v1, keine Locks); Dokumentiert in den API-Docs
- Was wenn die OpenAPI-Spec nicht generiert werden kann? → Statische Fallback-Spec liegt im Repository

## Technical Requirements
- Implementierung als Next.js API Routes (App Router: `src/app/api/v1/...`)
- Datenhaltung in v1: file-based (JSON-Dateien), kein externes DBMS
- OpenAPI-Spec automatisch generiert (z. B. via `next-swagger-doc` oder manuell gepflegt)
- Keine externen API-Calls aus den Endpunkten heraus (airgapped)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

**Datum:** 2026-04-04

### Übersicht

Die REST API ist eine **Next.js App Router API-Schicht**, die vollständig innerhalb der bestehenden Next.js-App läuft. Kein separater Service, kein externes DBMS. Web GUI und Kubernetes Operator greifen ausschliesslich über diese API auf Konfigurationsdaten zu.

### Endpunkt-Struktur

```
/api/v1/
  openapi.json                    GET  – OpenAPI-Spezifikation
  capabilities/                   GET  – Alle Capabilities
  capabilities/[id]               GET  – Capability-Detail
  participants/                   GET  – Alle Participants
                                  POST – Participant anlegen
  participants/[id]               GET  – Participant-Detail
                                  PUT  – Participant aktualisieren
                                  DELETE – Participant löschen
  zones/generate                  POST – Zone-File generieren
```

### Datenhaltung

JSON-Dateien in `data/` (file-based, airgapped-kompatibel, kein DBMS):
- `data/participants/{id}.json` – ein Participant pro Datei
- `data/capabilities/index.json` – build-time aus `capabilities/**/*.md` generiert

Participant-Felder: ID (UUID), Name, DNS-Server-IPs, Zone-Namen, TSIG-Key-Referenz, Zeitstempel.

### Einheitliches Response-Format

- Erfolg: `{ data: {...}, meta: { version, timestamp } }`
- Fehler: `{ error: { code, message, field? }, meta: { version } }`
- Status-Codes: 200, 201, 400, 404, 422, 500

### Dateistruktur

```
src/app/api/v1/
  openapi.json/route.ts
  capabilities/route.ts
  capabilities/[id]/route.ts
  participants/route.ts
  participants/[id]/route.ts
  zones/generate/route.ts

src/lib/api/
  participants.ts    ← Datei-Lese/Schreib-Logik
  capabilities.ts    ← Datei-Lese-Logik
  zone-generator.ts  ← Zone-File-Generierung
  response.ts        ← Response-Format-Helfer

data/
  participants/      ← JSON-Dateien
  capabilities/
    index.json       ← build-time generiert

docs/api/
  openapi.yaml       ← OpenAPI-Spec (manuell gepflegt)
```

### Tech-Entscheide

| Entscheidung | Gewählt | Begründung |
|---|---|---|
| Framework | Next.js App Router Route Handlers | Kein zusätzlicher Server |
| Datenhaltung | JSON-Dateien in `data/` | Airgapped, versionierbar |
| Validierung | Zod (bereits installiert) | Konsistent mit Frontend |
| OpenAPI | Manuell gepflegte YAML | Zuverlässiger als Auto-Gen |
| Versionierung | URL-Präfix `/api/v1/` | Rückwärtskompatibel |

### Neue Pakete

- `uuid` – UUID-Generierung für Participants (neu, klein)

### Verknüpfungen

- OBJ-4 liest Capabilities via `GET /api/v1/capabilities`
- OBJ-5 schreibt Participants via `POST/PUT /api/v1/participants`
- OBJ-6 generiert Zone-Files via `POST /api/v1/zones/generate`
- OBJ-13 Kubernetes Operator kommuniziert ausschliesslich über diese API
- OBJ-12 Security sichert schreibende Endpunkte (POST/PUT/DELETE)

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
