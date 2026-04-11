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

## OBJ-19 Paketvarianten

Fuer OBJ-19 werden zwei klar benannte Paketvarianten gefuehrt:

- `minimal`: Basis-Paket fuer Airgap-Import mit OCI-Images, Helm/K8s-Artefakten, GitOps-Quellzuordnung und Pflichtdokumentation
- `full`: erweitert `minimal` um Offline-Security-Bundle und Trivy-DB-Snapshot fuer lokale Scan-Nachweise

Die Varianten muessen in Release und Uebergabe gleich benannt werden:

- `dns-management-service-<version>-minimal-amd64`
- `dns-management-service-<version>-full-amd64`

Die aktuellen Beispiel-Metadaten liegen in Git unter:

- `artifacts/offline-package/INDEX.json`
- `artifacts/offline-package/<version>/<variant>/manifest.json`
- `artifacts/offline-package/<version>/<variant>/SHA256SUMS.txt`
- `artifacts/offline-package/<version>/<variant>/handover.json`

## OBJ-19 Grundstruktur in `zarf.yaml`

Die versionierte Paketdefinition im Repo-Root beschreibt fuer OBJ-19 folgende Pflichtbloecke:

- `core-images`: digest-gepinnte OCI-Referenzen, die im Release-Prozess mit freigegebenen Digests ersetzt werden
- `deployment-assets`: Helm-Chart, Kubernetes-Manifeste und Betriebsdoku
- `gitops-sources`: Nachweis fuer Release-Projekt und separates Konfigurationsprojekt
- `security-offline-db`: optionaler Vollumfang fuer Offline-Security-Validierung
- `import-preflight`: Manifest-, Checksum- und Handover-Metadaten fuer den Zielimport

Wichtig:

- Platzhalter sind nur fuer das Template erlaubt, nicht fuer freigegebene Releases
- `latest` ist verboten; nur OCI-Referenzen mit `@sha256:...`
- Jede Variante braucht ein eigenes Manifest und ein eigenes `SHA256SUMS.txt`
- Release-Projekt und Konfigurationsprojekt bleiben getrennt

## Paket pruefen

Vor dem Publish muss der reale Paketinhalt geprueft werden:

- enthaltene Dateien
- Dateianzahl
- erlaubte Pfade
- Paketgroesse
- Artefakte ohne Source- oder Testreste

Fuer OBJ-19 kommt zusaetzlich dazu:

- Variantenname stimmt mit Release-Namen und Handover-Nachweis ueberein
- `manifest.json` listet Images, Deployment-Artefakte und Git-Quellen vollstaendig
- `SHA256SUMS.txt` enthaelt Paketdatei und alle Pflicht-Metadaten
- `handover.json` dokumentiert Rolle, Zielumgebung und Checksum-Pruefung vor/nach Transfer
- `full` enthaelt den referenzierten Offline-DB-Snapshot tatsaechlich

## Paket importieren

1. Paket in die Zielumgebung kopieren.
2. Zielcluster und Ziel-Registry pruefen.
3. Import starten.
   ```bash
   zarf package deploy <paketdatei> --confirm
   ```
4. Danach Argo CD und Smoke-Test ausfuehren.

Vor dem eigentlichen Deploy prueft der Platform Engineer fuer OBJ-19:

1. `SHA256SUMS.txt` gegen Transfermedium vergleichen.
2. `handover.json` auf richtige Zielumgebung und verantwortliche Rolle pruefen.
3. `manifest.json` gegen erwartete Variante (`minimal` oder `full`) abgleichen.
4. Release-Projekt und Konfigurationsprojekt fuer den spaeteren App-of-Apps-Import festhalten.

## Kompatibilitaet

- Zarf-Version und Ziel-Kubernetes-Version muessen zusammenpassen.
- Wenn die Zielumgebung strenger oder aelter ist, zuerst einen Testimport machen.
- Abweichungen werden in der Offline-Installationsdoku beschrieben.

## Weiter lesen

- [Offline-Installation](offline-install.md)
- [Argo CD](argocd.md)
- [Release-Prozess](release-process.md)
