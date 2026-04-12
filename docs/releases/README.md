# Release-Dokumentation

Diese Ablage ist die Git-Quelle fuer Release-Hinweise, Release-Checks und den Doku-Exportpfad.

## Source of Truth

- Release-Hinweise stehen in `docs/releases/UPDATE-NOTICES.json`.
- Der Export-Nachweis fuer Confluence-Kopien steht in `docs/exports/EXPORT-LOG.md`.
- Confluence wird nie direkt als Primaerquelle gepflegt. Erst Git, dann Export.

## Versionsregel

- Jede Release-Version folgt dem festen Schema `YYYY.MM.N`.
- `N` ist die fortlaufende Nummer innerhalb eines Monats.
- Bei Monatswechsel beginnt `N` wieder bei `1`.
- Kanal (`ga`, `beta`, `rc`) und Status (`planned`, `released`) werden getrennt von der Versionsnummer gepflegt.

## Was wird pro Release gepflegt?

1. `UPDATE-NOTICES.json` aktualisieren
   - Version
   - Kanal (`ga`, `beta`, `rc`)
   - Status (`planned`, `released`, ...)
   - Kernaenderungen
   - Artefakte
   - Exportstatus

2. Release-Check ausfuehren

```bash
npm run check:obj14
```

3. Export fuer Confluence vorbereiten
   - arc42-Kapitel
   - Benutzerhandbuch
   - Release-Hinweise / Changelog-Auszug
   - ggf. SHA-256, OCI- und Signatur-Nachweise

4. `docs/exports/EXPORT-LOG.md` aktualisieren
   - Export-ID
   - Quelle in Git (Commit oder Tag)
   - Ziel in Confluence
   - USB-Transport
   - Verantwortliche Stelle

## Praktische Regel

Ein Release ist erst wirklich fertig, wenn:
- die Hinweise in Git stehen,
- der Repo-Check gruen ist,
- der Exportstatus dokumentiert ist,
- und der Export-Nachweis im zentralen Log steht.
