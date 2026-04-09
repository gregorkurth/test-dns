# OBJ-13: Kubernetes Operator

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-10: Kubernetes Deployment (App muss im Cluster laufen)
- OBJ-3: REST API (Operator kommuniziert mit der App-API)
- OBJ-12: Security & Authentifizierung (Operator benötigt Auth-Konzept)

## User Stories
- Als Platform Engineer möchte ich DNS-Konfigurationen als Kubernetes Custom Resources definieren, damit ich sie deklarativ und versioniert verwalten kann.
- Als Platform Engineer möchte ich, dass der Operator den aktuellen Zustand einer DNS-Konfiguration im Status-Feld der CR widerspiegelt, damit ich den Betriebsstatus auf einen Blick sehe.
- Als Mission Network Operator möchte ich eine Konfigurationsänderung durch ein `kubectl apply` auslösen können, ohne manuell in die Web GUI einzugreifen.
- Als Platform Engineer möchte ich, dass der Operator bei einem Fehler in der Konfiguration eine klare Fehlermeldung im CR-Status hinterlässt.
- Als Platform Engineer möchte ich, dass der Operator idempotent ist, damit mehrfaches Anwenden desselben Manifests keinen ungewollten Effekt hat.

## Acceptance Criteria
- [ ] CRD `DNSConfiguration` (Gruppe: `dns.fmn.mil`, Version: `v1alpha1`) ist definiert und im Cluster installierbar
- [ ] Operator reagiert auf Create/Update/Delete von `DNSConfiguration`-Ressourcen
- [ ] Status-Subressource zeigt: `phase` (Pending / Applied / Error), `message`, `lastUpdated`
- [ ] Operator ruft beim Reconcile die App-API auf (OBJ-3) und überträgt die Konfiguration
- [ ] Bei Fehler: Status `phase: Error` mit Fehlermeldung gesetzt; kein Crash-Loop
- [ ] Operator ist idempotent: mehrfaches Reconcile ohne Seiteneffekte
- [ ] RBAC-Manifest für den Operator-ServiceAccount liegt im Repository
- [ ] Operator-Image ist airgapped ladbar (kein Pull zur Laufzeit)
- [ ] Operator läuft als eigener Deployment im Namespace `dns-config-system`
- [ ] Falls ein eigener Operator benoetigt ist, ist er in Go (controller-runtime/kubebuilder) implementiert

## Edge Cases
- Was passiert wenn die App-API nicht erreichbar ist? → Operator setzt Status `Error`, exponentielles Retry-Backoff, kein Crash
- Was wenn eine CR mit einer ungültigen DNS-Konfiguration angelegt wird? → Validierung via Admission Webhook oder in Reconcile
- Was wenn der Operator während eines Reconcile-Zyklus neu gestartet wird? → Idempotentes Reconcile stellt korrekten Endzustand wieder her
- Was wenn zwei CRs dieselbe Zone definieren? → Konflikt im Status beider CRs vermerkt; erste CR bleibt aktiv

## Technical Requirements
- Implementierungssprache: Go ist verpflichtend, wenn ein eigener Operator umgesetzt wird (controller-runtime / kubebuilder)
- CRD-Schemadefinition mittels kubebuilder-Markers, generierter OpenAPI-Validierung
- Operator-Manifest unter `operator/` im Repository (Deployment, RBAC, CRD)
- Unit-Tests für Reconcile-Logik vorhanden
- Kubernetes-Version: ≥ 1.28

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
