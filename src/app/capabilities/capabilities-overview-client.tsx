'use client'

import { useCallback, useMemo } from 'react'

import { TerminalPanel } from '@/components/terminal/terminal-panel'
import { TerminalShell } from '@/components/terminal/terminal-shell'
import { TerminalStatCard } from '@/components/terminal/terminal-stat-card'
import { TerminalUpdateBar } from '@/components/terminal/terminal-update-bar'
import { useTerminalPoll } from '@/hooks/use-terminal-poll'
import { useObj12Auth } from '@/lib/obj12-client-auth'
import { terminalApiFetch } from '@/lib/terminal-api'

const REFRESH_INTERVAL_SECONDS = 30

// ---------- API types ----------

interface ApiCapability {
  id: string
  name: string
  maturity: string | null
  serviceCount: number
  serviceFunctionCount: number
  requirementCount: number
}

interface ApiParticipantObj5 {
  delegatedZones?: {
    forward?: string[]
    reverse?: string[]
  }
  nameservers?: Array<{ fqdn?: string }>
  capabilities?: string[]
  capabilityIds?: string[]
}

interface ApiParticipant {
  id: string
  name: string
  role: string | null
  fqdn: string | null
  metadata?: {
    obj5?: ApiParticipantObj5
    capabilityId?: string
    capabilityIds?: string[]
  }
}

// ---------- Derivation helpers ----------

type MaturityKind = 'operational' | 'degraded' | 'unknown'

function classifyMaturity(maturity: string | null): MaturityKind {
  if (!maturity) return 'unknown'
  const text = maturity.toLowerCase()
  if (text.includes('operational')) return 'operational'
  if (
    text.includes('development') ||
    text.includes('progress') ||
    text.includes('idea') ||
    text.includes('planned') ||
    text.includes('review') ||
    text.includes('l0') ||
    text.includes('l1') ||
    text.includes('l2') ||
    text.includes('l3')
  ) {
    return 'degraded'
  }
  return 'degraded'
}

function resolveParticipantCapabilityIds(participant: ApiParticipant): string[] {
  const raw = new Set<string>()

  const metadata = participant.metadata
  if (!metadata) return []

  if (typeof metadata.capabilityId === 'string' && metadata.capabilityId.trim()) {
    raw.add(metadata.capabilityId.trim().toUpperCase())
  }
  if (Array.isArray(metadata.capabilityIds)) {
    for (const value of metadata.capabilityIds) {
      if (typeof value === 'string' && value.trim()) {
        raw.add(value.trim().toUpperCase())
      }
    }
  }
  if (Array.isArray(metadata.obj5?.capabilities)) {
    for (const value of metadata.obj5!.capabilities as string[]) {
      if (typeof value === 'string' && value.trim()) raw.add(value.trim().toUpperCase())
    }
  }
  if (Array.isArray(metadata.obj5?.capabilityIds)) {
    for (const value of metadata.obj5!.capabilityIds as string[]) {
      if (typeof value === 'string' && value.trim()) raw.add(value.trim().toUpperCase())
    }
  }

  return Array.from(raw)
}

function buildParticipantAssignments(
  capabilities: ApiCapability[],
  participants: ApiParticipant[],
): Map<string, ApiParticipant[]> {
  const map = new Map<string, ApiParticipant[]>()
  for (const capability of capabilities) {
    map.set(capability.id.toUpperCase(), [])
  }

  for (const participant of participants) {
    const ids = resolveParticipantCapabilityIds(participant)
    if (ids.length === 0) {
      // Fallback: a participant that manages any DNS zone is associated with
      // every DNS Domain-Naming capability currently known (typically CAP-001).
      const hasDnsPayload =
        (participant.metadata?.obj5?.nameservers?.length ?? 0) > 0 ||
        (participant.metadata?.obj5?.delegatedZones?.forward?.length ?? 0) > 0
      if (hasDnsPayload) {
        for (const capability of capabilities) {
          if (capability.name.toLowerCase().includes('domain naming')) {
            map.get(capability.id.toUpperCase())?.push(participant)
          }
        }
      }
      continue
    }
    for (const id of ids) {
      if (map.has(id)) {
        map.get(id)!.push(participant)
      }
    }
  }

  return map
}

