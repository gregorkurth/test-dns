# Service: SBOM Generation (SVC-SCS-SBOM)

> **Capability:** CAP-007 Supply Chain Security
> **Maturität:** L0 – Not achieved

## Beschreibung

Dieser Service stellt die Erzeugung und Archivierung einer SBOM (Software Bill of Materials) für jede releasefähige Version sicher.

## Service Functions

| SFN-ID | Service Function | Beschreibung |
|--------|-----------------|-------------|
| SFN-SCS-001 | SBOM Creation & Archivierung | SBOM erzeugen, dem Release zuordnen und archivieren |

## Requirements

| Req-ID | Typ | Priorität | Beschreibung |
|--------|-----|-----------|-------------|
| RDTS-701 | [ARCH] | 🟥 MUSS | SBOM wird bei jedem Release-Build via syft erzeugt |
| RDTS-702 | [ARCH] | 🟥 MUSS | SBOM umfasst alle direkten und transitiven Abhängigkeiten |
| RDTS-703 | [ARCH] | 🟥 MUSS | SBOM wird dem Release zugeordnet und archiviert |
| RDTS-704 | [ARCH] | 🟥 MUSS | SBOM-Format: CycloneDX 1.4+ oder SPDX 2.3+ |
