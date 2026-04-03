# 3. GitHub als Git-Plattform

Datum: 2026-04-03

## Status

Akzeptiert

## Kontext

Das Projekt benötigt eine Git-Plattform für Versionskontrolle, CI/CD und Zusammenarbeit. Ursprünglich wurden on-premises Optionen (Gitea, GitLab) evaluiert.

## Entscheid

Wir verwenden **GitHub** als Git-Plattform mit **GitHub Actions** für CI/CD.

- CI/CD-Konfiguration: `.github/workflows/ci.yml`
- Reports (Traceability, ADR-Site) werden als GitHub Actions Artifacts gespeichert
- pytest DNS-Tests werden über den manuellen `workflow_dispatch`-Trigger gestartet
- BIND9-Server-IP wird als GitHub Secret (`DNS_SERVER_IP`) hinterlegt

## Konsequenzen

- OFT JAR wird via `actions/cache` gecacht (kein erneuter Download bei jedem Run)
- Traceability-Report wird nach jedem relevanten Push automatisch als Artifact hochgeladen (90 Tage aufbewahrt)
- pytest läuft nur manuell: GitHub → Actions → Workflow auswählen → "Run workflow"
