# RDTS-208: Status-Subresource mit Phase, Message, LastUpdated

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-208 |
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

> Die CRD muss eine Status-Subresource bereitstellen mit den Feldern: `phase` (Pending/Applied/Error), `message` (Fehlerbeschreibung), `lastUpdated` (Zeitstempel).

## Anforderungstext (Erläuterung)

Der Status ermöglicht es, den aktuellen Zustand einer DNS-Konfiguration via `kubectl get dnsconfiguration` einzusehen.

---

## Akzeptanzkriterien

1. Status-Subresource ist in der CRD aktiviert
2. Felder `phase`, `message`, `lastUpdated` sind definiert
3. `kubectl get dnsconfiguration -o wide` zeigt Phase-Spalte
4. Operator kann Status unabhängig von Spec aktualisieren

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-208-001](../tests/auto/TEST-RDTS-208-001.md) | Automatisch (pytest) |
| [TEST-RDTS-208-001-manual](../tests/manual/TEST-RDTS-208-001-manual.md) | Manuell |
