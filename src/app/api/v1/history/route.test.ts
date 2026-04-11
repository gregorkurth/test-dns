import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { POST as postAuthLogin } from '@/app/api/v1/auth/login/route'
import { POST as postBaselineLoad } from '@/app/api/v1/baseline/load/route'
import { GET as getHistoryDetail } from '@/app/api/v1/history/[id]/route'
import { POST as postHistoryRollback } from '@/app/api/v1/history/[id]/rollback/route'
import { GET as exportHistory } from '@/app/api/v1/history/export/route'
import { GET as getHistory, POST as postHistory } from '@/app/api/v1/history/route'

const execFileAsync = promisify(execFile)

async function runGit(cwd: string, args: string[]) {
  await execFileAsync('git', args, {
    cwd,
    maxBuffer: 5 * 1024 * 1024,
  })
}

async function createTempBaselineRepository(): Promise<string> {
  const repoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obj24-history-repo-'))
  await runGit(repoDir, ['init'])
  await runGit(repoDir, ['config', 'user.email', 'obj24-test@example.local'])
  await runGit(repoDir, ['config', 'user.name', 'OBJ24 History Test'])
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
      'x-forwarded-for': 'vitest-obj24-history',
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

async function createAccessToken(): Promise<string> {
  const response = await postAuthLogin(
    createRequest('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        mode: 'local',
        username: 'operator',
        password: 'operator-demo',
      }),
    }),
  )

  expect(response.status).toBe(200)
  const body = await response.json()
  return String(body.data.accessToken)
}

async function loadBaseline(repoDir: string, accessToken: string): Promise<void> {
  const response = await postBaselineLoad(
    createRequest('/api/v1/baseline/load', {
      method: 'POST',
      headers: authHeaders(accessToken, { 'content-type': 'application/json' }),
      body: JSON.stringify({
        repoUrl: repoDir,
        ref: 'HEAD',
        baselineFile: 'baseline/dns-config.json',
      }),
    }),
  )
  expect(response.status).toBe(200)
}

describe('OBJ-24 history API', () => {
  let storageDir = ''
  let repoDir = ''
  let accessToken = ''
  let previousStorageEnv: string | undefined

  beforeEach(async () => {
    previousStorageEnv = process.env.OBJ24_BASELINE_DIR
    storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obj24-history-storage-'))
    process.env.OBJ24_BASELINE_DIR = storageDir
    repoDir = await createTempBaselineRepository()
    accessToken = await createAccessToken()
    await loadBaseline(repoDir, accessToken)
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

  it('writes history entries and filters by change type', async () => {
    const writeResponse = await postHistory(
      createRequest('/api/v1/history', {
        method: 'POST',
        headers: authHeaders(accessToken, { 'content-type': 'application/json' }),
        body: JSON.stringify({
          actor: 'operator-test',
          summary: 'Participant angepasst',
          after: {
            participants: [{ id: 'p1', name: 'Alpha-Updated' }],
          },
        }),
      }),
    )
    expect(writeResponse.status).toBe(201)

    const listResponse = await getHistory(
      createRequest('/api/v1/history?changeType=manual_update', {
        headers: authHeaders(accessToken),
      }),
    )
    expect(listResponse.status).toBe(200)
    const listBody = await listResponse.json()
    expect(listBody.data.total).toBe(1)
    expect(listBody.data.entries[0].changeType).toBe('manual_update')
  })

  it('loads history detail, rolls back latest entry and exports csv', async () => {
    const writeResponse = await postHistory(
      createRequest('/api/v1/history', {
        method: 'POST',
        headers: authHeaders(accessToken, { 'content-type': 'application/json' }),
        body: JSON.stringify({
          actor: 'operator-rollback',
          summary: 'Teilnehmername geaendert',
          after: {
            participants: [{ id: 'p1', name: 'Alpha-RB' }],
          },
        }),
      }),
    )
    expect(writeResponse.status).toBe(201)
    const writeBody = await writeResponse.json()
    const entryId = String(writeBody.data.id)

    const detailResponse = await getHistoryDetail(
      createRequest(`/api/v1/history/${entryId}`, {
        headers: authHeaders(accessToken),
      }),
      { params: Promise.resolve({ id: entryId }) },
    )
    expect(detailResponse.status).toBe(200)
    const detailBody = await detailResponse.json()
    expect(detailBody.data.id).toBe(entryId)

    const rollbackResponse = await postHistoryRollback(
      createRequest(`/api/v1/history/${entryId}/rollback`, {
        method: 'POST',
        headers: authHeaders(accessToken, { 'content-type': 'application/json' }),
        body: JSON.stringify({
          actor: 'operator-rollback',
        }),
      }),
      { params: Promise.resolve({ id: entryId }) },
    )
    expect(rollbackResponse.status).toBe(200)
    const rollbackBody = await rollbackResponse.json()
    expect(rollbackBody.data.rollbackOf).toBe(entryId)

    const exportResponse = await exportHistory(
      createRequest('/api/v1/history/export?format=csv', {
        headers: authHeaders(accessToken),
      }),
    )
    expect(exportResponse.status).toBe(200)
    expect(exportResponse.headers.get('content-type')).toContain('text/csv')
    const csvBody = await exportResponse.text()
    expect(csvBody).toContain('id,timestamp,actor,changeType')
    expect(csvBody).toContain('rollback')
  })
})
