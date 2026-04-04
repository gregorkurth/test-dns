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
  - docs/PRD.md
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

Noch keine Eintraege.
