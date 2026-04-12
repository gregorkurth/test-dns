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

## OBJ-21 Management-Sicht und Health-Nachweis

OBJ-21 fuehrt eine lokale Management-Sicht fuer GitOps und Argo CD ein:

- Websicht: `/gitops`
- API: `/api/v1/gitops`

Diese Sicht zeigt fuer jede Child-Application:

- Health-Status: `Healthy`, `Degraded`, `Progressing` oder `Missing`
- Sync-Status und Sync-Modus
- Release- und Konfigurationsquelle
- Operator-Entscheid, ob ein Objekt bereits als deployed-ready gilt

Wichtige Regel:
Ein Objekt gilt nie allein wegen eines vorhandenen Argo-CD-Eintrags als
deployed. Erst ein sichtbarer `Healthy`-Nachweis macht den Deploy-Status gueltig.

## OBJ-21 Bootstrap-Prozedur fuer leere Zielumgebungen

Die Erstinstallation ist offline-faehig und idempotent dokumentiert:

1. Vorbedingungen mit `./gitops/bootstrap/bootstrap.sh --check-only` pruefen
2. AppProject aus `gitops/argocd/bootstrap-resources/appproject.yaml` anlegen
3. Root-Application aus `gitops/argocd/root-application.yaml` anlegen
4. Initialen manuellen Sync ausloesen
5. Health-Nachweis in Argo CD und in `/api/v1/gitops` gegenpruefen

Das zugehoerige Kurz-Runbook liegt in `gitops/bootstrap/README.md`.

## OBJ-21 Zwei-Git-Quellen und Revisionsbindung

Fuer das App-of-Apps-Modell werden immer zwei getrennte Quellen genutzt:

- Release-Projekt:
  - deploybare Artefakte
  - Helm Chart
  - GitOps-Grundstruktur
- Konfigurationsprojekt:
  - Umgebungswerte
  - Hostnames
  - Namespace-Zuordnung
  - optionale Sync-Entscheide

Die Revisionsbindung wird ueber eine feste Matrix gepflegt, zum Beispiel:

| Umgebung | Release-Revision | Konfigurations-Revision | Status |
|---|---|---|---|
| FMN Core | `release/2026.04.1` | `env/fmn-core/2026.04.1` | validiert |
| FMN Staging | `release/2026.04.2` | `env/fmn-staging/2026.04.2` | pruefen |

Wenn Release- und Konfigurationsrevision nicht zusammenpassen, darf der Sync
nicht als freigegeben gelten.

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

## OBJ-20 Bindung fuer Zielimport und Rehydrierung

Im OBJ-20-Ablauf ist Argo CD nicht nur ein Deployment-Werkzeug, sondern der
sichtbare Betriebsanker nach dem Offline-Import.

Fuer jeden Importlauf gelten daher diese Regeln:

1. Die Root-Application referenziert immer zwei Quellen:
   - Release-Projekt fuer deploybare Artefakte
   - Konfigurationsprojekt fuer Zielwerte, Overlays und Parameter
2. Beide Quellen muessen auf freigegebene Revisionen zeigen, die zur gleichen
   Release-Version gehoeren.
3. Ein Re-Run darf dieselben Quellen erneut synchronisieren, sofern kein
   unkontrollierter Drift vorliegt.
4. Ein Recovery-Lauf setzt beide Quellen bewusst auf die letzte stabile
   Kombination zurueck.
5. Child-Applications muessen nach dem Sync mindestens als `Healthy` oder
   kontrolliert `Progressing` sichtbar sein. `Degraded` bedeutet, dass der
   Rehydrierungslauf nicht abgeschlossen ist.

## Betriebsentscheid fuer App-of-Apps

Der App-of-Apps-Ansatz wird fuer OBJ-20 bewusst genutzt, weil er drei Dinge
sichert:

- Release- und Konfigurationsquelle bleiben getrennt nachvollziehbar.
- Ein erneuter Lauf kann idempotent aus denselben Quellen wiederholt werden.
- Recovery kann auf eine bekannte Quellenkombination zurueckschalten, ohne
  manuelle Einzeldeployments auszufuehren.

Fuer Nicht-Entwickler ist wichtig: Ein gruener Argo-CD-Status allein reicht
nicht. Erst zusammen mit Preflight, Smoke-Test und Rehydrierungsnachweis gilt
der Zielimport als abgeschlossen.

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
| Apps bleiben degraded | Import oder Konfigurationsstand ist unvollstaendig | Rehydrierungsnachweis und Recover-Run pruefen |

## Weiter lesen

- [Offline-Installation](offline-install.md)
- [Zarf-Paket](zarf.md)
- [Release-Prozess](release-process.md)
