# Product Requirements Document

## Vision

Ein airgapped-fähiges Web-Tool für Mission Network Operators, das die Verwaltung und Generierung von DNS-Konfigurationen für FMN Mission Networks vereinfacht. Es visualisiert die Capabilities-Hierarchie (CAP-001 Domain Naming) und generiert BIND9-konforme Zone-Files direkt aus den eingegebenen Konfigurationsdaten – ohne externe Abhängigkeiten.

## Target Users

**Mission Network Operators (MNOs)**
- Betreiben DNS-Infrastruktur in föderatierten Mission Networks (FMN/CWIX)
- Konfigurieren BIND9, Zone-Files, TSIG-Keys und Anycast-DNS
- Müssen Konfigurationen gegen FMN-Requirements (SREQ-xxx) validieren
- Arbeiten oft in airgapped Umgebungen ohne Internetzugang
- Verwenden Konfigurationsformulare wie das CHE CC-517 DNS Configuration Form

## Core Features (Roadmap)

| Phase | Priority | Feature | Status |
|-------|----------|---------|--------|
| 1 – Infrastruktur | P1 | OBJ-1: CI/CD Pipeline | Planned |
| 1 – Infrastruktur | P1 | OBJ-2: Dokumentation | Planned |
| 2 – API-Fundament | P1 | OBJ-3: REST API | In Progress |
| 3 – P0 MVP | P0 | OBJ-4: Capabilities Dashboard | Planned |
| 3 – P0 MVP | P0 | OBJ-5: Participant Configuration Form | Planned |
| 3 – P0 MVP | P0 | OBJ-6: DNS Zone File Generator | Planned |
| 4 – P1 DNS | P1 | OBJ-7: Requirements Traceability View | Planned |
| 4 – P1 DNS | P1 | OBJ-8: Export & Download | Planned |
| 4 – P1 DNS | P1 | OBJ-9: Manual Test Runner | Planned |
| 4 – P1 DNS | P1 | OBJ-23: Test Execution Dashboard | In Progress |
| 5 – Plattform | P1 | OBJ-10: Kubernetes Deployment | Planned |
| 5 – Plattform | P1 | OBJ-11: Monitoring & Observability (OpenTelemetry) | Planned |
| 5 – Plattform | P1 | OBJ-12: Security & Authentifizierung | Planned |
| 5 – Plattform | P2 | OBJ-13: Kubernetes Operator | Planned |
| 6 – Abschluss | P1 | OBJ-14: Release Management | Planned |
| 6 – Abschluss | P1 | OBJ-15: Produkt-Website | Planned |
| 6 – Abschluss | P1 | OBJ-16: Maturitätsstatus / Reifegradübersicht | Planned |
| 6 – Abschluss | P1 | OBJ-17: SBOM & Security-Scanning | Planned |
| 6 – Abschluss | P1 | OBJ-22: Release-Artefaktprüfung / Publish-Gate | Planned |
| 6 – Abschluss | P1 | OBJ-18: Artefakt-Registry (Harbor / Nexus) | Planned |
| 6 – Abschluss | P1 | OBJ-19: Zarf-Paket / Offline-Weitergabe | Planned |
| 6 – Abschluss | P1 | OBJ-20: Zielumgebung / Import / Rehydrierung | Planned |
| 6 – Abschluss | P1 | OBJ-21: GitOps / Argo CD / App-of-Apps | Planned |

## Success Metrics

- Operator kann in < 10 Minuten eine vollständige DNS-Konfiguration für einen neuen Teilnehmer erfassen
- Generierte Zone-Files sind direkt in BIND9 verwendbar (keine manuelle Nachbearbeitung)
- Alle P0-Features funktionieren ohne Internetverbindung
- Konfiguration deckt alle SREQ-xxx Requirements aus FMN Spiral 5 ab
- Jedes freigegebene Release besteht eine dokumentierte Prüfung des tatsächlich erzeugten Release-Artefakts vor Publish, Export und Offline-Weitergabe
- Pro Release ist der kombinierte Teststatus (manual + auto) transparent: Passed, Failed, Never Executed

## Constraints

- **Airgapped:** Keine externen APIs, kein CDN, keine Cloud-Dienste
- **Deployment:** Next.js Web-App, lokal oder auf einem internen Server betreibbar
- **Template-Konformität:** Release- und Publish-Artefakte müssen vor Freigabe gegen eine versionierte Inhaltsrichtlinie geprüft werden
- **Zieltermin:** Betriebsbereit für CWIX 2026
- **Team:** Kleines Team, iteratives Vorgehen

## Non-Goals

- Kein Live-DNS-Monitoring oder Betrieb von BIND9 aus der App heraus
- Keine User-Accounts oder Multi-User-Authentifizierung in v1 (Security/Auth in OBJ-12 für v2 geplant)
- Kein externes DBMS in v1 (stateless, file-based); API (OBJ-3) nutzt file-basierte Datenhaltung
- Kein Support für nicht-FMN DNS-Implementierungen

---

_Zuletzt aktualisiert: 2026-04-04_
