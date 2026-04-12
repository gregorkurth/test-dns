# arc42 Kapitel 11: Risiken und technische Schulden

## 11.1 Ziel

Dieses Kapitel ist das verbindliche Risiko- und Debt-Register fuer Architektur,
Plattform, Security, QA und Release.

Jeder Eintrag hat:

- eindeutige ID
- Severity
- Status
- Owner
- Zieltermin
- Quelle
- konkrete Massnahme

## 11.2 Bewertungsmodell

| Kriterium | Werte |
|---|---|
| Severity | Low, Medium, High, Critical |
| Status | Open, Mitigation in Progress, Mitigated, Accepted, Closed |
| Bewertungsregel | High/Critical ohne Gegenmassnahme blockiert Releasefreigabe |

## 11.3 Risiko-Register (Stand 2026-04-12)

| Risiko-ID | Titel | Severity | Status | Owner | Zieltermin | Quelle | Massnahme |
|---|---|---|---|---|---|---|---|
| RISK-001 | Deployment-Nachweise in In-Review-Objekten nicht durchgaengig aktuell | High | Open | Platform Lead | 2026-04-18 | `features/OBJ-*.md` | Deployment-Abschnitte standardisieren und als DoD-Pflicht pruefen |
| RISK-002 | Validation Matrix muss bei Main-Merges konsistent erneuert werden | High | Mitigation in Progress | QA Lead | 2026-04-15 | `docs/testing/VALIDATION-MATRIX.md`, CI | Auto-Generierung und Pipeline-Guard verbindlich halten |
| RISK-003 | Confluence-/USB-Exporte teilweise pending oder ohne Rueckreferenz | Medium | Open | Release Manager | 2026-04-16 | `docs/exports/EXPORT-LOG.md` | Export-Lifecycle vervollstaendigen inkl. Release-ID |
| RISK-004 | Security-Scan-Bundles nutzen teils Platzhalterdaten | Medium | Open | Security Lead | 2026-04-19 | `docs/releases/SECURITY-SCAN-BUNDLES.json` | reale Scan-Artefakte pro Release erzwingen |
| RISK-005 | Tooling-Abhaengigkeiten (z. B. Java fuer OFT) nicht ueberall vorhanden | Medium | Open | Tooling Owner | 2026-04-20 | `npm run trace`, Doku | Setup-Preflight und bessere Fehlermeldungen |
| RISK-006 | Mehrere Plattform-Objekte bleiben in Review mit offenen Restpunkten | High | Open | Delivery Lead | 2026-04-25 | `features/INDEX.md` | risikobasiertes Abarbeiten + QA-Re-Runs pro Objekt |
| RISK-007 | Zugriffsschutz nicht auf allen UI-Routen gleich stark umgesetzt | Medium | Open | Frontend Lead | 2026-04-22 | `src/app/**`, `src/components/auth-guard.tsx` | Routenklassifikation (public/protected) konsolidieren |
| RISK-008 | Test-Operator-Runtime kann bei PodSecurity-Hardening regressiv brechen | High | Mitigation in Progress | Platform + Security | 2026-04-17 | Helm Values + Cluster Events | SecurityContext-Regressiontests im Deploy-Gate aufnehmen |
| RISK-009 | Test-Smoke-Abhaengigkeit von lokalen Auth-Testdaten | Medium | Mitigated | QA + Backend | 2026-04-12 | `scripts/smoke-obj11-observability.mjs` | stabile Smoke-Defaults und Overrides eingefuehrt |

## 11.4 Technische Schulden

| Debt-ID | Thema | Auswirkung | Rueckzahlungspfad |
|---|---|---|---|
| DEBT-001 | Historisch gewachsene Status-/DoD-Drift zwischen OBJ-Dateien und Prozessstand | Inkonsistenz, hoher Review-Aufwand | Status-Sync-Checks fest in CI + klare Ownership-Regel |
| DEBT-002 | hoher Anteil manueller Nachweise bei grosser Testmenge | laengere Freigabezeit | kritische Flows schrittweise automatisieren |
| DEBT-003 | teilweise redundante Doku in unterschiedlichen Perspektiven | Pflegeaufwand und Widerspruchsrisiko | eindeutige Trennung: Management-Guide vs technische Tiefe |
| DEBT-004 | heterogene Naming-/ID-Konventionen in Artefakten | Such- und Auditaufwand | Glossar + verbindliche ID-Regel pro Artefakttyp |

## 11.5 Risiko-Massnahmenplan (naechste 2 Iterationen)

| Iteration | Fokus | Ergebnis |
|---|---|---|
| I+1 | Release-/Export-Nachweise, Security-Bundle-Qualitaet | weniger offene High-Med Risiken im Freigabeprozess |
| I+2 | Testautomatisierung und Routen-Security-Harmonisierung | sinkendes Betriebs- und Regression-Risiko |

## 11.6 Pflege-Regeln

1. Neue Risiken sofort mit ID erfassen.
2. Status nur mit verlinktem Nachweis aendern.
3. High/Critical Risiken in jedem Release-Review explizit bewerten.
4. Geschlossene Risiken bleiben historisch sichtbar und werden nicht geloescht.

## 11.7 Verbindliche Quellen

- `features/OBJ-*.md` (QA Test Results, Production Ready)
- `features/INDEX.md`
- `docs/releases/UPDATE-NOTICES.json`
- `docs/exports/EXPORT-LOG.md`
- `.github/workflows/ci.yml`
