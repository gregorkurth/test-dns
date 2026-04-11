import { promises as fs } from 'node:fs'
import path from 'node:path'

export type Obj21HealthStatus = 'Healthy' | 'Degraded' | 'Progressing' | 'Missing'
export type Obj21SyncMode = 'manual' | 'automated'
export type Obj21SourceRole = 'release' | 'config'

export interface Obj21GitSource {
  id: string
  role: Obj21SourceRole
  name: string
  repository: string
  revision: string
  path: string
  transport: 'gitea'
  purpose: string
  manifestRef: string
}

export interface Obj21RevisionBinding {
  environment: string
  releaseRevision: string
  configRevision: string
  compatibility: 'validated' | 'review-required'
  note: string
}

export interface Obj21ManagedApplication {
  id: string
  name: string
  component: string
  namespace: string
  project: string
  healthStatus: Obj21HealthStatus
  syncStatus: 'Synced' | 'OutOfSync'
  syncMode: Obj21SyncMode
  selfHealEnabled: boolean
  destinationServer: string
  releaseSourceId: string
  configSourceId: string
  releaseChartPath: string
  configValuesPath: string
  manifestRef: string
  lastCheckedAt: string
  operatorDecision: string
  blockingReason: string | null
  notes: string[]
}

export interface Obj21BootstrapStep {
  id: string
  title: string
  objective: string
  command: string
  verification: string
  offlineCapable: boolean
  evidenceRef: string
}

export interface Obj21GitOpsDocument {
  service: string
  sourceOfTruth: string
  updatedAt: string
  rootApplication: {
    name: string
    namespace: string
    healthStatus: Obj21HealthStatus
    syncStatus: 'Synced' | 'OutOfSync'
    manifestRef: string
    bootstrapRef: string
    project: string
    destinationNamespace: string
  }
  appProject: {
    name: string
    manifestRef: string
    sourceRepos: string[]
    destinations: string[]
  }
  sources: Obj21GitSource[]
  revisionBindings: Obj21RevisionBinding[]
  applications: Obj21ManagedApplication[]
  bootstrap: Obj21BootstrapStep[]
}

export interface Obj21GitOpsSummary {
  generatedAt: string
  sourceOfTruth: string
  totalApplications: number
  healthyApplications: number
  degradedApplications: number
  progressingApplications: number
  missingApplications: number
  deployableApplications: number
  manualApplications: number
  automatedApplications: number
  twoSourceBindingsVerified: boolean
  bootstrapOfflineReady: boolean
  trackedEnvironments: number
}

export interface Obj21GitOpsFilters {
  status?: Obj21HealthStatus | null
  component?: string | null
  syncMode?: Obj21SyncMode | null
  sourceRole?: Obj21SourceRole | null
}

