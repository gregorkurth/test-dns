import path from 'node:path'

import { describe, expect, it } from 'vitest'

import type { TestExecutionRecord } from './test-execution-dashboard'
import {
  resolveLatestRecord,
  testExecutionDashboardInternals,
} from './test-execution-dashboard'

function createRecord(
  overrides: Partial<TestExecutionRecord> = {},
): TestExecutionRecord {
  return {
    testType: 'manual',
    tagId: 'obj-23-sample',
    testId: 'TEST-OBJ-23-SAMPLE',
    status: 'passed',
    executedAt: '2026-04-06T10:00:00.000Z',
    runId: 'RUN-2026-04-06',
    releaseId: 'REL-1.0.0',
    note: null,
    evidencePath: 'tests/results/sample.md',
    source: 'result_markdown',
    ...overrides,
  }
}

describe('test-execution-dashboard data validation', () => {
  it('marks malformed JSON evidence as failed with a validation note', () => {
    const malformedPath = path.join(
      process.cwd(),
      'tests',
      'results',
      'qa-malformed-evidence.json',
    )

    const [record] = testExecutionDashboardInternals.parseJsonEvidence(
      malformedPath,
      '{ invalid json',
    )

    expect(record).toMatchObject({
      status: 'failed',
      executedAt: null,
      source: 'result_json',
    })
    expect(record.note).toContain('Nachweis fehlerhaft')
    expect(record.note).toContain('JSON nicht parsebar')
  })
})

describe('test-execution-dashboard status resolution', () => {
  it('prefers the latest valid timestamp evidence over undated failures', () => {
    const history: TestExecutionRecord[] = [
      createRecord({
        status: 'failed',
        executedAt: null,
        note: 'Nachweis fehlerhaft: zeitlich nicht auswertbar',
      }),
      createRecord({
        status: 'passed',
        executedAt: '2026-04-06T12:00:00.000Z',
      }),
    ]

    const latest = resolveLatestRecord(history)

    expect(latest).not.toBeNull()
    expect(latest?.status).toBe('passed')
    expect(latest?.executedAt).toBe('2026-04-06T12:00:00.000Z')
  })
})
