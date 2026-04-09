# AI-Zonenmodell Z0-Z8

## Zweck

Das 9-Zonen-Modell segmentiert AI-Workloads von der Eingabe bis zur Ausgabe.
Jeder Zonenuebergang ist explizit zu kontrollieren, zu protokollieren und zu auditieren.

## Zonenuebersicht

| Zone | Rolle | Beispiele | Mindestkontrollen |
|---|---|---|---|
| Z0 | User Entry | GUI/API Gateway | AuthN, Rate-Limit, Input Validation |
| Z1 | Orchestration | Agent Controller | Skill-Whitelist, RBAC, Audit |
| Z2 | Context Layer | Prompt/Context Builder | Data Classification, Sanitizing |
| Z3 | Model Access | LLM Runtime | Egress Control, Token-Budget |
| Z4 | Tool Access | MCP/Tool Broker | Tool-Whitelist, Policy Gate |
| Z5 | Data Access | DB/Files/API Connectors | Least Privilege, Secrets from OpenBao |
| Z6 | Execution | Workload Runner | Namespace Isolation, mTLS, Tetragon |
| Z7 | Observability | OTel/SIEM | Vollstaendige Event-Korrelation |
| Z8 | Governance | Approval/Review | Exceptions, Rotation, Compliance |

## Verbindliche Regeln

- Default-Deny zwischen Zonen.
- Nur explizit freigegebene Uebergaenge.
- Jede Aktion mit Agent-ID und Skill-ID protokollieren.
- Secrets nie im Prompt/Log/Klartext.
- Credentials rotieren (30-90 Tage, kritisch <= 30 Tage).
