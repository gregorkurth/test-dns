# RDTS-204: Deployment-Manifest mit Probes und Ressourcenlimits

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-204 |
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

> Ein Kubernetes Deployment-Manifest muss vorhanden sein mit mindestens 2 Replicas, Liveness/Readiness Probes und definierten Ressourcenlimits (CPU/Memory requests und limits).

## Anforderungstext (Erläuterung)

Das Deployment-Manifest definiert die Pod-Spezifikation inklusive Health-Checks und Ressourcensteuerung für stabilen Betrieb.

---

## Akzeptanzkriterien

1. Deployment-Manifest definiert `replicas: 2` (konfigurierbar)
2. Liveness Probe auf `/api/health` konfiguriert
3. Readiness Probe auf `/api/ready` konfiguriert
4. CPU/Memory requests und limits definiert
5. `kubectl apply` ist idempotent

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-204-001](../tests/auto/TEST-RDTS-204-001.md) | Automatisch (pytest) |
| [TEST-RDTS-204-001-manual](../tests/manual/TEST-RDTS-204-001-manual.md) | Manuell |
