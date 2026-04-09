# RDTS-214: Cilium North-South Ingress/Egress Default-Deny mit explizitem Allowlisting

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-214 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟥 MUSS (SHALL) |
| **Service Function** | SFN-K8S-002 – Manifest Management |
| **Quelldokument** | App-Template-Anweisung |
| **Kapitel** | 6. Security / Authentifizierung |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Fuer extern bereitgestellte Services (North-South Traffic) MUESSEN Ingress- und Egress-Regeln mit Cilium umgesetzt werden (Default-Deny, explizite Freigaben, nur notwendige Ports/Protokolle).

## Anforderungstext (Erläuterung)

Kubernetes-Manifeste enthalten CiliumNetworkPolicy oder CiliumClusterwideNetworkPolicy, die externe Ingress-/Egress-Flows standardmaessig blockieren und nur freigegebene CIDRs, Ports und Protokolle zulassen.

---

## Akzeptanzkriterien

1. Default-Deny fuer North-South Ingress und Egress ist aktiv
2. Externe Allow-Regeln sind explizit und minimal (CIDR, Port, Protokoll)
3. DNS-Freigaben sind auf fachlich notwendige DNS-Endpunkte begrenzt
4. Nicht freigegebene externe Flows werden blockiert

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-214-001](../tests/auto/TEST-RDTS-214-001.md) | Automatisch (pytest) |
| [TEST-RDTS-214-001-manual](../tests/manual/TEST-RDTS-214-001-manual.md) | Manuell |
