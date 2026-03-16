# Maturitätsstatus – Domain Naming

> Maturitätslevel gemäss internem Framework (L0–L5).

## Level-Definitionen

| Level | Name | Kriterien | Nachweis |
|-------|------|-----------|---------|
| **L0** | Idea | Konzept dokumentiert, PRD vorhanden | PRD.md, Capability README |
| **L1** | PoC | Lokaler Testlauf möglich, Grundfunktionalität demonstriert | Lokaler BIND9-Test mit core.ndp.che |
| **L2** | Functional Prototype | Deployment in Testumgebung, alle Kern-SFNs erfüllt | BIND9 + Anycast in Testumgebung |
| **L3** | Platform Ready | Kubernetes-Deployment, GitOps aktiv, Tests grün | Helm Chart, CI/CD Pipeline |
| **L4** | Mission Ready | Security-Anforderungen erfüllt, Monitoring aktiv | DNSSEC aktiv, Logging verifiziert |
| **L5** | Federated Ready | FMN-Interoperabilität bestätigt, Zero-Trust aktiv, airgapped validiert | CWIX AV&V bestanden |

## Aktueller Status

```
L0 [✓] IDEA           2026-03-16  PRD + Capability-Struktur erstellt
L1 [ ] POC             -          Ausstehend
L2 [ ] FUNCTIONAL      -          Ausstehend
L3 [ ] PLATFORM READY  -          Ausstehend
L4 [ ] MISSION READY   -          Ausstehend
L5 [ ] FEDERATED READY -          Ausstehend
```

## L0 → L1 (PoC) Checkliste

- [ ] BIND9 lokal installiert und gestartet
- [ ] Zone core.ndp.che konfiguriert
- [ ] Reverse-Zone 109.x.x.in-addr.arpa konfiguriert
- [ ] ns1.core.ndp.che und ns2.core.ndp.che auflösbar
- [ ] rs1/rs2.core.ndp.che als Resolver konfiguriert

## L1 → L2 (Functional Prototype) Checkliste

- [ ] DNSSEC aktiviert und Root-Zone signiert
- [ ] Anycast-Konfiguration für root-ns.core.ndp.che aktiv
- [ ] Zone Transfer via TSIG konfiguriert
- [ ] Alle SREQ-xxx Requirements implementiert
- [ ] Manuelle Tests abgeschlossen (TEST-*-manual)

## L2 → L3 (Platform Ready) Checkliste

- [ ] Helm Chart für BIND9-Deployment erstellt
- [ ] GitOps-Pipeline (ArgoCD/Flux) aktiv
- [ ] Automatische Tests (pytest) grün
- [ ] Harbor-Registry mit BIND9-Images befüllt

## L3 → L4 (Mission Ready) Checkliste

- [ ] DNSSEC vollständig implementiert (SREQ-525, SREQ-1272)
- [ ] Logging aktiv (SREQ-53, SREQ-54, SREQ-309, SREQ-310)
- [ ] Security-Audit abgeschlossen
- [ ] Monitoring/Alerting konfiguriert

## L4 → L5 (Federated Ready) Checkliste

- [ ] FMN Spiral 5 Interoperabilität bestätigt
- [ ] CWIX AV&V durchgeführt (oder Provider-Test ohne AV&V gemäss LOA)
- [ ] Zone-Transfer mit anderen MNPs getestet
- [ ] Anycast-Routing im föderativen Netz validiert

## Maturitäts-Badge

```markdown
![Maturity](https://img.shields.io/badge/Maturity-L0%20Idea-lightgrey)
```

> Badge-Status muss nach jedem Level-Aufstieg in der README aktualisiert werden.
