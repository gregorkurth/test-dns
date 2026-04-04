# Service: Authentifizierung

> **Service ID:** SVC-SEC-AUTH
> **Capability:** Security & Access Control (CAP-004)
> **Quelldokument:** App-Template-Anweisung, Abschnitte 6–7

---

## Beschreibung

Der Authentifizierungs-Service stellt OIDC-basierte Authentifizierung (Keycloak-kompatibel) und rollenbasierte Zugriffskontrolle (RBAC) bereit. Eine lokale Fallback-Authentifizierung ermöglicht den Betrieb ohne externen Identity Provider.

---

## Service Functions

| ID | Service Function | Beschreibung |
|----|-----------------|-------------|
| SFN-SEC-001 | OIDC Authentication | OIDC/OAuth2 Login mit Keycloak + lokaler Fallback |
| SFN-SEC-002 | RBAC | Rollenbasierte Zugriffskontrolle (viewer/operator/admin) |

---

## Quelldokumente

- App-Template-Anweisung, Abschnitt 6: Security / Authentifizierung
- App-Template-Anweisung, Abschnitt 7: Rollenmodell und Authentifizierung
- Feature-Spec OBJ-11: Security & Authentifizierung
