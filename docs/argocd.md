# Argo CD

Diese Seite beschreibt die Installation und Nutzung von Argo CD im App-of-Apps-Modell.

## Zielbild

Die Installation beginnt mit einer Root-Application.
Diese Root-Application referenziert zwei getrennte Gitea-Quellen:

- das Release-Projekt
- das Konfigurationsprojekt

So bleiben deploybare Artefakte und Zielwerte getrennt.

## Vorbedingungen

- Argo CD ist in der Zielumgebung vorhanden
- Gitea ist erreichbar
- Das Release-Projekt wurde importiert
- Das Konfigurationsprojekt wurde importiert
- Namespace, Registry und Hostname sind bekannt

## Installationsschritte

1. Root-Application anlegen.
2. AppProject fuer die App und ihre Teilkomponenten anlegen.
3. Release-Projekt als Quelle eintragen.
4. Konfigurationsprojekt als zweite Quelle eintragen.
5. Sync auf der Root-Application ausloesen.
6. Child-Applications kontrollieren.
7. Status und Fehler anzeigen lassen.

## Struktur im App-of-Apps-Modell

| Ebene | Aufgabe |
|---|---|
| Root-Application | Einstiegspunkt und Sammelpunkt |
| AppProject | Regeln, Quellen und Ziele |
| Release-Quelle | Deploybare Artefakte und Manifeste |
| Konfigurationsquelle | Helm Values, Overlays und Zielwerte |
| Child-Applications | Einzeln synchronisierbare Teilkomponenten |

## Betrieb

- Einzelne Teilkomponenten koennen getrennt synchronisiert werden.
- Ein Sync-Fehler muss klar lesbar sein.
- Bei Aenderungen an der Zielumgebung wird zuerst die Konfiguration geprueft.
- Bei Release-Wechseln wird die Root-Application erneut synchronisiert.

## Versionen und Kompatibilitaet

- Die Argo-CD-Version in Entwicklungs- und Zielumgebung soll dokumentiert verglichen werden.
- Wenn ApplicationSet nicht verfuegbar ist, muss eine einfache Application-Struktur als Fallback funktionieren.
- Self-Heal soll nur aktiv sein, wenn es bewusst freigegeben wurde.

## Fehlersuche

| Problem | Typische Ursache | Pruefung |
|---|---|---|
| Root-Application fehlt | Installation noch nicht ausgefuehrt | `kubectl` und Argo CD pruefen |
| Sync scheitert | falsche Repo-URL oder Revision | Gitea-Quelle pruefen |
| Child-Applications fehlen | AppProject oder Quelle unvollstaendig | Struktur im Repo pruefen |
| Konfigurationswerte passen nicht | Release- und Konfigurationsprojekt nicht abgestimmt | Versionsstand abgleichen |

## Weiter lesen

- [Offline-Installation](offline-install.md)
- [Zarf-Paket](zarf.md)
- [Release-Prozess](release-process.md)
