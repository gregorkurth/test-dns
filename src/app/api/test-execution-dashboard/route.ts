import { NextResponse } from 'next/server'

import { loadTestExecutionDashboardData } from '@/lib/test-execution-dashboard'

export const dynamic = 'force-dynamic'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 60

const rateLimitStore = new Map<string, { windowStart: number; count: number }>()

function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) {
      return first
    }
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) {
    return realIp
  }

  return 'unknown-client'
}

function isRateLimited(clientId: string): boolean {
  const now = Date.now()
  const existing = rateLimitStore.get(clientId)

  if (!existing || now - existing.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(clientId, { windowStart: now, count: 1 })
    return false
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  existing.count += 1
  rateLimitStore.set(clientId, existing)
  return false
}

function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [clientId, bucket] of rateLimitStore) {
    if (now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitStore.delete(clientId)
    }
  }
}

export async function GET(request: Request) {
  cleanupRateLimitStore()

  const clientId = getClientId(request)
  if (isRateLimited(clientId)) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte in einer Minute erneut versuchen.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
        },
      },
    )
  }

  try {
    const data = await loadTestExecutionDashboardData()
    return NextResponse.json(data)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Test-Execution-Dashboard konnte nicht geladen werden.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
