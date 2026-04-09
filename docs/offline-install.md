# Offline-Installation

Diese Anleitung beschreibt den Weg vom Zarf-Export bis zur Installation in der Zielumgebung.
Sie ist fuer Umgebungen ohne direkten Zugriff auf die Entwicklungsumgebung geschrieben.

## Ablauf in kurz

1. Release bauen
2. Zarf-Paket erzeugen
3. Artefakte exportieren
4. Paket und Begleitdateien transferieren
5. In der Zielumgebung importieren
6. Gitea-Release-Projekt und Gitea-Konfigurationsprojekt bereitstellen
7. Argo CD synchronisieren
8. Smoke-Test ausfuehren

## Voraussetzungen in der Zielumgebung

- Kubernetes-Cluster ist erreichbar
- `kubectl` ist verfuegbar
- `zarf` ist installiert
- Lokales Harbor oder eine andere Ziel-Registry ist erreichbar
- Lokales Gitea ist erreichbar
- Argo CD ist installiert oder wird im Installationspfad mitgebracht

## 1. Export in der Quellumgebung

1. Release-Version bestimmen.
2. SBOM und Security-Bericht bereitstellen.
3. Zarf-Paket erzeugen.
   ```bash
   zarf package create zarf.yaml --confirm
   ```
4. Pruefen, ob alle Pflichtartefakte vorhanden sind.
   - Zarf-Paket
   - SBOM
   - Security-Bericht
   - Release-Notizen
   - Checksummen

## 2. Transfer

1. Alle Dateien in ein sauberes Transferverzeichnis legen.
2. Transfermedium beschriften.
3. Paket, Begleitdateien und Doku gemeinsam uebertragen.
4. Pruefen, ob die Zielumgebung dieselbe Release-Version erwartet.

## 3. Import des Release-Projekts

Das Release-Projekt enthaelt den deploybaren Stand.

1. Release-Projekt in Gitea anlegen oder aktualisieren.
2. Deploybare Artefakte aus dem Zarf-Release dort hinterlegen.
3. Tag, Version und Checksummen dokumentieren.
4. Nur freigegebene Artefakte importieren.

## 4. Import des Konfigurationsprojekts

Das Konfigurationsprojekt enthaelt die Zielwerte.

1. Konfigurationsprojekt in Gitea anlegen oder aktualisieren.
2. Helm Values, Overlays und Zielparameter pflegen.
3. Werte fuer Namespace, Registry, Ingress und OIDC setzen.
4. Die Konfiguration mit der Release-Version abgleichen.

## 5. Zarf-Import

1. Paket in der Zielumgebung bereitstellen.
2. Import starten.
   ```bash
   zarf package deploy <paketdatei> --confirm
   ```
3. Prüfen, ob Images, Manifeste und GitOps-Ressourcen angekommen sind.
4. Wenn die Zielumgebung offline ist, darf kein externer Download noetig sein.

## 6. Argo CD aktivieren

1. Root-Application anlegen.
2. Release-Projekt und Konfigurationsprojekt referenzieren.
3. Sync ausloesen.
4. Status pruefen.

Mehr dazu: [Argo CD](argocd.md)

## 7. Smoke-Test

1. App im Browser oeffnen.
2. API kurz pruefen.
3. Falls vorhanden, Deployability-Test ausfuehren.
4. Prüfen, ob die App ohne Rueckfragen nutzbar ist.

## Fehlerbehebung

| Problem | Mögliche Ursache | Was tun |
|---|---|---|
| Zarf bricht sofort ab | Cluster, Registry oder Registry-Zugriff fehlt | Voraussetzungen pruefen |
| Images fehlen | Release- oder Harbor-Inhalt unvollstaendig | Artefakte neu exportieren |
| Argo CD zeigt Sync-Fehler | Repo, Revision oder Rechte stimmen nicht | `docs/argocd.md` pruefen |
| Smoke-Test schlaegt fehl | App, Konfiguration oder Hostname stimmt nicht | `docs/configuration.md` und `docs/operations.md` pruefen |
| Zielsystem laedt nichts nach | Transfer war unvollstaendig | Checksummen vergleichen |

## Pflichtartefakte pro Import

- Zarf-Paket
- SBOM
- Security-Bericht
- Release-Notizen
- Checksummen
- Release-Projekt in Gitea
- Konfigurationsprojekt in Gitea

## Weiter lesen

- [Zarf-Paket](zarf.md)
- [Argo CD](argocd.md)
- [Release-Prozess](release-process.md)
