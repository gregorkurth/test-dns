# Bootstrap-Artefakte (Initialisierung)

Diese Referenz beschreibt die Mindeststruktur, die der Skill bei einem leeren Repo erzeugen soll.

## Mindeststruktur

```text
capabilities/
  INDEX.md
  <capability-slug>/
    README.md
    maturity.md
    products.md
    services/
      <service-slug>/
        README.md
        service-functions/
          <SFN-ID>-<slug>/
            README.md
            requirements/
              <REQ-ID>.md
            tests/
              auto/
                TEST-<REQ-ID>-001.md
              manual/
                TEST-<REQ-ID>-001-manual.md

features/
  INDEX.md
  OBJ-<n>-<slug>.md

docs/
  README.md
  SVC.md
  DEFINITION-OF-DONE-FEATURE.md
  CONFLUENCE-EXPORT-GUIDE.md
  QUICK-GUIDE-FEATURE-UND-REQUIREMENT.md
  QUICK-GUIDE-TESTING.md
  exports/
    EXPORT-LOG.md
  adr/
    INDEX.md
  arc42/
    README.md
    01-introduction-and-goals.md
    02-constraints.md
    03-context-and-scope.md
    04-solution-strategy.md
    05-building-block-view.md
    06-runtime-view.md
    07-deployment-view.md
    08-cross-cutting-concepts.md
    09-architecture-decisions.md
    10-quality-requirements.md
    11-risks-and-technical-debt.md
    12-glossary-and-work-products.md
```

## Mindestinhalte je Objekt

- `features/OBJ-*.md`: User Stories, ACs, Edge Cases, Dependencies.
- `capabilities/.../requirements/*.md`: Quelle, Prioritaet, Text, Testverweise.
- `tests/auto` und `tests/manual`: jeweils ein Stub pro Requirement.
- `docs/SVC.md`: Serviceziel, Roadmap, Erfolgskriterien, Rahmenbedingungen.
- `docs/arc42/*`: pro Kapitel gepflegte Grundlage, keine Platzhalterreste.

## Qualitätsschwelle

- Keine `{{placeholder}}`-Reste.
- Alle Relativlinks zeigen auf existente Dateien.
- IDs konsistent (`OBJ-*`, `CAP-*`, `SVC-*`, `SFN-*`, `SREQ-/RDTS-/CREQ-/IREQ-`).
