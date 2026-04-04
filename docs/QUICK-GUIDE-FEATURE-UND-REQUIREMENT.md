# Quick Guide: Neues Feature oder Requirement

Dieser Guide ist extra einfach geschrieben.
Er erklaert Schritt fuer Schritt, wie wir im Repo arbeiten.

Stell dir das so vor:

1. Erst sagen wir, was wir wollen.
2. Dann schreiben wir auf, wie wir es pruefen.
3. Dann bauen wir es.
4. Dann beweisen wir, dass es funktioniert.
5. Dann dokumentieren wir die Architektur und das Release.
6. Dann exportieren wir die wichtige Doku nach Confluence.

## Die einfache Reihenfolge

Wenn etwas Neues kommt, arbeite in dieser Reihenfolge:

1. Verstehen
2. Feature anlegen oder anpassen
3. Requirement anlegen oder anpassen
4. Testfall anlegen
5. Architektur dokumentieren
6. Implementieren
7. Testnachweise erfassen
8. Release-Doku nachziehen
9. Confluence-Export vorbereiten

Wenn das Feature fertig ist, nutze immer:
- `docs/DEFINITION-OF-DONE-FEATURE.md`

## Schritt 1: Verstehen

Frage zuerst:
- Ist es ein ganz neues Feature?
- Oder ist es nur ein neues Requirement in einem bestehenden Bereich?
- Betrifft es Fachlogik, Architektur, Betrieb oder Sicherheit?
- Muss man die Entscheidung spaeter nachvollziehen koennen?

Wenn die Antwort unklar ist, beginne nie direkt mit Code.
Beginne mit Dokumentation.

## Schritt 2: Feature anlegen oder anpassen

Wenn das Thema fuer Benutzer sichtbar ist oder ein neues Arbeitspaket ist:
- `features/INDEX.md` anschauen
- naechste freie `OBJ-Nummer` nehmen
- neue Feature-Datei anlegen oder bestehende aktualisieren

Ort:
- `features/INDEX.md`
- `features/OBJ-*.md`

Hier steht:
- was das Feature ist
- fuer wen es ist
- was es koennen muss
- was Randfaelle sind
- wovon es abhaengt

Merksatz:
Ein Feature sagt: "Was soll gebaut werden?"

## Schritt 3: Requirement anlegen oder anpassen

Ein Requirement ist eine konkrete Regel.

Beispiele:
- "Die App muss einen Export als ZIP erlauben."
- "Nur Admins duerfen diese Aktion ausfuehren."
- "Das Release-Artefakt muss vor dem Publish geprueft werden."

Ort:
- `capabilities/<capability>/services/.../requirements/*.md`

Hier steht:
- die eindeutige ID
- die Anforderung selbst
- die Zuordnung zu Capability und Service Function
- welche Features dazu gehoeren

Merksatz:
Ein Requirement sagt: "Was muss zwingend wahr sein?"

## Schritt 4: Testfall anlegen

Jetzt wird die Frage beantwortet:
"Wie pruefen wir das?"

Es gibt zwei Arten:

1. Automatischer Test
   Ort: `capabilities/**/tests/auto/`

2. Manueller Test
   Ort: `capabilities/**/tests/manual/`

Wenn ein Requirement wichtig ist, sollte es mindestens einen Testfall bekommen.

Merksatz:
Ohne Testfall ist ein Requirement nur eine Behauptung.

## Schritt 5: Architektur dokumentieren

Jetzt dokumentieren wir das "Warum" und das "Wie im grossen Bild".

Es gibt zwei Orte dafuer:

1. `docs/adr/`
   Fuer einzelne Entscheidungen

2. `docs/arc42/`
   Fuer die Gesamtarchitektur

Wann braucht es ein ADR?
- wenn wir zwischen mehreren Optionen waehlen
- wenn die Entscheidung spaeter erklaert werden muss
- wenn die Entscheidung Folgen fuer Betrieb, Sicherheit, Kosten oder Architektur hat

Wann muss arc42 nachgezogen werden?
- wenn sich Kontext, Bausteine, Schnittstellen, Betriebsablauf oder Risiken aendern

Merksatz:
ADR = einzelne wichtige Entscheidung
arc42 = grosses Architektur-Handbuch

## Schritt 6: Implementieren

Erst jetzt beginnt die Umsetzung.

