# {{SFN_ID}}: {{SFN_NAME}}

> **Service Function ID:** {{SFN_ID}}
> **Quelle:** {{QUELLDOKUMENT}}, {{KAPITEL}}, {{SEITE}}
> **Service:** {{SVC_NAME}} ({{SVC_ID}})
> **Quelle-Typ:** {{QUELLE_TYP}}  <!-- [NATO] | [ARCH] | [CUST] | [INT] -->

---

## Beschreibung

{{SFN_BESCHREIBUNG}}

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [{{REQ_ID}}](requirements/{{REQ_ID}}.md) | {{REQ_TYP}} | {{REQ_QUELLE}} | {{REQ_BESCHREIBUNG}} | {{PRIORITAET}} |

> **Quelle-Typen:** `[NATO]` FMN/NATO-Spec · `[ARCH]` Architektur · `[CUST]` Kunde · `[INT]` Intern
> **Priorität:** 🟥 MUSS · 🟧 SOLLTE · 🟨 KANN · ℹ️ INFO

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-{{REQ_ID}}-001](tests/auto/TEST-{{REQ_ID}}-001.md) | Automatisch (pytest) | {{REQ_ID}} |
| [TEST-{{REQ_ID}}-001-manual](tests/manual/TEST-{{REQ_ID}}-001-manual.md) | Manuell | {{REQ_ID}} |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| {{SFN_ID}} | {{ABHAENGIGE_SFN}} | Voraussetzung |
