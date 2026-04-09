# Validation Matrix (Repo-Testnachweis)

**Generiert am:** 2026-04-09T07:56:25.106Z
**Commit:** local
**Quelle:** Git Repository (Single Source of Truth)

## Gesamtstand

| Kennzahl | Wert |
|---|---:|
| Testfaelle gesamt | 244 |
| Passed | 10 |
| Failed | 0 |
| Never Executed | 234 |
| Manuell | 117 |
| Automatisch | 127 |

## OBJ Validation Matrix

| OBJ | Feature | Status | QA | Prod Ready | Tests (T/P/F/N) | Letzter Nachweis | Validierung |
|---|---|---|---|---|---|---|---|
| OBJ-1 | CI/CD Pipeline | In Progress | Nein | - | 26/0/0/26 | - | Teilweise validiert |
| OBJ-2 | Dokumentation | In Progress | Nein | - | 40/0/0/40 | - | Teilweise validiert |
| OBJ-3 | REST API | Completed | Ja (2026-04-06) | YES | 6/6/0/0 | 2026-04-06T15:52:19Z | Validiert |
| OBJ-4 | Capabilities Dashboard | Completed | Ja (2026-04-06) | YES | 92/0/0/92 | - | Teilweise validiert |
| OBJ-5 | Participant Configuration Form | Completed | Ja (2026-04-06) | YES | 92/0/0/92 | - | Teilweise validiert |
| OBJ-6 | DNS Zone File Generator | In Review | Ja (2026-04-07) | NO | 92/0/0/92 | - | Teilweise validiert |
| OBJ-7 | Requirements Traceability View | Planned | Nein | - | 92/0/0/92 | - | Teilweise validiert |
| OBJ-8 | Export & Download | Planned | Nein | - | 92/0/0/92 | - | Teilweise validiert |
| OBJ-9 | Manual Test Runner | Planned | Nein | - | 1/1/0/0 | 2026-04-06T15:52:19Z | In Arbeit |
| OBJ-23 | Test Execution Dashboard | Completed | Ja (2026-04-04) | YES | 43/3/0/40 | 2026-04-06T15:52:19Z | Teilweise validiert |
| OBJ-10 | Kubernetes Deployment | Planned | Nein | - | 24/0/0/24 | - | Teilweise validiert |
| OBJ-11 | Monitoring & Observability (OpenTelemetry) | Planned | Nein | - | 24/0/0/24 | - | Teilweise validiert |
| OBJ-12 | Security & Authentifizierung | Planned | Nein | - | 20/0/0/20 | - | Teilweise validiert |
| OBJ-13 | Kubernetes Operator | Planned | Nein | - | 24/0/0/24 | - | Teilweise validiert |
| OBJ-14 | Release Management | Planned | Nein | - | 26/0/0/26 | - | Teilweise validiert |
| OBJ-15 | Produkt-Website | Planned | Nein | - | 40/0/0/40 | - | Teilweise validiert |
| OBJ-16 | Maturitätsstatus / Reifegradübersicht | Planned | Nein | - | 40/0/0/40 | - | Teilweise validiert |
| OBJ-17 | SBOM & Security-Scanning | Planned | Nein | - | 6/0/0/6 | - | Teilweise validiert |
| OBJ-22 | Release-Artefaktprüfung / Publish-Gate | Planned | Nein | - | 6/0/0/6 | - | Teilweise validiert |
| OBJ-18 | Artefakt-Registry (Harbor / Nexus) | Planned | Nein | - | 0/0/0/0 | - | Kein Testfall verknuepft |
| OBJ-19 | Zarf-Paket / Offline-Weitergabe | Planned | Nein | - | 8/0/0/8 | - | Teilweise validiert |
| OBJ-20 | Zielumgebung / Import / Rehydrierung | Planned | Nein | - | 8/0/0/8 | - | Teilweise validiert |
| OBJ-21 | GitOps / Argo CD / App-of-Apps | Planned | Nein | - | 4/0/0/4 | - | Teilweise validiert |

## Statusregeln

- Never Executed: kein gueltiger Ausfuehrungsnachweis vorhanden.
- Passed: letzter gueltiger Nachweis ist erfolgreich.
- Failed: letzter gueltiger Nachweis ist fehlgeschlagen oder fehlerhaft.
- Zeitstempel-Regel: Nachweise ohne gueltigen Zeitstempel gelten nicht als gueltiger letzter Nachweis.

## Datenquellen

- `capabilities/**/tests/manual/*.md`
- `capabilities/**/tests/auto/*.md`
- `tests/results/**/*.md`
- `tests/results/**/*.json`
- `tests/executions/**/*.json`

## Interpretation

- `Tests (T/P/F/N)` bedeutet: `Total / Passed / Failed / Never Executed`.
- Ein Test kann mehreren OBJs zugeordnet sein; deshalb sind OBJ-Summen nicht additiv zur Gesamtsumme.
- Die Matrix ist ein Management-Nachweis und ersetzt keine Detailanalyse im Testfall selbst.
- Detailnachweise bleiben in `tests/results/`, `tests/executions/` und den `QA Test Results` in `features/OBJ-*.md`.

