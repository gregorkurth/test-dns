# Requirement: RDTS-707

> **Typ:** [ARCH] Architektur-Anforderung
> **Priorität:** 🟥 MUSS
> **Service Function:** SFN-SCS-003 – Container & Config Scan
> **Capability:** CAP-007 Supply Chain Security

## Anforderungstext

Container-CVE-Scan via trivy image laeuft bei Release-Builds. Der Scan umfasst explizit das verwendete Runtime-Base-Image (inkl. Digest) und prueft, ob ein freigegebenes gehaertetes Minimal-Base-Image eingesetzt wird.

## Verknüpfte Features

- OBJ-17: SBOM & Security-Scanning
- OBJ-14: Release Management
