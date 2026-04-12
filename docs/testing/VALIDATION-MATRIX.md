# Validation Matrix (Repo-Testnachweis)

**Generiert am:** 2026-04-12T16:50:35.443Z
**Commit:** local
**Quelle:** Git Repository (Single Source of Truth)

## Gesamtstand

| Kennzahl | Wert |
|---|---:|
| Testfaelle gesamt | 386 |
| Passed | 386 |
| Failed | 0 |
| Never Executed | 0 |
| Manuell | 136 |
| Automatisch | 250 |

## OBJ Validation Matrix

| OBJ | Feature | Status | QA | Prod Ready | Tests (T/P/F/N) | Letzter Nachweis | Validierung |
|---|---|---|---|---|---|---|---|
| OBJ-1 | CI/CD Pipeline | In Progress | Nein | - | 28/28/0/0 | 2026-04-11T20:10:59Z | In Arbeit |
| OBJ-2 | Dokumentation | In Progress | Nein | - | 40/40/0/0 | 2026-04-11T20:10:59Z | In Arbeit |
| OBJ-3 | REST API | Completed | Ja (2026-04-06) | YES | 46/46/0/0 | 2026-04-12T09:27:38Z | Validiert |
| OBJ-4 | Capabilities Dashboard | Completed | Ja (2026-04-06) | YES | 92/92/0/0 | 2026-04-11T22:25:00Z | Validiert |
| OBJ-5 | Participant Configuration Form | Completed | Ja (2026-04-06) | YES | 92/92/0/0 | 2026-04-11T22:25:00Z | Validiert |
| OBJ-6 | DNS Zone File Generator | Completed | Ja (2026-04-09) | YES | 92/92/0/0 | 2026-04-11T22:25:00Z | Validiert |
| OBJ-7 | Requirements Traceability View | Completed | Ja (2026-04-09) | YES | 92/92/0/0 | 2026-04-11T22:25:00Z | Validiert |
| OBJ-8 | Export & Download | Completed | Ja (2026-04-09) | NO | 92/92/0/0 | 2026-04-11T22:25:00Z | QA sagt Nein |
| OBJ-9 | Manual Test Runner | Completed | Ja (2026-04-09) | NO | 7/7/0/0 | 2026-04-12T09:27:36Z | QA sagt Nein |
| OBJ-23 | Test Execution Dashboard | Completed | Ja (2026-04-04) | YES | 47/47/0/0 | 2026-04-12T09:27:38Z | Validiert |
| OBJ-24 | DNS Baseline Config Repository & Change History | In Review | Ja (2026-04-10) | - | 92/92/0/0 | 2026-04-11T22:25:00Z | In Arbeit |
| OBJ-10 | Kubernetes Deployment | In Review | Ja (2026-04-09) | NO | 44/44/0/0 | 2026-04-11T22:16:35Z | QA sagt Nein |
| OBJ-11 | Monitoring & Observability (OpenTelemetry) | In Review | Ja (2026-04-09) | NO | 28/28/0/0 | 2026-04-11T20:10:59Z | QA sagt Nein |
| OBJ-25 | Helm Charts fuer Kubernetes Deployment | In Review | Ja (2026-04-10) | NO | 44/44/0/0 | 2026-04-11T22:16:35Z | QA sagt Nein |
| OBJ-26 | Test Operator (Scheduled Test Execution via OTel) | In Progress | Nein | - | 72/72/0/0 | 2026-04-11T22:16:35Z | In Arbeit |
| OBJ-12 | Security & Authentifizierung | In Review | Ja (2026-04-09) | NO | 32/32/0/0 | 2026-04-11T20:10:59Z | QA sagt Nein |
| OBJ-13 | Kubernetes Operator | In Review | Ja (2026-04-09) | NO | 44/44/0/0 | 2026-04-11T22:16:35Z | QA sagt Nein |
| OBJ-14 | Release Management | In Review | Ja (2026-04-09) | NO | 28/28/0/0 | 2026-04-11T20:10:59Z | QA sagt Nein |
| OBJ-15 | Produkt-Website | Completed | Ja (2026-04-10) | YES | 40/40/0/0 | 2026-04-11T20:10:59Z | Validiert |
| OBJ-16 | Maturitätsstatus / Reifegradübersicht | Completed | Ja (2026-04-10) | YES | 40/40/0/0 | 2026-04-11T20:10:59Z | Validiert |
| OBJ-17 | SBOM & Security-Scanning | In Review | Ja (2026-04-10) | NO | 6/6/0/0 | 2026-04-11T20:10:59Z | QA sagt Nein |
| OBJ-22 | Release-Artefaktprüfung / Publish-Gate | In Review | Ja (2026-04-10) | NO | 6/6/0/0 | 2026-04-11T20:10:59Z | QA sagt Nein |
| OBJ-18 | Artefakt-Registry (Harbor / Nexus) | In Review | Ja (2026-04-10) | NO | 6/6/0/0 | 2026-04-11T20:10:59Z | QA sagt Nein |
| OBJ-19 | Zarf-Paket / Offline-Weitergabe | In Progress | Nein | - | 8/8/0/0 | 2026-04-11T20:10:59Z | In Arbeit |
| OBJ-20 | Zielumgebung / Import / Rehydrierung | In Review | Ja (2026-04-10) | NO | 8/8/0/0 | 2026-04-11T20:10:59Z | QA sagt Nein |
| OBJ-21 | GitOps / Argo CD / App-of-Apps | In Review | Ja (2026-04-10) | NO | 4/4/0/0 | 2026-04-11T20:10:59Z | QA sagt Nein |
| OBJ-27 | Dokumentationsportal (MkDocs in Next.js) | Planned | Nein | - | 0/0/0/0 | - | Kein Testfall verknuepft |

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

