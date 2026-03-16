# SFN-RESOLV-DNSSEC: DNSSEC Validation

> **Service Function ID:** SFN-RESOLV-DNSSEC
> **Quelle:** FMN SP5 SI Domain Naming, Annex B, Seite 36
> **Service:** Recursive Resolving Services (SVC-RESOLV)
> **Quelle-Typ:** [NATO]

---

## Beschreibung

Der Resolver kann DNSSEC-Signaturen validieren, sofern entsprechende Trust Anchors konfiguriert sind und alle übergeordneten Zonen bis zum Trust Anchor DS-Records enthalten. Ohne konfigurierte Validierung oder Trust Anchor fällt der Betrieb auf normales DNS zurück.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [SREQ-240](requirements/SREQ-240.md) | [NATO] | FMN SP5, S.36 | Statisch konfigurierte Zonen unterstützen | MUSS |

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-SREQ-240-001](tests/auto/TEST-SREQ-240-001.md) | Automatisch (pytest) | SREQ-240 |
| [TEST-SREQ-240-001-manual](tests/manual/TEST-SREQ-240-001-manual.md) | Manuell | SREQ-240 |
