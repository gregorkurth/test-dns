# RDTS-205: Service- und Ingress-Manifest

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-205 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟥 MUSS (SHALL) |
| **Service Function** | SFN-K8S-002 – Manifest Management |
| **Quelldokument** | App-Template-Anweisung |
| **Seite** | – |
| **Kapitel** | 2. Kubernetes als Zielplattform |
| **Status** | Offen |

---

## Anforderungstext (Original)

> K8s-Manifeste für Service (ClusterIP, optional NodePort) und Ingress (mit konfigurierbarem Hostname) müssen vorhanden sein.

## Anforderungstext (Erläuterung)

Der Service exponiert die App innerhalb des Clusters. Der Ingress macht die App extern erreichbar mit konfigurierbarem Hostname und Ingress-Klasse.

---

## Akzeptanzkriterien

1. Service-Manifest mit ClusterIP vorhanden
2. Optional: NodePort-Variante für lokalen Betrieb ohne Ingress-Controller
3. Ingress-Manifest mit konfigurierbarem `host` und `ingressClassName`
4. Ingress unterstützt TLS-Termination (Verweis auf Secret)

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-205-001](../tests/auto/TEST-RDTS-205-001.md) | Automatisch (pytest) |
| [TEST-RDTS-205-001-manual](../tests/manual/TEST-RDTS-205-001-manual.md) | Manuell |
