# Service Function: SAST & SCA Scan (SFN-SCS-002)

> **Service:** SVC-SCS-SCAN – Security Scanning
> **Capability:** CAP-007 Supply Chain Security
> **Quelle:** [ARCH] Architektur-Anforderung

## Beschreibung

Führt Code-Analyse (SAST via semgrep) und Dependency-Scanning (SCA via trivy fs / npm audit) bei jedem CI-Build durch.

## Requirements

| Req-ID | Typ | Priorität |
|--------|-----|-----------|
| RDTS-705 | [ARCH] | 🟥 MUSS |
| RDTS-706 | [ARCH] | 🟥 MUSS |
