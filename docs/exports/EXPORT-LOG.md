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
- Ziel in Confluence: PENDING (Space/Seite beim Import ergaenzen)
- Transport: PENDING (USB-Transfer ausstehend)
- Durchgefuehrt von: PENDING
- Geprueft von: PENDING
- Ergebnis: Nacharbeit
- Notizen: Repo-Stand ist abgeschlossen; physischer Copy-Job nach Confluence ist noch offen.
