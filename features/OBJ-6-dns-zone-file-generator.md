# OBJ-6: DNS Zone File Generator

## Status: Completed
**Created:** 2026-03-17
**Last Updated:** 2026-04-12

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
- [ ] `feat~obj-6-ac-1~1` Forward Zone-File wird aus Konfigurationsdaten generiert mit SOA-Record, NS-Records, A-Records fuer Nameserver und Resolver sowie Anycast-A-Record (falls aktiv).
- [ ] `feat~obj-6-ac-2~1` Reverse Zone-File wird fuer jede delegierte Reverse-Zone generiert mit SOA-Record, NS-Record und PTR-Records.
- [ ] `feat~obj-6-ac-3~1` SOA-Parameter sind konfigurierbar: Serial (optional manuell), Primary NS, Admin Mail, Refresh, Retry, Expire, Minimum TTL.
- [ ] `feat~obj-6-ac-4~1` Generated Output wird in einer Read-Only Ansicht angezeigt (Forward und Reverse getrennt).
- [ ] `feat~obj-6-ac-5~1` "Kopieren"-Button (Copy to Clipboard) ist fuer jede generierte Zone vorhanden.
- [ ] `feat~obj-6-ac-6~1` Generierung nutzt den bestehenden API-Endpunkt `/api/v1/zones/generate` (keine externe Abhaengigkeit).
- [ ] `feat~obj-6-ac-7~1` Zone-File-Format ist BIND9-kompatibel (RFC 1035).
- [ ] `feat~obj-6-ac-8~1` Validierungsfehler aus OBJ-5 blockieren die Generierung mit klarer Fehlermeldung.

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

**Dependencies (Packages)**

- Keine neuen Laufzeit-Pakete zwingend; Reuse des bestehenden Next.js/React-Stacks und der vorhandenen API-Routen.

**Requirements Engineer Input**

- Pflichtdaten aus OBJ-5: mindestens 1 Forward-Zone und mindestens 2 gueltige Nameserver.
- Anycast-Daten werden als zusaetzlicher A-/PTR-Record beruecksichtigt, wenn aktiv und vollstaendig.
- Bei unvollstaendigen Daten wird nicht stillschweigend generiert, sondern mit klarer Fehlermeldung abgebrochen.

**QA Engineer Input (Readiness)**

- Unit-Tests fuer Mapping und Fehlerpfade (`src/lib/obj6-zone-generation.test.ts`).
- Regression-Gate: `npm run lint`, `npm run test:run`, `npm run build`.
- API-Schnittstelle bleibt ueber Swagger/OpenAPI sichtbar fuer Nachvollziehbarkeit.

## QA Test Results
**Tested:** 2026-04-09
**App URL:** http://localhost:3000/zone-generator
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Forward Zone-File aus Konfigurationsdaten (SOA, NS, A, Anycast A)
- [x] Re-Test: NS-Records werden nur fuer dedizierte Nameserver erzeugt (`src/lib/obj6-zone-generation.test.ts`).
- [x] API erzeugt gueltige Forward-Zone (`POST /api/v1/zones/generate`, HTTP 200).

#### AC-2: Reverse Zone-File je delegierter Reverse-Zone (SOA, NS, PTR)
- [x] Reverse-Zone-Generierung mit PTR-Records erfolgreich (`0.0.10.in-addr.arpa`, HTTP 200).
- [x] SOA- und NS-Eintrag sind im generierten Reverse-Zone-File enthalten.

#### AC-3: SOA-Parameter konfigurierbar
- [x] `serial`, `primaryNs`, `adminMail`, `refresh`, `retry`, `expire`, `minimum` werden vom API-Endpunkt akzeptiert und im Zone-File korrekt gerendert.
- [x] Ungueltiger `serial` wird mit `ZONE_VALIDATION_ERROR` abgelehnt.

#### AC-4: Read-Only Ausgabe (Forward/Reverse getrennt)
- [x] Forward- und Reverse-Ausgabe sind in separaten Bereichen vorhanden.
- [x] Ausgabe erfolgt in `Textarea`-Komponenten mit `readOnly`.

#### AC-5: Copy-to-Clipboard je generierter Zone
- [x] Copy-Button fuer Forward-Zone vorhanden.
- [x] Copy-Button fuer jede Reverse-Zone vorhanden.

