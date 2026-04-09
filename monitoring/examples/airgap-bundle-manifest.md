# Airgapped Export Bundle

Vorschlag fuer ein transportierbares Paket pro Release oder Beta-Stand:

## Paketinhalt

- `monitoring/otel/collector-local.yaml`
- `monitoring/otel/collector-clickhouse.yaml`
- `monitoring/otel/README.md`
- `monitoring/grafana/dashboards/dns-observability-v1.json`
- `monitoring/grafana/provisioning/datasources/clickhouse.yaml`
- optional `spool/` mit lokal gepufferter Telemetrie fuer Replay

## Ziel

Dieses Paket erlaubt drei Dinge ohne Online-Abhaengigkeit:

- Collector-Konfiguration in Zielumgebung importieren
- Grafana-Dashboard passend zur Release-Version importieren
- lokal gespoolte Telemetrie spaeter in ClickHouse nachliefern

## Kopierregeln

- Git bleibt die Primaerquelle
- exportiert wird immer aus einem versionierten Release-Stand
- Dashboard-Version und Collector-Profil duerfen nicht separat gemischt werden
- Spool-Daten nur transportieren, wenn Datenschutz und Aufbewahrung freigegeben sind

## Replay nach Offline-Transport

1. Spool-Verzeichnis nach `/var/lib/otel/spool/` auf dem Zielsystem kopieren.
2. `collector-clickhouse.yaml` mit gemountetem Spool starten.
3. Replay-Lauf im Collector-Log beobachten.
4. Danach Dashboard gegen ClickHouse oeffnen und Eingang pruefen.
