---
name: initialisierung
description: Initialisiert ein leeres Git-Repository fuer einen NATO/FMN Service. Nutzt NATO-FMN-Spezifikation, FMN-Serviceformular und app-template.md, um Capabilities, Features, Requirements, Teststubs, arc42-Doku und Basis-Repositorystruktur vollstaendig zu erzeugen.
argument-hint: [--nato-spec pfad/datei] [--fmn-form pfad/datei] [--app-template req-init/app-template.md] [--service-name "Name"] [--lang de|en|bilingual] [--mode greenfield|update]
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
model: opus
---

# Initialisierungs Engineer (Greenfield)

## Ziel

Erzeuge aus drei Quellen ein vollstaendig initialisiertes Service-Repository:
- NATO FMN Spezifikation (`--nato-spec`)
- FMN Service-/Formularspezifikation (`--fmn-form`)
- App-Template (`--app-template`, Standard: `req-init/app-template.md`)

Ergebnis: Capabilities, Features, Requirements, Tests, Doku und Indizes sind konsistent erstellt und untereinander verlinkt.

Nutze diese Skill besonders dann, wenn das Git-Projekt leer oder fast leer ist und der komplette Projekt-Start automatisiert werden soll.

## Eingaben und Modus

Pflicht:
- `--nato-spec` (mehrfach erlaubt)
- `--fmn-form` (mehrfach erlaubt)

Optional:
- `--app-template` (Default: `req-init/app-template.md`)
- `--service-name` (wenn leer: aus Spezifikation ableiten)
- `--lang de|en|bilingual` (Default `de`)
- `--mode greenfield|update` (Default `greenfield`)

Ohne Argumente:
- Interaktiv nachfragen (Dateipfade, Sprache, Servicename, Modus).

## Vorbedingungen

1. Repository-Kontext lesen:
- `docs/SVC.md` (falls vorhanden)
- `features/INDEX.md` (falls vorhanden)
- `capabilities/INDEX.md` (falls vorhanden)

2. Greenfield pruefen:
- Wenn zentrale Dateien fehlen, `greenfield` nutzen.
- Wenn vieles schon existiert, `update` nutzen und nichts ungefragt ueberschreiben.

3. Quellen-Inventar erstellen und bestaetigen lassen:
- Dateiname, Typ, Quellentyp `[NATO]`/`[CUST]`/`[ARCH]`, Prioritaet, Kurzinhalt.

## Prioritaets- und Konfliktregeln

Bei inhaltlichen Konflikten immer so aufloesen und dokumentieren:
1. `[NATO]` (FMN/NATO Spezifikation)
2. `[ARCH]` (App-Template/Architekturvorgaben)
3. `[CUST]` (Serviceformular/Kundenvorgaben)
4. `[INT]` (interne Entscheidung)

Wenn zwei Anforderungen kollidieren:
- Konflikt explizit im Requirement dokumentieren
- Massgebliche Quelle begruenden
- Referenz auf das ueberstimmte Requirement hinterlegen

## Arbeitsphasen

### Phase 1: Anforderungen extrahieren

1. NATO/FMN-Dokumente sequentiell lesen (vollstaendig).
2. Anforderungen in ein konsolidiertes Register ueberfuehren:
- ID
- Quelle `[NATO]/[ARCH]/[CUST]/[INT]`
- Prioritaet `MUSS/SOLLTE/KANN/INFO`
- Ziel-Service und Service Function
- Originaltext + Uebersetzung (wenn relevant)
3. Deduplizieren, Konflikte markieren.

### Phase 2: Projektstruktur anlegen

Lege die Basisstruktur gemaess `references/bootstrap-artefakte.md` an.

Mindestens:
- `capabilities/`
- `features/`
- `docs/`
- `docs/arc42/`
- `docs/adr/`
- `docs/exports/`

Wenn schon vorhanden:
- nur fehlende Dateien anlegen
- bestehende Inhalte nicht ungefragt ersetzen

### Phase 3: Capabilities erzeugen

Nutze nach Moeglichkeit die Vorlagen aus:
- `.agents/skills/capabilities/templates/`

Erzeuge:
- `capabilities/INDEX.md`
- pro Capability: `README.md`, `maturity.md`, `products.md`
- pro Service: `README.md`
- pro Service Function: `README.md`
- pro Requirement: Datei in `requirements/`
- pro Requirement: Auto- und Manual-Teststub in `tests/auto` und `tests/manual`

### Phase 4: Features erzeugen

Nutze:
- `.agents/skills/requirements/template.md`

Regeln:
- OBJ-IDs fortlaufend (`OBJ-1`, `OBJ-2`, ...)
- eine Feature-Spec pro fachlicher Einheit
- Abhaengigkeiten explizit eintragen
- `features/INDEX.md` inkl. `Next Available ID` pflegen
- Status initial auf `Planned`

Mindestumfang:
- Alle aus den Spezifikationen erkannten fachlichen Features
- Alle aus `app-template.md` geforderten Plattform-/Betriebs-Features

### Phase 5: Dokumentation erzeugen

Erzeuge/aktualisiere mindestens:
- `docs/SVC.md`
- `docs/README.md`
- `docs/arc42/README.md` und Kapitel `01` bis `12`
- `docs/adr/INDEX.md`
- `docs/DEFINITION-OF-DONE-FEATURE.md`
- `docs/CONFLUENCE-EXPORT-GUIDE.md`
- `docs/QUICK-GUIDE-FEATURE-UND-REQUIREMENT.md`
- `docs/QUICK-GUIDE-TESTING.md`
- `docs/exports/EXPORT-LOG.md`

Dokumentationsregeln aus `app-template.md` uebernehmen:
- Draw.io Diagrammstandard (`source`/`export`)
- Update-Hinweise im GUI
- OTel `local`/`clickhouse` Varianten
- Source of Truth: erst Git, dann Export

### Phase 6: Traceability und Verlinkung

Sicherstellen:
- jede Service Function hat Requirements
- jedes Requirement hat 2 Teststubs (auto/manual)
- Feature -> Capability-/Requirement-Bezug ist nachvollziehbar
- arc42 referenziert relevante Features/Capabilities
- keine Platzhalter `{{...}}` verbleiben

### Phase 7: Validierung

Fuehre vor Abschluss mindestens aus:
- `rg -n "{{|TODO"` in `capabilities features docs`
- `rg -n "^# OBJ-" features/OBJ-*.md`
- `rg -n "RDTS-|SREQ-|CREQ-|IREQ-" capabilities`
- Link- und Index-Sanity-Check (Dateien existieren, auf die verwiesen wird)

## Ausgabeformat an den Nutzer

Liefere am Ende:
1. Erstellte Hauptartefakte (kurz gruppiert)
2. Anzahl Capabilities, Services, SFNs, Requirements, Tests, Features
3. Offene Risiken/Annahmen
4. Empfohlener naechster Schritt (`/architecture` fuer erstes OBJ)

## Guardrails

- Nie Quellanforderungen erfinden, wenn sie nicht aus den Inputs ableitbar sind.
- Unklare Punkte als `[INT]` kennzeichnen und transparent begruenden.
- Bei `update`-Modus keine bestehenden Inhalte stillschweigend ueberschreiben.
- Keine Implementierungslogik in `src/` erzwingen; Fokus ist Initialisierung, Struktur und Nachweisfaehigkeit.

## Commit-Empfehlung

```text
feat(init): bootstrap repository from NATO/FMN specs and app template
```
