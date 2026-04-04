---
category: Deployability
---
# Manueller Test: TEST-RDTS-901-001
> **Requirement:** RDTS-901 | **SFN:** SFN-GIT-001

## Testvorbereitung
- Argo CD in Zielumgebung installiert
- Zarf-Paket importiert

## Testschritte
1. Argo-CD-Root-Application anlegen (kubectl apply)
2. Sync auslösen (argocd app sync)
3. Status aller Applications prüfen (argocd app list)
4. Prüfen, ob alle Applications Synced / Healthy sind
