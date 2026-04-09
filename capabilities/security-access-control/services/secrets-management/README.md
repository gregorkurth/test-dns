# Service: Secrets Management

> **Service ID:** SVC-SEC-SECRETS
> **Capability:** Security & Access Control (CAP-004)
> **Quelldokument:** App-Template-Anweisung, Abschnitt 6

---

## Beschreibung

Der Secrets Management Service stellt sicher, dass sensible Daten (TSIG-Keys, OIDC-Credentials, API-Keys) sicher verwaltet werden. Standard ist OpenBao als zentraler Secrets-Service; ein lokaler Modus ist nur als kontrollierter degradierten Betrieb zulaessig. Sicherheitsrelevante Ereignisse werden ueber Audit-Logging protokolliert; Runtime-Events aus Tetragon fliessen als zusaetzliche Security-Auditquelle ein.

---

## Service Functions

| ID | Service Function | Beschreibung |
|----|-----------------|-------------|
| SFN-SEC-003 | Secrets Handling | K8s Secrets für sensible Daten, HTTPS-Enforcement |
| SFN-SEC-004 | Audit Logging | Protokollierung sicherheitsrelevanter Ereignisse |

---

## Quelldokumente

- App-Template-Anweisung, Abschnitt 6: Security / Authentifizierung
- Feature-Spec OBJ-12: Security & Authentifizierung
