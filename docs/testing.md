# Testing-Konzept (OBJ-9)

## Ziel

Dieses Dokument beschreibt, wie Tests im Repository geplant, ausgefuehrt und nachgewiesen werden.
Es richtet sich an QA, Requirements, Architektur und Management.

## Testarten und Kategorien

- Build: Build-, Packaging- und Release-Checks.
- Unit: Logik auf Funktions-/Modul-Ebene.
- Integration: Zusammenspiel mehrerer Komponenten.
- API: Endpunkte, Vertrage und Fehlerfaelle.
- UI: Sicht- und Interaktionspruefungen.
- Deployability: Installations- und Inbetriebnahme-Checks (z. B. Zarf/ArgoCD/Smoke).

Jeder manuelle Testfall in `capabilities/**/tests/manual/*.md` muss genau eine `category` im Frontmatter haben.

## Durchfuehrung

1. Automatisierte Basispruefung:
   - `npm run lint`
   - `npm run build`
   - `npm run test:run`
2. Manuelle Tests im Runner:
   - Seite: `/test-runner`
   - Schritte markieren (Bestanden/Nicht bestanden/Nicht anwendbar)
   - Beobachtungen erfassen
   - Ergebnis als Markdown herunterladen
3. Optionaler API-/Runtime-Smoke:
   - relevante Endpunkte gegen `http://localhost:3000` pruefen

## Nachweise

- Manuelle Nachweise: `tests/results/`
- Ausfuehrungsdaten: `tests/executions/`
- Matrix fuer Management-Sicht: `docs/testing/VALIDATION-MATRIX.md`
- Feature-spezifische QA-Freigaben: `features/OBJ-*.md` unter Abschnitt `QA Test Results`

## Traceability-Regel

- Testfall und Requirement muessen referenzierbar sein (`itest~...~1`, `req~...~1`).
- Git-Repository ist Source of Truth.
- Externe Systeme (z. B. Confluence) werden nur aus Git exportiert.
