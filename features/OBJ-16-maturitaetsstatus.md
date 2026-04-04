# OBJ-16: Maturitätsstatus / Reifegradübersicht

## Status: Planned
**Created:** 2026-04-03
**Last Updated:** 2026-04-04

## Dependencies
- OBJ-4: Capabilities Dashboard (Maturitätsstufen L0–L5 pro Capability)
- OBJ-7: Requirements Traceability View (Anforderungsabdeckung als Grundlage)
- OBJ-9: Manual Test Runner (Teststatus fliesst in Maturitätsstatus ein)
- OBJ-2: Dokumentation (Dokumentationsstatus als Maturitätskriterium)
- OBJ-17: SBOM & Security-Scanning (Security-Status und SBOM-Verfügbarkeit als Maturitätsindikatoren)
- OBJ-19: Zarf-Paket (Offline-/Zarf-Bereitschaft als Maturitätsindikator)
- OBJ-21: GitOps / Argo CD (App-of-Apps-Bereitschaft als Maturitätsindikator)

## User Stories
- Als Mission Network Operator möchte ich den aktuellen Reifegrad der DNS-Konfigurations-App auf einen Blick sehen, damit ich einschätzen kann, ob sie für den Produktiveinsatz bereit ist.
- Als Stakeholder möchte ich eine Übersicht sehen, welche Anforderungen bereits erfüllt sind und welche noch offen sind.
- Als Platform Engineer möchte ich den Teststatus der einzelnen Features im Maturitätsstatus sehen.
- Als Mission Network Operator möchte ich die nächsten Meilensteine und offenen Punkte sehen.
- Als Entwickler möchte ich den Maturitätsstatus aus bestehenden Daten (Feature-Status, Teststatus) ableiten können, ohne ihn manuell pflegen zu müssen.
- Als Security-Verantwortlicher möchte ich den Security-Status (SBOM vorhanden, Scans bestanden, kritische Findings offen) im Maturitätsstatus sehen.
- Als Platform Engineer möchte ich sehen, ob die App als Zarf-Paket verfügbar und für den Offline-Einsatz bereit ist.
- Als Platform Engineer möchte ich sehen, ob die App via Argo CD (App-of-Apps) bereitgestellt werden kann.

## Acceptance Criteria
- [ ] Maturitätsstatus-Seite ist im Web GUI erreichbar (Route `/maturity` oder als Tab)
- [ ] Reifegrad wird auf einer Skala angezeigt (L0–L5 angelehnt an NATO Capability Maturity)
- [ ] Übersicht zeigt je Feature: ID, Name, Status (Planned/In Progress/In Review/Deployed), Teststatus
- [ ] Anforderungsabdeckung aus OBJ-7 wird als Prozentsatz angezeigt (x von y SREQ abgedeckt)
- [ ] Offene Punkte (Features nicht deployed, Tests nicht bestanden) werden als Liste dargestellt
- [ ] Nächste Meilensteine (z. B. CWIX 2026) sind konfigurierbar und werden angezeigt
- [ ] Maturitätsstatus wird aus `features/INDEX.md` und QA-Testergebnissen abgeleitet (keine manuelle Pflegeerfordernis)
- [ ] Exportierbar als PDF oder druckfreundliche Ansicht
- [ ] Seite funktioniert vollständig offline
- [ ] Security-Status wird als eigener Indikator angezeigt: SBOM vorhanden (ja/nein), letzte Scans bestanden (ja/nein/ausstehend), kritische Findings offen (Anzahl)
- [ ] Offline-/Zarf-Bereitschaft wird als Indikator angezeigt: Zarf-Paket verfügbar (ja/nein), zuletzt gebaut (Datum)
- [ ] Argo-CD-/App-of-Apps-Bereitschaft wird als Indikator angezeigt: Argo-CD-Manifeste vorhanden (ja/nein), letzter erfolgreicher Sync (Datum oder "Nicht getestet")

## Edge Cases
- Was wenn keine Testdaten vorhanden sind? → Teststatus zeigt "Nicht getestet"; Maturitätslevel bleibt tief
- Was wenn ein Feature deployed ist, aber Tests fehlschlagen? → Warnung im Maturitätsstatus
- Was wenn `features/INDEX.md` nicht geparsed werden kann? → Fehlermeldung; Daten sind manuell als Fallback eingebbar
- Was wenn der PDF-Export keine externe Bibliothek laden kann? → Browser-native Print-Funktion (window.print)
- Was wenn keine SBOM-Daten vorhanden sind? → Security-Indikator zeigt "SBOM nicht verfügbar"; Maturitätslevel bleibt tief
- Was wenn Zarf-Paket-Informationen nicht auslesbar sind? → Indikator zeigt "Nicht getestet"; kein Fehler
- Was wenn Argo-CD-Sync-Status nicht aus dem Repository ablesbar ist? → Indikator zeigt "Status unbekannt" mit Hinweis auf manuelle Prüfung

## Technical Requirements
- Datenquelle: `features/INDEX.md` (build-time geparst) + QA-Testresultate (aus Feature-Specs)
- Reifegrad-Skala: angelehnt an NATO Capability Maturity Level (L0–L5)
- PDF-Export: Browser-native Print-Funktion mit druckoptimierten CSS-Stilen (`@media print`)
- Keine externe Datenquelle oder API-Aufruf für die Berechnung des Maturitätsstatus
- Security-Indikatoren: Statische Metadaten aus Release-Artefakten (z.B. SBOM-Existenz, Scan-Ergebnisdateien) – build-time geladen
- Zarf-Indikator: Metadaten aus `zarf.yaml` (Version, letztes Build-Datum) – build-time geladen
- Argo-CD-Indikator: Metadaten aus Argo-CD-Manifestdateien – build-time geladen

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
