# Helm Chart: DNS Management Service

Dieses Chart liefert die standardisierte Helm-Installation fuer den DNS Management Service inkl.
offline-faehigen Checks und OCI Push Readiness.

## Struktur

- `Chart.yaml`: Chart-Metadaten und Version
- `values.yaml`: sichere Default-Werte
- `values-local.yaml`: lokales Profil (NodePort, lokales Image)
- `values-internal.yaml`: internes Clusterprofil
- `values-prod.yaml`: produktives Profil (TLS-Pflicht, kein Debug, enge Limits)
- `values.schema.json`: Schema-Validierung fuer Helm Values
- `templates/`: Kubernetes- und Cilium-Ressourcen

## Lokale / Offline Checks

```bash
helm lint helm/dns-management-service
helm template dns-management-service helm/dns-management-service -f helm/dns-management-service/values.yaml
```

Mit Profilen:

```bash
helm lint helm/dns-management-service \
  -f helm/dns-management-service/values.yaml \
  -f helm/dns-management-service/values-local.yaml --strict

helm lint helm/dns-management-service \
  -f helm/dns-management-service/values.yaml \
  -f helm/dns-management-service/values-internal.yaml --strict

helm lint helm/dns-management-service \
  -f helm/dns-management-service/values.yaml \
  -f helm/dns-management-service/values-prod.yaml --strict
```

## Install / Upgrade / Rollback

Lokaler Betrieb:

```bash
helm upgrade --install dns-management-service helm/dns-management-service \
  -f helm/dns-management-service/values.yaml \
  -f helm/dns-management-service/values-local.yaml
```

Interner Betrieb:

```bash
helm upgrade --install dns-management-service helm/dns-management-service \
  -f helm/dns-management-service/values.yaml \
  -f helm/dns-management-service/values-internal.yaml
```

Produktiver Betrieb:

```bash
helm upgrade --install dns-management-service helm/dns-management-service \
  -f helm/dns-management-service/values.yaml \
  -f helm/dns-management-service/values-prod.yaml
```

Rollback:

```bash
helm history dns-management-service
helm rollback dns-management-service <revision>
```

## OCI Push Readiness (Harbor-kompatibel)

Chart paketieren:

```bash
mkdir -p artifacts/charts
helm package helm/dns-management-service --destination artifacts/charts
```

Chart pushen:

```bash
helm push artifacts/charts/dns-management-service-<chart-version>.tgz \
  oci://harbor.internal/dns-management/charts
```

Hinweis:
- `Chart.yaml` Version muss semver-kompatibel sein.
- `values-prod.yaml` und `values.schema.json` muessen vorhanden sein.
- Offline-Checks (`helm lint` + `helm template`) muessen fuer local/internal/prod ohne Fehler laufen.

## Security-Hinweise

- Secure Defaults sind aktiv (non-root, read-only root filesystem, dropped capabilities).
- Produktivprofil erzwingt TLS-aktivierten Ingress mit Secret (`ingress.tls.enabled=true`).
- Cilium-Policies werden mit ausgerollt und folgen Default-Deny + explizitem Allow.
- mTLS-/OPA-Hinweise sind als Annotations/Labels enthalten und fuer den Zielcluster zu erzwingen.
