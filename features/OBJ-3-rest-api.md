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
**Scope**

OBJ-3 liefert eine einheitliche API als Integrationsschicht fuer:
- Dashboard (OBJ-4)
- Konfigurations-Workflow (OBJ-5)
- Zone-Generierung (OBJ-6)
- spaeteren Operator-Betrieb

Die API ist bewusst versioniert und offline-faehig geplant.

**API-Faehigkeiten (Visual Tree)**

```
API v1
+-- Katalog lesen
|   +-- Capabilities Uebersicht
|   +-- Capability-Detail
+-- Konfiguration verwalten
|   +-- Participants lesen
|   +-- Participants anlegen / aktualisieren / entfernen
+-- Generierung starten
    +-- Zone-File Prozess ausloesen
+-- API-Vertrag
    +-- OpenAPI-Spezifikation fuer Klarheit und Testbarkeit
```

**Datenmodell (in einfachen Worten)**

Die API verwaltet drei Kernobjekte:
- Capability-Daten (strukturierte Lesedaten)
- Participant-Konfigurationen (bearbeitbare Betriebsdaten)
- Generierungsauftraege fuer Zone-Files

Jede Antwort folgt einem konsistenten Muster, damit UI, Tests und Betrieb gleich damit arbeiten koennen.

**Technische Leitentscheidungen (fuer PM)**

- Eine zentrale API verhindert doppelte Logik in UI und spaeteren Integrationen.
- Versionierung (`v1`) reduziert Risiko bei spaeteren Erweiterungen.
- Ein klarer API-Vertrag erleichtert Uebergabe, Tests und Doku.
- Offline-First bleibt gewahrt, da keine externe Laufzeitabhaengigkeit notwendig ist.

**Requirements Engineer Input**

- API-Anforderungen sind so formuliert, dass jede Funktion einem testbaren Requirement zugeordnet werden kann.
- Fehlerfaelle (ungueltige Daten, nicht gefundene Objekte, Generierungsfehler) werden explizit als Requirement-Teile betrachtet.
- OpenAPI-Dokumentation ist Teil der fachlichen Nachvollziehbarkeit, nicht nur technisches Beiwerk.

**QA Engineer Input (Readiness)**

- QA testet pro Endpunkt mindestens Erfolgsfall plus Fehlerfall.
- Konsistenzpruefung: Antwortstruktur, Statuscodes, Fehlermeldungsqualitaet.
- Regression-Gate: Dashboard-Datenfluss (OBJ-4) darf bei API-Aenderungen nicht brechen.

**Abhaengigkeiten / Werkzeuge**

- `zod` (konsistente Eingabevalidierung)
- OpenAPI-Dokumentation (lesbarer API-Vertrag)
- bestehendes Test-Setup fuer API-Happy- und Fehlerpfade

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
