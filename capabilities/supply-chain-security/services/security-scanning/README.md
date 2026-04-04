# Service: Security Scanning (SVC-SCS-SCAN)

> **Capability:** CAP-007 Supply Chain Security
> **Maturität:** L0 – Not achieved

## Beschreibung

Dieser Service führt automatisierte Security-Scans auf Code-, Dependency-, Container- und Konfigurations-Ebene durch und archiviert die Ergebnisse versionsbezogen.

## Service Functions

| SFN-ID | Service Function | Beschreibung |
|--------|-----------------|-------------|
| SFN-SCS-002 | SAST & SCA Scan | Code- und Dependency-Scanning bei jedem CI-Build |
| SFN-SCS-003 | Container & Config Scan | Container-CVE und Konfigurationsscan bei Release-Builds |
| SFN-SCS-004 | Release Artifact Audit | Prüfung des final erzeugten Veröffentlichungsinhalts vor Publish und Export |

## Requirements

| Req-ID | Typ | Priorität | Beschreibung |
|--------|-----|-----------|-------------|
| RDTS-705 | [ARCH] | 🟥 MUSS | SAST-Scan (semgrep) bei jedem CI-Build |
| RDTS-706 | [ARCH] | 🟥 MUSS | SCA-Scan (npm audit / trivy fs) bei jedem CI-Build |
| RDTS-707 | [ARCH] | 🟥 MUSS | Container-CVE-Scan (trivy image) bei Release-Builds |
| RDTS-708 | [ARCH] | 🟥 MUSS | Konfigurationsscan (trivy config) bei Release-Builds |
| RDTS-709 | [ARCH] | 🟥 MUSS | Kritische Findings (CVSS ≥ 9.0) blockieren Release |
| RDTS-710 | [ARCH] | 🟥 MUSS | Security-Ergebnisse werden versionsbezogen archiviert |
| RDTS-711 | [ARCH] | 🟥 MUSS | Final erzeugte Release-Artefakte werden vor Publish und Export inhaltlich geprüft |
| RDTS-712 | [ARCH] | 🟥 MUSS | Freigabe des Artefaktinhalts erfolgt per versionierter Allowlist-Richtlinie |
| RDTS-713 | [ARCH] | 🟥 MUSS | Prüfung umfasst Dateitypen, Pfade, Top-Level-Struktur, Dateianzahl und Artefaktgrösse |
| RDTS-714 | [ARCH] | 🟥 MUSS | Secrets, interne Entwicklungsartefakte und Sourcemaps sind standardmässig ausgeschlossen |
| RDTS-715 | [ARCH] | 🟥 MUSS | Policy-Verstösse blockieren Build oder Release und werden protokolliert |
