import { z } from 'zod'

export type Obj20RunStatus = 'completed' | 'degraded' | 'blocked' | 'recovering'
export type Obj20DeploymentMode = 'fresh' | 'rerun' | 'recovery'
export type Obj20CheckState = 'pass' | 'warn' | 'fail'

export interface Obj20PreflightCheck {
  id: string
  label: string
  state: Obj20CheckState
  detail: string
}

export interface Obj20SourceBinding {
  releaseProject: {
    name: string
    revision: string
    path: string
  }
  configProject: {
    name: string
    revision: string
    path: string
  }
  appOfAppsRef: string
}

export interface Obj20RehydrationEvidence {
  runbookRef: string
  importedResources: number
  healthyResources: number
  degradedResources: number
  smokeTestRef: string
  smokeTestStatus: 'passed' | 'failed' | 'pending'
  evidenceNote: string
}

export interface Obj20RecoveryRecord {
  available: boolean
  previousStableVersion: string | null
  commandHint: string
  note: string
}

export interface Obj20TargetImportRun {
  id: string
  environmentId: string
  environmentName: string
  version: string
  channel: 'ga' | 'beta' | 'rc'
  status: Obj20RunStatus
  deploymentMode: Obj20DeploymentMode
  startedAt: string
  completedAt: string | null
  target: {
    cluster: string
    namespace: string
    registryUrl: string
    ingressHostname: string
    oidcIssuer: string
    argocdUrl: string
  }
  preflight: Obj20PreflightCheck[]
  sourceBinding: Obj20SourceBinding
  evidence: Obj20RehydrationEvidence
  recovery: Obj20RecoveryRecord
  notes: string[]
}

export interface Obj20TargetImportDocument {
  service: string
  sourceOfTruth: string
  updatedAt: string
  environments: Array<{
    id: string
    name: string
    purpose: string
    networkZone: string
  }>
  runs: Obj20TargetImportRun[]
}

export interface Obj20TargetImportSummary {
  generatedAt: string
  sourceOfTruth: string
  totalRuns: number
  completedRuns: number
  degradedRuns: number
  blockedRuns: number
  recoveryRuns: number
  latestVersion: string | null
  latestCompletedEnvironment: string | null
  environmentsCovered: number
}

export interface Obj20RunFilters {
  environmentId?: string | null
  status?: Obj20RunStatus | null
  deploymentMode?: Obj20DeploymentMode | null
  latestOnly?: boolean
}

export const obj20TargetImportRequestSchema = z.object({
  environmentId: z.string().trim().min(2).max(60),
  environmentName: z.string().trim().min(2).max(120),
  version: z.string().trim().regex(/^\d{4}\.(0[1-9]|1[0-2])\.[1-9]\d*$/, {
    message: 'Version muss im Format YYYY.MM.N vorliegen, z. B. 2026.04.1.',
  }),
  deploymentMode: z.enum(['fresh', 'rerun', 'recovery']),
  target: z.object({
    cluster: z.string().trim().min(2).max(120),
    namespace: z.string().trim().regex(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, {
      message: 'Namespace muss dem Kubernetes-Namensschema entsprechen.',
    }),
    registryUrl: z.string().trim().min(3).max(200),
    ingressHostname: z.string().trim().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, {
      message: 'Ingress-Hostname ist ungueltig.',
    }),
    oidcIssuer: z.string().trim().url(),
    argocdUrl: z.string().trim().url(),
  }),
  sourceBinding: z.object({
    releaseProject: z.object({
      name: z.string().trim().min(2).max(120),
      revision: z.string().trim().min(2).max(120),
      path: z.string().trim().min(1).max(200),
    }),
    configProject: z.object({
      name: z.string().trim().min(2).max(120),
      revision: z.string().trim().min(2).max(120),
      path: z.string().trim().min(1).max(200),
    }),
    appOfAppsRef: z.string().trim().min(2).max(200),
  }),
  prerequisites: z.object({
    clusterReachable: z.boolean(),
    registryReachable: z.boolean(),
    argocdReachable: z.boolean(),
    namespacesReady: z.boolean(),
    packageIntegrityVerified: z.boolean(),
  }),
})

export type Obj20TargetImportRequest = z.infer<typeof obj20TargetImportRequestSchema>

export interface Obj20DryRunResult {
  eligible: boolean
  status: Obj20RunStatus
  summary: string
  blockers: string[]
  warnings: string[]
  preflight: Obj20PreflightCheck[]
  sourceBinding: Obj20SourceBinding
  evidencePreview: Obj20RehydrationEvidence
  recovery: Obj20RecoveryRecord
  nextActions: string[]
}

