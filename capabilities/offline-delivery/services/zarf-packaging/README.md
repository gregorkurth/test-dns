# Service: Zarf Packaging (SVC-OFD-PKG)

> **Capability:** CAP-008 Offline Delivery
> **Maturität:** L0 – Not achieved

## Beschreibung

Dieser Service stellt die Definition, den Build und die Verwaltung des Zarf-Pakets sicher. Das Paket enthält alle für die Zielinstallation notwendigen Artefakte.

## Service Functions

| SFN-ID | Service Function | Beschreibung |
|--------|-----------------|-------------|
| SFN-OFD-001 | Zarf Package Build | Paketdefinition erstellen und Build automatisieren |

## Requirements

| Req-ID | Typ | Priorität | Beschreibung |
|--------|-----|-----------|-------------|
| RDTS-801 | [ARCH] | 🟥 MUSS | zarf.yaml liegt im Repository-Root und ist versioniert |
| RDTS-802 | [ARCH] | 🟥 MUSS | Paket enthält: Container-Images, Manifeste, Argo-CD-Definitionen |
| RDTS-803 | [ARCH] | 🟥 MUSS | Zarf-Build ist Bestandteil der Release-Pipeline |
| RDTS-804 | [ARCH] | 🟥 MUSS | Image-Referenzen mit SHA-Digest (kein latest) |
