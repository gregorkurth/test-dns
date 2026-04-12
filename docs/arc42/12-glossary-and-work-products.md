# arc42 Kapitel 12: Glossar und Arbeitsprodukte

## 12.1 Ziel

Dieses Kapitel schafft ein gemeinsames Begriffsverstaendnis und listet die
verbindlichen Arbeitsprodukte inklusive Speicherort, Owner und Pflegeausloeser.
Es ist die Bruecke zwischen Management- und Technikdokumentation.

## 12.2 Arbeitsprodukt-Katalog

| Arbeitsprodukt | Ort im Repo | Owner-Rolle | Wann aktualisieren |
|---|---|---|---|
| Service Vision (SVC) | `docs/SVC.md` | Product/Requirements | bei Ziel- oder Scopeaenderung |
| Feature-Liste | `features/INDEX.md` | Requirements/PM | bei jedem neuen oder geaenderten Objekt |
| Feature-Spec | `features/OBJ-*.md` | Requirements + Umsetzung + QA | bei Fortschritt, QA, Deploy, Release |
| Capability-/Requirement-Baum | `capabilities/**` | Requirements | bei neuen/angepassten Anforderungen |
| Testfaelle | `capabilities/**/tests/**` | QA | bei neuen ACs, Risiken, Regressionen |
| Testausfuehrungsnachweise | `tests/executions/**`, `docs/testing/**` | QA | pro Testlauf/Release |
| ADRs | `docs/adr/**` | Architekturgremium | bei richtungsrelevanter Entscheidung |
| arc42 | `docs/arc42/**` | Architektur | pro Feature/Release nachziehen |
| Benutzerhandbuch | `docs/user-manual/**` | Produkt + Support | bei UI-/Prozessaenderung |
| Betriebsdoku | `docs/operations.md` | Platform/Deploy | bei Betriebsaenderungen |
| Release-Doku | `docs/releases/**` | Release Management | pro Release |
| Export-Log | `docs/exports/EXPORT-LOG.md` | Release Management | bei jeder Confluence-/USB-Kopie |
| Helm Chart | `helm/**` | Platform/Deploy | bei Deployment-/Runtime-Aenderungen |
| Security Baseline | `req-init/security-baseline.md` | Security | bei neuen Security-Vorgaben |

## 12.3 ID- und Namenskonventionen

| Typ | Muster | Beispiel |
|---|---|---|
| Objekt/Feature | `OBJ-<nummer>` | `OBJ-26` |
| Requirement | projektspezifisch (`SREQ-*`, `CREQ-*`, `RDTS-*`) | `SREQ-238` |
| Testfall | `TEST-<Requirement>-<laufnr>` | `TEST-SREQ-238-001` |
| ADR | `ADR-<vierstellig>` | `ADR-0005` |
| Risiko | `RISK-<dreistellig>` | `RISK-008` |
| Debt | `DEBT-<dreistellig>` | `DEBT-003` |
| Release | `YYYY.MM.N` | `2026.04.3` |

## 12.4 Glossar (kurz und managementtauglich)

| Begriff | Bedeutung |
|---|---|
| Feature (OBJ) | abgegrenztes Arbeitspaket mit fachlichem oder technischem Nutzen |
| Requirement | pruefbare Anforderung, die erfuellt werden muss |
| Testfall | konkreter Pruefablauf zu einem Requirement |
| Testnachweis | belegte Ausfuehrung eines Testfalls (inkl. Ergebnis) |
| DoD (Definition of Done) | verpflichtende Abschlusskriterien fuer ein Feature |
| ADR | dokumentierte Architekturentscheidung inkl. Konsequenzen |
| arc42 | strukturierte Architekturgesamtdokumentation |
| Git Source of Truth | Git ist die einzig verbindliche Primaerquelle |
| Export-Log | Nachweis ueber Doku-Kopien in externe Systeme |
| App-of-Apps | Argo-CD-Muster zur Verwaltung mehrerer Deployments |
| Zarf | Paketierungs- und Transfermechanismus fuer Airgap-Umgebungen |
| OTel | Standard fuer Telemetriesignale (Logs, Metriken, Traces) |
| OpenFeature | standardisierter Ansatz fuer Feature-Flags/Beta-Steuerung |

## 12.5 Dokumentationsfluss (Source of Truth)

1. Aenderung immer zuerst in Git-Dokumenten pflegen.
2. Verweise und IDs konsistent halten (Feature, Requirement, Test, ADR).
3. DoD gegenpruefen (Doku/QA/ADR/Export).
4. Erst danach Export/Kopie nach Confluence oder andere Zielsysteme.
5. Export im `EXPORT-LOG.md` protokollieren.

## 12.6 Confluence-/USB-Exportpaket pro Release

Empfohlener Mindestumfang:

- `docs/arc42/01-12 *.md`
- `docs/adr/INDEX.md` + neue ADRs
- `docs/releases/*` (Release Notes, Update Notices, Security Bundles)
- `docs/user-manual/**`
- `docs/operations.md`
- `docs/exports/EXPORT-LOG.md`

## 12.7 Pflege-Trigger

Kapitel 12 wird aktualisiert bei:

- neuen Artefakttypen oder Repo-Struktur
- neuen ID-Konventionen
- geaendertem Export- oder Governance-Prozess

## 12.8 Verbindliche Quellen

- `docs/DEFINITION-OF-DONE-FEATURE.md`
- `docs/DOCUMENTATION-GUIDE.md`
- `docs/CONFLUENCE-EXPORT-GUIDE.md`
- `docs/exports/EXPORT-LOG.md`
- `features/INDEX.md`
