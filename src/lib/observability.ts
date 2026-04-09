export type ObservabilityExportMode = 'local' | 'clickhouse'

export interface ObservabilityProbeConfig {
  serviceName: string
  exportMode: ObservabilityExportMode | 'unknown'
  exportEndpoint: string
  dashboardVersion: string
  environment: string
}

export interface ObservabilityProbeEvent extends ObservabilityProbeConfig {
  event: 'observability-probe'
  timestamp: string
  signals: Array<'metrics' | 'logs' | 'traces' | 'security-events'>
}

export function readObservabilityProbeConfig(
  env: NodeJS.ProcessEnv = process.env,
): ObservabilityProbeConfig {
  const exportMode = env.OTEL_EXPORT_MODE?.trim() || 'local'

  return {
    serviceName:
      env.OTEL_SERVICE_NAME?.trim() ||
      env.SERVICE_NAME?.trim() ||
      'dns-management-service',
    exportMode: exportMode === 'clickhouse' ? 'clickhouse' : 'local',
    exportEndpoint:
      env.OTEL_EXPORT_ENDPOINT?.trim() ||
      'http://otel-collector.monitoring.svc.cluster.local:4318',
    dashboardVersion:
      env.OBSERVABILITY_GRAFANA_DASHBOARD_VERSION?.trim() ||
      'dns-observability-v1',
    environment: env.NODE_ENV?.trim() || 'production',
  }
}

export function buildObservabilityProbe(
  env: NodeJS.ProcessEnv = process.env,
): ObservabilityProbeEvent {
  const config = readObservabilityProbeConfig(env)

  return {
    event: 'observability-probe',
    timestamp: new Date().toISOString(),
    signals: ['metrics', 'logs', 'traces', 'security-events'],
    ...config,
  }
}

export function emitObservabilityProbeLog(
  probe: ObservabilityProbeEvent,
): void {
  console.info(JSON.stringify(probe))
}
