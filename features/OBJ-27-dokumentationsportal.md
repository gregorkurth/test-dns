# OBJ-27: Dokumentationsportal (MkDocs-Website integriert in Next.js)

## Status: Planned
**Created:** 2026-04-12
**Last Updated:** 2026-04-12

## Dependencies
- OBJ-2 (Dokumentation) – liefert die Markdown-Quelldateien in `docs/`
- OBJ-10 (Kubernetes Deployment) – Zielplattform; kein separater Container noetig
- OBJ-1 (CI/CD Pipeline) – baut die MkDocs-Site als Teil des Docker-Builds

## User Stories
- Als Mission Network Operator moechte ich die vollstaendige Betriebsdokumentation direkt im Cluster abrufen koennen, damit ich im airgapped Betrieb keinen externen Zugriff benotige.
- Als Operator moechte ich die Dokumentation unter `/docs/` im selben Browser-Tab wie die App lesen koennen, ohne lokale Tools installieren zu muessen.
- Als Administrator moechte ich keinen zweiten Container oder Dienst betreiben muessen; die Doku soll im bestehenden App-Container mitgeliefert werden.
- Als Reviewer moechte ich die arc42-Kapitel, ADRs, das Benutzerhandbuch und alle Betriebsanleitungen strukturiert und durchsuchbar lesen koennen.

## Beschreibung

Die MkDocs-Dokumentation wird als statische HTML-Site in den bestehenden Next.js-Container integriert – kein zweiter Container, kein separates Helm-Deployment.

### Ablauf

1. **Docker Multi-Stage-Build** – ein dedizierter Python-Stage (`docs-builder`) baut die MkDocs-Site mit `mkdocs build`.
2. Der Output (`site/`) wird als `public/docs/` in den Next.js-Builder-Stage kopiert.
3. Next.js bundelt `public/docs/` als statische Assets; die Doku ist unter `/docs/` erreichbar.
4. Kein zweiter Container, kein zweites Helm-Template, kein zweiter Service noetig.

```
# Dockerfile (vereinfacht)
FROM python:3.12-alpine AS docs-builder
  mkdocs build --site-dir /docs/site

FROM node:20-alpine AS builder
  COPY --from=docs-builder /docs/site ./public/docs/
  npm run build

FROM node:20-alpine AS runner
  # public/docs/ ist bereits in .next/static via Next.js eingebunden
```

### Airgapped-Kompatibilitaet

- Die MkDocs-Suche arbeitet vollstaendig client-seitig (kein externer API-Aufruf).
- Der Standard-MkDocs-Theme (`theme: name: mkdocs`) laed keine externen Fonts oder CDNs.
- Das Python-Image wird einmalig bei Build-Zeit benoetigt; kein Internet-Zugriff zur Laufzeit.

## Akzeptanzkriterien

- [ ] `docker build .` (bestehender Dockerfile) baut die MkDocs-Site und bettet sie ein
- [ ] Dokumentation ist nach `npm run dev` bzw. in der deployten App unter `/docs/` erreichbar
- [ ] Navigationsstruktur aus `mkdocs.yml` wird korrekt dargestellt
- [ ] Suche funktioniert ohne externe Abhaengigkeiten
- [ ] `public/docs/` ist in `.gitignore` (generiertes Artefakt, nicht committed)
- [ ] Schlaegt `mkdocs build --strict` fehl (z. B. kaputte Links), schlaegt der gesamte Docker-Build fehl
- [ ] Kein zweiter Container oder Helm-Template noetig

## Edge Cases

- Falls Python/mkdocs im docs-builder-Stage nicht verfuegbar ist, schlaegt der Build fehl (kein stilles Ignorieren).
- Falls `public/docs/` versehentlich committed wird, muss `.gitignore` dies verhindern.
- `mkdocs build --strict` erzwingt Fehler bei defekten Links oder fehlenden Dateien.

## Definition of Done

- [ ] `docs-builder` Stage in `Dockerfile` vorhanden und funktional
- [ ] `public/docs/` in `.gitignore`
- [ ] Lokaler Test: `docker build . && docker run -p 3000:3000 ...` → `/docs/` liefert Dokumentation
- [ ] Feature-Status in `features/INDEX.md` und `docs/SVC.md` aktualisiert

## Deployment

Keine zusaetzlichen Kubernetes-Ressourcen noetig. Die Dokumentation wird als Teil des bestehenden App-Containers ausgeliefert. Erreichbar unter demselben Hostname der App unter dem Pfad `/docs/`.
