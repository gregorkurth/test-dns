# Capability: Kubernetes Platform

> **Capability ID:** CAP-002
> **NATO C3 Taxonomie:** Communication and Information Services > Platform Services
> **FMN-Referenz:** App-Template-Anweisung (intern)
> **Maturität:** L0 – Idea (Stand: 2026-04-03)

---

## Beschreibung

Die Kubernetes-Platform-Capability stellt sicher, dass die DNS-Konfigurations-App als Cloud-native Applikation auf Kubernetes betrieben werden kann. Sie umfasst deklarative Deployment-Manifeste, einen Kubernetes Operator mit CRD-basierter Steuerung und eine standardisierte Namespace-Struktur. Fuer extern bereitgestellte DNS-Services umfasst sie zusaetzlich Cilium-basierte North-South-Ingress-/Egress-Regeln gemaess FMN/NATO-Vorgaben inkl. Kommunikationsmatrix und Nachweisfuehrung. Alle Artefakte müssen airgapped-fähig sein.

---

## Services

| ID | Service | Beschreibung | Spec |
|----|---------|-------------|------|
| SVC-K8S-DEPLOY | Kubernetes Deployment | Deklaratives Deployment der App auf Kubernetes | [README](services/kubernetes-deployment/README.md) |
| SVC-K8S-OPERATOR | Kubernetes Operator | CRD-basierte Steuerung der DNS-Konfiguration | [README](services/kubernetes-operator/README.md) |
| SVC-K8S-STORAGE | Storage Management | Rook-Ceph-Storage-Profile (Block/File/S3) mit Local-Fallback | [README](services/kubernetes-storage/README.md) |

---

## Service Functions

| SFN-ID | Service Function | Service | Quelle |
|--------|-----------------|---------|--------|
| SFN-K8S-001 | Container Packaging | SVC-K8S-DEPLOY | [ARCH] |
| SFN-K8S-002 | Manifest Management | SVC-K8S-DEPLOY | [ARCH] |
| SFN-K8S-003 | CRD Definition | SVC-K8S-OPERATOR | [ARCH] |
| SFN-K8S-004 | Reconciliation Loop | SVC-K8S-OPERATOR | [ARCH] |
| SFN-K8S-005 | Scheduled Test Execution | SVC-K8S-OPERATOR | [ARCH] |
| SFN-K8S-006 | Storage Profile Config | SVC-K8S-STORAGE | [ARCH] |
| SFN-K8S-007 | Ceph Block Storage | SVC-K8S-STORAGE | [ARCH] |
| SFN-K8S-008 | Ceph File/CIFS Storage | SVC-K8S-STORAGE | [ARCH] |
| SFN-K8S-009 | Ceph S3 Object Storage | SVC-K8S-STORAGE | [ARCH] |
| SFN-K8S-010 | Local Storage Fallback | SVC-K8S-STORAGE | [ARCH] |

---

## Abhängigkeiten

| DPD-ID | Abhängigkeit | Typ | Beschreibung |
|--------|-------------|-----|-------------|
| DPD-K8S-001 | CAP-001 Domain Naming | Voraussetzung | App-Funktionalität muss vorhanden sein |
| DPD-K8S-002 | CAP-005 DevOps | Nutzer | CI/CD Pipeline baut Container-Images |

---

## Konfiguration

| Parameter | Wert | Quelle |
|-----------|------|--------|
| Kubernetes Version | ≥ 1.28 | [ARCH] |
| Namespace | `dns-config` (konfigurierbar) | [ARCH] |
| Image-Registry | Lokal / Harbor (airgapped) | [ARCH] |

---

## Links

- [Maturity Status](maturity.md)
- [Products & Licenses](products.md)
- [App-Template-Anweisung](../../req-init/app-template.md)
