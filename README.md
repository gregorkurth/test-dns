# FMN DNS Tool - Repository Startseite

[![Maturitaet](https://img.shields.io/badge/Maturitaet-L0%20Idea-9e9e9e)](capabilities/INDEX.md)
[![Deployment](https://img.shields.io/badge/Deployment-Not%20Deployed-d3d3d3)](features/INDEX.md)
[![Release](https://img.shields.io/badge/Release-Not%20Released-d3d3d3)](docs/exports/EXPORT-LOG.md)
[![Feature-Status](https://img.shields.io/badge/Features-4%20In%20Progress%20%2F%2022-1f6feb)](features/INDEX.md)
[![Architektur](https://img.shields.io/badge/Architecture-arc42-0a7f42)](docs/arc42/README.md)
[![Source%20of%20Truth](https://img.shields.io/badge/Source%20of%20Truth-Git%20Repository-2da44e)](docs/README.md)

> Dieses Git-Repository ist die verbindliche Hauptquelle fuer Anforderungen, Architektur, Tests, Nachweise, Releases und Exporte.
>
> Stand: 2026-04-04

## Start hier (2 Minuten Ueberblick)

1. Serviceziel und Scope: [docs/SVC.md](docs/SVC.md)
2. Feature-Status und Reihenfolge: [features/INDEX.md](features/INDEX.md)
3. Capability- und Requirement-Landschaft: [capabilities/INDEX.md](capabilities/INDEX.md)

## Navigationskarte: Wo finde ich was?

| Frage | Datei/Ordner |
|---|---|
| Was ist das Serviceziel und der Scope? | [docs/SVC.md](docs/SVC.md) |
| Welche Features gibt es und was ist ihr Status? | [features/INDEX.md](features/INDEX.md) |
| Was soll ein einzelnes Feature genau koennen? | [features/](features/) |
| Welche fachlichen/technischen Requirements gelten? | [capabilities/](capabilities/) |
| Wie werden Requirements getestet? | [capabilities/**/tests/](capabilities/) |
| Wo stehen Architekturentscheidungen (Warum)? | [docs/adr/](docs/adr/) |
| Wo steht die Gesamtarchitektur nach arc42? | [docs/arc42/README.md](docs/arc42/README.md) |
| Wie sieht die Definition of Done aus? | [docs/DEFINITION-OF-DONE-FEATURE.md](docs/DEFINITION-OF-DONE-FEATURE.md) |
| Wie funktioniert Confluence-Export (USB/Copy-Job)? | [docs/CONFLUENCE-EXPORT-GUIDE.md](docs/CONFLUENCE-EXPORT-GUIDE.md) |
| Wo wird jeder Export nachgewiesen? | [docs/exports/EXPORT-LOG.md](docs/exports/EXPORT-LOG.md) |
| Welche ID- und Namensregeln gelten? | [docs/ID-UND-BENENNUNGSREGELN.md](docs/ID-UND-BENENNUNGSREGELN.md) |
| Management-Sicht auf die Doku | [docs/README.md](docs/README.md) |
| Technischer Doku-Guide | [docs/DOCUMENTATION-GUIDE.md](docs/DOCUMENTATION-GUIDE.md) |
| Quick Guide fuer neues Feature/Requirement | [docs/QUICK-GUIDE-FEATURE-UND-REQUIREMENT.md](docs/QUICK-GUIDE-FEATURE-UND-REQUIREMENT.md) |
| OBJ-4 Live Server Start | [capability-dashboard-live/README.md](capability-dashboard-live/README.md) |

## Schritt-fuer-Schritt bei neuem Requirement oder Feature

1. Ziel klaeren und bei Bedarf im [SVC](docs/SVC.md) nachziehen.
2. Feature anlegen/aktualisieren in [features/](features/) und in [features/INDEX.md](features/INDEX.md) eintragen.
3. Requirement in [capabilities/](capabilities/) unter der passenden Service Function erfassen.
4. Testfaelle anlegen (auto/manual) und Requirement-Verknuepfung sicherstellen.
5. Umsetzung bauen und QA-Nachweis im Feature-Dokument erfassen.
6. Bei wichtigen Architekturentscheidungen ein ADR in [docs/adr/](docs/adr/) erstellen.
7. Betroffene arc42-Kapitel in [docs/arc42/](docs/arc42/) aktualisieren.
8. Definition of Done mit [docs/DEFINITION-OF-DONE-FEATURE.md](docs/DEFINITION-OF-DONE-FEATURE.md) abschliessen.
9. Falls gefordert: nach Confluence exportieren und im [Export-Log](docs/exports/EXPORT-LOG.md) dokumentieren.

## Release- und Change-Management (Kurzregel)

- Change-Management laeuft ueber Feature-Specs, Requirements, Tests, ADRs und arc42.
- Release-Management wird in Features und Release-Kontext dokumentiert (u. a. [OBJ-14](features/OBJ-14-release-management.md), [OBJ-22](features/OBJ-22-release-artefaktpruefung-publish-gate.md)).
- Confluence ist Lesekopie, nicht Primaerquelle:
  Git zuerst -> Freigabe -> Export -> Export-Log.

## Badges pflegen (Best Practice)

- Badges bei wichtigen Meilensteinen aktualisieren, spaetestens bei jedem Release.
- Empfohlene Trigger:
  - Maturitaetslevel geaendert
  - Erstes Deployment erfolgt
  - Offizielles Release erstellt
  - Feature-Status signifikant geaendert
- Quelle fuer Badge-Werte:
  - Feature-Status: [features/INDEX.md](features/INDEX.md)
  - Maturitaet: [capabilities/INDEX.md](capabilities/INDEX.md)
  - Release/Export: [docs/exports/EXPORT-LOG.md](docs/exports/EXPORT-LOG.md)

## Technischer Einstieg

```bash
npm install
npm run dev
npm run lint
npm run build
```
