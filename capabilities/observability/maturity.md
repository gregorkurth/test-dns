# Maturitätsstatus – Observability

> Maturitätslevel gemäss internem Framework (L0–L5).

## Level-Definitionen

| Level | Name | Kriterien | Nachweis |
|-------|------|-----------|---------|
| **L0** | Idea | Konzept dokumentiert | Capability README |
| **L1** | PoC | OTel SDK integriert, erste Metriken sichtbar | Prometheus-Scrape funktioniert |
| **L2** | Functional Prototype | Alle App-Metriken, strukturierte Logs, Traces | Grafana-Dashboard (ClickHouse) zeigt Daten |
| **L3** | Platform Ready | OTel Collector konfiguriert, Operator-Metriken | CI prueft Metriken-Export + ClickHouse-Weitergabe |
| **L4** | Mission Ready | Alerting-Regeln, airgapped-validiert | Alert-Tests bestanden |
| **L5** | Federated Ready | Cross-Namespace Observability, FMN-kompatibel | Interop-Test |

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

- [ ] OTel SDK in Next.js-App integriert
- [ ] `/metrics`-Endpoint liefert Prometheus-Format
- [ ] Mindestens eine Custom-Metrik (z. B. Zone-File-Generierungen)

## L1 → L2 (Functional Prototype) Checkliste

- [ ] Alle definierten App-Metriken exportiert
- [ ] Strukturierte JSON-Logs mit traceId
- [ ] Traces für API-Requests sichtbar
- [ ] Beispiel-Grafana-Dashboard vorhanden
- [ ] ClickHouse-Weitergabe fuer Logs/Metriken/Traces nachgewiesen

## L2 → L3 (Platform Ready) Checkliste

- [ ] OTel Collector Endpoint konfigurierbar
- [ ] Operator exportiert eigene Metriken
- [ ] Prometheus-Scrape-Config im Repository

## L3 → L4 (Mission Ready) Checkliste

- [ ] Alerting-Regeln für kritische Zustände definiert
- [ ] Monitoring funktioniert ohne externe SaaS
- [ ] Sensitive Daten in Traces maskiert

## L4 → L5 (Federated Ready) Checkliste

- [ ] Cross-Namespace Observability validiert
- [ ] FMN-Interoperabilitätstest bestanden
