# Dokumentation im Repo

Dieses Repository ist die offizielle Wahrheit fuer das Projekt.

Wenn jemand fragt:
- Was ist geplant?
- Was wurde entschieden?
- Was wurde getestet?
- Was wurde released?
- Was ist nach Confluence exportiert worden?

Dann muss die Antwort hier im Git-Repository stehen.

## Fuer wen ist diese Doku?

Diese Dokumentation ist absichtlich einfach geschrieben.
Sie ist fuer:
- Projektleiter
- Manager
- Service Owner
- Tester
- Architekten
- Entwickler

## Die 6 wichtigsten Orte

1. `docs/SVC.md`
   Hier steht, was der Service insgesamt erreichen soll.

2. `features/INDEX.md`
   Hier sieht man alle Features und ihren Status.

3. `features/OBJ-*.md`
   Hier steht pro Feature, was genau gebaut werden soll.

4. `capabilities/`
   Hier stehen Requirements, Tests, Nachweise und fachliche Struktur.

5. `docs/adr/`
   Hier stehen Architekturentscheide. Ein ADR erklaert: "Warum haben wir das so entschieden?"

6. `docs/arc42/`
   Hier steht die Architektur der Applikation nach arc42.

7. `docs/security/`
   Hier stehen Security-Baseline-Dokumente wie Kommunikationsmatrix, Exceptions, Incidents und AI-Zonenmodell.

## Wenn etwas Neues kommt, wo starte ich?

Wenn ein neues Thema kommt, beginne hier:
- Neues Requirement oder neues Feature: `docs/QUICK-GUIDE-FEATURE-UND-REQUIREMENT.md`
- Testing Schritt fuer Schritt: `docs/QUICK-GUIDE-TESTING.md`
- AI-Agent Anbindung ueber MCP (DNS CRUD): `docs/MCP-DNS-CRUD.md`
- Architektur dokumentieren: `docs/arc42/README.md`
- Security-Baseline umsetzen: `docs/security/README.md`
- Nach Confluence exportieren: `docs/CONFLUENCE-EXPORT-GUIDE.md`
- Feature-Abschluss pruefen: `docs/DEFINITION-OF-DONE-FEATURE.md`
- IDs und Benennung: `docs/ID-UND-BENENNUNGSREGELN.md`
- Bestehende technische Doku verstehen: `docs/DOCUMENTATION-GUIDE.md`

## Goldene Regel

Nichts ist "nur im Kopf".

Wenn etwas wichtig ist, muss es an mindestens einem dieser Orte stehen:
- SVC
- Feature-Spec
- Requirement
- Testfall
- Testnachweis
- ADR
- arc42-Kapitel
- Release-Dokumentation

## Was gehoert wohin?

| Frage | Datei / Ordner |
|------|-----------------|
| Warum bauen wir das? | `docs/SVC.md` |
| Was ist das naechste Feature? | `features/INDEX.md` |
| Was soll ein Feature genau koennen? | `features/OBJ-*.md` |
| Welche fachliche Anforderung gilt genau? | `capabilities/**/requirements/*.md` |
| Wie pruefen wir die Anforderung? | `capabilities/**/tests/` |
| Was kam beim Test heraus? | `docs/testing/VALIDATION-MATRIX.md`, Testnachweis im Repo, QA-Abschnitt im Feature |
| Warum wurde eine Architekturentscheidung getroffen? | `docs/adr/*.md` |
| Wie ist die Architektur im Ganzen? | `docs/arc42/` |
| Was wurde released? | Release-Doku, Pipeline, Artefakte, `features/OBJ-14-*.md` |
| Was wurde nach Confluence kopiert? | `docs/CONFLUENCE-EXPORT-GUIDE.md` und `docs/exports/EXPORT-LOG.md` |

## Einfache Denkweise

Man kann sich das Repo wie 5 Schubladen merken:

1. Idee
   `docs/SVC.md`

2. Arbeitspaket
   `features/OBJ-*.md`

3. Muss-Regel
   `capabilities/**/requirements/*.md`

4. Beweis
   `capabilities/**/tests/` und Testnachweise

5. Erklaerung
   `docs/adr/` und `docs/arc42/`

## Pflicht bei jeder Aenderung

Wenn ein Feature oder Requirement neu ist oder sich aendert, dann muss jemand pruefen:
- Muss das SVC angepasst werden?
- Muss ein Feature angepasst oder neu angelegt werden?
- Muss ein Requirement angepasst oder neu angelegt werden?
- Muss ein Testfall angepasst oder neu angelegt werden?
- Muss ein ADR geschrieben werden?
- Muss ein arc42-Kapitel nachgezogen werden?
- Muss nach Abschluss ein Confluence-Export gemacht werden?

Wenn eine dieser Antworten "ja" ist, dann ist die Arbeit noch nicht ganz fertig.
