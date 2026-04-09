import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const renderTargets = [
  {
    name: 'kustomize base',
    command: 'kubectl',
    args: ['kustomize', 'k8s/base'],
    allowLocalTag: false,
  },
  {
    name: 'kustomize local',
    command: 'kubectl',
    args: ['kustomize', 'k8s/overlays/local'],
    allowLocalTag: true,
  },
  {
    name: 'kustomize internal',
    command: 'kubectl',
    args: ['kustomize', 'k8s/overlays/internal'],
    allowLocalTag: false,
  },
]

function commandExists(command) {
  const result = spawnSync('bash', ['-lc', `command -v ${command}`], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  return result.status === 0
}

function runCommand(command, args, input) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    input,
  })

  if (result.status !== 0) {
    const errorOutput = (result.stderr || result.stdout || '').trim()
    throw new Error(
      `${command} ${args.join(' ')} failed${errorOutput ? `:\n${errorOutput}` : ''}`,
    )
  }

  return result.stdout
}

function validateRenderedManifest(name, manifest, allowLocalTag) {
  if (/image:\s+.*:latest\b/.test(manifest)) {
    throw new Error(`${name}: mutable :latest reference found in rendered manifest`)
  }

  const imageLines = manifest
    .split(/\r?\n/)
    .filter((line) => /^\s*image:\s+/.test(line))
    .map((line) => line.replace(/^\s*image:\s+/, '').trim())

  if (imageLines.length === 0) {
    throw new Error(`${name}: no container image references found`)
  }

  if (!allowLocalTag) {
    const digestImages = imageLines.filter((ref) => ref.includes('@sha256:'))
    if (digestImages.length === 0) {
      throw new Error(`${name}: expected at least one digest-pinned image reference`)
    }
  }

  if (!/authentication:\s*\n\s+mode:\s+required/m.test(manifest)) {
    throw new Error(`${name}: mTLS authentication block not found`)
  }
}

function validateClusterlessDryRun(name, manifest) {
  const result = spawnSync(
    'kubectl',
    ['apply', '--dry-run=client', '--validate=false', '-f', '-'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      input: manifest,
    },
  )

  if (result.status !== 0) {
    const errorOutput = (result.stderr || result.stdout || '').trim()
    if (
      /localhost:8080|connection refused|connect: operation not permitted/i.test(
        errorOutput,
      )
    ) {
      return 'skipped (no reachable cluster for client dry-run)'
    }
    throw new Error(
      `${name}: clusterless dry-run failed${errorOutput ? `:\n${errorOutput}` : ''}`,
    )
  }

  return 'passed'
}

function maybeValidateOciArtifact() {
  const imageRef = process.env.OCI_IMAGE_REF?.trim()
  if (!imageRef) {
    return 'skipped (OCI_IMAGE_REF not set)'
  }

  const inspector = commandExists('crane')
    ? ['crane', ['manifest', imageRef]]
    : commandExists('skopeo')
      ? ['skopeo', ['inspect', `docker://${imageRef}`]]
      : null

  if (!inspector) {
    return 'skipped (crane or skopeo not installed)'
  }

  const [command, args] = inspector
  const output = runCommand(command, args)

  if (
    !output.includes('application/vnd.oci.image.manifest.v1+json') &&
    !output.includes('application/vnd.oci.image.index.v1+json')
  ) {
    throw new Error(
      `OCI artifact check failed for ${imageRef}: OCI media type not found in inspector output`,
    )
  }

  return `passed (${command} ${args.join(' ')})`
}

function main() {
  if (!commandExists('kubectl')) {
    throw new Error('kubectl is required for OBJ-10 checks')
  }

  const summaries = []

  for (const target of renderTargets) {
    const manifest = runCommand(target.command, target.args)
    validateRenderedManifest(target.name, manifest, target.allowLocalTag)
    const dryRunResult = validateClusterlessDryRun(target.name, manifest)
    summaries.push(`${target.name}: ok (${dryRunResult})`)
  }

  const ociArtifactResult = maybeValidateOciArtifact()
  summaries.push(`artifact OCI check: ${ociArtifactResult}`)

  console.log('OBJ-10 verification passed')
  for (const summary of summaries) {
    console.log(`- ${summary}`)
  }
}

try {
  main()
} catch (error) {
  console.error('OBJ-10 verification failed')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
