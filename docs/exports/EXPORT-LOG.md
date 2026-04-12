# Export Log (Confluence Copy via USB)

Dieses Log ist der einzige Ort fuer Confluence-Exportnachweise.

Regel:
- Erst Git aktualisieren
- Dann exportieren
- Dann hier protokollieren

Wenn etwas nur in Confluence steht, gilt es nicht als abgeschlossen.

## Pflichtfelder pro Export

- Datum
- Export-ID
- Anlass (Feature-Abschluss / Release / ADR-Aenderung / arc42-Aenderung)
- Umfang (welche Dateien oder Kapitel)
- Quelle im Git (Commit oder Branch)
- Ziel in Confluence (Space/Seite)
- Transport (z. B. USB-Stick-ID)
- Durchgefuehrt von
- Geprueft von
- Ergebnis (OK / Nacharbeit)

## Release-Regel

Bei Release-bezogenen Exporten gilt zusaetzlich:
- Release-Version folgt `YYYY.MM.N` und wird identisch in Export-Log und `docs/releases/UPDATE-NOTICES.json` gefuehrt
- Update-Hinweise in `docs/releases/UPDATE-NOTICES.json` zuerst aktualisieren
- Release-Check (`npm run check:obj14`) vor dem Kopieren ausfuehren
- Exportstatus im Release-Hinweis pflegen (`pending` oder `completed`)
- Export-ID aus diesem Log bei abgeschlossenem Release wieder in den Release-Hinweis zuruecktragen

## Eintragsvorlage

```markdown
### EXPORT-YYYYMMDD-XX

- Datum: YYYY-MM-DD
- Anlass: Feature-Abschluss | Release | ADR | arc42-Update
- Umfang:
  - docs/SVC.md
  - features/OBJ-XX-....
  - docs/adr/00XX-....
  - docs/arc42/0X-....md
- Quelle in Git: <commit-sha oder tag>
- Ziel in Confluence: <Space> / <Seitentitel>
- Transport: USB-Stick <Bezeichnung>
- Durchgefuehrt von: <Name>
- Geprueft von: <Name>
- Ergebnis: OK | Nacharbeit
- Notizen: <optional>
```

## Export-Historie

### EXPORT-20260406-01

- Datum: 2026-04-06
- Anlass: Feature-Abschluss (OBJ-4 und OBJ-23)
- Umfang:
  - docs/SVC.md
  - features/INDEX.md
  - features/OBJ-4-capabilities-dashboard.md
  - features/OBJ-23-test-execution-dashboard.md
  - capability-dashboard-live/data/capabilities-dashboard.json
  - docs/QUICK-GUIDE-TESTING.md
- Quelle in Git: f16041e (OBJ-4 Abschluss) und ec3cf06 (OBJ-23 Abschluss)
- Ziel in Confluence: DNS Service Dokumentation / Feature-Abschluss OBJ-4-OBJ-23
- Transport: USB-Stick EXPORT-20260406-01
- Durchgefuehrt von: Gregor Kurth
- Geprueft von: Gregor Kurth
- Ergebnis: OK
- Notizen: USB-Copy und manueller Confluence-Import fuer alle oben gelisteten Seiten abgeschlossen.

### EXPORT-20260409-OBJ14-TEMPLATE

- Datum: 2026-04-09
- Anlass: Release
- Umfang:
  - docs/releases/UPDATE-NOTICES.json
  - docs/releases/README.md
  - docs/arc42/
  - docs/benutzerhandbuch/
- Quelle in Git: <tag oder commit>
- Ziel in Confluence: DNS Service Dokumentation / Release Notes
- Transport: USB-Stick <Bezeichnung>
- Durchgefuehrt von: <Name>
- Geprueft von: <Name>
- Ergebnis: Nacharbeit
- Notizen: Vorlage fuer OBJ-14. Nach abgeschlossener Kopie als echter Eintrag uebernehmen und `UPDATE-NOTICES.json` auf `completed` setzen.
