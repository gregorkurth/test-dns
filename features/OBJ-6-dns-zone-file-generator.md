# OBJ-6: DNS Zone File Generator

## Status: In Progress
**Created:** 2026-03-17
**Last Updated:** 2026-04-06

## Dependencies
- OBJ-5 (Participant Configuration Form) - Konfigurationsdaten werden als Input verwendet
- OBJ-3 (REST API) - Zone-Files werden ueber `/api/v1/zones/generate` erzeugt

## User Stories
- Als Mission Network Operator moechte ich aus den erfassten Konfigurationsdaten (OBJ-5) mit einem Klick BIND9-konforme Zone-Files generieren, damit ich diese direkt in meinen Nameserver laden kann.
- Als Operator moechte ich sowohl Forward- als auch Reverse-Zone-Files generieren, damit ich die vollstaendige DNS-Delegation abdecke.
- Als Operator moechte ich die generierten Files vor dem Download in der App vorschauen, damit ich sie ueberpruefen kann.
- Als Operator moechte ich, dass die generierten Zone-Files die SOA-, NS-, A- und PTR-Records korrekt enthalten (SREQ-238, SREQ-239), damit die Files sofort deploybar sind.
- Als Operator moechte ich, dass die SOA-Werte (Serial, Refresh, Retry, Expire, TTL) konfigurierbar sind, damit ich sie an meine Mission-Anforderungen anpassen kann.

## Acceptance Criteria
- [ ] Forward Zone-File wird aus Konfigurationsdaten generiert mit SOA-Record, NS-Records, A-Records fuer Nameserver und Resolver sowie Anycast-A-Record (falls aktiv).
- [ ] Reverse Zone-File wird fuer jede delegierte Reverse-Zone generiert mit SOA-Record, NS-Record und PTR-Records.
- [ ] SOA-Parameter sind konfigurierbar: Serial (optional manuell), Primary NS, Admin Mail, Refresh, Retry, Expire, Minimum TTL.
- [ ] Generated Output wird in einer Read-Only Ansicht angezeigt (Forward und Reverse getrennt).
- [ ] "Kopieren"-Button (Copy to Clipboard) ist fuer jede generierte Zone vorhanden.
- [ ] Generierung nutzt den bestehenden API-Endpunkt `/api/v1/zones/generate` (keine externe Abhaengigkeit).
- [ ] Zone-File-Format ist BIND9-kompatibel (RFC 1035).
- [ ] Validierungsfehler aus OBJ-5 blockieren die Generierung mit klarer Fehlermeldung.

## Edge Cases
- Konfiguration enthaelt keine Reverse-Zone -> Nur Forward-Zone wird generiert, Hinweis wird angezeigt.
- Operator aendert Konfiguration nach Generierung -> Warnung "Konfiguration geaendert, bitte neu generieren".
- Serial-Override ist leer -> API nutzt den Standard-Serial-Generator.
- Reverse-Zone passt nicht zu vorhandenen IPv4-Daten -> Reverse-Zone wird uebersprungen und als Hinweis angezeigt.
- Sehr grosse Zonen (> 100 Records) -> Generierung soll weiterhin innerhalb einer kurzen Interaktion erfolgen.

## Technical Requirements
- API-first Generierung ueber lokalen OBJ-3 Endpunkt (`/api/v1/zones/generate`).
- Read-Only Ausgabe in der App (Forward/Reverse separat) mit Copy-Funktion.
- Output-Format: Plain Text, kompatibel mit BIND9 named.conf zone-Direktiven.
- UI und API muessen ohne Internetzugang lauffaehig bleiben (airgapped).

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Scope**

OBJ-6 liefert eine bedienbare Generator-Sicht, die OBJ-5 Participant-Konfigurationen in BIND9-kompatible Zone-Files uebersetzt. Die fachliche Quelle bleibt OBJ-5, die technische Generierung nutzt den vorhandenen OBJ-3 API-Endpunkt.

**Komponentenstruktur (Visual Tree)**

```
Zone Generator Page
+-- Header / Statusbereich
|   +-- Erfolg/Fehler/Hinweise
+-- Participant + SOA Konfiguration
|   +-- Participant-Auswahl (aus API)
|   +-- SOA Felder (TTL, Serial, Primary NS, Admin Mail, Timer)
|   +-- Aktionen: Generieren, Participants neu laden
+-- Kontextkarte
|   +-- Aktuell gewaehlter Participant + Zeitstempel
+-- Ergebnisbereich
    +-- Forward Zone (Read-Only + Copy)
    +-- Reverse Zones (je Zone Read-Only + Copy)
```

**Datenfluss**

1. UI laedt Participants via `GET /api/v1/participants`.
2. Detaildaten werden bei Generierung via `GET /api/v1/participants/{id}` geladen.
3. `prepareZoneGenerationInputFromParticipant(...)` mappt OBJ-5 Metadaten auf Forward-/Reverse-Payloads.
4. UI ruft fuer Forward- und Reverse-Zonen `POST /api/v1/zones/generate` auf.
5. Zone-Files werden direkt als Text angezeigt und koennen kopiert werden.

**Technische Leitentscheidungen**

- API-first statt reinem Browser-Generator, damit ein einheitlicher Generatorkern genutzt wird.
- Reuse des bestehenden OBJ-3 Schemas reduziert Implementierungsrisiko und Doppel-Logik.
- Vorverarbeitung in `src/lib/obj6-zone-generation.ts` kapselt Mapping/Validierung fuer spaetere Export- oder Batch-Flows.

**Requirements Engineer Input**

- Pflichtdaten aus OBJ-5: mindestens 1 Forward-Zone und mindestens 2 gueltige Nameserver.
- Anycast-Daten werden als zusaetzlicher A-/PTR-Record beruecksichtigt, wenn aktiv und vollstaendig.
- Bei unvollstaendigen Daten wird nicht stillschweigend generiert, sondern mit klarer Fehlermeldung abgebrochen.

**QA Engineer Input (Readiness)**

- Unit-Tests fuer Mapping und Fehlerpfade (`src/lib/obj6-zone-generation.test.ts`).
- Regression-Gate: `npm run lint`, `npm run test:run`, `npm run build`.
- API-Schnittstelle bleibt ueber Swagger/OpenAPI sichtbar fuer Nachvollziehbarkeit.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
