# Capability: GitOps / Argo CD

> **Capability ID:** CAP-009
> **NATO C3 Taxonomie:** Communication and Information Services > Platform Services > GitOps
> **FMN-Referenz:** App-Template-Anweisung (intern)
> **Maturität:** L0 – Idea (Stand: 2026-04-03)

---

## Beschreibung

Die GitOps-Capability stellt sicher, dass die App deklarativ via Argo CD im App-of-Apps-Modell installiert werden kann. Alle Argo-CD-Ressourcen (Application, AppProject, ApplicationSet) liegen versioniert im Repository. Die Capability unterstuetzt die kontrollierte Synchronisation von Konfigurationsaenderungen in Ziel-Kubernetes-Umgebungen und die Trennung von Release- und Konfigurationsquellen in Gitea.

---

## Services

| ID | Service | Beschreibung | Spec |
|----|---------|-------------|------|
| SVC-GIT-ARGOCD | Argo CD Installation | App-of-Apps-Struktur, Root-Application, AppProject | [README](services/argocd-installation/README.md) |

---

## Service Functions

| SFN-ID | Service Function | Service | Quelle |
|--------|-----------------|---------|--------|
| SFN-GIT-001 | App-of-Apps-Struktur | SVC-GIT-ARGOCD | [ARCH] |
| SFN-GIT-002 | Sync Management | SVC-GIT-ARGOCD | [ARCH] |

---

## Abhängigkeiten

| DPD-ID | Abhängigkeit | Typ | Beschreibung |
|--------|-------------|-----|-------------|
| DPD-GIT-001 | CAP-002 Kubernetes Platform | Voraussetzung | Argo CD läuft auf Kubernetes |
| DPD-GIT-002 | CAP-008 Offline Delivery | Nutzer | Argo-CD-Definitionen im Zarf-Paket |
| DPD-GIT-003 | OBJ-21 GitOps / Argo CD | Feature | Feature-Spezifikation für Argo CD |

---

## Links

- [Maturity Status](maturity.md)
- [Products & Licenses](products.md)
- [App-Template-Anweisung](../../req-init/app-template.md)
