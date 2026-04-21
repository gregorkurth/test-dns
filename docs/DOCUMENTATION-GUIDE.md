# Dokumentations-Guide (Technik)

> Dieser Guide erklärt das gesamte Dokumentations- und Testsystem des DNS Tools.
> Jede Rolle findet hier genau das, was sie wissen muss – nicht mehr.

Wenn du eher Manager, Projektleiter oder Nicht-Entwickler bist, starte zuerst hier:
- `docs/README.md`
- `docs/QUICK-GUIDE-FEATURE-UND-REQUIREMENT.md`
- `docs/arc42/README.md`
- `docs/CONFLUENCE-EXPORT-GUIDE.md`
- `docs/DEFINITION-OF-DONE-FEATURE.md`
- `docs/ID-UND-BENENNUNGSREGELN.md`

Hinweis:
Diese Datei bleibt die technische Sicht (Tools, Befehle, Detailablaeufe).
Die Management-Sicht bleibt im Quick Guide.

---

## Übersicht: Wer macht was?

| Rolle | Werkzeug | Wo? |
|-------|---------|-----|
| **Projektleiter** | Gitea/GitLab Web UI | Im Browser, keine Installation |
| **Entwickler** | Git CLI, pytest, Vitest | Lokal im Terminal |
| **Tester** | Manual Test Runner (`/test-runner`) | Im Browser |
| **CI/CD** | Läuft automatisch | Nach jedem Push |

---

## Für Projektleiter

### Neues Requirement anlegen

1. In Gitea/GitLab: Navigiere zu `capabilities/.../requirements/`
2. Klicke **"Neue Datei"**
3. Name: `SREQ-999.md` (nächste freie Nummer)
4. Inhalt aus `docs/templates/TEMPLATE-requirement.md` kopieren
5. Alle `xxx` durch die Requirement-Nummer ersetzen
6. **Wichtig:** Den OFT-Tag nicht vergessen:
   ```
   `req~sreq-999~1`
   Needs: utest, itest
   ```
7. Klicke **"Commit Changes"** – fertig

Die CI/CD-Pipeline läuft automatisch und zeigt das neue Requirement im Traceability-Report als **nicht gedeckt** (kein Test vorhanden).

---

### Neuen Testfall definieren

**Manueller Testfall:**

1. Navigiere zu `capabilities/.../tests/manual/`
2. Neue Datei: `TEST-SREQ-999-001-manual.md`
3. Inhalt aus `docs/templates/TEMPLATE-test-manual.md` kopieren
4. IDs anpassen:
   - `` `itest~sreq-999-001~1` `` (Testfall-ID)
   - `Covers: req~sreq-999~1` (Requirement, das gedeckt wird)
5. Testschritte ausformulieren
6. Committen

**Automatischer Testfall (Stub):**

1. Navigiere zu `capabilities/.../tests/auto/`
2. Neue Datei: `TEST-SREQ-999-001.md`
3. Inhalt aus `docs/templates/TEMPLATE-test-auto.md` kopieren
4. IDs anpassen
5. Committen → Entwickler implementiert den Python-Code

---

### Neues Architecture Decision Record (ADR) anlegen

ADRs dokumentieren **warum** eine Entscheidung so getroffen wurde. Sie sind unveränderlich.

1. Navigiere zu `docs/adr/`
2. Neue Datei: `0006-kurzer-titel.md` (nächste freie Nummer)
3. Inhalt aus `docs/templates/TEMPLATE-adr.md` kopieren
4. Ausfüllen und committen
5. **Wichtig:** Status zuerst auf `Vorgeschlagen`, nach Entscheid auf `Akzeptiert` ändern

**Wird ein Entscheid revidiert?** Kein bestehens ADR ändern – neues ADR anlegen mit:
```
Status: Ersetzt ADR-0003
```

---

### Traceability-Report lesen

Nach jedem Push generiert die CI/CD-Pipeline automatisch den Report:

- **Gitea/GitLab Pages:** `https://[deine-instanz]/dns-tool/traceability-report.html`
- **Lokal:** `docs/traceability-report.html` im Repository

**Was bedeuten die Symbole?**

| Symbol | Bedeutung |
|--------|-----------|
| ✅ Grün | Requirement ist durch Tests gedeckt |
| ❌ Rot | Requirement hat keinen Test – Handlungsbedarf |
| ⚠️ Gelb | Test vorhanden, aber Status unklar |

---

## Für Entwickler

### OFT lokal ausführen

```bash
# Einmalig: OFT JAR herunterladen
bash scripts/download-oft.sh

# Traceability-Report generieren
npm run trace

# Nur Textstatus (kein HTML)
npm run trace:text
```

### Automatischen Test schreiben (pytest)

1. Erstelle Datei: `tests/auto/sfn_xxx/test_sreq_999_001.py`
2. Marker und OFT-Tag verwenden:

```python
# [utest->req~sreq-999~1]   ← OFT-Tag für Traceability

import pytest

@pytest.mark.req("SREQ-999")
class TestSREQ999:
    def test_positiv(self, dns_server, dns_zone):
        """SREQ-999: [Beschreibung]"""
        # Implementierung
        pass
```

3. Lokal testen:

```bash
pip install -e ".[test]"
pytest tests/auto/ -v -m "req"
```

### Web-App-Test schreiben (Vitest)

