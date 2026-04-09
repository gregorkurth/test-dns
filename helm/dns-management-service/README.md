# Helm Chart: DNS Management Service

Dieses Chart liefert die standardisierte Helm-Installation fuer den DNS Management Service.

## Struktur

- `Chart.yaml`: Chart-Metadaten und Version
- `values.yaml`: sichere Default-Werte
- `values-local.yaml`: lokales Profil (NodePort, lokales Image)
- `values-internal.yaml`: internes Clusterprofil
- `templates/`: Kubernetes- und Cilium-Ressourcen

## Schnellstart

```bash
helm lint helm/dns-management-service
helm template dns-management-service helm/dns-management-service -f helm/dns-management-service/values.yaml
```

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

Rollback:

```bash
helm history dns-management-service
helm rollback dns-management-service <revision>
```

## Security-Hinweise

- Secure Defaults sind aktiv (non-root, read-only root filesystem, dropped capabilities).
- Cilium-Policies werden mit ausgerollt und folgen Default-Deny + explizitem Allow.
- mTLS-/OPA-Hinweise sind als Annotations/Labels enthalten und fuer den Zielcluster zu erzwingen.
