# OBJ-19: Zarf-Paket / Offline-Weitergabe

## Status: In Progress
**Created:** 2026-04-03
**Last Updated:** 2026-04-10

## Dependencies
- OBJ-1: CI/CD Pipeline (Zarf-Paket-Build ist Bestandteil der Release-Pipeline)
- OBJ-18: Artefakt-Registry (Zarf liest Container-Images aus Harbor)
- OBJ-20: Zielumgebung / Import (Zarf-Paket wird in der Zielumgebung importiert)
- OBJ-21: GitOps / Argo CD (Argo-CD-Definitionen sind Bestandteil des Zarf-Pakets)
- OBJ-10: Kubernetes Deployment (K8s-Manifeste und Helm Charts im Zarf-Paket)

## User Stories
- Als Platform Engineer in einer getrennten Zielumgebung möchte ich die App aus einem Zarf-Paket installieren können, ohne Zugriff auf die Ursprungsumgebung oder das Internet zu benötigen.
- Als Release-Verantwortlicher möchte ich ein Zarf-Paket als Bestandteil jedes Releases erhalten, damit die Übergabe an Zielumgebungen standardisiert und vollständig ist.
- Als Platform Engineer möchte ich sicherstellen, dass das Zarf-Paket alle notwendigen Bestandteile enthält, damit keine manuelle Nacharbeit in der Zielumgebung nötig ist.
- Als Entwickler möchte ich die Zarf-Paketdefinition (`zarf.yaml`) im Repository versionieren, damit der Paket-Build reproduzierbar ist.
- Als Platform Engineer möchte ich das Zarf-Paket in eine Ziel-Registry (Harbor) laden können, ohne externe Quellen zu kontaktieren.
- Als Platform Engineer moechte ich den Release-Stand als importierbares Ziel-Gitea-Projekt aus dem Zarf-Prozess bereitstellen koennen, damit Argo CD lokal ohne Quellzugriff arbeiten kann.
- Als Release Manager möchte ich einen vollständigen Übergabe-Satz (Paket, Prüfsumme, Nachweis) pro Version erhalten, damit der USB-/Offline-Transfer revisionssicher ist.
- Als Security-Verantwortlicher möchte ich Security-Bundles und optionale Offline-DB-Snapshots im Paketfluss sehen, damit Zielumgebungen ohne Internet denselben Prüfstand nutzen können.

## Acceptance Criteria
- [ ] `zarf.yaml` (Paketdefinition) liegt im Repository-Root und ist versioniert
- [ ] Zarf-Paket enthält: Container-Images (alle App-Komponenten), Helm Charts / K8s-Manifeste, Argo-CD-Application-Definitionen, Konfigurationsdateien, Migrations-/Initialisierungslogik
- [ ] Zarf-Paket enthält optional: trivy-Offline-Datenbank für Security-Scans in der Zielumgebung (OBJ-17)
- [ ] Zarf-Paket-Build ist Bestandteil der Release-Pipeline (OBJ-1) und wird als Pipeline-Artefakt gespeichert
- [ ] Zarf-Paket wird als Release-Artefakt dem Release zugeordnet (OBJ-14)
- [ ] Zarf-Release enthaelt den deploybaren Release-Stand fuer den Import in ein lokales Gitea-Release-Projekt
- [ ] Das separate Gitea-Konfigurationsprojekt (Helm Values, Parameter, Overlays) ist als Pflichtquelle fuer das spaetere App-of-Apps-Deployment dokumentiert und versioniert
- [ ] Das tatsächlich erzeugte Zarf-Paket liefert einen prüfbaren finalen Paketinhalt für die nachgelagerte Artefaktprüfung vor Publish oder Übergabe (OBJ-22)
- [ ] Paket-Import in einer getrennten Zielumgebung ist vollständig dokumentiert (`docs/offline-install.md`, OBJ-2)
- [ ] Paket ist in einer Zielumgebung ohne Internetzugang reproduzierbar importierbar (OBJ-20)
- [ ] `zarf.yaml` enthält exakte Image-Referenzen mit SHA-Digest (kein `latest`)
- [ ] Zarf-Paket-Build schlägt fehl, wenn ein referenziertes Image nicht in Harbor verfügbar ist
- [ ] Pro Paket wird ein Übergabe-Nachweis geführt (Version, Erstellzeitpunkt, Prüfsumme, verantwortliche Rolle, Zielumgebung)
- [ ] Paket enthält oder referenziert eine manifestierte Dateiliste mit Größen- und Integritätsangaben
- [ ] Package-Varianten sind klar definiert und benannt: `minimal` enthält Images + Manifeste + Argo-Definitionen; `full` enthält zusätzlich Trivy-Offline-DB und optionale Debugging-Tools; die Variante ist im Übergabe-Nachweis explizit ausgewiesen
- [ ] Das Zarf-Paket darf nur nach bestandenem Security-Gate (OBJ-17) als Release-Artefakt freigegeben werden; ein Paket-Build ohne Gate-OK ist als "not released" zu markieren und darf nicht offiziell übergeben werden

