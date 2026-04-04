# Capability: Offline Delivery

> **Capability ID:** CAP-008
> **NATO C3 Taxonomie:** Communication and Information Services > Platform Services > Offline Delivery
> **FMN-Referenz:** App-Template-Anweisung v3 (intern)
> **Maturität:** L0 – Idea (Stand: 2026-04-03)

---

## Beschreibung

Die Offline-Delivery-Capability stellt sicher, dass die App als vollständiges Zarf-Paket exportiert und in einer getrennten Zielumgebung ohne Zugriff auf die Ursprungsumgebung importiert und installiert werden kann. Sie umfasst Paketdefinition, Build, Transfer, Import und Rehydrierung aller notwendigen Artefakte in der Zielumgebung.

---

## Services

| ID | Service | Beschreibung | Spec |
|----|---------|-------------|------|
| SVC-OFD-PKG | Zarf Packaging | Erzeugung und Verwaltung des Zarf-Pakets | [README](services/zarf-packaging/README.md) |
| SVC-OFD-IMPORT | Target Import | Import und Rehydrierung in der Zielumgebung | [README](services/target-import/README.md) |

---

## Service Functions

| SFN-ID | Service Function | Service | Quelle |
|--------|-----------------|---------|--------|
| SFN-OFD-001 | Zarf Package Build | SVC-OFD-PKG | [ARCH] |
| SFN-OFD-002 | Zarf Package Deploy (Zielumgebung) | SVC-OFD-IMPORT | [ARCH] |

---

## Abhängigkeiten

| DPD-ID | Abhängigkeit | Typ | Beschreibung |
|--------|-------------|-----|-------------|
| DPD-OFD-001 | CAP-005 DevOps | Voraussetzung | Zarf-Build ist Bestandteil der Release-Pipeline |
| DPD-OFD-001a | CAP-007 Supply Chain Security | Voraussetzung | Artefaktprüfung blockiert ungeprüfte Offline-Pakete |
| DPD-OFD-002 | OBJ-18 Artefakt-Registry | Voraussetzung | Zarf liest Container-Images aus Harbor |
| DPD-OFD-003 | CAP-009 GitOps | Nutzer | Argo-CD-Definitionen sind Bestandteil des Zarf-Pakets |
| DPD-OFD-004 | OBJ-19 Zarf-Paket | Feature | Feature-Spezifikation für Zarf-Build |
| DPD-OFD-005 | OBJ-20 Zielumgebung | Feature | Feature-Spezifikation für Import/Rehydrierung |

---

## Links

- [Maturity Status](maturity.md)
- [Products & Licenses](products.md)
- [App-Template-Anweisung v3](../../req-init/app-template-3.md)
