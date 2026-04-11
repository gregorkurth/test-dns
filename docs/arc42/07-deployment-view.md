# arc42 Kapitel 7: Verteilungssicht

## Zweck

Hier wird beschrieben, wo die Applikation laeuft und wie sie verteilt wird.

## Was hier hinein gehoert

- lokale Entwicklung
- Kubernetes
- Helm Charts
- GitOps
- Registry
- Zarf-Paket
- Zielumgebung
- Offline-Transfer

## Helm-Deploymentfluss (OBJ-25)

1. Chart lokal/offline validieren (`helm lint`, `helm template`) fuer local/internal/prod.
2. Installation/Upgrade via `helm upgrade --install`.
3. Rollback via `helm history` + `helm rollback`.
4. Chart als OCI-Artefakt paketieren/pushen (`helm package`, `helm push`) in Harbor-kompatible Registry.
5. Airgap-Transport und GitOps-Import bauen auf demselben OCI-Chart-Artefakt auf.
6. Laufender Release-Status wird ueber `/api/v1/helm/status` und `/helm` transparent gemacht.

### Profile

- `values-local.yaml`: Entwickler-/Labprofil, Debug erlaubt.
- `values-internal.yaml`: internes Integrationsprofil.
- `values-prod.yaml`: produktive Defaults (TLS-Pflicht, kein Debug, limitierte Ressourcen).

## Wann pflegen?

- bei neuen Deployment-Varianten
- bei Registry-, GitOps- oder K8s-Aenderungen
- bei Aenderungen im Offline-Transfer

## Quelle im Repo

- `features/OBJ-10-kubernetes-deployment.md`
- `features/OBJ-25-helm-charts.md`
- `features/OBJ-18-artefakt-registry.md`
- `features/OBJ-19-zarf-paket-offline-weitergabe.md`
- `features/OBJ-20-zielumgebung-import-rehydrierung.md`
- `features/OBJ-21-gitops-argocd.md`
