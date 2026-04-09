# OTel Monitoring Profiles

Dieses Verzeichnis liefert die startklaren Basisartefakte fuer `OBJ-11` und deckt zwei Betriebsmodi ab:

- `local`: Entwicklung, Lab, Offline oder airgapped Betrieb ohne zentrales Zielsystem
- `clickhouse`: zentraler Observability-Betrieb mit ClickHouse als Speicher und Grafana als Sicht

## Dateien

- `collector-local.yaml`: Collector-Profil fuer lokale Pufferung mit Dateispool
- `collector-clickhouse.yaml`: Collector-Profil fuer zentrale Ablage in ClickHouse inkl. Replay
- `../grafana/dashboards/dns-observability-v1.json`: versionierte Dashboard-Vorlage
- `../grafana/provisioning/datasources/clickhouse.yaml`: Grafana-Datasource-Stub
- `../examples/app-telemetry.env.example`: Beispielwerte fuer App/Operator
- `../examples/security-event.json`: Beispiel fuer ein SIEM-relevantes OTel-Security-Event
- `../examples/airgap-bundle-manifest.md`: Vorschlag fuer ein offline transportierbares Paket

Hinweis: `service.name` muss in App, Security-Events und Dashboard-Queries identisch sein, damit Dashboard-Auswertungen und Korrelationen stabil funktionieren.

## Telemetry-Probe fuer QA

Die App stellt `GET /api/v1/telemetry` als lebenden Probe-Pfad bereit. Die Route liefert den aktuellen OTel-Modus, den Export-Endpunkt und die Signalarten zurueck und schreibt zusaetzlich ein strukturiertes Log-Event.

Damit kann QA ohne grossen Stack zuerst pruefen:

1. Ist der Telemetrie-Pfad lauffaehig?
2. Sind `service.name`, Exportmodus und Dashboard-Version konsistent?
3. Wird ein strukturierter Probe-Eintrag erzeugt?

## Deployment-Verdrahtung (Repo)

Fuer Collector, ClickHouse und Grafana liegt ein eigenes Overlay unter `k8s/observability/` bereit.

- Render-Check: `kubectl kustomize --load-restrictor=LoadRestrictionsNone k8s/observability`
- Kombinierter Obj-11-Check: `npm run check:obj11`

Hinweis: Das Overlay verwendet bewusst versionierte Artefakte aus `monitoring/`. Deshalb wird beim Rendern `--load-restrictor=LoadRestrictionsNone` benoetigt.

## Erfasste Signale

Die Profiles gehen von vier Signalgruppen aus:

- Metriken: HTTP-Nutzung, Latenzen, Fehler, Zone-Generierung, Operator-Zustand, Exportstatus
- Logs: strukturierte Ereignisse mit Zeitstempel, Schweregrad, Service, Korrelation und Nachricht
- Traces: Request-, Job- und Controller-Traces fuer Ursachenanalyse
- Security-Events: Policy-Verstoesse, Auth-/Zugriffsereignisse, degradierte Modi und Replay-Ueberlaeufe

## Modus `local`

`collector-local.yaml` schreibt alle Signale nach `/var/lib/otel/spool/telemetry.jsonl` und spiegelt sie parallel auf `debug`. Damit bleibt Telemetrie lokal verfuegbar, auch wenn noch kein zentrales Zielsystem existiert.

### Buffering

- Persistenzort: `/var/lib/otel/spool/`
- Queue-Metadaten: `/var/lib/otel/queue/`
- Maximalgroesse pro Datei: `100 MB`
- Maximalanzahl Rotationen: `10`
- Retention im Spool: `3 Tage`

### Retry

Im `local`-Modus gibt es keinen externen Versand. Der eigentliche Schutz gegen Datenverlust ist deshalb nicht ein Netzwerk-Retry, sondern das persistente Wegschreiben in den Dateispool. Anwendungen koennen weiter OTLP an den Collector senden, auch wenn ClickHouse, Netzwerk oder Grafana noch nicht verfuegbar sind.

### Replay

Replay erfolgt spaeter ueber `collector-clickhouse.yaml`. Dieses Profil liest dieselben JSONL-Dateien aus `/var/lib/otel/spool/*.jsonl` per `filelog/replay` wieder ein und liefert sie anschliessend an ClickHouse aus. Voraussetzung ist ein gemeinsam gemountetes Spool-Verzeichnis oder ein kopiertes Airgap-Paket.

