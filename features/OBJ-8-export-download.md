# OBJ-8: Export & Download

## Status: In Progress
**Created:** 2026-03-17
**Last Updated:** 2026-04-09

## Dependencies
- OBJ-5 (Participant Configuration Form) – Konfigurationsdaten
- OBJ-6 (DNS Zone File Generator) – Generierte Zone-Files

## User Stories
- Als Mission Network Operator möchte ich alle generierten Konfigurationsdateien (Zone-Files, TSIG-Key-Vorlage, named.conf-Snippet) als ZIP-Paket herunterladen, damit ich sie direkt auf mein System übertragen kann.
- Als Operator möchte ich die aktuelle Konfiguration als JSON exportieren, damit ich sie auf einem anderen Gerät importieren kann.
- Als Operator möchte ich eine ausgefüllte FMN DNS Configuration Form als PDF exportieren, damit ich sie für die Mission-Koordination verwenden kann.
- Als Operator möchte ich eine TSIG-Key-Vorlage herunterladen, damit ich die Zone-Transfer-Sicherheit (SREQ-529) konfigurieren kann.

## Acceptance Criteria
- [ ] `feat~obj-8-ac-1~1` "Alles herunterladen"-Button generiert ZIP-Archiv mit Forward Zone-File(s), Reverse Zone-File(s), named.conf-Snippet und TSIG-Key-Vorlage (Shell-Kommandobeispiel)
- [ ] `feat~obj-8-ac-2~1` Dateinamen im ZIP sind sprechend: `{zone-name}.zone`, `{zone-name}.reverse.zone`, `named.conf.local.snippet`, `tsig-keygen.sh`
- [ ] `feat~obj-8-ac-3~1` Einzeln-Download fuer jede Datei ist ebenfalls moeglich
- [ ] `feat~obj-8-ac-4~1` Konfiguration ist als JSON exportierbar (`{cc-number}-dns-config.json`)
- [ ] `feat~obj-8-ac-5~1` JSON-Konfiguration kann wieder importiert werden (Formular wird befuellt)
- [ ] `feat~obj-8-ac-6~1` Export funktioniert vollstaendig offline (kein Server)
- [ ] `feat~obj-8-ac-7~1` Wenn Konfiguration unvollstaendig ist, bleibt der Exportbutton deaktiviert mit Tooltip "Bitte zuerst alle Pflichtfelder ausfuellen"

## Edge Cases
- ZIP-Generierung bei sehr vielen Zonen → Fortschritts-Indikator oder asynchrone Generierung
- Browser blockiert Download (z.B. Popup-Blocker) → Fallback: Direktlink anzeigen
- JSON-Import mit veralteter Schema-Version → Warnung "Format veraltet, einige Felder wurden nicht importiert"
- Dateiname enthält Sonderzeichen (z.B. Punkte in Zone-Namen) → Sanitierung des Dateinamens

## Technical Requirements
- ZIP-Generierung via `jszip` (lokal gebundelt für Offline)
- PDF-Export via `@react-pdf/renderer` oder `html2pdf.js` (lokal gebundelt)
- Exportfunktionen arbeiten ohne externe Dienste und ohne Cloud-Abhaengigkeit
- Exportmanifest (Dateiname, Zeitstempel, Quelle, Version) wird mit dem Paket gespeichert
- Importvalidierung fuer JSON muss Schema-Version und Pflichtfelder pruefen

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Scope**

OBJ-8 stellt sicher, dass Operatoren aus einem fertigen Konfigurationsstand sofort transportfaehige Artefakte erzeugen koennen: einzeln oder als Gesamtpaket.
Die Funktion ist voll offlinefaehig und unterstuetzt sowohl technische Uebergabe als auch Abstimmung mit Fachstellen.

**Komponentenstruktur (Visual Tree)**

```
Export & Download Page
+-- Header / Kontext
|   +-- Aktiver Participant + Stand
+-- Export-Aktionen
|   +-- "Alles herunterladen" (ZIP)
|   +-- Einzel-Download je Datei
|   +-- JSON Export
|   +-- JSON Import
|   +-- FMN-Formular PDF Export
+-- Ergebnis / Validierung
|   +-- Export-Status
|   +-- Fehlermeldungen bei unvollstaendiger Konfiguration
+-- Manifest-Vorschau
    +-- enthaltene Dateien
    +-- Versions- und Zeitstempel
```

**Datenmodell (in einfachen Worten)**

Ein Exportlauf erzeugt:
- `files[]`: Liste aller zu exportierenden Inhalte (Zone, Reverse, TSIG, Snippet, JSON, optional PDF)
- `manifest`: Metadaten mit Participant-ID, Version, Erstellzeit, Schema-Version
- `validation`: Ergebnis vor Export (`ok`/`error` + Hinweise)

**Technische Leitentscheidungen (fuer PM)**

- ZIP als Standard reduziert Fehler bei manueller Datei-Zusammenstellung.
- JSON Export/Import ermoeglicht kontrollierten Geraetewechsel ohne Datenverlust.
- PDF-Export deckt Abstimmungs- und Freigabeprozesse ausserhalb der Entwicklungswerkzeuge ab.
- Dateinamenstandard und Manifest verbessern Nachvollziehbarkeit in Audits.

**Dependencies (Packages)**

- `jszip` fuer ZIP-Buendelung im Browser.
- `@react-pdf/renderer` (oder `html2pdf.js`) fuer den lokalen PDF-Export.

**Requirements Engineer Input**

- Jeder Exporttyp benoetigt klare Pflichtfelder und eine definierte Fehlermeldung bei Luecken.
- Import ist nur gueltig, wenn Schema-Version und Mindestdaten kompatibel sind.
- Dateinamensregeln muessen fest beschrieben sein, damit automatisierte Pruefungen moeglich sind.

**QA Engineer Input (Readiness)**

- Pflichttests: ZIP-Inhalt, Dateinamensschema, Offline-Export, JSON Roundtrip (Export -> Import).
- Edge-Case-Tests: alte Schema-Version, Sonderzeichen in Zonenamen, unvollstaendige Konfiguration.
- Abnahmekriterium: ein Operator kann ohne Entwicklerhilfe ein korrektes Exportpaket erzeugen und wieder einlesen.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
