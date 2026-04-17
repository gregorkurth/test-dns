'use client'

import { useCallback, useMemo } from 'react'

import { AuthGuard } from '@/components/auth-guard'
import { TerminalPanel } from '@/components/terminal/terminal-panel'
import { TerminalShell } from '@/components/terminal/terminal-shell'
import { TerminalStatCard } from '@/components/terminal/terminal-stat-card'
import { TerminalUpdateBar } from '@/components/terminal/terminal-update-bar'
import { useTerminalPoll } from '@/hooks/use-terminal-poll'
import { useObj12Auth } from '@/lib/obj12-client-auth'
import { terminalApiFetch } from '@/lib/terminal-api'

const REFRESH_INTERVAL_SECONDS = 30

// ---------- Types for consumed API data (subset of what the API returns) ----------

interface ApiNameserver {
  fqdn?: string
  ipv4?: string
}

interface ApiParticipantObj5 {
  ccNumber?: string
  poc?: {
    name?: string
    email?: string
    phone?: string
  }
  delegatedZones?: {
    forward?: string[]
    reverse?: string[]
  }
  nameservers?: ApiNameserver[]
  resolvers?: ApiNameserver[]
  forwardServers?: ApiNameserver[]
  anycast?: {
    enabled?: boolean
    fqdn?: string
    ipv4?: string
  }
}

interface ApiParticipant {
  id: string
  name: string
  fqdn: string | null
  ipv4: string | null
  role: string | null
  metadata?: {
    obj5?: ApiParticipantObj5
  }
}

interface ApiCapability {
  id: string
  name: string
  maturity: string | null
  serviceCount: number
  serviceFunctionCount: number
  requirementCount: number
}

// ---------- Derived view-model types ----------

type ServerStatus = 'online' | 'degraded' | 'offline' | 'unknown'

interface ForwardServerView {
  participantId: string
  hostname: string
  ipAddresses: string[]
  role: string
  status: ServerStatus
}

interface ZoneView {
  name: string
  kind: 'forward' | 'reverse'
  recordCount: number
  state: 'valid' | 'warning' | 'error'
  hostedBy: string[]
}

interface TopologyModel {
  root: { label: string; hostname: string } | null
  authoritative: Array<{ label: string; hostname: string; ip: string }>
  resolvers: Array<{ label: string; hostname: string; ip: string }>
}

// ---------- Derivation helpers ----------

function deriveServerStatus(participant: ApiParticipant): ServerStatus {
  const obj5 = participant.metadata?.obj5
  const hasNameservers = (obj5?.nameservers?.length ?? 0) > 0
  const hasForwardOrResolvers =
    (obj5?.resolvers?.length ?? 0) > 0 || (obj5?.forwardServers?.length ?? 0) > 0
  const hasAnycastActive = obj5?.anycast?.enabled === true && !!obj5?.anycast?.ipv4
  const hasAnyIp = !!participant.ipv4 || hasNameservers || hasForwardOrResolvers || hasAnycastActive

  if (!hasAnyIp) return 'unknown'
  if (hasNameservers && (hasForwardOrResolvers || hasAnycastActive)) return 'online'
  if (hasNameservers || hasForwardOrResolvers) return 'online'
  return 'degraded'
}

function collectServerIps(participant: ApiParticipant): string[] {
  const obj5 = participant.metadata?.obj5
  const set = new Set<string>()
  if (participant.ipv4) set.add(participant.ipv4)
  for (const ns of obj5?.nameservers ?? []) {
    if (ns.ipv4) set.add(ns.ipv4)
  }
  for (const ns of obj5?.resolvers ?? []) {
    if (ns.ipv4) set.add(ns.ipv4)
  }
  for (const fw of obj5?.forwardServers ?? []) {
    if (fw.ipv4) set.add(fw.ipv4)
  }
  if (obj5?.anycast?.enabled && obj5.anycast.ipv4) {
    set.add(obj5.anycast.ipv4)
  }
  return Array.from(set)
}

function buildServerView(participant: ApiParticipant): ForwardServerView {
  const obj5 = participant.metadata?.obj5
  const primaryNs = obj5?.nameservers?.[0]
  const hostname = primaryNs?.fqdn || participant.fqdn || participant.name || participant.id

  return {
    participantId: participant.id,
    hostname,
    ipAddresses: collectServerIps(participant),
    role: participant.role || 'Forward DNS Server',
    status: deriveServerStatus(participant),
  }
}

