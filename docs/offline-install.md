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

### OBJ-19 Pflichtsatz fuer den Transfer

Pro Paketvariante gehoeren folgende Dateien zusammen:

- Zarf-Paketdatei
- `SHA256SUMS.txt`
- `manifest.json`
- `handover.json`
- Release-Hinweise / Release-Notizen
- optional bei `full`: Offline-DB und Security-Bundle

Empfohlene Transferstruktur:

```text
transfer/
+-- dns-management-service-2026.04.1-minimal-amd64.tar.zst
+-- SHA256SUMS.txt
+-- manifest.json
+-- handover.json
+-- release-notes.pdf
+-- security/                 # nur bei full
```

## 3. Import des Release-Projekts

Das Release-Projekt enthaelt den deploybaren Stand.

1. Release-Projekt in Gitea anlegen oder aktualisieren.
2. Deploybare Artefakte aus dem Zarf-Release dort hinterlegen.
3. Tag, Version und Checksummen dokumentieren.
4. Nur freigegebene Artefakte importieren.

Bei OBJ-19 ist das Release-Projekt Teil des Handover-Nachweises. Es muss derselben
Version entsprechen wie Paketname, Manifest und `handover.json`.

## 4. Import des Konfigurationsprojekts

Das Konfigurationsprojekt enthaelt die Zielwerte.

1. Konfigurationsprojekt in Gitea anlegen oder aktualisieren.
2. Helm Values, Overlays und Zielparameter pflegen.
3. Werte fuer Namespace, Registry, Ingress und OIDC setzen.
4. Die Konfiguration mit der Release-Version abgleichen.

Das Konfigurationsprojekt bleibt eine getrennte Pflichtquelle. Es wird nicht inhaltlich
mit dem Release-Projekt vermischt, sondern nur gemeinsam fuer das spaetere App-of-Apps-
Deployment referenziert.

## 5. Zarf-Import

1. Paket in der Zielumgebung bereitstellen.
2. `SHA256SUMS.txt` lokal pruefen.
3. `handover.json` gegen Zielumgebung und Zielrolle abgleichen.
2. Import starten.
   ```bash
   zarf package deploy <paketdatei> --confirm
   ```
4. Pruefen, ob Images, Manifeste und GitOps-Ressourcen angekommen sind.
5. Wenn die Zielumgebung offline ist, darf kein externer Download noetig sein.
6. Bei `full` zusaetzlich pruefen, ob Offline-DB und Security-Bundle vor Ort lesbar sind.

## OBJ-20 Kontrollpunkte

Diese Kontrollpunkte muessen fuer OBJ-20 vor dem eigentlichen Import sichtbar und
nachvollziehbar sein. Der Import wird nur freigegeben, wenn alle Pflichtpunkte
bewertet wurden.

1. Cluster erreichbar und `kubectl` kann den Ziel-Namespace lesen.
2. Ziel-Registry ist erreichbar und nimmt OCI-Artefakte aus dem Paket an.
3. Argo CD ist erreichbar oder als kontrollierter Nachschritt dokumentiert.
4. Release-Projekt und Konfigurationsprojekt in Gitea sind vorhanden und
   referenzieren dieselbe freigegebene Version.
5. Paketintegritaet ist ueber Checksummen und Release-Freigabe bestaetigt.
6. Der vorgesehene Recovery-Pfad auf die letzte stabile Version ist bekannt.

Wenn ein Pflichtpunkt rot ist, darf `zarf package deploy` nicht gestartet
werden. Der Lauf gilt dann als kontrolliert blockiert und nicht als
fehlgeschlagener Teilimport.

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

## Rehydrierungsnachweis

Nach jedem OBJ-20-Lauf wird ein Rehydrierungsnachweis erstellt. Dieser Nachweis
ist der betriebliche Beleg dafuer, dass die Zielumgebung wieder in einen
reproduzierbaren Zustand ueberfuehrt wurde.

Der Nachweis enthaelt mindestens:

- Zielumgebung, Cluster und Namespace
- importierte Version und Kanal
- Zeitpunkt Start/Ende des Laufs
- Ergebnis des Preflight-Checks
- Referenz auf Release-Projekt und Konfigurationsprojekt
- Argo-CD-App-of-Apps-Referenz
- Anzahl importierter, gesunder und degradierter Ressourcen
- Ergebnis des Deployability-Smoke-Tests
- Hinweis auf Recovery- oder Rollback-Entscheidung

Ein Lauf gilt nur dann als fachlich abgeschlossen, wenn der
Rehydrierungsnachweis gepflegt wurde. Fehlt dieser Nachweis, bleibt der Lauf in
der Sichtbarkeit des Betriebsteams unvollstaendig.

## Rollback und Recover Run

Wenn der Import oder der nachfolgende Smoke-Test fehlschlaegt, wird nicht
manuell improvisiert. Stattdessen gilt der definierte Recover-Run:

1. Letzte stabile Version aus dem Release-Projekt feststellen.
2. Konfigurationsprojekt auf den dazu passenden Zielstand zuruecksetzen.
3. Root-Application in Argo CD erneut auf diese stabile Kombination
   synchronisieren.
4. Falls noetig, Zarf-Paket der stabilen Version erneut deployen.
5. Erneut Preflight, Argo-Health und Smoke-Test pruefen.
6. Recover-Lauf im Rehydrierungsnachweis dokumentieren.

Ein Recover-Lauf ist erfolgreich, wenn die Zielumgebung wieder einen
nachvollziehbaren Healthy/Synced-Zustand erreicht und der Smoke-Test bestanden
wird.

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
- `SHA256SUMS.txt`
- `manifest.json`
- `handover.json`
- SBOM
- Security-Bericht
- Release-Notizen
- Checksummen
- Release-Projekt in Gitea
- Konfigurationsprojekt in Gitea

## GUI und API fuer OBJ-19

Fuer Management- und Plattform-Sicht steht der Stand der Offline-Pakete lokal im Service bereit:

- GUI: `/offline-package`
- API: `/api/v1/offline-package`

Beide lesen dieselben Git-Metadaten unter `artifacts/offline-package/` und zeigen:

- Varianten (`minimal` / `full`)
- Paketgroesse und Zielumgebung
- Inhaltsmanifest
- Checksum-Nachweise
- Handover-Status
- Zuordnung zu Release-Projekt und Konfigurationsprojekt

## Weiter lesen

- [Zarf-Paket](zarf.md)
- [Argo CD](argocd.md)
- [Release-Prozess](release-process.md)
