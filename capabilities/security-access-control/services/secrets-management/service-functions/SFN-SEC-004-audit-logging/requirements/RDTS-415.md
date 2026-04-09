# RDTS-415: Degradierter `local`-Modus erzeugt sichtbaren Security-Hinweis und Event

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-415 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Prioritaet** | MUSS |
| **Service Function** | SFN-SEC-004 - Audit Logging |
| **Quelldokument** | App-Template-Anweisung |
| **Status** | Offen |

## Anforderungstext

> Wenn `secrets-mode=local` oder `siem-mode=local` aktiv ist, MUSS ein sichtbarer Security-Hinweis angezeigt und ein Event `security.posture.degraded` erzeugt werden.

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-415-001](../tests/auto/TEST-RDTS-415-001.md) | Automatisch |
| [TEST-RDTS-415-001-manual](../tests/manual/TEST-RDTS-415-001-manual.md) | Manuell |