function buildZoneViews(participants: ApiParticipant[]): ZoneView[] {
  const zones = new Map<string, ZoneView>()

  for (const participant of participants) {
    const obj5 = participant.metadata?.obj5
    const nameserverCount = obj5?.nameservers?.length ?? 0
    const resolverCount = obj5?.resolvers?.length ?? 0
    const hasAnycast = obj5?.anycast?.enabled ? 1 : 0

    for (const forward of obj5?.delegatedZones?.forward ?? []) {
      const existing = zones.get(forward) ?? {
        name: forward,
        kind: 'forward' as const,
        recordCount: 0,
        state: 'valid' as const,
        hostedBy: [],
      }
      existing.recordCount += nameserverCount + resolverCount + hasAnycast
      if (!existing.hostedBy.includes(participant.name)) {
        existing.hostedBy.push(participant.name)
      }
      if (existing.recordCount === 0) {
        existing.state = 'warning'
      }
      zones.set(forward, existing)
    }

    for (const reverse of obj5?.delegatedZones?.reverse ?? []) {
      const existing = zones.get(reverse) ?? {
        name: reverse,
        kind: 'reverse' as const,
        recordCount: 0,
        state: 'valid' as const,
        hostedBy: [],
      }
      existing.recordCount += nameserverCount
      if (!existing.hostedBy.includes(participant.name)) {
        existing.hostedBy.push(participant.name)
      }
      if (existing.recordCount === 0) {
        existing.state = 'warning'
      }
      zones.set(reverse, existing)
    }
  }

  return Array.from(zones.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  )
}

function buildTopology(participants: ApiParticipant[]): TopologyModel {
  const authoritative: TopologyModel['authoritative'] = []
  const resolvers: TopologyModel['resolvers'] = []
  let root: TopologyModel['root'] = null

  for (const participant of participants) {
    const obj5 = participant.metadata?.obj5
    if (obj5?.anycast?.enabled && obj5.anycast.fqdn) {
      root = { label: 'ANYCAST ROOT', hostname: obj5.anycast.fqdn }
    }
    for (const ns of obj5?.nameservers ?? []) {
      if (ns.fqdn) {
        authoritative.push({
          label: 'AUTHORITATIVE',
          hostname: ns.fqdn,
          ip: ns.ipv4 ?? '—',
        })
      }
    }
    for (const rs of obj5?.resolvers ?? []) {
      if (rs.fqdn) {
        resolvers.push({
          label: 'RESOLVER',
          hostname: rs.fqdn,
          ip: rs.ipv4 ?? '—',
        })
      }
    }
  }

  return {
    root,
    authoritative: authoritative.slice(0, 4),
    resolvers: resolvers.slice(0, 4),
  }
}

// ---------- Sub-components ----------

function StatusBadge({ status }: { status: ServerStatus }) {
  if (status === 'online') {
    return (
      <span className="sbadge online" aria-label="Status: online">
        <span className="sdot online" aria-hidden="true" />
        ONLINE
      </span>
    )
  }
  if (status === 'degraded') {
    return (
      <span className="sbadge degraded" aria-label="Status: degraded">
        <span className="sdot degraded" aria-hidden="true" />
        DEGRADED
      </span>
    )
  }
  if (status === 'offline') {
    return (
      <span className="sbadge offline" aria-label="Status: offline">
        <span className="sdot offline" aria-hidden="true" />
        OFFLINE
      </span>
    )
  }
  return (
    <span className="sbadge" aria-label="Status: unknown">
      <span className="sdot" aria-hidden="true" />
      UNKNOWN
    </span>
  )
}

