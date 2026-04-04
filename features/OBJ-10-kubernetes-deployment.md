# OBJ-10: Kubernetes Deployment

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-04

## Dependencies
- OBJ-3: REST API (API muss vorhanden sein, bevor das Deployment vollständig getestet werden kann)
- OBJ-1: CI/CD Pipeline (Pipeline baut und pusht das Container-Image)

## User Stories
- Als Platform Engineer möchte ich die DNS-Konfigurations-App mit einem einzigen `kubectl apply` in einem Kubernetes-Cluster deployen, damit ich keine manuelle Installation durchführen muss.
- Als Mission Network Operator möchte ich, dass die App in einer airgapped Umgebung ohne externen Registry-Zugriff läuft, damit der Betrieb auch ohne Internetverbindung möglich ist.
- Als Platform Engineer möchte ich alle K8s-Ressourcen deklarativ und versioniert im Repository vorfinden, damit der Deploymentstand jederzeit nachvollziehbar ist.
- Als Platform Engineer möchte ich die App in einen definierten Namespace deployen können, damit sie sauber von anderen Workloads getrennt ist.
- Als Operator möchte ich, dass die App nach einem Pod-Neustart automatisch wieder verfügbar ist, damit kein manueller Eingriff nötig ist.

## Acceptance Criteria
- [ ] K8s-Manifest für Deployment (mind. 2 Replicas, Liveness/Readiness Probes) vorhanden
- [ ] K8s-Manifest für Service (ClusterIP, ggf. NodePort für lokalen Betrieb) vorhanden
- [ ] K8s-Manifest für Ingress (mit konfigurierbarem Hostname) vorhanden
- [ ] K8s-Manifest für ConfigMap (App-Konfiguration ohne Secrets) vorhanden
- [ ] Container-Image enthält alle Assets; kein Pull aus externen Registries zur Laufzeit
- [ ] Namespace-Manifest vorhanden, Name konfigurierbar (default: `dns-config`)
- [ ] Ressourcenlimits (CPU/Memory requests und limits) definiert
- [ ] App ist nach `kubectl apply -f k8s/` vollständig betriebsbereit
- [ ] Pod-Neustart ohne Datenverlust (stateless Design)
- [ ] Alle Manifeste sind mit `kubectl --dry-run=client` validierbar

## Edge Cases
- Was passiert bei einem Namespace-Konflikt? → Namespace-Manifest ist idempotent
- Was wenn kein Ingress-Controller vorhanden ist? → Service kann alternativ als NodePort betrieben werden
- Was wenn das lokale Container-Image nicht gefunden wird? → Klare Fehlermeldung mit Anleitung zum lokalen Image-Load
- Was wenn Ressourcenlimits zu knapp gesetzt sind? → OOM-Kill führt zu Pod-Neustart; Richtwerte sind dokumentiert und anpassbar
- Was wenn der Cluster keine Ingress-Klasse hat? → Ingress-Klasse ist konfigurierbar; Fallback auf NodePort dokumentiert

## Technical Requirements
- Kubernetes-Version: ≥ 1.28
- Manifeste liegen unter `k8s/` im Repository (Kustomize-Struktur: `k8s/base/`, `k8s/overlays/`)
- Container-Image muss airgapped ladbar sein (tar-Export / lokale Registry)
- Kein Zugriff auf externe Quellen (CDN, npm, etc.) zur Laufzeit des Containers

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
