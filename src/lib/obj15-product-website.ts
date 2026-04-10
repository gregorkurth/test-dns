import {
  getLatestReleaseNotice,
  getReleaseNotices,
  type ReleaseNotice,
  type ReleaseSeverity,
} from '@/lib/obj14-release-management'
import { loadObj16MaturityData } from '@/lib/obj16-maturity'

export type ProductReleaseChannel = 'released' | 'beta' | 'preview'
export type ProductNoticePriority = 'critical' | 'important' | 'info'

export interface ProductWebsiteUpdateNotice {
  id: string
  version: string
  title: string
  summary: string
  priority: ProductNoticePriority
  channel: ProductReleaseChannel
  dismissible: boolean
  actionLabel: string
  actionHref: string
}

export interface ProductWebsiteMaturityStatus {
  available: boolean
  label: string
  summary: string
  updatedAt: string | null
}

export interface ProductWebsiteNavigationLink {
  label: string
  href: string
  type: 'internal' | 'external'
}

export interface ProductWebsiteViewModel {
  service: {
    name: string
    shortDescription: string
    audience: string
    purpose: string
    operatingContext: string
  }
  release: {
    version: string
    publishedAt: string | null
    channel: ProductReleaseChannel
    channelLabel: string
    channelRiskHint: string
  }
  channelLegend: Array<{
    channel: ProductReleaseChannel
    label: string
    riskHint: string
  }>
  updateNotices: ProductWebsiteUpdateNotice[]
  maturity: ProductWebsiteMaturityStatus
  navigation: ProductWebsiteNavigationLink[]
  sourceOfTruth: {
    primary: string
    releaseNoticesFile: string
    note: string
  }
  updatedAt: string
}

const PRODUCT_WEBSITE_CHANNEL_LABELS: Record<ProductReleaseChannel, string> = {
  released: 'Released (GA)',
  beta: 'Beta',
  preview: 'Preview',
}

const PRODUCT_WEBSITE_CHANNEL_HINTS: Record<ProductReleaseChannel, string> = {
  released: 'Stabiler Kanal fuer den produktiven Betrieb.',
  beta: 'Teilweise stabil, fuer Pilotierung und kontrollierte Nutzung.',
  preview: 'Vorabstand mit erhoehtem Risiko und moeglichen Aenderungen.',
}

const PRIORITY_ORDER: Record<ProductNoticePriority, number> = {
  critical: 0,
  important: 1,
  info: 2,
}

function mapReleaseSeverityToPriority(
  severity: ReleaseSeverity,
): ProductNoticePriority {
  if (severity === 'high') {
    return 'critical'
  }

  if (severity === 'medium') {
    return 'important'
  }

  return 'info'
}

function mapReleaseChannelToProductChannel(
  release: Pick<ReleaseNotice, 'channel' | 'status'>,
): ProductReleaseChannel {
  if (release.channel === 'beta') {
    return 'beta'
  }

  if (release.channel === 'ga' && release.status === 'released') {
    return 'released'
  }

  return 'preview'
}

