# Service Vision & Scope (SVC)

## Serviceziel

Ein airgapped-faehiger DNS-Management-Service fuer Mission Network Operators, der die Verwaltung und Generierung von DNS-Konfigurationen fuer FMN Mission Networks vereinfacht. Der Service visualisiert die Capabilities-Hierarchie (CAP-001 Domain Naming) und erzeugt BIND9-konforme Zone-Files direkt aus Konfigurationsdaten ohne externe Abhaengigkeiten.

## Zielgruppen

**Mission Network Operators (MNOs)**
- Betreiben DNS-Infrastruktur in foederierten Mission Networks (FMN/CWIX)
- Konfigurieren BIND9, Zone-Files, TSIG-Keys und Anycast-DNS
- Muessen Konfigurationen gegen FMN-Requirements (SREQ-xxx) validieren
- Arbeiten oft in airgapped Umgebungen ohne Internetzugang
- Verwenden Konfigurationsformulare wie das CHE CC-517 DNS Configuration Form

## Service-Bausteine (Roadmap)

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
| 4 – P1 DNS | P1 | OBJ-23: Test Execution Dashboard | In Review |
| 5 – Plattform | P1 | OBJ-10: Kubernetes Deployment | Planned |
| 5 – Plattform | P1 | OBJ-11: Monitoring & Observability (OpenTelemetry) | Planned |
| 5 – Plattform | P1 | OBJ-12: Security & Authentifizierung | Planned |
| 5 – Plattform | P2 | OBJ-13: Kubernetes Operator | Planned |
| 6 – Abschluss | P1 | OBJ-14: Release Management | Planned |
| 6 – Abschluss | P1 | OBJ-15: Produkt-Website | Planned |
| 6 – Abschluss | P1 | OBJ-16: Maturitaetsstatus / Reifegraduebersicht | Planned |
| 6 – Abschluss | P1 | OBJ-17: SBOM & Security-Scanning | Planned |
| 6 – Abschluss | P1 | OBJ-22: Release-Artefaktpruefung / Publish-Gate | Planned |
| 6 – Abschluss | P1 | OBJ-18: Artefakt-Registry (Harbor / Nexus) | Planned |
| 6 – Abschluss | P1 | OBJ-19: Zarf-Paket / Offline-Weitergabe | Planned |
| 6 – Abschluss | P1 | OBJ-20: Zielumgebung / Import / Rehydrierung | Planned |
| 6 – Abschluss | P1 | OBJ-21: GitOps / Argo CD / App-of-Apps | Planned |

## Erfolgskriterien

- Operator kann in < 10 Minuten eine vollstaendige DNS-Konfiguration fuer einen neuen Teilnehmer erfassen
- Generierte Zone-Files sind direkt in BIND9 verwendbar (keine manuelle Nachbearbeitung)
- Alle P0-Features funktionieren ohne Internetverbindung
- Konfiguration deckt alle SREQ-xxx Requirements aus FMN Spiral 5 ab
- Jedes freigegebene Release besteht eine dokumentierte Pruefung des tatsaechlich erzeugten Release-Artefakts vor Publish, Export und Offline-Weitergabe
- Pro Release ist der kombinierte Teststatus (manual + auto) transparent: Passed, Failed, Never Executed

## Rahmenbedingungen

- **Airgapped:** Keine externen APIs, kein CDN, keine Cloud-Dienste
- **Deployment:** Next.js Web-App, lokal oder auf einem internen Server betreibbar
- **Template-Konformitaet:** Release- und Publish-Artefakte muessen vor Freigabe gegen eine versionierte Inhaltsrichtlinie geprueft werden
- **Zieltermin:** Betriebsbereit fuer CWIX 2026
- **Team:** Kleines Team, iteratives Vorgehen

## Nicht-Ziele

- Kein Live-DNS-Monitoring oder Betrieb von BIND9 aus der App heraus
- Keine User-Accounts oder Multi-User-Authentifizierung in v1 (Security/Auth in OBJ-12 fuer v2 geplant)
- Kein externes DBMS in v1 (stateless, file-based)
- Kein Support fuer nicht-FMN DNS-Implementierungen

---

_Zuletzt aktualisiert: 2026-04-06_