const obj20Document: Obj20TargetImportDocument = {
  service: 'DNS Management Service',
  sourceOfTruth: 'docs/offline-install.md + docs/argocd.md',
  updatedAt: '2026-04-10T16:30:00.000Z',
  environments: [
    {
      id: 'fmn-core',
      name: 'FMN Core Target',
      purpose: 'Primare Missionsumgebung fuer freigegebene Releases',
      networkZone: 'Zielzone Alpha',
    },
    {
      id: 'fmn-staging',
      name: 'FMN Staging Target',
      purpose: 'Vorabimport fuer Release- und Recovery-Tests',
      networkZone: 'Zielzone Beta',
    },
    {
      id: 'fmn-recovery',
      name: 'FMN Recovery Target',
      purpose: 'Wiederanlauf nach fehlgeschlagenem Import',
      networkZone: 'Zielzone Gamma',
    },
  ],
  runs: [
    {
      id: 'run-obj20-001',
      environmentId: 'fmn-core',
      environmentName: 'FMN Core Target',
      version: '2026.04.1',
      channel: 'ga',
      status: 'completed',
      deploymentMode: 'fresh',
      startedAt: '2026-04-10T07:10:00.000Z',
      completedAt: '2026-04-10T07:42:00.000Z',
      target: {
        cluster: 'fmn-core-cluster',
        namespace: 'dns-prod',
        registryUrl: 'harbor.fmn-core.local/dns',
        ingressHostname: 'dns.fmn-core.example',
        oidcIssuer: 'https://keycloak.fmn-core.example/realms/dns',
        argocdUrl: 'https://argocd.fmn-core.example',
      },
      preflight: [
        {
          id: 'cluster',
          label: 'Cluster erreichbar',
          state: 'pass',
          detail: 'API-Server antwortet und Ziel-Namespace ist lesbar.',
        },
        {
          id: 'registry',
          label: 'Harbor erreichbar',
          state: 'pass',
          detail: 'OCI-Registry akzeptiert Push/Pull fuer den Zielpfad.',
        },
        {
          id: 'argocd',
          label: 'Argo CD erreichbar',
          state: 'pass',
          detail: 'Root-Application und AppProject koennen synchronisiert werden.',
        },
        {
          id: 'integrity',
          label: 'Paketintegritaet verifiziert',
          state: 'pass',
          detail: 'Checksummen und Release-Freigabe stimmen mit dem Transportpaket ueberein.',
        },
      ],
      sourceBinding: {
        releaseProject: {
          name: 'dns-release',
          revision: 'release/2026.04.1',
          path: 'releases/2026.04.1',
        },
        configProject: {
          name: 'dns-config-fmn-core',
          revision: 'env/fmn-core/2026.04.1',
          path: 'environments/fmn-core',
        },
        appOfAppsRef: 'argocd/root-apps/dns-management-service',
      },
      evidence: {
        runbookRef: 'docs/offline-install.md#obj-20-kontrollpunkte',
        importedResources: 27,
        healthyResources: 27,
        degradedResources: 0,
        smokeTestRef: 'tests/manual/OBJ-9-deployability-smoke.md',
        smokeTestStatus: 'passed',
        evidenceNote:
          'Release- und Konfigurationsprojekt wurden gebunden, Argo CD meldet Healthy/Synced.',
      },
      recovery: {
        available: true,
        previousStableVersion: '2026.03.4',
        commandHint: 'Zarf-Re-Deploy der Vorversion und erneuter Root-App Sync',
        note: 'Recovery bleibt vorbereitet, wurde in diesem Lauf aber nicht benoetigt.',
      },
      notes: [
        'Zielimport ohne externen Download abgeschlossen.',
        'App-of-Apps referenziert Release- und Konfigurationsprojekt getrennt.',
      ],
    },
    {
      id: 'run-obj20-002',
      environmentId: 'fmn-staging',
      environmentName: 'FMN Staging Target',
      version: '2026.04.1',
      channel: 'beta',
      status: 'degraded',
      deploymentMode: 'rerun',
      startedAt: '2026-04-10T09:15:00.000Z',
      completedAt: '2026-04-10T09:51:00.000Z',
      target: {
        cluster: 'fmn-staging-cluster',
        namespace: 'dns-staging',
        registryUrl: 'harbor.fmn-staging.local/dns',
        ingressHostname: 'dns-beta.fmn-staging.example',
        oidcIssuer: 'https://keycloak.fmn-staging.example/realms/dns',
        argocdUrl: 'https://argocd.fmn-staging.example',
      },
      preflight: [
        {
          id: 'cluster',
          label: 'Cluster erreichbar',
          state: 'pass',
          detail: 'Clusterzugriff vorhanden, Namespace existiert bereits.',
        },
        {
          id: 'registry',
          label: 'Harbor erreichbar',
          state: 'pass',
          detail: 'Image-Import in die Ziel-Registry war moeglich.',
        },
        {
          id: 'argocd',
          label: 'Argo CD erreichbar',
          state: 'warn',
          detail: 'Argo CD war erreichbar, aber eine Child-Application blieb Degraded.',
        },
        {
          id: 'integrity',
          label: 'Paketintegritaet verifiziert',
          state: 'pass',
          detail: 'Checksummen und Release-Tag stimmen.',
        },
      ],
      sourceBinding: {
        releaseProject: {
          name: 'dns-release',
          revision: 'release/2026.04.1',
          path: 'releases/2026.04.1',
        },
        configProject: {
          name: 'dns-config-fmn-staging',
          revision: 'env/fmn-staging/2026.04.1',
          path: 'environments/fmn-staging',
        },
        appOfAppsRef: 'argocd/root-apps/dns-management-service-staging',
      },
      evidence: {
        runbookRef: 'docs/offline-install.md#rehydrierungsnachweis',
        importedResources: 26,
        healthyResources: 24,
        degradedResources: 2,
        smokeTestRef: 'tests/manual/OBJ-9-deployability-smoke.md',
        smokeTestStatus: 'failed',
        evidenceNote:
          'Ingress und OIDC waren bereit, eine Child-Application blieb nach Re-Run im Degraded-Zustand.',
      },
      recovery: {
        available: true,
        previousStableVersion: '2026.03.4',
        commandHint: 'Konfigurationsrevision auf env/fmn-staging/2026.03.4 zuruecksetzen und Root-App erneut synchronisieren',
        note: 'Re-Run ist erlaubt, solange zuerst die degradierte Child-Application bereinigt wird.',
      },
      notes: [
        'Idempotenz wurde genutzt: Release erneut importiert, ohne das Release-Projekt neu anzulegen.',
        'Recovery-Pfad ist vorbereitet, da Smoke-Test fehlgeschlagen ist.',
      ],
    },
    {
      id: 'run-obj20-003',
      environmentId: 'fmn-recovery',
      environmentName: 'FMN Recovery Target',
      version: '2026.04.1',
      channel: 'ga',
      status: 'blocked',
      deploymentMode: 'recovery',
      startedAt: '2026-04-10T11:05:00.000Z',
      completedAt: null,
      target: {
        cluster: 'fmn-recovery-cluster',
        namespace: 'dns-recovery',
        registryUrl: 'harbor.fmn-recovery.local/dns',
        ingressHostname: 'dns-recovery.fmn.example',
        oidcIssuer: 'https://keycloak.fmn-recovery.example/realms/dns',
        argocdUrl: 'https://argocd.fmn-recovery.example',
      },
      preflight: [
        {
          id: 'cluster',
          label: 'Cluster erreichbar',
          state: 'pass',
          detail: 'Cluster ist erreichbar und Namespaces koennen gelesen werden.',
        },
        {
          id: 'registry',
          label: 'Harbor erreichbar',
          state: 'fail',
          detail: 'Recovery-Registry lehnt den Push ab, Zugangsdaten fehlen oder sind ungueltig.',
        },
        {
          id: 'argocd',
          label: 'Argo CD erreichbar',
          state: 'warn',
          detail: 'Argo CD ist erreichbar, wartet aber auf gueltige Registry-Referenzen.',
        },
        {
          id: 'integrity',
          label: 'Paketintegritaet verifiziert',
          state: 'pass',
          detail: 'Transportpaket ist freigegeben und Checksummen stimmen.',
        },
      ],
      sourceBinding: {
        releaseProject: {
          name: 'dns-release',
          revision: 'release/2026.04.1',
          path: 'releases/2026.04.1',
        },
        configProject: {
          name: 'dns-config-fmn-recovery',
          revision: 'env/fmn-recovery/2026.04.1',
          path: 'environments/fmn-recovery',
        },
        appOfAppsRef: 'argocd/root-apps/dns-management-service-recovery',
      },
      evidence: {
        runbookRef: 'docs/offline-install.md#rollback-und-recover-run',
        importedResources: 0,
        healthyResources: 0,
        degradedResources: 0,
        smokeTestRef: 'tests/manual/OBJ-9-deployability-smoke.md',
        smokeTestStatus: 'pending',
        evidenceNote:
          'Preflight blockiert den Lauf vor dem eigentlichen Import, weil Harbor nicht betriebsbereit ist.',
      },
      recovery: {
        available: true,
        previousStableVersion: '2026.03.4',
        commandHint: 'Harbor-Zugang reparieren, dann Recovery-Lauf mit derselben Paketversion erneut starten',
        note: 'Kein partieller Import wurde ausgefuehrt.',
      },
      notes: [
        'Preflight blockiert den Lauf vor Zarf-Deploy, um einen Halbfertig-Zustand zu vermeiden.',
      ],
    },
  ],
}

