# GitOps Bootstrap

Diese Prozedur ist fuer eine Zielumgebung ohne Internetzugang gedacht.

## 1. Vorbedingungen pruefen

- `kubectl` ist mit dem Zielcluster verbunden.
- `argocd` CLI ist lokal verfuegbar.
- Beide Gitea-Repositories wurden bereits importiert:
  - `dns-release`
  - `dns-config`

Pruefung:

```bash
./gitops/bootstrap/bootstrap.sh --check-only
```

## 2. AppProject anlegen

```bash
kubectl apply -f gitops/argocd/bootstrap-resources/appproject.yaml
```

Danach pruefen:

```bash
kubectl get appproject dns-management -n argocd
```

## 3. Root-Application anlegen

```bash
kubectl apply -f gitops/argocd/root-application.yaml
```

Danach pruefen:

```bash
kubectl get applications.argoproj.io dns-management-root -n argocd
```

## 4. Initialen Sync ausloesen

Der Standard ist ein manueller Sync, damit in der Zielumgebung keine
unbeabsichtigten Rollbacks oder automatische Reconcile-Loops starten.

```bash
argocd app sync dns-management-root --grpc-web
argocd app wait dns-management-root --health --sync --grpc-web
```

## 5. Health-Nachweis sichern

Nur Child-Applications mit `Healthy` gelten als deployed-ready.
`Progressing`, `Degraded` und `Missing` muessen vor einem Release-Freigabeschritt
sichtbar bleiben.

Pruefung:

```bash
argocd app get dns-management-root --grpc-web
curl -s http://localhost:3000/api/v1/gitops
```

## Hinweise fuer aeltere Argo-CD-Versionen

Wenn `ApplicationSet` in der Zielumgebung nicht verfuegbar ist, koennen die
Fallback-Applications unter `gitops/argocd/applications/` einzeln angewendet
werden.
