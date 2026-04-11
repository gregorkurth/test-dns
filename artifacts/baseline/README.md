# OBJ-24 Baseline Storage

Dieses Verzeichnis wird von OBJ-24 im laufenden Betrieb verwendet.

- `state.json`: aktueller Baseline-Status inklusive Source-Ref.
- `current-config.json`: letzter aktiver Snapshot.
- `history.ndjson`: append-only Verlaufseintraege.

Hinweis:
- Dateien werden zur Laufzeit erzeugt.
- Der Initialzustand ist bewusst `Keine Baseline geladen`.
