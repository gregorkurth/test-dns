# OBJ-22: Release-Artefaktprüfung / Publish-Gate

## Status: Planned
**Created:** 2026-04-04
**Last Updated:** 2026-04-04

## Dependencies
- OBJ-1: CI/CD Pipeline (führt den Gate-Schritt automatisiert aus)
- OBJ-14: Release Management (Release darf erst nach erfolgreicher Prüfung freigegeben werden)
- OBJ-17: SBOM & Security-Scanning (Security-Befunde sind Teil der Freigabeentscheidung)
- OBJ-19: Zarf-Paket / Offline-Weitergabe (Offline-Paket ist Teil der zu prüfenden Release-Inhalte)

## User Stories
- Als Release-Verantwortlicher möchte ich den tatsächlich erzeugten Veröffentlichungsinhalt prüfen, damit nicht nur das Repository, sondern das reale Artefakt freigegeben wird.
- Als Security-Verantwortlicher möchte ich verhindern, dass Secrets, interne Entwicklungsdateien oder unerlaubte Sourcemaps in ein Release gelangen.
- Als Platform Engineer möchte ich eine versionierte Allowlist für freigegebene Dateien und Pfade definieren, damit Publish- und Export-Inhalte reproduzierbar kontrolliert werden.
- Als Auditor möchte ich pro Build einen nachvollziehbaren Prüfbericht sehen, damit die Freigabeentscheidung später belegt werden kann.
- Als Mission Network Operator möchte ich nur geprüfte Offline-Pakete und Release-Artefakte erhalten, damit die Zielumgebung keine ungeprüften Inhalte importiert.

## Acceptance Criteria
- [ ] Vor Publish, Release, Export oder Offline-Weitergabe wird der tatsächlich erzeugte Artefaktinhalt geprüft; eine reine Repository-Prüfung reicht nicht aus
- [ ] Die Prüfung ist für alle veröffentlichbaren Release-Artefakte definiert, mindestens für Release-Anhänge, Manifest-Bundles und Zarf-Pakete
- [ ] Die Freigaberichtlinie liegt versioniert im Repository und beschreibt erlaubte Dateien, Pfade, Dateitypen und Ausnahmen
- [ ] Eine Allowlist-Strategie ist der Standard; eine reine Ignore- oder Blocklist-Strategie ohne Artefaktinspektion ist nicht zulässig
- [ ] Der Gate-Schritt prüft mindestens Top-Level-Struktur, Dateitypen, Pfade, Dateianzahl und Artefaktgrösse gegen definierte Grenzwerte
- [ ] Verbotene Inhalte werden erkannt und blockiert, mindestens: Secrets, interne Entwicklungsartefakte, Testdaten, nicht freigegebene Konfigurationsdateien und unnötige Source-Artefakte
- [ ] Sourcemaps sind standardmässig ausgeschlossen und nur per expliziter, dokumentierter Ausnahme zulässig
- [ ] Bei einem Verstoss schlägt der Build oder das Release fehl; das Artefakt wird weder publiziert noch exportiert
- [ ] Die Prüfergebnisse werden build- und releasebezogen protokolliert und als Bericht archiviert
- [ ] Ausnahmen sind zeitlich und inhaltlich dokumentiert; jede Ausnahme enthält Begründung und Freigabevermerk

## Edge Cases
- Was wenn das Build-Artefakt erst im letzten Packaging-Schritt zusätzliche Dateien enthält? → Der Gate-Schritt läuft nach dem finalen Packaging und prüft das Endartefakt, nicht Zwischenstände
- Was wenn eine Sourcemap für einen begründeten Debug-Fall benötigt wird? → Nur per expliziter Ausnahme in der Freigaberichtlinie und mit dokumentierter Genehmigung
- Was wenn ein Release aus mehreren Artefakten besteht? → Jedes Artefakt wird einzeln geprüft; zusätzlich gibt es einen Gesamtbericht für das Release
- Was wenn ein Artefakt verschachtelte Archive enthält? → Verschachtelte Inhalte werden mitgeprüft oder das Artefakt wird als nicht freigabefähig markiert
- Was wenn die Richtlinie ein legitimes Artefakt fälschlich blockiert? → Die Ausnahme wird versioniert ergänzt; ohne dokumentierte Anpassung bleibt das Release blockiert

## Technical Requirements
- Die Prüfregeln sind als versionierte Richtlinie im Repository hinterlegt und von der Pipeline maschinenlesbar auswertbar
- Der Gate-Schritt läuft nach Build/Packaging und vor Publish, Release-Erstellung, Registry-Upload oder Zarf-Export
- Die Prüfung muss auf dem final erzeugten Artefakt oder dessen entpacktem Inhalt arbeiten, nicht nur auf dem Workspace
- Der Bericht enthält mindestens: geprüftes Artefakt, Version oder SHA, Ergebnis, Regelverstösse und Zeitstempel
- Die Richtlinie unterstützt explizite Grenzwerte für Dateianzahl, Artefaktgrösse und zugelassene Pfadmuster

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
