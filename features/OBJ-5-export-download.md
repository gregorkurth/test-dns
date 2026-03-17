# OBJ-5: Export & Download

## Status: Planned
**Created:** 2026-03-17
**Last Updated:** 2026-03-17

## Dependencies
- OBJ-2 (Participant Configuration Form) – Konfigurationsdaten
- OBJ-3 (DNS Zone File Generator) – Generierte Zone-Files

## User Stories
- Als Mission Network Operator möchte ich alle generierten Konfigurationsdateien (Zone-Files, TSIG-Key-Vorlage, named.conf-Snippet) als ZIP-Paket herunterladen, damit ich sie direkt auf mein System übertragen kann.
- Als Operator möchte ich die aktuelle Konfiguration als JSON exportieren, damit ich sie auf einem anderen Gerät importieren kann.
- Als Operator möchte ich eine ausgefüllte FMN DNS Configuration Form als PDF exportieren, damit ich sie für die Mission-Koordination verwenden kann.
- Als Operator möchte ich eine TSIG-Key-Vorlage herunterladen, damit ich die Zone-Transfer-Sicherheit (SREQ-529) konfigurieren kann.

## Acceptance Criteria
- [ ] "Alles herunterladen"-Button generiert ZIP-Archiv mit: Forward Zone-File(s), Reverse Zone-File(s), named.conf-Snippet, TSIG-Key-Vorlage (als Shell-Kommandobeispiel)
- [ ] Dateinamen im ZIP sind sprechend: `{zone-name}.zone`, `{zone-name}.reverse.zone`, `named.conf.local.snippet`, `tsig-keygen.sh`
- [ ] Einzeln-Download für jede Datei ist ebenfalls möglich
- [ ] Konfiguration als JSON exportierbar (`{cc-number}-dns-config.json`)
- [ ] JSON-Konfiguration kann wieder importiert werden (Formular wird befüllt)
- [ ] Export funktioniert vollständig offline (kein Server)
- [ ] Wenn Konfiguration unvollständig → Button deaktiviert mit Tooltip "Bitte zuerst alle Pflichtfelder ausfüllen"

## Edge Cases
- ZIP-Generierung bei sehr vielen Zonen → Fortschritts-Indikator oder asynchrone Generierung
- Browser blockiert Download (z.B. Popup-Blocker) → Fallback: Direktlink anzeigen
- JSON-Import mit veralteter Schema-Version → Warnung "Format veraltet, einige Felder wurden nicht importiert"
- Dateiname enthält Sonderzeichen (z.B. Punkte in Zone-Namen) → Sanitierung des Dateinamens

## Technical Requirements
- ZIP-Generierung via `jszip` (lokal gebundelt für Offline)
- PDF-Export via `@react-pdf/renderer` oder `html2pdf.js` (lokal gebundelt)
- Kein Server-Aufruf für Export-Funktionen

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
