# FMN/NATO Kommunikationsmatrix (North-South)

## Zweck

Diese Matrix ist die verbindliche Quelle fuer externe Service-Freigaben
gemaess FMN/NATO. Sie dient als Input fuer Cilium Ingress/Egress Policies
und fuer die Security-Freigabe.

Hinweis:
- Nicht erfasste Flows sind per Default geblockt.
- Jeder Eintrag braucht einen technischen und fachlichen Owner.

## Geltungsbereich

- Umgebung: `dev` / `test` / `prod`
- Service: DNS und zugehoerige API-/MCP-Schnittstellen
- Umsetzung: Cilium (`CiliumNetworkPolicy` / `CiliumClusterwidePolicy`)

## Matrix

| Flow-ID | Environment | Quelle (Zone/CIDR/Service) | Ziel (Zone/CIDR/Service) | Direction | Port | Protokoll | Zweck | Kritikalitaet | AuthN/AuthZ | Owner | Freigabe-ID | Status |
|---|---|---|---|---|---:|---|---|---|---|---|---|---|
| FMN-FLOW-001 | prod | EXTERNAL-DNS-CLIENTS (CIDR) | DNS-SVC (`dns-authoritative`) | ingress | 53 | udp/tcp | Authoritative DNS Query | high | n/a | team-dns | CAB-2026-001 | active |
| FMN-FLOW-002 | prod | DNS-SVC (`dns-authoritative`) | UPSTREAM-DNS (`resolver-x`) | egress | 53 | udp/tcp | Upstream Resolution / Forwarding | high | n/a | team-dns | CAB-2026-001 | active |
| FMN-FLOW-003 | prod | DNS-API (`dns-api`) | IDP (`keycloak`) | egress | 443 | tcp | Token/OIDC Validation | medium | mTLS + OIDC | team-iam | CAB-2026-002 | active |
| FMN-FLOW-004 | prod | DNS-SVC / DNS-API | OTel Collector | egress | 4317 | tcp | Telemetry Export | medium | mTLS | team-platform | CAB-2026-003 | active |

## Pflichtpruefungen

- [ ] Jeder `active` Flow hat eine gueltige Freigabe-ID.
- [ ] Cilium-Policy-Eintraege sind gegen diese Matrix abgeglichen.
- [ ] Allow-Test und Deny-Test pro `active` Flow sind dokumentiert.
- [ ] Nicht definierte externe Flows werden effektiv blockiert.
