# OBJ-7: Requirements Traceability View

## Status: In Review
**Created:** 2026-03-17
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-4 (Capabilities Dashboard) – Requirements-Daten
- OBJ-5 (Participant Configuration Form) – Konfigurationsdaten für Compliance-Check

## User Stories
- Als Mission Network Operator möchte ich sehen, welche FMN-Requirements durch meine aktuelle Konfiguration erfüllt sind, damit ich Lücken erkennen kann.
- Als Operator möchte ich eine Traceability-Matrix sehen (Requirement → Konfigurationsfeld), damit ich nachvollziehen kann, welcher Konfigurationswert zu welchem Requirement gehört.
- Als Operator möchte ich nicht-erfüllte Pflicht-Requirements (🟥 MUSS) rot markiert sehen, damit ich sofort weiss, was noch fehlt.
- Als Requirements Engineer möchte ich die Traceability-Matrix als Übersicht für AV&V-Vorbereitung nutzen, damit ich Compliance dokumentieren kann.

## Acceptance Criteria
- [ ] `feat~obj-7-ac-1~1` Fuer jedes Requirement (SREQ-xxx / CREQ-xxx) wird angezeigt, ob es durch die aktuelle Konfiguration (OBJ-5) abgedeckt ist
- [ ] `feat~obj-7-ac-2~1` Status: Erfuellt / Teilweise / Nicht erfuellt / Nicht pruefbar (manuell)
- [ ] `feat~obj-7-ac-3~1` Nicht-erfuellte MUSS-Requirements sind rot hervorgehoben
- [ ] `feat~obj-7-ac-4~1` Klick auf ein Requirement oeffnet den Detail-View aus OBJ-4
- [ ] `feat~obj-7-ac-5~1` Filter "Nur offene Requirements" zeigt ausschliesslich nicht-erfuellte Eintraege
- [ ] `feat~obj-7-ac-6~1` Zusammenfassung oben: "X/Y Requirements erfuellt (Z MUSS-Anforderungen offen)"

## Edge Cases
- Konfiguration noch nicht ausgefüllt (OBJ-5 leer) → Alle Requirements als "Nicht erfüllt" angezeigt mit Hinweis "Bitte zuerst Konfiguration erfassen"
- Requirement ist technisch nicht automatisch prüfbar (z.B. physische Redundanz) → Status "ℹ️ Manuell prüfen" mit Erklärung
- Neue Requirements werden zu `capabilities/` hinzugefügt → Automatisch bei nächstem Build in Traceability-View sichtbar

## Technical Requirements
- Compliance-Pruefung erfolgt offline-faehig auf Basis der OBJ-5 Konfigurationsdaten plus Requirement-Metadaten aus `capabilities/`
- Bewertungslogik fuer Status (Erfuellt/Teilweise/Nicht erfuellt/Nicht pruefbar) ist versioniert und nachvollziehbar
- Requirement-Detailnavigation verwendet die bestehende Requirement-Datenstruktur aus OBJ-4 (kein Duplikatmodell)
- Keine externen APIs; optionaler interner Next.js-Endpunkt fuer konsistente Auswertung ist zulaessig

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Scope**

OBJ-7 liefert die operative Nachvollziehbarkeit zwischen Requirement und konkreter DNS-Konfiguration.
Die Sicht beantwortet fuer Operatoren und QA in einem Bildschirm:
- Was ist gefordert?
- Was ist in der aktuellen Konfiguration vorhanden?
- Wo sind offene MUSS-Luecken?

**Komponentenstruktur (Visual Tree)**

```
Requirements Traceability Page
+-- Header / Summary
|   +-- Erfuellt-Quote (X/Y)
|   +-- Offene MUSS-Anforderungen
+-- Filterleiste
|   +-- Quelle (NATO/ARCH/CUST/INT)
|   +-- Prioritaet (MUSS/SOLLTE/KANN)
|   +-- Status (Erfuellt/Teilweise/Nicht erfuellt/Nicht pruefbar)
|   +-- Toggle "Nur offene Requirements"
+-- Traceability-Tabelle
|   +-- Requirement-ID + Titel
|   +-- Status-Badge
|   +-- Zuordnung zu Konfigurationsfeldern
|   +-- Link zur Requirement-Detailansicht (OBJ-4)
+-- Detailpanel
    +-- Originaltext + Akzeptanzkriterien
    +-- Bewertungserklaerung
    +-- Empfohlene naechste Aktion
```

**Datenmodell (in einfachen Worten)**

Jeder Traceability-Eintrag enthaelt:
- Requirement-ID, Prioritaet, Quelle
- Bewertungsstatus (`fulfilled`, `partial`, `open`, `manual`)
- Mapping auf relevante Konfigurationsfelder aus OBJ-5
- Begruendung der Bewertung
- Deep-Link zum Requirement-Detail

**Technische Leitentscheidungen (fuer PM)**

- Eine einheitliche Statuslogik senkt Interpretationsspielraum in Reviews.
- Fokus auf MUSS-Luecken reduziert fachliches Risiko fuer Mission-Betrieb.
- Verlinkung auf Requirement-Details vermeidet Doppelpflege in mehreren UIs.
- Offline-Auswertung stellt sicher, dass die Sicht auch in airgapped Umgebungen nutzbar bleibt.

**Dependencies (Packages)**

- Keine neuen Pflicht-Pakete; Reuse von bestehendem Next.js/React-Stack und OBJ-4 Datenmodell.

**Requirements Engineer Input**

