# Umsetzung

Dieser Teil erklaert die technische Struktur der App ohne zu tief in den Code zu gehen.

## Bausteine

- Next.js App als Benutzeroberflaeche
- REST API unter `/api/v1`
- lokaler Datenspeicher fuer OBJ-3
- Dokumentationsseiten im Repo
- Zarf- und Argo-CD-Bestandteile fuer die Zielumgebung

## Wichtige technische Punkte

| Thema | Bedeutung |
|---|---|
| API | Schnittstelle fuer GUI und interne Ablaufe |
| Konfiguration | ENV-Variablen und ConfigMap-Felder |
| Sicherheit | Secrets nie in ConfigMaps oder im Code |
| Observability | OTel mit `local` und `clickhouse` |
| GitOps | Argo CD mit Root-Application und zwei Quellen |
| Offline | Zarf als Transfer- und Installationspfad |

## Wo steht mehr?

- Architektur: [../architecture.md](../architecture.md)
- Konfiguration: [../configuration.md](../configuration.md)
- Offline-Installation: [../offline-install.md](../offline-install.md)
- Zarf: [../zarf.md](../zarf.md)
- Argo CD: [../argocd.md](../argocd.md)

## Wann brauche ich diese Seite?

- Wenn du verstehen willst, wie die App grob aufgebaut ist
- Wenn du einen technischen Ueberblick fuer einen Review brauchst
- Wenn du die richtige Detailseite suchen willst
