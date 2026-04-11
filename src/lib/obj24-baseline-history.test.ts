import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  appendObj24HistoryChange,
  exportObj24History,
  getObj24BaselineStatusView,
  getObj24HistoryEntries,
  loadObj24BaselineFromRepository,
  Obj24DomainError,
  rollbackObj24HistoryEntry,
} from '@/lib/obj24-baseline-history'

const execFileAsync = promisify(execFile)

async function runGit(cwd: string, args: string[]) {
  await execFileAsync('git', args, {
    cwd,
    maxBuffer: 5 * 1024 * 1024,
  })
}

async function createTempBaselineRepository(): Promise<string> {
  const repoDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obj24-repo-'))
  await runGit(repoDir, ['init'])
  await runGit(repoDir, ['config', 'user.email', 'obj24-test@example.local'])
  await runGit(repoDir, ['config', 'user.name', 'OBJ24 Test'])
  await fs.mkdir(path.join(repoDir, 'baseline'), { recursive: true })
  await fs.writeFile(
    path.join(repoDir, 'baseline', 'dns-config.json'),
    `${JSON.stringify(
      {
        participants: [
          {
            id: 'participant-alpha',
            name: 'Alpha',
            zone: 'core.ndp.che',
          },
        ],
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  await runGit(repoDir, ['add', '.'])
  await runGit(repoDir, ['commit', '-m', 'baseline init'])
  return repoDir
}

describe('OBJ-24 baseline & history', () => {
  let storageDir = ''
  let repoDir = ''
  let previousStorageEnv: string | undefined

  beforeEach(async () => {
    previousStorageEnv = process.env.OBJ24_BASELINE_DIR
    storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'obj24-storage-'))
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

  it('starts in initial state and loads baseline with source ref', async () => {
    const initial = await getObj24BaselineStatusView()
    expect(initial.initialStateMessage).toBe('Keine Baseline geladen')
    expect(initial.baseline.status).toBe('never_loaded')

    const result = await loadObj24BaselineFromRepository({
      repoUrl: repoDir,
      ref: 'HEAD',
      baselineFile: 'baseline/dns-config.json',
      actor: 'qa-user',
    })

    expect(result.baseline.status).toBe('loaded')
    expect(result.baseline.ref).toBe('HEAD')
    expect(result.baseline.commitSha).toBeTruthy()
    expect(result.historyEntry.changeType).toBe('baseline_load')
    expect(result.historyEntry.actor).toBe('qa-user')
  })

  it('writes manual changes append-only and supports rollback of latest entry', async () => {
    await loadObj24BaselineFromRepository({
      repoUrl: repoDir,
      ref: 'HEAD',
      baselineFile: 'baseline/dns-config.json',
    })

    const updateEntry = await appendObj24HistoryChange({
      actor: 'operator-a',
      summary: 'Participant note angepasst',
      after: {
        participants: [
          {
            id: 'participant-alpha',
            name: 'Alpha',
            zone: 'core.ndp.che',
            notes: 'updated',
          },
        ],
      },
    })

    expect(updateEntry.changeType).toBe('manual_update')
    const entriesBeforeRollback = await getObj24HistoryEntries({ limit: 10 })
    expect(entriesBeforeRollback.length).toBe(2)

    const rollback = await rollbackObj24HistoryEntry(updateEntry.id, {
      actor: 'operator-a',
      summary: 'Rollback Test',
    })
    expect(rollback.changeType).toBe('rollback')
    expect(rollback.rollbackOf).toBe(updateEntry.id)

    const entriesAfterRollback = await getObj24HistoryEntries({ limit: 10 })
    expect(entriesAfterRollback[0].changeType).toBe('rollback')
    expect(entriesAfterRollback).toHaveLength(3)
  })

  it('returns rollback conflict when non-latest entry is requested', async () => {
    const loaded = await loadObj24BaselineFromRepository({
      repoUrl: repoDir,
      ref: 'HEAD',
      baselineFile: 'baseline/dns-config.json',
    })

    await appendObj24HistoryChange({
      summary: 'Aenderung 1',
      after: {
        participants: [{ id: 'participant-alpha', name: 'Alpha 1' }],
      },
    })

    await expect(
      rollbackObj24HistoryEntry(loaded.historyEntry.id, {}),
    ).rejects.toMatchObject({
      code: 'ROLLBACK_CONFLICT',
    } satisfies Partial<Obj24DomainError>)
  })

  it('exports history as csv with mandatory columns', async () => {
    await loadObj24BaselineFromRepository({
      repoUrl: repoDir,
      ref: 'HEAD',
      baselineFile: 'baseline/dns-config.json',
    })

    const exported = await exportObj24History({ format: 'csv' })
    expect(exported.fileName.endsWith('.csv')).toBe(true)
    expect(exported.payload).toContain('id,timestamp,actor,changeType')
    expect(exported.payload).toContain('baseline_load')
  })
})