- Jede Regel fuer den Bewertungsstatus ist als testbare Fachregel zu dokumentieren.
- `Nicht pruefbar (manuell)` darf nur genutzt werden, wenn die Automatisierung fachlich wirklich nicht moeglich ist.
- Neue Requirements muessen ohne Codeaenderung in der Liste sichtbar werden, sobald sie in `capabilities/` versioniert sind.

**QA Engineer Input (Readiness)**

- Pflichttests: Statusberechnung pro Requirement-Typ, Filterlogik, MUSS-Hervorhebung, Detailnavigation.
- Regressionstest: Aenderungen in OBJ-5 duerfen die Statusberechnung nicht verfalschen.
- Abnahmekriterium: Offene MUSS-Luecken sind eindeutig identifizierbar und reproduzierbar.

## QA Test Results
**Tested:** 2026-04-09
**App URL:** http://localhost:3000/requirements-traceability
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Requirement-Abdeckung pro aktuelle OBJ-5 Konfiguration
- [x] `loadObj7TraceabilityData()` bewertet alle Requirement-Eintraege aus `capability-dashboard-live/data/capabilities-dashboard.json` gegen `data/obj3/participants.json`.
- [x] Build-Artefakt zeigt aktive OBJ-5-Konfiguration und Ergebnisquote (`6/155 erfuellt` im aktuellen Snapshot).

#### AC-2: Status Erfuellt / Teilweise / Nicht erfuellt / Manuell pruefbar
- [x] Alle vier Stati sind im Datenmodell vorhanden (`fulfilled`, `partial`, `open`, `manual`).
- [x] Status-Filter und Label-Rendering sind in UI und Filterlogik abgedeckt.

#### AC-3: Nicht-erfuellte MUSS-Requirements rot markieren
- [x] Tabellenzeilen fuer `status=open` und `priority=MUSS` werden rot hervorgehoben (`rowClassName`).
- [x] Prioritaets-Badge fuer MUSS wird rot dargestellt.

#### AC-4: Klick auf Requirement oeffnet OBJ-4 Detail-View
- [x] Jeder Eintrag hat Deep-Link auf `/capability-dashboard-live/#requirement-{id}`.
- [x] UI rendert pro Zeile den Link-Button `OBJ-4 Detail`.

#### AC-5: Filter "Nur offene Requirements"
- [x] Toggle `onlyOpen` filtert strikt auf `status=open`.
- [x] Reset-Button setzt alle Filter auf Ausgangszustand.

#### AC-6: Zusammenfassung "X/Y erfuellt (Z MUSS offen)"
- [x] Header und KPI-Karten zeigen `fulfilled/total` plus `mussOpen`.
- [x] Werte stammen aus zentraler Summary-Berechnung (`summarizeRequirements`).

### Edge Cases Status

#### EC-1: OBJ-5 leer / nicht verwertbar
- [x] Ohne aktive Konfiguration werden objektive Checks als `open`, manuelle als `manual` bewertet.

#### EC-2: Technisch nicht automatisch pruefbare Requirements
- [x] Manuelle Anforderungen werden explizit als `manual` markiert und begruendet.

#### EC-3: Neue Requirements in `capabilities/`
- [x] Daten werden aus dem zentralen Dashboard-JSON gelesen; nach Aktualisierung dieses Datenartefakts erscheinen neue Requirements ohne UI-Codeaenderung.

### Security Audit Results
- [x] Input Handling: Keine unsichere HTML-Injektion im Traceability-Rendering erkannt (React-escaping, keine `dangerouslySetInnerHTML` Nutzung).
- [x] Data Exposure: Gepruefte Payloads enthalten keine offensichtlichen Secrets.
- [x] Authorization Scope: Read-Only Sicht, keine Schreiboperationen in OBJ-7.
- [x] Hinweis: Endpunkt ist ohne Auth nutzbar (aktueller Repo-Scope, kein Multi-Tenant-Schutz).

### Regression Testing
- [x] `npm run lint` erfolgreich.
- [x] `npm run build` erfolgreich.
- [x] `npm run test:run` erfolgreich (`8` Dateien, `33` Tests).
- [x] Gezielte Tests erfolgreich: `src/lib/obj7-traceability.test.ts` (inkl. Status- und Filterlogik).

### Bugs Found
- Keine neuen funktionalen Bugs fuer OBJ-7 gefunden.

### Summary
- **Acceptance Criteria:** 6/6 passed
- **Bugs Found:** 0 total (0 Critical, 0 High, 0 Medium, 0 Low)
- **Security:** Pass
- **Production Ready:** YES
- **Recommendation:** OBJ-7 kann in den naechsten Deploy-Schritt gehen.

### QA Limitations
- Visuelle Cross-Browser-Pruefung (Chrome/Firefox/Safari) und echte responsive Interaktion (375/768/1440) wurden in dieser CLI-Session nicht vollumfaenglich manuell verifiziert.
- Browser-Interaktionen wurden ueber Build-Artefakte, Codepfad-Pruefung und automatisierte Tests abgesichert.

## Deployment
### Deployment-Status (Stand: 2026-04-11)
- Auslieferung erfolgt Git-first ueber Branch/PR/Merge nach `main`.
- Release- und Export-Nachweise werden in `docs/releases/` und `docs/exports/EXPORT-LOG.md` dokumentiert.
- Confluence bleibt Sekundaerziel: Export erst nach gepflegter Git-Dokumentation.
- Falls **Production Ready: NO** gilt, bleibt das Deployment als vorbereitet markiert und wird erst nach Freigabe produktiv ausgerollt.