function parseIsoDateOrNull(value: string | null): number {
  if (!value) {
    return Number.NEGATIVE_INFINITY
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed
}

function createNoticeId(
  release: Pick<ReleaseNotice, 'version' | 'title' | 'severity'>,
): string {
  const normalizedTitle = release.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${release.version}:${release.severity}:${normalizedTitle}`
}

async function loadMaturityStatus(): Promise<ProductWebsiteMaturityStatus> {
  try {
    const maturity = await loadObj16MaturityData()

    return {
      available: true,
      label: `${maturity.overall.level} (${maturity.overall.score}/100)`,
      summary:
        `Tests ${maturity.kpis.tests.passed}/${maturity.kpis.tests.failed}/${maturity.kpis.tests.neverExecuted} ` +
        `| Security Gate ${maturity.kpis.security.gateStatus} | Offline ${maturity.kpis.offline.exportStatus}`,
      updatedAt: maturity.generatedAt,
    }
  } catch {
    return {
      available: false,
      label: 'Status nicht verfuegbar',
      summary:
        'Maturitaetsstatus wird mit OBJ-16 bereitgestellt. Bis dahin gilt dieser Fallback.',
      updatedAt: null,
    }
  }
}

function buildNavigation(): ProductWebsiteNavigationLink[] {
  const links: ProductWebsiteNavigationLink[] = [
    {
      label: 'App starten',
      href: '/participant-config',
      type: 'internal',
    },
    {
      label: 'Maturity Dashboard',
      href: '/maturity',
      type: 'internal',
    },
    {
      label: 'Security Posture',
      href: '/security-posture',
      type: 'internal',
    },
    {
      label: 'API Dokumentation (Swagger)',
      href: '/api/v1/swagger',
      type: 'internal',
    },
    {
      label: 'Release-Informationen',
      href: '/api/v1/releases',
      type: 'internal',
    },
  ]

  const isAirgapped =
    process.env.OBJ15_AIRGAP_MODE === 'true' ||
    process.env.OBJ15_AIRGAP_MODE === '1'
  const repositoryUrl =
    process.env.OBJ15_REPOSITORY_URL?.trim() ||
    'https://github.com/gregorkurth/test-dns'

  if (!isAirgapped) {
    try {
      const parsed = new URL(repositoryUrl)
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        links.push({
          label: 'Externes Repository',
          href: repositoryUrl,
          type: 'external',
        })
      }
    } catch {
      // Invalid URL: external link is hidden to keep the page robust in offline/airgap mode.
    }
  }

  return links
}

export function mapSeverityToObj15Priority(
  severity: ReleaseSeverity,
): ProductNoticePriority {
  return mapReleaseSeverityToPriority(severity)
}

export function mapReleaseToObj15Channel(
  release: Pick<ReleaseNotice, 'channel' | 'status'>,
): ProductReleaseChannel {
  return mapReleaseChannelToProductChannel(release)
}

export async function getProductWebsiteViewModel(): Promise<ProductWebsiteViewModel> {
  const [latestRelease, releases, maturity] = await Promise.all([
    getLatestReleaseNotice(),
    getReleaseNotices({
      includeDrafts: true,
      limit: 10,
    }),
    loadMaturityStatus(),
  ])

  const fallbackRelease = releases[0] ?? null
  const releaseForStatus = latestRelease ?? fallbackRelease
  const releaseChannel = releaseForStatus
    ? mapReleaseChannelToProductChannel(releaseForStatus)
    : 'preview'

  const updateNotices = releases
    .map((release) => {
      const priority = mapReleaseSeverityToPriority(release.severity)
      return {
        notice: {
          id: createNoticeId(release),
          version: release.version,
          title: release.title,
          summary: release.summary,
          priority,
          channel: mapReleaseChannelToProductChannel(release),
          dismissible: priority !== 'critical',
          actionLabel: release.ui.callToActionLabel || 'Release-Hinweis ansehen',
          actionHref: `/api/v1/releases?version=${encodeURIComponent(release.version)}`,
        },
        publishedAt: release.publishedAt,
      }
    })
    .sort((left, right) => {
      const priorityOrder =
        PRIORITY_ORDER[left.notice.priority] - PRIORITY_ORDER[right.notice.priority]
      if (priorityOrder !== 0) {
        return priorityOrder
      }

      return parseIsoDateOrNull(right.publishedAt) - parseIsoDateOrNull(left.publishedAt)
    })
    .map((entry) => entry.notice)

  return {
    service: {
      name: 'DNS Management Service',
      shortDescription:
        'Service fuer DNS-Konfiguration, Nachvollziehbarkeit, Tests und Release-Transparenz.',
      audience: 'Mission Network Operator, Platform Engineer und Management.',
      purpose:
        'Ein klarer Einstiegspunkt, der Status, Risiken und Dokumentation sofort sichtbar macht.',
      operatingContext:
        'Airgapped Betrieb wird unterstuetzt; Kerninhalte bleiben ohne externe Abhaengigkeiten lesbar.',
    },
    release: {
      version: releaseForStatus?.version ?? 'Version unbekannt',
      publishedAt: releaseForStatus?.publishedAt ?? null,
      channel: releaseChannel,
      channelLabel: PRODUCT_WEBSITE_CHANNEL_LABELS[releaseChannel],
      channelRiskHint: PRODUCT_WEBSITE_CHANNEL_HINTS[releaseChannel],
    },
    channelLegend: [
      {
        channel: 'released',
        label: PRODUCT_WEBSITE_CHANNEL_LABELS.released,
        riskHint: PRODUCT_WEBSITE_CHANNEL_HINTS.released,
      },
      {
        channel: 'beta',
        label: PRODUCT_WEBSITE_CHANNEL_LABELS.beta,
        riskHint: PRODUCT_WEBSITE_CHANNEL_HINTS.beta,
      },
      {
        channel: 'preview',
        label: PRODUCT_WEBSITE_CHANNEL_LABELS.preview,
        riskHint: PRODUCT_WEBSITE_CHANNEL_HINTS.preview,
      },
    ],
    updateNotices,
    maturity,
    navigation: buildNavigation(),
    sourceOfTruth: {
      primary: 'Git Repository',
      releaseNoticesFile: 'docs/releases/UPDATE-NOTICES.json',
      note: 'Confluence oder andere Ziele sind abgeleitete Kopien. Erst Git, dann Export.',
    },
    updatedAt: new Date().toISOString(),
  }
}