function ServersPanel({
  servers,
  loading,
  error,
}: {
  servers: ForwardServerView[]
  loading: boolean
  error: string | null
}) {
  return (
    <TerminalPanel
      label="Forward DNS Server"
      right={
        <span style={{ color: 'var(--text-muted)', letterSpacing: '0.18em' }}>
          {servers.length} HOSTS
        </span>
      }
      aria-label="DNS Server panel"
    >
      {error ? (
        <div className="alert alert-err" role="alert">
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </div>
      ) : null}

      {!error && servers.length === 0 && !loading ? (
        <div
          className="py-8 text-center text-[11px]"
          style={{ color: 'var(--text-muted)' }}
        >
          Keine DNS-Server konfiguriert.
        </div>
      ) : null}

      {servers.length > 0 ? (
        <div className="flex flex-col gap-2">
          {servers.map((server) => (
            <article
              key={server.participantId}
              className="flex flex-col gap-2 border p-3 md:flex-row md:items-center md:justify-between"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--tborder)',
              }}
            >
              <div className="min-w-0">
                <div
                  className="truncate text-[14px] font-bold"
                  style={{
                    color: 'var(--text-bright)',
                    letterSpacing: '0.03em',
                  }}
                >
                  {server.hostname}
                </div>
                <div
                  className="mt-1 text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: 'var(--text-dim)' }}
                >
                  {server.role}
                </div>
                <div
                  className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {server.ipAddresses.length > 0 ? (
                    server.ipAddresses.map((ip) => (
                      <span
                        key={ip}
                        style={{ color: 'var(--accent-dim)' }}
                        className="font-mono"
                      >
                        {ip}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-dim)' }}>Keine IP zugewiesen</span>
                  )}
                </div>
              </div>
              <StatusBadge status={server.status} />
            </article>
          ))}
        </div>
      ) : null}
    </TerminalPanel>
  )
}

