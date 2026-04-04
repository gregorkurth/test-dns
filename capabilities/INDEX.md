# Capabilities Index

> Übersicht aller Capabilities gemäss NATO C3 Taxonomie.
> Jede Capability enthält Services → Service Functions → Requirements → Tests.

## Capabilities

| ID | Capability | Maturität | Spec | Erstellt |
|----|-----------|-----------|------|---------|
| CAP-001 | Domain Naming | L0 – Idea | [README](domain-naming/README.md) | 2026-03-16 |
| CAP-002 | Kubernetes Platform | L0 – Idea | [README](kubernetes-platform/README.md) | 2026-04-03 |
| CAP-003 | Observability | L0 – Idea | [README](observability/README.md) | 2026-04-03 |
| CAP-004 | Security & Access Control | L0 – Idea | [README](security-access-control/README.md) | 2026-04-03 |
| CAP-005 | DevOps | L0 – Idea | [README](devops/README.md) | 2026-04-03 |
| CAP-006 | Documentation & Quality | L0 – Idea | [README](documentation-quality/README.md) | 2026-04-03 |
| CAP-007 | Supply Chain Security | L0 – Idea | [README](supply-chain-security/README.md) | 2026-04-03 |
| CAP-008 | Offline Delivery | L0 – Idea | [README](offline-delivery/README.md) | 2026-04-03 |
| CAP-009 | GitOps / Argo CD | L0 – Idea | [README](gitops/README.md) | 2026-04-03 |

## Capability → Feature Mapping

| Capability | Verknüpfte Features |
|-----------|-------------------|
| CAP-001 Domain Naming | OBJ-4, OBJ-5, OBJ-6, OBJ-7, OBJ-8 |
| CAP-002 Kubernetes Platform | OBJ-10, OBJ-13 |
| CAP-003 Observability | OBJ-11 |
| CAP-004 Security & Access Control | OBJ-12 |
| CAP-005 DevOps | OBJ-1, OBJ-14 |
| CAP-006 Documentation & Quality | OBJ-2, OBJ-15, OBJ-16, OBJ-23 |
| CAP-007 Supply Chain Security | OBJ-17, OBJ-22, OBJ-1, OBJ-14 |
| CAP-008 Offline Delivery | OBJ-19, OBJ-20 |
| CAP-009 GitOps / Argo CD | OBJ-21, OBJ-19, OBJ-20 |

## Requirements-Übersicht

| Capability | Requirements | Quellentyp |
|-----------|-------------|-----------|
| CAP-001 Domain Naming | SREQ-235 bis SREQ-1320, CREQ-001 bis CREQ-005 | [NATO], [CUST] |
| CAP-002 Kubernetes Platform | RDTS-201 bis RDTS-212 (12 Req) | [ARCH] |
| CAP-003 Observability | RDTS-301 bis RDTS-308 (8 Req) | [ARCH] |
| CAP-004 Security & Access Control | RDTS-401 bis RDTS-410 (10 Req) | [ARCH] |
| CAP-005 DevOps | RDTS-501 bis RDTS-509 (9 Req) | [ARCH] |
| CAP-006 Documentation & Quality | RDTS-601 bis RDTS-611 (11 Req) | [ARCH] |
| CAP-007 Supply Chain Security | RDTS-701 bis RDTS-715 (15 Req) | [ARCH] |
| CAP-008 Offline Delivery | RDTS-801 bis RDTS-809 (9 Req) | [ARCH] |
| CAP-009 GitOps / Argo CD | RDTS-901 bis RDTS-906 (6 Req) | [ARCH] |

## Struktur

```
capabilities/
  INDEX.md                          ← diese Datei
  domain-naming/                    ← CAP-001
  kubernetes-platform/              ← CAP-002
  observability/                    ← CAP-003
  security-access-control/          ← CAP-004
  devops/                           ← CAP-005
  documentation-quality/            ← CAP-006
  supply-chain-security/            ← CAP-007
  offline-delivery/                 ← CAP-008
  gitops/                           ← CAP-009
```
