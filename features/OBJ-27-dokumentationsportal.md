# OBJ-27: Dokumentationsportal (MkDocs als eigenständiger Kubernetes-Pod)

## Status: Planned
**Created:** 2026-04-12
**Last Updated:** 2026-04-12

## Dependencies
- OBJ-2 (Dokumentation) – liefert die Markdown-Quelldateien in `docs/`
- OBJ-10 (Kubernetes Deployment) – Zielplattform
- OBJ-25 (Helm Charts) – Chart-Geruest, in das der Docs-Pod integriert wird
- OBJ-1 (CI/CD Pipeline) – baut `ghcr.io/gregorkurth/test-dns-docs` parallel zur Haupt-App

## User Stories
- Als Mission Network Operator moechte ich die vollstaendige Betriebsdokumentation direkt im Cluster abrufen koennen, damit ich im airgapped Betrieb keinen externen Zugriff benotige.
- Als Administrator moechte ich den Docs-Pod unabhaengig von der Haupt-App skalieren koennen, ohne die Applikation neu zu deployen.
- Als Operator moechte ich die arc42-Kapitel, ADRs, das Benutzerhandbuch und alle Betriebsanleitungen strukturiert und durchsuchbar lesen koennen.
- Als Platform-Engineer moechte ich den Docs-Dienst per `docs.enabled: false` deaktivieren koennen, ohne andere Ressourcen zu beeinflussen.

## Beschreibung

Das Dokumentationsportal laeuft als eigenstaendiger Pod innerhalb des bestehenden Helm-Charts (`helm/dns-management-service`). Es besteht aus:

### Container-Image (`Dockerfile.docs`)

Multi-Stage-Build:
1. **`builder`** – `python:3.12-alpine`: installiert `mkdocs==1.6.1`, baut die statische Site mit `mkdocs build --strict --site-dir /docs/site`
2. **`runner`** – `caddy:2-alpine`: kopiert den generierten `site/`-Inhalt nach `/srv/docs`, laedt die `Caddyfile`

**Webserver: Caddy 2**
- Port 8080 (non-root-kompatibel, kein Port-Binding unter 1024 noetig)
- `file_server` mit automatischer `index.html`-Auslieferung fuer Verzeichnisse (MkDocs clean URLs funktionieren out of the box)
- Security-Header gesetzt (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- `readOnlyRootFilesystem: true` mit drei emptyDir-Volumes fuer Caddy-Laufzeitverzeichnisse (`/data`, `/config`, `/tmp`)

### Helm-Templates

- **`docs-deployment.yaml`** – konditionell (`docs.enabled`), 1 Replica (skalierbar), non-root UID 1000, readOnlyRootFilesystem
- **`docs-service.yaml`** – ClusterIP Port 80 → 8080 (Pod)

### Image-Name

```
ghcr.io/gregorkurth/test-dns-docs:<version>
```

Gebaut parallel zur Haupt-App in der CI-Pipeline per `docker build -f Dockerfile.docs`.

## Akzeptanzkriterien

- [ ] `docker build -f Dockerfile.docs -t test-dns-docs:dev .` baut erfolgreich
- [ ] `docker run -p 8080:8080 test-dns-docs:dev` liefert die Doku unter http://localhost:8080
- [ ] Caddy lauscht auf Port 8080 (non-root)
- [ ] Container laeuft mit `readOnlyRootFilesystem: true` und `runAsNonRoot: true`
- [ ] `helm template` mit `docs.enabled: true` erzeugt Deployment + Service
- [ ] `helm template` mit `docs.enabled: false` erzeugt keine Docs-Ressourcen
- [ ] `values.yaml` enthaelt vollstaendige `docs:`-Sektion
- [ ] `values-local.yaml` setzt lokales Image-Tag (`dev`, `pullPolicy: Never`)
- [ ] MkDocs-Suche funktioniert ohne externe Abhaengigkeiten (airgapped-kompatibel)
- [ ] Security-Header (X-Frame-Options, X-Content-Type-Options) sind in Caddy gesetzt

## Edge Cases

- Bei `docs.enabled: false` darf kein Kubernetes-Objekt fuer den Docs-Dienst erzeugt werden.
- Schlaegt `mkdocs build --strict` fehl (kaputte Links, fehlende Dateien), schlaegt der gesamte Image-Build fehl.
- Caddy benoetigt schreibbare Verzeichnisse (`/data`, `/config`, `/tmp`) – diese werden als emptyDir gemountet, damit `readOnlyRootFilesystem: true` eingehalten werden kann.
- Der Docs-Pod hat keinen ServiceAccount und kein RBAC (rein statischer Content).

## Definition of Done

- [ ] `Dockerfile.docs` und `Caddyfile` committed
- [ ] Helm-Templates `docs-deployment.yaml` und `docs-service.yaml` vorhanden
- [ ] `values.yaml` und `values-local.yaml` aktualisiert
- [ ] Lokaler Test: Image baut, Container startet, http://localhost:8080 liefert 200
- [ ] `helm template --values values-local.yaml` erzeugt valides YAML mit Docs-Ressourcen
- [ ] Feature-Status in `features/INDEX.md` und `docs/SVC.md` aktualisiert

## Deployment

Teil des bestehenden Helm-Charts `helm/dns-management-service`. Kein eigenes Chart.
Namespace: `dns-management` (selber Namespace wie die Haupt-App).

Service-Name: `<release>-docs`, Port 80 → erreichbar cluster-intern unter
`http://<release>-dns-management-service-docs/`