function ZonesPanel({
  zones,
  loading,
  error,
}: {
  zones: ZoneView[]
  loading: boolean
  error: string | null
}) {
  return (
    <TerminalPanel
      label="Hosted Zones"
      right={
        <span style={{ color: 'var(--text-muted)', letterSpacing: '0.18em' }}>
          {zones.length} ZONES
        </span>
      }
      aria-label="Hosted zones panel"
    >
      {error ? (
        <div className="alert alert-err" role="alert">
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </div>
      ) : null}

      {!error && zones.length === 0 && !loading ? (
        <div
          className="py-8 text-center text-[11px]"
          style={{ color: 'var(--text-muted)' }}
        >
          Keine Zonen konfiguriert.
        </div>
      ) : null}

      {zones.length > 0 ? (
        <div className="max-h-[340px] overflow-y-auto pr-1">
          <table className="w-full border-collapse text-left text-[11px]">
            <thead
              className="text-[9px] uppercase tracking-[0.2em]"
              style={{ color: 'var(--text-dim)' }}
            >
              <tr>
                <th className="py-2 pr-2 font-normal">Zone</th>
                <th className="py-2 pr-2 font-normal">Kind</th>
                <th className="py-2 pr-2 text-right font-normal">Records</th>
                <th className="py-2 pr-2 font-normal">State</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => {
                const badgeClass =
                  zone.state === 'valid'
                    ? 'sbadge online'
                    : zone.state === 'warning'
                      ? 'sbadge degraded'
                      : 'sbadge offline'
                const dotClass =
                  zone.state === 'valid'
                    ? 'online'
                    : zone.state === 'warning'
                      ? 'degraded'
                      : 'offline'
                return (
                  <tr
                    key={zone.name}
                    className="border-t"
                    style={{ borderColor: 'var(--tborder)' }}
                  >
                    <td
                      className="py-2 pr-2 font-mono"
                      style={{ color: 'var(--text-bright)' }}
                    >
                      {zone.name}
                      {zone.hostedBy.length > 0 ? (
                        <div
                          className="mt-1 text-[9px] uppercase tracking-[0.16em]"
                          style={{ color: 'var(--text-dim)' }}
                        >
                          by {zone.hostedBy.join(', ')}
                        </div>
                      ) : null}
                    </td>
                    <td
                      className="py-2 pr-2 text-[10px] uppercase tracking-[0.16em]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {zone.kind}
                    </td>
                    <td
                      className="py-2 pr-2 text-right font-mono"
                      style={{ color: 'var(--accent-color)' }}
                    >
                      {zone.recordCount}
                    </td>
                    <td className="py-2 pr-2">
                      <span className={badgeClass}>
                        <span className={`sdot ${dotClass}`} aria-hidden="true" />
                        {zone.state.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </TerminalPanel>
  )
}

function TopologyPanel({ model }: { model: TopologyModel }) {
  const { root, authoritative, resolvers } = model
  const hasAnyNode = root || authoritative.length > 0 || resolvers.length > 0

  if (!hasAnyNode) {
    return (
      <TerminalPanel label="DNS Topology">
        <div
          className="flex h-[200px] items-center justify-center border text-center text-[11px] uppercase tracking-[0.2em]"
          style={{
            borderColor: 'var(--tborder)',
            color: 'var(--text-muted)',
            borderStyle: 'dashed',
          }}
        >
          No data
        </div>
      </TerminalPanel>
    )
  }

  const authSlots = 4
  const resolverSlots = 4
  const authX = (index: number) =>
    720 / (authSlots + 1) * (index + 1)
  const resolverX = (index: number) =>
    720 / (resolverSlots + 1) * (index + 1)

  return (
    <TerminalPanel label="DNS Topology">
      <svg
        viewBox="0 0 720 260"
        role="img"
        aria-label="DNS hierarchy diagram"
        style={{ width: '100%', height: 260 }}
      >
        <defs>
          <marker
            id="dns-arr"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill="#1a4a2e" />
          </marker>
          <filter id="dns-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {root ? (
          <g>
            <rect
              x="260"
              y="8"
              width="200"
              height="46"
              fill="#0d1117"
              stroke="#1a4a2e"
              strokeWidth="1.5"
            />
            <text
              x="360"
              y="24"
              fill="#00cc33"
              fontSize="8"
              letterSpacing="3"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {root.label}
            </text>
            <text
              x="360"
              y="44"
              fill="#00ff41"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
              filter="url(#dns-glow)"
            >
              {root.hostname}
            </text>
            <circle cx="448" cy="30" r="4" fill="#3fb950" className="topo-node-pulse" />
          </g>
        ) : null}

        {authoritative.length > 0 ? (
          <g>
            {authoritative.map((node, index) => {
              const x = authX(index)
              return (
                <g key={`auth-${index}`}>
                  {root ? (
                    <line
                      x1="360"
                      y1="54"
                      x2={x}
                      y2="100"
                      stroke="#1a4a2e"
                      strokeWidth="1.2"
                      strokeDasharray="5,3"
                      markerEnd="url(#dns-arr)"
                    />
                  ) : null}
                  <rect
                    x={x - 78}
                    y="100"
                    width="156"
                    height="46"
                    fill="#111820"
                    stroke="#00cc33"
                    strokeWidth="1.2"
                  />
                  <text
                    x={x - 68}
                    y="116"
                    fill="#00cc33"
                    fontSize="7"
                    letterSpacing="2.5"
                    fontFamily="monospace"
                  >
                    {node.label}
                  </text>
                  <text
                    x={x}
                    y="132"
                    fill="#e6edf3"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {node.hostname.length > 22
                      ? `${node.hostname.slice(0, 21)}…`
                      : node.hostname}
                  </text>
                  <circle
                    cx={x + 68}
                    cy="112"
                    r="3.5"
                    fill="#3fb950"
                    className="topo-node-pulse"
                  />
                </g>
              )
            })}
          </g>
        ) : null}

        {resolvers.length > 0 ? (
          <g>
            {resolvers.map((node, index) => {
              const x = resolverX(index)
              const parentX =
                authoritative.length > 0
                  ? authX(Math.min(index, authoritative.length - 1))
                  : 360
              return (
                <g key={`res-${index}`}>
                  <line
                    x1={parentX}
                    y1="146"
                    x2={x}
                    y2="200"
                    stroke="#1a4a2e"
                    strokeWidth="1.2"
                    strokeDasharray="5,3"
                    markerEnd="url(#dns-arr)"
                  />
                  <rect
                    x={x - 72}
                    y="200"
                    width="144"
                    height="42"
                    fill="#111820"
                    stroke="#1e2a38"
                    strokeWidth="1.2"
                  />
                  <text
                    x={x - 62}
                    y="214"
                    fill="#6e7681"
                    fontSize="7"
                    letterSpacing="2.5"
                    fontFamily="monospace"
                  >
                    {node.label}
                  </text>
                  <text
                    x={x}
                    y="230"
                    fill="#c9d1d9"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {node.hostname.length > 20
                      ? `${node.hostname.slice(0, 19)}…`
                      : node.hostname}
                  </text>
                </g>
              )
            })}
          </g>
        ) : null}
      </svg>
    </TerminalPanel>
  )
}

// ---------- Main client component ----------

function DnsDashboardContent() {
  const auth = useObj12Auth()
  const accessToken = auth.accessToken

  const participantsFetcher = useCallback(
    async (signal: AbortSignal) => {
      if (!accessToken) return [] as ApiParticipant[]
      return terminalApiFetch<ApiParticipant[]>('/api/v1/participants', accessToken, {
        signal,
      })
    },
    [accessToken],
  )

  const capabilitiesFetcher = useCallback(
    async (signal: AbortSignal) => {
      if (!accessToken) return [] as ApiCapability[]
      return terminalApiFetch<ApiCapability[]>('/api/v1/capabilities', accessToken, {
        signal,
      })
    },
    [accessToken],
  )

  const participantsPoll = useTerminalPoll({
    fetcher: participantsFetcher,
    intervalMs: REFRESH_INTERVAL_SECONDS * 1000,
    enabled: !!accessToken,
  })
  const capabilitiesPoll = useTerminalPoll({
    fetcher: capabilitiesFetcher,
    intervalMs: REFRESH_INTERVAL_SECONDS * 1000,
    enabled: !!accessToken,
  })

  const participants = useMemo(
    () => participantsPoll.data ?? [],
    [participantsPoll.data],
  )
  const capabilities = useMemo(
    () => capabilitiesPoll.data ?? [],
    [capabilitiesPoll.data],
  )

  const servers = useMemo(() => participants.map(buildServerView), [participants])
  const zones = useMemo(() => buildZoneViews(participants), [participants])
  const topology = useMemo(() => buildTopology(participants), [participants])

  const onlineCount = servers.filter((s) => s.status === 'online').length
  const degradedCount = servers.filter((s) => s.status === 'degraded').length
  const totalRecords = zones.reduce((sum, zone) => sum + zone.recordCount, 0)
  const totalRequirements = capabilities.reduce(
    (sum, cap) => sum + (cap.requirementCount ?? 0),
    0,
  )

  const systemStatus: 'operational' | 'degraded' =
    servers.length > 0 && onlineCount === servers.length ? 'operational' : 'degraded'

  const combinedLoading = participantsPoll.loading || capabilitiesPoll.loading
  const combinedLastUpdated =
    participantsPoll.lastUpdated && capabilitiesPoll.lastUpdated
      ? participantsPoll.lastUpdated > capabilitiesPoll.lastUpdated
        ? participantsPoll.lastUpdated
        : capabilitiesPoll.lastUpdated
      : participantsPoll.lastUpdated ?? capabilitiesPoll.lastUpdated

  const handleManualRefresh = useCallback(() => {
    participantsPoll.reload()
    capabilitiesPoll.reload()
  }, [participantsPoll, capabilitiesPoll])

  return (
    <TerminalShell
      title="DNS OVERVIEW"
      subtitle="CC-517 / Domain Naming"
      status={systemStatus}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <TerminalStatCard
            label="Zonen gesamt"
            value={zones.length}
            sub="Konfiguriert"
            highlight
          />
          <TerminalStatCard
            label="Records gesamt"
            value={totalRecords}
            sub="Aggregiert"
            highlight
          />
          <TerminalStatCard
            label="Aktive Server"
            value={`${onlineCount}/${servers.length}`}
            sub={degradedCount > 0 ? `${degradedCount} degraded` : 'Alle OK'}
            highlight={onlineCount > 0 && degradedCount === 0}
          />
          <TerminalStatCard
            label="Requirements"
            value={totalRequirements}
            sub="SREQ/CREQ gesamt"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ServersPanel
            servers={servers}
            loading={participantsPoll.loading}
            error={participantsPoll.error}
          />
          <ZonesPanel
            zones={zones}
            loading={participantsPoll.loading}
            error={participantsPoll.error}
          />
        </div>

        <TopologyPanel model={topology} />

        <TerminalUpdateBar
          intervalSeconds={REFRESH_INTERVAL_SECONDS}
          lastUpdated={combinedLastUpdated}
          loading={combinedLoading}
          onManualRefresh={handleManualRefresh}
        />
      </div>
    </TerminalShell>
  )
}

export function DnsDashboardClient() {
  return (
    <AuthGuard minimumRole="viewer">
      <DnsDashboardContent />
    </AuthGuard>
  )
}
