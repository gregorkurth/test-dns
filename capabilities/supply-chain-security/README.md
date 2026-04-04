# Capability: Supply Chain Security

> **Capability ID:** CAP-007
> **NATO C3 Taxonomie:** Communication and Information Services > Security Services > Supply Chain Security
> **FMN-Referenz:** App-Template-Anweisung v3 (intern)
> **Maturität:** L0 – Idea (Stand: 2026-04-03)

---

## Beschreibung

Die Supply-Chain-Security-Capability stellt sicher, dass für jede releasefähige Version eine SBOM (Software Bill of Materials) erzeugt wird, automatisierte Security-Scans auf Code-, Dependency-, Container- und Konfigurations-Ebene durchgeführt werden und der tatsächlich erzeugte Veröffentlichungsinhalt vor der Freigabe geprüft wird. Security-Ergebnisse und Artefaktprüfungen werden versionsbezogen archiviert; kritische Findings oder Policy-Verstösse blockieren die Freigabe.

---

## Services

| ID | Service | Beschreibung | Spec |
|----|---------|-------------|------|
| SVC-SCS-SBOM | SBOM Generation | Erzeugung und Archivierung der Software Bill of Materials | [README](services/sbom-generation/README.md) |
| SVC-SCS-SCAN | Security Scanning | SAST, SCA, Container-CVE und Konfigurationsscan | [README](services/security-scanning/README.md) |

---

## Service Functions

| SFN-ID | Service Function | Service | Quelle |
|--------|-----------------|---------|--------|
| SFN-SCS-001 | SBOM Creation & Archivierung | SVC-SCS-SBOM | [ARCH] |
| SFN-SCS-002 | SAST & SCA Scan | SVC-SCS-SCAN | [ARCH] |
| SFN-SCS-003 | Container & Config Scan | SVC-SCS-SCAN | [ARCH] |
| SFN-SCS-004 | Release Artifact Audit | SVC-SCS-SCAN | [ARCH] |

---

## Abhängigkeiten

| DPD-ID | Abhängigkeit | Typ | Beschreibung |
|--------|-------------|-----|-------------|
| DPD-SCS-001 | CAP-005 DevOps | Voraussetzung | Pipeline erzeugt SBOM und führt Scans durch |
| DPD-SCS-002 | OBJ-14 Release Management | Nutzer | SBOM und Scan-Ergebnisse sind Pflichtbestandteile des Releases |
| DPD-SCS-003 | OBJ-18 Artefakt-Registry | Nutzer | Scan-Ergebnisse werden in Registry archiviert |
| DPD-SCS-004 | OBJ-22 Release-Artefaktprüfung / Publish-Gate | Feature | Prüfung des finalen Veröffentlichungsinhalts |

---

## Links

- [Maturity Status](maturity.md)
- [Products & Licenses](products.md)
- [App-Template-Anweisung v3](../../req-init/app-template-3.md)
