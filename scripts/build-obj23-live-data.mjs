import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const sourcePath = path.join(repoRoot, 'src', 'lib', 'test-execution-dashboard.ts')
const outputPath = path.join(
  repoRoot,
  'test-execution-dashboard-live',
  'data',
  'test-execution-dashboard.json',
)

async function loadDashboardDataFromTypeScript() {
  const source = await fs.readFile(sourcePath, 'utf8')
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText

  const tempFile = path.join(
    os.tmpdir(),
    `obj23-loader-${Date.now()}-${Math.random().toString(16).slice(2)}.cjs`,
  )
  await fs.writeFile(tempFile, transpiled, 'utf8')

  const previousCwd = process.cwd()
  process.chdir(repoRoot)

  try {
    const loadedModule = require(tempFile)
    const fn = loadedModule.loadTestExecutionDashboardData
    if (typeof fn !== 'function') {
      throw new Error(
        'loadTestExecutionDashboardData was not found after transpiling src/lib/test-execution-dashboard.ts',
      )
    }
    return await fn()
  } finally {
    process.chdir(previousCwd)
    await fs.unlink(tempFile).catch(() => {})
  }
}

async function buildObj23LiveData() {
  const data = await loadDashboardDataFromTypeScript()
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')

  console.log(
    `OBJ-23 data generated: ${outputPath.replace(repoRoot + path.sep, '')}`,
  )
  console.log(
    `Tests: ${data.summary.totalTests}, Passed: ${data.summary.passed}, Failed: ${data.summary.failed}, Never: ${data.summary.neverExecuted}`,
  )
}

buildObj23LiveData().catch((error) => {
  console.error('Failed to build OBJ-23 live dashboard data.')
  console.error(error)
  process.exitCode = 1
})
