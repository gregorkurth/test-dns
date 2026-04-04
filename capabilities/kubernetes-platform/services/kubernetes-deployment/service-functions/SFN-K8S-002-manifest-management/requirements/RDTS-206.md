# RDTS-206: ConfigMap für App-Konfiguration

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-206 |
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

> Eine Kubernetes ConfigMap muss alle nicht-sensiblen Konfigurationsparameter der App enthalten. Secrets dürfen nicht in der ConfigMap gespeichert werden.

## Anforderungstext (Erläuterung)

Die ConfigMap enthält Konfiguration wie App-Name, Ingress-Hostname, OTel-Endpoint, Log-Level etc. Secrets (TSIG-Keys, OIDC-Credentials) werden als K8s Secret verwaltet.

---

## Akzeptanzkriterien

1. ConfigMap-Manifest vorhanden mit App-relevanten Parametern
2. Keine Secrets (Passwörter, Keys, Tokens) in der ConfigMap
3. Deployment referenziert ConfigMap via `envFrom` oder `volumes`
4. Änderung der ConfigMap erfordert Pod-Neustart (dokumentiert)

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-206-001](../tests/auto/TEST-RDTS-206-001.md) | Automatisch (pytest) |
| [TEST-RDTS-206-001-manual](../tests/manual/TEST-RDTS-206-001-manual.md) | Manuell |
