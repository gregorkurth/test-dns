# Maturitätsstatus – Kubernetes Platform

> Maturitätslevel gemäss internem Framework (L0–L5).

## Level-Definitionen

| Level | Name | Kriterien | Nachweis |
|-------|------|-----------|---------|
| **L0** | Idea | Konzept dokumentiert, SVC vorhanden | docs/SVC.md, Capability README |
| **L1** | PoC | Lokaler K8s-Cluster (kind/minikube), App startet als Pod | Deployment-Manifest, kubectl-Ausgabe |
| **L2** | Functional Prototype | Alle Manifeste (Deployment, Service, Ingress, ConfigMap) funktional | Test in Testcluster, alle Pods running |
| **L3** | Platform Ready | Kustomize-Overlays, Operator-CRD installierbar, GitOps-ready | CI-Pipeline deployt, Operator reconcilt |
| **L4** | Mission Ready | Airgapped-validiert, Ressourcenlimits getestet, HA-fähig | Airgapped-Testbericht, Load-Test |
| **L5** | Federated Ready | Multi-Cluster-fähig, FMN-Namespace-Konventionen eingehalten | FMN-Interoperabilitätstest |

## Aktueller Status

```
L0 [✓] IDEA           2026-04-03  SVC + Capability-Struktur erstellt
L1 [ ] POC             -          Ausstehend
L2 [ ] FUNCTIONAL      -          Ausstehend
L3 [ ] PLATFORM READY  -          Ausstehend
L4 [ ] MISSION READY   -          Ausstehend
L5 [ ] FEDERATED READY -          Ausstehend
```

## L0 → L1 (PoC) Checkliste

- [ ] Dockerfile für die Next.js-App erstellt
- [ ] Container-Image baut lokal erfolgreich
- [ ] Deployment-Manifest erstellt, Pod startet in kind/minikube
- [ ] Service-Manifest erstellt, App ist über ClusterIP erreichbar

## L1 → L2 (Functional Prototype) Checkliste

- [ ] Ingress-Manifest mit konfigurierbarem Hostname
- [ ] ConfigMap für App-Konfiguration
- [ ] Namespace-Manifest vorhanden
- [ ] Ressourcenlimits (CPU/Memory) definiert
- [ ] Liveness/Readiness Probes konfiguriert
- [ ] `kubectl apply -f k8s/` deployt vollständig

## L2 → L3 (Platform Ready) Checkliste

- [ ] Kustomize-Struktur (base + overlays) implementiert
- [ ] Operator-CRD definiert und installierbar
- [ ] Operator-Deployment im Cluster lauffähig
- [ ] Reconciliation-Loop funktional
- [ ] RBAC für Operator-ServiceAccount konfiguriert

## L3 → L4 (Mission Ready) Checkliste

- [ ] Airgapped-Deployment getestet (kein externer Pull)
- [ ] Container-Image als tar exportierbar und ladbar
- [ ] Ressourcenlimits unter Last validiert
- [ ] Pod-Neustart ohne Datenverlust bestätigt
- [ ] Security-Context (non-root, read-only filesystem) gesetzt

## L4 → L5 (Federated Ready) Checkliste

- [ ] Namespace-Konventionen gemäss FMN-Vorgaben
- [ ] Multi-Cluster-Deployment dokumentiert
- [ ] FMN-Interoperabilitätstest bestanden

## Maturitäts-Badge

```markdown
![Maturity](https://img.shields.io/badge/Maturity-L0%20Idea-lightgrey)
```
