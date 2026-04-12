# Betriebsdokumentation

Diese Seite beschreibt den Alltagsbetrieb der App in einfacher Form.
Sie deckt Start, Stop, Update, Backup und die wichtigsten Fehlersuchen ab.

## Start

### Lokal

1. Abhaengigkeiten installieren.
   ```bash
   npm install
   ```
2. Entwicklungsserver starten.
   ```bash
   npm run dev
   ```
3. App im Browser pruefen.
   - `http://localhost:3000`

### Produktiv oder gestaged

1. Build ausfuehren.
   ```bash
   npm run build
   ```
2. Zielpfad waehlen:
   - Local Integration auf Docker-basiertem Kubernetes
   - On-Prem Integration/Production auf eigenem Cluster
3. Im Kubernetes-/GitOps-Betrieb den vorgesehenen Deploy-Pfad nutzen.
   - Release importieren (ggf. ueber Zarf)
   - Argo CD synchronisieren
   - Smoke-Test ausfuehren

## Stop

### Lokal

- Den laufenden Prozess mit `Ctrl+C` beenden.

### Kubernetes

- Deployment skalieren oder die Application in Argo CD pausieren.
- Danach den Status der Pods und der Application pruefen.

### Docker-basierter Testcluster

- Bei Docker Desktop: Kubernetes im Docker Desktop aktivieren.
- Kontext pruefen:
  ```bash
  kubectl config current-context
  kubectl cluster-info
  ```
- Danach local Deploy-Profil nutzen (Helm/Kustomize), nicht Vercel.

## Update

### Lokale Installation

1. Neue Version aus dem Git-Repository holen.
2. Abhaengigkeiten erneut installieren, falls sich das Lockfile geaendert hat.
3. Build erneut ausfuehren.
   ```bash
   npm run build
   ```
4. App neu starten.

### Zielumgebung

1. Neues Release ueber den definierten Release-Prozess uebernehmen.
2. Zarf-Paket importieren.
3. Release-Projekt und Konfigurationsprojekt in Gitea aktualisieren.
4. Argo CD Root-Application synchronisieren.
5. Smoke-Test ausfuehren.

## Backup

### Was gesichert werden muss

- Das Git-Repository selbst
- Die lokale Datendatei fuer OBJ-3, falls sie verwendet wird
  - Standardpfad: `data/obj3/participants.json`
- Release-Artefakte
- SBOM und Security-Berichte
- Doku-Exporte und Export-Log

### Was bereits versioniert ist

- Dokumentation im Repo
- ADRs
- arc42-Kapitel
- Release-Prozess und Export-Log

## OTel-Betrieb

Die Observability hat zwei Betriebsvarianten:

- `local`
  - Wenn kein zentrales Ziel verfuegbar ist.
  - Telemetrie wird lokal gepuffert.
  - Spaetere Nachlieferung bleibt moeglich.
- `clickhouse`
  - Wenn die zentrale Auswertung aktiv ist.
  - Telemetrie wird an ClickHouse weitergegeben.
  - Das ist der dokumentierte Zielmodus fuer den produktiven Betrieb.

Wenn das Zielsystem ausfaellt, darf die App weiterlaufen.
Dann muessen Pufferung, Retry und die Uebergabe spaeter nachvollziehbar sein.

## Troubleshooting

| Problem | Erstes Gegenpruefen | Naechster Schritt |
|---|---|---|
| App startet nicht | `.env.local`, Node-Version, `npm install` | Fehlertext im Terminal lesen |
| Leere oder fehlende OBJ-3-Daten | `OBJ3_DATA_DIR`, Dateirechte, Speicherort | Datei anlegen oder Pfad korrigieren |
| OTel-Daten kommen nicht an | Betriebsmodus, Zielsystem, Netzweg | Auf `local` umschalten und Buffer pruefen |
| Argo CD synchronisiert nicht | Root-Application, Repo-URL, Ziel-Revision | `docs/argocd.md` pruefen |
| Zarf-Import bricht ab | Paketdatei, Zielcluster, Registry | `docs/offline-install.md` und `docs/zarf.md` pruefen |

## Weiter lesen

- [Konfiguration](configuration.md)
- [Deployment On-Prem Kubernetes](DEPLOYMENT-ONPREM-KUBERNETES.md)
- [Offline-Installation](offline-install.md)
- [Argo CD](argocd.md)
- [Release-Prozess](release-process.md)
