# Maturitätsstatus – DevOps

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

- [ ] GitHub Actions PR-Workflow (Lint + Build) läuft
- [ ] Dockerfile für Multi-Stage Build vorhanden

## L1 → L2 (Functional Prototype) Checkliste

- [ ] Vollständiger PR-Check (Lint, Type-Check, Tests, Build)
- [ ] Container-Image-Build bei Merge auf main
- [ ] Image-Tagging mit Git-SHA

## L2 → L3 (Platform Ready) Checkliste

- [ ] Release-Workflow bei Tag-Push
- [ ] CHANGELOG automatisch generiert
- [ ] SemVer-Tags korrekt

## L3 → L4 (Mission Ready) Checkliste

- [ ] SBOM bei Release-Builds
- [ ] Artefakt-Signing mit cosign
- [ ] Pipeline < 5 Minuten

## L4 → L5 (Federated Ready) Checkliste

- [ ] Self-hosted Runners für airgapped CI
- [ ] Reproduzierbare Builds validiert
