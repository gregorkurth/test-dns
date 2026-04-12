import { spawnSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'

// Erlaubte Zeichen für den Helm-Binary-Pfad (S-14).
// Nur alphanumerisch, Bindestrich, Unterstrich, Punkt und Slash.
const SAFE_BINARY_PATTERN = /^[a-zA-Z0-9_./-]+$/

function resolveHelmBinary(): string {
  const configured = process.env.OBJ25_HELM_BIN?.trim()
  if (!configured) {
    return 'helm'
  }
  if (!SAFE_BINARY_PATTERN.test(configured)) {
    throw new Error(
      `OBJ25_HELM_BIN enthält ungültige Zeichen: "${configured}". Nur a-z, A-Z, 0-9, _, -, ., / erlaubt.`,
    )
  }
  return configured
}

export type Obj25HelmProfile = 'local' | 'internal' | 'prod'
export type Obj25HelmCheckType = 'lint' | 'template'
export type Obj25HelmCheckStatus = 'passed' | 'failed' | 'skipped'
export type Obj25HelmReleaseCheckState =
  | 'available'
  | 'missing'
  | 'skipped'
  | 'error'

export interface Obj25HelmCommandCheck {
  profile: Obj25HelmProfile
  checkType: Obj25HelmCheckType
  command: string
  status: Obj25HelmCheckStatus
  exitCode: number | null
  reason: string | null
  stdout: string
  stderr: string
}

export interface Obj25HelmFileStatus {
  path: string
  required: boolean
  present: boolean
}

export interface Obj25HelmChartMeta {
  name: string
  description: string
  version: string
  appVersion: string
  semverValid: boolean
}

export interface Obj25HelmOciReadiness {
  ready: boolean
  repository: string
  packageCommand: string
  pushCommand: string
  reasons: string[]
}

export interface Obj25HelmReleaseStatus {
  releaseName: string
  namespace: string
  command: string
  checkState: Obj25HelmReleaseCheckState
  releaseStatus: string | null
  revision: string | null
  chart: string | null
  appVersion: string | null
  updated: string | null
  reason: string | null
  stdout: string
  stderr: string
}

export interface Obj25HelmStatusData {
  generatedAt: string
  sourceOfTruth: string
  chartPath: string
  chart: Obj25HelmChartMeta
  files: Obj25HelmFileStatus[]
  checks: Obj25HelmCommandCheck[]
  summary: {
    totalChecks: number
    passedChecks: number
    failedChecks: number
    skippedChecks: number
    offlineLintTemplateReady: boolean
  }
  release: Obj25HelmReleaseStatus
  oci: Obj25HelmOciReadiness
  imageDigestWarning: string | null
}

interface Obj25ChartYaml {
  name: string
  description: string
  version: string
  appVersion: string
}

const repoRoot = process.cwd()
const chartRelativePath = 'helm/dns-management-service'
const chartPath = path.join(repoRoot, chartRelativePath)
const semverPattern =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/
const defaultReleaseName = 'dns-management-service'
const defaultNamespace = 'dns-management'

function normalizeLineValue(value: string | null): string {
  if (!value) {
    return ''
  }
  return value.trim().replace(/^['"]|['"]$/g, '')
}

function extractYamlScalar(content: string, key: string): string {
  const match = content.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
  return normalizeLineValue(match?.[1] ?? null)
}

function parseChartYaml(content: string): Obj25ChartYaml {
  return {
    name: extractYamlScalar(content, 'name'),
    description: extractYamlScalar(content, 'description'),
    version: extractYamlScalar(content, 'version'),
    appVersion: extractYamlScalar(content, 'appVersion'),
  }
}

async function fileExists(absolutePath: string): Promise<boolean> {
  try {
    await fs.access(absolutePath)
    return true
  } catch {
    return false
  }
}

function relativeFromRepo(absolutePath: string): string {
  return absolutePath.split(path.sep).join('/').replace(`${repoRoot}/`, '')
}

async function collectFileStatuses(): Promise<Obj25HelmFileStatus[]> {
  const requiredRelativePaths = [
    'Chart.yaml',
    'README.md',
    'values.yaml',
    'values-local.yaml',
    'values-internal.yaml',
    'values-prod.yaml',
    'values.schema.json',
    'templates/_helpers.tpl',
    'templates/deployment.yaml',
    'templates/service.yaml',
    'templates/ingress.yaml',
    'templates/validation.yaml',
  ]

  const statuses = await Promise.all(
    requiredRelativePaths.map(async (relativePath) => {
      const absolutePath = path.join(chartPath, relativePath)
      return {
        path: relativeFromRepo(absolutePath),
        required: true,
        present: await fileExists(absolutePath),
      }
    }),
  )

  return statuses
}

function buildHelmHomePaths() {
  const base = path.join(repoRoot, '.tmp', 'obj25-helm')
  return {
    base,
    cache: path.join(base, 'cache'),
    config: path.join(base, 'config'),
    data: path.join(base, 'data'),
  }
}

function parseHelmReleaseStatusJson(payload: string): {
  releaseStatus: string | null
  revision: string | null
  chart: string | null
  appVersion: string | null
  updated: string | null
} {
  try {
    const raw = JSON.parse(payload) as Record<string, unknown>
    return {
      releaseStatus:
        typeof raw.info === 'object' &&
        raw.info !== null &&
        typeof (raw.info as Record<string, unknown>).status === 'string'
          ? String((raw.info as Record<string, unknown>).status)
          : typeof raw.status === 'string'
            ? String(raw.status)
            : null,
      revision:
        typeof raw.version === 'number' || typeof raw.version === 'string'
          ? String(raw.version)
          : null,
      chart: typeof raw.chart === 'string' ? raw.chart : null,
      appVersion: typeof raw.app_version === 'string' ? raw.app_version : null,
      updated:
        typeof raw.info === 'object' &&
        raw.info !== null &&
        typeof (raw.info as Record<string, unknown>).last_deployed === 'string'
          ? String((raw.info as Record<string, unknown>).last_deployed)
          : typeof raw.updated === 'string'
            ? raw.updated
            : null,
    }
  } catch {
    return {
      releaseStatus: null,
      revision: null,
      chart: null,
      appVersion: null,
      updated: null,
    }
  }
}

async function runReleaseStatusCheck(input: {
  runChecks: boolean
  releaseName: string
  namespace: string
}): Promise<Obj25HelmReleaseStatus> {
  const helmBinary = resolveHelmBinary()
  const args = [
    'status',
    input.releaseName,
    '--namespace',
    input.namespace,
    '--output',
    'json',
  ]
  const command = `${helmBinary} ${args.join(' ')}`

  if (!input.runChecks) {
    return {
      releaseName: input.releaseName,
      namespace: input.namespace,
      command,
      checkState: 'skipped',
      releaseStatus: null,
      revision: null,
      chart: null,
      appVersion: null,
      updated: null,
      reason: 'runChecks=false: helm release status check skipped',
      stdout: '',
      stderr: '',
    }
  }

  const helmHomes = buildHelmHomePaths()
  await Promise.all([
    fs.mkdir(helmHomes.cache, { recursive: true }),
    fs.mkdir(helmHomes.config, { recursive: true }),
    fs.mkdir(helmHomes.data, { recursive: true }),
  ])

  const result = spawnSync(helmBinary, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 60_000,
    env: {
      ...process.env,
      HELM_CACHE_HOME: helmHomes.cache,
      HELM_CONFIG_HOME: helmHomes.config,
      HELM_DATA_HOME: helmHomes.data,
      HELM_PLUGINS: '',
    },
  })

  if (result.error) {
    const isNotInstalled = 'code' in result.error && result.error.code === 'ENOENT'
    return {
      releaseName: input.releaseName,
      namespace: input.namespace,
      command,
      checkState: isNotInstalled ? 'skipped' : 'error',
      releaseStatus: null,
      revision: null,
      chart: null,
      appVersion: null,
      updated: null,
      reason: isNotInstalled
        ? 'helm binary not available in local environment'
        : result.error.message,
      stdout: String(result.stdout ?? ''),
      stderr: String(result.stderr ?? ''),
    }
  }

  if (result.status === 0) {
    const parsed = parseHelmReleaseStatusJson(String(result.stdout ?? ''))
    return {
      releaseName: input.releaseName,
      namespace: input.namespace,
      command,
      checkState: 'available',
      releaseStatus: parsed.releaseStatus,
      revision: parsed.revision,
      chart: parsed.chart,
      appVersion: parsed.appVersion,
      updated: parsed.updated,
      reason: null,
      stdout: String(result.stdout ?? ''),
      stderr: String(result.stderr ?? ''),
    }
  }

  const stderr = String(result.stderr ?? '')
  const missingRelease =
    stderr.toLowerCase().includes('release: not found') ||
    stderr.toLowerCase().includes('not found')

  return {
    releaseName: input.releaseName,
    namespace: input.namespace,
    command,
    checkState: missingRelease ? 'missing' : 'error',
    releaseStatus: null,
    revision: null,
    chart: null,
    appVersion: null,
    updated: null,
    reason: missingRelease
      ? 'Release not found in target namespace.'
      : `helm status returned exit code ${result.status}`,
    stdout: String(result.stdout ?? ''),
    stderr,
  }
}

async function runHelmCommandCheck(
  profile: Obj25HelmProfile,
  checkType: Obj25HelmCheckType,
): Promise<Obj25HelmCommandCheck> {
  const helmBinary = resolveHelmBinary()
  const valuesBase = path.join(chartPath, 'values.yaml')
  const profileFile = path.join(chartPath, `values-${profile}.yaml`)
  const helmHomes = buildHelmHomePaths()

  await Promise.all([
    fs.mkdir(helmHomes.cache, { recursive: true }),
    fs.mkdir(helmHomes.config, { recursive: true }),
    fs.mkdir(helmHomes.data, { recursive: true }),
  ])

  const args =
    checkType === 'lint'
      ? ['lint', chartPath, '--values', valuesBase, '--values', profileFile, '--strict']
      : [
          'template',
          `dns-management-service-${profile}`,
          chartPath,
          '--values',
          valuesBase,
          '--values',
          profileFile,
        ]

  const result = spawnSync(helmBinary, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 60_000,
    env: {
      ...process.env,
      HELM_CACHE_HOME: helmHomes.cache,
      HELM_CONFIG_HOME: helmHomes.config,
      HELM_DATA_HOME: helmHomes.data,
      HELM_PLUGINS: '',
    },
  })

  const command = `${helmBinary} ${args.join(' ')}`

  if (result.error) {
    const isNotInstalled = 'code' in result.error && result.error.code === 'ENOENT'
    return {
      profile,
      checkType,
      command,
      status: 'skipped',
      exitCode: null,
      reason: isNotInstalled
        ? 'helm binary not available in local environment'
        : result.error.message,
      stdout: String(result.stdout ?? ''),
      stderr: String(result.stderr ?? ''),
    }
  }

  if (result.status === 0) {
    return {
      profile,
      checkType,
      command,
      status: 'passed',
      exitCode: 0,
      reason: null,
      stdout: String(result.stdout ?? ''),
      stderr: String(result.stderr ?? ''),
    }
  }

  return {
    profile,
    checkType,
    command,
    status: 'failed',
    exitCode: result.status,
    reason: `helm ${checkType} returned exit code ${result.status}`,
    stdout: String(result.stdout ?? ''),
    stderr: String(result.stderr ?? ''),
  }
}

async function runOfflineChecks(): Promise<Obj25HelmCommandCheck[]> {
  const profiles: Obj25HelmProfile[] = ['local', 'internal', 'prod']
  const checks: Obj25HelmCommandCheck[] = []

  for (const profile of profiles) {
    checks.push(await runHelmCommandCheck(profile, 'lint'))
    checks.push(await runHelmCommandCheck(profile, 'template'))
  }

  return checks
}

function buildOciReadiness(input: {
  chart: Obj25HelmChartMeta
  files: Obj25HelmFileStatus[]
  checks: Obj25HelmCommandCheck[]
}): Obj25HelmOciReadiness {
  const repository =
    process.env.OBJ25_HELM_OCI_REPOSITORY?.trim() ||
    'oci://harbor.internal/dns-management/charts'
  const packageCommand = `helm package ${chartRelativePath} --destination artifacts/charts`
  const pushCommand = `helm push artifacts/charts/${input.chart.name}-${input.chart.version}.tgz ${repository}`

  const reasons: string[] = []
  if (!input.chart.semverValid) {
    reasons.push('Chart version is not semver compatible.')
  }
  if (input.files.some((entry) => entry.required && !entry.present)) {
    reasons.push('Required chart files are missing.')
  }
  if (input.checks.some((entry) => entry.status === 'failed')) {
    reasons.push('At least one offline helm lint/template check failed.')
  }
  const hasSkippedChecks = input.checks.some((entry) => entry.status === 'skipped')
  if (hasSkippedChecks) {
    reasons.push('Helm binary unavailable locally; checks were skipped (verify in CI).')
  }

  return {
    ready: reasons.length === 0,
    repository,
    packageCommand,
    pushCommand,
    reasons,
  }
}

async function checkImageDigestWarning(): Promise<string | null> {
  const profileNames = ['values.yaml', 'values-local.yaml', 'values-internal.yaml', 'values-prod.yaml']
  const warnings: string[] = []

  for (const profileName of profileNames) {
    try {
      const filePath = path.join(chartPath, profileName)
      const content = await fs.readFile(filePath, 'utf8')
      const hasDigestLine = /^\s*digest:\s*["']?sha256:[a-f0-9]{64}/m.test(content)
      const hasEmptyDigest = /^\s*digest:\s*["']?\s*["']?\s*$/m.test(content)
      const hasDigestField = /^\s*digest:/m.test(content)

      if (hasDigestField && (hasEmptyDigest || !hasDigestLine)) {
        warnings.push(profileName)
      }
    } catch {
      continue
    }
  }

  if (warnings.length === 0) {
    return null
  }

  return `Image-Digest ist in ${warnings.join(', ')} leer oder nicht gesetzt. Ohne Digest-Pinning besteht ein Supply-Chain-Risiko: Images koennten zwischen Build und Deploy substituiert werden. Fuer produktive Deployments wird ein fester Digest empfohlen.`
}

export async function loadObj25HelmStatusData(options?: {
  runChecks?: boolean
  releaseName?: string
  namespace?: string
}): Promise<Obj25HelmStatusData> {
  const chartYamlPath = path.join(chartPath, 'Chart.yaml')
  const chartYamlRaw = await fs.readFile(chartYamlPath, 'utf8')
  const parsedChart = parseChartYaml(chartYamlRaw)

  const chart: Obj25HelmChartMeta = {
    name: parsedChart.name,
    description: parsedChart.description,
    version: parsedChart.version,
    appVersion: parsedChart.appVersion,
    semverValid: semverPattern.test(parsedChart.version),
  }

  const files = await collectFileStatuses()
  const runChecks = options?.runChecks !== false
  const checks = runChecks ? await runOfflineChecks() : []
  const release = await runReleaseStatusCheck({
    runChecks,
    releaseName: options?.releaseName?.trim() || defaultReleaseName,
    namespace: options?.namespace?.trim() || defaultNamespace,
  })

  const passedChecks = checks.filter((entry) => entry.status === 'passed').length
  const failedChecks = checks.filter((entry) => entry.status === 'failed').length
  const skippedChecks = checks.filter((entry) => entry.status === 'skipped').length

  const summary = {
    totalChecks: checks.length,
    passedChecks,
    failedChecks,
    skippedChecks,
    offlineLintTemplateReady:
      checks.length > 0 && failedChecks === 0 && skippedChecks === 0 && passedChecks === checks.length,
  }

  const imageDigestWarning = await checkImageDigestWarning()

  return {
    generatedAt: new Date().toISOString(),
    sourceOfTruth: 'git',
    chartPath: chartRelativePath,
    chart,
    files,
    checks,
    summary,
    release,
    oci: buildOciReadiness({ chart, files, checks }),
    imageDigestWarning,
  }
}

export const obj25HelmStatusInternals = {
  parseChartYaml,
  parseHelmReleaseStatusJson,
}
