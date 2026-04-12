# Deployment Guide: On-Prem Kubernetes

Diese Anleitung ist der verbindliche Deploy-Pfad fuer dieses Repository.

Wichtige Regel:
- Kein Deployment nach Vercel.
- Ziel ist immer eine eigene On-Prem-Kubernetes-Umgebung.
- Test- und Integrationsstufe darf auf Docker-basiertem Kubernetes laufen.

## Deployment-Modelle

### 1. Gesamtes Service-Deployment
Nutzen, wenn mehrere Features gemeinsam als Release ausgerollt werden.

### 2. Pro-Feature-Deployment
Nutzen, wenn ein einzelnes OBJ ausgerollt wird (z. B. OBJ-25, OBJ-26).
Die Aktivierung erfolgt ueber GitOps-Revision, Overlay/Values oder Feature-Flag.

## Umgebungen

### A) Local Test/Integration (Docker-basiert)
Ziel: schnelle technische Abnahme vor On-Prem.

Optionen:
- Docker Desktop Kubernetes
- `kind` oder `k3d` (falls Docker Desktop Kubernetes nicht verfuegbar ist)

Minimaler Ablauf:
```bash
kubectl config current-context
kubectl cluster-info
npm run lint
npm run test:run
npm run build
```

Danach Deploy mit lokalem Profil (Beispiele):
```bash
helm upgrade --install dns-management-service helm/dns-management-service \
  -f helm/dns-management-service/values.yaml \
  -f helm/dns-management-service/values-local.yaml
```

Oder Kustomize:
```bash
kubectl apply -k k8s/overlays/local
```

### B) On-Prem Integration/Staging
Ziel: realistische Betriebspruefung im internen Cluster.

### C) On-Prem Production
Ziel: freigegebener Betriebsstand.

## Standard-Deploy-Ablauf (GitOps-first)

1. QA-Freigabe bestaetigen (`/qa` abgeschlossen, keine Critical/High Bugs).
2. Artefakte bauen (OCI-konform, Digest-basiert).
3. Release-Projekt und Konfigurationsprojekt aktualisieren.
4. Optional: Zarf-Paket fuer Offline-Transport bauen und importieren.
5. Argo CD App-of-Apps synchronisieren.
6. Smoke-Test auf Zielumgebung ausfuehren.
7. Deployment-Nachweis in Feature-Spec und Release-Doku nachziehen.

## Smoke-Test (Muss)

```bash
kubectl get pods -n <namespace>
kubectl rollout status deploy/<app-name> -n <namespace>
curl -sS http://<service-or-ingress>/api/v1
```

Zusatz je nach OBJ:
- `npm run check:obj10`
- `npm run check:obj11`
- `npm run check:obj14`
- `npm run check:obj17`

## Offline-Pfad

Wenn Zielumgebung getrennt ist:
1. Zarf-Paket bauen (`docs/zarf.md`)
2. Paket + Nachweise transferieren
3. In Zielumgebung importieren (`docs/offline-install.md`)
4. Argo CD syncen

## Nachweispflicht

Pro Deployment (gesamt oder pro Feature) muessen dokumentiert sein:
- Umgebung (`local-docker-k8s`, `integration`, `onprem-prod`)
- Namespace
- Argo Application oder Helm Release
- Image-Digest
- Datum/Zeit
- Ergebnis Smoke-Test
- Rollback-Referenz

## Rollback

1. Argo CD auf letzte stabile Revision zuruecksetzen
2. Oder Helm-Rollback:
```bash
helm history <release> -n <namespace>
helm rollback <release> <revision> -n <namespace>
```
3. Rollback im Feature und Release-Log dokumentieren