function statusWeight(status: Obj20RunStatus): number {
  if (status === 'blocked') {
    return 4
  }
  if (status === 'recovering') {
    return 3
  }
  if (status === 'degraded') {
    return 2
  }
  return 1
}

function sortRunsDesc(left: Obj20TargetImportRun, right: Obj20TargetImportRun): number {
  const timeDiff =
    new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()
  if (timeDiff !== 0) {
    return timeDiff
  }
  return statusWeight(right.status) - statusWeight(left.status)
}

export async function loadObj20TargetImportDocument(): Promise<Obj20TargetImportDocument> {
  return {
    ...obj20Document,
    runs: [...obj20Document.runs].sort(sortRunsDesc),
  }
}

export async function getObj20TargetImportRuns(
  filters?: Obj20RunFilters,
): Promise<Obj20TargetImportRun[]> {
  const document = await loadObj20TargetImportDocument()

  const filtered = document.runs.filter((run) => {
    if (filters?.environmentId && run.environmentId !== filters.environmentId) {
      return false
    }
    if (filters?.status && run.status !== filters.status) {
      return false
    }
    if (filters?.deploymentMode && run.deploymentMode !== filters.deploymentMode) {
      return false
    }
    return true
  })

  if (filters?.latestOnly) {
    return filtered.slice(0, 1)
  }

  return filtered
}

