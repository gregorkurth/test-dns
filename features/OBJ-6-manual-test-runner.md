# OBJ-6: Manual Test Runner

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-03

## Dependencies
- OBJ-1 (Capabilities Dashboard – Datenstruktur aus `capabilities/`)

## User Stories
- Als Tester möchte ich manuelle Testfälle im Browser Schritt für Schritt durchführen, damit ich nicht mit Markdown-Dateien hantieren muss.
- Als Tester möchte ich jeden Testschritt als Bestanden / Nicht bestanden / Nicht anwendbar markieren und Beobachtungen notieren, damit das Ergebnis vollständig dokumentiert ist.
- Als Tester möchte ich nach Abschluss eine fertige Ergebnis-Markdown-Datei herunterladen, damit ich sie via Gitea/GitLab-Web-UI committen kann.
- Als Projektleiter möchte ich im Traceability-Report sehen, welche Requirements manuell getestet und bestätigt wurden.

## Acceptance Criteria
- [ ] `feat~obj-6-ac-1~1` Alle manuellen Testfälle aus `capabilities/**/tests/manual/TEST-*-manual.md` werden in der App aufgelistet
- [ ] `feat~obj-6-ac-2~1` Testfälle sind nach Service Function gruppiert und filterbar
- [ ] `feat~obj-6-ac-3~1` Jeder Testschritt wird einzeln angezeigt mit Feldern: Status (✅/❌/⏭), Beobachtung (Freitext)
- [ ] `feat~obj-6-ac-4~1` Testvorbereitung wird vor den Schritten als Checkliste angezeigt
- [ ] `feat~obj-6-ac-5~1` Nach Abschluss wird eine Ergebnis-Markdown-Datei generiert (inkl. OFT-Tag `itest~...~1`)
- [ ] `feat~obj-6-ac-6~1` Ergebnis-Datei kann heruntergeladen werden (als `.md`)
- [ ] `feat~obj-6-ac-7~1` App funktioniert vollständig offline (keine externen Requests)
- [ ] `feat~obj-6-ac-8~1` Testfälle werden zur Build-Zeit aus Markdown-Dateien geladen (Static Generation)

## Edge Cases
- Testfall ohne Schritte → Hinweis "Keine Testschritte definiert"
- Testfall mit fehlenden Vorbedingungen → trotzdem ausfüllbar, Hinweis anzeigen
- Teils ausgefülltes Formular → Warnung beim Verlassen der Seite
- Generiertes Markdown mit Sonderzeichen im Beobachtungsfeld → korrekt escapen

## Technical Requirements
- Route: `/test-runner`
- Daten: Build-time via `fs.readdir` + `fs.readFile` aus `capabilities/`
- Markdown-Parsing: `gray-matter` + `remark`
- State: `React useState` (kein Server-State nötig)
- Download: `Blob` + `URL.createObjectURL` im Browser
- Generiertes Ergebnis-File: `tests/results/TEST-RESULT-[ID]-[DATUM].md`
  - Enthält OFT-Tag: `` `itest~[id]~1` `` + `Covers: req~[req-id]~1`

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
