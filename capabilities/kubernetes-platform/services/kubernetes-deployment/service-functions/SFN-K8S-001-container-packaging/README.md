# SFN-K8S-001: Container Packaging

> **Service Function ID:** SFN-K8S-001
> **Quelle:** App-Template-Anweisung, Abschnitt 2, Kubernetes als Zielplattform
> **Service:** Kubernetes Deployment (SVC-K8S-DEPLOY)
> **Quelle-Typ:** [ARCH]

---

## Beschreibung

Container Packaging stellt sicher, dass die DNS-Konfigurations-App als gehaertetes Minimal-Container-Image gebaut, exportiert und in einer airgapped Umgebung geladen werden kann. Das Image enthaelt alle Assets und hat keine Laufzeitabhaengigkeit zu externen Registries oder CDNs.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [RDTS-201](requirements/RDTS-201.md) | [ARCH] | App-Template | Multi-Stage Dockerfile mit gehaertetem Minimal-Runtime-Base | 🟥 MUSS |
| [RDTS-202](requirements/RDTS-202.md) | [ARCH] | App-Template | Airgapped-fähiges Image ohne Laufzeit-Downloads | 🟥 MUSS |
| [RDTS-203](requirements/RDTS-203.md) | [ARCH] | App-Template | Image-Export als tar für Offline-Transfer | 🟧 SOLLTE |

> **Quelle-Typen:** `[NATO]` FMN/NATO-Spec · `[ARCH]` Architektur · `[CUST]` Kunde · `[INT]` Intern
> **Priorität:** 🟥 MUSS · 🟧 SOLLTE · 🟨 KANN · ℹ️ INFO

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-RDTS-201-001](tests/auto/TEST-RDTS-201-001.md) | Automatisch | RDTS-201 |
| [TEST-RDTS-201-001-manual](tests/manual/TEST-RDTS-201-001-manual.md) | Manuell | RDTS-201 |
| [TEST-RDTS-202-001](tests/auto/TEST-RDTS-202-001.md) | Automatisch | RDTS-202 |
| [TEST-RDTS-202-001-manual](tests/manual/TEST-RDTS-202-001-manual.md) | Manuell | RDTS-202 |
| [TEST-RDTS-203-001](tests/auto/TEST-RDTS-203-001.md) | Automatisch | RDTS-203 |
| [TEST-RDTS-203-001-manual](tests/manual/TEST-RDTS-203-001-manual.md) | Manuell | RDTS-203 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-K8S-001 | SFN-K8S-002 | Nutzer (Manifest referenziert Image) |
