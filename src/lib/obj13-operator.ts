import { promises as fs } from 'node:fs'
import path from 'node:path'

export type OperatorPhase = 'Pending' | 'Applied' | 'Error'

export interface Obj13ManifestCheck {
  label: string
  path: string
  present: boolean
  summary: string
}

export interface Obj13ChangeHistoryEntry {
  id: string
  timestamp: string
  configurationName: string
  revision: string
  action: string
  outcome: string
  message: string
  triggeredBy: string
}

export interface Obj13OperatorData {
  generatedAt: string
  controllerMode: string
  customResource: {
    group: string
    version: string
    kind: string
    name: string
    namespace: string
    zoneName: string
    hasRequiredStatusFields: boolean
    currentPhase: OperatorPhase
    message: string
    lastUpdated: string
  }
  baseline: {
    repository: string
    revision: string
    path: string
    sourceOfTruth: string
  }
  rollback: {
    supported: boolean
    workflow: string
    limitations: string[]
  }
  mcpIntegration: {
    enabled: boolean
    mode: string
    guardrails: string[]
  }
  reconcile: {
    idempotencyRules: string[]
    errorPath: string[]
    openRuntimeSteps: string[]
  }
  manifests: Obj13ManifestCheck[]
  history: Obj13ChangeHistoryEntry[]
}

interface OperatorStateFile {
  generatedAt: string
  mode: string
  currentPhase: OperatorPhase
  message: string
  lastUpdated: string
  baseline: Obj13OperatorData['baseline']
  rollback: Obj13OperatorData['rollback']
  mcpIntegration: Obj13OperatorData['mcpIntegration']
}

const repoRoot = process.cwd()
const crdPath = path.join(repoRoot, 'k8s', 'crd', 'dns.fmn.mil_dnsconfigurations.yaml')
const deploymentPath = path.join(repoRoot, 'k8s', 'operator', 'deployment.yaml')
const rbacPath = path.join(repoRoot, 'k8s', 'operator', 'rbac.yaml')
const samplePath = path.join(
  repoRoot,
  'operator',
  'config',
  'samples',
  'dns_v1alpha1_dnsconfiguration.yaml',
)
const statePath = path.join(repoRoot, 'operator', 'examples', 'operator-state.json')
const historyPath = path.join(repoRoot, 'operator', 'examples', 'change-history.json')

function toPosixPath(value: string): string {
  return value.split(path.sep).join('/')
}

async function readUtf8(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf8')
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function matchField(source: string, pattern: RegExp): string {
  return source.match(pattern)?.[1]?.trim() ?? ''
}

function parseSampleResource(raw: string): {
  group: string
  version: string
  kind: string
  name: string
  namespace: string
  zoneName: string
} {
  const apiVersion = matchField(raw, /^apiVersion:\s*(.+)$/m)
  const [group, version] = apiVersion.split('/')

  return {
    group: group ?? '',
    version: version ?? '',
    kind: matchField(raw, /^kind:\s*(.+)$/m),
    name: matchField(raw, /^  name:\s*(.+)$/m),
    namespace: matchField(raw, /^  namespace:\s*(.+)$/m),
    zoneName: matchField(raw, /^  zoneName:\s*(.+)$/m),
  }
}

function parseRequiredStatusFields(raw: string): boolean {
  return (
    raw.includes('phase:') &&
    raw.includes('message:') &&
    raw.includes('lastUpdated:')
  )
}

function compareDesc(left: Obj13ChangeHistoryEntry, right: Obj13ChangeHistoryEntry): number {
  return Date.parse(right.timestamp) - Date.parse(left.timestamp)
}

export async function loadObj13OperatorData(): Promise<Obj13OperatorData> {
  const [crdRaw, sampleRaw, stateRaw, historyRaw] = await Promise.all([
    readUtf8(crdPath),
    readUtf8(samplePath),
    readUtf8(statePath),
    readUtf8(historyPath),
  ])

  const state = JSON.parse(stateRaw) as OperatorStateFile
  const history = (JSON.parse(historyRaw) as Obj13ChangeHistoryEntry[]).sort(compareDesc)
  const resource = parseSampleResource(sampleRaw)

  const manifests: Obj13ManifestCheck[] = await Promise.all(
    [
      {
        label: 'CRD',
        path: crdPath,
        summary: 'Installierbare DNSConfiguration-Definition mit Status-Subresource.',
      },
      {
        label: 'RBAC',
        path: rbacPath,
        summary: 'ServiceAccount plus ClusterRole fuer CRD, Status und Events.',
      },
      {
        label: 'Deployment',
        path: deploymentPath,
        summary: 'Eigenes Operator-Deployment im Namespace dns-config-system.',
      },
      {
        label: 'Sample Resource',
        path: samplePath,
        summary: 'Beispiel-CR mit Baseline-Referenz, Delivery-Ziel und MCP-Guardrails.',
      },
    ].map(async (item) => ({
      label: item.label,
      path: toPosixPath(path.relative(repoRoot, item.path)),
      present: await exists(item.path),
      summary: item.summary,
    })),
  )

  return {
    generatedAt: state.generatedAt,
    controllerMode: state.mode,
    customResource: {
      ...resource,
      hasRequiredStatusFields: parseRequiredStatusFields(crdRaw),
      currentPhase: state.currentPhase,
      message: state.message,
      lastUpdated: state.lastUpdated,
    },
    baseline: state.baseline,
    rollback: state.rollback,
    mcpIntegration: state.mcpIntegration,
    reconcile: {
      idempotencyRules: [
        'Der Reconcile vergleicht Hash und Revision, bevor ein neuer Apply versucht wird.',
        'Delete nutzt einen Finalizer, damit Aufraeumen kontrolliert bleibt.',
        'Rollback bleibt derselbe Reconcile-Pfad und umgeht die CRD nicht.',
      ],
      errorPath: [
        'Plan- oder Delivery-Fehler setzen den Status auf Error statt einen Crash auszulösen.',
        'Fehlerereignisse werden in der History sichtbar gemacht.',
        'Fehler werden mit RequeueAfter erneut versucht, nicht in einer engen Schleife.',
      ],
      openRuntimeSteps: [
        'Gesicherter Git-Fetch gegen das Baseline-Repo ist noch nicht implementiert.',
        'Der produktive Call zur OBJ-3-API ist als Integrationsnaht vorbereitet, aber noch nicht aktiv.',
        'Durable Change-History ausserhalb der Beispielartefakte folgt in einem spaeteren Schritt.',
      ],
    },
    manifests,
    history,
  }
}
