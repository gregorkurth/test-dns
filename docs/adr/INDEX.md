# ADR Index

Zentrale Uebersicht aller Architecture Decision Records (ADRs).

Regel:
- Bei jedem neuen ADR wird diese Liste aktualisiert.
- Git bleibt die Primaerquelle. Confluence (falls genutzt) folgt erst danach per Export.

## ADR Uebersicht

| ADR | Titel | Datum | Status | Datei |
|-----|-------|-------|--------|-------|
| ADR-0001 | OpenFastTrace fuer Requirements-Traceability | 2026-04-03 | Akzeptiert | [0001-openfasttrace-fuer-traceability.md](0001-openfasttrace-fuer-traceability.md) |
| ADR-0002 | Airgapped Deployment ohne externe Abhaengigkeiten | 2026-04-03 | Akzeptiert | [0002-airgapped-deployment.md](0002-airgapped-deployment.md) |
| ADR-0003 | GitHub als Git-Plattform | 2026-04-03 | Akzeptiert | [0003-github-als-git-plattform.md](0003-github-als-git-plattform.md) |
| ADR-0004 | Manueller Test-Runner als Teil der Next.js-App | 2026-04-03 | Akzeptiert | [0004-manual-test-runner.md](0004-manual-test-runner.md) |
| ADR-0005 | Next.js mit Static Generation fuer Capability-Daten | 2026-04-03 | Akzeptiert | [0005-nextjs-static-generation.md](0005-nextjs-static-generation.md) |

## Pflegehinweis

Beim Anlegen eines neuen ADR:
1. Neue Datei in `docs/adr/` anlegen.
2. Eintrag hier im Index ergaenzen.
3. Falls relevant, Verweis in `docs/arc42/09-architecture-decisions.md` nachziehen.
