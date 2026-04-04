# ID- und Benennungsregeln (Kurz)

Ziel:
- weniger Verwirrung
- einheitliche Namen
- schnelleres Verstehen fuer Manager und Entwickler

## Kern-IDs

- `OBJ-<nummer>`
  Feature-ID, z. B. `OBJ-22`

- `RDTS-<nummer>`
  Architektur-Requirement in Capability-Struktur

- `SREQ-<nummer>`
  Fachliches Requirement

- `CREQ-<nummer>`
  Customer Requirement (falls genutzt)

- `SFN-...`
  Service Function in Capability-Ebene

## Dateibenennung

- Feature-Datei:
  `features/OBJ-<nummer>-<slug>.md`

- ADR-Datei:
  `docs/adr/<4-stellige-nummer>-<slug>.md`

- arc42-Kapitel:
  `docs/arc42/<2-stellige-nummer>-<slug>.md`

- Export-Log:
  `docs/exports/EXPORT-LOG.md`

## Slug-Regeln

- nur Kleinbuchstaben
- Worte mit `-` trennen
- keine Leerzeichen
- keine Sonderzeichen

Beispiel:
- gut: `OBJ-22-release-artefaktpruefung-publish-gate.md`
- schlecht: `Obj 22 - Release Gate.md`

## Minimales Glossar

- Feature:
  Ein klar abgegrenztes Arbeitspaket mit Nutzen.

- Requirement:
  Eine Muss-Regel, die testbar sein muss.

- Testfall:
  Beschreibt, wie ein Requirement geprueft wird.

- Testnachweis:
  Beleg, dass der Test durchgefuehrt wurde.

- ADR:
  Dokumentierte Architekturentscheidung.

- arc42:
  Struktur fuer Architektur-Dokumentation in Kapiteln.

- Source of Truth:
  Verbindliche Hauptquelle. Hier: Git-Repository.
