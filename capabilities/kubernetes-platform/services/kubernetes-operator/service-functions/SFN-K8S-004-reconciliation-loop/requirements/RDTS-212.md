# RDTS-212: RBAC für Operator-ServiceAccount

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-212 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟥 MUSS (SHALL) |
| **Service Function** | SFN-K8S-004 – Reconciliation Loop |
| **Quelldokument** | App-Template-Anweisung |
| **Seite** | – |
| **Kapitel** | 4. Kubernetes Operator |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Der Operator muss mit einem dedizierten ServiceAccount laufen, der über RBAC nur die minimal notwendigen Berechtigungen (Least Privilege) für DNSConfiguration-Ressourcen besitzt.

---

## Akzeptanzkriterien

1. ServiceAccount-Manifest für den Operator vorhanden
2. ClusterRole/Role mit minimalen Berechtigungen (get, list, watch, update auf DNSConfiguration)
3. RoleBinding/ClusterRoleBinding verknüpft ServiceAccount und Role
4. Operator kann keine anderen Ressourcen ausserhalb seiner Rolle modifizieren

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-212-001](../tests/auto/TEST-RDTS-212-001.md) | Automatisch (pytest) |
| [TEST-RDTS-212-001-manual](../tests/manual/TEST-RDTS-212-001-manual.md) | Manuell |