## Edge Cases
- Was wenn der Zarf-Build fehlschlägt weil ein Image nicht in Harbor verfügbar ist? → Klarer Build-Fehler; Release-Pipeline bricht ab; kein unvollständiges Paket wird veröffentlicht
- Was wenn die `zarf.yaml` nicht mit den tatsächlichen Manifesten übereinstimmt? → Zarf-Paket-Validierung als CI-Schritt; Inkonsistenz wird als Build-Fehler gemeldet
- Was wenn das Paket zu gross wird (viele Images)? → Image-Optimierung (Multi-Stage-Builds, Alpine-Basis); Grössen-Check als CI-Schritt
- Was wenn das Zarf-Paket vollständig ist, aber eine unerlaubte Datei enthält? → Nachgelagerte Artefaktprüfung blockiert Publish und Offline-Weitergabe bis das Paket bereinigt ist
- Was wenn Argo-CD-Versionen zwischen Entwicklungs- und Zielumgebung abweichen? → Kompatibilitätshinweise in `docs/zarf.md` und `docs/argocd.md`
- Was wenn das Zarf-Paket in der Zielumgebung nicht importiert werden kann? → Detaillierte Fehlermeldung von Zarf; Troubleshooting-Abschnitt in `docs/offline-install.md`
- Was wenn der USB-Transfer unvollständig ist? → Prüfsummenvergleich schlägt fehl; Import wird vor Ausführung abgebrochen
- Was wenn ein Paket für eine falsche Zielumgebung verwendet wird? → Varianten-Metadaten markieren Umgebung und erlaubte Nutzung klar

## Technical Requirements
- Tool: Zarf CLI (aktuelle stabile Version)
- Paketdefinition: `zarf.yaml` im Repository-Root
- Image-Referenzen: Mit SHA-Digest (nicht `latest`) für Reproduzierbarkeit
- Paket-Build: `zarf package create` in der CI-Pipeline (OBJ-1)
- Paket-Inhalt: Container-Images (aus Harbor, OBJ-18), Helm Charts / K8s-Manifeste (OBJ-10), Argo-CD-Definitionen (OBJ-21)
- Git-Zielmodell: Release-Projekt (aus Zarf-Release importierbar) und separates Konfigurationsprojekt in Gitea
- Dokumentation: `docs/zarf.md` (Paketstruktur, Build, Import) und `docs/offline-install.md` (Schritt-für-Schritt-Anleitung, OBJ-2)
- Offline-DB: trivy-Datenbankdump als optionaler Bestandteil für Security-Scans in Zielumgebung
- Nachweisführung: Paket-Prüfsumme, Inhaltsmanifest und Übergabeprotokoll sind Pflichtartefakte pro Release
- Variantensteuerung: klarer Minimal-/Vollumfang mit konsistenter Benennung und Freigaberegel

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
### Scope
In Scope:
- Standardisierter Zarf-Packaging-Flow pro Release inkl. Nachweisführung.
- Paketzuschnitt für Airgap-Transfer mit klarer Variante (minimal/full).
- Bereitstellung von Release- und Konfigurationsquellen für spätere Zielimports.

Out of Scope:
- Laufender Clusterbetrieb nach Import (OBJ-20/OBJ-21).
- Fachliche DNS-Logik.
- Direkte Confluence- oder externe Tool-Synchronisation als Primärprozess.

