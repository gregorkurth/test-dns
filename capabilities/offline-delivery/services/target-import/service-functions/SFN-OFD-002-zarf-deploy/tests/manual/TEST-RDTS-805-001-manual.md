---
category: Deployability
---
# Manueller Test: TEST-RDTS-805-001
> **Requirement:** RDTS-805 | **SFN:** SFN-OFD-002

## Testvorbereitung
- Zarf-Paket vorhanden
- Zielumgebung (Kubernetes-Cluster) erreichbar
- Kein Zugriff auf Ursprungsumgebung

## Testschritte
1. zarf package deploy ausführen
2. Prüfen, ob alle Images in Ziel-Registry geladen wurden
3. Prüfen, ob Deployments laufen (kubectl get pods)
4. Smoke-Test ausführen (App erreichbar?)
