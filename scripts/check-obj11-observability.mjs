#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    ...options,
  })

  if (result.status !== 0) {
    const output = (result.stderr || result.stdout || '').trim()
    throw new Error(
      `${command} ${args.join(' ')} failed${output ? `:\n${output}` : ''}`,
    )
  }

  return result.stdout ?? ''
}

function validateRenderedManifest(manifest) {
  const requiredKinds = [
    'kind: Namespace',
    'kind: Deployment',
    'kind: StatefulSet',
    'kind: Service',
    'name: otel-collector',
    'name: clickhouse',
    'name: grafana',
  ]

  for (const marker of requiredKinds) {
    if (!manifest.includes(marker)) {
      throw new Error(`Rendered manifest is missing required marker: ${marker}`)
    }
  }
}

function validateClusterlessDryRun(manifest) {
  const result = spawnSync(
    'kubectl',
    ['apply', '--dry-run=client', '--validate=false', '-f', '-'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      input: manifest,
    },
  )

  if (result.status === 0) {
    return 'passed'
  }

  const output = (result.stderr || result.stdout || '').trim()
  if (/localhost:8080|connection refused|connect: operation not permitted/i.test(output)) {
    return 'skipped (no reachable cluster for client dry-run)'
  }

  throw new Error(`Clusterless dry-run failed${output ? `:\n${output}` : ''}`)
}

function main() {
  const renderedManifest = run('kubectl', [
    'kustomize',
    '--load-restrictor=LoadRestrictionsNone',
    'k8s/observability',
  ])
  validateRenderedManifest(renderedManifest)
  const dryRunResult = validateClusterlessDryRun(renderedManifest)

  const smokeOutput = run('node', ['scripts/smoke-obj11-observability.mjs']).trim()
  let smokeSummary = smokeOutput
  try {
    const parsed = JSON.parse(smokeOutput)
    smokeSummary = `collectorPayloads=${parsed.collectorPayloads}, requests=${JSON.stringify(parsed.requests)}`
  } catch {
    // Keep raw smoke output if JSON parsing fails.
  }

  console.log('OBJ-11 verification passed')
  console.log(`- observability overlay render: ok (${dryRunResult})`)
  console.log(`- smoke test: ok (${smokeSummary})`)
}

try {
  main()
} catch (error) {
  console.error('OBJ-11 verification failed')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
