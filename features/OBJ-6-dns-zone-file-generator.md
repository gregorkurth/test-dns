# OBJ-6: DNS Zone File Generator

## Status: In Review
**Created:** 2026-03-17
**Last Updated:** 2026-04-07

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
**Tested:** 2026-04-07
**App URL:** http://localhost:3000/zone-generator
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Forward Zone-File aus Konfigurationsdaten (SOA, NS, A, Anycast A)
- [ ] BUG: NS-Records werden aktuell aus allen Host-Listen gebaut (inkl. Resolver/Anycast), nicht nur aus dedizierten Nameservern.
- [x] API kann gueltige Forward-Zone mit SOA/NS/A erzeugen (`POST /api/v1/zones/generate`, HTTP 200).

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
- [ ] BUG: Typ-spezifische Record-Validierung fehlt; ungueltige A-Record-Werte (z. B. `<script>...`) werden akzeptiert und als Zone-File ausgegeben.

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
- [x] Performance-Smoke mit 120 Records erfolgreich (`HTTP 200`, ca. `62ms`).

### Security Audit Results
- [x] Authentication: Endpunkte sind ohne Login erreichbar (entspricht aktuellem v1-Scope, aber kein Schutz gegen unautorisierte Nutzung).
- [x] Authorization: Keine Multi-User-Scope-Trennung im aktuellen Stand; kein tenant-spezifischer Zugriffsschutz.
- [ ] BUG: Input Validation ist fuer DNS-Record-Typen zu schwach (A/AAAA/PTR/NS/CNAME/TXT/MX nicht typspezifisch validiert).
- [x] Rate limiting aktiv: 70 Requests auf `/api/v1/zones/generate` -> `60x 200`, `10x 429`.
- [x] Keine Secrets in geprueften API-Responses festgestellt.

### Regression Testing
- [x] `npm run lint` erfolgreich.
- [x] `npm run test:run` erfolgreich (`6` Testdateien, `15` Tests).
- [x] `npm run build` erfolgreich.
- [x] Related routes erreichbar: `/participant-config`, `/test-execution-dashboard`, `/api/v1/swagger`, `/api/v1/openapi.json` jeweils HTTP 200.
- [x] Features mit Status `Deployed` in `features/INDEX.md`: aktuell keine Eintraege.

### Bugs Found

#### BUG-1: DNS Record-Type Validation unvollstaendig (ungueltige Zone-Files moeglich)
- **Severity:** High
- **Steps to Reproduce:**
  1. Sende `POST /api/v1/zones/generate` mit Record `{"type":"A","value":"<script>alert(1)</script>"}`.
  2. Expected: API lehnt Request mit 4xx ab (ungueltiger A-Record-Wert).
  3. Actual: API antwortet `200` und schreibt den ungueltigen Wert in das Zone-File.
- **Evidence:** Laufzeit-Smoke erfolgreich reproduziert, Antwort enthielt `bad 3600 IN A <script>alert(1)</script>`.
- **Priority:** Fix before deployment

#### BUG-2: Forward-NS-Records enthalten Resolver/Anycast statt nur Nameserver
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Nutze OBJ-5 Daten mit mindestens 2 Nameservern plus Resolver/Anycast.
  2. Starte Generierung ueber OBJ-6.
  3. Expected: NS-Records nur fuer Nameserver.
  4. Actual: NS-Records werden fuer alle Hosts erzeugt (Resolver/Anycast eingeschlossen).
- **Evidence:** `buildForwardRecords(...)` erzeugt NS fuer jedes Element in `hosts`; Aufruf uebergibt `hostsForARecords` (Nameserver + Resolver) und optional Anycast.
- **Priority:** Fix before deployment

### Summary
- **Acceptance Criteria:** 6/8 passed, 2 failed
- **Bugs Found:** 2 total (0 Critical, 1 High, 1 Medium, 0 Low)
- **Security:** Issues found
- **Production Ready:** NO
- **Recommendation:** Fix bugs first, then run `/qa` again.

### QA Limitations
- Cross-Browser-Tests (Chrome/Firefox/Safari) und echte responsive Interaktion (375/768/1440) konnten in dieser CLI-Session nicht vollumfaenglich visuell ausgefuehrt werden.
- Teile der UI-Pruefung wurden ueber SSR-Ausgabe plus Codepfad-Validierung abgesichert; finaler visueller Browser-Check bleibt empfohlen.

## Deployment
_To be added by /deploy_
