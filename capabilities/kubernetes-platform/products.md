# Products & Lizenzen – Kubernetes Platform

> Mapping: Service Functions → Produkte → Lizenzen
> Quellen: App-Template-Anweisung

---

## Produkt-Matrix

| Produkt | Version | Service Function | Lizenz | Lizenzart | Open Source | Anmerkung |
|---------|---------|-----------------|--------|-----------|-------------|-----------|
| **Kubernetes** | ≥ 1.28 | SFN-K8S-001, SFN-K8S-002 | Apache 2.0 | Open Source | Ja | Zielplattform |
| **Kustomize** | ≥ 5.0 | SFN-K8S-002 | Apache 2.0 | Open Source | Ja | Manifest-Management |
| **kubebuilder** | ≥ 3.0 | SFN-K8S-003, SFN-K8S-004 | Apache 2.0 | Open Source | Ja | Operator-Framework |
| **Docker** | ≥ 24.0 | SFN-K8S-001 | Apache 2.0 | Open Source | Ja | Container-Build |

---

## Lizenz-Zusammenfassung

| Lizenzart | Produkte | Anforderungen |
|-----------|---------|---------------|
| **Apache 2.0** | Kubernetes, Kustomize, kubebuilder, Docker | Keine besonderen Einschränkungen |

---

## Airgapped-Anforderungen

Alle Produkte müssen als Container-Images in der lokalen Registry vorliegen:

```
harbor.local/kubernetes-platform/dns-config-app:latest
harbor.local/kubernetes-platform/dns-config-operator:latest
```

> **Annahme**: Das Harbor-Registry ist unter `harbor.local` erreichbar und wurde durch den Plattform-Operator befüllt.

---

*Zuletzt aktualisiert: 2026-04-03*
