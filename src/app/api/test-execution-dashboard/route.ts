import { NextResponse } from 'next/server'

import { loadTestExecutionDashboardData } from '@/lib/test-execution-dashboard'

export const dynamic = 'force-dynamic'

export async function GET() {
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
