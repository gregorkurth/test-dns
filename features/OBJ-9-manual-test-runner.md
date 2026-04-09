# OBJ-9: Manual Test Runner

## Status: In Progress
**Created:** 2026-04-03
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-4 (Capabilities Dashboard – Datenstruktur aus `capabilities/`)

## User Stories
- Als Tester möchte ich manuelle Testfälle im Browser Schritt für Schritt durchführen, damit ich nicht mit Markdown-Dateien hantieren muss.
- Als Tester möchte ich jeden Testschritt als Bestanden / Nicht bestanden / Nicht anwendbar markieren und Beobachtungen notieren, damit das Ergebnis vollständig dokumentiert ist.
- Als Tester möchte ich nach Abschluss eine fertige Ergebnis-Markdown-Datei herunterladen, damit ich sie via Gitea/GitLab-Web-UI committen kann.
- Als Projektleiter möchte ich im Traceability-Report sehen, welche Requirements manuell getestet und bestätigt wurden.
- Als QA-Verantwortlicher möchte ich Testfälle nach Testkategorie (Build, Unit, Integration, API, UI, Deployability) filtern und ausführen können, damit ich gezielte Testläufe durchführen kann.
- Als Platform Engineer möchte ich Deployability-Tests dokumentiert haben, damit ich verifizieren kann, ob die App korrekt in einer Zielumgebung installierbar ist.

## Acceptance Criteria
- [ ] `feat~obj-9-ac-1~1` Alle manuellen Testfälle aus `capabilities/**/tests/manual/TEST-*-manual.md` werden in der App aufgelistet
- [ ] `feat~obj-9-ac-2~1` Testfälle sind nach Service Function gruppiert und filterbar
- [ ] `feat~obj-9-ac-3~1` Jeder Testschritt wird einzeln angezeigt mit Feldern: Status (✅/❌/⏭), Beobachtung (Freitext)
- [ ] `feat~obj-9-ac-4~1` Testvorbereitung wird vor den Schritten als Checkliste angezeigt
- [ ] `feat~obj-9-ac-5~1` Nach Abschluss wird eine Ergebnis-Markdown-Datei generiert (inkl. OFT-Tag `itest~...~1`)
- [ ] `feat~obj-9-ac-6~1` Ergebnis-Datei kann heruntergeladen werden (als `.md`)
- [ ] `feat~obj-9-ac-7~1` App funktioniert vollständig offline (keine externen Requests)
- [ ] `feat~obj-9-ac-8~1` Testfälle werden zur Build-Zeit aus Markdown-Dateien geladen (Static Generation)
- [ ] `feat~obj-9-ac-9~1` Testkategorien sind als Filter verfuegbar: Build, Unit, Integration, API, UI, Deployability
- [ ] `feat~obj-9-ac-10~1` Jeder Testfall traegt genau eine Testkategorie als Metadaten-Feld (Frontmatter der Testdatei)
- [ ] `feat~obj-9-ac-11~1` Deployability-Testfaelle dokumentieren pruefbare Schritte fuer Zielumgebungs-Installation (Zarf-Import, Argo-CD-Sync, Smoke-Test)
- [ ] `feat~obj-9-ac-12~1` Testkonzept ist in `docs/testing.md` beschrieben (Kategorien, Abdeckungsziele, Durchfuehrungsablauf)

## Edge Cases
- Testfall ohne Schritte → Hinweis "Keine Testschritte definiert"
- Testfall mit fehlenden Vorbedingungen → trotzdem ausfüllbar, Hinweis anzeigen
- Teils ausgefülltes Formular → Warnung beim Verlassen der Seite
- Generiertes Markdown mit Sonderzeichen im Beobachtungsfeld → korrekt escapen
- Testfall ohne Kategorie-Metadaten → Kategorie "Unkategorisiert"; Hinweis im Test-Runner
- Deployability-Test schlägt fehl weil Zarf-Paket fehlt → klare Fehlermeldung mit Link zur Installationsanleitung

