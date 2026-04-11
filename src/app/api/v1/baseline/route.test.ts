import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { POST as postAuthLogin } from '@/app/api/v1/auth/login/route'
import { GET as getBaselineStatus } from '@/app/api/v1/baseline/route'
import { POST as postBaselineLoad } from '@/app/api/v1/baseline/load/route'

const execFileAsync = promisify(execFile)

async function runGit(cwd: string, args: string[]) {
  await execFileAsync('git', args, {
    cwd,
    maxBuffer: 5 * 1024 * 1024,
  })
}

async function createTempBaselineRepository(): Promise<string> {
  const repoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obj24-api-repo-'))
  await runGit(repoDir, ['init'])
  await runGit(repoDir, ['config', 'user.email', 'obj24-test@example.local'])
  await runGit(repoDir, ['config', 'user.name', 'OBJ24 API Test'])
  await fs.mkdir(path.join(repoDir, 'baseline'), { recursive: true })
  await fs.writeFile(
    path.join(repoDir, 'baseline', 'dns-config.json'),
    `${JSON.stringify({ participants: [{ id: 'p1', name: 'Alpha' }] }, null, 2)}\n`,
    'utf8',
  )
  await runGit(repoDir, ['add', '.'])
  await runGit(repoDir, ['commit', '-m', 'init baseline'])
  return repoDir
}

function createRequest(pathname: string, init?: RequestInit): Request {
  return new Request(`http://localhost${pathname}`, {
    ...init,
    headers: {
      'x-forwarded-for': 'vitest-obj24-baseline',
      ...(init?.headers ?? {}),
    },
  })
}

function authHeaders(accessToken: string, headers?: Record<string, string>) {
  return {
    ...(headers ?? {}),
    authorization: `Bearer ${accessToken}`,
  }
}

async function createAccessToken(
  username: 'viewer' | 'operator' = 'viewer',
): Promise<string> {
  const password = username === 'operator' ? 'operator-demo' : 'viewer-demo'
  const response = await postAuthLogin(
    createRequest('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        mode: 'local',
        username,
        password,
      }),
    }),
  )

  expect(response.status).toBe(200)
  const body = await response.json()
  return String(body.data.accessToken)
}

describe('OBJ-24 baseline API', () => {
  let storageDir = ''
  let repoDir = ''
  let previousStorageEnv: string | undefined

  beforeEach(async () => {
    previousStorageEnv = process.env.OBJ24_BASELINE_DIR
    storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obj24-api-storage-'))
    process.env.OBJ24_BASELINE_DIR = storageDir
    repoDir = await createTempBaselineRepository()
  })

  afterEach(async () => {
    if (previousStorageEnv === undefined) {
      delete process.env.OBJ24_BASELINE_DIR
    } else {
      process.env.OBJ24_BASELINE_DIR = previousStorageEnv
    }

    if (storageDir) {
      await fs.rm(storageDir, { recursive: true, force: true })
    }
    if (repoDir) {
      await fs.rm(repoDir, { recursive: true, force: true })
    }
  })

  it('returns initial status before baseline load', async () => {
    const viewerToken = await createAccessToken('viewer')
    const response = await getBaselineStatus(
      createRequest('/api/v1/baseline', {
        headers: authHeaders(viewerToken),
      }),
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.baseline.status).toBe('never_loaded')
    expect(body.data.initialStateMessage).toBe('Keine Baseline geladen')
  })

  it('loads baseline and returns source commit reference', async () => {
    const operatorToken = await createAccessToken('operator')
    const viewerToken = await createAccessToken('viewer')
    const loadResponse = await postBaselineLoad(
      createRequest('/api/v1/baseline/load', {
        method: 'POST',
        headers: authHeaders(operatorToken, { 'content-type': 'application/json' }),
        body: JSON.stringify({
          repoUrl: repoDir,
          ref: 'HEAD',
          baselineFile: 'baseline/dns-config.json',
        }),
      }),
    )
    expect(loadResponse.status).toBe(200)
    const loadBody = await loadResponse.json()
    expect(loadBody.data.baseline.status).toBe('loaded')
    expect(loadBody.data.baseline.commitSha).toBeTruthy()
    expect(loadBody.data.historyEntry.changeType).toBe('baseline_load')

    const statusResponse = await getBaselineStatus(
      createRequest('/api/v1/baseline', {
        headers: authHeaders(viewerToken),
      }),
    )
    expect(statusResponse.status).toBe(200)
    const statusBody = await statusResponse.json()
    expect(statusBody.data.baseline.status).toBe('loaded')
    expect(statusBody.data.baseline.sourceRef).toContain('HEAD@')
  })
})
