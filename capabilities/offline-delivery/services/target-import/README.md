# Service: Target Import (SVC-OFD-IMPORT)

> **Capability:** CAP-008 Offline Delivery
> **Maturität:** L0 – Not achieved

## Beschreibung

Dieser Service stellt den Import und die Rehydrierung des Zarf-Pakets in einer getrennten Zielumgebung sicher.

## Service Functions

| SFN-ID | Service Function | Beschreibung |
|--------|-----------------|-------------|
| SFN-OFD-002 | Zarf Package Deploy | Import in Zielumgebung, Image-Bereitstellung, Parametrisierung |

## Requirements

| Req-ID | Typ | Priorität | Beschreibung |
|--------|-----|-----------|-------------|
| RDTS-805 | [ARCH] | 🟥 MUSS | Import ohne Zugriff auf Ursprungsumgebung möglich |
| RDTS-806 | [ARCH] | 🟥 MUSS | Container-Images werden in Ziel-Registry geladen |
| RDTS-807 | [ARCH] | 🟥 MUSS | Ziel-spezifische Parameter via Zarf-Variables konfigurierbar |
| RDTS-808 | [ARCH] | 🟥 MUSS | Import ist idempotent (wiederholbar ohne Nebeneffekte) |
| RDTS-809 | [ARCH] | 🟥 MUSS | Smoke-Test nach Import nachweist Funktionsfähigkeit |