```typescript
// src/__tests__/meine-komponente.test.tsx
// [utest->feat~obj-1-ac-1~1]   ← OFT-Tag

import { render, screen } from '@testing-library/react'
import { MeineKomponente } from '@/components/MeineKomponente'

it('zeigt Requirements an', () => { // @feat: obj-1-ac-1
  render(<MeineKomponente />)
  expect(screen.getByText('SREQ-234')).toBeInTheDocument()
})
```

```bash
npm run test          # Watch-Modus
npm run test:run      # Einmalig (für CI)
npm run test:coverage # Mit Coverage-Report
```

### ADR-Vorschau (log4brains)

```bash
npm run adr:preview   # Öffnet Browser mit ADR-Site
npm run adr:build     # Baut statische ADR-Site nach out/adr/
```

---

## Für Tester

### Manuellen Testfall durchführen

1. Öffne die DNS-Tool-App im Browser: `http://[server]:3000/test-runner`
2. Wähle den Testfall aus der Liste (nach Service Function gruppiert)
3. Hake Vorbedingungen ab
4. Gehe Schritt für Schritt vor:
   - **✅ Bestanden** – Schritt erfolgreich
   - **❌ Nicht bestanden** – Schritt fehlgeschlagen (Beobachtung notieren!)
   - **⏭ Nicht anwendbar** – Schritt für diesen Kontext nicht relevant
5. Trage Beobachtungen in die Freitextfelder ein
6. Klicke **"Ergebnis speichern"** → Markdown-Datei wird heruntergeladen

### Ergebnis committen

1. Öffne Gitea/GitLab im Browser
2. Navigiere zu `tests/results/`
3. Klicke **"Datei hochladen"**
4. Lade die heruntergeladene `TEST-RESULT-SREQ-999-001-[DATUM].md` hoch
5. Committen

Die CI/CD-Pipeline läuft automatisch und schliesst die Traceability-Kette: Das Requirement gilt als **manuell bestätigt**.

---

## CI/CD Pipeline – Was wann läuft

| Job | Trigger | Dauer |
|-----|---------|-------|
| OFT Traceability | Automatisch bei Push (wenn `capabilities/`, `features/`, `tests/` geändert) | ~30 Sek. |
| Vitest (Web-App) | Automatisch bei Push (wenn `src/` geändert) | ~20 Sek. |
| log4brains ADR-Site | Automatisch bei Push (wenn `docs/adr/` geändert) | ~15 Sek. |
| pytest DNS-Tests | **Nur manuell** (braucht echte BIND9-Instanz) | ~5 Min. |

**pytest manuell starten:**
- GitHub: Actions → "CI" → "Run workflow" (oben rechts) → Branch wählen → "Run workflow"

---

## OFT-Tag-Referenz (für Entwickler & PM)

| Dateityp | Tag-Format | Beispiel |
|----------|-----------|---------|
| Requirement-Markdown | `` `req~sreq-234~1` `` | In `SREQ-234.md` |
| Feature-Acceptance-Criterion | `` `feat~obj-1-ac-1~1` `` | In `OBJ-1-*.md` |
| Automatischer Test (Markdown-Stub) | `` `utest~sreq-234-001~1` `` | In `TEST-SREQ-234-001.md` |
| Manueller Test (Markdown) | `` `itest~sreq-234-001~1` `` | In `TEST-SREQ-234-001-manual.md` |
| Python-Testdatei | `# [utest->req~sreq-234~1]` | Kommentar in `.py`-Datei |
| TypeScript-Testdatei | `// [utest->feat~obj-1-ac-1~1]` | Kommentar in `.test.tsx`-Datei |
| Testergebnis-Markdown | `` `itest~sreq-234-001~1` `` + `Covers:` | In `TEST-RESULT-*.md` |

**`Needs:` und `Covers:` Schlüsselwörter:**

```markdown
`req~sreq-234~1`
Needs: utest, itest        ← Requirement erwartet diese Test-Typen

`itest~sreq-234-001~1`
Covers: req~sreq-234~1     ← Dieser Test deckt jenes Requirement
```

---

## Verzeichnisstruktur Übersicht

```
test-dns/
  capabilities/              Requirements & Testfall-Definitionen (Markdown)
    domain-naming/
      services/
        .../
          requirements/      SREQ-xxx.md, CREQ-xxx.md
          tests/
            auto/            TEST-SREQ-xxx-001.md (Stubs mit Python-Code)
            manual/          TEST-SREQ-xxx-001-manual.md (Checklisten)
  tests/
    auto/                    Echte Python-Testdateien (pytest)
    results/                 Ausgefüllte Testergebnisse (von Test Runner generiert)
    conftest.py
  features/                  OBJ-x Feature-Specs (Web-App)
    INDEX.md
  docs/
    adr/                     Architecture Decision Records (log4brains)
    templates/               Vorlagen für PM
    traceability-report.html Generiert von OFT (CI/CD)
    DOCUMENTATION-GUIDE.md  Diese Datei
  src/                       Next.js Web-App
    app/
      test-runner/           Manual Test Runner
    __tests__/               Vitest Tests
  tools/
    oft.jar                  OpenFastTrace (nach download-oft.sh)
    oft-config.yaml
  scripts/
    download-oft.sh
  .gitea/workflows/ci.yml    Gitea Actions
  .gitlab-ci.yml             GitLab CI
  pyproject.toml             pytest Konfiguration
  vitest.config.ts           Vitest Konfiguration
```


end
