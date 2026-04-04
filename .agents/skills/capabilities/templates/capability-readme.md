# Capability: {{CAP_NAME}}

> **Capability ID:** {{CAP_ID}}
> **NATO C3 Taxonomie:** {{NATO_C3_DOMAIN}}
> **FMN-Referenz:** {{FMN_REFERENZ}}
> **Maturität:** L0 – Idea (Stand: {{DATUM}})

---

## Beschreibung

{{CAPABILITY_BESCHREIBUNG}}

---

## Services

| ID | Service | Beschreibung | Spec |
|----|---------|-------------|------|
| {{SVC_ID}} | {{SVC_NAME}} | {{SVC_BESCHREIBUNG}} | [README](services/{{SVC_SLUG}}/README.md) |

---

## Service Functions

| SFN-ID | Service Function | Service | Quelle |
|--------|-----------------|---------|--------|
| {{SFN_ID}} | {{SFN_NAME}} | {{SVC_ID}} | {{SFN_QUELLE}} |

---

## Abhängigkeiten

| DPD-ID | Abhängigkeit | Typ | Beschreibung |
|--------|-------------|-----|-------------|
| {{DPD_ID}} | {{DPD_NAME}} | {{DPD_TYP}} | {{DPD_BESCHREIBUNG}} |

> **Typ:** `Voraussetzung` = Diese Capability braucht die andere | `Nutzer` = Andere nutzen diese Capability

---

## Konfiguration

| Parameter | Wert | Quelle |
|-----------|------|--------|
| {{PARAM_NAME}} | {{PARAM_WERT}} | {{PARAM_QUELLE}} |

---

## Links

- [Maturity Status](maturity.md)
- [Products & Licenses](products.md)
- [{{QUELLDOK_1_NAME}}](../../req-init/{{QUELLDOK_1_DATEI}})