const obj21Document: Obj21GitOpsDocument = {
  service: 'DNS Management Service',
  sourceOfTruth: 'gitops/argocd/*.yaml + gitops/bootstrap/* + docs/argocd.md',
  updatedAt: '2026-04-10T18:40:00.000Z',
  rootApplication: {
    name: 'dns-management-root',
    namespace: 'argocd',
    healthStatus: 'Healthy',
    syncStatus: 'Synced',
    manifestRef: 'gitops/argocd/root-application.yaml',
    bootstrapRef: 'gitops/bootstrap/bootstrap.sh',
    project: 'default',
    destinationNamespace: 'argocd',
  },
  appProject: {
    name: 'dns-management',
    manifestRef: 'gitops/argocd/bootstrap-resources/appproject.yaml',
    sourceRepos: [
      'https://gitea.fmn.local/platform/dns-release.git',
      'https://gitea.fmn.local/platform/dns-config.git',
    ],
    destinations: ['dns-system', 'dns-monitoring', 'dns-ingress', 'dns-security'],
  },
  sources: [
    {
      id: 'release-source',
      role: 'release',
      name: 'dns-release',
      repository: 'https://gitea.fmn.local/platform/dns-release.git',
      revision: 'release/v1.0.0',
      path: 'helm/dns-management-service',
      transport: 'gitea',
      purpose: 'Deploybarer Release-Stand mit Helm Chart und GitOps-Manifests.',
      manifestRef: 'gitops/argocd/bootstrap-resources/applicationset.yaml',
    },
    {
      id: 'config-source',
      role: 'config',
      name: 'dns-config',
      repository: 'https://gitea.fmn.local/platform/dns-config.git',
      revision: 'env/fmn-core/v1.0.0',
      path: 'environments/fmn-core',
      transport: 'gitea',
      purpose: 'Zielwerte wie Namespace, Hostnames, Registry und Sync-Entscheide.',
      manifestRef: 'gitops/argocd/bootstrap-resources/applicationset.yaml',
    },
  ],
  revisionBindings: [
    {
      environment: 'FMN Core',
      releaseRevision: 'release/v1.0.0',
      configRevision: 'env/fmn-core/v1.0.0',
      compatibility: 'validated',
      note: 'Freigegebene Matrix fuer die produktive Zielumgebung.',
    },
    {
      environment: 'FMN Staging',
      releaseRevision: 'release/v1.0.0-rc.1',
      configRevision: 'env/fmn-staging/v1.0.0-rc.1',
      compatibility: 'review-required',
      note: 'Nur fuer Vorab-Sync und Deployability-Smoke vorgesehen.',
    },
  ],
  applications: [
    {
      id: 'dns-core',
      name: 'dns-core',
      component: 'Core Service',
      namespace: 'dns-system',
      project: 'dns-management',
      healthStatus: 'Healthy',
      syncStatus: 'Synced',
      syncMode: 'manual',
      selfHealEnabled: false,
      destinationServer: 'https://kubernetes.default.svc',
      releaseSourceId: 'release-source',
      configSourceId: 'config-source',
      releaseChartPath: 'helm/dns-management-service',
      configValuesPath: 'environments/fmn-core/core-values.yaml',
      manifestRef: 'gitops/argocd/applications/app-core.yaml',
      lastCheckedAt: '2026-04-10T18:20:00.000Z',
      operatorDecision: 'Deployed-ready, weil Healthy-Nachweis vorliegt.',
      blockingReason: null,
      notes: [
        'Root-Application und Child-App zeigen Synced/Healthy.',
        'Nutzt Release- und Config-Quelle getrennt ueber multi-source Application.',
      ],
    },
    {
      id: 'dns-monitoring',
      name: 'dns-monitoring',
      component: 'Monitoring',
      namespace: 'dns-monitoring',
      project: 'dns-management',
      healthStatus: 'Progressing',
      syncStatus: 'OutOfSync',
      syncMode: 'manual',
      selfHealEnabled: false,
      destinationServer: 'https://kubernetes.default.svc',
      releaseSourceId: 'release-source',
      configSourceId: 'config-source',
      releaseChartPath: 'helm/dns-management-service',
      configValuesPath: 'environments/fmn-core/monitoring-values.yaml',
      manifestRef: 'gitops/argocd/applications/app-monitoring.yaml',
      lastCheckedAt: '2026-04-10T18:21:00.000Z',
      operatorDecision: 'Noch nicht deployed-ready, bis Telemetrie-Pods Healthy sind.',
      blockingReason: 'Collector-Rollout laeuft noch nach dem letzten Import.',
      notes: [
        'Health bleibt Progressing bis der OTel-Pipeline-Check gruen ist.',
        'Status muss vor Release-Abschluss nochmals verifiziert werden.',
      ],
    },
    {
      id: 'dns-ingress',
      name: 'dns-ingress',
      component: 'Ingress',
      namespace: 'dns-ingress',
      project: 'dns-management',
      healthStatus: 'Degraded',
      syncStatus: 'OutOfSync',
      syncMode: 'manual',
      selfHealEnabled: false,
      destinationServer: 'https://kubernetes.default.svc',
      releaseSourceId: 'release-source',
      configSourceId: 'config-source',
      releaseChartPath: 'helm/dns-management-service',
      configValuesPath: 'environments/fmn-core/ingress-values.yaml',
      manifestRef: 'gitops/argocd/applications/app-ingress.yaml',
      lastCheckedAt: '2026-04-10T18:22:00.000Z',
      operatorDecision: 'Manueller Eingriff noetig, bevor die Umgebung als deployed gilt.',
      blockingReason: 'Ingress-Hostname ist gesetzt, aber das TLS-Secret fehlt noch.',
      notes: [
        'Argo CD meldet Degraded wegen fehlender Zertifikatsreferenz.',
        'Self-heal bleibt deaktiviert, um ungewollte Rollbacks zu vermeiden.',
      ],
    },
    {
      id: 'dns-security',
      name: 'dns-security',
      component: 'Security Policies',
      namespace: 'dns-security',
      project: 'dns-management',
      healthStatus: 'Missing',
      syncStatus: 'OutOfSync',
      syncMode: 'automated',
      selfHealEnabled: true,
      destinationServer: 'https://kubernetes.default.svc',
      releaseSourceId: 'release-source',
      configSourceId: 'config-source',
      releaseChartPath: 'helm/dns-management-service',
      configValuesPath: 'environments/fmn-core/security-values.yaml',
      manifestRef: 'gitops/argocd/applications/app-security.yaml',
      lastCheckedAt: '2026-04-10T18:23:00.000Z',
      operatorDecision: 'Kein Deploy-Nachweis, bis die Child-Application ueberhaupt angelegt ist.',
      blockingReason: 'Security-Overlay ist im Konfigurationsprojekt noch nicht importiert.',
      notes: [
        'Automated sync ist fuer diese Teilkomponente testweise vorgesehen.',
        'Ohne Healthy-Nachweis bleibt das Objekt ausserhalb des deployed Status.',
      ],
    },
  ],
  bootstrap: [
    {
      id: 'preflight',
      title: 'Offline-Voraussetzungen pruefen',
      objective: 'Argo CD, beide Gitea-Repositories und Namespace-Zugriff bestaetigen.',
      command: './gitops/bootstrap/bootstrap.sh --check-only',
      verification: 'Das Skript meldet alle Vorbedingungen als ready.',
      offlineCapable: true,
      evidenceRef: 'gitops/bootstrap/README.md#1-vorbedingungen-pruefen',
    },
    {
      id: 'project',
      title: 'AppProject anlegen',
      objective: 'Quellen, Ziele und Policies vor der Root-Application bereitstellen.',
      command: 'kubectl apply -f gitops/argocd/bootstrap-resources/appproject.yaml',
      verification: 'kubectl get appproject dns-management -n argocd',
      offlineCapable: true,
      evidenceRef: 'gitops/bootstrap/README.md#2-appproject-anlegen',
    },
    {
      id: 'root-app',
      title: 'Root-Application deployen',
      objective: 'Den Einstiegspunkt fuer das App-of-Apps-Modell idempotent anlegen.',
      command: 'kubectl apply -f gitops/argocd/root-application.yaml',
      verification: 'kubectl get applications.argoproj.io dns-management-root -n argocd',
      offlineCapable: true,
      evidenceRef: 'gitops/bootstrap/README.md#3-root-application-anlegen',
    },
    {
      id: 'sync',
      title: 'Manuellen Initial-Sync ausloesen',
      objective: 'Die Child-Applications kontrolliert in die Zielumgebung holen.',
      command: 'argocd app sync dns-management-root --grpc-web',
      verification: 'argocd app wait dns-management-root --health --sync --grpc-web',
      offlineCapable: true,
      evidenceRef: 'gitops/bootstrap/README.md#4-initialen-sync-ausloesen',
    },
    {
      id: 'evidence',
      title: 'Health-Nachweis dokumentieren',
      objective: 'Nur Healthy-Apps als deployed markieren und die Quellenkombination festhalten.',
      command: 'curl -s http://localhost:3000/api/v1/gitops?status=Healthy',
      verification: 'Management-Sicht und Argo CD zeigen denselben Healthy-Nachweis.',
      offlineCapable: true,
      evidenceRef: 'docs/argocd.md#obj-21-management-sicht-und-health-nachweis',
    },
  ],
}

