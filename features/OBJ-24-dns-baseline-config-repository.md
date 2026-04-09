# OBJ-24: DNS Baseline Config Repository & Change History

## Status: Planned
**Created:** 2026-04-09
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-5 (Participant Configuration Form) - liefert die zu versionierenden DNS-Konfigurationsdaten
- OBJ-8 (Export & Download) - stellt Import/Export-Artefakte bereit, die ins Config-Repo ueberfuehrt werden koennen
- OBJ-3 (REST API) - stellt technische Schnittstellen fuer Laden, Speichern und Verlauf bereit

## User Stories
- Als Mission Network Operator moechte ich eine DNS-Grundkonfiguration aus einem separaten Git-Repository laden, damit alle Missionen mit einem einheitlichen, freigegebenen Startzustand beginnen.
- Als Operator moechte ich jede Konfigurationsaenderung automatisch protokolliert sehen, damit ich jederzeit nachvollziehen kann, was geaendert wurde.
- Als Reviewer moechte ich pro Aenderung einen klaren Vorher/Nachher-Vergleich sehen, damit ich Aenderungen fachlich bewerten kann.
- Als Operator moechte ich eine einzelne Aenderung gezielt rueckgaengig machen koennen, ohne den gesamten Stand zurueckzusetzen.
- Als Compliance-Verantwortlicher moechte ich eine manipulationsarme, revisionsfaehige Aenderungshistorie haben, damit Audits bestehen werden.

## Acceptance Criteria
- [ ] `feat~obj-24-ac-1~1` Die App kann eine DNS-Grundkonfiguration aus einem separaten Git-Repository laden (konfigurierbar: Repo-URL/Pfad, Branch oder Tag).
- [ ] `feat~obj-24-ac-2~1` Nach dem Laden wird der exakte Quellenstand angezeigt (Commit-SHA, Branch/Tag, Ladezeitpunkt).
- [ ] `feat~obj-24-ac-3~1` Jede gespeicherte DNS-Aenderung erzeugt einen neuen protokollierten Verlaufseintrag mit mindestens: Aenderungs-ID, Zeitstempel, Akteur, betroffene Bereiche, Kurzbeschreibung.
- [ ] `feat~obj-24-ac-4~1` Pro Verlaufseintrag ist ein nachvollziehbarer Vorher/Nachher-Vergleich sichtbar (mindestens feldbasierter Diff, optional Text-Diff).
- [ ] `feat~obj-24-ac-5~1` Verlaufseintraege sind filterbar (z. B. nach Datum, Akteur, Objekt/Participant, Aenderungstyp).
- [ ] `feat~obj-24-ac-6~1` Eine einzelne Aenderung kann gezielt rueckgaengig gemacht werden (Rollback auf Eintragsebene).
- [ ] `feat~obj-24-ac-7~1` Rollback erzeugt selbst einen neuen Verlaufseintrag inkl. Verweis auf den rueckgaengig gemachten Eintrag.
- [ ] `feat~obj-24-ac-8~1` Historie bleibt append-only nachvollziehbar; es gibt kein stilles Ueberschreiben ohne Verlauf.
- [ ] `feat~obj-24-ac-9~1` Bei Rollback-/Merge-Konflikten wird keine stille Aenderung geschrieben; stattdessen klare Fehlermeldung mit Handlungsanweisung.
- [ ] `feat~obj-24-ac-10~1` Der gesamte Ablauf funktioniert airgapped mit internen Git-Systemen (z. B. Gitea/GitLab), ohne externe Cloud-Abhaengigkeit.

## Edge Cases
- Baseline-Repo ist nicht erreichbar -> App zeigt klaren Fehlerzustand und arbeitet mit letztem gueltigen lokalen Stand weiter.
- Baseline-Repo enthaelt ungueltige DNS-Konfiguration -> Import wird blockiert mit Validierungsbericht.
- Gleichzeitig eingehende Aenderungen im Config-Repo -> Konfliktstatus statt implizitem Ueberschreiben.
- Rollback auf sehr alten Eintrag -> App prueft Abhaengigkeiten und warnt bei Folgekonflikten.
- Akteur ist nicht authentifiziert (v1 ohne Login) -> Verlaufseintrag markiert Quelle als "system/anonymous" und bleibt nachvollziehbar.

## Technical Requirements
- DNS-Grundkonfiguration liegt in einem separaten, versionierten Git-Repository (nicht im App-Hauptrepo).
- Jede persistierte Aenderung muss auf Git-Commit-Ebene rueckverfolgbar sein (Commit-ID als Referenz im Verlauf).
- Rollback erfolgt als fachlich nachvollziehbarer Revert-Mechanismus (neuer Aenderungseintrag), nicht als History-Rewrite.
- Verlaufseintraege muessen exportierbar sein (z. B. fuer Audit/Testnachweise).
- Schnittstellen und Datenmodell muessen so gestaltet sein, dass spaeter eine Rechte-/Freigabelogik (4-Augen-Prinzip) erweiterbar ist.

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
