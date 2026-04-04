# Maturitätsstatus – Security & Access Control

> Maturitätslevel gemäss internem Framework (L0–L5).

## Aktueller Status

```
L0 [✓] IDEA           2026-04-03  Capability-Struktur erstellt
L1 [ ] POC             -          Ausstehend
L2 [ ] FUNCTIONAL      -          Ausstehend
L3 [ ] PLATFORM READY  -          Ausstehend
L4 [ ] MISSION READY   -          Ausstehend
L5 [ ] FEDERATED READY -          Ausstehend
```

## L0 → L1 (PoC) Checkliste

- [ ] NextAuth.js mit Keycloak-Provider konfiguriert
- [ ] Lokale Fallback-Auth mit Username/Passwort
- [ ] Erste API-Route geschützt

## L1 → L2 (Functional Prototype) Checkliste

- [ ] RBAC-Rollen (viewer, operator, admin) implementiert
- [ ] Alle API-Endpunkte geschützt (401/403)
- [ ] Session-Management mit konfigurierbarer Gültigkeit

## L2 → L3 (Platform Ready) Checkliste

- [ ] K8s Secrets für OIDC-Credentials und TSIG-Keys
- [ ] HTTPS im Ingress erzwungen
- [ ] Audit-Logging für Login/Logout/Fehlanmeldung

## L3 → L4 (Mission Ready) Checkliste

- [ ] Keycloak-Integration end-to-end getestet
- [ ] Penetrationstest bestanden (OWASP Top 10)
- [ ] Audit-Logs nicht manipulierbar

## L4 → L5 (Federated Ready) Checkliste

- [ ] SSO über FMN-Keycloak validiert
- [ ] Zero-Trust-Prinzip umgesetzt