Waehren der Umsetzung muss man immer wieder pruefen:
- Stimmt das Feature noch?
- Stimmt das Requirement noch?
- Muss ein Testfall angepasst werden?
- Muss ein ADR ergaenzt werden?
- Muss ein arc42-Kapitel aktualisiert werden?

Wenn waehrend der Umsetzung etwas anders wird als geplant:
- Doku zuerst oder gleichzeitig anpassen
- nicht erst Wochen spaeter

## Schritt 7: Testnachweise erfassen

Nach der Umsetzung brauchen wir Beweise.

Das sind moegliche Nachweise:
- automatischer Test ist gruen
- manueller Test wurde durchgefuehrt
- QA-Ergebnis wurde im Feature dokumentiert
- Export-/Import-Test wurde festgehalten

Wo sieht man Resultate?

| Was | Wo sichtbar |
|-----|-------------|
| Feature-Status | `features/INDEX.md` |
| Feature-Teststand | `features/OBJ-*.md` unter `QA Test Results` |
| Requirement-Tests | `capabilities/**/tests/` |
| Architekturentscheidung | `docs/adr/` |
| Gesamtarchitektur | `docs/arc42/` |
| Release-Stand | Release-Feature, Pipeline, Artefakte |

Merksatz:
Nicht nur testen. Auch den Nachweis ablegen.

## Schritt 8: Release- und Change-Dokumentation

Wenn ein Feature fertig ist oder etwas fuer ein Release wichtig ist, dann nachziehen:
- Feature-Status
- QA-Status
- Deployment-Status
- Release-Hinweise
- falls noetig Changelog oder Release-Notizen

Change Management bedeutet bei uns:
- Aenderung im Git
- Aenderung in der Doku
- Aenderung nachvollziehbar in Commits, Features, ADRs und Releases

Merksatz:
Wenn man spaeter nicht mehr versteht, was geaendert wurde, war die Doku nicht fertig.

Pflicht zum Abschluss:
- Definition of Done pruefen: `docs/DEFINITION-OF-DONE-FEATURE.md`

## Schritt 9: Confluence-Export vorbereiten

Confluence ist nicht direkt angebunden.
Darum machen wir einen Medienbruch per Export und Kopie.

Das bedeutet:
- Kapitel im Repo sauber pflegen
- pro Kapitel eine eigene Markdown-Datei haben
- exportierbare Struktur verwenden
- bei Feature-Abschluss oder Release die betroffenen Kapitel exportieren
- Export zentral protokollieren in `docs/exports/EXPORT-LOG.md`

Mehr dazu:
- `docs/CONFLUENCE-EXPORT-GUIDE.md`
- `docs/arc42/README.md`
- `docs/ID-UND-BENENNUNGSREGELN.md`

## Die wichtigste Verlinkung

So haengt alles zusammen:

1. PRD
   sagt, warum das Produkt existiert

2. Feature
   sagt, was ein Arbeitspaket liefern soll

3. Requirement
   sagt, welche Regel gelten muss

4. Testfall
   sagt, wie die Regel geprueft wird

5. Testnachweis
   zeigt, was beim Pruefen herauskam

6. ADR
   erklaert einzelne wichtige Entscheidungen

7. arc42
   erklaert die Gesamtarchitektur

8. Release-Doku
   zeigt, was wirklich ausgeliefert wurde

## Mini-Beispiel

Neue Idee:
"Die App soll Releases vor dem Publish pruefen."

Dann ist die Reihenfolge:

1. Feature anlegen
   `features/OBJ-22-...`

2. Requirement anlegen
   `RDTS-711` bis `RDTS-715`

3. Testfaelle anlegen
   auto und/oder manual

4. ADR schreiben
   falls entschieden wird, wie diese Pruefung technisch erfolgt

5. arc42 aktualisieren
   z. B. Bausteinsicht, Laufzeitsicht, Betriebskonzept

6. Umsetzung

7. Testnachweise dokumentieren

8. Release-Dokumentation aktualisieren

9. Nach Confluence exportieren

## Die Kurzregel fuer Manager

Wenn du nur 4 Dinge pruefen willst, dann diese:

1. Gibt es ein Feature?
2. Gibt es Requirements?
3. Gibt es Tests und Nachweise?
4. Wurden ADR und arc42 nachgezogen?

Wenn eine dieser Antworten "nein" ist, ist die Arbeit noch nicht komplett.
