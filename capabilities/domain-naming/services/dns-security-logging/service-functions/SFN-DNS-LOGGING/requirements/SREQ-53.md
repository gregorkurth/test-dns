# SREQ-53: DNS-Server und Resolver müssen Ereignisse protokollieren

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-53 |
| **Typ** | Sicherheit / Betrieb |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-DNS-LOGGING – DNS Security & Event Logging |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, Annex B, 23 November 2023 |
| **Seite** | 36 |
| **Kapitel** | Annex B (Enterprise-level Requirements) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Events shall be logged by DNS servers and resolvers.

## Anforderungstext (Deutsch)

DNS-Server (autoritative Nameserver) und Resolver müssen Ereignisse protokollieren. Das Logging gilt für alle DNS-Komponenten: BIND9-autoritative Server sowie Unbound-Resolver.

---

## Kontext

Logging ist eine grundlegende Sicherheitsanforderung für DNS-Systeme. Im Mission Network müssen alle sicherheitsrelevanten DNS-Ereignisse nachvollziehbar und auditierbar sein. Logs ermöglichen forensische Analyse nach Sicherheitsvorfällen und Betriebsstörungen. Diese Anforderung ist auf Enterprise-Level und gilt für alle im MN betriebenen DNS-Komponenten.

---

## Akzeptanzkriterien

1. BIND9 ist mit aktiviertem Logging konfiguriert (`logging { ... }`).
2. Unbound ist mit aktiviertem Logging konfiguriert (`verbosity`-Direktive).
3. Log-Dateien werden im definierten Verzeichnis geschrieben und sind lesbar.
4. Log-Rotation ist konfiguriert, um Log-Überlauf zu verhindern.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-54 | Folgend | Spezifische Ereignistypen, die geloggt werden müssen |
| SREQ-309 | Folgend | Details zu fehlgeschlagenen Anfragen |
| SREQ-310 | Folgend | Details zu DNSSEC-Validierungsfehlern |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-53-001](../tests/auto/TEST-SREQ-53-001.md) | Automatisch (pytest) |
| [TEST-SREQ-53-001-manual](../tests/manual/TEST-SREQ-53-001-manual.md) | Manuell |