function extractMaturityLevel(maturity: string | null): string {
  if (!maturity) return 'UNKNOWN'
  // e.g. "L2 – In Development (Stand: 2026-03-16)" -> "L2 · IN DEVELOPMENT"
  const levelMatch = maturity.match(/^\s*(L[0-5])/i)
  const noTrailingDate = maturity.replace(/\(stand:[^)]*\)/i, '').trim()
  const cleaned = noTrailingDate.replace(/[–—-]/g, '·')
  if (levelMatch) {
    return cleaned.toUpperCase()
  }
  return cleaned.toUpperCase()
}

// ---------- Sub-components ----------

function MaturityBadge({ maturity }: { maturity: string | null }) {
  const kind = classifyMaturity(maturity)
  const label = extractMaturityLevel(maturity)
  if (kind === 'operational') {
    return (
      <span className="sbadge online" aria-label={`Maturity: ${label}`}>
        <span className="sdot online" aria-hidden="true" />
        {label}
      </span>
    )
  }
  if (kind === 'degraded') {
    return (
      <span className="sbadge degraded" aria-label={`Maturity: ${label}`}>
        <span className="sdot degraded" aria-hidden="true" />
        {label}
      </span>
    )
  }
  return (
    <span className="sbadge" aria-label="Maturity: unknown">
      <span className="sdot" aria-hidden="true" />
      UNKNOWN
    </span>
  )
}

