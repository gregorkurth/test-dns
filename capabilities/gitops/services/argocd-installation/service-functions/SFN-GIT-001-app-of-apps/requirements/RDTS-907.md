# Requirement: RDTS-907

> **Typ:** [ARCH] Architektur-Anforderung
> **Priorität:** 🟥 MUSS
> **Service Function:** SFN-GIT-001 – App-of-Apps-Struktur
> **Capability:** CAP-009 GitOps / Argo CD

## Anforderungstext

Die Root-Application im App-of-Apps-Modell bindet das lokale Gitea-Release-Projekt und das separate Gitea-Konfigurationsprojekt als getrennte Quellen ein.

## Verknüpfte Features

- OBJ-21: GitOps / Argo CD / App-of-Apps
- OBJ-20: Zielumgebung / Import / Rehydrierung
- OBJ-19: Zarf-Paket / Offline-Weitergabe
