# Capability: Security & Access Control

> **Capability ID:** CAP-004
> **NATO C3 Taxonomie:** Communication and Information Services > Security Services
> **FMN-Referenz:** App-Template-Anweisung (intern)
> **Maturität:** L0 – Idea (Stand: 2026-04-03)

---

## Beschreibung

Die Security & Access Control Capability stellt sicher, dass die DNS-Konfigurations-App authentifizierte und autorisierte Zugriffe erzwingt. Sie umfasst OIDC-basierte Authentifizierung (Keycloak-kompatibel), ein RBAC-Rollenmodell, OpenBao-basiertes Secrets-Management mit kontrolliertem `local`-Fallback, Zero-Trust-Netzwerkprinzipien (Cilium inkl. mTLS), Policy-as-Code mit OPA, Netzwerktransparenz ueber Hubble und Audit-/Runtime-Logging fuer sicherheitsrelevante Ereignisse (inkl. Tetragon-Events). Fuer AI-Agenten werden zusaetzlich MCP-Whitelisting, dedizierte Agent-Identitaeten und SIEM-Anbindung via OTel erzwungen.

---

## Services

| ID | Service | Beschreibung | Spec |
|----|---------|-------------|------|
| SVC-SEC-AUTH | Authentifizierung | OIDC/OAuth2 mit Keycloak-Anbindung | [README](services/authentication/README.md) |
| SVC-SEC-SECRETS | Secrets Management | K8s Secrets, Audit-Logging | [README](services/secrets-management/README.md) |

---

## Service Functions

| SFN-ID | Service Function | Service | Quelle |
|--------|-----------------|---------|--------|
| SFN-SEC-001 | OIDC Authentication | SVC-SEC-AUTH | [ARCH] |
| SFN-SEC-002 | RBAC | SVC-SEC-AUTH | [ARCH] |
| SFN-SEC-003 | Secrets Handling | SVC-SEC-SECRETS | [ARCH] |
| SFN-SEC-004 | Audit Logging | SVC-SEC-SECRETS | [ARCH] |

---

## Abhängigkeiten

| DPD-ID | Abhängigkeit | Typ | Beschreibung |
|--------|-------------|-----|-------------|
| DPD-SEC-001 | CAP-002 Kubernetes Platform | Voraussetzung | K8s Secrets benötigen Cluster |
| DPD-SEC-002 | OBJ-3 REST API | Voraussetzung | API-Endpunkte müssen geschützt werden |
| DPD-SEC-003 | CAP-003 Observability | Nutzer | Audit-Logs fliessen in OTel |

---

## Links

- [Maturity Status](maturity.md)
- [Products & Licenses](products.md)
- [App-Template-Anweisung](../../req-init/app-template.md)