export async function getLatestObj20TargetImportRun(): Promise<Obj20TargetImportRun | null> {
  const runs = await getObj20TargetImportRuns({ latestOnly: true })
  return runs[0] ?? null
}

export async function getObj20TargetImportSummary(): Promise<Obj20TargetImportSummary> {
  const document = await loadObj20TargetImportDocument()
  const latestCompletedRun = document.runs.find((run) => run.status === 'completed') ?? null

  return {
    generatedAt: new Date().toISOString(),
    sourceOfTruth: document.sourceOfTruth,
    totalRuns: document.runs.length,
    completedRuns: document.runs.filter((run) => run.status === 'completed').length,
    degradedRuns: document.runs.filter((run) => run.status === 'degraded').length,
    blockedRuns: document.runs.filter((run) => run.status === 'blocked').length,
    recoveryRuns: document.runs.filter((run) => run.deploymentMode === 'recovery').length,
    latestVersion: document.runs[0]?.version ?? null,
    latestCompletedEnvironment: latestCompletedRun?.environmentName ?? null,
    environmentsCovered: new Set(document.runs.map((run) => run.environmentId)).size,
  }
}

export function buildObj20DryRun(
  input: Obj20TargetImportRequest,
): Obj20DryRunResult {
  const blockers: string[] = []
  const warnings: string[] = []

  const preflight: Obj20PreflightCheck[] = [
    {
      id: 'cluster',
      label: 'Cluster erreichbar',
      state: input.prerequisites.clusterReachable ? 'pass' : 'fail',
      detail: input.prerequisites.clusterReachable
        ? 'Cluster-API ist erreichbar und Rehydrierung kann vorbereitet werden.'
        : 'Cluster ist nicht erreichbar. Import muss vor Zarf-Deploy gestoppt werden.',
    },
    {
      id: 'registry',
      label: 'Registry erreichbar',
      state: input.prerequisites.registryReachable ? 'pass' : 'fail',
      detail: input.prerequisites.registryReachable
        ? `OCI-Registry ${input.target.registryUrl} akzeptiert lokale Artefakte.`
        : `OCI-Registry ${input.target.registryUrl} ist nicht erreichbar oder lehnt den Zugriff ab.`,
    },
    {
      id: 'argocd',
      label: 'Argo CD erreichbar',
      state: input.prerequisites.argocdReachable ? 'pass' : 'warn',
      detail: input.prerequisites.argocdReachable
        ? `Argo CD unter ${input.target.argocdUrl} kann Root-App und Child-Apps synchronisieren.`
        : 'Argo CD ist nicht bestaetigt erreichbar. GitOps-Bindung bleibt kontrolliert blockiert.',
    },
    {
      id: 'namespaces',
      label: 'Pflicht-Namespaces vorhanden',
      state: input.prerequisites.namespacesReady ? 'pass' : 'fail',
      detail: input.prerequisites.namespacesReady
        ? `Namespace ${input.target.namespace} ist vorbereitet.`
        : `Namespace ${input.target.namespace} fehlt oder ist nicht betriebsbereit.`,
    },
    {
      id: 'integrity',
      label: 'Paketintegritaet verifiziert',
      state: input.prerequisites.packageIntegrityVerified ? 'pass' : 'fail',
      detail: input.prerequisites.packageIntegrityVerified
        ? 'Checksummen und Freigabestatus sind bestaetigt.'
        : 'Checksummen oder Freigaben fehlen. Import darf nicht gestartet werden.',
    },
  ]

  for (const check of preflight) {
    if (check.state === 'fail') {
      blockers.push(check.detail)
    } else if (check.state === 'warn') {
      warnings.push(check.detail)
    }
  }

  if (
    input.sourceBinding.releaseProject.revision ===
    input.sourceBinding.configProject.revision
  ) {
    warnings.push(
      'Release- und Konfigurationsrevision sind identisch benannt. Bitte pruefen, ob wirklich getrennte Projekte referenziert werden.',
    )
  }

  if (input.deploymentMode === 'rerun') {
    warnings.push(
      'Rerun erkannt: Vor erneutem Import sollte der letzte Rehydrierungsnachweis auf degradierte Ressourcen geprueft werden.',
    )
  }

  if (input.deploymentMode === 'recovery') {
    warnings.push(
      'Recovery-Lauf erkannt: Vor dem Wiederanlauf muss die letzte stabile Version als Rueckweg festgehalten sein.',
    )
  }

  const eligible = blockers.length === 0
  const hasWarnings = warnings.length > 0
  const status: Obj20RunStatus = eligible
    ? input.deploymentMode === 'recovery'
      ? 'recovering'
      : hasWarnings
        ? 'degraded'
        : 'completed'
    : 'blocked'

  return {
    eligible,
    status,
    summary: eligible
      ? 'Preflight ist ausreichend, um den Zielimport kontrolliert zu starten.'
      : 'Preflight blockiert den Zielimport, bis alle Pflichtbedingungen erfuellt sind.',
    blockers,
    warnings,
    preflight,
    sourceBinding: input.sourceBinding,
    evidencePreview: {
      runbookRef: 'docs/offline-install.md#rehydrierungsnachweis',
      importedResources: 0,
      healthyResources: 0,
      degradedResources: 0,
      smokeTestRef: 'tests/manual/OBJ-9-deployability-smoke.md',
      smokeTestStatus: eligible ? 'pending' : 'pending',
      evidenceNote:
        'Nach erfolgreichem Import werden hier Ressourcenanzahl, Argo-CD-Status und Smoke-Test-Ergebnis nachgefuehrt.',
    },
    recovery: {
      available: true,
      previousStableVersion: input.deploymentMode === 'fresh' ? null : 'Letzte stabile Version laut Release-Projekt',
      commandHint:
        'Release-Projekt auf stabile Revision setzen, Konfigurationsprojekt abgleichen und Root-App erneut synchronisieren',
      note:
        'Recovery bleibt Pflichtbestandteil des OBJ-20-Laufs, auch wenn der Dry-Run gruen ist.',
    },
    nextActions: eligible
      ? [
          'Zarf-Paket in der Zielumgebung bereitstellen.',
          'Release- und Konfigurationsprojekt in Gitea referenzieren.',
          'Root-App in Argo CD synchronisieren und Health pruefen.',
          'Deployability-Smoke-Test ausfuehren und Rehydrierungsnachweis dokumentieren.',
        ]
      : [
          'Blockierende Vorbedingungen beheben.',
          'Dry-Run erneut starten.',
          'Erst danach Zarf-Deploy und Argo-CD-Sync freigeben.',
        ],
  }
}
