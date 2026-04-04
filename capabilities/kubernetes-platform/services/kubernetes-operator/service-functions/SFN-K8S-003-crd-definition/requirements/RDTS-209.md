# RDTS-209: OpenAPI-Validierung im CRD-Schema

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-209 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟧 SOLLTE (SHOULD) |
| **Service Function** | SFN-K8S-003 – CRD Definition |
| **Quelldokument** | App-Template-Anweisung |
| **Seite** | – |
| **Kapitel** | 4. Kubernetes Operator |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Das CRD-Schema soll OpenAPI-basierte Validierung enthalten, damit ungültige Ressourcen beim Erstellen/Aktualisieren abgelehnt werden.

## Anforderungstext (Erläuterung)

Via kubebuilder-Markers werden Validierungsregeln (Required-Felder, Enums, Patterns) direkt im CRD-Schema definiert.

---

## Akzeptanzkriterien

1. CRD enthält OpenAPI v3 Schema mit Validierungsregeln
2. Pflichtfelder sind als `required` markiert
3. `kubectl apply` mit ungültigem Manifest wird abgelehnt
4. Fehlermeldung benennt das ungültige Feld

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-209-001](../tests/auto/TEST-RDTS-209-001.md) | Automatisch (pytest) |
| [TEST-RDTS-209-001-manual](../tests/manual/TEST-RDTS-209-001-manual.md) | Manuell |