## Technical Requirements
- Route: `/test-runner`
- Daten: Build-time via `fs.readdir` + `fs.readFile` aus `capabilities/`
- Markdown-Parsing: `gray-matter` + `remark`
- State: `React useState` (kein Server-State nötig)
- Download: `Blob` + `URL.createObjectURL` im Browser
- Generiertes Ergebnis-File: `tests/results/TEST-RESULT-[ID]-[DATUM].md`
  - Enthält OFT-Tag: `` `itest~[id]~1` `` + `Covers: req~[req-id]~1`
- Ergebnisdatei enthaelt Ausfuehrungsmetadaten (Tester, Datum, Feature/OBJ, Kategorie)
- Validierungsregeln fuer Ergebnisdatei verhindern leere Pflichtfelder vor Download

## Generiertes Ergebnis-Markdown (Beispiel)

```markdown
# TEST-RESULT-SREQ-234-001 – 2026-04-03

`itest~sreq-234-001~1`
Covers: req~sreq-234~1

| Schritt | Status | Beobachtung |
|---------|--------|-------------|
| 1 | ✅ Bestanden | Zone core.ndp.che vorhanden |
| 2 | ✅ Bestanden | dig liefert korrekte Antwort |
| 3 | ✅ Bestanden | Delegation verifiziert |

**Gesamtbewertung:** ✅ Bestanden
**Getestet von:** Max Muster
**Datum:** 2026-04-03
```

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Scope**

OBJ-9 macht manuelle Tests als gefuehrten Browser-Workflow nutzbar, damit Tester nicht zwischen vielen Markdown-Dateien wechseln muessen.
Die Funktion erzeugt direkt verwendbare Nachweise fuer QA, Traceability und Release-Freigaben.

**Komponentenstruktur (Visual Tree)**

```
Manual Test Runner Page
+-- Header / Laufkontext
|   +-- Testername, Datum, aktives OBJ
+-- Filterbereich
|   +-- Capability / Service Function
|   +-- Kategorie (Build, Unit, Integration, API, UI, Deployability)
|   +-- Status (offen, in Arbeit, abgeschlossen)
+-- Testfall-Liste
|   +-- Test-ID, Titel, Requirement-Bezug
|   +-- Fortschrittsanzeige pro Testfall
+-- Testfall-Detail
|   +-- Vorbereitung / Preconditions
|   +-- Schrittliste mit Status + Beobachtung
+-- Ergebnisexport
    +-- Markdown-Preview
    +-- Download Ergebnisdatei
```

**Datenmodell (in einfachen Worten)**

Ein Testfall enthaelt:
- Metadaten (Test-ID, Kategorie, SFN, Requirements)
- Vorbereitungsschritte
- Ausfuehrungsschritte

Ein Testergebnis enthaelt:
- Status pro Schritt (bestanden/nicht bestanden/nicht anwendbar)
- Beobachtungen
- Gesamtbewertung
- OFT-Referenzen (`itest`, `covers`)

**Technische Leitentscheidungen (fuer PM)**

- Build-time Einlesen aus `capabilities/` haelt die Quelle konsistent (Git bleibt Source of Truth).
- Browser-basierter Runner senkt Einstiegshuerde fuer Nicht-Entwickler.
- Standardisierter Markdown-Export vereinfacht Commit, Review und Audits.
- Kategorien erlauben gezielte Testkampagnen statt "alles auf einmal".

**Dependencies (Packages)**

- `gray-matter` fuer Frontmatter-Metadaten aus manuellen Testdateien.
- `remark` fuer robustes Markdown-Parsing.

**Requirements Engineer Input**

- Jeder manuelle Testfall braucht eine eindeutige Kategorie und Requirement-Verknuepfung.
- OFT-kompatible Tags sind Pflicht, damit Nachweise maschinell zuordenbar bleiben.
- "Deployability" muss eigenstaendig nachweisbar sein (Import, Sync, Smoke-Test).

**QA Engineer Input (Readiness)**

- Pflichttests: Parser fuer manuelle Tests, Statusspeicherung, Exportformat, Filterlogik.
- Negativtests: fehlende Kategorien, leere Schritte, Abbruch ohne Speichern.
- Abnahmekriterium: Ergebnisdatei ist ohne Nacharbeit als Nachweis verwendbar.
