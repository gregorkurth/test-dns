# Validation Matrix (Repo-Testnachweis)

**Generiert am:** 2026-04-11T19:31:43.625Z
**Commit:** local
**Quelle:** Git Repository (Single Source of Truth)

## Gesamtstand

| Kennzahl | Wert |
|---|---:|
| Testfaelle gesamt | 282 |
| Passed | 10 |
| Failed | 0 |
| Never Executed | 272 |
| Manuell | 136 |
| Automatisch | 146 |

## OBJ Validation Matrix

| OBJ | Feature | Status | QA | Prod Ready | Tests (T/P/F/N) | Letzter Nachweis | Validierung |
|---|---|---|---|---|---|---|---|
| OBJ-1 | CI/CD Pipeline | In Progress | Nein | - | 28/0/0/28 | - | Teilweise validiert |
| OBJ-2 | Dokumentation | In Progress | Nein | - | 40/0/0/40 | - | Teilweise validiert |
| OBJ-3 | REST API | Completed | Ja (2026-04-06) | YES | 6/6/0/0 | 2026-04-06T15:52:19Z | Validiert |
| OBJ-4 | Capabilities Dashboard | Completed | Ja (2026-04-06) | YES | 92/0/0/92 | - | Teilweise validiert |
| OBJ-5 | Participant Configuration Form | Completed | Ja (2026-04-06) | YES | 92/0/0/92 | - | Teilweise validiert |
| OBJ-6 | DNS Zone File Generator | In Review | Ja (2026-04-09) | YES | 92/0/0/92 | - | Teilweise validiert |
| OBJ-7 | Requirements Traceability View | In Review | Ja (2026-04-09) | YES | 92/0/0/92 | - | Teilweise validiert |
| OBJ-8 | Export & Download | In Review | Ja (2026-04-09) | NO | 92/0/0/92 | - | Teilweise validiert |
| OBJ-9 | Manual Test Runner | In Review | Ja (2026-04-09) | NO | 1/1/0/0 | 2026-04-06T15:52:19Z | QA sagt Nein |
| OBJ-23 | Test Execution Dashboard | Completed | Ja (2026-04-04) | YES | 43/3/0/40 | 2026-04-06T15:52:19Z | Teilweise validiert |
| OBJ-24 | DNS Baseline Config Repository & Change History | In Review | Ja (2026-04-10) | NO | 0/0/0/0 | - | Kein Testfall verknuepft |
| OBJ-10 | Kubernetes Deployment | In Review | Ja (2026-04-09) | NO | 44/0/0/44 | - | Teilweise validiert |
| OBJ-11 | Monitoring & Observability (OpenTelemetry) | In Review | Ja (2026-04-09) | NO | 28/0/0/28 | - | Teilweise validiert |
| OBJ-25 | Helm Charts fuer Kubernetes Deployment | In Review | Ja (2026-04-10) | NO | 0/0/0/0 | - | Kein Testfall verknuepft |
| OBJ-26 | Test Operator (Scheduled Test Execution via OTel) | Planned | Nein | - | 72/0/0/72 | - | Teilweise validiert |
| OBJ-12 | Security & Authentifizierung | In Review | Ja (2026-04-09) | NO | 32/0/0/32 | - | Teilweise validiert |
| OBJ-13 | Kubernetes Operator | In Review | Ja (2026-04-09) | NO | 44/0/0/44 | - | Teilweise validiert |
| OBJ-14 | Release Management | In Review | Ja (2026-04-09) | NO | 28/0/0/28 | - | Teilweise validiert |
| OBJ-15 | Produkt-Website | In Review | Ja (2026-04-10) | YES | 40/0/0/40 | - | Teilweise validiert |
| OBJ-16 | Maturitätsstatus / Reifegradübersicht | In Review | Ja (2026-04-10) | YES | 40/0/0/40 | - | Teilweise validiert |
| OBJ-17 | SBOM & Security-Scanning | In Review | Ja (2026-04-10) | NO | 6/0/0/6 | - | Teilweise validiert |
| OBJ-22 | Release-Artefaktprüfung / Publish-Gate | In Review | Ja (2026-04-10) | NO | 6/0/0/6 | - | Teilweise validiert |
| OBJ-18 | Artefakt-Registry (Harbor / Nexus) | In Review | Ja (2026-04-10) | NO | 0/0/0/0 | - | Kein Testfall verknuepft |
| OBJ-19 | Zarf-Paket / Offline-Weitergabe | In Progress | Nein | - | 8/0/0/8 | - | Teilweise validiert |
| OBJ-20 | Zielumgebung / Import / Rehydrierung | In Review | Ja (2026-04-10) | NO | 8/0/0/8 | - | Teilweise validiert |
| OBJ-21 | GitOps / Argo CD / App-of-Apps | In Review | Ja (2026-04-10) | NO | 4/0/0/4 | - | Teilweise validiert |

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

