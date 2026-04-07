# Service: Kubernetes Deployment

> **Service ID:** SVC-K8S-DEPLOY
> **Capability:** Kubernetes Platform (CAP-002)
> **Quelldokument:** App-Template-Anweisung, Abschnitt 2 (Kubernetes als Zielplattform)

---

## Beschreibung

Der Kubernetes Deployment Service stellt sicher, dass die DNS-Konfigurations-App als Container-Workload auf Kubernetes deployt werden kann. Alle Manifeste (Deployment, Service, Ingress, ConfigMap) liegen deklarativ und versioniert im Repository. Der Service unterstützt airgapped-Deployment ohne externe Registry-Zugriffe zur Laufzeit.

---

## Service Functions

| ID | Service Function | Beschreibung | Requirements | Tests |
|----|-----------------|-------------|-------------|-------|
| SFN-K8S-001 | Container Packaging | Multi-Stage Dockerfile, airgapped Image | [Requirements](service-functions/SFN-K8S-001-container-packaging/README.md) | 3 Auto, 3 Manuell |
| SFN-K8S-002 | Manifest Management | K8s-Manifeste (Deployment, Service, Ingress, ConfigMap, Namespace) | [Requirements](service-functions/SFN-K8S-002-manifest-management/README.md) | 3 Auto, 3 Manuell |

---

## Produkte

| Produkt | Version | Lizenz |
|---------|---------|--------|
| Kubernetes | ≥ 1.28 | Apache 2.0 |
| Docker | ≥ 24.0 | Apache 2.0 |
| Kustomize | ≥ 5.0 | Apache 2.0 |

---

## Abhängigkeiten

| Von | Nach | Typ | Beschreibung |
|-----|------|-----|-------------|
| SVC-K8S-DEPLOY | CAP-001 | Voraussetzung | App muss gebaut sein, bevor Container erstellt werden kann |
| SVC-K8S-DEPLOY | SVC-CICD | Nutzer | CI/CD Pipeline nutzt Deployment-Manifeste |

---

## Quelldokumente

- App-Template-Anweisung (req-init/app-template.md), Abschnitt 2: Kubernetes als Zielplattform
- Feature-Spec OBJ-10: Kubernetes Deployment
