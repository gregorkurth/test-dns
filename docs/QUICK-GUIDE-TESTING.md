# Quick Guide: Testing (einfach erklaert)

Dieser Guide erklaert Testing so, dass auch Nicht-Entwickler es schnell verstehen.
Kurz gesagt:

1. Wir sagen, **was** getestet werden muss.
2. Wir testen es (automatisch + manuell).
3. Wir speichern den **Beweis**.
4. Wir zeigen den Status im Dashboard.

## Ziel

Jeder soll klar sehen koennen:
- Welche Tests sind **Passed**
- Welche Tests sind **Failed**
- Welche Tests sind **Never Executed**
- Welches OBJ/Feature ist bereit fuer Release

## Start in 7 Schritten

## Schritt 1: Was testen wir?

- Feature oeffnen: `features/OBJ-*.md`
- Requirements pruefen: `capabilities/**/requirements/*.md`
- Wichtiger Grundsatz: Jeder wichtige Requirement-Punkt braucht mindestens einen Testfall.

## Schritt 2: Testfaelle vorbereiten

Es gibt zwei Testarten:

1. Automatisch
   Ort: `capabilities/**/tests/auto/`

2. Manuell
   Ort: `capabilities/**/tests/manual/`

Wenn etwas nicht klar ist: erst Testfall sauber machen, dann testen.

## Schritt 3: Automatische Tests ausfuehren

Im Projektordner:

```bash
npm run test:run
```

Optional vor Release:

```bash
npm run lint
npm run build
```

## Schritt 4: Manuelle Tests ausfuehren

- Testschritte stehen in: `capabilities/**/tests/manual/*.md`
- Optionaler Web-Einstieg:
  - `http://localhost:3000/test-runner` (wenn Next.js lokal laeuft)

Wichtig: Bei manuellen Tests immer notieren, ob Schritt bestanden hat oder nicht.

## Schritt 5: Testnachweise speichern

Nachweise (Evidence) kommen ins Repo, zum Beispiel nach:
- `tests/results/`
- `tests/executions/`

Ziel: Spaeter muss jeder nachvollziehen koennen, **wann** und **warum** ein Teststatus entstanden ist.

## Schritt 6: Status im Dashboard pruefen

Teststatus-Sicht:
- `http://localhost:3000/test-execution-dashboard`
- oder Live-Variante: `test-execution-dashboard-live/index.html`

Hier sieht man:
- Aktueller Stand
- Pro OBJ
- Pro Release
- Pro Run

## Schritt 7: QA-Ergebnis dokumentieren

Im Feature-Dokument (`features/OBJ-*.md`) den Abschnitt `QA Test Results` aktualisieren:
- ACs: pass/fail
- gefundene Bugs (Severity + Repro-Schritte)
- Security-Check
- Ergebnis: Production Ready = YES/NO

## Wo sehe ich welches Resultat?

| Frage | Ort |
|---|---|
| Welche Tests gibt es? | `capabilities/**/tests/` |
| Was kam raus? | `tests/results/`, `tests/executions/` |
| Wie ist der Gesamtstatus? | `test-execution-dashboard` (OBJ-23) |
| Ist das Feature QA-abgenommen? | `features/OBJ-*.md` unter `QA Test Results` |
| Ist es im Review? | `features/INDEX.md` |

## Mini-Checkliste (Definition of Done fuer Testing)

- [ ] Testfaelle fuer auto/manual vorhanden
- [ ] Automatische Tests gelaufen
- [ ] Manuelle Tests gelaufen (falls noetig)
- [ ] Nachweise im Repo abgelegt
- [ ] Dashboard zeigt korrekten Status
- [ ] QA-Abschnitt im Feature aktualisiert
- [ ] Offene Bugs priorisiert

Wenn alles erfuellt ist, ist Testing sauber dokumentiert und nachvollziehbar.
