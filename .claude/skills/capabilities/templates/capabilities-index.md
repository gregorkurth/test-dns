# Capabilities Index

> Übersicht aller Capabilities gemäss NATO C3 Taxonomie.
> Jede Capability enthält Services → Service Functions → Requirements → Tests.

## Capabilities

| ID | Capability | Maturität | Spec | Erstellt |
|----|-----------|-----------|------|---------|
| {{CAP_ID}} | {{CAP_NAME}} | L0 – Idea | [README]({{CAP_SLUG}}/README.md) | {{DATUM}} |

## Struktur

```
capabilities/
  INDEX.md                          ← diese Datei
  {{CAP_SLUG}}/
    README.md                       ← Capability-Übersicht
    maturity.md                     ← Maturitätsstatus L0–L5
    products.md                     ← Produkte + Lizenzen
    services/
      [service-slug]/               ← Service-Verzeichnis
```

Jeder Service enthält:
```
service-functions/
  SFN-XXXX-name/
    README.md                       ← Service Function Beschreibung
    requirements/
      SREQ-XXX.md                   ← Einzelnes Requirement [NATO]
      RDTS-XXX.md                   ← Abgeleitetes Requirement [ARCH]
      CREQ-XXX.md                   ← Kundenanforderung [CUST]
      IREQ-XXX.md                   ← Internes Requirement [INT]
    tests/
      auto/
        TEST-SREQ-XXX-001.md        ← Automatischer Testfall (pytest)
      manual/
        TEST-SREQ-XXX-001-manual.md ← Manueller Testfall (Markdown)
```
