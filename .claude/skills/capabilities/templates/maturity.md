# Maturitätsstatus – {{CAP_NAME}}

> Maturitätslevel gemäss internem Framework (L0–L5).

## Level-Definitionen

| Level | Name | Kriterien | Nachweis |
|-------|------|-----------|---------|
| **L0** | Idea | Konzept dokumentiert, PRD vorhanden | PRD.md, Capability README |
| **L1** | PoC | Lokaler Testlauf möglich, Grundfunktionalität demonstriert | {{L1_NACHWEIS}} |
| **L2** | Functional Prototype | Deployment in Testumgebung, alle Kern-SFNs erfüllt | {{L2_NACHWEIS}} |
| **L3** | Platform Ready | Kubernetes-Deployment, GitOps aktiv, Tests grün | {{L3_NACHWEIS}} |
| **L4** | Mission Ready | Security-Anforderungen erfüllt, Monitoring aktiv | {{L4_NACHWEIS}} |
| **L5** | Federated Ready | FMN-Interoperabilität bestätigt, Zero-Trust aktiv, airgapped validiert | {{L5_NACHWEIS}} |

## Aktueller Status

```
L0 [✓] IDEA           {{DATUM}}  PRD + Capability-Struktur erstellt
L1 [ ] POC             -          Ausstehend
L2 [ ] FUNCTIONAL      -          Ausstehend
L3 [ ] PLATFORM READY  -          Ausstehend
L4 [ ] MISSION READY   -          Ausstehend
L5 [ ] FEDERATED READY -          Ausstehend
```

## L0 → L1 (PoC) Checkliste

{{L0_L1_CHECKLISTE}}

## L1 → L2 (Functional Prototype) Checkliste

{{L1_L2_CHECKLISTE}}

## L2 → L3 (Platform Ready) Checkliste

{{L2_L3_CHECKLISTE}}

## L3 → L4 (Mission Ready) Checkliste

{{L3_L4_CHECKLISTE}}

## L4 → L5 (Federated Ready) Checkliste

{{L4_L5_CHECKLISTE}}

## Maturitäts-Badge

```markdown
![Maturity](https://img.shields.io/badge/Maturity-L0%20Idea-lightgrey)
```

> Badge-Status muss nach jedem Level-Aufstieg in der README aktualisiert werden.