const statusOrder: Record<Obj21HealthStatus, number> = {
  Healthy: 0,
  Progressing: 1,
  Degraded: 2,
  Missing: 3,
}

function sortApplications(
  applications: Obj21ManagedApplication[],
): Obj21ManagedApplication[] {
  return [...applications].sort((left, right) => {
    const statusDifference =
      statusOrder[left.healthStatus] - statusOrder[right.healthStatus]
    if (statusDifference !== 0) {
      return statusDifference
    }

    return left.name.localeCompare(right.name, 'de')
  })
}

const HEALTH_EVIDENCE_DIR = path.join(
  process.cwd(),
  'artifacts',
  'gitops-health',
)

interface Obj21HealthEvidence {
  applicationName: string
  healthStatus: Obj21HealthStatus
  syncStatus: 'Synced' | 'OutOfSync'
  checkedAt: string
  source: 'argocd-api' | 'kubectl' | 'manual'
}

const validHealthStatuses: Obj21HealthStatus[] = [
  'Healthy',
  'Degraded',
  'Progressing',
  'Missing',
]
const validSyncStatuses = ['Synced', 'OutOfSync'] as const

async function readHealthEvidence(): Promise<Obj21HealthEvidence[]> {
  const evidenceFile = path.join(HEALTH_EVIDENCE_DIR, 'health-status.json')
  try {
    const raw = await fs.readFile(evidenceFile, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((entry): entry is Obj21HealthEvidence => {
      if (!entry || typeof entry !== 'object') {
        return false
      }

      const candidate = entry as Record<string, unknown>
      return (
        typeof candidate.applicationName === 'string' &&
        validHealthStatuses.includes(candidate.healthStatus as Obj21HealthStatus) &&
        validSyncStatuses.includes(
          candidate.syncStatus as (typeof validSyncStatuses)[number],
        ) &&
        typeof candidate.checkedAt === 'string'
      )
    })
  } catch {
    return []
  }
}

function applyHealthEvidence(
  applications: Obj21ManagedApplication[],
  evidence: Obj21HealthEvidence[],
): Obj21ManagedApplication[] {
  if (evidence.length === 0) {
    return applications
  }

  const evidenceMap = new Map<string, Obj21HealthEvidence>()
  for (const entry of evidence) {
    evidenceMap.set(entry.applicationName, entry)
  }

  return applications.map((application) => {
    const match = evidenceMap.get(application.name)
    if (!match) {
      return application
    }

    return {
      ...application,
      healthStatus: match.healthStatus,
      syncStatus: match.syncStatus,
      lastCheckedAt: match.checkedAt,
    }
  })
}

function deriveRootHealthFromChildren(
  applications: Obj21ManagedApplication[],
): Obj21HealthStatus {
  if (applications.length === 0) {
    return 'Missing'
  }

  const hasMissing = applications.some((app) => app.healthStatus === 'Missing')
  if (hasMissing) {
    return 'Missing'
  }

  const hasDegraded = applications.some((app) => app.healthStatus === 'Degraded')
  if (hasDegraded) {
    return 'Degraded'
  }

  const hasProgressing = applications.some((app) => app.healthStatus === 'Progressing')
  if (hasProgressing) {
    return 'Progressing'
  }

  return 'Healthy'
}

export async function loadObj21GitOpsDocument(): Promise<Obj21GitOpsDocument> {
  const evidence = await readHealthEvidence()
  const applicationsWithEvidence = applyHealthEvidence(
    obj21Document.applications,
    evidence,
  )

  const derivedRootHealth = deriveRootHealthFromChildren(applicationsWithEvidence)
  const allSynced = applicationsWithEvidence.every(
    (app) => app.syncStatus === 'Synced',
  )

  return {
    ...obj21Document,
    rootApplication: {
      ...obj21Document.rootApplication,
      healthStatus: derivedRootHealth,
      syncStatus: allSynced ? 'Synced' : 'OutOfSync',
    },
    sources: [...obj21Document.sources],
    revisionBindings: [...obj21Document.revisionBindings],
    applications: sortApplications(applicationsWithEvidence),
    bootstrap: [...obj21Document.bootstrap],
  }
}

export async function getObj21ManagedApplications(
  filters: Obj21GitOpsFilters = {},
): Promise<Obj21ManagedApplication[]> {
  const document = await loadObj21GitOpsDocument()

  return document.applications.filter((application) => {
    if (filters.status && application.healthStatus !== filters.status) {
      return false
    }

    if (
      filters.component &&
      !application.component.toLowerCase().includes(filters.component.toLowerCase())
    ) {
      return false
    }

    if (filters.syncMode && application.syncMode !== filters.syncMode) {
      return false
    }

    if (filters.sourceRole) {
      if (
        filters.sourceRole === 'release' &&
        application.releaseSourceId !== 'release-source'
      ) {
        return false
      }

      if (
        filters.sourceRole === 'config' &&
        application.configSourceId !== 'config-source'
      ) {
        return false
      }
    }

    return true
  })
}

export async function getObj21GitOpsSummary(): Promise<Obj21GitOpsSummary> {
  const document = await loadObj21GitOpsDocument()
  const healthyApplications = document.applications.filter(
    (application) => application.healthStatus === 'Healthy',
  ).length
  const degradedApplications = document.applications.filter(
    (application) => application.healthStatus === 'Degraded',
  ).length
  const progressingApplications = document.applications.filter(
    (application) => application.healthStatus === 'Progressing',
  ).length
  const missingApplications = document.applications.filter(
    (application) => application.healthStatus === 'Missing',
  ).length

  return {
    generatedAt: document.updatedAt,
    sourceOfTruth: document.sourceOfTruth,
    totalApplications: document.applications.length,
    healthyApplications,
    degradedApplications,
    progressingApplications,
    missingApplications,
    deployableApplications: healthyApplications,
    manualApplications: document.applications.filter(
      (application) => application.syncMode === 'manual',
    ).length,
    automatedApplications: document.applications.filter(
      (application) => application.syncMode === 'automated',
    ).length,
    twoSourceBindingsVerified:
      document.sources.some((source) => source.role === 'release') &&
      document.sources.some((source) => source.role === 'config'),
    bootstrapOfflineReady: document.bootstrap.every((step) => step.offlineCapable),
    trackedEnvironments: document.revisionBindings.length,
  }
}
