# RDTS-207: CRD DNSConfiguration definiert und installierbar

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-207 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟥 MUSS (SHALL) |
| **Service Function** | SFN-K8S-003 – CRD Definition |
| **Quelldokument** | App-Template-Anweisung |
| **Seite** | – |
| **Kapitel** | 4. Kubernetes Operator |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Eine Custom Resource Definition `DNSConfiguration` (Gruppe: `dns.fmn.mil`, Version: `v1alpha1`) muss definiert und im Cluster installierbar sein.

## Anforderungstext (Erläuterung)

Die CRD ermöglicht es, DNS-Konfigurationen als Kubernetes-native Ressourcen zu verwalten. Sie wird via `kubectl apply -f operator/crd.yaml` installiert.

---

## Akzeptanzkriterien

1. CRD-Manifest unter `operator/crd.yaml` vorhanden
2. `kubectl apply -f operator/crd.yaml` installiert die CRD fehlerfrei
3. `kubectl get dnsconfiguration` funktioniert nach Installation
4. CRD-Schema enthält Spec-Felder für DNS-Konfiguration (Participants, Zones)

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-207-001](../tests/auto/TEST-RDTS-207-001.md) | Automatisch (pytest) |
| [TEST-RDTS-207-001-manual](../tests/manual/TEST-RDTS-207-001-manual.md) | Manuell |
