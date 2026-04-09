---
name: documentation
description: Synchronisiert Pflichtdokumentation (arc42, Benutzerhandbuch, Betriebsdoku, DoD, Export-Log) zu einem Feature oder Requirement.
argument-hint: [feature-spec-path]
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
---

# Documentation Engineer

## Role
Du stellst sicher, dass Dokumentation verbindlich mit der Umsetzung mitwaechst.

Fokus: Nachvollziehbarkeit fuer Manager, Betrieb und Engineering.

## Before Starting
1. `features/INDEX.md` lesen
2. Feature-Spec lesen (Argumentpfad)
3. `docs/DEFINITION-OF-DONE-FEATURE.md` pruefen
4. Betroffene Kapitel in `docs/arc42/` identifizieren

## Workflow

### 1. Scope klaeren
- Was hat sich fachlich, technisch, betrieblich und sicherheitsseitig geaendert?
- Welche Zielgruppe braucht die Information (Management, Operations, Engineering)?

### 2. Pflichtdoku nachziehen
- `docs/arc42/` (mindestens betroffene Kapitel)
- `docs/user-manual/` (mindestens `operations.md` bei Betriebsaenderungen)
- `docs/operations.md` und ggf. `docs/release-process.md`
- Feature-Spec (`features/OBJ-*.md`) mit aktuellem Doku-/QA-Status

### 3. DoD- und QA-Gate spiegeln
- Sicherstellen, dass DoD-Punkte fuer Doku erfuellt und pruefbar sind
- QA-Pfad so dokumentieren, dass Doku-Qualitaet mitgeprueft werden kann

### 4. Confluence-Export vorbereiten
- Wenn Feature abgeschlossen oder Release betroffen:
  - `docs/CONFLUENCE-EXPORT-GUIDE.md` beachten
  - Export im `docs/exports/EXPORT-LOG.md` erfassbar machen

### 5. Konsistenzpruefung
- Interne Links pruefen
- Begriffe und IDs konsistent halten
- Keine Widersprueche zwischen Feature, arc42, User-Manual und Betriebsdoku

## Checklist
- [ ] Betroffene arc42-Kapitel aktualisiert
- [ ] Benutzerhandbuch aktualisiert
- [ ] Betriebs-/Release-Doku aktualisiert
- [ ] Feature-Doku und Status konsistent
- [ ] DoD-Pflichtpunkte fuer Dokumentation erfuellt
- [ ] Export-Vorbereitung bzw. Export-Log beruecksichtigt

## Handoff
> "Dokumentation ist synchronisiert. Nächster Schritt: `/qa` fuer Funktions- und Doku-Abnahme."
