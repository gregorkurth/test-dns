import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const loadTestExecutionDashboardData = vi.fn()

vi.mock('@/lib/test-execution-dashboard', () => ({
  loadTestExecutionDashboardData,
}))

function createRequest(clientId = 'qa-obj23-client'): Request {
  return new Request('http://localhost/api/test-execution-dashboard', {
    headers: {
      'x-forwarded-for': clientId,
    },
  })
}

describe('GET /api/test-execution-dashboard', () => {
  beforeEach(() => {
    loadTestExecutionDashboardData.mockReset()
  })

  afterEach(async () => {
    const { testExecutionDashboardRouteInternals } = await import('./route')
    testExecutionDashboardRouteInternals.resetRateLimitStore()
  })

  it('returns dashboard data for allowed requests', async () => {
    loadTestExecutionDashboardData.mockResolvedValue({
      generatedAt: '2026-04-10T08:00:00.000Z',
      summary: {
        totalTests: 1,
        passed: 1,
        failed: 0,
        neverExecuted: 0,
        manualTests: 1,
        autoTests: 0,
      },
      filters: {
        objects: [],
        capabilities: [],
        serviceFunctions: [],
      },
      tests: [],
      runSnapshots: [],
      releaseSnapshots: [],
      statusRules: [],
      dataSources: [],
    })

    const { GET } = await import('./route')
    const response = await GET(createRequest())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.summary.totalTests).toBe(1)
  })

  it('rate limits repeated requests from the same client', async () => {
    loadTestExecutionDashboardData.mockResolvedValue({
      generatedAt: '2026-04-10T08:00:00.000Z',
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        neverExecuted: 0,
        manualTests: 0,
        autoTests: 0,
      },
      filters: {
        objects: [],
        capabilities: [],
        serviceFunctions: [],
      },
      tests: [],
      runSnapshots: [],
      releaseSnapshots: [],
      statusRules: [],
      dataSources: [],
    })

    const { GET } = await import('./route')

    let limitedResponse: Response | null = null
    for (let index = 0; index < 61; index += 1) {
      const response = await GET(createRequest('qa-obj23-rate-limit'))
      if (response.status === 429) {
        limitedResponse = response
        break
      }
    }

    expect(limitedResponse).not.toBeNull()
    expect(limitedResponse?.status).toBe(429)
    expect(limitedResponse?.headers.get('Retry-After')).toBe('60')
    await expect(limitedResponse?.json()).resolves.toMatchObject({
      error: 'Zu viele Anfragen. Bitte in einer Minute erneut versuchen.',
    })
  })
})
