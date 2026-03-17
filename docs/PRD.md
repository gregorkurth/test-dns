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

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | OBJ-1: Capabilities Dashboard | Planned |
| P0 (MVP) | OBJ-2: Participant Configuration Form | Planned |
| P0 (MVP) | OBJ-3: DNS Zone File Generator | Planned |
| P1 | OBJ-4: Requirements Traceability View | Planned |
| P1 | OBJ-5: Export & Download | Planned |

## Success Metrics

- Operator kann in < 10 Minuten eine vollständige DNS-Konfiguration für einen neuen Teilnehmer erfassen
- Generierte Zone-Files sind direkt in BIND9 verwendbar (keine manuelle Nachbearbeitung)
- Alle P0-Features funktionieren ohne Internetverbindung
- Konfiguration deckt alle SREQ-xxx Requirements aus FMN Spiral 5 ab

## Constraints

- **Airgapped:** Keine externen APIs, kein CDN, keine Cloud-Dienste
- **Deployment:** Next.js Web-App, lokal oder auf einem internen Server betreibbar
- **Zieltermin:** Betriebsbereit für CWIX 2026
- **Team:** Kleines Team, iteratives Vorgehen

## Non-Goals

- Kein Live-DNS-Monitoring oder Betrieb von BIND9 aus der App heraus
- Keine User-Accounts oder Multi-User-Authentifizierung (v1)
- Kein Backend/Datenbank in v1 (stateless, file-based)
- Kein Support für nicht-FMN DNS-Implementierungen

---

_Zuletzt aktualisiert: 2026-03-17_