### Component Structure (Visual Tree)
```text
Offline Package Flow (OBJ-19)
+-- Input Sources
|   +-- Published OCI Images (OBJ-18)
|   +-- Helm/K8s Deployment Bundles
|   +-- Argo CD App-of-Apps Definitions
|   +-- Release + Config Gitea Snapshots
|   +-- Optional Offline Security DB
+-- Zarf Package Builder
|   +-- Package Definition (zarf.yaml)
|   +-- Variant Selection (minimal/full)
|   +-- Integrity Manifest + Checksums
+-- Validation Layer
|   +-- OBJ-22 Artifact Content Check
|   +-- Reproducibility Check
+-- Output Layer
    +-- Zarf Package Artifact
    +-- Transfer Bundle for USB Handover
    +-- Release Evidence Entry
```

### Data Model (plain language)
- **Package Descriptor:** Version, Variante, Erstellungszeit, verantwortliche Rolle.
- **Content Manifest:** Liste aller enthaltenen Images/Dateien mit Digest oder Prüfsumme.
- **Transfer Record:** Übergabedatum, Zielumgebung, Integritätsprüfung vor/nach Transfer.
- **Source Mapping:** Referenz auf Release-Projekt und separates Konfigurationsprojekt.

### Technical Decisions
- Zarf wird zentral genutzt, um Airgap-Installationen reproduzierbar zu machen.
- Variantenmodell (minimal/full) verhindert überladene Pakete bei einfachen Zielumgebungen.
- Integritätsnachweise sind Pflicht, weil USB-Transfers sonst schwer auditierbar sind.
- Gitea-Release plus separates Konfigurationsprojekt halten Runtime-Konfiguration klar getrennt.
- Package-Build ist Teil der Pipeline, damit Prozess und Ergebnis nicht manuell auseinanderlaufen.

### Dependencies and Interfaces
- OBJ-18 liefert freigegebene Artefakte als Input.
- OBJ-22 prüft finalen Paketinhalt vor Übergabe.
- OBJ-21 definiert GitOps-Struktur, die ins Paket einfließt.
- OBJ-20 konsumiert das Paket für Zielimport und Rehydrierung.

### QA Readiness
- Testbar ist, dass ein Paket ohne fehlende Artefakte erzeugt wird.
- Testbar ist, dass Prüfsummen und Inhaltsmanifest konsistent sind.
- Testbar ist, dass Varianten korrekt unterschieden werden.
- Testbar ist, dass Paket plus Nachweisdokumente für eine Zielumgebung vollständig vorliegen.

## QA Test Results
_To be added by /qa_

## Deployment
### Deployment-Status (Stand: 2026-04-11)
- Auslieferung erfolgt Git-first ueber Branch/PR/Merge nach `main`.
- Release- und Export-Nachweise werden in `docs/releases/` und `docs/exports/EXPORT-LOG.md` dokumentiert.
- Confluence bleibt Sekundaerziel: Export erst nach gepflegter Git-Dokumentation.
- Falls **Production Ready: NO** gilt, bleibt das Deployment als vorbereitet markiert und wird erst nach Freigabe produktiv ausgerollt.

## Implementation Update
- `zarf.yaml` im Repo-Root angelegt als versionierte OBJ-19-Grundstruktur mit klar kommentierten OCI-/Digest-Platzhaltern, Deployment-Artefakten, GitOps-Quellen und optionalem Offline-Security-Baustein.
- Beispiel-Metadaten fuer `minimal` und `full` unter `artifacts/offline-package/` angelegt:
  - `INDEX.json`
  - `manifest.json`
  - `SHA256SUMS.txt`
  - `handover.json`
- Server-seitiges Datenmodell und Loader in `src/lib/obj19-offline-package.ts` umgesetzt.
- API-Endpunkt `GET /api/v1/offline-package` umgesetzt fuer Summary, Filter nach Version/Variante und Paketkatalog.
- GUI `/offline-package` umgesetzt als lokale Management-/Plattform-Sicht auf Paketvarianten, Integritaetsnachweise und Handover-Status.
- Doku in `docs/zarf.md` und `docs/offline-install.md` um OBJ-19-Variante, Transferpflichtsatz, Preflight und GUI/API-Nutzung ergaenzt.
