# arc42 Kapitel 11: Risiken und technische Schulden

## Ziel

Dieses Kapitel ist das verbindliche Risiko-Register fuer Architektur, Betrieb, QA und Release.
Jedes Risiko hat:
- eindeutige ID
- Severity
- Owner
- Termin
- Quelle im Repo
- konkrete Massnahme

## Risiko-Register (Stand 2026-04-11)

| Risiko-ID | Titel | Severity | Status | Owner | Zieltermin | Quelle | Massnahme |
|---|---|---|---|---|---|---|---|
| RISK-001 | Unvollstaendige Deployment-Nachweise in Feature-Specs (`_To be added by /deploy_`) | High | Open | Platform Lead | 2026-04-18 | `features/OBJ-*.md` | Deployment-Abschnitte pro In-Review-OBJ vervollstaendigen und via DoD abhaken |
| RISK-002 | Validation Matrix ist zeitkritisch und muss bei Main-Merges aktualisiert werden | High | Mitigation in Progress | QA Lead | 2026-04-12 | `docs/testing/VALIDATION-MATRIX.md`, `.github/workflows/ci.yml` | Auto-Generierung + Auto-Commit auf `main` aktiv halten und Pipeline-Lauf beobachten |
| RISK-003 | Release-Export fuer Confluence noch nicht durchgaengig abgeschlossen (`pending`/`Nacharbeit`) | Medium | Open | Release Manager | 2026-04-16 | `docs/releases/UPDATE-NOTICES.json`, `docs/exports/EXPORT-LOG.md` | Offene Export-Eintraege abschliessen und Export-ID sauber rueckreferenzieren |
| RISK-004 | Offline-DB-Snapshots fuer Security-Scans sind aktuell Platzhalter | Medium | Open | Security Lead | 2026-04-19 | `npm run check:obj17`, `docs/releases/SECURITY-SCAN-BUNDLES.json` | Echte Trivy-DB-Snapshots aus CI-Releaselauf erzeugen und versioniert ablegen |
| RISK-005 | Java-Abhaengigkeit fuer OFT lokal nicht auf jedem Arbeitsplatz vorhanden | Medium | Open | Tooling Owner | 2026-04-20 | `npm run trace`, `docs/DOCUMENTATION-GUIDE.md` | Java-Voraussetzung im Setup prominenter dokumentieren und Preflight-Check ergaenzen |
| RISK-006 | Mehrere OBJs stehen auf `In Review` mit `Production Ready: NO` | High | Open | Delivery Lead | 2026-04-25 | `features/INDEX.md`, betroffene `features/OBJ-*.md` | High-Severity-Bugs priorisiert je OBJ abarbeiten und QA-Re-Run erzwingen |
| RISK-007 | Security-/Auth-UX ist nicht auf allen GUI-Seiten einheitlich abgesichert | Medium | Open | Frontend Lead | 2026-04-22 | `src/app/**/page.tsx`, `src/components/auth-guard.tsx` | Zugriffsmatrix definieren (oeffentlich vs auth-pflichtig) und konsistent umsetzen |

## Technische Schulden

| Debt-ID | Thema | Auswirkung | Rueckzahlungspfad |
|---|---|---|---|
| DEBT-001 | Historisch gewachsene Status-/DoD-Drift zwischen OBJ-Dateien und Prozessstand | Erhoehter Review-Aufwand, Inkonsistenz-Risiko | Guardrails (`check:feature-status-sync`, Placeholder-Guard) verbindlich in CI halten |
| DEBT-002 | Hoher Anteil manueller Nachweise bei sehr vielen Testfaellen | Langsame Freigabezyklen | Automatisierte Nachweis-Abdeckung pro kritischem Flow schrittweise erweitern |

## Pflege-Regeln

1. Neue Risiken sofort mit ID eintragen.
2. Status nur aendern, wenn Massnahme und Nachweis verlinkt sind.
3. Geschlossene Risiken bleiben im Kapitel und werden nicht geloescht.
4. Bei jedem Release-Review muessen offene High-Risiken aktiv bewertet werden.

## Quellen

- `features/OBJ-*.md` (QA Test Results, Production Ready)
- `features/INDEX.md`
- `docs/releases/UPDATE-NOTICES.json`
- `docs/exports/EXPORT-LOG.md`
- CI-Ergebnisse aus `.github/workflows/ci.yml`