function CapabilityCard({
  capability,
  participants,
}: {
  capability: ApiCapability
  participants: ApiParticipant[]
}) {
  return (
    <article className="panel" aria-label={`Capability ${capability.id}`}>
      <div className="panel-label">
        <span>{capability.id}</span>
        <span style={{ marginLeft: 'auto' }}>
          <MaturityBadge maturity={capability.maturity} />
        </span>
      </div>

      <h3
        className="mb-3 text-[15px] font-bold"
        style={{
          color: 'var(--text-bright)',
          letterSpacing: '0.03em',
        }}
      >
        {capability.name}
      </h3>

      <div className="grid grid-cols-3 gap-2">
        <div className="metric">
          <div className="metric-lbl">Services</div>
          <div className="metric-val g">{capability.serviceCount}</div>
        </div>
        <div className="metric">
          <div className="metric-lbl">Functions</div>
          <div className="metric-val">{capability.serviceFunctionCount}</div>
        </div>
        <div className="metric">
          <div className="metric-lbl">Requirements</div>
          <div className="metric-val">{capability.requirementCount}</div>
        </div>
      </div>

      <div className="mt-4">
        <div
          className="mb-2 text-[9px] uppercase tracking-[0.22em]"
          style={{ color: 'var(--text-dim)' }}
        >
          Participants
        </div>
        {participants.length === 0 ? (
          <div
            className="text-[11px] italic"
            style={{ color: 'var(--text-dim)' }}
          >
            Keine Participants zugeordnet
          </div>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {participants.map((participant) => (
              <li
                key={participant.id}
                className="border px-2 py-[3px] text-[10px] uppercase tracking-[0.14em]"
                style={{
                  borderColor: 'var(--tborder)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                }}
              >
                {participant.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

// ---------- Main client component ----------

function CapabilitiesOverviewContent() {
  const auth = useObj12Auth()
  const accessToken = auth.accessToken

  const capabilitiesFetcher = useCallback(
    async (signal: AbortSignal) => {
      if (!accessToken) return [] as ApiCapability[]
      return terminalApiFetch<ApiCapability[]>('/api/v1/capabilities', accessToken, {
        signal,
      })
    },
    [accessToken],
  )

  const participantsFetcher = useCallback(
    async (signal: AbortSignal) => {
      if (!accessToken) return [] as ApiParticipant[]
      return terminalApiFetch<ApiParticipant[]>('/api/v1/participants', accessToken, {
        signal,
      })
    },
    [accessToken],
  )

  const capabilitiesPoll = useTerminalPoll({
    fetcher: capabilitiesFetcher,
    intervalMs: REFRESH_INTERVAL_SECONDS * 1000,
    enabled: !!accessToken,
  })
  const participantsPoll = useTerminalPoll({
    fetcher: participantsFetcher,
    intervalMs: REFRESH_INTERVAL_SECONDS * 1000,
    enabled: !!accessToken,
  })

  const capabilities = useMemo(
    () => capabilitiesPoll.data ?? [],
    [capabilitiesPoll.data],
  )
  const participants = useMemo(
    () => participantsPoll.data ?? [],
    [participantsPoll.data],
  )

  const assignments = useMemo(
    () => buildParticipantAssignments(capabilities, participants),
    [capabilities, participants],
  )

  const totals = useMemo(() => {
    let services = 0
    let functions = 0
    let requirements = 0
    let operational = 0
    for (const cap of capabilities) {
      services += cap.serviceCount ?? 0
      functions += cap.serviceFunctionCount ?? 0
      requirements += cap.requirementCount ?? 0
      if (classifyMaturity(cap.maturity) === 'operational') operational += 1
    }
    return { services, functions, requirements, operational }
  }, [capabilities])

  const systemStatus: 'operational' | 'degraded' =
    capabilities.length > 0 && totals.operational === capabilities.length
      ? 'operational'
      : 'degraded'

  const combinedLoading = capabilitiesPoll.loading || participantsPoll.loading
  const combinedLastUpdated =
    capabilitiesPoll.lastUpdated && participantsPoll.lastUpdated
      ? capabilitiesPoll.lastUpdated > participantsPoll.lastUpdated
        ? capabilitiesPoll.lastUpdated
        : participantsPoll.lastUpdated
      : capabilitiesPoll.lastUpdated ?? participantsPoll.lastUpdated

  const handleManualRefresh = useCallback(() => {
    capabilitiesPoll.reload()
    participantsPoll.reload()
  }, [capabilitiesPoll, participantsPoll])

  const fatalError = capabilitiesPoll.error
  const isEmpty =
    !fatalError && !capabilitiesPoll.loading && capabilities.length === 0

  return (
    <TerminalShell
      title="CAPABILITIES"
      subtitle="FMN Service Hierarchy"
      status={systemStatus}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <TerminalStatCard
            label="Capabilities"
            value={capabilities.length}
            sub={
              capabilities.length > 0
                ? `${totals.operational} operational`
                : 'Keine Daten'
            }
            highlight
          />
          <TerminalStatCard
            label="Services"
            value={totals.services}
            sub="Summiert"
            highlight
          />
          <TerminalStatCard
            label="Service Functions"
            value={totals.functions}
            sub="Summiert"
          />
          <TerminalStatCard
            label="Requirements"
            value={totals.requirements}
            sub="SREQ / CREQ"
          />
        </div>

        {fatalError ? (
          <div className="alert alert-err" role="alert">
            <span aria-hidden="true">!</span>
            <span>
              {fatalError.toLowerCase().includes('401') ||
              fatalError.toLowerCase().includes('unauth')
                ? 'Session abgelaufen – bitte erneut anmelden. '
                : ''}
              {fatalError}
            </span>
          </div>
        ) : null}

        {isEmpty ? (
          <TerminalPanel label="No data">
            <div
              className="flex items-center justify-center py-10 text-center text-[11px] uppercase tracking-[0.2em]"
              style={{ color: 'var(--text-muted)' }}
            >
              ⓘ Keine Capabilities konfiguriert
            </div>
          </TerminalPanel>
        ) : null}

        {capabilities.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {capabilities.map((capability) => (
              <CapabilityCard
                key={capability.id}
                capability={capability}
                participants={assignments.get(capability.id.toUpperCase()) ?? []}
              />
            ))}
          </div>
        ) : null}

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

export function CapabilitiesOverviewClient() {
  return <CapabilitiesOverviewContent />
}
