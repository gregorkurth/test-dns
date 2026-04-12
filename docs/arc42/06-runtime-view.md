# arc42 Kapitel 6: Laufzeitsicht

## 6.1 Ziel

Dieses Kapitel beschreibt die wichtigsten Laufzeitablaeufe mit Fokus auf
Anwenderfluss, Betriebsfluss, Releasefluss und Nachweisfluss.

## 6.2 Szenario R-01: Login und Zugriff auf Capabilities

```mermaid
sequenceDiagram
  actor U as Benutzer
  participant UI as Web GUI
  participant API as /api/v1/auth/login
  participant OIDC as OIDC/Keycloak
  participant CAP as /api/v1/capabilities

  U->>UI: Login starten
  UI->>API: POST login (local/oidc)
  API->>OIDC: optional Tokenpruefung
  OIDC-->>API: Claims / Rollen
  API-->>UI: Session + Access Token
  UI->>CAP: GET capabilities (Bearer)
  CAP-->>UI: Capability Baum + Metadaten
```

Ergebnis:

- Rolle ist gesetzt (viewer/operator/admin)
- Zugriff auf geschuetzte Sichten ist aktiviert

## 6.3 Szenario R-02: Participant-Konfiguration bis Zone-File

```mermaid
sequenceDiagram
  actor O as Operator
  participant CFG as Participant Config UI
  participant API as /api/v1/participants
  participant ZGEN as /api/v1/zones/generate
  participant EXP as Export UI

  O->>CFG: Teilnehmerdaten erfassen
  CFG->>API: POST/PUT participant
  API-->>CFG: Validiertes Objekt
  O->>CFG: Zone-Generierung starten
  CFG->>ZGEN: POST generation payload
  ZGEN-->>CFG: BIND9-konformer Text
  O->>EXP: Paket exportieren
```

Ergebnis:

- konsistente Konfiguration
- generierte Forward/Reverse Zone-Files
- exportierbares Paket fuer Zielbetrieb

## 6.4 Szenario R-03: Test Operator Intervalllauf (15 Minuten)

```mermaid
sequenceDiagram
  participant TOP as Test Operator
  participant API as Service API
  participant OTL as OTel Collector
  participant CH as ClickHouse
  participant GRA as Grafana

  loop alle 15 Minuten
    TOP->>API: Smoke- und Integrationschecks
    API-->>TOP: Status + Daten
    TOP->>OTL: OTLP Events/Metriken/Logs
    OTL->>CH: Persistenz
    GRA->>CH: Dashboard Queries
  end
```

Ergebnis:

- periodische Testnachweise ohne manuelles Triggern
- konsolidierbare QA-/Release-Sicht

## 6.5 Szenario R-04: Release bis Offline-Import

1. Feature ist in Git inkl. Doku, Tests, QA und DoD-Nachweis abgeschlossen.
2. Releaseversion wird im Format `YYYY.MM.N` gesetzt.
3. Build, Security-Scans, Artefakt-Gates und Validation Matrix laufen.
4. Artefakte werden als OCI/Helm/Zarf vorbereitet.
5. Transfer in Zielumgebung (z. B. USB) wird protokolliert.
6. Import nach Gitea und Deployment ueber Argo CD App-of-Apps.
7. Export-Protokoll und Release-Notizen werden nachgezogen.

Ergebnis:

- reproduzierbarer, auditable Lieferpfad von Quelle bis Zielcluster

## 6.6 Szenario R-05: Baseline laden, Aenderung protokollieren, Rollback

1. Baseline-Konfiguration wird aus separatem Git-Repository geladen.
2. Aenderung erzeugt nachvollziehbaren History-Eintrag.
3. Unterschiede sind in Verlauf/Detail einsehbar.
4. Bei Bedarf wird gezielter Rollback auf definierten Stand ausgefuehrt.
5. Test-/Nachweisstatus wird aktualisiert.

Ergebnis:

- jeder DNS-relevante Eingriff ist nachvollziehbar und rueckgaengig machbar

## 6.7 Fehlerszenarien und erwartetes Verhalten

| Fehlerfall | Erwartetes Verhalten |
|---|---|
| OIDC nicht erreichbar | lokaler Hinweis, definierter Fallback oder klarer Blocker |
| OTel Endpoint nicht erreichbar | lokales Spooling, kein stiller Datenverlust |
| Policy-Verstoss beim Deployment | Deployment wird blockiert, Befund wird sichtbar |
| Export ohne Vollstaendigkeit | Gate verhindert Freigabe |
| Statuskonflikt in Doku | Status-Sync-Check faellt rot aus |

## 6.8 Pflege-Trigger

Kapitel 6 wird aktualisiert bei:

- neuen Kernablaeufen (z. B. neuer Operator-Loop, neuer Importpfad)
- geaenderten Freigabe-/Exportregeln
- geaenderten Fehlerbehandlungsstrategien

## 6.9 Verbindliche Quellen

- `docs/QUICK-GUIDE-FEATURE-UND-REQUIREMENT.md`
- `docs/CONFLUENCE-EXPORT-GUIDE.md`
- `features/OBJ-14-release-management.md`
- `features/OBJ-19-zarf-paket-offline-weitergabe.md`
- `features/OBJ-24-dns-baseline-config-repository.md`
- `features/OBJ-26-test-operator-scheduled-execution.md`