## Modus `clickhouse`

`collector-clickhouse.yaml` verarbeitet Live-Traffic ueber OTLP und kann zusaetzlich vorhandene Spool-Dateien nachladen. Logs, Metriken und Traces gehen in die zentrale ClickHouse-Datenbank `otel`.

### Routing

- Logs -> `otel.otel_logs`
- Metriken -> `otel.otel_metrics`
- Traces -> `otel.otel_traces`
- Security-Events -> `otel.otel_security_events`

Grafana ist in diesem Modell ausschliesslich Consumer. Die Dashboards lesen aus ClickHouse, nicht direkt aus der App. Dadurch bleiben Sicht und Speicherung sauber getrennt.

### Retry und Queue-Verhalten

- Versandwarteschlange ist aktiviert
- Queue-Zustand ist persistent in `/var/lib/otel/queue/`
- Retry-Intervall startet bei `5s`
- Maximales Retry-Intervall ist `30s`
- Ein Eintrag gilt spaetestens nach `5m` bzw. `10m` im Security-Pfad als fehlgeschlagen

Wenn ClickHouse kurzzeitig ausfaellt, bleiben Daten zunaechst in der Queue. Wenn die Queue ihre Grenzen erreicht, muss ein Betriebsalarm ausgeloest werden, damit ueberlaufende Daten nicht unbemerkt verloren gehen.

## SIEM-Ausrichtung ueber OTel Security Events

Security-Events werden nicht als eigener Sonderweg ausserhalb der OTel-Pipeline behandelt. Stattdessen werden sie als strukturierte Log-Ereignisse mit Sicherheitsattributen erzeugt und ueber einen separaten Exportpfad nach `otel_security_events` geliefert.

Weitergeleitet werden sollten mindestens:

- OPA-Policy-Deny oder Admission-Verstoss
- Cilium/Tetragon/Hubble sicherheitsrelevante Befunde, sofern sie ins OTel-Format ueberfuehrt werden
- Authentifizierungs- und Autorisierungsfehler
- degradierter `local`-Modus in produktionsnaher Umgebung
- Queue-Ueberlauf, Replay-Fehler und Telemetrieverlust

Der Grund dafuer ist Nachvollziehbarkeit: Security Operations und Plattformbetrieb sehen dieselbe Korrelation aus `trace_id`, `service.name`, `k8s.namespace.name` und `event.domain=security`.

## Airgapped Betrieb

Fuer airgapped Umgebungen gilt die Regel:

- Erst Git und Release-Artefakt
- dann Offline-Transport
- dann Collector- und Grafana-Konfiguration importieren

Fuer den Transport genuegt ein Paket mit:

- den Collector-Profilen aus `monitoring/otel/`
- der Dashboard-JSON aus `monitoring/grafana/dashboards/`
- dem Datasource-Stub aus `monitoring/grafana/provisioning/datasources/`
- optional dem lokalen Spool-Verzeichnis fuer spaeteres Replay

## Smoke-Test lokal

1. Collector im `local`-Modus starten.
2. App gegen `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318` senden lassen.
3. Pruefen, dass unter `/var/lib/otel/spool/` eine JSONL-Datei entsteht.
4. Collector stoppen, `clickhouse`-Profil starten und dasselbe Spool-Verzeichnis mounten.
5. Pruefen, dass Replay-Dateien eingelesen und in ClickHouse sichtbar werden.
6. Grafana mit ClickHouse-Datasource starten und Dashboard importieren.

## Grenzen und Betriebsregeln

- `local` und `clickhouse` duerfen nicht gleichzeitig als gleichwertige Primaermodi betrieben werden.
- `local` ist fuer Entwicklung, Lab und degradierte Offline-Phasen gedacht.
- `clickhouse` ist der Zielmodus fuer nachvollziehbaren Betrieb und Dashboards.
- Produktivbetrieb ohne Queue-Alarmierung ist nicht ausreichend.
- Sensible Inhalte gehoeren nicht in Logs oder Event-Attribute; Maskierung ist vor dem Export Pflicht.
