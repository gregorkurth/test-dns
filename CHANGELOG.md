# Changelog

Alle relevanten Aenderungen an diesem Service werden in dieser Datei dokumentiert.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
und verwendet SemVer (`vMAJOR.MINOR.PATCH`).

## [Unreleased]

### Added
- OBJ-12: Session-Token-Revocation nach Logout und erweiterte Auth-Tests.
- OBJ-13: API-Endpunkt `/api/v1/operator` mit Auth-Schutz (`viewer` oder hoeher).
- OBJ-14: Release-Notices als Source of Truth mit CI-Check (`check:obj14`).

## [2026.04.1] - 2026-04-09

### Added
- Versionierte Update-Hinweise unter `docs/releases/UPDATE-NOTICES.json`.
- API-Endpunkt `/api/v1/releases` fuer Release- und Exportstatus.
- Startseiten-Hinweis fuer Releases inkl. Beta-Markierung.
- Kubernetes-Operator-Grundgeruest (CRD, RBAC, Deployment, Lesesicht).
- Auth/RBAC-Basis mit `local`/`oidc`/`hybrid` und geschuetzten API-Endpunkten.

## [2026.03.1] - 2026-04-06

### Added
- Basisstand fuer Capabilities-, Testing- und Export-Dokumentation.
- Zentrales Export-Protokoll fuer Confluence-Kopie (`docs/exports/EXPORT-LOG.md`).
