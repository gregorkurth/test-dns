# Zarf-Paket

Diese Seite beschreibt das Paket fuer die Offline-Weitergabe.
Ziel ist ein reproduzierbarer Export, Transfer und Import.

## Was gehoert ins Paket

Das Zarf-Paket enthaelt die fuer den Zielbetrieb benoetigten Bestandteile:

- Container-Images
- Kubernetes-Manifeste
- Helm-Charts oder Kustomize-Overlays
- Argo-CD-Definitionen
- Konfigurationsdateien
- Initialisierungs- und Migrationslogik
- optional die trivy-Offline-Datenbank

## Aufbau von `zarf.yaml`

Die Paketdefinition muss klar gegliedert sein:

| Bereich | Inhalt |
|---|---|
| Metadaten | Paketname, Version, Beschreibung |
| Komponenten | Gruppen fuer Images, Manifeste und GitOps |
| Images | Exakte Image-Referenzen mit SHA-Digest |
| Files | Konfigurationsdateien, Checksummen, Begleitdokumente |
| Variables | Zielwerte fuer Registry, Hostname und Namespace |
| Actions | Init-, Install- oder Import-Schritte |

## Wichtige Regeln

- Keine `latest`-Referenzen in Images
- Paket und Manifeste muessen zusammenpassen
- Das Paket muss in der Zielumgebung ohne Internetzugang importierbar sein
- Das Zarf-Paket gehoert zum Release und wird versioniert mitgefuert

## Paket bauen

1. `zarf.yaml` an der vorgesehenen Stelle bereitstellen.
2. Sicherstellen, dass alle Bilder in der Ziel-Registry vorhanden sind.
3. Paket bauen.
   ```bash
   zarf package create zarf.yaml --confirm
   ```
4. Ergebnis gegen Release-Version und Checksummen pruefen.

## Paket pruefen

Vor dem Publish muss der reale Paketinhalt geprueft werden:

- enthaltene Dateien
- Dateianzahl
- erlaubte Pfade
- Paketgroesse
- Artefakte ohne Source- oder Testreste

## Paket importieren

1. Paket in die Zielumgebung kopieren.
2. Zielcluster und Ziel-Registry pruefen.
3. Import starten.
   ```bash
   zarf package deploy <paketdatei> --confirm
   ```
4. Danach Argo CD und Smoke-Test ausfuehren.

## Kompatibilitaet

- Zarf-Version und Ziel-Kubernetes-Version muessen zusammenpassen.
- Wenn die Zielumgebung strenger oder aelter ist, zuerst einen Testimport machen.
- Abweichungen werden in der Offline-Installationsdoku beschrieben.

## Weiter lesen

- [Offline-Installation](offline-install.md)
- [Argo CD](argocd.md)
- [Release-Prozess](release-process.md)
