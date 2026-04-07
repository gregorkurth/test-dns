# Products & Lizenzen – Observability

> Mapping: Service Functions → Produkte → Lizenzen
> Quellen: App-Template-Anweisung

---

## Produkt-Matrix

| Produkt | Version | Service Function | Lizenz | Open Source |
|---------|---------|-----------------|--------|-------------|
| **OpenTelemetry SDK (JS)** | ≥ 1.x | SFN-OBS-001, SFN-OBS-002, SFN-OBS-003 | Apache 2.0 | Ja |
| **Prometheus** | ≥ 2.x | SFN-OBS-001 | Apache 2.0 | Ja |
| **ClickHouse** | ≥ 24.x | SFN-OBS-001, SFN-OBS-002, SFN-OBS-003 | Apache 2.0 | Ja |
| **Grafana** | ≥ 10.x | SFN-OBS-001 | AGPL 3.0 | Ja |
| **Loki** | ≥ 2.x | SFN-OBS-002 | AGPL 3.0 | Ja |
| **Jaeger** | ≥ 1.x | SFN-OBS-003 | Apache 2.0 | Ja |

---

## Airgapped-Anforderungen

```
harbor.local/observability/prometheus:latest
harbor.local/observability/clickhouse:latest
harbor.local/observability/grafana:latest
harbor.local/observability/loki:latest
harbor.local/observability/jaeger:latest
```

---

*Zuletzt aktualisiert: 2026-04-07*
