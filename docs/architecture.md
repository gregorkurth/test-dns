# Architekturuebersicht

Diese Seite ist die kurze Architektur-Einstiegsseite fuer Leser, die nicht sofort in arc42 einsteigen wollen.

## Kurzbild

Die App besteht im Kern aus:

- Web GUI
- REST API
- lokaler bzw. optional externer Datenspeicherung
- Dokumentation und Release-Artefakten
- GitOps- und Offline-Transfer-Bestandteilen

Die vertiefte Sicht liegt in arc42:

- [Kontext und Scope](arc42/03-context-and-scope.md)
- [Bausteinsicht](arc42/05-building-block-view.md)
- [Laufzeitsicht](arc42/06-runtime-view.md)
- [Verteilungssicht](arc42/07-deployment-view.md)
- [Querschnittliche Konzepte](arc42/08-cross-cutting-concepts.md)

## Blackbox-Sicht

Die Blackbox-Sicht zeigt, was die App nach aussen anbietet und womit sie spricht.

| Externes Element | Zweck |
|---|---|
| Benutzer | Bedient die App und liest Dokumentation |
| OIDC / Keycloak | Anmeldung und Rollenpruefung |
| GitLab | Quellstand, Release und Pipeline |
| Gitea | Zielumgebung fuer Release- und Konfigurationsprojekte |
| Argo CD | GitOps-Synchronisation |
| Kubernetes | Laufzeit der App |
| Harbor / Nexus | Artefakte und Images |
| ClickHouse / Grafana | Observability und Auswertung |

Mehr dazu: [arc42 Kapitel 3](arc42/03-context-and-scope.md)

## Whitebox-Sicht

Die Whitebox-Sicht erklaert die inneren Teile der Loesung.

| Baustein | Aufgabe |
|---|---|
| Web GUI | Anzeige, Navigation, Status und Bedienung |
| API | Fachliche und technische Schnittstelle |
| Dokumentation | Quickstart, Betrieb, Architektur, Release, Benutzerhandbuch |
| Zarf / Offline-Paket | Transfer in getrennte Zielumgebungen |
| Argo CD / GitOps | Deklarative Installation und Synchronisation |
| Monitoring | Metriken, Logs, Traces und Betriebsmodi |

Mehr dazu: [arc42 Kapitel 5 bis 8](arc42/05-building-block-view.md)

## Diagrammstandard

Der Standard fuer Architekturdiagramme ist:

- Quelle als `draw.io`
- Export als `SVG` und `PNG`
- Quelle und Export werden gemeinsam versioniert
- Zielpfade: `docs/diagrams/source/` und `docs/diagrams/export/`

Im aktuellen Repository liegt das Blackbox-Diagramm bereits als Quelle und Export unter:

- `docs/arc42/diagrams/blackbox-overview.drawio`
- `docs/arc42/diagrams/blackbox-overview.svg`
- `docs/arc42/diagrams/pod-connectivity.drawio`
- `docs/arc42/diagrams/pod-connectivity.svg`

Der Zielstandard fuer neue Diagramme ist die klare Trennung in Source und Export, damit die Markdown-Doku und spaetere E-Book-Exporte immer auf die exportierten Bilder verweisen.

## Architekturentscheidungen

Wichtige Gruende und Entscheidungen stehen hier:

- [ADR Uebersicht](adr/INDEX.md)
- [arc42 Kapitel 9](arc42/09-architecture-decisions.md)

## Weiter lesen

- [Konfiguration](configuration.md)
- [Security-Dokumentation](security/README.md)
- [Benutzerhandbuch](user-manual/README.md)