#### AC-6: Generierung nutzt `/api/v1/zones/generate`
- [x] UI ruft den Endpunkt fuer Forward und Reverse explizit auf.
- [x] Endpunkt liefert erwartete Erfolgs- und Fehlerantworten.

#### AC-7: BIND9-kompatibles Output-Format
- [x] Re-Test: Typspezifische Validierung aktiv (ungueltige A-/MX-Werte -> HTTP 422).
- [x] Gueltige Payload erzeugt weiterhin gueltiges Zone-File (HTTP 200).

#### AC-8: Validierungsfehler aus OBJ-5 blockieren Generierung
- [x] Fehlende/ungueltige OBJ-5-Metadaten werden in der Vorverarbeitung mit klarer Fehlermeldung blockiert.
- [x] API-validierungsfehler werden als strukturierte Fehlermeldung zurueckgegeben.

### Edge Cases Status

#### EC-1: Keine Reverse-Zone konfiguriert
- [x] Vorverarbeitung erzeugt Hinweis und generiert nur Forward-Zone.

#### EC-2: Konfiguration geaendert nach Generierung
- [x] UI zeigt Hinweis-Badge "Konfiguration geaendert - bitte neu generieren".

#### EC-3: Serial-Override leer
- [x] API verwendet automatisch den Standard-Serial (zeitbasiert).

#### EC-4: Reverse-Zone passt nicht zu vorhandenen IPs
- [x] Reverse-Zone wird uebersprungen und als Hinweis gemeldet.

#### EC-5: Sehr grosse Zonen (>100 Records)
- [x] Performance-Smoke weiterhin stabil (keine Regression aus aktuellen Aenderungen sichtbar).

### Security Audit Results
- [x] Authentication: Endpunkte sind ohne Login erreichbar (entspricht aktuellem v1-Scope, aber kein Schutz gegen unautorisierte Nutzung).
- [x] Authorization: Keine Multi-User-Scope-Trennung im aktuellen Stand; kein tenant-spezifischer Zugriffsschutz.
- [x] Input Validation: Typspezifische DNS-Validierung aktiv (A/AAAA/PTR/NS/CNAME/TXT/MX).
- [x] Rate limiting aktiv: 70 Requests auf `/api/v1/zones/generate` -> `60x 200`, `10x 429`.
- [x] Keine Secrets in geprueften API-Responses festgestellt.

### Regression Testing
- [x] `npm run lint` erfolgreich.
- [x] `npm run test:run` erfolgreich (`8` Testdateien, `33` Tests).
- [x] `npm run build` erfolgreich.
- [x] Related routes erreichbar: `/zone-generator`, `/requirements-traceability`, `/export-download`, `/test-runner`, `/api/v1/swagger`, `/api/v1/openapi.json` jeweils HTTP 200.
- [x] Features mit Status `Deployed` in `features/INDEX.md`: aktuell keine Eintraege.

### Bugs Found
- Keine neuen Bugs im Re-Test fuer OBJ-6.

### Summary
- **Acceptance Criteria:** 8/8 passed
- **Bugs Found:** 0 total (0 Critical, 0 High, 0 Medium, 0 Low)
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** OBJ-6 ist fuer den naechsten Deployment-Schritt bereit.

### QA Limitations
- Cross-Browser-Tests (Chrome/Firefox/Safari) und echte responsive Interaktion (375/768/1440) konnten in dieser CLI-Session nicht vollumfaenglich visuell ausgefuehrt werden.
- Teile der UI-Pruefung wurden ueber SSR-Ausgabe plus Codepfad-Validierung abgesichert; finaler visueller Browser-Check bleibt empfohlen.

## Deployment
### Deployment-Status (Stand: 2026-04-11)
- Auslieferung erfolgt Git-first ueber Branch/PR/Merge nach `main`.
- Release- und Export-Nachweise werden in `docs/releases/` und `docs/exports/EXPORT-LOG.md` dokumentiert.
- Confluence bleibt Sekundaerziel: Export erst nach gepflegter Git-Dokumentation.
- Falls **Production Ready: NO** gilt, bleibt das Deployment als vorbereitet markiert und wird erst nach Freigabe produktiv ausgerollt.
