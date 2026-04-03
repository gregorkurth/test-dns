# 1. OpenFastTrace für Requirements-Traceability

Datum: 2026-04-03

## Status

Akzeptiert

## Kontext

Das Projekt muss nachweisen, dass alle Requirements (SREQ-xxx, CREQ-xxx) durch Tests gedeckt sind. Für CWIX 2026 ist eine formale Traceability-Matrix erforderlich. Das Projekt läuft in einer airgapped Umgebung ohne Internetzugang zur Laufzeit. Die Dokumentation existiert bereits als Markdown-Dateien in `capabilities/`.

## Entscheid

Wir verwenden **OpenFastTrace (OFT)** als Traceability-Tool. OFT verarbeitet Markdown-Dateien nativ und liest Tags direkt aus dem bestehenden Dokumentations-System. Die Tags (`req~sreq-234~1`, `utest~...~1`) werden als einfacher Text in bestehende Markdown-Dateien eingebettet. OFT läuft als lokale Java-JAR-Datei – keine externe Abhängigkeit zur Laufzeit.

Alternativen geprüft:
- **lobster**: Zu komplex, primär für ISO-26262, braucht Python-Pipeline mit mehreren Konvertern
- **shtracer**: Einfacher Ansatz, aber kein nativer Markdown-Support auf dem Niveau von OFT
- **Eigenes Skript**: Wartungsaufwand zu hoch

## Konsequenzen

- Jede neue `SREQ-xxx.md` erhält einen OFT-Tag (`req~sreq-xxx~1`) und `Needs: utest, itest`
- Jede neue Testfall-Markdown erhält einen OFT-Tag (`utest~...~1`) mit `Covers: req~sreq-xxx~1`
- CI/CD führt OFT automatisch aus und publiziert den Report
- Projektleiter benötigt kein OFT-Wissen – nur die Markdown-Vorlage befolgen
