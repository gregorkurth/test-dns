# {{REQ_ID}}: {{REQ_TITEL}}

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | {{REQ_ID}} |
| **Typ** | {{REQ_TYP}} |
| **Quelle** | {{QUELLE_TYP}} <!-- [NATO] / [ARCH] / [CUST] / [INT] --> |
| **Priorität** | {{PRIORITAET}} <!-- 🟥 MUSS (SHALL) / 🟧 SOLLTE (SHOULD) / 🟨 KANN (MAY) / ℹ️ INFO --> |
| **Service Function** | {{SFN_ID}} – {{SFN_NAME}} |
| **Quelldokument** | {{QUELLDOKUMENT}} |
| **Seite** | {{SEITE}} |
| **Kapitel** | {{KAPITEL}} |
| **Status** | Offen |

---

## Anforderungstext (Original)

> {{ORIGINALTEXT}}

## Anforderungstext (Übersetzung / Erläuterung)

{{UEBERSETZUNG_ERLAEUTERUNG}}

---

## Kontext

{{KONTEXT}}

---

## Akzeptanzkriterien

1. {{AK_1}}
2. {{AK_2}}
3. {{AK_3}}

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| {{ABHAENGIGKEIT}} | {{TYP}} | {{BESCHREIBUNG}} |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-{{REQ_ID}}-001](../tests/auto/TEST-{{REQ_ID}}-001.md) | Automatisch (pytest) |
| [TEST-{{REQ_ID}}-001-manual](../tests/manual/TEST-{{REQ_ID}}-001-manual.md) | Manuell |
