import { describe, expect, it } from 'vitest'

import type { TestExecutionEntry } from '@/lib/test-execution-dashboard'

import { filterTestExecutionEntries } from './test-execution-dashboard-client'

function createEntry(
  overrides: Partial<TestExecutionEntry>,
): TestExecutionEntry {
  return {
    key: 'manual:test-1',
    testId: 'TEST-1',
    tagId: 'obj-23-test-1',
    objIds: ['OBJ-23'],
    requirementId: 'RDTS-610',
    capabilityId: 'CAP-006',
    capabilityName: 'Documentation & Quality',
    serviceFunctionId: 'SFN-DOC-004',
    serviceFunctionName: 'Testing Concept',
    testType: 'manual',
    sourcePath: 'capabilities/.../tests/manual/TEST-1.md',
    status: 'failed',
    lastExecutedAt: '2026-04-06T10:00:00.000Z',
    lastRunId: 'RUN-2026-04-06',
    lastReleaseId: 'REL-1.0.0',
    lastNote: null,
    lastEvidencePath: 'tests/results/TEST-1.md',
    latestEvidenceIssue: null,
    evidenceIssueCount: 0,
    history: [],
    ...overrides,
  }
}

describe('filterTestExecutionEntries', () => {
  it('applies combined object/status/query filters for critical triage views', () => {
    const entries: TestExecutionEntry[] = [
      createEntry({
        key: 'manual:test-critical',
        testId: 'TEST-CRITICAL',
        requirementId: 'RDTS-610',
        status: 'failed',
        objIds: ['OBJ-23'],
      }),
      createEntry({
        key: 'auto:test-ok',
        testId: 'TEST-OK',
        requirementId: 'SREQ-234',
        status: 'passed',
        testType: 'auto',
        objIds: ['OBJ-4'],
        capabilityId: 'CAP-001',
        capabilityName: 'Domain Naming',
        serviceFunctionId: 'SFN-TIN26',
        serviceFunctionName: 'DNS Query',
      }),
      createEntry({
        key: 'manual:test-never',
        testId: 'TEST-NEVER',
        requirementId: null,
        status: 'never_executed',
        objIds: ['OBJ-23', 'OBJ-4'],
      }),
    ]

    const filtered = filterTestExecutionEntries(entries, {
      objectFilter: 'OBJ-23',
      capabilityFilter: 'ALL',
      serviceFunctionFilter: 'ALL',
      testTypeFilter: 'ALL',
      statusFilter: 'failed',
      requirementFilter: 'rdts-610',
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0]).toMatchObject({
      key: 'manual:test-critical',
      status: 'failed',
      requirementId: 'RDTS-610',
    })
  })
})
