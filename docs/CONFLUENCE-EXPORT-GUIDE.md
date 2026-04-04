# Confluence Export Guide

Diese Anleitung erklaert, wie Dokumentation aus dem Repo nach Confluence kommt.

Wichtig:
Es gibt keine direkte Schnittstelle.
Der Export passiert bewusst mit Medienbruch, zum Beispiel per USB-Stick.

## Grundregel

Das Git-Repository ist die Hauptquelle.
Confluence ist eine Kopie fuer Leser, Freigaben und Management-Kommunikation.

Darum gilt:
- Erst im Repo pflegen
- Dann exportieren
- Nie nur in Confluence pflegen
- Nie Confluence als Primaerquelle verwenden

## Was wird exportiert?

Diese Inhalte sind fuer Confluence geeignet:
- `docs/PRD.md`
- `features/INDEX.md`
- wichtige `features/OBJ-*.md`
- `docs/adr/*.md`
- `docs/arc42/*.md`
- Release-Zusammenfassungen
- Betriebs- und Offline-Installationsdoku

## Warum arc42 pro Kapitel?

Jedes arc42-Kapitel liegt in einer eigenen Datei.
Dadurch kann jedes Kapitel einzeln exportiert werden.

Das ist praktisch fuer Confluence, weil:
- pro Kapitel eine Seite moeglich ist
- Aenderungen kleiner und klarer sind
- Teams nur die betroffenen Kapitel kopieren muessen

## Wann muss exportiert werden?

Export ist Pflicht in diesen Faellen:

1. Ein Feature ist fachlich fertig
2. Ein Release wird vorbereitet
3. Ein Release wurde abgeschlossen
4. Ein wichtiges ADR wurde akzeptiert
5. Ein arc42-Kapitel hat sich wesentlich geaendert

## Einfache Export-Regel

Nach einem abgeschlossenen Feature:
- betroffenes Feature exportieren
- betroffenes ADR exportieren
- betroffenes arc42-Kapitel exportieren

Nach einem Release:
- Release-relevante Features exportieren
- neue ADRs exportieren
- alle geaenderten arc42-Kapitel exportieren
- falls noetig PRD- oder Statusseiten exportieren

## Schritt-fuer-Schritt Export

1. Pruefen, welche Dateien sich geaendert haben
2. Betroffene Kapitel und Seiten markieren
3. Markdown-Dateien exportieren oder kopieren
4. Dateien auf USB-Stick legen
5. In die Zielumgebung bringen
6. In Confluence Kapitel fuer Kapitel uebernehmen
7. Kontrollieren, ob Titel, Tabellen und Verlinkungen noch stimmen
8. Export im zentralen Log protokollieren (`docs/exports/EXPORT-LOG.md`)

## Export-Checkliste

- [ ] PRD betroffen?
- [ ] Feature betroffen?
- [ ] Requirement betroffen?
- [ ] Testnachweis betroffen?
- [ ] ADR betroffen?
- [ ] arc42 betroffen?
- [ ] Release-Doku betroffen?
- [ ] Export wirklich durchgefuehrt?

## Wo wird der Export protokolliert?

Verbindlicher Ort:
- `docs/exports/EXPORT-LOG.md`

Optional zusaetzlich:
- Verweis im betroffenen Feature
- Verweis im Release-Kontext

## Was soll in Confluence sichtbar sein?

Manager und Nicht-Entwickler sollen dort mindestens sehen:
- Was ist das Ziel?
- Welche Features gibt es?
- Welche Entscheidungen wurden getroffen?
- Wie ist die Architektur?
- Was wurde getestet?
- Was wurde released?
- Was ist der aktuelle Stand?

## Wichtige Warnung

Wenn eine Confluence-Seite und das Repo unterschiedlich sind, gilt immer das Repo.

Confluence ist Lesekopie.
Git ist Source of Truth.
